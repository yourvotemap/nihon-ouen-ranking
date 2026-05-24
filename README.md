This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## 環境変数

`.env.example` をコピーして `.env.local` を作成してください。

```bash
cp .env.example .env.local
```

| キー | 用途 |
|------|------|
| `DATABASE_URL` | PostgreSQL 接続文字列（例: `postgresql://USER:PASS@HOST:5432/DB?sslmode=require`） |
| `ADMIN_PASSWORD` | 管理画面パスワード |
| `NEXT_PUBLIC_SITE_URL` | サイトのベース URL（本番では `https://yourdomain.com`） |
| `STRIPE_SECRET_KEY` | Stripe シークレットキー（未設定でもビルド・起動可） |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook 署名シークレット |

## Stripe セットアップ（ポイント購入機能）

ポイント購入機能を有効にするには Stripe の設定が必要です。

1. [Stripe ダッシュボード](https://dashboard.stripe.com) でアカウントを作成
2. **テストモード**のシークレットキー（`sk_test_...`）を `STRIPE_SECRET_KEY` に設定
3. Webhook エンドポイントを登録:
   - URL: `https://yourdomain.com/api/stripe/webhook`
   - イベント: `checkout.session.completed` のみ選択
   - 署名シークレット（`whsec_...`）を `STRIPE_WEBHOOK_SECRET` に設定
4. `NEXT_PUBLIC_SITE_URL` を本番ドメインに変更（Stripe の success/cancel URL に使用）

**注意:** `STRIPE_SECRET_KEY` が未設定の場合、ポイント購入ボタンは「現在準備中」と表示され、`POST /api/checkout/points` は 503 を返します。他の機能は正常に動作します。

## DB セットアップ（ローカル）

```bash
npm run db:migrate:dev   # マイグレーション実行（PostgreSQL接続が必要）
npm run db:seed          # ダミーデータ投入
npm run db:studio        # Prisma Studio でDB確認
```

---

## Vercel + PostgreSQL デプロイ手順

### 1. PostgreSQL DB を作成

[Neon](https://neon.tech) または [Supabase](https://supabase.com) で PostgreSQL データベースを作成し、接続文字列（`DATABASE_URL`）を取得してください。

### 2. GitHub リポジトリを Vercel に Import

1. [Vercel Dashboard](https://vercel.com/new) → Import Git Repository
2. このリポジトリ（`nihon-ouen-ranking`）を選択
3. Framework Preset: **Next.js**（自動検出）

### 3. Vercel 環境変数を設定

Vercel の **Settings → Environment Variables** に以下を設定：

| 変数名 | 値 |
|--------|-----|
| `DATABASE_URL` | PostgreSQL 接続文字列（`?sslmode=require` 付き） |
| `ADMIN_PASSWORD` | 管理画面パスワード |
| `NEXT_PUBLIC_SITE_URL` | 本番 URL（例: `https://your-app.vercel.app`） |
| `STRIPE_SECRET_KEY` | Stripe シークレットキー（任意） |
| `STRIPE_WEBHOOK_SECRET` | Stripe Webhook シークレット（任意） |

> **注意:** `DATABASE_URL` は必須です。未設定の場合、本番でのDB操作が失敗します。

### 4. 初回 migration 実行

**ローカルから本番DBに対して実行する方法（PowerShell）:**

```powershell
$env:DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
npm run db:migrate
```

**Bash / macOS / Linux:**

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require" npm run db:migrate
```

> `npm run db:migrate` は `prisma migrate deploy` を実行します。本番DBに安全に適用されます。

### 5. 初期データ（seed）投入

```powershell
# PowerShell
$env:DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
npm run db:seed
```

```bash
# Bash
DATABASE_URL="postgresql://..." npm run db:seed
```

### 6. Stripe Webhook 設定

1. [Stripe Dashboard](https://dashboard.stripe.com) → Developers → Webhooks → Add endpoint
2. **Endpoint URL:** `https://your-app.vercel.app/api/stripe/webhook`
3. **Events to send:** `checkout.session.completed` のみ選択
4. 作成後に表示される **Signing secret**（`whsec_...`）を Vercel の `STRIPE_WEBHOOK_SECRET` に設定
5. Stripe の **Secret key**（`sk_live_...` または `sk_test_...`）を `STRIPE_SECRET_KEY` に設定

### 7. Vercel Build 設定（自動）

`package.json` の `postinstall` スクリプトに `prisma generate` が設定されているため、Vercel ビルド時に自動的に Prisma Client が生成されます。追加設定は不要です。

---

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
