-- ============================================================
-- 04_sample_data.sql
--
-- 講師1名 + 講座2件のサンプルデータ
-- 既に同じ slug のレコードがあれば UPDATE、なければ INSERT する
--
-- 実行方法：Supabase ダッシュボード > SQL Editor で全文コピペ実行
-- ============================================================

-- ----------------------------------------
-- 1. 講師サンプル（思考の学校認定講師）
-- ----------------------------------------
INSERT INTO lecturers (
  slug, name, title, catch_copy, bio,
  achievements, image_url, message, social_links, is_published
) VALUES (
  'sample-lecturer',
  '田中 さくら',
  '思考の学校 認定講師 / 心の整理コンサルタント',
  '思考が変わると、毎日がやさしく変わっていく。',
  E'はじめまして、田中さくらです。\n\n会社員時代に心が壊れる寸前まで頑張り続けた経験から、「思考のクセ」と向き合うことの大切さを知りました。\n\n思考の学校で学んだ後は、認定講師として年間200名以上の方の「心の整理」をサポートしています。\n\n「自分のことが好きになれない」「いつも頑張りすぎてしまう」「人間関係に疲れる」――そんなあなたの心が、ふっと軽くなる時間をご一緒できたら嬉しいです。',
  '[
    "思考の学校 認定講師",
    "心理カウンセラー資格 保有",
    "受講生・相談者 累計1,200名以上",
    "個人セッション・グループ講座を全国で開催",
    "メディア出演・寄稿実績多数"
  ]'::jsonb,
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=800&fit=crop',
  E'「思考が変わると、人生が変わる」――何度も実感してきた言葉です。\n\nどんなに忙しい毎日でも、自分の心と丁寧に向き合う時間を持てたら。\n\nそんな時間を、一緒につくっていきましょう。',
  '{
    "instagram": "https://instagram.com/example",
    "website": "https://example.com",
    "line": "https://lin.ee/example"
  }'::jsonb,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  title = EXCLUDED.title,
  catch_copy = EXCLUDED.catch_copy,
  bio = EXCLUDED.bio,
  achievements = EXCLUDED.achievements,
  image_url = EXCLUDED.image_url,
  message = EXCLUDED.message,
  social_links = EXCLUDED.social_links,
  is_published = EXCLUDED.is_published;

-- ----------------------------------------
-- 2. 講座サンプル①：思考の学校 体験会
-- ----------------------------------------
INSERT INTO events (
  slug, title, description, price, event_date, capacity,
  image_url, is_published, lecturer_id,
  catch_copy, subtitle, location_text, duration_text,
  benefits, schedule, target_audience, faqs, notes
) VALUES (
  'taikenkai',
  '思考の学校 体験会',
  E'「思考の学校」って、どんなことを学ぶの？\n\nそんな疑問を持つ方のための、2時間の体験会です。\n講座の一部を体験しながら、ご自身の思考のクセに気づいていただける時間。\n\nオンライン（Zoom）開催なので、全国どこからでもご参加いただけます。',
  5000,
  NOW() + INTERVAL '21 days' + INTERVAL '10 hours',
  20,
  NULL,
  true,
  (SELECT id FROM lecturers WHERE slug = 'sample-lecturer'),
  '心が軽くなる、新しい思考のヒント',
  'はじめての方も安心してご参加いただける、120分の体験会です',
  'オンライン開催（Zoom）',
  '120分（休憩込み）',
  '[
    {"title": "気づきが得られる", "description": "自分でも気づいていなかった「思考のクセ」を発見できます"},
    {"title": "心が軽くなる", "description": "ワークを通じて、モヤモヤの正体に気づき手放せます"},
    {"title": "明日から行動が変わる", "description": "学んだことをすぐ日常に活かせる実践的な内容です"}
  ]'::jsonb,
  '[
    {"time": "10:00", "title": "オープニング・自己紹介", "description": "リラックスして、お互いを知る時間"},
    {"time": "10:15", "title": "思考の学校とは？", "description": "全体像と、なぜ思考に向き合うのかをお話します"},
    {"time": "10:45", "title": "体験ワーク①：思考のクセを知る", "description": "シンプルなワークで、ご自身のパターンに気づきます"},
    {"time": "11:15", "title": "休憩"},
    {"time": "11:25", "title": "体験ワーク②：思考をやさしく整える", "description": "明日から使える、心を整える実践法をご紹介"},
    {"time": "11:55", "title": "Q&A・クロージング", "description": "ご質問にお答えし、本日の振り返り"}
  ]'::jsonb,
  '[
    "心がモヤモヤすることが多い方",
    "頑張りすぎてしまう自分を変えたい方",
    "人間関係で悩むことが多い方",
    "「思考の学校」がどんな場所か知りたい方",
    "自分と丁寧に向き合う時間を持ちたい方"
  ]'::jsonb,
  '[
    {"q": "Zoomを使ったことがなくても大丈夫？", "a": "はい、大丈夫です。事前に簡単な接続マニュアルをお送りしますので、当日はリンクをクリックするだけでご参加いただけます。"},
    {"q": "顔出しは必須ですか？", "a": "リアクションが見えると私も嬉しいですが、お顔出しは任意です。ニックネーム参加もOKです。"},
    {"q": "途中参加・途中退出は可能ですか？", "a": "可能です。ご都合に合わせてご参加ください。なお、後日のアーカイブ配信は予定しておりません。"},
    {"q": "キャンセルはできますか？", "a": "開催3日前まではキャンセル可能です。それ以降は事務手数料を除いた金額のご返金となります。"}
  ]'::jsonb,
  E'・お申し込みは事前決済制となります。\n・開催日3日前までキャンセル可能（事務手数料を除く）。\n・録画・録音はご遠慮ください。\n・Zoomリンクは開催前日にメールでお送りします。'
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  event_date = EXCLUDED.event_date,
  capacity = EXCLUDED.capacity,
  is_published = EXCLUDED.is_published,
  lecturer_id = EXCLUDED.lecturer_id,
  catch_copy = EXCLUDED.catch_copy,
  subtitle = EXCLUDED.subtitle,
  location_text = EXCLUDED.location_text,
  duration_text = EXCLUDED.duration_text,
  benefits = EXCLUDED.benefits,
  schedule = EXCLUDED.schedule,
  target_audience = EXCLUDED.target_audience,
  faqs = EXCLUDED.faqs,
  notes = EXCLUDED.notes;

-- ----------------------------------------
-- 3. 講座サンプル②：3か月実践講座
-- ----------------------------------------
INSERT INTO events (
  slug, title, description, price, event_date, capacity,
  image_url, is_published, lecturer_id,
  catch_copy, subtitle, location_text, duration_text,
  benefits, schedule, target_audience, faqs, notes
) VALUES (
  'jissen-3month',
  '思考の学校 3か月実践講座',
  E'体験会で得た「気づき」を、本物の「変化」に変える3か月間。\n\n月2回のオンラインセッション + 個別フォローで、あなたの思考のクセと丁寧に向き合います。\n\n少人数制（最大8名）だからこそできる、深いワークと安心安全な場をお約束します。',
  98000,
  NOW() + INTERVAL '45 days' + INTERVAL '10 hours',
  8,
  NULL,
  true,
  (SELECT id FROM lecturers WHERE slug = 'sample-lecturer'),
  '体験会で得た気づきを、人生の変化へ',
  '月2回 × 3か月 / 全6回のグループ講座 + 個別セッション付き',
  'オンライン開催（Zoom）',
  '各回90分 / 全6回',
  '[
    {"title": "本当の自分に出会う", "description": "深いワークを繰り返すことで、これまで気づかなかった本当の願いに辿り着きます"},
    {"title": "人間関係が楽になる", "description": "相手を変えようとせず、自分の捉え方を整える実践法を体得します"},
    {"title": "一生使える思考の整理術", "description": "講座が終わっても、ひとりで自分を整え続けられる力が身につきます"}
  ]'::jsonb,
  '[
    {"time": "Day1", "title": "オリエンテーション・自己理解", "description": "受講生同士が安心安全にシェアできる場を整えます"},
    {"time": "Day2", "title": "思考のクセと向き合う", "description": "あなたを縛っているパターンを見える化"},
    {"time": "Day3", "title": "感情との付き合い方", "description": "感情を抑え込まず、流す実践法"},
    {"time": "Day4", "title": "人間関係の整え方", "description": "相手ではなく自分を整えるアプローチ"},
    {"time": "Day5", "title": "本当の願いを描く", "description": "心の奥にある「本当はどうしたい」を引き出す"},
    {"time": "Day6", "title": "卒業セッション", "description": "3か月の歩みを振り返り、これからを描く"}
  ]'::jsonb,
  '[
    "体験会に参加して、もっと深く学びたいと感じた方",
    "自分の人生を本気で整えたい方",
    "短期ではなく、じっくり変化を起こしたい方",
    "信頼できる仲間と一緒に学びたい方"
  ]'::jsonb,
  '[
    {"q": "体験会に参加していなくても受講できますか？", "a": "もちろん可能ですが、まずは体験会で講師との相性を確かめていただくことをおすすめしています。"},
    {"q": "途中で参加できない回があった場合は？", "a": "録画でフォローアップ可能です。また、次のクラスへの振替もご相談に応じます。"},
    {"q": "支払い方法は？", "a": "クレジットカード一括または分割（3回・6回）からお選びいただけます。"},
    {"q": "個別相談はできますか？", "a": "全6回の中で1回、30分の個別セッションが含まれています。追加セッションも別途承ります。"}
  ]'::jsonb,
  E'・本講座は事前決済制（一括または分割）です。\n・開催14日前まではキャンセル可能（事務手数料を除く）。\n・少人数制のため、お申し込み確定後のお席の確保は先着順となります。'
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  event_date = EXCLUDED.event_date,
  capacity = EXCLUDED.capacity,
  is_published = EXCLUDED.is_published,
  lecturer_id = EXCLUDED.lecturer_id,
  catch_copy = EXCLUDED.catch_copy,
  subtitle = EXCLUDED.subtitle,
  location_text = EXCLUDED.location_text,
  duration_text = EXCLUDED.duration_text,
  benefits = EXCLUDED.benefits,
  schedule = EXCLUDED.schedule,
  target_audience = EXCLUDED.target_audience,
  faqs = EXCLUDED.faqs,
  notes = EXCLUDED.notes;
