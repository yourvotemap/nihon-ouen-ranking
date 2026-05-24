# i18n + Multi-Country + Paid Points Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add language switching (ja/en/zh), multi-country rankings (JP/US/TW/UK/FR/IN), and Stripe-based paid points system to nihon-ouen-ranking.

**Architecture:** New `/[locale]/[country]/` route tree is added alongside existing `/jp/` routes (existing URLs unchanged). Locale-aware components receive locale/country as props from layout. Stripe Checkout is used for point purchases; the client returns null if STRIPE_SECRET_KEY is unset so build always passes.

**Tech Stack:** Next.js 16 App Router, Prisma 6 / SQLite, Stripe SDK (`stripe` npm package), TypeScript strict

---

## Files Overview

**New:** `lib/i18n.ts`, `lib/countries.ts`, `lib/pointPlans.ts`, `lib/stripe.ts`, `components/LocaleCountrySwitcher.tsx`, `app/[locale]/[country]/layout.tsx`, `app/[locale]/[country]/page.tsx`, `app/[locale]/[country]/rankings/page.tsx`, `app/[locale]/[country]/categories/page.tsx`, `app/[locale]/[country]/categories/[category]/page.tsx`, `app/[locale]/[country]/entities/[slug]/page.tsx`, `app/[locale]/[country]/about/page.tsx`, `app/[locale]/[country]/rules/page.tsx`, `app/[locale]/[country]/contact/page.tsx`, `app/[locale]/[country]/points/page.tsx`, `app/[locale]/[country]/points/success/page.tsx`, `app/[locale]/[country]/points/cancel/page.tsx`, `app/jp/points/page.tsx`, `app/jp/points/success/page.tsx`, `app/jp/points/cancel/page.tsx`, `app/api/checkout/points/route.ts`, `app/api/stripe/webhook/route.ts`, `app/api/points/balance/route.ts`, `.env.example`

**Modified:** `prisma/schema.prisma`, `prisma/seed.ts`, `components/Header.tsx`, `components/RankingCard.tsx`, `components/CategoryTabs.tsx`, `app/jp/layout.tsx`, `app/api/support/route.ts`, `components/SupportForm.tsx`, `app/admin/page.tsx`, `app/jp/rules/page.tsx`

---

### Task 1: Core libraries (i18n, countries, pointPlans)

**Files:**
- Create: `lib/i18n.ts`
- Create: `lib/countries.ts`
- Create: `lib/pointPlans.ts`

- [ ] **Step 1: Create lib/i18n.ts**

```ts
// lib/i18n.ts
export type Locale = 'ja' | 'en' | 'zh';

export const LOCALES: Locale[] = ['ja', 'en', 'zh'];

const dictionaries = {
  ja: {
    siteName: '日本応援ランキング',
    siteSubtitle: 'My Country Support Rank',
    tagline: '日本を支える人・企業・団体を、みんなの応援で可視化する。',
    viewRankings: 'ランキングを見る',
    findToSupport: '応援対象を探す',
    overallRanking: '総合ランキング',
    category: 'カテゴリ',
    categories: {
      person: '人物',
      company: '企業',
      organization: '団体',
      political_party: '政党',
      media: 'メディア',
      project: 'プロジェクト・活動',
      local: '自治体・地域',
      product: '商品・サービス',
    },
    support: '応援する',
    supportPoints: '応援ポイント',
    supportReason: '応援理由',
    submit: '送信',
    report: '通報',
    login: 'ログイン',
    admin: '管理画面',
    rules: '利用ルール',
    contact: 'お問い合わせ',
    buyPoints: 'ポイント購入',
    checkBalance: '残高確認',
    rankings: 'ランキング',
    about: 'このサイトについて',
    freeSupport: '無料応援',
    paidSupport: '購入ポイントで応援',
    emailAddress: 'メールアドレス',
    supporterName: '応援者名',
    optional: '任意',
    required: '必須',
    balanceLabel: '現在の残高',
    pts: 'pt',
    insufficientBalance: 'ポイントが不足しています',
    buyMorePoints: 'ポイントを購入する',
    freeSupportLimit: '無料応援は1日最大10ptまで',
    pointsPage: '応援ポイント購入',
    purchaseComplete: '購入手続きが完了しました',
    purchaseCancelled: '購入はキャンセルされました',
    checkBalanceLink: 'ポイント残高を確認する',
    backToRanking: 'ランキングに戻る',
    backToPoints: 'ポイント購入ページへ戻る',
    webhookNote: 'Webhook反映まで少し時間がかかる場合があります。',
    pointsNotice1: '購入したポイントは、My Country Support Rank 内で応援に使用できます。',
    pointsNotice2: 'ポイントは現金への交換・返金は原則できません。',
    pointsNotice3: '不正利用や規約違反が確認された場合、ポイントや投稿が無効になる場合があります。',
    politicalPaidNotAllowed: '政党への有料応援は無効です。無料応援をご利用ください。',
    stripeNotReady: '現在準備中です',
  },
  en: {
    siteName: 'My Country Support Rank',
    siteSubtitle: 'Japan Support Ranking',
    tagline: 'Visualize people, companies, and organizations supporting Japan through supporter points.',
    viewRankings: 'View rankings',
    findToSupport: 'Find someone to support',
    overallRanking: 'Overall Ranking',
    category: 'Category',
    categories: {
      person: 'People',
      company: 'Companies',
      organization: 'Organizations',
      political_party: 'Political Parties',
      media: 'Media',
      project: 'Projects',
      local: 'Local Areas',
      product: 'Products & Services',
    },
    support: 'Support',
    supportPoints: 'Support Points',
    supportReason: 'Reason for Support',
    submit: 'Submit',
    report: 'Report',
    login: 'Login',
    admin: 'Admin',
    rules: 'Rules',
    contact: 'Contact',
    buyPoints: 'Buy Points',
    checkBalance: 'Check Balance',
    rankings: 'Rankings',
    about: 'About',
    freeSupport: 'Free Support',
    paidSupport: 'Support with Points',
    emailAddress: 'Email Address',
    supporterName: 'Supporter Name',
    optional: 'optional',
    required: 'required',
    balanceLabel: 'Current Balance',
    pts: 'pts',
    insufficientBalance: 'Insufficient balance',
    buyMorePoints: 'Buy more points',
    freeSupportLimit: 'Free support: max 10pts/day',
    pointsPage: 'Buy Support Points',
    purchaseComplete: 'Purchase completed.',
    purchaseCancelled: 'Purchase was cancelled.',
    checkBalanceLink: 'Check your point balance',
    backToRanking: 'Back to Rankings',
    backToPoints: 'Back to Points page',
    webhookNote: 'It may take a moment for points to reflect.',
    pointsNotice1: 'Purchased points can be used for supporting within My Country Support Rank.',
    pointsNotice2: 'Points cannot be exchanged for cash or refunded.',
    pointsNotice3: 'Points and posts may be invalidated in cases of abuse or violations.',
    politicalPaidNotAllowed: 'Paid support for political parties is not allowed. Please use free support.',
    stripeNotReady: 'Currently unavailable',
  },
  zh: {
    siteName: '我的国家支持排行榜',
    siteSubtitle: '日本支持排行榜',
    tagline: '通过支持积分可视化支持日本的人物、企业和组织。',
    viewRankings: '查看排行榜',
    findToSupport: '寻找支持对象',
    overallRanking: '综合排行榜',
    category: '分类',
    categories: {
      person: '人物',
      company: '企业',
      organization: '组织',
      political_party: '政党',
      media: '媒体',
      project: '项目活动',
      local: '地方地区',
      product: '商品与服务',
    },
    support: '支持',
    supportPoints: '支持积分',
    supportReason: '支持理由',
    submit: '提交',
    report: '举报',
    login: '登录',
    admin: '管理后台',
    rules: '规则',
    contact: '联系',
    buyPoints: '购买积分',
    checkBalance: '查询余额',
    rankings: '排行榜',
    about: '关于',
    freeSupport: '免费支持',
    paidSupport: '用积分支持',
    emailAddress: '电子邮件',
    supporterName: '支持者名称',
    optional: '可选',
    required: '必填',
    balanceLabel: '当前余额',
    pts: '积分',
    insufficientBalance: '积分不足',
    buyMorePoints: '购买积分',
    freeSupportLimit: '免费支持每天最多10积分',
    pointsPage: '购买支持积分',
    purchaseComplete: '购买已完成。',
    purchaseCancelled: '购买已取消。',
    checkBalanceLink: '查询积分余额',
    backToRanking: '返回排行榜',
    backToPoints: '返回积分页面',
    webhookNote: '积分到账可能需要片刻时间。',
    pointsNotice1: '购买的积分可在 My Country Support Rank 内用于支持。',
    pointsNotice2: '积分原则上不能兑换现金或退款。',
    pointsNotice3: '如发现违规行为，积分和投稿可能被取消。',
    politicalPaidNotAllowed: '政党不支持付费支持，请使用免费支持。',
    stripeNotReady: '暂不可用',
  },
} as const;

export type Dict = typeof dictionaries.ja;

export function getDict(locale: Locale): Dict {
  return dictionaries[locale] as unknown as Dict;
}

export function isValidLocale(v: string): v is Locale {
  return LOCALES.includes(v as Locale);
}
```

- [ ] **Step 2: Create lib/countries.ts**

```ts
// lib/countries.ts
import type { Locale } from './i18n';

export type CountryUrlCode = 'jp' | 'us' | 'tw' | 'uk' | 'fr' | 'in';
export type CountryDbCode = 'JP' | 'US' | 'TW' | 'UK' | 'FR' | 'IN';

export const VALID_COUNTRY_URLS: CountryUrlCode[] = ['jp', 'us', 'tw', 'uk', 'fr', 'in'];

export const COUNTRIES = [
  { code: 'JP' as CountryDbCode, urlCode: 'jp' as CountryUrlCode, flag: '🇯🇵', names: { ja: '日本', en: 'Japan', zh: '日本' } },
  { code: 'US' as CountryDbCode, urlCode: 'us' as CountryUrlCode, flag: '🇺🇸', names: { ja: 'アメリカ', en: 'United States', zh: '美国' } },
  { code: 'TW' as CountryDbCode, urlCode: 'tw' as CountryUrlCode, flag: '🇹🇼', names: { ja: '台湾', en: 'Taiwan', zh: '台湾' } },
  { code: 'UK' as CountryDbCode, urlCode: 'uk' as CountryUrlCode, flag: '🇬🇧', names: { ja: 'イギリス', en: 'United Kingdom', zh: '英国' } },
  { code: 'FR' as CountryDbCode, urlCode: 'fr' as CountryUrlCode, flag: '🇫🇷', names: { ja: 'フランス', en: 'France', zh: '法国' } },
  { code: 'IN' as CountryDbCode, urlCode: 'in' as CountryUrlCode, flag: '🇮🇳', names: { ja: 'インド', en: 'India', zh: '印度' } },
] as const;

export function urlToDbCode(urlCode: string): string {
  return urlCode.toUpperCase();
}

export function dbToUrlCode(dbCode: string): string {
  return dbCode.toLowerCase();
}

export function getCountryName(urlCode: string, locale: Locale): string {
  const c = COUNTRIES.find(c => c.urlCode === urlCode.toLowerCase());
  if (!c) return urlCode.toUpperCase();
  return (c.names as Record<string, string>)[locale] ?? c.names.en;
}

export function getCountryFlag(urlCode: string): string {
  return COUNTRIES.find(c => c.urlCode === urlCode.toLowerCase())?.flag ?? '🌍';
}

export function isValidCountryUrl(v: string): v is CountryUrlCode {
  return VALID_COUNTRY_URLS.includes(v as CountryUrlCode);
}
```

- [ ] **Step 3: Create lib/pointPlans.ts**

```ts
// lib/pointPlans.ts
export interface PointPlan {
  id: string;
  points: number;
  amount: number;
  currency: string;
}

export const POINT_PLANS: PointPlan[] = [
  { id: 'points_100',   points: 100,   amount: 100,   currency: 'jpy' },
  { id: 'points_500',   points: 500,   amount: 500,   currency: 'jpy' },
  { id: 'points_1000',  points: 1000,  amount: 1000,  currency: 'jpy' },
  { id: 'points_3000',  points: 3000,  amount: 3000,  currency: 'jpy' },
  { id: 'points_10000', points: 10000, amount: 10000, currency: 'jpy' },
];

export function getPlanById(id: string): PointPlan | undefined {
  return POINT_PLANS.find(p => p.id === id);
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd C:\Users\pomme\projects\nihon-ouen-ranking
npx tsc --noEmit
```

Expected: No errors (these files have no imports from non-existent modules yet).

---

### Task 2: lib/stripe.ts + .env.example

**Files:**
- Create: `lib/stripe.ts`
- Create: `.env.example`

- [ ] **Step 1: Install stripe package**

```bash
cd C:\Users\pomme\projects\nihon-ouen-ranking
npm install stripe
```

Expected: stripe added to package.json dependencies.

- [ ] **Step 2: Create lib/stripe.ts**

```ts
// lib/stripe.ts
import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-04-30.basil' });
  }
  return _stripe;
}
```

Note: Use the latest Stripe API version shown by TypeScript. If the version string `2025-04-30.basil` causes a type error, check `node_modules/stripe/types/index.d.ts` for `ApiVersion` and use the latest value listed there.

- [ ] **Step 3: Create .env.example**

```
DATABASE_URL=file:./dev.db
ADMIN_PASSWORD=your_admin_password_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

### Task 3: Prisma schema + migration + seed

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `prisma/seed.ts`

- [ ] **Step 1: Update prisma/schema.prisma**

Replace the entire file with:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Entity {
  id                 String    @id @default(cuid())
  countryCode        String    @default("JP")
  category           String
  name               String
  slug               String
  description        String
  shortDescription   String
  imageUrl           String?
  officialUrl        String?
  tags               String    @default("[]")
  totalSupportPoints Int       @default(0)
  supportCount       Int       @default(0)
  status             String    @default("active")
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt
  supports           Support[]

  @@unique([countryCode, slug])
}

model Support {
  id                 String            @id @default(cuid())
  countryCode        String            @default("JP")
  entityId           String
  entity             Entity            @relation(fields: [entityId], references: [id])
  userId             String?
  supporterName      String?
  email              String?
  paymentType        String            @default("free")
  supporterAccountId String?
  supporterAccount   SupporterAccount? @relation(fields: [supporterAccountId], references: [id])
  points             Int
  comment            String
  status             String            @default("visible")
  ipHash             String?
  createdAt          DateTime          @default(now())
}

model Report {
  id          String   @id @default(cuid())
  countryCode String   @default("JP")
  targetType  String
  targetId    String
  reason      String
  detail      String?
  status      String   @default("open")
  createdAt   DateTime @default(now())
}

model RateLimitRecord {
  id        String   @id @default(cuid())
  ipHash    String
  entityId  String
  createdAt DateTime @default(now())

  @@index([ipHash, entityId])
}

model FreeSupportRecord {
  id         String   @id @default(cuid())
  ipHash     String
  entityId   String
  createdAt  DateTime @default(now())

  @@index([ipHash, entityId])
}

model SupporterAccount {
  id                   String             @id @default(cuid())
  email                String             @unique
  displayName          String?
  pointBalance         Int                @default(0)
  totalPurchasedPoints Int                @default(0)
  totalSpentPoints     Int                @default(0)
  createdAt            DateTime           @default(now())
  updatedAt            DateTime           @updatedAt
  supports             Support[]
  purchases            PointPurchase[]
  transactions         PointTransaction[]
}

model PointPurchase {
  id                 String             @id @default(cuid())
  supporterAccountId String?
  stripeSessionId    String             @unique
  email              String
  points             Int
  amount             Int
  currency           String             @default("jpy")
  status             String             @default("pending")
  createdAt          DateTime           @default(now())
  paidAt             DateTime?
  supporterAccount   SupporterAccount?  @relation(fields: [supporterAccountId], references: [id])
  transactions       PointTransaction[]
}

model PointTransaction {
  id                 String           @id @default(cuid())
  supporterAccountId String
  type               String
  points             Int
  balanceAfter       Int
  entityId           String?
  supportId          String?
  purchaseId         String?
  note               String?
  createdAt          DateTime         @default(now())
  supporterAccount   SupporterAccount @relation(fields: [supporterAccountId], references: [id])
  purchase           PointPurchase?   @relation(fields: [purchaseId], references: [id])
}
```

- [ ] **Step 2: Run migration**

```bash
cd C:\Users\pomme\projects\nihon-ouen-ranking
npx prisma migrate dev --name add-i18n-multicountry-points
```

Expected: Migration created and applied. `npx prisma generate` runs automatically.

- [ ] **Step 3: Update prisma/seed.ts — add multi-country entities**

Append the following to the `entities` array in `prisma/seed.ts` (after the last existing JP entity, before `const supports`):

```ts
  // JP additional
  {
    countryCode: 'JP', category: 'company', name: '地域ものづくり企業A',
    slug: 'jp-local-manufacturing-a',
    shortDescription: '地域密着型のものづくりで雇用と技術を守る中小企業',
    description: '地方都市に根ざした製造業で、地元の素材と職人技を活かした製品を国内外に届けている。地域雇用の維持と若手技術者の育成に力を入れている。',
    tags: JSON.stringify(['製造業', '地方創生']),
    totalSupportPoints: 320, supportCount: 21,
  },
  {
    countryCode: 'JP', category: 'project', name: '子育て支援プロジェクトB',
    slug: 'jp-childcare-project-b',
    shortDescription: '地域の子育て家庭を多面的に支援するプロジェクト',
    description: '子育て支援センターの運営・ファミリーサポート・一時保育の仕組みを組み合わせ、地域の子育て家庭の孤立防止と生活支援を行っている。',
    tags: JSON.stringify(['子育て', '地域支援']),
    totalSupportPoints: 280, supportCount: 18,
  },
  {
    countryCode: 'JP', category: 'organization', name: '伝統工芸を守る団体C',
    slug: 'jp-craft-preserve-c',
    shortDescription: '消えゆく伝統工芸技術を記録・継承するNPO',
    description: '廃絶危機にある伝統工芸の技術を映像と文書で記録し、次世代の職人育成と一般向け体験プログラムを提供するNPO法人。',
    tags: JSON.stringify(['伝統工芸', 'NPO']),
    totalSupportPoints: 410, supportCount: 27,
  },
  // US
  {
    countryCode: 'US', category: 'company', name: 'Community Manufacturing Group A',
    slug: 'us-community-manufacturing-a',
    shortDescription: 'A community-focused manufacturer supporting local jobs and skills',
    description: 'A regional manufacturing company that prioritizes local employment and apprenticeship programs, producing goods with locally sourced materials and contributing to the regional economy.',
    tags: JSON.stringify(['manufacturing', 'local jobs']),
    totalSupportPoints: 380, supportCount: 24,
  },
  {
    countryCode: 'US', category: 'project', name: 'Youth Education Project B',
    slug: 'us-youth-education-b',
    shortDescription: 'Bringing STEM education to underserved youth communities',
    description: 'A volunteer-driven initiative that delivers free STEM workshops, coding bootcamps, and mentoring programs to young people in underserved communities across the country.',
    tags: JSON.stringify(['education', 'STEM', 'youth']),
    totalSupportPoints: 460, supportCount: 31,
  },
  {
    countryCode: 'US', category: 'organization', name: 'Local Volunteer Network C',
    slug: 'us-volunteer-network-c',
    shortDescription: 'Connecting volunteers with community needs across regions',
    description: 'A nationwide volunteer coordination network that matches skilled volunteers with nonprofits and community projects, amplifying the impact of grassroots civic engagement.',
    tags: JSON.stringify(['volunteers', 'community']),
    totalSupportPoints: 290, supportCount: 19,
  },
  // TW
  {
    countryCode: 'TW', category: 'organization', name: 'Local Culture Support Group A',
    slug: 'tw-culture-support-a',
    shortDescription: 'Preserving and promoting local Taiwanese cultural heritage',
    description: 'A nonprofit dedicated to documenting and revitalizing local Taiwanese cultural traditions through community events, educational programs, and partnerships with schools.',
    tags: JSON.stringify(['culture', 'heritage']),
    totalSupportPoints: 340, supportCount: 22,
  },
  {
    countryCode: 'TW', category: 'project', name: 'Youth Technology Education Project B',
    slug: 'tw-youth-tech-edu-b',
    shortDescription: 'Providing technology education for youth across Taiwan',
    description: 'A project offering free coding classes and digital literacy workshops to students in rural and underserved areas of Taiwan, bridging the digital divide.',
    tags: JSON.stringify(['education', 'technology']),
    totalSupportPoints: 510, supportCount: 34,
  },
  {
    countryCode: 'TW', category: 'organization', name: 'Community Cleanup Volunteer Team C',
    slug: 'tw-cleanup-volunteer-c',
    shortDescription: 'Organizing community cleanup drives and environmental awareness',
    description: 'A volunteer team that organizes regular neighborhood and coastal cleanup events, combined with environmental education campaigns for local schools and businesses.',
    tags: JSON.stringify(['environment', 'volunteers']),
    totalSupportPoints: 260, supportCount: 17,
  },
  // UK
  {
    countryCode: 'UK', category: 'organization', name: 'Local Heritage Support Group A',
    slug: 'uk-heritage-support-a',
    shortDescription: 'Protecting and celebrating local British heritage and history',
    description: 'A community organization dedicated to the preservation of local historical sites, oral histories, and traditional crafts, running volunteer restoration projects and public exhibitions.',
    tags: JSON.stringify(['heritage', 'history']),
    totalSupportPoints: 300, supportCount: 20,
  },
  {
    countryCode: 'UK', category: 'project', name: 'Community Skills Project B',
    slug: 'uk-community-skills-b',
    shortDescription: 'Building practical skills in underserved local communities',
    description: 'A skills-training initiative offering free workshops in carpentry, plumbing, and digital skills to adults from disadvantaged backgrounds, improving employment prospects.',
    tags: JSON.stringify(['skills', 'community']),
    totalSupportPoints: 390, supportCount: 26,
  },
  {
    countryCode: 'UK', category: 'company', name: 'Small Business Support Team C',
    slug: 'uk-small-business-c',
    shortDescription: 'Supporting local small businesses with mentoring and resources',
    description: 'A social enterprise that provides free mentoring, bookkeeping support, and networking opportunities to small businesses in deprived areas, helping them thrive and employ locally.',
    tags: JSON.stringify(['small business', 'mentoring']),
    totalSupportPoints: 270, supportCount: 18,
  },
  // FR
  {
    countryCode: 'FR', category: 'project', name: 'Regional Culture Project A',
    slug: 'fr-regional-culture-a',
    shortDescription: 'Supporting regional French culture and arts',
    description: 'An initiative promoting regional French cultural identity through festivals, artist residencies, and partnerships with local schools to keep traditional arts alive.',
    tags: JSON.stringify(['culture', 'arts']),
    totalSupportPoints: 330, supportCount: 22,
  },
  {
    countryCode: 'FR', category: 'organization', name: 'Local Food Heritage Group B',
    slug: 'fr-food-heritage-b',
    shortDescription: 'Preserving and sharing France\'s regional food traditions',
    description: 'A nonprofit working to document, preserve, and celebrate regional French food traditions through cookbooks, farmers markets, and culinary education programs.',
    tags: JSON.stringify(['food', 'heritage']),
    totalSupportPoints: 420, supportCount: 28,
  },
  {
    countryCode: 'FR', category: 'project', name: 'Youth Training Initiative C',
    slug: 'fr-youth-training-c',
    shortDescription: 'Vocational training for youth in disadvantaged areas',
    description: 'A program providing vocational skills training to youth aged 16-25 in disadvantaged areas of France, partnering with local employers to create apprenticeship pathways.',
    tags: JSON.stringify(['youth', 'training']),
    totalSupportPoints: 290, supportCount: 19,
  },
  // IN
  {
    countryCode: 'IN', category: 'project', name: 'Rural Education Support Project A',
    slug: 'in-rural-education-a',
    shortDescription: 'Bringing quality education to rural Indian communities',
    description: 'A grassroots project operating community learning centers in rural India, providing free tutoring, digital literacy training, and vocational skills to children and adults.',
    tags: JSON.stringify(['education', 'rural']),
    totalSupportPoints: 480, supportCount: 32,
  },
  {
    countryCode: 'IN', category: 'company', name: 'Local Innovation Team B',
    slug: 'in-local-innovation-b',
    shortDescription: 'Developing affordable solutions for local community challenges',
    description: 'A social enterprise designing low-cost innovations—water filters, solar lamps, seed dryers—and distributing them to rural communities to improve daily life.',
    tags: JSON.stringify(['innovation', 'social enterprise']),
    totalSupportPoints: 350, supportCount: 23,
  },
  {
    countryCode: 'IN', category: 'organization', name: 'Community Health Volunteer Group C',
    slug: 'in-health-volunteer-c',
    shortDescription: 'Volunteer-run health camps and awareness in underserved areas',
    description: 'A volunteer network that organizes free health camps, maternal health workshops, and sanitation drives in underserved communities across several Indian states.',
    tags: JSON.stringify(['health', 'volunteers']),
    totalSupportPoints: 310, supportCount: 21,
  },
```

- [ ] **Step 4: Run seed**

```bash
cd C:\Users\pomme\projects\nihon-ouen-ranking
npx prisma db seed
```

Expected: "Seeding complete." (existing JP data is upserted, new entities are created).

---

### Task 4: Update Header + RankingCard + CategoryTabs components

**Files:**
- Modify: `components/Header.tsx`
- Create: `components/LocaleCountrySwitcher.tsx`
- Modify: `components/RankingCard.tsx`
- Modify: `components/CategoryTabs.tsx`
- Modify: `app/jp/layout.tsx`

- [ ] **Step 1: Create components/LocaleCountrySwitcher.tsx**

```tsx
// components/LocaleCountrySwitcher.tsx
'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { LOCALES, type Locale } from '@/lib/i18n';
import { COUNTRIES, VALID_COUNTRY_URLS, type CountryUrlCode } from '@/lib/countries';

const LOCALE_LABELS: Record<Locale, string> = { ja: '日本語', en: 'English', zh: '中文' };

function parsePath(pathname: string): { locale: Locale; country: CountryUrlCode; rest: string } {
  const parts = pathname.split('/').filter(Boolean);
  const l = parts[0] as Locale;
  const c = parts[1] as CountryUrlCode;
  if (LOCALES.includes(l) && VALID_COUNTRY_URLS.includes(c)) {
    return { locale: l, country: c, rest: '/' + parts.slice(2).join('/') };
  }
  if (parts[0] === 'jp') {
    return { locale: 'ja', country: 'jp', rest: '/' + parts.slice(1).join('/') };
  }
  return { locale: 'ja', country: 'jp', rest: pathname };
}

function buildPath(locale: Locale, country: CountryUrlCode, rest: string, searchStr: string): string {
  const restPart = rest === '/' ? '' : rest;
  const qs = searchStr ? `?${searchStr}` : '';
  return `/${locale}/${country}${restPart}${qs}`;
}

export default function LocaleCountrySwitcher() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { locale, country, rest } = parsePath(pathname);
  const searchStr = searchParams.toString();

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex gap-1">
        {LOCALES.map(l => (
          <Link
            key={l}
            href={buildPath(l, country, rest, searchStr)}
            className={`text-xs px-2 py-0.5 rounded border transition-colors ${
              l === locale
                ? 'bg-red-600 text-white border-red-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-red-400'
            }`}
          >
            {LOCALE_LABELS[l]}
          </Link>
        ))}
      </div>
      <div className="flex gap-1 flex-wrap">
        {COUNTRIES.map(c => (
          <Link
            key={c.urlCode}
            href={buildPath(locale, c.urlCode, rest, searchStr)}
            className={`text-xs px-2 py-0.5 rounded border transition-colors ${
              c.urlCode === country
                ? 'bg-slate-700 text-white border-slate-700'
                : 'bg-white text-gray-600 border-gray-300 hover:border-slate-400'
            }`}
          >
            {c.flag}
          </Link>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update components/Header.tsx**

Replace with:

```tsx
// components/Header.tsx
import Link from 'next/link';
import { Suspense } from 'react';
import LocaleCountrySwitcher from './LocaleCountrySwitcher';
import type { Locale } from '@/lib/i18n';
import { getDict } from '@/lib/i18n';

interface HeaderProps {
  locale?: Locale;
  country?: string;
}

export default function Header({ locale = 'ja', country = 'jp' }: HeaderProps) {
  const d = getDict(locale);
  const basePath = locale === 'ja' && country === 'jp' ? '/jp' : `/${locale}/${country}`;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <Link href={basePath} className="flex items-center gap-2 shrink-0">
            <span className="text-2xl">🇯🇵</span>
            <div>
              <div className="font-bold text-sm text-red-700 leading-tight">{d.siteName}</div>
              <div className="text-xs text-gray-500 leading-tight hidden sm:block">{d.siteSubtitle}</div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm">
            <Link href={`${basePath}/rankings`} className="text-gray-600 hover:text-red-700 transition-colors">{d.rankings}</Link>
            <Link href={`${basePath}/categories`} className="text-gray-600 hover:text-red-700 transition-colors">{d.category}</Link>
            <Link href={`${basePath}/points`} className="text-red-600 hover:text-red-800 font-medium transition-colors">{d.buyPoints}</Link>
          </nav>
          <Suspense fallback={null}>
            <LocaleCountrySwitcher />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Update components/RankingCard.tsx**

Add `entityBasePath` prop:

```tsx
// components/RankingCard.tsx
import Link from 'next/link';
import { getCategoryEmoji, getCategoryLabel } from '@/lib/categories';

interface RankingCardProps {
  rank: number;
  name: string;
  slug: string;
  category: string;
  shortDescription: string;
  totalSupportPoints: number;
  supportCount: number;
  countryCode?: string;
  periodPoints?: number;
  entityBasePath?: string;
  categoryLabel?: string;
}

export default function RankingCard({
  rank, name, slug, category, shortDescription,
  totalSupportPoints, supportCount, countryCode = 'jp',
  periodPoints, entityBasePath, categoryLabel,
}: RankingCardProps) {
  const rankBadge = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;
  const rankColor = rank === 1 ? 'text-yellow-500' : rank === 2 ? 'text-gray-400' : rank === 3 ? 'text-amber-600' : 'text-gray-500';
  const points = periodPoints !== undefined ? periodPoints : totalSupportPoints;
  const base = entityBasePath ?? `/${countryCode}/entities`;

  return (
    <Link
      href={`${base}/${slug}`}
      className="block bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-red-100 transition-all p-4"
    >
      <div className="flex items-start gap-3">
        <div className={`text-2xl font-black w-10 text-center shrink-0 ${rankColor}`}>
          {rankBadge ?? `#${rank}`}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full border border-red-100">
              {getCategoryEmoji(category)} {categoryLabel ?? getCategoryLabel(category)}
            </span>
          </div>
          <div className="font-bold text-gray-900 text-base leading-tight truncate">{name}</div>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{shortDescription}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-lg font-black text-red-600">{points.toLocaleString()}</div>
          <div className="text-xs text-gray-400">pts</div>
          <div className="text-xs text-gray-400 mt-0.5">{supportCount}件</div>
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 4: Update components/CategoryTabs.tsx**

Add `allHref` prop override and `rankingsBasePath`:

```tsx
// components/CategoryTabs.tsx
import Link from 'next/link';
import { CATEGORIES, FEATURED_CATEGORIES } from '@/lib/categories';

interface CategoryTabsProps {
  countryCode?: string;
  showAll?: boolean;
  activeCategory?: string;
  basePath?: string;
  queryParam?: string;
  extraQuery?: string;
  allCatsHref?: string;
  allLabel?: string;
}

export default function CategoryTabs({
  countryCode = 'jp',
  showAll = false,
  activeCategory = 'all',
  basePath,
  queryParam,
  extraQuery = '',
  allCatsHref,
  allLabel = 'すべて',
}: CategoryTabsProps) {
  const cats = showAll ? CATEGORIES : FEATURED_CATEGORIES;
  const base = basePath ?? `/${countryCode}/categories`;

  function buildHref(id: string) {
    if (queryParam) {
      const params = new URLSearchParams({ [queryParam]: id });
      if (extraQuery) {
        const [k, v] = extraQuery.split('=');
        if (k && v) params.set(k, v);
      }
      return `${base}?${params.toString()}`;
    }
    if (id === 'all') return allCatsHref ?? `/${countryCode}/rankings`;
    return `${base}/${id}`;
  }

  const resolvedAllHref = queryParam ? buildHref('all') : (allCatsHref ?? `/${countryCode}/rankings`);

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <Link
        href={resolvedAllHref}
        className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
          activeCategory === 'all'
            ? 'bg-red-600 text-white'
            : 'bg-white text-gray-600 border border-gray-200 hover:border-red-300'
        }`}
      >
        {allLabel}
      </Link>
      {cats.map(cat => (
        <Link
          key={cat.id}
          href={buildHref(cat.id)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            activeCategory === cat.id
              ? 'bg-red-600 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-red-300'
          }`}
        >
          {cat.emoji} {cat.label}
        </Link>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Update app/jp/layout.tsx**

```tsx
// app/jp/layout.tsx
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: '日本応援ランキング | My Country Support Rank',
  description: '日本を支える人・企業・団体を、応援ポイントで可視化するランキングサイト。批判ではなく応援を集めるポジティブなランキングサービスです。',
};

export default function JpLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header locale="ja" country="jp" />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 6: Run build to confirm no type errors**

```bash
cd C:\Users\pomme\projects\nihon-ouen-ranking
npm run build
```

Expected: Build succeeds. Existing `/jp/...` pages still work.

---

### Task 5: New /[locale]/[country]/ layout + top page + static pages

**Files:**
- Create: `app/[locale]/[country]/layout.tsx`
- Create: `app/[locale]/[country]/page.tsx`
- Create: `app/[locale]/[country]/about/page.tsx`
- Create: `app/[locale]/[country]/rules/page.tsx`
- Create: `app/[locale]/[country]/contact/page.tsx`

- [ ] **Step 1: Create app/[locale]/[country]/layout.tsx**

```tsx
// app/[locale]/[country]/layout.tsx
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { isValidLocale, type Locale } from '@/lib/i18n';
import { isValidCountryUrl } from '@/lib/countries';

export default async function LocaleCountryLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; country: string }>;
}) {
  const { locale, country } = await params;
  if (!isValidLocale(locale) || !isValidCountryUrl(country)) notFound();

  return (
    <>
      <Header locale={locale as Locale} country={country} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Create app/[locale]/[country]/page.tsx**

```tsx
// app/[locale]/[country]/page.tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getRankings } from '@/lib/rankings';
import { FEATURED_CATEGORIES } from '@/lib/categories';
import RankingCard from '@/components/RankingCard';
import { getDict, isValidLocale, type Locale } from '@/lib/i18n';
import { isValidCountryUrl, urlToDbCode, getCountryName, getCountryFlag } from '@/lib/countries';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string; country: string }> }): Promise<Metadata> {
  const { locale, country } = await params;
  if (!isValidLocale(locale) || !isValidCountryUrl(country)) return { title: '404' };
  const d = getDict(locale as Locale);
  const countryName = getCountryName(country, locale as Locale);
  return {
    title: `${d.siteName} - ${countryName}`,
    description: d.tagline,
  };
}

export default async function LocaleCountryTopPage({ params }: { params: Promise<{ locale: string; country: string }> }) {
  const { locale, country } = await params;
  if (!isValidLocale(locale) || !isValidCountryUrl(country)) notFound();

  const l = locale as Locale;
  const d = getDict(l);
  const countryCode = urlToDbCode(country);
  const flag = getCountryFlag(country);
  const countryName = getCountryName(country, l);
  const basePath = `/${locale}/${country}`;
  const topEntities = await getRankings({ countryCode, limit: 10 });

  return (
    <div>
      <section className="bg-gradient-to-br from-red-700 via-red-600 to-red-800 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-5xl mb-4">{flag}</div>
          <h1 className="text-3xl sm:text-4xl font-black mb-3 leading-tight">{d.siteName}</h1>
          <p className="text-sm text-red-100 mb-1 font-medium">{countryName}</p>
          <p className="text-base sm:text-lg text-red-100 mt-4 mb-8 leading-relaxed">{d.tagline}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={`${basePath}/rankings`} className="bg-white text-red-700 font-bold px-8 py-3 rounded-full hover:bg-red-50 transition-colors shadow-lg">
              {d.viewRankings}
            </Link>
            <Link href={`${basePath}/categories`} className="bg-red-900/50 text-white font-bold px-8 py-3 rounded-full hover:bg-red-900/70 transition-colors border border-red-400">
              {d.findToSupport}
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900">🏆 {d.overallRanking} TOP10</h2>
          <Link href={`${basePath}/rankings`} className="text-sm text-red-600 hover:text-red-800 font-medium">→</Link>
        </div>
        <div className="space-y-3">
          {topEntities.map(entity => (
            <RankingCard
              key={entity.id}
              rank={entity.rank}
              name={entity.name}
              slug={entity.slug}
              category={entity.category}
              shortDescription={entity.shortDescription}
              totalSupportPoints={entity.totalSupportPoints}
              supportCount={entity.supportCount}
              entityBasePath={`${basePath}/entities`}
              categoryLabel={(d.categories as Record<string, string>)[entity.category]}
            />
          ))}
        </div>
      </section>

      <section className="bg-gray-100 py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-5 text-center">{d.category}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {FEATURED_CATEGORIES.map(cat => (
              <Link
                key={cat.id}
                href={`${basePath}/categories/${cat.id}`}
                className="bg-white rounded-xl p-4 text-center hover:shadow-md hover:border-red-200 border border-transparent transition-all"
              >
                <div className="text-3xl mb-2">{cat.emoji}</div>
                <div className="font-bold text-sm text-gray-800">
                  {(d.categories as Record<string, string>)[cat.id] ?? cat.label}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Create app/[locale]/[country]/about/page.tsx**

```tsx
// app/[locale]/[country]/about/page.tsx
import { notFound } from 'next/navigation';
import { isValidLocale, getDict, type Locale } from '@/lib/i18n';
import { isValidCountryUrl } from '@/lib/countries';

export const revalidate = 3600;

export default async function AboutPage({ params }: { params: Promise<{ locale: string; country: string }> }) {
  const { locale, country } = await params;
  if (!isValidLocale(locale) || !isValidCountryUrl(country)) notFound();
  const d = getDict(locale as Locale);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-black text-gray-900 mb-6">🌸 {d.about}</h1>
      <div className="space-y-6 text-gray-700 leading-relaxed">
        <section className="bg-red-50 rounded-2xl p-6 border border-red-100">
          <h2 className="font-bold text-gray-900 text-lg mb-2">{d.siteName}</h2>
          <p className="text-sm">{d.tagline}</p>
        </section>
        <section>
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2 text-sm">
            <p>✅ {locale === 'ja' ? '応援・称賛・支援に限定したポジティブなランキング' : locale === 'en' ? 'Positive rankings limited to support, praise, and encouragement' : '仅限支持、称赞和鼓励的积极排行榜'}</p>
            <p>✅ {locale === 'ja' ? 'ネガティブランキング・反対票は実装しない' : locale === 'en' ? 'No negative rankings or downvotes' : '没有负面排行或反对投票'}</p>
            <p>✅ {locale === 'ja' ? '誹謗中傷・差別的表現は禁止' : locale === 'en' ? 'Defamation and discriminatory content prohibited' : '禁止诽谤和歧视性内容'}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create app/[locale]/[country]/rules/page.tsx**

```tsx
// app/[locale]/[country]/rules/page.tsx
import { notFound } from 'next/navigation';
import { isValidLocale, getDict, type Locale } from '@/lib/i18n';
import { isValidCountryUrl } from '@/lib/countries';

export const revalidate = 3600;

export default async function RulesPage({ params }: { params: Promise<{ locale: string; country: string }> }) {
  const { locale, country } = await params;
  if (!isValidLocale(locale) || !isValidCountryUrl(country)) notFound();
  const d = getDict(locale as Locale);

  const prohibitedItems = locale === 'ja'
    ? ['誹謗中傷・名誉毀損', '差別的・暴力的な表現', '個人情報の投稿', '反対運動の呼びかけ', 'スパム・宣伝投稿']
    : locale === 'en'
    ? ['Defamation or personal attacks', 'Discriminatory or violent content', 'Personal information', 'Calls for boycotts', 'Spam or promotional posts']
    : ['诽谤或人身攻击', '歧视性或暴力内容', '个人信息', '抵制呼吁', '垃圾邮件或宣传帖子'];

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-black text-gray-900 mb-6">📋 {d.rules}</h1>
      <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
        <section>
          <ul className="space-y-2">
            {prohibitedItems.map(item => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-red-500 shrink-0">✗</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="bg-blue-50 rounded-2xl p-5 border border-blue-200">
          <h2 className="font-bold text-gray-900 mb-2">{d.buyPoints}</h2>
          <ul className="space-y-1 text-xs">
            <li>• {d.pointsNotice1}</li>
            <li>• {d.pointsNotice2}</li>
            <li>• {d.pointsNotice3}</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create app/[locale]/[country]/contact/page.tsx**

```tsx
// app/[locale]/[country]/contact/page.tsx
import { notFound } from 'next/navigation';
import ContactForm from '@/app/jp/contact/ContactForm';
import { isValidLocale, getDict, type Locale } from '@/lib/i18n';
import { isValidCountryUrl } from '@/lib/countries';

export default async function ContactPage({ params }: { params: Promise<{ locale: string; country: string }> }) {
  const { locale, country } = await params;
  if (!isValidLocale(locale) || !isValidCountryUrl(country)) notFound();
  const d = getDict(locale as Locale);

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-black text-gray-900 mb-6">{d.contact}</h1>
      <ContactForm />
    </div>
  );
}
```

---

### Task 6: New /[locale]/[country]/ ranking, category, entity pages

**Files:**
- Create: `app/[locale]/[country]/rankings/page.tsx`
- Create: `app/[locale]/[country]/categories/page.tsx`
- Create: `app/[locale]/[country]/categories/[category]/page.tsx`
- Create: `app/[locale]/[country]/entities/[slug]/page.tsx`

- [ ] **Step 1: Create app/[locale]/[country]/rankings/page.tsx**

```tsx
// app/[locale]/[country]/rankings/page.tsx
import { notFound } from 'next/navigation';
import { getRankings } from '@/lib/rankings';
import RankingCard from '@/components/RankingCard';
import CategoryTabs from '@/components/CategoryTabs';
import { getDict, isValidLocale, type Locale } from '@/lib/i18n';
import { isValidCountryUrl, urlToDbCode } from '@/lib/countries';

export const revalidate = 60;

export default async function RankingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; country: string }>;
  searchParams: Promise<{ period?: string; category?: string }>;
}) {
  const { locale, country } = await params;
  if (!isValidLocale(locale) || !isValidCountryUrl(country)) notFound();

  const sp = await searchParams;
  const period = (sp.period as 'all' | 'monthly' | 'weekly') ?? 'all';
  const category = sp.category ?? 'all';
  const l = locale as Locale;
  const d = getDict(l);
  const countryCode = urlToDbCode(country);
  const basePath = `/${locale}/${country}`;

  const entities = await getRankings({
    countryCode,
    period,
    category: category === 'all' ? undefined : category,
    limit: 50,
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-gray-900 mb-6">🏆 {d.rankings}</h1>
      <div className="mb-4">
        <CategoryTabs
          countryCode={country}
          activeCategory={category}
          basePath={`${basePath}/rankings`}
          queryParam="category"
          extraQuery={`period=${period}`}
          allCatsHref={`${basePath}/rankings`}
          allLabel={d.overallRanking}
        />
      </div>
      <div className="flex gap-2 mb-6">
        {([['all', locale === 'ja' ? '総合' : locale === 'en' ? 'All time' : '全部'], ['monthly', locale === 'ja' ? '月間' : locale === 'en' ? 'Monthly' : '本月'], ['weekly', locale === 'ja' ? '週間' : locale === 'en' ? 'Weekly' : '本周']] as const).map(([val, label]) => (
          <a
            key={val}
            href={`${basePath}/rankings?period=${val}&category=${category}`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              period === val ? 'bg-red-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-red-300'
            }`}
          >
            {label}
          </a>
        ))}
      </div>
      <div className="space-y-3">
        {entities.length === 0 ? (
          <p className="text-center text-gray-400 py-12">No data</p>
        ) : (
          entities.map(e => (
            <RankingCard
              key={e.id}
              rank={e.rank}
              name={e.name}
              slug={e.slug}
              category={e.category}
              shortDescription={e.shortDescription}
              totalSupportPoints={e.totalSupportPoints}
              supportCount={e.supportCount}
              periodPoints={'periodPoints' in e ? (e.periodPoints as number) : undefined}
              entityBasePath={`${basePath}/entities`}
              categoryLabel={(d.categories as Record<string, string>)[e.category]}
            />
          ))
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create app/[locale]/[country]/categories/page.tsx**

```tsx
// app/[locale]/[country]/categories/page.tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { CATEGORIES } from '@/lib/categories';
import { getDict, isValidLocale, type Locale } from '@/lib/i18n';
import { isValidCountryUrl, urlToDbCode } from '@/lib/countries';

export const revalidate = 300;

export default async function CategoriesPage({ params }: { params: Promise<{ locale: string; country: string }> }) {
  const { locale, country } = await params;
  if (!isValidLocale(locale) || !isValidCountryUrl(country)) notFound();

  const l = locale as Locale;
  const d = getDict(l);
  const countryCode = urlToDbCode(country);
  const basePath = `/${locale}/${country}`;

  const counts = await prisma.entity.groupBy({
    by: ['category'],
    where: { countryCode, status: 'active' },
    _count: { _all: true },
  });
  const countMap = Object.fromEntries(counts.map(c => [c.category, c._count._all]));

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-gray-900 mb-6">📂 {d.category}</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {CATEGORIES.map(cat => (
          <Link
            key={cat.id}
            href={`${basePath}/categories/${cat.id}`}
            className="bg-white rounded-xl p-5 text-center border border-gray-100 hover:shadow-md hover:border-red-200 transition-all"
          >
            <div className="text-3xl mb-2">{cat.emoji}</div>
            <div className="font-bold text-sm text-gray-800">{(d.categories as Record<string, string>)[cat.id] ?? cat.label}</div>
            <div className="text-xs text-gray-400 mt-1">{countMap[cat.id] ?? 0}件</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create app/[locale]/[country]/categories/[category]/page.tsx**

```tsx
// app/[locale]/[country]/categories/[category]/page.tsx
import { notFound } from 'next/navigation';
import { getRankings } from '@/lib/rankings';
import RankingCard from '@/components/RankingCard';
import { getCategoryEmoji } from '@/lib/categories';
import { getDict, isValidLocale, type Locale } from '@/lib/i18n';
import { isValidCountryUrl, urlToDbCode } from '@/lib/countries';

export const revalidate = 60;

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; country: string; category: string }>;
}) {
  const { locale, country, category } = await params;
  if (!isValidLocale(locale) || !isValidCountryUrl(country)) notFound();

  const l = locale as Locale;
  const d = getDict(l);
  const countryCode = urlToDbCode(country);
  const basePath = `/${locale}/${country}`;
  const catLabel = (d.categories as Record<string, string>)[category] ?? category;

  const entities = await getRankings({ countryCode, category, limit: 50 });
  if (!entities) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-gray-900 mb-6">
        {getCategoryEmoji(category)} {catLabel}
      </h1>
      <div className="space-y-3">
        {entities.length === 0 ? (
          <p className="text-center text-gray-400 py-12">No entries yet.</p>
        ) : (
          entities.map(e => (
            <RankingCard
              key={e.id}
              rank={e.rank}
              name={e.name}
              slug={e.slug}
              category={e.category}
              shortDescription={e.shortDescription}
              totalSupportPoints={e.totalSupportPoints}
              supportCount={e.supportCount}
              entityBasePath={`${basePath}/entities`}
              categoryLabel={catLabel}
            />
          ))
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create app/[locale]/[country]/entities/[slug]/page.tsx**

```tsx
// app/[locale]/[country]/entities/[slug]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getEntityBySlug, getEntityRank } from '@/lib/rankings';
import { getCategoryLabel, getCategoryEmoji } from '@/lib/categories';
import { prisma } from '@/lib/prisma';
import SupportForm from '@/components/SupportForm';
import CommentList from '@/components/CommentList';
import ReportButton from '@/components/ReportButton';
import { getDict, isValidLocale, type Locale } from '@/lib/i18n';
import { isValidCountryUrl, urlToDbCode } from '@/lib/countries';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string; country: string; slug: string }> }): Promise<Metadata> {
  const { locale, country, slug } = await params;
  if (!isValidLocale(locale) || !isValidCountryUrl(country)) return { title: '404' };
  const countryCode = urlToDbCode(country);
  const entity = await getEntityBySlug(countryCode, slug);
  if (!entity) return { title: '404' };
  const d = getDict(locale as Locale);
  return { title: `${entity.name} | ${d.siteName}`, description: entity.shortDescription };
}

export default async function EntityPage({ params }: { params: Promise<{ locale: string; country: string; slug: string }> }) {
  const { locale, country, slug } = await params;
  if (!isValidLocale(locale) || !isValidCountryUrl(country)) notFound();

  const l = locale as Locale;
  const d = getDict(l);
  const countryCode = urlToDbCode(country);
  const entity = await getEntityBySlug(countryCode, slug);
  if (!entity || entity.status !== 'active') notFound();

  const rank = await getEntityRank(entity.id, countryCode);
  const supports = await prisma.support.findMany({
    where: { entityId: entity.id, status: 'visible' },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const catLabel = (d.categories as Record<string, string>)[entity.category] ?? getCategoryLabel(entity.category);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full border border-red-100">
                {getCategoryEmoji(entity.category)} {catLabel}
              </span>
              <span className="text-xs text-gray-400">#{rank}</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-1">{entity.name}</h1>
            <p className="text-sm text-gray-500">{entity.shortDescription}</p>
          </div>
          <ReportButton targetType="entity" targetId={entity.id} />
        </div>
        <div className="flex gap-6 mt-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <div className="text-2xl font-black text-red-600">{entity.totalSupportPoints.toLocaleString()}</div>
            <div className="text-xs text-gray-500">{d.supportPoints}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-gray-700">{entity.supportCount}</div>
            <div className="text-xs text-gray-500">{d.support}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-gray-700">#{rank}</div>
            <div className="text-xs text-gray-500">Rank</div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <p className="text-sm text-gray-700 leading-relaxed">{entity.description}</p>
      </div>
      <div className="mb-6">
        <SupportForm entityId={entity.id} entityName={entity.name} category={entity.category} locale={l} />
      </div>
      <div>
        <h2 className="font-bold text-gray-900 mb-4">💬 ({supports.length})</h2>
        <CommentList comments={supports} />
      </div>
    </div>
  );
}
```

---

### Task 7: Points pages

**Files:**
- Create: `app/jp/points/page.tsx`
- Create: `app/jp/points/success/page.tsx`
- Create: `app/jp/points/cancel/page.tsx`
- Create: `app/[locale]/[country]/points/page.tsx`
- Create: `app/[locale]/[country]/points/success/page.tsx`
- Create: `app/[locale]/[country]/points/cancel/page.tsx`

- [ ] **Step 1: Create app/jp/points/page.tsx**

```tsx
// app/jp/points/page.tsx
import PointsPageContent from '@/components/PointsPageContent';

export default function JpPointsPage() {
  return <PointsPageContent locale="ja" country="jp" basePath="/jp" />;
}
```

- [ ] **Step 2: Create app/jp/points/success/page.tsx**

```tsx
// app/jp/points/success/page.tsx
import PointsSuccessContent from '@/components/PointsSuccessContent';
export default function JpPointsSuccessPage() {
  return <PointsSuccessContent locale="ja" basePath="/jp" />;
}
```

- [ ] **Step 3: Create app/jp/points/cancel/page.tsx**

```tsx
// app/jp/points/cancel/page.tsx
import PointsCancelContent from '@/components/PointsCancelContent';
export default function JpPointsCancelPage() {
  return <PointsCancelContent locale="ja" basePath="/jp" />;
}
```

- [ ] **Step 4: Create app/[locale]/[country]/points/page.tsx**

```tsx
// app/[locale]/[country]/points/page.tsx
import { notFound } from 'next/navigation';
import PointsPageContent from '@/components/PointsPageContent';
import { isValidLocale, type Locale } from '@/lib/i18n';
import { isValidCountryUrl } from '@/lib/countries';

export default async function LocalePointsPage({ params }: { params: Promise<{ locale: string; country: string }> }) {
  const { locale, country } = await params;
  if (!isValidLocale(locale) || !isValidCountryUrl(country)) notFound();
  return <PointsPageContent locale={locale as Locale} country={country} basePath={`/${locale}/${country}`} />;
}
```

- [ ] **Step 5: Create app/[locale]/[country]/points/success/page.tsx**

```tsx
// app/[locale]/[country]/points/success/page.tsx
import { notFound } from 'next/navigation';
import PointsSuccessContent from '@/components/PointsSuccessContent';
import { isValidLocale, type Locale } from '@/lib/i18n';
import { isValidCountryUrl } from '@/lib/countries';

export default async function LocalePointsSuccessPage({ params }: { params: Promise<{ locale: string; country: string }> }) {
  const { locale, country } = await params;
  if (!isValidLocale(locale) || !isValidCountryUrl(country)) notFound();
  return <PointsSuccessContent locale={locale as Locale} basePath={`/${locale}/${country}`} />;
}
```

- [ ] **Step 6: Create app/[locale]/[country]/points/cancel/page.tsx**

```tsx
// app/[locale]/[country]/points/cancel/page.tsx
import { notFound } from 'next/navigation';
import PointsCancelContent from '@/components/PointsCancelContent';
import { isValidLocale, type Locale } from '@/lib/i18n';
import { isValidCountryUrl } from '@/lib/countries';

export default async function LocalePointsCancelPage({ params }: { params: Promise<{ locale: string; country: string }> }) {
  const { locale, country } = await params;
  if (!isValidLocale(locale) || !isValidCountryUrl(country)) notFound();
  return <PointsCancelContent locale={locale as Locale} basePath={`/${locale}/${country}`} />;
}
```

- [ ] **Step 7: Create components/PointsPageContent.tsx**

```tsx
// components/PointsPageContent.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { POINT_PLANS } from '@/lib/pointPlans';
import { getDict, type Locale } from '@/lib/i18n';

interface Props {
  locale: Locale;
  country?: string;
  basePath: string;
}

export default function PointsPageContent({ locale, basePath }: Props) {
  const d = getDict(locale);
  const [email, setEmail] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(POINT_PLANS[1].id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [balance, setBalance] = useState<number | null>(null);
  const [checkingBalance, setCheckingBalance] = useState(false);
  const [balanceEmail, setBalanceEmail] = useState('');

  async function handlePurchase() {
    if (!email) { setError('メールアドレスを入力してください'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/checkout/points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, planId: selectedPlan, locale, successUrl: `${basePath}/points/success`, cancelUrl: `${basePath}/points/cancel` }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'エラーが発生しました'); return; }
      if (data.notReady) { setError(d.stripeNotReady); return; }
      window.location.href = data.url;
    } catch {
      setError('通信エラーが発生しました');
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckBalance() {
    if (!balanceEmail) return;
    setCheckingBalance(true);
    try {
      const res = await fetch(`/api/points/balance?email=${encodeURIComponent(balanceEmail)}`);
      const data = await res.json();
      setBalance(data.pointBalance ?? 0);
    } catch {
      setBalance(null);
    } finally {
      setCheckingBalance(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-black text-gray-900 mb-2">{d.pointsPage}</h1>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{d.emailAddress} <span className="text-red-500">*</span></label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{d.supportPoints}</label>
          <div className="grid grid-cols-1 gap-2">
            {POINT_PLANS.map(plan => (
              <label key={plan.id} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${selectedPlan === plan.id ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-300'}`}>
                <div className="flex items-center gap-3">
                  <input type="radio" name="plan" value={plan.id} checked={selectedPlan === plan.id} onChange={() => setSelectedPlan(plan.id)} className="accent-red-600" />
                  <span className="font-bold text-gray-900">{plan.points.toLocaleString()}{d.pts}</span>
                </div>
                <span className="text-gray-600 text-sm">¥{plan.amount.toLocaleString()}</span>
              </label>
            ))}
          </div>
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
        <button
          onClick={handlePurchase}
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
        >
          {loading ? '...' : d.buyPoints}
        </button>
        <div className="text-xs text-gray-500 space-y-1">
          <p>• {d.pointsNotice1}</p>
          <p>• {d.pointsNotice2}</p>
          <p>• {d.pointsNotice3}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3">
        <h2 className="font-bold text-gray-900">{d.checkBalance}</h2>
        <input
          type="email" value={balanceEmail} onChange={e => setBalanceEmail(e.target.value)}
          placeholder={d.emailAddress}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
        />
        <button
          onClick={handleCheckBalance} disabled={checkingBalance}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          {d.checkBalance}
        </button>
        {balance !== null && (
          <p className="text-sm font-bold text-gray-900">{d.balanceLabel}: {balance.toLocaleString()}{d.pts}</p>
        )}
      </div>

      <div className="mt-4 text-center">
        <Link href={`${basePath}/rankings`} className="text-sm text-red-600 hover:text-red-800">{d.backToRanking}</Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Create components/PointsSuccessContent.tsx**

```tsx
// components/PointsSuccessContent.tsx
import Link from 'next/link';
import { getDict, type Locale } from '@/lib/i18n';

interface Props { locale: Locale; basePath: string; }

export default function PointsSuccessContent({ locale, basePath }: Props) {
  const d = getDict(locale);
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="text-5xl mb-4">✅</div>
      <h1 className="text-2xl font-black text-gray-900 mb-3">{d.purchaseComplete}</h1>
      <p className="text-sm text-gray-500 mb-6">{d.webhookNote}</p>
      <div className="flex flex-col gap-3">
        <Link href={`${basePath}/points`} className="bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-colors">
          {d.checkBalanceLink}
        </Link>
        <Link href={`${basePath}/rankings`} className="text-sm text-gray-600 hover:text-gray-800">
          {d.backToRanking}
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 9: Create components/PointsCancelContent.tsx**

```tsx
// components/PointsCancelContent.tsx
import Link from 'next/link';
import { getDict, type Locale } from '@/lib/i18n';

interface Props { locale: Locale; basePath: string; }

export default function PointsCancelContent({ locale, basePath }: Props) {
  const d = getDict(locale);
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="text-5xl mb-4">❌</div>
      <h1 className="text-2xl font-black text-gray-900 mb-6">{d.purchaseCancelled}</h1>
      <Link href={`${basePath}/points`} className="bg-gray-100 text-gray-700 font-bold py-3 px-8 rounded-xl hover:bg-gray-200 transition-colors">
        {d.backToPoints}
      </Link>
    </div>
  );
}
```

---

### Task 8: API routes (checkout, webhook, balance)

**Files:**
- Create: `app/api/checkout/points/route.ts`
- Create: `app/api/stripe/webhook/route.ts`
- Create: `app/api/points/balance/route.ts`

- [ ] **Step 1: Create app/api/checkout/points/route.ts**

```ts
// app/api/checkout/points/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getPlanById } from '@/lib/pointPlans';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ notReady: true, error: 'Stripe not configured' }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: '不正なリクエスト' }, { status: 400 });

  const { email, planId, successUrl, cancelUrl } = body as {
    email?: string; planId?: string; successUrl?: string; cancelUrl?: string;
  };

  if (!email || !planId || !successUrl || !cancelUrl) {
    return NextResponse.json({ error: 'パラメータが不足しています' }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'メールアドレスの形式が正しくありません' }, { status: 400 });
  }

  const plan = getPlanById(planId);
  if (!plan) return NextResponse.json({ error: '無効なプランです' }, { status: 400 });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: email,
    line_items: [{
      price_data: {
        currency: plan.currency,
        product_data: { name: `応援ポイント ${plan.points.toLocaleString()}pt` },
        unit_amount: plan.amount,
      },
      quantity: 1,
    }],
    success_url: `${siteUrl}${successUrl}`,
    cancel_url: `${siteUrl}${cancelUrl}`,
    metadata: { email, planId, points: String(plan.points) },
  });

  await prisma.pointPurchase.create({
    data: {
      stripeSessionId: session.id,
      email,
      points: plan.points,
      amount: plan.amount,
      currency: plan.currency,
      status: 'pending',
    },
  });

  return NextResponse.json({ url: session.url });
}
```

- [ ] **Step 2: Create app/api/stripe/webhook/route.ts**

```ts
// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import type Stripe from 'stripe';

export const config = { api: { bodyParser: false } };

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });

  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const stripeSessionId = session.id;
  const email = session.customer_email ?? (session.metadata?.email ?? '');
  const pointsStr = session.metadata?.points ?? '0';
  const points = parseInt(pointsStr, 10);

  if (!email || points <= 0) {
    return NextResponse.json({ error: 'Invalid session data' }, { status: 400 });
  }

  const purchase = await prisma.pointPurchase.findUnique({ where: { stripeSessionId } });
  if (!purchase) return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });

  // Idempotency check — already paid
  if (purchase.status === 'paid') {
    return NextResponse.json({ received: true });
  }

  await prisma.$transaction(async (tx) => {
    const account = await tx.supporterAccount.upsert({
      where: { email },
      update: {
        pointBalance: { increment: points },
        totalPurchasedPoints: { increment: points },
      },
      create: {
        email,
        pointBalance: points,
        totalPurchasedPoints: points,
      },
    });

    await tx.pointPurchase.update({
      where: { id: purchase.id },
      data: {
        status: 'paid',
        paidAt: new Date(),
        supporterAccountId: account.id,
      },
    });

    await tx.pointTransaction.create({
      data: {
        supporterAccountId: account.id,
        type: 'purchase',
        points,
        balanceAfter: account.pointBalance,
        purchaseId: purchase.id,
      },
    });
  });

  return NextResponse.json({ received: true });
}
```

- [ ] **Step 3: Create app/api/points/balance/route.ts**

```ts
// app/api/points/balance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });

  const account = await prisma.supporterAccount.findUnique({ where: { email } });
  if (!account) {
    return NextResponse.json({ email, pointBalance: 0, totalPurchasedPoints: 0, totalSpentPoints: 0 });
  }

  return NextResponse.json({
    email: account.email,
    pointBalance: account.pointBalance,
    totalPurchasedPoints: account.totalPurchasedPoints,
    totalSpentPoints: account.totalSpentPoints,
  });
}
```

---

### Task 9: Update app/api/support/route.ts for paid support

**Files:**
- Modify: `app/api/support/route.ts`

- [ ] **Step 1: Replace app/api/support/route.ts**

```ts
// app/api/support/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { prisma } from '@/lib/prisma';
import { validateSupport } from '@/lib/validation';

const RATE_LIMIT_MINUTES = 30;
const FREE_DAILY_MAX_POINTS = 10;

function hashIp(ip: string): string {
  return createHash('sha256').update(ip + (process.env.ADMIN_PASSWORD ?? '')).digest('hex').slice(0, 16);
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1';
  const ipHash = hashIp(ip);

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: '不正なリクエストです' }, { status: 400 });

  const validation = validateSupport(body);
  if (!validation.valid) return NextResponse.json({ error: validation.error }, { status: 400 });

  const { entityId, points, supporterName, comment, paymentType, email } = body as {
    entityId: string;
    points: number;
    supporterName?: string;
    comment: string;
    paymentType?: 'free' | 'paid';
    email?: string;
  };

  const mode = paymentType === 'paid' ? 'paid' : 'free';

  const entity = await prisma.entity.findUnique({ where: { id: entityId } });
  if (!entity || entity.status !== 'active') {
    return NextResponse.json({ error: '対象が見つかりません' }, { status: 404 });
  }

  // political_party: paid support forbidden
  if (entity.category === 'political_party' && mode === 'paid') {
    return NextResponse.json({ error: '政党への有料応援はできません。無料応援をご利用ください。' }, { status: 400 });
  }

  if (mode === 'free') {
    if (points > FREE_DAILY_MAX_POINTS) {
      return NextResponse.json({ error: `無料応援は${FREE_DAILY_MAX_POINTS}ptまでです` }, { status: 400 });
    }

    const since = new Date(Date.now() - RATE_LIMIT_MINUTES * 60 * 1000);
    const recentCount = await prisma.rateLimitRecord.count({
      where: { ipHash, entityId, createdAt: { gte: since } },
    });
    if (recentCount >= 3) {
      return NextResponse.json({ error: `同じ対象への応援は${RATE_LIMIT_MINUTES}分間に3回までです` }, { status: 429 });
    }

    // 1-day free support check
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const todayFreeCount = await prisma.freeSupportRecord.count({
      where: { ipHash, entityId, createdAt: { gte: dayStart } },
    });
    if (todayFreeCount >= 1) {
      return NextResponse.json({ error: '同じ対象への無料応援は1日1回までです' }, { status: 429 });
    }

    await prisma.$transaction([
      prisma.support.create({
        data: {
          entityId, countryCode: entity.countryCode,
          supporterName: supporterName || null,
          email: email || null,
          paymentType: 'free',
          points, comment, ipHash, status: 'visible',
        },
      }),
      prisma.entity.update({
        where: { id: entityId },
        data: { totalSupportPoints: { increment: points }, supportCount: { increment: 1 } },
      }),
      prisma.rateLimitRecord.create({ data: { ipHash, entityId } }),
      prisma.freeSupportRecord.create({ data: { ipHash, entityId } }),
    ]);

    return NextResponse.json({ ok: true });
  }

  // paid mode
  if (!email) return NextResponse.json({ error: 'メールアドレスが必要です' }, { status: 400 });

  const account = await prisma.supporterAccount.findUnique({ where: { email } });
  if (!account) return NextResponse.json({ error: 'アカウントが見つかりません。先にポイントを購入してください。' }, { status: 400 });
  if (account.pointBalance < points) {
    return NextResponse.json({ error: `残高が不足しています（残高: ${account.pointBalance}pt）` }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    const support = await tx.support.create({
      data: {
        entityId, countryCode: entity.countryCode,
        supporterName: supporterName || null,
        email,
        paymentType: 'paid',
        supporterAccountId: account.id,
        points, comment, ipHash, status: 'visible',
      },
    });

    const updatedAccount = await tx.supporterAccount.update({
      where: { id: account.id },
      data: {
        pointBalance: { decrement: points },
        totalSpentPoints: { increment: points },
      },
    });

    await tx.pointTransaction.create({
      data: {
        supporterAccountId: account.id,
        type: 'support',
        points: -points,
        balanceAfter: updatedAccount.pointBalance,
        entityId,
        supportId: support.id,
      },
    });

    await tx.entity.update({
      where: { id: entityId },
      data: { totalSupportPoints: { increment: points }, supportCount: { increment: 1 } },
    });
  });

  return NextResponse.json({ ok: true });
}
```

---

### Task 10: Update SupportForm for free/paid toggle

**Files:**
- Modify: `components/SupportForm.tsx`

- [ ] **Step 1: Replace components/SupportForm.tsx**

```tsx
// components/SupportForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDict, type Locale } from '@/lib/i18n';

interface SupportFormProps {
  entityId: string;
  entityName: string;
  category?: string;
  locale?: Locale;
}

export default function SupportForm({ entityId, entityName, category = '', locale = 'ja' }: SupportFormProps) {
  const router = useRouter();
  const d = getDict(locale);
  const isPolitical = category === 'political_party';

  const [paymentType, setPaymentType] = useState<'free' | 'paid'>('free');
  const [points, setPoints] = useState(5);
  const [supporterName, setSupporterName] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);

  const maxPoints = paymentType === 'free' ? 10 : (balance ?? 0);

  async function checkBalance() {
    if (!email) return;
    try {
      const res = await fetch(`/api/points/balance?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      setBalance(data.pointBalance ?? 0);
    } catch { /* ignore */ }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (paymentType === 'paid' && !email) { setError(d.emailAddress + ' ' + d.required); return; }
    if (paymentType === 'paid' && balance !== null && points > balance) { setError(d.insufficientBalance); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityId, points, supporterName, email: email || undefined, comment, paymentType }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? '送信に失敗しました');
      } else {
        setSuccess(true);
        router.refresh();
      }
    } catch {
      setError('通信エラーが発生しました');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <div className="text-3xl mb-2">🎉</div>
        <p className="font-bold text-green-800">{d.support}!</p>
        <p className="text-sm text-green-600 mt-1">{entityName}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <h3 className="font-bold text-lg text-gray-900">🌟 {d.support}</h3>

      {!isPolitical && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => { setPaymentType('free'); setPoints(5); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${paymentType === 'free' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'}`}
          >
            {d.freeSupport}
          </button>
          <button
            type="button"
            onClick={() => { setPaymentType('paid'); setPoints(10); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${paymentType === 'paid' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-300 hover:border-red-400'}`}
          >
            {d.paidSupport}
          </button>
        </div>
      )}

      {isPolitical && (
        <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">{d.politicalPaidNotAllowed}</p>
      )}

      {paymentType === 'free' && (
        <p className="text-xs text-gray-400">{d.freeSupportLimit}</p>
      )}

      {paymentType === 'paid' && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder={d.emailAddress}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
              required
            />
            <button type="button" onClick={checkBalance} className="shrink-0 text-xs bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg">
              {d.checkBalance}
            </button>
          </div>
          {balance !== null && (
            <p className="text-xs text-gray-600">{d.balanceLabel}: <span className="font-bold">{balance.toLocaleString()}{d.pts}</span></p>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {d.supportPoints}: <span className="text-red-600 font-bold">{points}{d.pts}</span>
        </label>
        <input
          type="range" min={1} max={paymentType === 'free' ? 10 : Math.max(10, balance ?? 10)} value={points}
          onChange={e => setPoints(Number(e.target.value))}
          className="w-full accent-red-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>1{d.pts}</span>
          <span>{paymentType === 'free' ? `10${d.pts}` : balance !== null ? `${balance}${d.pts}` : ''}</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {d.supportReason} <span className="text-red-500">*</span>
        </label>
        <textarea
          value={comment} onChange={e => setComment(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
          required
        />
        <div className="text-xs text-gray-400 text-right">{comment.length}/500</div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {d.supporterName} <span className="text-xs text-gray-400">({d.optional})</span>
        </label>
        <input
          type="text" value={supporterName} onChange={e => setSupporterName(e.target.value)}
          maxLength={50}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
        />
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

      <button
        type="submit" disabled={loading}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
      >
        {loading ? '...' : `${points}${d.pts} ${d.support}`}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Update existing entity page to pass locale and category**

In `app/jp/entities/[slug]/page.tsx`, update the SupportForm call from:
```tsx
<SupportForm entityId={entity.id} entityName={entity.name} />
```
to:
```tsx
<SupportForm entityId={entity.id} entityName={entity.name} category={entity.category} locale="ja" />
```

---

### Task 11: Update Admin page with points management

**Files:**
- Modify: `app/admin/page.tsx`

- [ ] **Step 1: Add points tabs to admin page**

At the top of `app/admin/page.tsx`, after the existing Promise.all, add:

```tsx
const [entities, visibleSupports, openReports, recentPurchases, recentAccounts] = await Promise.all([
  prisma.entity.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
  prisma.support.findMany({
    where: { status: 'visible' },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { entity: { select: { name: true } } },
  }),
  prisma.report.findMany({ where: { status: 'open' }, orderBy: { createdAt: 'desc' }, take: 50 }),
  prisma.pointPurchase.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }),
  prisma.supporterAccount.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }),
]);
```

Update the stats grid to add PointPurchase count:

```tsx
{ label: '購入件数', value: recentPurchases.filter(p => p.status === 'paid').length },
```

Update tabs array:
```tsx
[['entities', '掲載管理'], ['supports', 'コメント管理'], ['reports', '通報一覧'], ['purchases', 'ポイント購入'], ['accounts', 'アカウント']]
```

Add new tab sections at the bottom of the page (before the closing `</div>`):

```tsx
{tab === 'purchases' && (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-600">メール</th>
            <th className="text-right px-4 py-3 font-medium text-gray-600">ポイント</th>
            <th className="text-right px-4 py-3 font-medium text-gray-600">金額</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">状態</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">日時</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {recentPurchases.map(p => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-xs font-mono">{p.email}</td>
              <td className="px-4 py-3 text-right">{p.points.toLocaleString()}pt</td>
              <td className="px-4 py-3 text-right">¥{p.amount.toLocaleString()}</td>
              <td className="px-4 py-3">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  p.status === 'paid' ? 'bg-green-100 text-green-700' :
                  p.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>{p.status}</span>
              </td>
              <td className="px-4 py-3 text-xs text-gray-400 hidden sm:table-cell">{new Date(p.createdAt).toLocaleString('ja-JP')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}

{tab === 'accounts' && (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-600">メール</th>
            <th className="text-right px-4 py-3 font-medium text-gray-600">残高</th>
            <th className="text-right px-4 py-3 font-medium text-gray-600">購入累計</th>
            <th className="text-right px-4 py-3 font-medium text-gray-600">消費累計</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {recentAccounts.map(a => (
            <tr key={a.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-xs font-mono">{a.email}</td>
              <td className="px-4 py-3 text-right font-bold text-red-600">{a.pointBalance.toLocaleString()}pt</td>
              <td className="px-4 py-3 text-right text-gray-500">{a.totalPurchasedPoints.toLocaleString()}pt</td>
              <td className="px-4 py-3 text-right text-gray-500">{a.totalSpentPoints.toLocaleString()}pt</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}
```

---

### Task 12: Update rules page + build verification

**Files:**
- Modify: `app/jp/rules/page.tsx`

- [ ] **Step 1: Add points rules section to app/jp/rules/page.tsx**

Add before the closing `</div>` of the `space-y-6` div:

```tsx
<section className="bg-blue-50 rounded-2xl p-5 border border-blue-200">
  <h2 className="font-bold text-gray-900 text-base mb-3">応援ポイントについて</h2>
  <div className="space-y-2 text-sm">
    <p>応援ポイントはサイト内で応援に使用するためのポイントです。</p>
    <p>ポイントは現金、暗号資産、その他財産的価値への交換はできません。</p>
    <p>規約違反、不正利用、誹謗中傷投稿に使われたポイントや応援は、運営判断で無効化される場合があります。</p>
    <p>決済処理にはStripeを利用します。</p>
    <p className="text-amber-700 bg-amber-50 px-3 py-2 rounded-lg mt-2">
      ⚠️ 政党カテゴリへの有料応援はできません。政治献金に関連するご利用は禁止しています。
    </p>
  </div>
</section>
```

- [ ] **Step 2: Run Prisma generate to refresh types**

```bash
cd C:\Users\pomme\projects\nihon-ouen-ranking
npx prisma generate
```

- [ ] **Step 3: Run TypeScript check**

```bash
cd C:\Users\pomme\projects\nihon-ouen-ranking
npx tsc --noEmit
```

Fix any type errors before proceeding.

- [ ] **Step 4: Run production build**

```bash
cd C:\Users\pomme\projects\nihon-ouen-ranking
npm run build
```

Expected: Build succeeds. Route table should include `/[locale]/[country]` routes and points pages.

- [ ] **Step 5: Verify route table includes:**

```
/jp                 ← existing (must still be present)
/jp/rankings        ← existing
/jp/points          ← new
/jp/points/success  ← new
/jp/points/cancel   ← new
/[locale]/[country] ← new dynamic
/api/checkout/points ← new
/api/stripe/webhook ← new
/api/points/balance ← new
```

---

## Self-Review

### Spec coverage check:
- [x] Language switching ja/en/zh — `lib/i18n.ts` + `LocaleCountrySwitcher.tsx`
- [x] URL `/[locale]/[country]/...` — `app/[locale]/[country]/` tree
- [x] Existing `/jp/...` URLs preserved — not modified
- [x] Multi-country JP/US/TW/UK/FR/IN — `lib/countries.ts` + seed data
- [x] Country selector in Header — `LocaleCountrySwitcher.tsx`
- [x] SupporterAccount / PointPurchase / PointTransaction models — schema Task 3
- [x] Stripe Checkout — `app/api/checkout/points`
- [x] Webhook idempotency — status check before processing in webhook route
- [x] Paid support with DB transaction — Task 9
- [x] Free support: 1/day + max 10pt — Task 9 (`FreeSupportRecord` model)
- [x] political_party: paid support disabled — both API and SupportForm
- [x] Stripe unset → 503, build passes — `getStripe()` returns null
- [x] Balance check API — `/api/points/balance`
- [x] Points pages with success/cancel — Tasks 7
- [x] Admin points management — Task 11
- [x] Rules page points section — Task 12

### Type consistency:
- `Locale` exported from `lib/i18n.ts`, used consistently
- `CountryUrlCode` / `CountryDbCode` from `lib/countries.ts`
- `getDict(locale)` returns `Dict` type
- `SupportForm` props: `locale?: Locale`, `category?: string`

### Known Stripe API version:
- `lib/stripe.ts` uses `'2025-04-30.basil'`. If TypeScript complains about the version string, open `node_modules/stripe/types/index.d.ts`, find the `ApiVersion` type, and use the latest string value listed there.

### FreeSupportRecord note:
- A new `FreeSupportRecord` model was added to track daily free support per IP+entity. This is separate from `RateLimitRecord` (which tracks 30-min rate limit). Both are cleared naturally by age; no cleanup job needed for MVP.
