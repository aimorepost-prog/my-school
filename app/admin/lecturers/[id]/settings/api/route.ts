import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { requireAdminApi } from "@/lib/require-admin-api";
import type { LecturerSocialLinks } from "@/types";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: { id: string };
}

function parseLines(text: unknown): string[] {
  if (!Array.isArray(text)) {
    if (typeof text === "string") {
      return text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
    }
    return [];
  }
  return text.filter(
    (v): v is string => typeof v === "string" && v.trim() !== ""
  );
}

function parseSocialLinks(raw: unknown): LecturerSocialLinks {
  if (!raw || typeof raw !== "object") return {};
  const s = raw as Record<string, unknown>;
  const pick = (key: keyof LecturerSocialLinks) => {
    const v = s[key];
    return typeof v === "string" && v.trim() ? v.trim() : undefined;
  };
  return {
    instagram: pick("instagram"),
    twitter: pick("twitter"),
    youtube: pick("youtube"),
    facebook: pick("facebook"),
    website: pick("website"),
    line: pick("line"),
  };
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const authError = await requireAdminApi();
  if (authError) return authError;

  try {
    const body = await req.json();

    if (!body.id || body.id !== params.id) {
      return NextResponse.json(
        { error: "lecturer id が一致しません" },
        { status: 400 }
      );
    }

    if (!body.name?.trim() || !body.slug?.trim()) {
      return NextResponse.json(
        { error: "名前と slug は必須です" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("lecturers")
      .update({
        slug: String(body.slug).trim(),
        name: String(body.name).trim(),
        title: body.title?.trim() || null,
        catch_copy: body.catch_copy?.trim() || null,
        bio: body.bio?.trim() || null,
        message: body.message?.trim() || null,
        achievements: parseLines(body.achievements),
        image_url: body.image_url?.trim() || null,
        hero_image_url: body.hero_image_url?.trim() || null,
        social_links: parseSocialLinks(body.social_links),
        receipt_issuer_name: body.receipt_issuer_name?.trim() || null,
        is_published: Boolean(body.is_published),
      })
      .eq("id", params.id)
      .select("*")
      .single();

    if (error) {
      console.error("[lecturer_settings] update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath("/admin");
    revalidatePath(`/admin/lecturers/${params.id}/settings`);
    revalidatePath(`/lecturer/${data.slug}`);

    return NextResponse.json({ ok: true, lecturer: data });
  } catch (err) {
    console.error("[lecturer_settings] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "予期せぬエラー" },
      { status: 500 }
    );
  }
}
