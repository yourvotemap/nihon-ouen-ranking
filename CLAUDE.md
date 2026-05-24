# CLAUDE.md

このファイルは nihon-ouen-ranking プロジェクト専用の Claude Code 作業ルールです。
グローバルの `C:\Users\pomme\CLAUDE.md` を共通ルールとして参照します。

## 1. プロジェクト概要

- プロジェクト名：日本応援ランキング（My Country Support Rank）
- 目的：日本に貢献する人物・企業・団体を応援ポイントで可視化するランキングサービス
- 対象ユーザー：日本の社会・文化・経済への貢献者を応援したい一般ユーザー
- 現在の開発段階：MVP開発中
- 重要コンセプト：批判・告発ではなく「応援・称賛」に特化。countryCode ベースで世界展開可能な設計。

## 2. 技術構成

- フレームワーク：Next.js 16 App Router
- 言語：TypeScript（strict）
- パッケージ管理：npm
- 主要ライブラリ：Prisma 6, Tailwind CSS v4
- ホスティング：未定（Vercel 推奨）
- DB：SQLite（dev）→ PostgreSQL/Supabase/Neon（本番移行予定）
- 認証：管理者のみ、簡易 cookie 認証（middleware.ts）
- 決済：MVP 未実装

## 3. ディレクトリ構成

- `app/` - Next.js App Router ページ
- `app/jp/` - 日本版ページ群
- `app/admin/` - 管理画面（要認証）
- `app/api/` - API ルート
- `components/` - 共有 UI コンポーネント
- `lib/` - ユーティリティ（prisma, categories, rankings, validation）
- `prisma/` - スキーマ・マイグレーション・シードデータ

## 4. 起動・確認コマンド

- 開発サーバー：`npm run dev`
- ビルド：`npm run build`
- 型チェック：`npx tsc --noEmit`
- DB マイグレーション：`npx prisma migrate dev`
- シード実行：`npx prisma db seed`

## 5. 環境変数（キー名のみ）

- `DATABASE_URL` - SQLite ファイルパス（本番では PostgreSQL URL）
- `ADMIN_PASSWORD` - 管理画面パスワード
- `NEXT_PUBLIC_SITE_URL` - サイトのベースURL

## 6. 主要機能

- ランキング表示（総合・カテゴリ別・期間別）
- 応援フォーム（ポイント + コメント、IP ベースレート制限）
- 通報機能
- 管理画面（掲載・コメント・通報の管理）

## 7. データ構造

- Entity: 応援対象（countryCode, category, slug 必須）
- Support: 応援ポイント + コメント（1回 1〜100pt）
- Report: 通報データ
- RateLimitRecord: IP レート制限レコード（同一 entity に 30 分 3 回まで）

## 8. 開発上の注意点

- countryCode は必ず JP で統一（将来の世界展開のため必ず保持）
- ネガティブランキング・反対票は実装禁止
- 応援ポイントの増減はトランザクションで行う（Entity.totalSupportPoints と同期）
- スマホ表示（375px）を優先して確認
- 管理者認証は middleware.ts で行う（/admin/login と /api/admin/login は認証不要）
- Prisma 6 は `prisma-client-js` provider を使用（`prisma-client` は output 必須のため）

## 9. 現在の未解決課題

- 問い合わせフォームの送信先未実装（MVP）
- ランキングの追加依頼フロー未実装
- 将来：有料ポイント・世界版・多言語化

## 11. 更新履歴

2026-05-24
- 初回作成（MVP実装完了）
