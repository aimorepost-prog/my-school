import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdminApi } from "@/lib/require-admin-api";

export const dynamic = "force-dynamic";

/**
 * メール設定の保存（upsert）
 * POST /admin/events/[id]/settings/api
 */
export async function POST(req: NextRequest) {
  const authError = await requireAdminApi();
  if (authError) return authError;

  try {
    const body = await req.json();
    const {
      event_id,
      dunning_enabled,
      dunning_1st_days,
      dunning_2nd_days,
      reminder_1_enabled,
      reminder_1_timing,
      reminder_2_enabled,
      reminder_2_timing,
    } = body;

    if (!event_id) {
      return NextResponse.json({ error: "event_id is required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("email_settings").upsert(
      {
        event_id,
        dunning_enabled: !!dunning_enabled,
        dunning_1st_days: Number(dunning_1st_days) || 3,
        dunning_2nd_days: Number(dunning_2nd_days) || 7,
        reminder_1_enabled: !!reminder_1_enabled,
        reminder_1_timing: reminder_1_timing ?? null,
        reminder_2_enabled: !!reminder_2_enabled,
        reminder_2_timing: reminder_2_timing ?? null,
      },
      { onConflict: "event_id" }
    );

    if (error) {
      console.error("[email_settings] upsert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[email_settings] error:", err);
    return NextResponse.json(
      { error: err.message || "予期せぬエラー" },
      { status: 500 }
    );
  }
}
