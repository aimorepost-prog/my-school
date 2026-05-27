/**
 * 神谷京花さん3講座の開催日程を一括投入
 * 実行: npx tsx scripts/seed-kyoka-sessions.ts
 *
 * 事前に Supabase SQL Editor で supabase/11_event_sessions.sql を実行してください。
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import { jstIso } from "../lib/event-sessions";

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    if (!process.env[key]) process.env[key] = trimmed.slice(eq + 1).trim();
  }
}

loadEnvLocal();

const Y = 2026;

type Slot = { month: number; day: number; startH: number; startM: number; endH: number; endM: number };

const TAIKEN: Slot[] = [
  { month: 5, day: 27, startH: 20, startM: 0, endH: 21, endM: 30 },
  { month: 5, day: 28, startH: 21, startM: 0, endH: 22, endM: 30 },
  { month: 5, day: 30, startH: 13, startM: 0, endH: 14, endM: 30 },
  { month: 6, day: 6, startH: 11, startM: 0, endH: 12, endM: 30 },
  { month: 6, day: 7, startH: 20, startM: 0, endH: 21, endM: 30 },
  { month: 6, day: 14, startH: 20, startM: 0, endH: 21, endM: 30 },
  { month: 6, day: 15, startH: 15, startM: 0, endH: 16, endM: 30 },
  { month: 6, day: 17, startH: 20, startM: 0, endH: 21, endM: 30 },
  { month: 6, day: 20, startH: 11, startM: 0, endH: 12, endM: 30 },
  { month: 6, day: 21, startH: 19, startM: 0, endH: 20, endM: 30 },
  { month: 6, day: 22, startH: 19, startM: 0, endH: 20, endM: 30 },
  { month: 6, day: 23, startH: 13, startM: 0, endH: 14, endM: 30 },
  { month: 6, day: 25, startH: 21, startM: 0, endH: 22, endM: 30 },
  { month: 6, day: 26, startH: 13, startM: 0, endH: 14, endM: 30 },
  { month: 6, day: 28, startH: 21, startM: 0, endH: 22, endM: 30 },
  { month: 6, day: 29, startH: 21, startM: 0, endH: 22, endM: 30 },
];

const KISO: Slot[] = [
  { month: 6, day: 7, startH: 14, startM: 0, endH: 17, endM: 0 },
  { month: 6, day: 13, startH: 19, startM: 0, endH: 22, endM: 0 },
  { month: 6, day: 16, startH: 19, startM: 0, endH: 22, endM: 0 },
  { month: 6, day: 19, startH: 10, startM: 0, endH: 13, endM: 0 },
  { month: 6, day: 20, startH: 19, startM: 0, endH: 22, endM: 0 },
  { month: 6, day: 24, startH: 14, startM: 0, endH: 17, endM: 0 },
  { month: 6, day: 27, startH: 13, startM: 0, endH: 16, endM: 0 },
  { month: 6, day: 29, startH: 14, startM: 0, endH: 17, endM: 0 },
];

const OSARAI: Slot[] = [
  { month: 5, day: 31, startH: 20, startM: 0, endH: 21, endM: 30 },
  { month: 6, day: 28, startH: 13, startM: 0, endH: 14, endM: 30 },
];

function toRows(slots: Slot[]) {
  return slots.map((s) => ({
    starts_at: jstIso(Y, s.month, s.day, s.startH, s.startM),
    ends_at: jstIso(Y, s.month, s.day, s.endH, s.endM),
    is_published: true,
  }));
}

async function replaceSessions(
  supabase: typeof import("../lib/supabase").supabaseAdmin,
  eventId: string,
  rows: { starts_at: string; ends_at: string; is_published: boolean }[]
) {
  await supabase.from("event_sessions").delete().eq("event_id", eventId);

  const payload = rows.map((r) => ({ ...r, event_id: eventId }));
  const { error } = await supabase.from("event_sessions").insert(payload);
  if (error) throw error;

  const earliest = rows.map((r) => r.starts_at).sort()[0];
  await supabase
    .from("events")
    .update({ event_date: earliest })
    .eq("id", eventId);

  return rows.length;
}

async function main() {
  const { supabaseAdmin } = await import("../lib/supabase");

  const slugs = ["taikenkai", "kiso-koza", "osarai-kai"] as const;
  const dataMap = {
    taikenkai: toRows(TAIKEN),
    "kiso-koza": toRows(KISO),
    "osarai-kai": toRows(OSARAI),
  };

  for (const slug of slugs) {
    const { data: event, error } = await supabaseAdmin
      .from("events")
      .select("id, title")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !event) {
      console.error(`SKIP ${slug}: event not found`);
      continue;
    }

    const count = await replaceSessions(
      supabaseAdmin,
      event.id,
      dataMap[slug]
    );
    console.log(`OK: ${slug} (${event.title}) → ${count}件`);
  }

  console.log("\n完了。各講座LPで日程が表示されることを確認してください。");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
