import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import {
  sendMail,
  dunningMail,
  reminderMail,
} from "@/lib/resend";
import {
  daysBetween,
  minutesUntil,
  isAlreadySent,
  logMailSent,
} from "@/lib/utils";
import type { Booking, Event, EmailSettings, MailType } from "@/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

// この cron が「現在時刻 ±30分」のリマインダーを送る判定に使う閾値（分）
const REMINDER_WINDOW_MINUTES = 30;

interface BookingWithEvent extends Booking {
  events: Event;
}

export async function GET(req: NextRequest) {
  // Vercel Cron は Authorization: Bearer {CRON_SECRET} を自動付与
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  const results = {
    dunning_sent: 0,
    reminder_sent: 0,
    skipped: 0,
    errors: [] as string[],
  };

  // ============================================================
  // ＜督促メール処理＞
  // ============================================================
  try {
    const { data: pendingBookings, error: pErr } = await supabaseAdmin
      .from("bookings")
      .select("*, events(*)")
      .eq("payment_status", "pending");

    if (pErr) {
      results.errors.push(`pending fetch: ${pErr.message}`);
    } else if (pendingBookings) {
      for (const b of pendingBookings as BookingWithEvent[]) {
        try {
          const setting = await getEmailSettings(b.event_id);
          if (!setting || !setting.dunning_enabled) {
            results.skipped++;
            continue;
          }

          // 申込からの経過日数
          const elapsedDays = daysBetween(b.created_at, now);

          // 1回目督促判定
          if (elapsedDays === setting.dunning_1st_days) {
            const already = await isAlreadySent(b.id, "dunning_1");
            if (!already) {
              await sendDunning(b, baseUrl, 1, "dunning_1");
              results.dunning_sent++;
            }
          }
          // 2回目督促判定
          if (elapsedDays === setting.dunning_2nd_days) {
            const already = await isAlreadySent(b.id, "dunning_2");
            if (!already) {
              await sendDunning(b, baseUrl, 2, "dunning_2");
              results.dunning_sent++;
            }
          }
        } catch (e: any) {
          results.errors.push(`dunning ${b.id}: ${e.message}`);
        }
      }
    }
  } catch (e: any) {
    results.errors.push(`dunning block: ${e.message}`);
  }

  // ============================================================
  // ＜直前リマインダー処理＞
  // ============================================================
  try {
    const { data: paidBookings, error: paErr } = await supabaseAdmin
      .from("bookings")
      .select("*, events(*)")
      .eq("payment_status", "paid");

    if (paErr) {
      results.errors.push(`paid fetch: ${paErr.message}`);
    } else if (paidBookings) {
      for (const b of paidBookings as BookingWithEvent[]) {
        try {
          const setting = await getEmailSettings(b.event_id);
          if (!setting) {
            results.skipped++;
            continue;
          }

          // イベント開始までの残り分数
          const eventDate = await resolveBookingEventDate(b);
          const remaining = minutesUntil(eventDate, now);

          // reminder_1
          if (
            setting.reminder_1_enabled &&
            setting.reminder_1_timing !== null
          ) {
            const diff = Math.abs(remaining - setting.reminder_1_timing);
            if (diff <= REMINDER_WINDOW_MINUTES) {
              const already = await isAlreadySent(b.id, "reminder_1");
              if (!already) {
                await sendReminder(b, setting.reminder_1_timing, "reminder_1");
                results.reminder_sent++;
              }
            }
          }

          // reminder_2
          if (
            setting.reminder_2_enabled &&
            setting.reminder_2_timing !== null
          ) {
            const diff = Math.abs(remaining - setting.reminder_2_timing);
            if (diff <= REMINDER_WINDOW_MINUTES) {
              const already = await isAlreadySent(b.id, "reminder_2");
              if (!already) {
                await sendReminder(b, setting.reminder_2_timing, "reminder_2");
                results.reminder_sent++;
              }
            }
          }
        } catch (e: any) {
          results.errors.push(`reminder ${b.id}: ${e.message}`);
        }
      }
    }
  } catch (e: any) {
    results.errors.push(`reminder block: ${e.message}`);
  }

  return NextResponse.json({ ok: true, ...results, executedAt: now.toISOString() });
}

// ============================================================
// ヘルパー
// ============================================================

async function getEmailSettings(eventId: string): Promise<EmailSettings | null> {
  const { data, error } = await supabaseAdmin
    .from("email_settings")
    .select("*")
    .eq("event_id", eventId)
    .maybeSingle<EmailSettings>();
  if (error) {
    console.error("[cron/mail] getEmailSettings error:", error);
    return null;
  }
  return data;
}

async function sendDunning(
  b: BookingWithEvent,
  baseUrl: string,
  attempt: 1 | 2,
  mailType: MailType
) {
  // 既存の Checkout URL があれば再利用、なければ register ページへ
  const paymentUrl = `${baseUrl}/${b.events.slug}/register`;
  const mail = dunningMail(b.name, b.events.title, paymentUrl, attempt);
  await sendMail({ to: b.email, subject: mail.subject, html: mail.html });
  await logMailSent(b.id, mailType);
}

async function sendReminder(
  b: BookingWithEvent,
  minutesBefore: number,
  mailType: MailType
) {
  const eventDate = await resolveBookingEventDate(b);
  const mail = reminderMail(b.name, b.events.title, eventDate, minutesBefore);
  await sendMail({ to: b.email, subject: mail.subject, html: mail.html });
  await logMailSent(b.id, mailType);
}

async function resolveBookingEventDate(b: BookingWithEvent): Promise<string> {
  if (b.session_id) {
    const { data } = await supabaseAdmin
      .from("event_sessions")
      .select("starts_at")
      .eq("id", b.session_id)
      .maybeSingle<{ starts_at: string }>();
    if (data?.starts_at) return data.starts_at;
  }
  return b.events.event_date;
}
