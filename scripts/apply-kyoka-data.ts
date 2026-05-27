/**
 * 神谷京花さんの実データを Supabase に反映
 * 実行: npx tsx scripts/apply-kyoka-data.ts
 */
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvLocal();

async function main() {
  const { supabaseAdmin } = await import("../lib/supabase");

  const lecturerId = await upsertLecturer(supabaseAdmin);
  await upsertTaiken(supabaseAdmin, lecturerId);
  await upsertKiso(supabaseAdmin, lecturerId);
  await upsertOsarai(supabaseAdmin, lecturerId);

  console.log("OK: 神谷京花さんのデータを反映しました");
  console.log("");
  console.log("確認URL:");
  console.log("  講師LP:  /lecturer/kamiya-kyoka");
  console.log("  体験講座: /taikenkai");
  console.log("  基礎講座: /kiso-koza");
  console.log("  おさらい会: /osarai-kai");
}

async function upsertLecturer(supabase: typeof import("../lib/supabase").supabaseAdmin) {
  const { data: existing } = await supabase
    .from("lecturers")
    .select("id, image_url")
    .in("slug", ["sample-lecturer", "kamiya-kyoka"])
    .maybeSingle();

  const payload = {
    slug: "kamiya-kyoka",
    name: "神谷 京花",
    title: "思考の学校　認定講師",
    catch_copy: "生きにくいと感じている方の世界がやさしくなるお手伝い",
    bio: `もっと早く知っていたら！
それは「思考の学校」

両親から愛されていなかった、捨てられたと思っていた私。
年齢を重ねるにつれ、どんどん生きにくさを感じるようになってきました。

そんな時「思考の学校」と出会い、人生が少しずつ静かに、でも確かに変わりはじめています。

「思考の学校」との出会いは"人生からの贈りもの"でした。

あの頃の私と同じように「どうしてこんなに苦しいんだろう」と感じている方たちへ。

穏やかで笑顔がこぼれる毎日になる、そんなお手伝いをさせていただきます！

思考の学校の体験講座、基礎講座で自分の力で現実を変えてゆく力を身に着けてみませんか？`,
    achievements: [
      "思考の学校　認定講師",
      "思考の学校　講師養成講座12期生",
    ],
    message: `「思考が変わると、人生が変わる」――何度も実感してきた言葉です。

どんなに忙しい毎日でも、自分の心と丁寧に向き合う時間を持てたら。

そんな時間を、一緒につくっていきましょう。`,
    receipt_issuer_name: "My Stage　神谷京花",
    is_published: true,
  };

  if (existing) {
    const { data, error } = await supabase
      .from("lecturers")
      .update(payload)
      .eq("id", existing.id)
      .select("id")
      .single();
    if (error) throw error;
    return data.id;
  }

  const { data, error } = await supabase
    .from("lecturers")
    .insert(payload)
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function upsertTaiken(
  supabase: typeof import("../lib/supabase").supabaseAdmin,
  lecturerId: string
) {
  const payload = {
    slug: "taikenkai",
    title: "思考の学校　体験講座「お金の制限を外す会」",
    catch_copy: "思考のしくみを知って、安心と豊かさを受け取る",
    subtitle: "〜思考のしくみを知って、安心と豊かさを受け取る〜",
    description: `こんにちは。思考の学校 認定講師の 神谷京花 です。

お金のことを考えると「このままで大丈夫かな…」「また足りなくなりそう…」そんな不安が頭から離れないことはありませんか？

どれだけ頑張っても、努力しても、なぜかお金が残らない。そんな"お金の不安"には、思考のしくみが深く関係しています。

お金の不安や不足感は、実は「お金の問題」ではなく思考（＝無意識の習慣）が創り出しています。その仕組みを理解し、"安心の土台"を取り戻すことで現実は確実に変わり始めます。

お金の不安をなくしたいとき、必要なのは「頑張ること」ではなく、まず「仕組みを知ること」。

ぜひこの90分で、思考の仕組みを知って、誰も責めることのない穏やかな時間を過ごせる自分に出会っていただけることを楽しみにしています。`,
    price: 3300,
    capacity: 5,
    location_text: "オンラインミーティング（Zoom以外）",
    duration_text: "約90分（受講人数により前後します）",
    benefits: [
      { title: "思考のしくみがわかる", description: "お金の不安の背景にある思考の仕組みを理解できます" },
      { title: "臨時収入・収入アップのきっかけ", description: "不思議と必要なタイミングでお金が入る体験が増える方も" },
      { title: "お金を手にできなかった原因がわかる", description: "頑張り方ではなく、思考の向き合い方が変わります" },
      { title: "人間関係や恋愛の改善", description: "お金の前に、人間関係が先に改善することもあります" },
    ],
    schedule: [
      { time: "1", title: "自己紹介" },
      { time: "2", title: "思考の学校のシステム紹介" },
      { time: "3", title: "参加者の自己紹介" },
      { time: "4", title: "思考のしくみ" },
      { time: "5", title: "ミニワーク" },
      { time: "6", title: "アファメーション" },
      { time: "7", title: "質問タイム" },
    ],
    target_audience: [
      "お金の不安がいつも頭から離れない方",
      "頑張って働いても、なぜかお金が残らない方",
      "節約や副業をしても安心できない方",
      "お金を使うたびに罪悪感を感じてしまう方",
      "「豊かになりたいのに、現実が変わらない」と感じている方",
    ],
    faqs: [
      { q: "顔出しは必須ですか？", a: "出来るだけお顔出し（カメラON）でご参加をお願いします。" },
      { q: "心療内科に通院中でも受講できますか？", a: "心療内科通院中または薬を服用中の方は、主治医の先生にご相談の上ご受講ください。" },
      { q: "Zoomの準備は必要ですか？", a: "リンクをクリックするだけでつながるツールを使用します。初めての方はアプリのインストールが求められる場合があります。" },
    ],
    notes: `受講費：3,300円（税込）
定員：5名
ご用意：紙とペン

※心療内科通院中または薬を服用中の方は主治医の先生にご相談の上ご受講ください。

初めてZoomミーティングに参加される場合、アプリのインストールが求められる場合があります。この講座では、リンクをクリックするだけでつながるツールを使用しますので、簡単です。`,
    is_published: true,
    lecturer_id: lecturerId,
    event_date: futureDate(21, 10),
  };

  await upsertEvent(supabase, "taikenkai", payload);
}

async function upsertKiso(
  supabase: typeof import("../lib/supabase").supabaseAdmin,
  lecturerId: string
) {
  const payload = {
    slug: "kiso-koza",
    title: "思考の学校　基礎講座「３時間で思考の扱い方を学ぶ」",
    catch_copy: "人間関係・仕事・お金の悩みから自由になる",
    subtitle: "〜人間関係・仕事・お金の悩みから自由になる〜",
    description: `✔️ 仕事を頑張っているのに認められない
✔️ 人との関係に疲れてしまう
✔️ お金の不安から解放されたい

そんな思いを抱えていませんか？

私自身も「認められない」と感じていた仕事で悩み、母に捨てられたと思い込んでいた過去を抱えていました。

でも「思考の学校」と出会い、思考と感情のしくみを学んだことで、昇格と昇給を同時に叶えることができ、別の仕事では時間が短くなったのに収入が1.5倍UP、両親から愛されていたと気づき心から安心できた――そんな大きな変化を体験しました。

基礎講座は「思考が現実化するってどういうことなの？」「じゃあ、どうやって現実を変えていけばいいの？」という疑問に3時間でしっかり答えられる講座です。

図解が豊富なテキストを使いながら、誰でも理解できるようにお伝えします。さらに「困った出来事を起こさなくするための3つの簡単なメソッド」を学んでいただきます。

今の現実をちょっと変えたいなって思っていて迷っているなら、まずは一度体験してみてください！`,
    price: 33000,
    capacity: 3,
    location_text: "オンラインミーティング（Zoom以外）",
    duration_text: "約3時間（受講人数により前後します）",
    benefits: [
      { title: "職場での人間関係がスムーズに", description: "評価やコミュニケーションが改善されます" },
      { title: "苦しかった人間関係が安心できるつながりに", description: "家族やパートナーとの関係も変わります" },
      { title: "お金の不安が減り自然と収入アップに", description: "頑張らなくても成果につながる思考の扱い方を学べます" },
      { title: "自分を認め心地よく生きられる", description: "「自分は愛されていない」という思い込みから解放されます" },
    ],
    schedule: [
      { time: "Part 1", title: "思考が現実化する仕組み", description: "図解テキストで基礎を理解" },
      { time: "Part 2", title: "現実を変える3つのメソッド", description: "日常で実践できるワークを体験" },
      { time: "Part 3", title: "質疑応答・まとめ", description: "ご質問にお答えし、これからの実践を確認" },
    ],
    target_audience: [
      "誰かのせいで嫌な思いをしてきた方",
      "いっぱい我慢してきた方",
      "一人で頑張ってきた方",
      "仕事を頑張っているのに認められない方",
      "人との関係に疲れてしまう方",
      "お金の不安から解放されたい方",
    ],
    faqs: [
      { q: "体験講座に参加していなくても受講できますか？", a: "可能です。体験講座で講師との相性を確かめていただくことをおすすめしています。" },
      { q: "顔出しは必須ですか？", a: "出来るだけお顔出し（カメラON）でご参加をお願いします。" },
      { q: "心療内科に通院中でも受講できますか？", a: "心療内科通院中または薬を服用中の方は、主治医の先生にご相談の上ご受講ください。" },
    ],
    notes: `受講費：33,000円（税込）
定員：3名
ご用意：紙とペン

※心療内科通院中または薬を服用中の方は主治医の先生にご相談の上ご受講ください。`,
    is_published: true,
    lecturer_id: lecturerId,
    event_date: futureDate(45, 10),
  };

  const old = await supabase.from("events").select("id").eq("slug", "jissen-3month").maybeSingle();
  if (old.data) {
    const { error } = await supabase.from("events").update(payload).eq("id", old.data.id);
    if (error) throw error;
    return;
  }
  await upsertEvent(supabase, "kiso-koza", payload);
}

async function upsertOsarai(
  supabase: typeof import("../lib/supabase").supabaseAdmin,
  lecturerId: string
) {
  const payload = {
    slug: "osarai-kai",
    title: "思考の学校　神谷京花のおさらい会",
    catch_copy: "学びを深め、現実をもう一歩動かす",
    subtitle: "体験講座・基礎講座受講者向けの復習会",
    description: `学んだのに、うまく現実が動かない。
気づくとまた同じ思考に戻ってしまう。
イライラやモヤモヤが消えない。

そんな時は、ひとりで頑張らなくて大丈夫。

おさらい会では、他の受講生さんのお話を聞く中で色々と気づく瞬間がたくさん起こります。

人の話なのに、自分の奥に届く。自分では見えなかった思考や感情に気づく。

「何を学んでもわたしは変われない」と諦めてしまう前に、思考の学校を体験していただけたらなって思います。

ワークをしていて自分のことはわからないものです。他の人の意見を聞くことは、自分の潜在意識の声を聞くことと一緒です。

どんな自分でも大丈夫。お会いできることを楽しみにしています。`,
    price: 1650,
    capacity: 6,
    location_text: "オンライン",
    duration_text: "約1時間30分",
    benefits: [
      { title: "思考の仕組みをやさしく再確認", description: "今の現実の見方が変わります" },
      { title: "ワークの解決策を得られる", description: "いき詰まっている理由がわかります" },
      { title: "他の受講生の話から深い気づき", description: "潜在意識の声を聞く時間になります" },
    ],
    schedule: [
      { time: "1", title: "思考の仕組みのおさらい" },
      { time: "2", title: "シェアタイム", description: "受講生同士で本音や思考を共有" },
      { time: "3", title: "ワーク実践・質疑" },
    ],
    target_audience: [
      "神谷京花の体験講座・基礎講座のいずれかを受講されている方",
      "学んだけど現実がなかなか変わらない方",
      "本音ワークで言いたいことがなかなか出てこない方",
      "鏡のワークが苦手な方",
      "ご機嫌ワークのレパートリーを増やしたい方",
      "もっと自分の本音を掴んで現実を変えていきたい方",
      "思考の仕組みをもう一度落とし込みたい方",
      "人の話から気づきを受け取りたい方",
    ],
    faqs: [
      { q: "参加費はいくらですか？", a: "基礎講座受講済の方 1,650円、体験講座受講済の方 2,200円です。申込時は基礎講座受講済の方の料金（1,650円）で設定しています。体験講座のみ受講の方はお申し込み時にご連絡ください。" },
      { q: "誰でも参加できますか？", a: "神谷京花の体験講座または基礎講座を受講された方が対象です。" },
    ],
    notes: `参加費：基礎講座受講済 1,650円 / 体験講座受講済 2,200円
開催：オンライン 約1時間30分

わたし自身、約10年間「仕事で認めてもらえない」と感じていましたが、思考の学校に出会い学び始めてから半年後に昇給・賞与アップ・昇格が同時に決定。思考の変化によって現実が変わったと実感しました。`,
    is_published: true,
    lecturer_id: lecturerId,
    event_date: futureDate(14, 19),
  };

  await upsertEvent(supabase, "osarai-kai", payload);
}

async function upsertEvent(
  supabase: typeof import("../lib/supabase").supabaseAdmin,
  slug: string,
  payload: Record<string, unknown>
) {
  const { data: existing } = await supabase
    .from("events")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("events").update(payload).eq("id", existing.id);
    if (error) throw error;
    return;
  }

  const { error } = await supabase.from("events").insert(payload);
  if (error) throw error;
}

function futureDate(days: number, hour: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

main().catch((err) => {
  console.error("失敗:", err);
  process.exit(1);
});
