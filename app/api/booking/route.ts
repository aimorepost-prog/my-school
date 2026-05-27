import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createCheckoutSession } from "@/lib/stripe";
import { sendMail, confirmPendingMail } from "@/lib/resend";
import { logMailSent } from "@/lib/utils";
import {
  resolveReceiptName,
  validateBookingAnswers,
} from "@/lib/registration";
import { resolveEventPrice } from "@/lib/event-pricing";
import {
  isSessionRegistrationOpen,
  formatSessionRange,
} from "@/lib/event-sessions";
import type { Event, EventSession } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      eventSlug,
      sessionId,
      name,
      email,
      phone,
      receiptName,
      referrer,
      answers,
      priceTier,
    } = body as {
      eventSlug: string;
      sessionId?: string | null;
      name: string;
      email: string;
      phone?: string | null;
      receiptName?: string | null;
      referrer?: string | null;
      answers?: unknown;
      priceTier?: string | null;
    };

    if (!eventSlug || !name || !email) {
      return NextResponse.json(
        { error: "必須項目が不足しています" },
        { status: 400 }
      );
    }

    const answersResult = validateBookingAnswers(answers);
    if (!answersResult.ok) {
      return NextResponse.json({ error: answersResult.error }, { status: 400 });
    }

    const finalReceiptName =
      typeof receiptName === "string" && receiptName.trim()
        ? receiptName.trim()
        : resolveReceiptName(name, receiptName);

    // 1. イベント取得
    const { data: event, error: eventError } = await supabaseAdmin
      .from("events")
      .select("*")
      .eq("slug", eventSlug)
      .eq("is_published", true)
      .maybeSingle<Event>();

    if (eventError || !event) {
      return NextResponse.json(
        { error: "イベントが見つかりません" },
        { status: 404 }
      );
    }

    const { data: publishedSessions } = await supabaseAdmin
      .from("event_sessions")
      .select("*")
      .eq("event_id", event.id)
      .eq("is_published", true)
      .returns<EventSession[]>();

    const sessions = publishedSessions ?? [];
    let selectedSession: EventSession | null = null;

    if (sessions.length > 0) {
      if (!sessionId) {
        return NextResponse.json(
          { error: "開催日程を選択してください" },
          { status: 400 }
        );
      }

      selectedSession =
        sessions.find((s) => s.id === sessionId) ?? null;

      if (
        !selectedSession ||
        !isSessionRegistrationOpen(selectedSession.starts_at)
      ) {
        return NextResponse.json(
          { error: "選択された日程は受付終了しています" },
          { status: 400 }
        );
      }
    }

    const priceResult = resolveEventPrice(
      event.slug,
      event.price,
      priceTier ?? null
    );
    if (!priceResult.ok) {
      return NextResponse.json({ error: priceResult.error }, { status: 400 });
    }

    const checkoutPrice = priceResult.price;
    const bookingAnswers = {
      ...answersResult.data,
      ...(priceResult.tierId
        ? {
            price_tier: priceResult.tierId,
            selected_price: checkoutPrice,
            price_tier_label: priceResult.tierLabel,
          }
        : {}),
    };

    // 2-a. customer を upsert
    const { data: customer, error: customerError } = await supabaseAdmin
      .from("customers")
      .upsert(
        {
          email,
          name,
          phone: phone ?? null,
        },
        { onConflict: "email" }
      )
      .select("*")
      .single();

    if (customerError || !customer) {
      console.error("[booking] customer upsert error:", customerError);
    }

    // 2-b. 予約レコードを INSERT
    const { data: booking, error: insertError } = await supabaseAdmin
      .from("bookings")
      .insert({
        event_id: event.id,
        session_id: selectedSession?.id ?? null,
        customer_id: customer?.id ?? null,
        name,
        email,
        phone: phone ?? null,
        receipt_name: finalReceiptName,
        referrer: referrer?.trim() || null,
        answers: bookingAnswers,
        payment_status: "pending",
      })
      .select("*")
      .single();

    if (insertError || !booking) {
      console.error("[booking] insert error:", insertError);
      return NextResponse.json(
        { error: "予約の登録に失敗しました" },
        { status: 500 }
      );
    }

    // 3. Stripe Checkout セッション作成
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || `https://${req.headers.get("host")}`;

    const sessionLabel = selectedSession
      ? formatSessionRange(
          selectedSession.starts_at,
          selectedSession.ends_at
        )
      : null;
    const checkoutTitle = [
      priceResult.tierLabel
        ? `${event.title}（${priceResult.tierLabel}）`
        : event.title,
      sessionLabel ? `／ ${sessionLabel}` : null,
    ]
      .filter(Boolean)
      .join("");

    const { url: checkoutUrl, sessionId: stripeSessionId } =
      await createCheckoutSession({
      eventId: event.id,
      bookingId: booking.id,
      price: checkoutPrice,
      eventTitle: checkoutTitle,
      customerEmail: email,
      successUrl: `${baseUrl}/${eventSlug}/thanks?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/${eventSlug}/register?canceled=1${
        selectedSession ? `&session=${selectedSession.id}` : ""
      }`,
    });

    // 4. session_id を保存
    await supabaseAdmin
      .from("bookings")
      .update({ stripe_session_id: stripeSessionId })
      .eq("id", booking.id);

    // 5. 仮予約メール送信 + ログ
    try {
      const mail = confirmPendingMail(
        name,
        checkoutTitle,
        checkoutPrice,
        checkoutUrl
      );
      await sendMail({ to: email, subject: mail.subject, html: mail.html });
      await logMailSent(booking.id, "confirm_pending");
    } catch (mailErr) {
      console.error("[booking] mail send error:", mailErr);
    }

    return NextResponse.json({ checkoutUrl, bookingId: booking.id });
  } catch (err) {
    console.error("[booking] error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "予期せぬエラーが発生しました",
      },
      { status: 500 }
    );
  }
}
