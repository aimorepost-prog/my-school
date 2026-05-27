import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdminApi } from "@/lib/require-admin-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_STATUSES = ["new", "in_progress", "done"] as const;
type ContactStatus = (typeof VALID_STATUSES)[number];

function isValidStatus(value: unknown): value is ContactStatus {
  return (
    typeof value === "string" &&
    (VALID_STATUSES as readonly string[]).includes(value)
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  let body: { status?: unknown; admin_note?: unknown };
  try {
    body = (await req.json()) as { status?: unknown; admin_note?: unknown };
  } catch {
    return NextResponse.json(
      { error: "リクエスト形式が正しくありません" },
      { status: 400 }
    );
  }

  if (!isValidStatus(body.status)) {
    return NextResponse.json(
      { error: "ステータスの値が不正です" },
      { status: 400 }
    );
  }

  const adminNote =
    typeof body.admin_note === "string" ? body.admin_note.trim() : "";

  const { error } = await supabaseAdmin
    .from("contacts")
    .update({
      status: body.status,
      admin_note: adminNote || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.id);

  if (error) {
    console.error("Failed to update contact:", error);
    return NextResponse.json(
      { error: "更新に失敗しました" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
