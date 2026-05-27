import { supabaseAdmin } from "./supabase";
import type { MailType } from "@/types";

/**
 * 2つの日時の差を日数で返す（date2 - date1）
 * 切り捨ての整数値を返す
 */
export function daysBetween(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === "string" ? new Date(date1) : date1;
  const d2 = typeof date2 === "string" ? new Date(date2) : date2;
  const diffMs = d2.getTime() - d1.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * targetDate までの残り分数を返す（targetDate - fromDate）
 * マイナス値は「すでに過ぎている」を意味する
 */
export function minutesUntil(
  targetDate: Date | string,
  fromDate: Date | string = new Date()
): number {
  const target = typeof targetDate === "string" ? new Date(targetDate) : targetDate;
  const from = typeof fromDate === "string" ? new Date(fromDate) : fromDate;
  const diffMs = target.getTime() - from.getTime();
  return Math.floor(diffMs / (1000 * 60));
}

/**
 * 該当のメールがすでに送信済みか確認する（email_logs を参照）
 */
export async function isAlreadySent(
  bookingId: string,
  mailType: MailType
): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from("email_logs")
    .select("id")
    .eq("booking_id", bookingId)
    .eq("mail_type", mailType)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[isAlreadySent] error:", error);
    // 失敗時は安全側に倒して「送信済み」として扱う（=送らない）
    return true;
  }
  return data !== null;
}

/**
 * メール送信ログを email_logs に記録する
 */
export async function logMailSent(
  bookingId: string,
  mailType: MailType
): Promise<void> {
  const { error } = await supabaseAdmin.from("email_logs").insert({
    booking_id: bookingId,
    mail_type: mailType,
  });
  if (error) {
    console.error("[logMailSent] error:", error);
    throw error;
  }
}
