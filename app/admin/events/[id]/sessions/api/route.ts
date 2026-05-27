import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdminApi } from "@/lib/require-admin-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  let body: { starts_at?: string; ends_at?: string | null };
  try {
    body = (await req.json()) as { starts_at?: string; ends_at?: string | null };
  } catch {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
  }

  if (!body.starts_at) {
    return NextResponse.json(
      { error: "開始日時が必要です" },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin.from("event_sessions").insert({
    event_id: params.id,
    starts_at: body.starts_at,
    ends_at: body.ends_at ?? null,
    is_published: true,
  });

  if (error) {
    console.error("Failed to insert session:", error);
    return NextResponse.json({ error: "追加に失敗しました" }, { status: 500 });
  }

  const { data: earliest } = await supabaseAdmin
    .from("event_sessions")
    .select("starts_at")
    .eq("event_id", params.id)
    .eq("is_published", true)
    .order("starts_at", { ascending: true })
    .limit(1)
    .maybeSingle<{ starts_at: string }>();

  if (earliest?.starts_at) {
    await supabaseAdmin
      .from("events")
      .update({ event_date: earliest.starts_at })
      .eq("id", params.id);
  }

  revalidatePath("/admin");
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  let body: { id?: string };
  try {
    body = (await req.json()) as { id?: string };
  } catch {
    return NextResponse.json({ error: "不正なリクエストです" }, { status: 400 });
  }

  if (!body.id) {
    return NextResponse.json({ error: "IDが必要です" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("event_sessions")
    .delete()
    .eq("id", body.id)
    .eq("event_id", params.id);

  if (error) {
    return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });
  }

  revalidatePath("/admin");
  return NextResponse.json({ ok: true });
}
