import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  isAdminAuthConfigured,
  verifySessionToken,
} from "@/lib/admin-auth";

export async function requireAdminApi(): Promise<NextResponse | null> {
  if (!isAdminAuthConfigured()) {
    return NextResponse.json(
      { error: "管理者パスワードが設定されていません" },
      { status: 503 }
    );
  }

  const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
  const ok = await verifySessionToken(token);

  if (!ok) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  return null;
}
