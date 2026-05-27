import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/lib/resend";

export const dynamic = "force-dynamic";

/**
 * 汎用メール送信API（管理用）
 * POST { to: string; subject: string; html: string }
 *
 * 認証用：x-admin-secret ヘッダーに CRON_SECRET を必須化
 */
export async function POST(req: NextRequest) {
  const adminSecret = req.headers.get("x-admin-secret");
  if (adminSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { to, subject, html } = (await req.json()) as {
      to: string;
      subject: string;
      html: string;
    };

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: "to, subject, html は必須です" },
        { status: 400 }
      );
    }

    const result = await sendMail({ to, subject, html });
    return NextResponse.json({ ok: true, result });
  } catch (err: any) {
    console.error("[email] error:", err);
    return NextResponse.json(
      { error: err.message || "送信に失敗しました" },
      { status: 500 }
    );
  }
}
