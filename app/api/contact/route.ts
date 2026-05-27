import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import {
  contactAutoReplyMail,
  contactNotifyMail,
  sendMail,
} from "@/lib/resend";

export const runtime = "nodejs";

interface ContactPayload {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  consent?: boolean;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  let body: ContactPayload;
  try {
    body = (await req.json()) as ContactPayload;
  } catch {
    return NextResponse.json(
      { error: "リクエスト形式が正しくありません" },
      { status: 400 }
    );
  }

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  const subject = body.subject?.trim() ?? "";
  const message = body.message?.trim() ?? "";
  const consent = body.consent === true;

  if (!name || !email || !subject || !message) {
    return NextResponse.json(
      { error: "必須項目が未入力です" },
      { status: 400 }
    );
  }
  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: "メールアドレスの形式が正しくありません" },
      { status: 400 }
    );
  }
  if (!consent) {
    return NextResponse.json(
      { error: "プライバシーポリシーへの同意が必要です" },
      { status: 400 }
    );
  }
  if (name.length > 100 || subject.length > 200 || message.length > 4000) {
    return NextResponse.json(
      { error: "入力文字数が上限を超えています" },
      { status: 400 }
    );
  }

  const userAgent = req.headers.get("user-agent") ?? null;
  const forwarded = req.headers.get("x-forwarded-for");
  const ipAddress = forwarded ? forwarded.split(",")[0]?.trim() : null;

  // ---------- 発行元名（領収書と同じ）を講師設定から取得 ----------
  const { data: lecturer } = await supabaseAdmin
    .from("lecturers")
    .select("receipt_issuer_name")
    .eq("is_published", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle<{ receipt_issuer_name: string | null }>();
  const issuerName = lecturer?.receipt_issuer_name ?? undefined;

  // ---------- 直前30秒以内の重複送信を弾く（簡易レート制限）----------
  const since = new Date(Date.now() - 30_000).toISOString();
  const { data: recent } = await supabaseAdmin
    .from("contacts")
    .select("id")
    .eq("email", email)
    .gte("created_at", since)
    .limit(1);
  if (recent && recent.length > 0) {
    return NextResponse.json(
      { error: "短時間に同じ内容が送信されました。しばらくお待ちください。" },
      { status: 429 }
    );
  }

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from("contacts")
    .insert({
      name,
      email,
      phone: phone || null,
      subject,
      message,
      user_agent: userAgent,
      ip_address: ipAddress,
    })
    .select("id, created_at")
    .single();

  if (insertError || !inserted) {
    console.error("Failed to save contact:", insertError);
    return NextResponse.json(
      { error: "送信に失敗しました。時間をおいて再度お試しください。" },
      { status: 500 }
    );
  }

  const adminTo = process.env.ADMIN_NOTIFY_EMAIL?.trim();
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim();

  const notifyMail = contactNotifyMail({
    name,
    email,
    phone: phone || undefined,
    subject,
    message,
    receivedAt: inserted.created_at,
  });
  const autoReplyMail = contactAutoReplyMail({
    name,
    subject,
    message,
    issuerName,
  });

  const results = await Promise.allSettled([
    adminTo && fromEmail
      ? sendMail({
          to: adminTo,
          subject: notifyMail.subject,
          html: notifyMail.html,
        })
      : Promise.resolve(null),
    fromEmail
      ? sendMail({
          to: email,
          subject: autoReplyMail.subject,
          html: autoReplyMail.html,
        })
      : Promise.resolve(null),
  ]);

  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(`Contact mail ${i === 0 ? "notify" : "auto-reply"} failed:`, r.reason);
    }
  });

  return NextResponse.json({ ok: true });
}
