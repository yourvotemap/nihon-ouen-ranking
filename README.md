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
| `DATABASE_URL` | SQLite ファイルパス（例: `file:./dev.db`） |
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

## DB セットアップ

```bash
npx prisma migrate dev   # マイグレーション実行
npx prisma db seed       # ダミーデータ投入
```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
