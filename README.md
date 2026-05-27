# 講師向け予約販売システム

Next.js 14 + Supabase + Stripe + Resend で構築した、講師向けイベント予約・販売システムです。

## 機能

- ✅ イベントLP（公開URL：`/[eventSlug]`）
- ✅ 予約フォーム & Stripe Checkout 決済
- ✅ 仮予約・入金確認・督促・直前リマインダーの自動メール
- ✅ 管理画面（予約一覧、売上集計、CSV出力、メール設定）
- ✅ Vercel Cron による定期メール処理

## セットアップ

### 1. 依存パッケージのインストール

```bash
cd my-school
npm install
```

### 2. Supabase 準備

1. [Supabase](https://supabase.com) でプロジェクトを作成
2. SQL Editor を開き、`supabase/schema.sql` の内容を実行
3. Project Settings > API から URL と各種 Key を取得

### 3. Stripe 準備

1. [Stripe](https://stripe.com) でアカウント作成
2. ダッシュボードから「シークレットキー」と「公開可能キー」を取得
3. Webhook エンドポイントを追加：`https://yourdomain.com/api/stripe/webhook`
   - 監視イベント：`checkout.session.completed`
4. Webhook 署名シークレットを取得

### 4. Resend 準備

1. [Resend](https://resend.com) でアカウント作成
2. API キーを発行
3. 送信元ドメインを認証

### 5. 環境変数

`.env.local.example` をコピーして `.env.local` を作成し、各値を埋めてください。

```bash
cp .env.local.example .env.local
```

### 6. 開発サーバー起動

```bash
npm run dev
```

→ http://localhost:3000

### 7. Stripe Webhook をローカル開発で受け取る

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## ディレクトリ構成

```
my-school/
├── app/
│   ├── [eventSlug]/         # イベントLP・予約フォーム・完了
│   ├── admin/               # 管理画面
│   └── api/                 # APIルート
├── lib/                     # Supabase/Stripe/Resend/utils
├── types/                   # TypeScript型定義
└── supabase/schema.sql      # DBスキーマ
```

## デプロイ（Vercel）

1. GitHubリポジトリにpush
2. [Vercel](https://vercel.com) でImport
3. 環境変数を全て登録
4. `vercel.json` の Cron が自動で有効化される
