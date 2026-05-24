# 日本応援ランキング (My Country Support Rank) MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack Next.js web app where users can browse and vote for people/companies/organizations contributing to Japan, with rankings, support forms, reporting, and an admin panel.

**Architecture:** Next.js 15 App Router with TypeScript, Prisma/SQLite for data, Tailwind CSS for styling. API routes handle support submission and reporting. Admin panel uses simple cookie-based auth. Country-code scoped data model enables future global expansion.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Prisma, SQLite, `tsx` for seed scripts

**Working directory:** `C:\Users\pomme\projects\nihon-ouen-ranking`

---

## File Structure

```
nihon-ouen-ranking/
├── app/
│   ├── layout.tsx                        # Root layout
│   ├── page.tsx                          # Redirect → /jp
│   ├── globals.css
│   ├── jp/
│   │   ├── layout.tsx                    # JP metadata wrapper
│   │   ├── page.tsx                      # JP top page
│   │   ├── rankings/page.tsx             # Full rankings
│   │   ├── categories/
│   │   │   ├── page.tsx                  # Category list
│   │   │   └── [category]/page.tsx       # Category rankings
│   │   ├── entities/[slug]/page.tsx      # Individual entity page
│   │   ├── about/page.tsx
│   │   ├── rules/page.tsx
│   │   └── contact/page.tsx
│   ├── admin/
│   │   ├── layout.tsx                    # Admin auth check
│   │   └── page.tsx                      # Admin dashboard
│   └── api/
│       ├── support/route.ts
│       ├── report/route.ts
│       └── admin/
│           ├── entities/route.ts
│           └── supports/route.ts
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── RankingCard.tsx
│   ├── CategoryTabs.tsx
│   ├── SupportForm.tsx
│   ├── CommentList.tsx
│   └── ReportButton.tsx
├── lib/
│   ├── prisma.ts
│   ├── categories.ts
│   ├── validation.ts
│   └── rankings.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── middleware.ts                          # Admin route protection
├── .env.local
├── CLAUDE.md
└── package.json
```

---

### Task 1: Create Next.js project and install dependencies

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`

- [ ] **Step 1: Initialize Next.js project**

Run in `C:\Users\pomme\projects\nihon-ouen-ranking`:
```bash
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --yes
```
Expected: Project created with Next.js 15, TypeScript, Tailwind, App Router.

- [ ] **Step 2: Install Prisma and dev dependencies**

```bash
npm install prisma @prisma/client
npm install -D tsx
```

- [ ] **Step 3: Create .env.local**

Create `C:\Users\pomme\projects\nihon-ouen-ranking\.env.local`:
```
DATABASE_URL="file:./dev.db"
ADMIN_PASSWORD="admin1234"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

- [ ] **Step 4: Commit**

```bash
git init
git add -A
git commit -m "chore: initialize Next.js project with TypeScript and Tailwind"
```

---

### Task 2: Prisma schema and database setup

**Files:**
- Create: `prisma/schema.prisma`

- [ ] **Step 1: Initialize Prisma with SQLite**

```bash
npx prisma init --datasource-provider sqlite
```

- [ ] **Step 2: Replace prisma/schema.prisma with the full schema**

Write `prisma/schema.prisma`:
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
  id            String   @id @default(cuid())
  countryCode   String   @default("JP")
  entityId      String
  entity        Entity   @relation(fields: [entityId], references: [id])
  userId        String?
  supporterName String?
  points        Int
  comment       String
  status        String   @default("visible")
  ipHash        String?
  createdAt     DateTime @default(now())
}

model Report {
  id         String   @id @default(cuid())
  targetType String
  targetId   String
  reason     String
  detail     String?
  status     String   @default("open")
  createdAt  DateTime @default(now())
}

model RateLimitRecord {
  id        String   @id @default(cuid())
  ipHash    String
  entityId  String
  createdAt DateTime @default(now())

  @@index([ipHash, entityId])
}
```

- [ ] **Step 3: Run migration**

```bash
npx prisma migrate dev --name init
```
Expected: `dev.db` created, migration file generated.

- [ ] **Step 4: Commit**

```bash
git add prisma/ .env.local
git commit -m "feat: add Prisma schema with Entity, Support, Report, RateLimitRecord"
```

---

### Task 3: Core library files

**Files:**
- Create: `lib/prisma.ts`, `lib/categories.ts`, `lib/validation.ts`, `lib/rankings.ts`

- [ ] **Step 1: Create lib/prisma.ts**

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: process.env.NODE_ENV === 'development' ? ['error'] : [] });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

- [ ] **Step 2: Create lib/categories.ts**

```typescript
export type CategoryId =
  | 'person' | 'company' | 'organization' | 'political_party'
  | 'media' | 'project' | 'local' | 'product';

export const CATEGORIES = [
  { id: 'person' as CategoryId,         label: '人物',              emoji: '👤', featured: true },
  { id: 'company' as CategoryId,        label: '企業',              emoji: '🏢', featured: true },
  { id: 'organization' as CategoryId,   label: '団体',              emoji: '🤝', featured: true },
  { id: 'political_party' as CategoryId,label: '政党',              emoji: '🏛️', featured: false },
  { id: 'media' as CategoryId,          label: 'メディア',           emoji: '📺', featured: false },
  { id: 'project' as CategoryId,        label: 'プロジェクト・活動', emoji: '🚀', featured: true },
  { id: 'local' as CategoryId,          label: '自治体・地域',       emoji: '🏘️', featured: true },
  { id: 'product' as CategoryId,        label: '商品・サービス',     emoji: '📦', featured: true },
] as const;

export const FEATURED_CATEGORIES = CATEGORIES.filter(c => c.featured);

export function getCategoryLabel(id: string): string {
  return CATEGORIES.find(c => c.id === id)?.label ?? id;
}

export function getCategoryEmoji(id: string): string {
  return CATEGORIES.find(c => c.id === id)?.emoji ?? '📌';
}
```

- [ ] **Step 3: Create lib/validation.ts**

```typescript
export const NG_WORDS = ['死ね', '殺す', 'バカ', 'アホ', '消えろ'];

export function containsNgWords(text: string): boolean {
  return NG_WORDS.some(w => text.includes(w));
}

export function validateSupport(data: unknown): { valid: boolean; error?: string } {
  if (typeof data !== 'object' || data === null) return { valid: false, error: '不正なデータ' };
  const d = data as Record<string, unknown>;

  if (typeof d.points !== 'number' || d.points < 1 || d.points > 100) {
    return { valid: false, error: '応援ポイントは1〜100の整数で入力してください' };
  }
  if (typeof d.comment !== 'string' || d.comment.trim().length < 10) {
    return { valid: false, error: '応援理由は10文字以上入力してください' };
  }
  if (d.comment.length > 500) {
    return { valid: false, error: '応援理由は500文字以内で入力してください' };
  }
  if (containsNgWords(d.comment as string)) {
    return { valid: false, error: '不適切な表現が含まれています' };
  }
  if (d.supporterName && typeof d.supporterName === 'string' && d.supporterName.length > 50) {
    return { valid: false, error: '応援者名は50文字以内で入力してください' };
  }
  return { valid: true };
}
```

- [ ] **Step 4: Create lib/rankings.ts**

```typescript
import { prisma } from './prisma';

export type RankingPeriod = 'all' | 'monthly' | 'weekly';

function getPeriodStart(period: RankingPeriod): Date | null {
  if (period === 'all') return null;
  const d = new Date();
  if (period === 'monthly') d.setMonth(d.getMonth() - 1);
  if (period === 'weekly') d.setDate(d.getDate() - 7);
  return d;
}

export async function getRankings({
  countryCode = 'JP',
  category,
  period = 'all',
  limit = 20,
  skip = 0,
}: {
  countryCode?: string;
  category?: string;
  period?: RankingPeriod;
  limit?: number;
  skip?: number;
}) {
  const periodStart = getPeriodStart(period);

  if (periodStart) {
    const grouped = await prisma.support.groupBy({
      by: ['entityId'],
      where: {
        createdAt: { gte: periodStart },
        status: 'visible',
        entity: {
          countryCode,
          status: 'active',
          ...(category && category !== 'all' ? { category } : {}),
        },
      },
      _sum: { points: true },
      _count: { _all: true },
      orderBy: { _sum: { points: 'desc' } },
      take: limit,
      skip,
    });

    const entities = await prisma.entity.findMany({
      where: { id: { in: grouped.map(g => g.entityId) } },
    });

    return grouped.map((g, i) => {
      const e = entities.find(ent => ent.id === g.entityId)!;
      return {
        ...e,
        tags: JSON.parse(e.tags) as string[],
        periodPoints: g._sum.points ?? 0,
        rank: skip + i + 1,
      };
    });
  }

  const entities = await prisma.entity.findMany({
    where: {
      countryCode,
      status: 'active',
      ...(category && category !== 'all' ? { category } : {}),
    },
    orderBy: { totalSupportPoints: 'desc' },
    take: limit,
    skip,
  });

  return entities.map((e, i) => ({
    ...e,
    tags: JSON.parse(e.tags) as string[],
    rank: skip + i + 1,
  }));
}

export async function getEntityBySlug(countryCode: string, slug: string) {
  const entity = await prisma.entity.findUnique({
    where: { countryCode_slug: { countryCode, slug } },
  });
  if (!entity) return null;
  return { ...entity, tags: JSON.parse(entity.tags) as string[] };
}

export async function getEntityRank(entityId: string, countryCode: string): Promise<number> {
  const count = await prisma.entity.count({
    where: {
      countryCode,
      status: 'active',
      totalSupportPoints: {
        gt: (await prisma.entity.findUnique({ where: { id: entityId } }))?.totalSupportPoints ?? 0,
      },
    },
  });
  return count + 1;
}
```

- [ ] **Step 5: Commit**

```bash
git add lib/
git commit -m "feat: add core library files (prisma client, categories, validation, rankings)"
```

---

### Task 4: Seed data

**Files:**
- Create: `prisma/seed.ts`
- Modify: `package.json` (add prisma.seed config)

- [ ] **Step 1: Create prisma/seed.ts**

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const entities = [
  {
    countryCode: 'JP', category: 'person', name: '山田はるか',
    slug: 'jp-yamada-haruka',
    shortDescription: '伝統工芸の魅力を国内外に伝える職人・文化活動家',
    description: '長年にわたり日本の伝統工芸（陶芸・漆器）の技術継承に取り組み、海外でのワークショップやオンライン展示会を通じて日本文化の普及に貢献している。若い職人の育成にも力を入れており、地域経済の活性化にも寄与している。',
    tags: JSON.stringify(['伝統工芸', '文化普及', '職人']),
    totalSupportPoints: 1240,
    supportCount: 87,
  },
  {
    countryCode: 'JP', category: 'person', name: '鈴木たろう',
    slug: 'jp-suzuki-taro',
    shortDescription: '地方ITスタートアップを立ち上げ、地域雇用を創出する起業家',
    description: '地方都市でIT企業を創業し、100名以上の地元雇用を生み出した。地域の農業・観光業のDXを支援し、地方経済の底上げに貢献。若者のUターン就職にもつながる取り組みを続けている。',
    tags: JSON.stringify(['IT', '地方創生', '起業家']),
    totalSupportPoints: 980,
    supportCount: 64,
  },
  {
    countryCode: 'JP', category: 'company', name: '株式会社あおぞら工業',
    slug: 'jp-aozora-kogyo',
    shortDescription: '高精度な金属加工で日本のものづくりを支える中小企業',
    description: '創業50年を超える中小製造業。航空・医療・自動車分野向けの高精度部品を製造し、日本のものづくりの基盤を支えている。若手技術者の育成にも積極的で、技能継承への取り組みが評価されている。',
    tags: JSON.stringify(['製造業', 'ものづくり', '中小企業']),
    totalSupportPoints: 1560,
    supportCount: 102,
  },
  {
    countryCode: 'JP', category: 'company', name: '株式会社ひかり食品',
    slug: 'jp-hikari-foods',
    shortDescription: '地元農家と連携し、地産地消の食品を全国に届けるメーカー',
    description: '地域農家と直接契約し、無農薬・減農薬の農産物を使った加工食品を製造・販売。フードロス削減にも取り組み、地域の農業支援と持続可能な食品製造を両立させている。',
    tags: JSON.stringify(['食品', '地産地消', 'フードロス削減']),
    totalSupportPoints: 870,
    supportCount: 58,
  },
  {
    countryCode: 'JP', category: 'organization', name: '日本伝統文化継承の会',
    slug: 'jp-dentou-bunka-keisho',
    shortDescription: '日本の伝統芸能・工芸の継承と普及を目的とするNPO',
    description: '能・狂言・歌舞伎など日本の伝統芸能の次世代への継承と、外国人向けの文化体験プログラムを提供するNPO法人。全国の小中学校での出張公演も行い、子供たちへの伝統文化教育に貢献している。',
    tags: JSON.stringify(['NPO', '伝統芸能', '文化継承']),
    totalSupportPoints: 1100,
    supportCount: 73,
  },
  {
    countryCode: 'JP', category: 'organization', name: '子育て応援ネットワーク',
    slug: 'jp-kosodate-ouen-net',
    shortDescription: '全国の子育て家庭を支援するボランティア団体',
    description: '育児に悩む保護者へのオンライン相談、産後ケアサポート、パパ向け育児ワークショップなどを展開。地域コミュニティとの連携を強め、孤立しがちな子育て家庭に寄り添う活動を続けている。',
    tags: JSON.stringify(['子育て支援', 'ボランティア', 'コミュニティ']),
    totalSupportPoints: 930,
    supportCount: 61,
  },
  {
    countryCode: 'JP', category: 'organization', name: '障がい者就労支援センター「はたらく」',
    slug: 'jp-hataraku-center',
    shortDescription: '障がいのある方の就職・職場定着を支援する団体',
    description: '障がいのある方が能力を活かして働けるよう、職業訓練から就職活動、職場定着まで一貫支援。企業向けの障がい者雇用研修も実施し、インクルーシブな職場環境の普及に取り組んでいる。',
    tags: JSON.stringify(['就労支援', '障がい者', 'インクルーシブ']),
    totalSupportPoints: 750,
    supportCount: 49,
  },
  {
    countryCode: 'JP', category: 'project', name: '海ごみゼロプロジェクト',
    slug: 'jp-umi-gomi-zero',
    shortDescription: '全国の海岸清掃と海洋プラスチック削減を進める活動',
    description: '毎月全国30か所以上の海岸で清掃活動を実施。回収したごみのデータを分析し、政策提言や企業との連携による発生源対策も行っている。学校との連携プログラムを通じて若い世代への環境教育にも貢献。',
    tags: JSON.stringify(['環境', '海洋保全', 'ボランティア']),
    totalSupportPoints: 1380,
    supportCount: 92,
  },
  {
    countryCode: 'JP', category: 'project', name: '若者IT教育プロジェクト',
    slug: 'jp-wakamono-it-edu',
    shortDescription: '地方の子供たちにプログラミング・IT教育を届ける活動',
    description: '過疎地域や離島の小中学生を対象に、無償でプログラミング教室を開催。オンライン授業と現地出張授業を組み合わせ、都市部との教育格差の解消を目指している。3年間で延べ5,000名以上に教育を提供。',
    tags: JSON.stringify(['教育', 'IT', '地方創生', 'プログラミング']),
    totalSupportPoints: 1450,
    supportCount: 95,
  },
  {
    countryCode: 'JP', category: 'project', name: '空き家再生プロジェクト',
    slug: 'jp-akiya-saisei',
    shortDescription: '地方の空き家を活用し、移住・多拠点生活を支援する活動',
    description: '放置空き家のリノベーションと移住希望者のマッチングを行い、地方移住の促進と地域コミュニティの再生を目指す。カフェ・コワーキングスペースへの転用事例を全国に発信している。',
    tags: JSON.stringify(['地方創生', '移住', 'リノベーション']),
    totalSupportPoints: 820,
    supportCount: 55,
  },
  {
    countryCode: 'JP', category: 'project', name: '伝統工芸デジタルアーカイブ',
    slug: 'jp-crafts-digital-archive',
    shortDescription: '日本の伝統工芸品をデジタル技術で記録・保存・公開するプロジェクト',
    description: '廃絶の危機にある伝統工芸の技術と作品を3Dスキャン・高解像度映像で記録し、無償公開するデジタルアーカイブを構築。国内外の研究者や愛好家が学べる環境を整備している。',
    tags: JSON.stringify(['デジタル', '伝統工芸', '文化保存']),
    totalSupportPoints: 690,
    supportCount: 46,
  },
  {
    countryCode: 'JP', category: 'local', name: '桜の里まちおこし協議会',
    slug: 'jp-sakura-machi-okoshi',
    shortDescription: '桜の名所を活かした地域活性化に取り組む地域団体',
    description: '春の桜祭りを核に、地元産品の販売、農業体験ツーリズム、移住セミナーを組み合わせた通年型の地域活性化に取り組む。地域の若者と連携したSNS発信で観光客数が3年で倍増。',
    tags: JSON.stringify(['観光', '地域活性化', '農業体験']),
    totalSupportPoints: 760,
    supportCount: 51,
  },
  {
    countryCode: 'JP', category: 'local', name: '山村振興プロジェクト「みどりの里」',
    slug: 'jp-midori-no-sato',
    shortDescription: '過疎化する山間農村の農業・林業・生活を守る取り組み',
    description: '高齢化・人口減少が進む中山間地域で、農業支援員の派遣、林業の6次産業化、地域内外の交流促進を行う。関係人口の増加と農林業の担い手育成に実績を上げている。',
    tags: JSON.stringify(['農村振興', '農業', '林業', '地方創生']),
    totalSupportPoints: 580,
    supportCount: 38,
  },
  {
    countryCode: 'JP', category: 'product', name: '国産オーガニックブランド「つちのこ」',
    slug: 'jp-tsuchinoko-organic',
    shortDescription: '国内農家と連携したオーガニック認証農産物ブランド',
    description: '国内300軒以上の有機農家と契約し、安全・安心な農産物を消費者に直接届けるブランド。農家の所得向上と消費者への安全な食の提供を両立。フードロス削減への取り組みも注目されている。',
    tags: JSON.stringify(['オーガニック', '農業', 'フードロス削減']),
    totalSupportPoints: 1020,
    supportCount: 68,
  },
  {
    countryCode: 'JP', category: 'product', name: '日本語学習アプリ「まなぶ』',
    slug: 'jp-manabu-app',
    shortDescription: '外国人向けに日本語と日本文化を楽しく学べるアプリ',
    description: '世界150か国以上でダウンロードされる日本語学習アプリ。日本の文化・習慣・地域情報も学べるコンテンツで、日本へのインバウンド増加と相互理解促進に貢献している。',
    tags: JSON.stringify(['教育', 'アプリ', '日本語学習', 'インバウンド']),
    totalSupportPoints: 1190,
    supportCount: 79,
  },
];

const supports = [
  { entitySlug: 'jp-yamada-haruka', supporterName: '田中さん', points: 50, comment: '伝統工芸を世界に広めてくれていて、とても誇らしいです。若い職人さんの育成にも力を入れていて素晴らしい。', ipHash: 'hash1' },
  { entitySlug: 'jp-yamada-haruka', supporterName: '佐藤', points: 30, comment: '海外でのワークショップの様子をSNSで見て感動しました。日本文化の大切な担い手だと思います。', ipHash: 'hash2' },
  { entitySlug: 'jp-aozora-kogyo', supporterName: '工業関係者', points: 80, comment: '日本のものづくりの底力を支えている会社だと思います。高精度な技術が誇りです。', ipHash: 'hash3' },
  { entitySlug: 'jp-umi-gomi-zero', supporterName: null, points: 100, comment: '毎年海岸清掃のボランティアに参加しています。データに基づいた政策提言も素晴らしい取り組みです。', ipHash: 'hash4' },
  { entitySlug: 'jp-wakamono-it-edu', supporterName: '元教師', points: 70, comment: '地方の子供たちへの教育機会の提供は本当に重要です。格差をなくすためのこの活動を応援しています。', ipHash: 'hash5' },
  { entitySlug: 'jp-manabu-app', supporterName: '海外在住の日本人', points: 60, comment: '海外の友人たちが使ってくれています。日本語と文化を楽しく学べて、日本への関心を高めてくれています。', ipHash: 'hash6' },
];

async function main() {
  console.log('Seeding database...');

  for (const e of entities) {
    await prisma.entity.upsert({
      where: { countryCode_slug: { countryCode: e.countryCode, slug: e.slug } },
      update: {},
      create: e,
    });
  }

  for (const s of supports) {
    const entity = await prisma.entity.findUnique({
      where: { countryCode_slug: { countryCode: 'JP', slug: s.entitySlug } },
    });
    if (!entity) continue;
    await prisma.support.create({
      data: {
        entityId: entity.id,
        countryCode: 'JP',
        supporterName: s.supporterName,
        points: s.points,
        comment: s.comment,
        ipHash: s.ipHash,
        status: 'visible',
      },
    });
  }

  console.log('Seeding complete.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
```

- [ ] **Step 2: Add seed script to package.json**

In `package.json`, add inside the root JSON object:
```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

- [ ] **Step 3: Run seed**

```bash
npx prisma db seed
```
Expected: "Seeding complete."

- [ ] **Step 4: Commit**

```bash
git add prisma/seed.ts package.json
git commit -m "feat: add seed data with 15 JP entities and sample supports"
```

---

### Task 5: Global layout and shared components (Header, Footer)

**Files:**
- Modify: `app/layout.tsx`, `app/globals.css`
- Create: `components/Header.tsx`, `components/Footer.tsx`

- [ ] **Step 1: Update app/globals.css**

Replace contents with:
```css
@import "tailwindcss";

:root {
  --color-primary: #c0392b;
  --color-primary-light: #e74c3c;
  --color-navy: #1a2a4a;
  --color-gold: #b8860b;
}

body {
  font-family: 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'Meiryo', sans-serif;
}
```

- [ ] **Step 2: Update app/layout.tsx**

```typescript
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: { template: '%s | 日本応援ランキング', default: '日本応援ランキング | My Country Support Rank' },
  description: '日本を支える人・企業・団体を、応援ポイントで可視化するランキングサイト。批判ではなく応援を集めるポジティブなランキングサービスです。',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 text-gray-900 min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Create components/Header.tsx**

```typescript
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/jp" className="flex items-center gap-2">
          <span className="text-2xl">🇯🇵</span>
          <div>
            <div className="font-bold text-sm text-red-700 leading-tight">日本応援ランキング</div>
            <div className="text-xs text-gray-500 leading-tight">My Country Support Rank</div>
          </div>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/jp/rankings" className="text-gray-600 hover:text-red-700 transition-colors hidden sm:block">ランキング</Link>
          <Link href="/jp/categories" className="text-gray-600 hover:text-red-700 transition-colors hidden sm:block">カテゴリ</Link>
          <Link href="/jp/about" className="text-gray-600 hover:text-red-700 transition-colors hidden sm:block">このサイトについて</Link>
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Create components/Footer.tsx**

```typescript
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-800 text-gray-300 mt-auto py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6">
          <div>
            <div className="font-bold text-white mb-2 text-sm">日本応援ランキング</div>
            <p className="text-xs text-gray-400">日本に貢献する人・企業・団体を応援で可視化するサービスです。</p>
          </div>
          <div>
            <div className="font-semibold text-sm text-white mb-2">ランキング</div>
            <ul className="space-y-1 text-xs">
              <li><Link href="/jp/rankings" className="hover:text-white transition-colors">総合ランキング</Link></li>
              <li><Link href="/jp/categories/person" className="hover:text-white transition-colors">人物</Link></li>
              <li><Link href="/jp/categories/company" className="hover:text-white transition-colors">企業</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-sm text-white mb-2">サービス情報</div>
            <ul className="space-y-1 text-xs">
              <li><Link href="/jp/about" className="hover:text-white transition-colors">このサイトについて</Link></li>
              <li><Link href="/jp/rules" className="hover:text-white transition-colors">投稿・応援ルール</Link></li>
              <li><Link href="/jp/contact" className="hover:text-white transition-colors">お問い合わせ</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-sm text-white mb-2">その他</div>
            <ul className="space-y-1 text-xs">
              <li><span className="text-gray-500">© 2026 My Country Support Rank</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-600 pt-4 text-xs text-gray-500 text-center">
          このサービスは批判・告発を目的としません。ポジティブな応援・称賛に特化したランキングサービスです。
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add app/ components/Header.tsx components/Footer.tsx
git commit -m "feat: add root layout, global styles, Header and Footer components"
```

---

### Task 6: RankingCard and CategoryTabs components

**Files:**
- Create: `components/RankingCard.tsx`, `components/CategoryTabs.tsx`

- [ ] **Step 1: Create components/RankingCard.tsx**

```typescript
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
}

export default function RankingCard({
  rank, name, slug, category, shortDescription,
  totalSupportPoints, supportCount, countryCode = 'jp', periodPoints,
}: RankingCardProps) {
  const rankColor = rank === 1 ? 'text-yellow-500' : rank === 2 ? 'text-gray-400' : rank === 3 ? 'text-amber-600' : 'text-gray-500';
  const points = periodPoints !== undefined ? periodPoints : totalSupportPoints;

  return (
    <Link
      href={`/${countryCode}/entities/${slug}`}
      className="block bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-red-100 transition-all p-4"
    >
      <div className="flex items-start gap-3">
        <div className={`text-2xl font-black w-10 text-center shrink-0 ${rankColor}`}>
          {rank <= 3 ? ['🥇','🥈','🥉'][rank - 1] : `#${rank}`}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full border border-red-100">
              {getCategoryEmoji(category)} {getCategoryLabel(category)}
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

- [ ] **Step 2: Create components/CategoryTabs.tsx**

`queryParam` prop が指定されたときは `?{queryParam}=id` 形式のリンクを生成し、そうでない場合はパスベース (`/jp/categories/person`) にする。

```typescript
import Link from 'next/link';
import { CATEGORIES, FEATURED_CATEGORIES } from '@/lib/categories';

interface CategoryTabsProps {
  countryCode?: string;
  showAll?: boolean;
  activeCategory?: string;
  basePath?: string;
  queryParam?: string;
  extraQuery?: string;
}

export default function CategoryTabs({
  countryCode = 'jp',
  showAll = false,
  activeCategory = 'all',
  basePath,
  queryParam,
  extraQuery = '',
}: CategoryTabsProps) {
  const cats = showAll ? CATEGORIES : FEATURED_CATEGORIES;
  const base = basePath ?? `/${countryCode}/categories`;

  function href(id: string) {
    if (queryParam) {
      const params = new URLSearchParams({ [queryParam]: id });
      if (extraQuery) params.set(...(extraQuery.split('=') as [string, string]));
      return `${base}?${params.toString()}`;
    }
    if (id === 'all') return `/${countryCode}/rankings`;
    return `${base}/${id}`;
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      <Link
        href={queryParam ? href('all') : `/${countryCode}/rankings`}
        className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
          activeCategory === 'all'
            ? 'bg-red-600 text-white'
            : 'bg-white text-gray-600 border border-gray-200 hover:border-red-300'
        }`}
      >
        すべて
      </Link>
      {cats.map(cat => (
        <Link
          key={cat.id}
          href={href(cat.id)}
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

- [ ] **Step 3: Commit**

```bash
git add components/RankingCard.tsx components/CategoryTabs.tsx
git commit -m "feat: add RankingCard and CategoryTabs components"
```

---

### Task 7: SupportForm, CommentList, ReportButton components

**Files:**
- Create: `components/SupportForm.tsx`, `components/CommentList.tsx`, `components/ReportButton.tsx`

- [ ] **Step 1: Create components/SupportForm.tsx**

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SupportFormProps {
  entityId: string;
  entityName: string;
}

export default function SupportForm({ entityId, entityName }: SupportFormProps) {
  const router = useRouter();
  const [points, setPoints] = useState(10);
  const [supporterName, setSupporterName] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityId, points, supporterName, comment }),
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
        <p className="font-bold text-green-800">応援ポイントを送りました！</p>
        <p className="text-sm text-green-600 mt-1">{entityName}への応援が反映されました。</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <h3 className="font-bold text-lg text-gray-900">🌟 応援する</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          応援ポイント: <span className="text-red-600 font-bold">{points}pt</span>
        </label>
        <input
          type="range" min={1} max={100} value={points}
          onChange={e => setPoints(Number(e.target.value))}
          className="w-full accent-red-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>1pt</span><span>50pt</span><span>100pt</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          応援理由 <span className="text-red-500">*</span>
          <span className="text-xs text-gray-400 ml-1">（10〜500文字）</span>
        </label>
        <textarea
          value={comment} onChange={e => setComment(e.target.value)}
          placeholder="なぜ応援したいのか、具体的に教えてください。"
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
          required
        />
        <div className="text-xs text-gray-400 text-right">{comment.length}/500</div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          応援者名 <span className="text-xs text-gray-400">（任意）</span>
        </label>
        <input
          type="text" value={supporterName} onChange={e => setSupporterName(e.target.value)}
          placeholder="匿名でも送れます"
          maxLength={50}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
        />
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

      <button
        type="submit" disabled={loading}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
      >
        {loading ? '送信中...' : `${points}pt 応援する`}
      </button>
      <p className="text-xs text-gray-400 text-center">
        応援はポジティブな内容に限ります。誹謗中傷は投稿できません。
      </p>
    </form>
  );
}
```

- [ ] **Step 2: Create components/CommentList.tsx**

```typescript
import ReportButton from './ReportButton';

interface Comment {
  id: string;
  supporterName: string | null;
  points: number;
  comment: string;
  createdAt: Date | string;
}

interface CommentListProps {
  comments: Comment[];
}

export default function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        まだ応援コメントがありません。最初に応援してみましょう！
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map(c => (
        <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm text-gray-800">
                  {c.supporterName ?? '匿名の応援者'}
                </span>
                <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">
                  {c.points}pt
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(c.createdAt).toLocaleDateString('ja-JP')}
                </span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{c.comment}</p>
            </div>
            <ReportButton targetType="support" targetId={c.id} />
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create components/ReportButton.tsx**

```typescript
'use client';

import { useState } from 'react';

const REPORT_REASONS = ['誹謗中傷', '個人情報', '不適切な表現', 'スパム', 'その他'];

interface ReportButtonProps {
  targetType: 'entity' | 'support';
  targetId: string;
}

export default function ReportButton({ targetType, targetId }: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [detail, setDetail] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!reason) return;
    setLoading(true);
    await fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetType, targetId, reason, detail }),
    });
    setLoading(false);
    setDone(true);
  }

  if (done) return <span className="text-xs text-gray-400">通報済み</span>;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-gray-400 hover:text-red-500 transition-colors shrink-0"
        title="通報する"
      >
        通報
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-bold text-gray-900 mb-4">通報する</h3>
            <div className="space-y-2 mb-4">
              {REPORT_REASONS.map(r => (
                <label key={r} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio" name="reason" value={r}
                    checked={reason === r} onChange={() => setReason(r)}
                    className="accent-red-600"
                  />
                  <span className="text-sm">{r}</span>
                </label>
              ))}
            </div>
            <textarea
              value={detail} onChange={e => setDetail(e.target.value)}
              placeholder="詳細（任意）"
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 border border-gray-300 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50"
              >キャンセル</button>
              <button
                onClick={submit} disabled={!reason || loading}
                className="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50"
              >送信</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/SupportForm.tsx components/CommentList.tsx components/ReportButton.tsx
git commit -m "feat: add SupportForm, CommentList, ReportButton interactive components"
```

---

### Task 8: API routes (support submission and reporting)

**Files:**
- Create: `app/api/support/route.ts`, `app/api/report/route.ts`

- [ ] **Step 1: Create app/api/support/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { prisma } from '@/lib/prisma';
import { validateSupport } from '@/lib/validation';

const RATE_LIMIT_MINUTES = 30;

function hashIp(ip: string): string {
  return createHash('sha256').update(ip + process.env.ADMIN_PASSWORD).digest('hex').slice(0, 16);
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1';
  const ipHash = hashIp(ip);

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: '不正なリクエストです' }, { status: 400 });

  const validation = validateSupport(body);
  if (!validation.valid) return NextResponse.json({ error: validation.error }, { status: 400 });

  const { entityId, points, supporterName, comment } = body as {
    entityId: string; points: number; supporterName?: string; comment: string;
  };

  const entity = await prisma.entity.findUnique({ where: { id: entityId } });
  if (!entity || entity.status !== 'active') {
    return NextResponse.json({ error: '対象が見つかりません' }, { status: 404 });
  }

  const since = new Date(Date.now() - RATE_LIMIT_MINUTES * 60 * 1000);
  const recentCount = await prisma.rateLimitRecord.count({
    where: { ipHash, entityId, createdAt: { gte: since } },
  });
  if (recentCount >= 3) {
    return NextResponse.json({ error: `同じ対象への応援は${RATE_LIMIT_MINUTES}分間に3回までです` }, { status: 429 });
  }

  await prisma.$transaction([
    prisma.support.create({
      data: {
        entityId, countryCode: entity.countryCode,
        supporterName: supporterName || null,
        points, comment, ipHash, status: 'visible',
      },
    }),
    prisma.entity.update({
      where: { id: entityId },
      data: {
        totalSupportPoints: { increment: points },
        supportCount: { increment: 1 },
      },
    }),
    prisma.rateLimitRecord.create({ data: { ipHash, entityId } }),
  ]);

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Create app/api/report/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const VALID_REASONS = ['誹謗中傷', '個人情報', '不適切な表現', 'スパム', 'その他'];

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: '不正なリクエストです' }, { status: 400 });

  const { targetType, targetId, reason, detail } = body as {
    targetType: string; targetId: string; reason: string; detail?: string;
  };

  if (!['entity', 'support'].includes(targetType)) {
    return NextResponse.json({ error: '不正な通報タイプです' }, { status: 400 });
  }
  if (!VALID_REASONS.includes(reason)) {
    return NextResponse.json({ error: '通報理由を選択してください' }, { status: 400 });
  }

  await prisma.report.create({
    data: { targetType, targetId, reason, detail: detail ?? null, status: 'open' },
  });

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/
git commit -m "feat: add support submission and report API routes with rate limiting"
```

---

### Task 9: Root page and /jp top page

**Files:**
- Modify: `app/page.tsx`
- Create: `app/jp/layout.tsx`, `app/jp/page.tsx`

- [ ] **Step 1: Update app/page.tsx (redirect to /jp)**

```typescript
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/jp');
}
```

- [ ] **Step 2: Create app/jp/layout.tsx**

```typescript
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
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 3: Create app/jp/page.tsx**

```typescript
import Link from 'next/link';
import type { Metadata } from 'next';
import { getRankings } from '@/lib/rankings';
import { FEATURED_CATEGORIES } from '@/lib/categories';
import RankingCard from '@/components/RankingCard';

export const metadata: Metadata = {
  title: '日本応援ランキング | My Country Support Rank',
  description: '日本を支える人・企業・団体を、応援ポイントで可視化するランキングサイト。批判ではなく応援を集めるポジティブなランキングサービスです。',
};

export const revalidate = 60;

export default async function JpTopPage() {
  const topEntities = await getRankings({ countryCode: 'JP', limit: 10 });

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-red-700 via-red-600 to-red-800 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-5xl mb-4">🇯🇵</div>
          <h1 className="text-3xl sm:text-4xl font-black mb-3 leading-tight">日本応援ランキング</h1>
          <p className="text-sm text-red-100 mb-1 font-medium tracking-widest uppercase">My Country Support Rank</p>
          <p className="text-base sm:text-lg text-red-100 mt-4 mb-8 leading-relaxed">
            日本を支える人・企業・団体を、<br className="sm:hidden" />みんなの応援で可視化する。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/jp/rankings" className="bg-white text-red-700 font-bold px-8 py-3 rounded-full hover:bg-red-50 transition-colors shadow-lg">
              ランキングを見る
            </Link>
            <Link href="/jp/categories" className="bg-red-900/50 text-white font-bold px-8 py-3 rounded-full hover:bg-red-900/70 transition-colors border border-red-400">
              応援対象を探す
            </Link>
          </div>
        </div>
      </section>

      {/* Top Rankings */}
      <section className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900">🏆 総合ランキング TOP10</h2>
          <Link href="/jp/rankings" className="text-sm text-red-600 hover:text-red-800 font-medium">もっと見る →</Link>
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
            />
          ))}
        </div>
      </section>

      {/* Category Grid */}
      <section className="bg-gray-100 py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-5 text-center">カテゴリ別ランキング</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {FEATURED_CATEGORIES.map(cat => (
              <Link
                key={cat.id}
                href={`/jp/categories/${cat.id}`}
                className="bg-white rounded-xl p-4 text-center hover:shadow-md hover:border-red-200 border border-transparent transition-all"
              >
                <div className="text-3xl mb-2">{cat.emoji}</div>
                <div className="font-bold text-sm text-gray-800">{cat.label}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
          <h2 className="font-bold text-lg text-gray-900 mb-3">🌸 このサイトについて</h2>
          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            日本応援ランキングは、批判ではなく<strong>応援を集める</strong>ランキングです。
            日本に貢献していると思う人・会社・活動を、応援ポイントと理由で可視化します。
          </p>
          <div className="bg-white rounded-xl p-4 border border-red-100">
            <div className="text-sm font-semibold text-gray-800 mb-1">🛡️ 安全な運営方針</div>
            <p className="text-xs text-gray-600">誹謗中傷や攻撃的な投稿は禁止しています。投稿内容は必要に応じて管理者が確認・非表示にします。</p>
          </div>
          <Link href="/jp/about" className="inline-block mt-4 text-sm text-red-600 hover:text-red-800 font-medium">詳しく読む →</Link>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx app/jp/
git commit -m "feat: add root redirect, JP layout, and JP top page with hero and rankings"
```

---

### Task 10: Rankings page and Categories pages

**Files:**
- Create: `app/jp/rankings/page.tsx`, `app/jp/categories/page.tsx`, `app/jp/categories/[category]/page.tsx`

- [ ] **Step 1: Create app/jp/rankings/page.tsx**

```typescript
import type { Metadata } from 'next';
import { getRankings } from '@/lib/rankings';
import RankingCard from '@/components/RankingCard';
import CategoryTabs from '@/components/CategoryTabs';

export const metadata: Metadata = {
  title: '総合ランキング',
  description: '日本に貢献している人物・企業・団体・プロジェクトの総合ランキング。',
};

export const revalidate = 60;

export default async function RankingsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; category?: string }>;
}) {
  const params = await searchParams;
  const period = (params.period as 'all' | 'monthly' | 'weekly') ?? 'all';
  const category = params.category ?? 'all';

  const entities = await getRankings({ countryCode: 'JP', period, category: category === 'all' ? undefined : category, limit: 50 });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-gray-900 mb-6">🏆 ランキング</h1>

      <div className="mb-4">
        <CategoryTabs
          countryCode="jp"
          activeCategory={category}
          basePath="/jp/rankings"
          queryParam="category"
          extraQuery={`period=${period}`}
        />
      </div>

      {/* Period tabs */}
      <div className="flex gap-2 mb-6">
        {([['all', '総合'], ['monthly', '月間'], ['weekly', '週間']] as const).map(([val, label]) => (
          <a
            key={val}
            href={`/jp/rankings?period=${val}&category=${category}`}
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
          <p className="text-center text-gray-400 py-12">該当するランキングデータがありません</p>
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
              periodPoints={'periodPoints' in e ? e.periodPoints as number : undefined}
            />
          ))
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create app/jp/categories/page.tsx**

```typescript
import Link from 'next/link';
import type { Metadata } from 'next';
import { CATEGORIES } from '@/lib/categories';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'カテゴリ一覧',
  description: '人物・企業・団体・プロジェクトなどカテゴリ別にランキングを見る。',
};

export const revalidate = 300;

export default async function CategoriesPage() {
  const counts = await prisma.entity.groupBy({
    by: ['category'],
    where: { countryCode: 'JP', status: 'active' },
    _count: { _all: true },
  });
  const countMap = Object.fromEntries(counts.map(c => [c.category, c._count._all]));

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-gray-900 mb-6">カテゴリ一覧</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {CATEGORIES.map(cat => (
          <Link
            key={cat.id}
            href={`/jp/categories/${cat.id}`}
            className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md hover:border-red-200 transition-all text-center"
          >
            <div className="text-4xl mb-2">{cat.emoji}</div>
            <div className="font-bold text-gray-900 text-sm">{cat.label}</div>
            <div className="text-xs text-gray-400 mt-1">{countMap[cat.id] ?? 0}件</div>
            {!cat.featured && (
              <div className="text-xs text-gray-300 mt-1">準備中</div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create app/jp/categories/[category]/page.tsx**

```typescript
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getRankings } from '@/lib/rankings';
import { getCategoryLabel, getCategoryEmoji, CATEGORIES } from '@/lib/categories';
import RankingCard from '@/components/RankingCard';

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const label = getCategoryLabel(category);
  return {
    title: `${label}ランキング`,
    description: `日本の${label}を応援ポイントでランキング表示。`,
  };
}

export const revalidate = 60;

export default async function CategoryRankingPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const validIds = CATEGORIES.map(c => c.id as string);
  if (!validIds.includes(category)) notFound();

  const entities = await getRankings({ countryCode: 'JP', category, limit: 50 });
  const label = getCategoryLabel(category);
  const emoji = getCategoryEmoji(category);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-3xl">{emoji}</span>
        <h1 className="text-2xl font-black text-gray-900">{label}ランキング</h1>
      </div>

      <div className="space-y-3">
        {entities.length === 0 ? (
          <p className="text-center text-gray-400 py-12">このカテゴリにはまだ掲載がありません</p>
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
            />
          ))
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add app/jp/rankings/ app/jp/categories/
git commit -m "feat: add rankings page and category pages with period/category filtering"
```

---

### Task 11: Individual entity page

**Files:**
- Create: `app/jp/entities/[slug]/page.tsx`

- [ ] **Step 1: Create app/jp/entities/[slug]/page.tsx**

```typescript
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getEntityBySlug, getEntityRank } from '@/lib/rankings';
import { getCategoryLabel, getCategoryEmoji } from '@/lib/categories';
import { prisma } from '@/lib/prisma';
import SupportForm from '@/components/SupportForm';
import CommentList from '@/components/CommentList';
import ReportButton from '@/components/ReportButton';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const entity = await getEntityBySlug('JP', slug);
  if (!entity) return { title: '404' };
  return {
    title: `${entity.name}を応援する`,
    description: `${entity.name}への応援ポイント・応援理由を掲載。日本に貢献する${getCategoryLabel(entity.category)}をみんなで応援するランキングサイト。`,
    openGraph: {
      title: `${entity.name}を応援する | 日本応援ランキング`,
      description: entity.shortDescription,
    },
  };
}

export const revalidate = 60;

export default async function EntityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entity = await getEntityBySlug('JP', slug);
  if (!entity || entity.status !== 'active') notFound();

  const rank = await getEntityRank(entity.id, 'JP');
  const supports = await prisma.support.findMany({
    where: { entityId: entity.id, status: 'visible' },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: entity.name,
    description: entity.description,
    url: entity.officialUrl ?? undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full border border-red-100">
                  {getCategoryEmoji(entity.category)} {getCategoryLabel(entity.category)}
                </span>
                <span className="text-xs text-gray-400">ランキング #{rank}</span>
              </div>
              <h1 className="text-2xl font-black text-gray-900 mb-1">{entity.name}</h1>
              <p className="text-sm text-gray-500">{entity.shortDescription}</p>
            </div>
            <ReportButton targetType="entity" targetId={entity.id} />
          </div>

          <div className="flex gap-6 mt-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-black text-red-600">{entity.totalSupportPoints.toLocaleString()}</div>
              <div className="text-xs text-gray-500">応援ポイント</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-gray-700">{entity.supportCount}</div>
              <div className="text-xs text-gray-500">応援件数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-gray-700">#{rank}</div>
              <div className="text-xs text-gray-500">順位</div>
            </div>
          </div>

          {entity.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {entity.tags.map((tag: string) => (
                <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">#{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="font-bold text-gray-900 mb-3">このエントリーについて</h2>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{entity.description}</p>
          {entity.officialUrl && (
            <a
              href={entity.officialUrl}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-3 text-sm text-blue-600 hover:text-blue-800"
            >
              🔗 公式サイト
            </a>
          )}
        </div>

        {/* Support form */}
        <div className="mb-6">
          <SupportForm entityId={entity.id} entityName={entity.name} />
        </div>

        {/* Comments */}
        <div>
          <h2 className="font-bold text-gray-900 mb-4">💬 応援コメント（{supports.length}件）</h2>
          <CommentList comments={supports} />
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/jp/entities/
git commit -m "feat: add individual entity page with stats, support form, comments, and JSON-LD"
```

---

### Task 12: Static content pages (About, Rules, Contact)

**Files:**
- Create: `app/jp/about/page.tsx`, `app/jp/rules/page.tsx`, `app/jp/contact/page.tsx`

- [ ] **Step 1: Create app/jp/about/page.tsx**

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'このサイトについて',
  description: '日本応援ランキングのサービス説明。批判ではなく応援を集めるポジティブランキングサービスです。',
};

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-black text-gray-900 mb-6">🌸 このサイトについて</h1>
      <div className="prose prose-sm max-w-none space-y-6 text-gray-700 leading-relaxed">
        <section className="bg-red-50 rounded-2xl p-6 border border-red-100">
          <h2 className="font-bold text-gray-900 text-lg mb-2">日本応援ランキングとは</h2>
          <p>
            日本応援ランキング（My Country Support Rank）は、日本に貢献している人物・企業・団体・プロジェクトを、
            ユーザーの応援ポイントによって可視化するランキングサービスです。
          </p>
        </section>
        <section>
          <h2 className="font-bold text-gray-900 text-lg mb-2">このサービスの目的</h2>
          <ul className="list-disc pl-4 space-y-2 text-sm">
            <li>日本の社会・文化・経済に貢献している存在を「見えるかたち」にする</li>
            <li>応援したい気持ちを「ポイント」と「言葉」で表現できる場を提供する</li>
            <li>批判・告発ではなく、ポジティブな「推し活」「応援」に特化する</li>
          </ul>
        </section>
        <section>
          <h2 className="font-bold text-gray-900 text-lg mb-2">大切にしていること</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2 text-sm">
            <p>✅ 応援・称賛・支援に限定したポジティブなランキング</p>
            <p>✅ ネガティブランキング・反対票・有害評価は実装しない</p>
            <p>✅ 誹謗中傷・差別的表現は禁止し、管理者が対応</p>
            <p>✅ 実在人物・企業は中立・事実ベース・ポジティブな説明のみ</p>
          </div>
        </section>
        <section>
          <h2 className="font-bold text-gray-900 text-lg mb-2">将来のビジョン</h2>
          <p className="text-sm">
            現在は日本版のみを公開していますが、将来的には世界各国版、さらには「世界版グローバルランキング」への
            拡張を目指しています。世界中の人々が自国の誇りを称え合えるサービスを目指します。
          </p>
        </section>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create app/jp/rules/page.tsx**

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '投稿・応援ルール',
  description: '日本応援ランキングの投稿・応援に関するルールを説明します。',
};

export default function RulesPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-black text-gray-900 mb-6">📋 投稿・応援ルール</h1>
      <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
        <section className="bg-yellow-50 rounded-2xl p-5 border border-yellow-200">
          <h2 className="font-bold text-gray-900 mb-2">基本方針</h2>
          <p>このサイトは<strong>応援・称賛を目的としたサービス</strong>です。批判・告発・マイナス評価サイトではありません。</p>
        </section>
        <section>
          <h2 className="font-bold text-gray-900 text-base mb-3">禁止事項</h2>
          <ul className="space-y-2">
            {[
              '誹謗中傷・名誉毀損・侮辱的な表現',
              '根拠のない犯罪・不正の断定',
              '差別的・暴力的・性的な表現',
              '個人情報の投稿（住所・電話番号・メールアドレス等）',
              '反対運動・不買運動の呼びかけ',
              '特定の政治的主張の強制',
              'スパム・広告・宣伝目的の投稿',
              '事実に反する虚偽の情報',
            ].map(item => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5 shrink-0">✗</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="font-bold text-gray-900 text-base mb-3">ランキングについて</h2>
          <p>
            ランキングはユーザーの応援ポイントに基づくものであり、<strong>客観的な優劣や公的評価を示すものではありません</strong>。
            掲載内容は管理者判断で非表示・削除される場合があります。
          </p>
        </section>
        <section>
          <h2 className="font-bold text-gray-900 text-base mb-3">違反への対応</h2>
          <p>
            禁止事項に違反した投稿は、管理者の判断で非表示・削除されます。
            問題のある投稿を見つけた場合は、各コメントの「通報」ボタンをご利用ください。
          </p>
        </section>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create app/jp/contact/page.tsx**

```typescript
'use client';

import { useState } from 'react';

const CONTACT_TYPES = ['掲載内容について', '通報・削除依頼', '応援対象の追加依頼', 'その他'];

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [type, setType] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-black text-gray-900 mb-2">お問い合わせ</h1>
      <p className="text-sm text-gray-500 mb-6">通報・削除依頼・掲載内容のご連絡はこちらから。</p>

      {sent ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <div className="text-3xl mb-2">✅</div>
          <p className="font-bold text-green-800">お問い合わせを受け付けました</p>
          <p className="text-sm text-green-600 mt-1">内容を確認の上、必要に応じてご連絡いたします。</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-2xl border border-gray-200 p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">お名前</label>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">お問い合わせ種別</label>
            <select
              value={type} onChange={e => setType(e.target.value)}
              required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
            >
              <option value="">選択してください</option>
              {CONTACT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">内容</label>
            <textarea
              value={message} onChange={e => setMessage(e.target.value)}
              rows={5} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-colors"
          >
            送信する
          </button>
        </form>
      )}
    </div>
  );
}
```

Add metadata export before the component in contact/page.tsx:
```typescript
// Add at top of file before 'use client' - NOT possible with use client
// Instead, create a separate metadata.ts or use a server wrapper
```

Actually for contact page with `'use client'`, create a wrapper:

Replace `app/jp/contact/page.tsx` with:
```typescript
import type { Metadata } from 'next';
import ContactForm from './ContactForm';

export const metadata: Metadata = {
  title: 'お問い合わせ',
  description: '掲載内容のご連絡・削除依頼・応援対象の追加依頼はこちらから。',
};

export default function ContactPage() {
  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-black text-gray-900 mb-2">お問い合わせ</h1>
      <p className="text-sm text-gray-500 mb-6">通報・削除依頼・掲載内容のご連絡はこちらから。</p>
      <ContactForm />
    </div>
  );
}
```

Create `app/jp/contact/ContactForm.tsx`:
```typescript
'use client';

import { useState } from 'react';

const CONTACT_TYPES = ['掲載内容について', '通報・削除依頼', '応援対象の追加依頼', 'その他'];

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [type, setType] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  if (sent) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <div className="text-3xl mb-2">✅</div>
        <p className="font-bold text-green-800">お問い合わせを受け付けました</p>
        <p className="text-sm text-green-600 mt-1">内容を確認の上、必要に応じてご連絡いたします。</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-2xl border border-gray-200 p-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">お名前</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">お問い合わせ種別</label>
        <select value={type} onChange={e => setType(e.target.value)} required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300">
          <option value="">選択してください</option>
          {CONTACT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">内容</label>
        <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
      </div>
      <button type="submit" className="w-full bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-colors">
        送信する
      </button>
    </form>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add app/jp/about/ app/jp/rules/ app/jp/contact/
git commit -m "feat: add about, rules, and contact pages"
```

---

### Task 13: Admin panel

**Files:**
- Create: `middleware.ts`, `app/admin/layout.tsx`, `app/admin/page.tsx`
- Create: `app/api/admin/entities/route.ts`, `app/api/admin/supports/route.ts`

- [ ] **Step 1: Create middleware.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_ADMIN_PATHS = ['/admin/login', '/api/admin/login'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_ADMIN_PATHS.some(p => pathname === p)) return NextResponse.next();

  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const token = req.cookies.get('admin_token')?.value;
    const expected = Buffer.from(process.env.ADMIN_PASSWORD ?? 'admin1234').toString('base64');
    if (token !== expected) {
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const url = req.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*', '/api/admin/:path*'] };
```

- [ ] **Step 2: Create app/admin/login/page.tsx**

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push('/admin');
      router.refresh();
    } else {
      setError('パスワードが違います');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-lg w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold text-gray-900 text-center">管理者ログイン</h1>
        <input
          type="password" value={password} onChange={e => setPassword(e.target.value)}
          placeholder="パスワード" required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="w-full bg-red-600 text-white font-bold py-2.5 rounded-lg">ログイン</button>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Create app/api/admin/login/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const expected = process.env.ADMIN_PASSWORD ?? 'admin1234';
  if (password !== expected) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }
  const token = Buffer.from(expected).toString('base64');
  const res = NextResponse.json({ ok: true });
  res.cookies.set('admin_token', token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 });
  return res;
}
```

- [ ] **Step 4: Create app/admin/layout.tsx**

```typescript
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-slate-800 text-white py-3 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="font-bold">🛠️ 管理画面 | 日本応援ランキング</span>
          <a href="/jp" className="text-sm text-gray-400 hover:text-white">サイトに戻る</a>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
```

- [ ] **Step 5: Create app/admin/page.tsx**

```typescript
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCategoryLabel } from '@/lib/categories';

export const dynamic = 'force-dynamic';

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const tab = params.tab ?? 'entities';

  const [entities, pendingSupports, openReports] = await Promise.all([
    prisma.entity.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
    prisma.support.findMany({
      where: { status: 'visible' }, orderBy: { createdAt: 'desc' }, take: 50,
      include: { entity: { select: { name: true } } },
    }),
    prisma.report.findMany({ where: { status: 'open' }, orderBy: { createdAt: 'desc' }, take: 50 }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">管理ダッシュボード</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: '掲載件数', value: entities.length },
          { label: '応援コメント', value: pendingSupports.length },
          { label: '未対応通報', value: openReports.length },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl font-black text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[['entities', '掲載管理'], ['supports', 'コメント管理'], ['reports', '通報一覧']].map(([t, l]) => (
          <Link key={t} href={`/admin?tab=${t}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === t ? 'bg-slate-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
            {l}
          </Link>
        ))}
      </div>

      {tab === 'entities' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">名前</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">カテゴリ</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">ポイント</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">ステータス</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {entities.map(e => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/jp/entities/${e.slug}`} className="font-medium text-blue-600 hover:underline">{e.name}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{getCategoryLabel(e.category)}</td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{e.totalSupportPoints.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${e.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <form action={`/api/admin/entities`} method="POST">
                      <input type="hidden" name="id" value={e.id} />
                      <input type="hidden" name="action" value={e.status === 'active' ? 'hide' : 'activate'} />
                      <button type="submit" className="text-xs text-red-600 hover:text-red-800">
                        {e.status === 'active' ? '非表示' : '表示'}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'supports' && (
        <div className="space-y-3">
          {pendingSupports.map(s => (
            <div key={s.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="text-xs text-gray-400 mb-1">
                    {s.entity.name} · {s.points}pt · {new Date(s.createdAt).toLocaleString('ja-JP')}
                  </div>
                  <p className="text-sm text-gray-700">{s.comment}</p>
                </div>
                <form action="/api/admin/supports" method="POST">
                  <input type="hidden" name="id" value={s.id} />
                  <input type="hidden" name="action" value="hide" />
                  <button type="submit" className="text-xs text-red-600 hover:text-red-800 whitespace-nowrap">非表示</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'reports' && (
        <div className="space-y-3">
          {openReports.map(r => (
            <div key={r.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="text-xs text-gray-400 mb-1">
                    {r.targetType} · {r.reason} · {new Date(r.createdAt).toLocaleString('ja-JP')}
                  </div>
                  {r.detail && <p className="text-sm text-gray-700">{r.detail}</p>}
                  <p className="text-xs text-gray-400 mt-1">対象ID: {r.targetId}</p>
                </div>
                <form action="/api/admin/reports" method="POST">
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="action" value="dismiss" />
                  <button type="submit" className="text-xs text-gray-500 hover:text-gray-700 whitespace-nowrap">対応済み</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Create app/api/admin/entities/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const body = await req.formData().catch(() => null) ?? await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Bad request' }, { status: 400 });

  const id = body instanceof FormData ? body.get('id') as string : body.id;
  const action = body instanceof FormData ? body.get('action') as string : body.action;

  if (!id || !['hide', 'activate'].includes(action)) {
    return NextResponse.json({ error: 'Invalid' }, { status: 400 });
  }

  await prisma.entity.update({
    where: { id },
    data: { status: action === 'hide' ? 'hidden' : 'active' },
  });

  if (body instanceof FormData) {
    return NextResponse.redirect(new URL('/admin?tab=entities', req.url));
  }
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 7: Create app/api/admin/supports/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const body = await req.formData().catch(() => null) ?? await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Bad request' }, { status: 400 });

  const id = body instanceof FormData ? body.get('id') as string : body.id;
  const action = body instanceof FormData ? body.get('action') as string : body.action;

  if (!id || action !== 'hide') {
    return NextResponse.json({ error: 'Invalid' }, { status: 400 });
  }

  const support = await prisma.support.findUnique({ where: { id } });
  if (!support) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.$transaction([
    prisma.support.update({ where: { id }, data: { status: 'hidden' } }),
    prisma.entity.update({
      where: { id: support.entityId },
      data: {
        totalSupportPoints: { decrement: support.points },
        supportCount: { decrement: 1 },
      },
    }),
  ]);

  if (body instanceof FormData) {
    return NextResponse.redirect(new URL('/admin?tab=supports', req.url));
  }
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 8: Create app/api/admin/reports/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const body = await req.formData().catch(() => null) ?? await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Bad request' }, { status: 400 });

  const id = body instanceof FormData ? body.get('id') as string : body.id;
  await prisma.report.update({ where: { id }, data: { status: 'dismissed' } });

  if (body instanceof FormData) {
    return NextResponse.redirect(new URL('/admin?tab=reports', req.url));
  }
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 9: Commit**

```bash
git add middleware.ts app/admin/ app/api/admin/
git commit -m "feat: add admin panel with login, entity/comment/report management"
```

---

### Task 14: Project CLAUDE.md

**Files:**
- Create: `CLAUDE.md`

- [ ] **Step 1: Create CLAUDE.md**

```markdown
# CLAUDE.md

このファイルは、nihon-ouen-ranking プロジェクト専用の Claude Code 作業ルールです。
グローバルの `C:\Users\pomme\CLAUDE.md` を共通ルールとして参照します。

## 1. プロジェクト概要

- プロジェクト名：日本応援ランキング（My Country Support Rank）
- 目的：日本に貢献する人物・企業・団体を応援ポイントで可視化するランキングサービス
- 対象ユーザー：日本の社会・文化・経済への貢献者を応援したい一般ユーザー
- 現在の開発段階：MVP開発中
- 重要コンセプト：批判・告発ではなく「応援・称賛」に特化。countryCodeベースで世界展開可能な設計。

## 2. 技術構成

- フレームワーク：Next.js 15 App Router
- 言語：TypeScript（strict）
- パッケージ管理：npm
- 主要ライブラリ：Prisma, Tailwind CSS
- ホスティング：未定（Vercel推奨）
- DB：SQLite（dev）→ PostgreSQL/Supabase/Neon（本番移行予定）
- 認証：管理者のみ、簡易cookie認証
- 決済：MVP未実装

## 3. ディレクトリ構成

- `app/` - Next.js App Router ページ
- `app/jp/` - 日本版ページ群
- `app/admin/` - 管理画面（要認証）
- `app/api/` - APIルート
- `components/` - 共有UIコンポーネント
- `lib/` - ユーティリティ（prisma, categories, rankings, validation）
- `prisma/` - スキーマ・シードデータ

## 4. 起動・確認コマンド

- 開発サーバー：`npm run dev`
- ビルド：`npm run build`
- 型チェック：`npx tsc --noEmit`
- DB初期化：`npx prisma migrate dev`
- シード実行：`npx prisma db seed`

## 5. 環境変数（キー名のみ）

- `DATABASE_URL` - SQLiteファイルパス（本番ではPostgreSQL URL）
- `ADMIN_PASSWORD` - 管理画面パスワード
- `NEXT_PUBLIC_SITE_URL` - サイトのベースURL

## 6. 主要機能

- ランキング表示（総合・カテゴリ別・期間別）
- 応援フォーム（ポイント+コメント、IPベースレート制限）
- 通報機能
- 管理画面（掲載・コメント・通報の管理）

## 7. データ構造

- Entity: 応援対象（countryCode, category, slug必須）
- Support: 応援ポイント+コメント（1回1〜100pt）
- Report: 通報データ
- RateLimitRecord: IPレート制限レコード

## 8. 開発上の注意点

- countryCodeは必ずJPで統一（将来の世界展開のため必ず保持）
- ネガティブランキング・反対票は実装禁止
- 応援ポイントの増減はトランザクションで行う（Entity.totalSupportPointsと同期）
- スマホ表示（375px）を優先して確認
- 管理者認証はmiddleware.tsで行う（admin/login路は認証不要）

## 9. 現在の未解決課題

- 問い合わせフォームの送信先未実装（MVP）
- ランキングの追加依頼フロー未実装
- 将来：有料ポイント・世界版・多言語化

## 11. 更新履歴

2026-05-24
- 初回作成（MVP実装開始）
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add project CLAUDE.md with technical specifications"
```

---

### Task 15: Build verification

- [ ] **Step 1: Run TypeScript type check**

```bash
npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 2: Run production build**

```bash
npm run build
```
Expected: Build completes successfully with no errors.

- [ ] **Step 3: Start production server and verify pages**

```bash
npm start
```

Verify these URLs load without errors:
- http://localhost:3000 → redirects to /jp
- http://localhost:3000/jp → top page with hero and rankings
- http://localhost:3000/jp/rankings → ranking page
- http://localhost:3000/jp/categories → category grid
- http://localhost:3000/jp/categories/person → person ranking
- http://localhost:3000/jp/entities/jp-yamada-haruka → entity page with support form
- http://localhost:3000/jp/about → about page
- http://localhost:3000/jp/rules → rules page
- http://localhost:3000/jp/contact → contact form
- http://localhost:3000/admin/login → admin login (before auth)
- http://localhost:3000/admin → admin dashboard (after login with ADMIN_PASSWORD)

- [ ] **Step 4: Test core functionality manually**

1. Open http://localhost:3000/jp/entities/jp-yamada-haruka
2. Set slider to 50pt, enter comment (10+ chars), submit
3. Verify support count and points updated
4. Click "通報" on a comment, select reason, submit
5. Login at /admin/login with ADMIN_PASSWORD
6. Verify admin dashboard shows entities, comments, reports

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: MVP complete - nihon-ouen-ranking / My Country Support Rank"
```
