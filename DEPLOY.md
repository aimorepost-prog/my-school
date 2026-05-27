# 公開手順（My Stage 神谷京花）

ローカル開発が完了したあと、本番公開までの流れです。  
**上から順番に**進めてください。

---

## 事前チェック（ローカル）

```powershell
cd C:\projects\my-school

# 環境変数が揃っているか確認
npx tsx scripts/check-deploy-ready.ts

# 本番ビルドが通るか確認
npm run build
```

エラーが出なければ Vercel デプロイの準備OKです。

---

## Step 1: GitHub にコードを置く

### 1-1. Git リポジトリを初期化（初回のみ）

```powershell
cd C:\projects\my-school
git init
git add .
git commit -m "Initial commit: My Stage 神谷京花 予約サイト"
```

> `.env.local` は `.gitignore` 済みなので **GitHub に上がりません**（安全）。

### 1-2. GitHub でリポジトリ作成

1. [https://github.com/new](https://github.com/new) を開く
2. 名前例: `my-school`（Private 推奨）
3. Create repository

### 1-3. push

```powershell
git remote add origin https://github.com/あなたのユーザー名/my-school.git
git branch -M main
git push -u origin main
```

---

## Step 2: Vercel でデプロイ

1. [https://vercel.com](https://vercel.com) にログイン（GitHub 連携）
2. **Add New → Project**
3. リポジトリ `my-school` を Import
4. Framework: **Next.js**（自動検出）
5. **Environment Variables** に下記をすべて入力（`.env.local` の値をコピー）
6. **Deploy**

### Vercel に設定する環境変数一覧

| 変数名 | 説明 |
|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクト URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role（秘密） |
| `STRIPE_SECRET_KEY` | Stripe 秘密鍵（本番は `sk_live_...`） |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe 公開鍵（本番は `pk_live_...`） |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook 署名（Step 3 で取得） |
| `RESEND_API_KEY` | Resend API キー |
| `RESEND_FROM_EMAIL` | 送信元（例: `noreply@yourdomain.com`） |
| `ADMIN_NOTIFY_EMAIL` | お問い合わせ通知先 |
| `NEXT_PUBLIC_BASE_URL` | **本番URL**（例: `https://yourdomain.com`） |
| `CRON_SECRET` | ランダム文字列（督促・リマインド用） |
| `ADMIN_PASSWORD` | 管理画面パスワード |
| `ADMIN_SESSION_SECRET` | セッション署名用ランダム文字列 |
| `RECEIPT_ISSUER_NAME` | `My Stage　神谷京花`（任意） |

**重要:** デプロイ後、`NEXT_PUBLIC_BASE_URL` を Vercel の URL に更新して **Redeploy** してください。

---

## Step 3: Stripe 本番 Webhook

1. [Stripe Dashboard](https://dashboard.stripe.com) → **本番モード**に切替
2. **開発者 → Webhook → エンドポイントを追加**
3. URL: `https://あなたのドメイン/api/stripe/webhook`
4. イベント: `checkout.session.completed` を選択
5. 表示された **Signing secret** を Vercel の `STRIPE_WEBHOOK_SECRET` に設定 → Redeploy

---

## Step 4: Resend（メール送信）

### テスト中（今）
- `RESEND_FROM_EMAIL=onboarding@resend.dev`
- 登録メールアドレス宛にしか送れない

### 本番公開時
1. [Resend Domains](https://resend.com/domains) でドメイン追加
2. DNS（SPF / DKIM）を設定
3. `RESEND_FROM_EMAIL=noreply@yourdomain.com` に変更

---

## Step 5: ドメイン（任意・推奨）

1. お名前.com 等でドメイン取得
2. Vercel → Project → **Settings → Domains** で追加
3. 表示される DNS をドメイン管理画面に設定
4. `NEXT_PUBLIC_BASE_URL` を独自ドメインに更新 → Redeploy

---

## 公開後の確認チェックリスト

- [ ] `https://あなたのURL/` → 講師ページへリダイレクト
- [ ] `/taikenkai` `/kiso-koza` `/osarai-kai` 日程表示
- [ ] テスト決済（Stripe テストカード `4242...` または本番少額）
- [ ] 領収書メール到着
- [ ] `/admin/login` ログイン
- [ ] `/contact` お問い合わせ送信
- [ ] `/privacy` `/legal` 表示

---

## よくあるトラブル

| 症状 | 対処 |
|------|------|
| 決済後メールが来ない | Stripe Webhook URL・`STRIPE_WEBHOOK_SECRET` を確認 |
| 管理画面に入れない | `ADMIN_PASSWORD` を Vercel に設定済みか確認 |
| メールが届かない | Resend のドメイン認証 / テスト中は登録メアドのみ |
| 日程が表示されない | Supabase `event_sessions` にデータがあるか確認 |

---

## ローカル開発

```powershell
cd C:\projects\my-school
npm run dev
# http://localhost:3000
```

Stripe Webhook（ローカル）:

```powershell
stripe listen --forward-to localhost:3000/api/stripe/webhook
```
