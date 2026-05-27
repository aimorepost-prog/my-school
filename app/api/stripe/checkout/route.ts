import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createCheckoutSession } from "@/lib/stripe";
import type { Event, Booking } from "@/types";

export const dynamic = "force-dynamic";

/**
 * 既存予約に対して Stripe Checkout を再発行するエンドポイント
 * （督促メールのお支払いリンクから再決済する場合などに使用）
 *
 * POST { bookingId: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { bookingId } = (await req.json()) as { bookingId: string };
    if (!bookingId) {
      return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
    }

    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .maybeSingle<Booking>();

    if (bookingError || !booking) {
      return NextResponse.json({ error: "予約が見つかりません" }, { status: 404 });
    }

    if (booking.payment_status === "paid") {
      return NextResponse.json({ error: "すでにお支払い済みです" }, { status: 400 });
    }

    const { data: event, error: eventError } = await supabaseAdmin
      .from("events")
      .select("*")
      .eq("id", booking.event_id)
      .maybeSingle<Event>();

    if (eventError || !event) {
      return NextResponse.json({ error: "イベントが見つかりません" }, { status: 404 });
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL || `https://${req.headers.get("host")}`;

    const { url, sessionId } = await createCheckoutSession({
      eventId: event.id,
      bookingId: booking.id,
      price: event.price,
      eventTitle: event.title,
      customerEmail: booking.email,
      successUrl: `${baseUrl}/${event.slug}/thanks?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${baseUrl}/${event.slug}/register?canceled=1`,
    });

    await supabaseAdmin
      .from("bookings")
      .update({ stripe_session_id: sessionId })
      .eq("id", booking.id);

    return NextResponse.json({ url });
  } catch (err: any) {
    console.error("[stripe/checkout] error:", err);
    return NextResponse.json(
      { error: err.message || "予期せぬエラーが発生しました" },
      { status: 500 }
    );
  }
}
