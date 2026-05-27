import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  createSessionToken,
  isAdminAuthConfigured,
  sessionCookieOptions,
  verifyPassword,
} from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  if (!isAdminAuthConfigured()) {
    return NextResponse.json(
      { error: "管理者パスワードが設定されていません" },
      { status: 503 }
    );
  }

  const body = (await req.json()) as { password?: string };
  const password = String(body.password ?? "");

  if (!verifyPassword(password)) {
    return NextResponse.json(
      { error: "パスワードが正しくありません" },
      { status: 401 }
    );
  }

  const token = await createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, token, sessionCookieOptions());
  return res;
}
