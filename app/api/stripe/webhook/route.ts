import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { sendMail, confirmPaidMail, receiptMail } from "@/lib/resend";
import { resolveReceiptIssuerName } from "@/lib/receipt";
import { isAlreadySent, logMailSent } from "@/lib/utils";
import type { Booking, Event, Lecturer } from "@/types";

// 重要：Stripe Webhook は raw body が必要
// App Router ではデフォルトで raw body が取得可能だが、明示的に動的に
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error("[stripe/webhook] signature verify failed:", err.message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err.message}` },
      { status: 400 }
    );
  }

  // 対象イベント：checkout.session.completed
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.booking_id;

    if (!bookingId) {
      console.warn("[stripe/webhook] no booking_id in metadata");
      return NextResponse.json({ received: true });
    }

    try {
      // 1. payment_status を 'paid' に更新 + 領収書発行日時を記録
      const paidAt = new Date().toISOString();
      const { data: booking, error: updateError } = await supabaseAdmin
        .from("bookings")
        .update({
          payment_status: "paid",
          receipt_issued_at: paidAt,
        })
        .eq("id", bookingId)
        .select("*")
        .single<Booking>();

      if (updateError || !booking) {
        console.error("[stripe/webhook] booking update failed:", updateError);
        return NextResponse.json({ error: "booking update failed" }, { status: 500 });
      }

      // 2. イベント情報取得
      const { data: eventRow, error: eventError } = await supabaseAdmin
        .from("events")
        .select("*")
        .eq("id", booking.event_id)
        .single<Event>();

      if (eventError || !eventRow) {
        console.error("[stripe/webhook] event fetch failed:", eventError);
        return NextResponse.json({ received: true });
      }

      let sessionStartsAt = eventRow.event_date;
      if (booking.session_id) {
        const { data: sessionRow } = await supabaseAdmin
          .from("event_sessions")
          .select("starts_at")
          .eq("id", booking.session_id)
          .maybeSingle<{ starts_at: string }>();
        if (sessionRow?.starts_at) {
          sessionStartsAt = sessionRow.starts_at;
        }
      }

      let lecturer: Lecturer | null = null;
      if (eventRow.lecturer_id) {
        const { data } = await supabaseAdmin
          .from("lecturers")
          .select("*")
          .eq("id", eventRow.lecturer_id)
          .maybeSingle<Lecturer>();
        lecturer = data ?? null;
      }

      const issuerName = resolveReceiptIssuerName(eventRow, lecturer);

      // 3. 顧客の累計購入金額・参加回数を更新
      if (booking.customer_id) {
        try {
          const { data: customer } = await supabaseAdmin
            .from("customers")
            .select("total_spent, total_events")
            .eq("id", booking.customer_id)
            .single<{ total_spent: number; total_events: number }>();

          await supabaseAdmin
            .from("customers")
            .update({
              total_spent: (customer?.total_spent ?? 0) + eventRow.price,
              total_events: (customer?.total_events ?? 0) + 1,
              last_purchase_at: new Date().toISOString(),
            })
            .eq("id", booking.customer_id);
        } catch (customerErr) {
          console.error("[stripe/webhook] customer update error:", customerErr);
          // 顧客集計エラーはメール送信を止めない
        }
      }

      // 4. confirmPaidMail 送信（二重送信防止）
      const already = await isAlreadySent(booking.id, "confirm_paid");
      if (!already) {
        const mail = confirmPaidMail(
          booking.name,
          eventRow.title,
          sessionStartsAt,
          eventRow.location_text ?? undefined
        );
        await sendMail({
          to: booking.email,
          subject: mail.subject,
          html: mail.html,
        });
        await logMailSent(booking.id, "confirm_paid");
      }

      // 5. 領収書メール送信（二重送信防止）
      const receiptAlready = await isAlreadySent(booking.id, "receipt");
      if (!receiptAlready) {
        const receiptName = booking.receipt_name?.trim() || booking.name;
        const receipt = receiptMail({
          receiptName,
          eventTitle: eventRow.title,
          price: eventRow.price,
          paidAt,
          bookingId: booking.id,
          issuerName,
        });
        await sendMail({
          to: booking.email,
          subject: receipt.subject,
          html: receipt.html,
        });
        await logMailSent(booking.id, "receipt");
      }
    } catch (err) {
      console.error("[stripe/webhook] processing error:", err);
      return NextResponse.json({ error: "processing failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
