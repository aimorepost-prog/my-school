import type { Event, Lecturer } from "@/types";

const DEFAULT_ISSUER =
  process.env.RECEIPT_ISSUER_NAME || "思考の学校";

/**
 * 領収書の発行元名を決定する
 * 優先順位: 講座設定 > 講師設定 > 環境変数 > デフォルト
 */
export function resolveReceiptIssuerName(
  event: Pick<Event, "receipt_issuer_name">,
  lecturer?: Pick<Lecturer, "receipt_issuer_name"> | null
): string {
  const fromEvent = event.receipt_issuer_name?.trim();
  if (fromEvent) return fromEvent;

  const fromLecturer = lecturer?.receipt_issuer_name?.trim();
  if (fromLecturer) return fromLecturer;

  return DEFAULT_ISSUER;
}
