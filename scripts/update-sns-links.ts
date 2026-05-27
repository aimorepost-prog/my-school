import { readFileSync } from "fs";
import { resolve } from "path";

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

async function main() {
  const { supabaseAdmin } = await import("../lib/supabase");

  const { data, error } = await supabaseAdmin
    .from("lecturers")
    .select("id, social_links")
    .eq("slug", "kamiya-kyoka")
    .single();

  if (error) throw error;

  const links = {
    twitter: "https://x.com/shicoall",
    website: "https://note.com/kyoka_kamiya",
  };

  const { error: updateError } = await supabaseAdmin
    .from("lecturers")
    .update({ social_links: links })
    .eq("id", data.id);

  if (updateError) throw updateError;

  console.log("OK:", links);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
