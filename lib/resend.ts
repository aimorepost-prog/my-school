import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY!);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@example.com";

// ============================================================
// 共通送信関数
// ============================================================

interface SendMailArgs {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail({ to, subject, html }: SendMailArgs) {
  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
  });

  if (error) {
    console.error("Resend error:", error);
    throw new Error(`Failed to send mail: ${error.message}`);
  }

  return data;
}

// ============================================================
// HTMLテンプレート用ユーティリティ
// ============================================================

function wrap(content: string): string {
  return `
<!DOCTYPE html>
<html lang="ja">
<body style="font-family: -apple-system, 'Hiragino Sans', sans-serif; line-height: 1.7; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 24px;">
  ${content}
  <hr style="margin: 32px 0; border: none; border-top: 1px solid #e2e8f0;" />
  <p style="font-size: 12px; color: #94a3b8;">
    本メールは送信専用です。ご不明な点は主催者までお問い合わせください。
  </p>
</body>
</html>`.trim();
}

function formatJpDate(iso: string): string {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}年${mm}月${dd}日 ${hh}:${mi}`;
}

// ============================================================
// メールテンプレート
// ============================================================

/**
 * 1. 仮予約＋支払い案内メール
 */
export function confirmPendingMail(
  name: string,
  eventTitle: string,
  price: number,
  paymentUrl: string
): { subject: string; html: string } {
  const subject = `【仮予約受付】${eventTitle}（お支払いをお願いします）`;
  const html = wrap(`
    <h2 style="color: #2563eb;">仮予約を受け付けました</h2>
    <p>${name} 様</p>
    <p>このたびは「<strong>${eventTitle}</strong>」へのお申し込み、誠にありがとうございます。</p>
    <p>下記のリンクから、お支払いをお願いいたします。</p>
    <p style="margin: 24px 0;">
      <a href="${paymentUrl}"
         style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
        お支払いに進む（¥${price.toLocaleString()}）
      </a>
    </p>
    <p>お支払いの完了をもって、正式なお申し込みとなります。</p>
  `);
  return { subject, html };
}

/**
 * 2. 入金確認＋イベント詳細メール
 */
export function confirmPaidMail(
  name: string,
  eventTitle: string,
  eventDate: string,
  location?: string
): { subject: string; html: string } {
  const subject = `【お申し込み確定】${eventTitle}`;
  const html = wrap(`
    <h2 style="color: #2563eb;">お申し込みありがとうございます</h2>
    <p>${name} 様</p>
    <p>お支払いを確認いたしました。お申し込みが正式に完了しました。</p>
    <table style="border-collapse: collapse; margin: 16px 0;">
      <tr>
        <td style="padding: 8px 16px 8px 0; color: #64748b;">イベント</td>
        <td style="padding: 8px 0;"><strong>${eventTitle}</strong></td>
      </tr>
      <tr>
        <td style="padding: 8px 16px 8px 0; color: #64748b;">開催日時</td>
        <td style="padding: 8px 0;">${formatJpDate(eventDate)}</td>
      </tr>
      ${
        location
          ? `<tr>
        <td style="padding: 8px 16px 8px 0; color: #64748b;">開催場所</td>
        <td style="padding: 8px 0;">${location}</td>
      </tr>`
          : ""
      }
    </table>
    <p>当日お会いできるのを楽しみにしております。</p>
  `);
  return { subject, html };
}

/**
 * 3. 未入金督促メール（1回目・2回目で文面を変える）
 */
export function dunningMail(
  name: string,
  eventTitle: string,
  paymentUrl: string,
  attempt: 1 | 2
): { subject: string; html: string } {
  if (attempt === 1) {
    return {
      subject: `【お支払いのお願い】${eventTitle}`,
      html: wrap(`
        <h2 style="color: #f59e0b;">お支払いがまだお済みでないようです</h2>
        <p>${name} 様</p>
        <p>「<strong>${eventTitle}</strong>」へのお申し込みありがとうございます。</p>
        <p>恐れ入りますが、まだお支払いが確認できておりません。お手数ですが、下記より決済をお願いいたします。</p>
        <p style="margin: 24px 0;">
          <a href="${paymentUrl}"
             style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            お支払いに進む
          </a>
        </p>
      `),
    };
  }

  return {
    subject: `【最終ご案内】${eventTitle} のお支払いについて`,
    html: wrap(`
      <h2 style="color: #dc2626;">最終のご案内</h2>
      <p>${name} 様</p>
      <p>「<strong>${eventTitle}</strong>」へのお申し込みについて、繰り返しのご案内となり恐縮です。</p>
      <p>まだお支払いが確認できておりません。お席を確保するため、お早めの決済をお願いいたします。</p>
      <p style="margin: 24px 0;">
        <a href="${paymentUrl}"
           style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          今すぐお支払いに進む
        </a>
      </p>
      <p>※このご案内以降、お申し込みが自動的にキャンセルとなる場合がございます。</p>
    `),
  };
}

/**
 * 5. 領収書メール（入金完了時に自動発行）
 */
export function receiptMail(args: {
  receiptName: string;
  eventTitle: string;
  price: number;
  paidAt: string;
  bookingId: string;
  issuerName?: string;
}): { subject: string; html: string } {
  const issuer =
    args.issuerName?.trim() ||
    process.env.RECEIPT_ISSUER_NAME ||
    "思考の学校";
  const receiptNo = args.bookingId.slice(0, 8).toUpperCase();
  const paidDate = formatJpDate(args.paidAt);

  const subject = `【領収書】${args.eventTitle}`;
  const html = wrap(`
    <h2 style="color: #3D8AA8; margin-bottom: 8px;">領　収　書</h2>
    <p style="font-size: 13px; color: #64748b; margin-top: 0;">Receipt</p>

    <div style="border: 2px solid #A8D4E5; border-radius: 12px; padding: 24px; margin: 24px 0; background: #F8FBFD;">
      <p style="font-size: 18px; margin: 0 0 8px;">
        <strong>${args.receiptName}</strong> 様
      </p>
      <p style="margin: 0 0 20px; color: #64748b; font-size: 14px;">
        下記、正に領収いたしました。
      </p>

      <table style="border-collapse: collapse; width: 100%; margin-bottom: 16px;">
        <tr>
          <td style="padding: 8px 0; color: #64748b; width: 120px;">但し書き</td>
          <td style="padding: 8px 0;"><strong>${args.eventTitle} 参加費</strong></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">金額</td>
          <td style="padding: 8px 0; font-size: 22px; font-weight: bold; color: #3D8AA8;">
            ¥${args.price.toLocaleString()}（税込）
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">領収日</td>
          <td style="padding: 8px 0;">${paidDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b;">領収書No.</td>
          <td style="padding: 8px 0; font-family: monospace;">${receiptNo}</td>
        </tr>
      </table>

      <p style="margin: 0; text-align: right; font-size: 14px; color: #475569;">
        ${issuer}
      </p>
    </div>

    <p style="font-size: 13px; color: #64748b;">
      本領収書は電子領収書です。印刷してご利用いただけます。
    </p>
  `);

  return { subject, html };
}

/**
 * 6. 直前リマインダーメール
 */
export function reminderMail(
  name: string,
  eventTitle: string,
  eventDate: string,
  minutesBefore: number
): { subject: string; html: string } {
  // 分→表示文字列に変換
  let timingLabel: string;
  if (minutesBefore >= 1440 && minutesBefore % 1440 === 0) {
    timingLabel = `${minutesBefore / 1440}日前`;
  } else if (minutesBefore >= 60 && minutesBefore % 60 === 0) {
    timingLabel = `${minutesBefore / 60}時間前`;
  } else {
    timingLabel = `${minutesBefore}分前`;
  }

  const subject = `【リマインド】${eventTitle}（${timingLabel}のお知らせ）`;
  const html = wrap(`
    <h2 style="color: #2563eb;">まもなくイベント開催です</h2>
    <p>${name} 様</p>
    <p>本日は「<strong>${eventTitle}</strong>」へのご参加、ありがとうございます。</p>
    <p>イベント開催の <strong>${timingLabel}</strong> となりましたので、お知らせいたします。</p>
    <table style="border-collapse: collapse; margin: 16px 0;">
      <tr>
        <td style="padding: 8px 16px 8px 0; color: #64748b;">開催日時</td>
        <td style="padding: 8px 0;"><strong>${formatJpDate(eventDate)}</strong></td>
      </tr>
    </table>
    <p>お会いできるのを楽しみにしております。</p>
  `);
  return { subject, html };
}

// ============================================================
// 7. お問い合わせメール
// ============================================================

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function nl2br(text: string): string {
  return escapeHtml(text).replace(/\r?\n/g, "<br />");
}

/**
 * 7-1. お問い合わせ受信通知（管理者向け）
 */
export function contactNotifyMail(args: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  receivedAt: string;
}): { subject: string; html: string } {
  const subject = `【お問い合わせ】${args.subject}（${args.name} 様より）`;
  const html = wrap(`
    <h2 style="color: #3D8AA8;">お問い合わせを受信しました</h2>
    <p style="color: #64748b; font-size: 13px;">受信日時：${formatJpDate(args.receivedAt)}</p>

    <table style="border-collapse: collapse; margin: 16px 0; width: 100%;">
      <tr>
        <td style="padding: 8px 16px 8px 0; color: #64748b; width: 120px;">お名前</td>
        <td style="padding: 8px 0;"><strong>${escapeHtml(args.name)}</strong></td>
      </tr>
      <tr>
        <td style="padding: 8px 16px 8px 0; color: #64748b;">メールアドレス</td>
        <td style="padding: 8px 0;"><a href="mailto:${escapeHtml(args.email)}">${escapeHtml(args.email)}</a></td>
      </tr>
      ${
        args.phone
          ? `<tr>
        <td style="padding: 8px 16px 8px 0; color: #64748b;">電話番号</td>
        <td style="padding: 8px 0;">${escapeHtml(args.phone)}</td>
      </tr>`
          : ""
      }
      <tr>
        <td style="padding: 8px 16px 8px 0; color: #64748b;">件名</td>
        <td style="padding: 8px 0;">${escapeHtml(args.subject)}</td>
      </tr>
    </table>

    <div style="background: #F8FBFD; border-left: 4px solid #A8D4E5; padding: 16px 20px; margin: 16px 0;">
      <p style="margin: 0 0 8px; color: #64748b; font-size: 13px;">お問い合わせ内容</p>
      <p style="margin: 0; line-height: 1.8;">${nl2br(args.message)}</p>
    </div>

    <p style="font-size: 13px; color: #64748b;">
      管理画面からも詳細・対応状況を確認できます。
    </p>
  `);
  return { subject, html };
}

/**
 * 7-2. お問い合わせ自動返信（送信者向け）
 */
export function contactAutoReplyMail(args: {
  name: string;
  subject: string;
  message: string;
  issuerName?: string;
}): { subject: string; html: string } {
  const issuer =
    args.issuerName?.trim() ||
    process.env.RECEIPT_ISSUER_NAME ||
    "思考の学校";

  const subject = `【受付完了】お問い合わせありがとうございます`;
  const html = wrap(`
    <h2 style="color: #3D8AA8;">お問い合わせを受け付けました</h2>
    <p>${escapeHtml(args.name)} 様</p>
    <p>このたびはお問い合わせをいただき、誠にありがとうございます。</p>
    <p>下記の内容でお問い合わせを受け付けいたしました。担当者より2〜3営業日以内にご連絡いたしますので、今しばらくお待ちください。</p>

    <div style="background: #F8FBFD; border: 1px solid #E0EEF5; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <p style="margin: 0 0 12px; color: #64748b; font-size: 13px;">お問い合わせ内容</p>
      <p style="margin: 0 0 8px;"><strong>件名：</strong>${escapeHtml(args.subject)}</p>
      <p style="margin: 0; line-height: 1.8;">${nl2br(args.message)}</p>
    </div>

    <p style="font-size: 13px; color: #64748b;">
      ※本メールは送信専用アドレスからお送りしています。返信いただいてもお答えできかねますので、ご了承ください。<br />
      ※2〜3営業日経っても返信がない場合、メールが届いていない可能性があります。お手数ですが再度ご連絡ください。
    </p>

    <p style="margin-top: 24px; text-align: right; color: #475569;">${escapeHtml(issuer)}</p>
  `);
  return { subject, html };
}
