import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdminApi } from "@/lib/require-admin-api";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: { id: string };
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const authError = await requireAdminApi();
  if (authError) return authError;

  try {
    const body = await req.json();

    if (!body.id || body.id !== params.id) {
      return NextResponse.json(
        { error: "event id が一致しません" },
        { status: 400 }
      );
    }

    if (!body.title || !body.slug || !body.event_date) {
      return NextResponse.json(
        { error: "タイトル、slug、開催日時は必須です" },
        { status: 400 }
      );
    }

    const price = Number(body.price);
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json(
        { error: "価格は0以上の数値で入力してください" },
        { status: 400 }
      );
    }

    const capacity =
      body.capacity === null || body.capacity === ""
        ? null
        : Number(body.capacity);

    if (capacity !== null && (!Number.isFinite(capacity) || capacity < 0)) {
      return NextResponse.json(
        { error: "定員は0以上の数値、または空欄にしてください" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("events")
      .update({
        title: String(body.title),
        slug: String(body.slug),
        price,
        event_date: String(body.event_date),
        capacity,
        image_url: body.image_url ?? null,
        is_published: Boolean(body.is_published),
        catch_copy: body.catch_copy ?? null,
        subtitle: body.subtitle ?? null,
        location_text: body.location_text ?? null,
        duration_text: body.duration_text ?? null,
        description: body.description ?? null,
        benefits: Array.isArray(body.benefits) ? body.benefits : [],
        schedule: Array.isArray(body.schedule) ? body.schedule : [],
        target_audience: Array.isArray(body.target_audience)
          ? body.target_audience
          : [],
        faqs: Array.isArray(body.faqs) ? body.faqs : [],
        notes: body.notes ?? null,
        receipt_issuer_name: body.receipt_issuer_name?.trim() || null,
      })
      .eq("id", params.id);

    if (error) {
      console.error("[lp_edit] update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[lp_edit] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "予期せぬエラー" },
      { status: 500 }
    );
  }
}
