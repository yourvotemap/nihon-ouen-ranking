import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const entities = [
  {
    countryCode: 'JP', category: 'person', name: '山田はるか',
    slug: 'jp-yamada-haruka',
    shortDescription: '伝統工芸の魅力を国内外に伝える職人・文化活動家',
    description: '長年にわたり日本の伝統工芸（陶芸・漆器）の技術継承に取り組み、海外でのワークショップやオンライン展示会を通じて日本文化の普及に貢献している。若い職人の育成にも力を入れており、地域経済の活性化にも寄与している。',
    tags: JSON.stringify(['伝統工芸', '文化普及', '職人']),
    totalSupportPoints: 1240, supportCount: 87,
  },
  {
    countryCode: 'JP', category: 'person', name: '鈴木たろう',
    slug: 'jp-suzuki-taro',
    shortDescription: '地方ITスタートアップを立ち上げ、地域雇用を創出する起業家',
    description: '地方都市でIT企業を創業し、100名以上の地元雇用を生み出した。地域の農業・観光業のDXを支援し、地方経済の底上げに貢献。若者のUターン就職にもつながる取り組みを続けている。',
    tags: JSON.stringify(['IT', '地方創生', '起業家']),
    totalSupportPoints: 980, supportCount: 64,
  },
  {
    countryCode: 'JP', category: 'company', name: '株式会社あおぞら工業',
    slug: 'jp-aozora-kogyo',
    shortDescription: '高精度な金属加工で日本のものづくりを支える中小企業',
    description: '創業50年を超える中小製造業。航空・医療・自動車分野向けの高精度部品を製造し、日本のものづくりの基盤を支えている。若手技術者の育成にも積極的で、技能継承への取り組みが評価されている。',
    tags: JSON.stringify(['製造業', 'ものづくり', '中小企業']),
    totalSupportPoints: 1560, supportCount: 102,
  },
  {
    countryCode: 'JP', category: 'company', name: '株式会社ひかり食品',
    slug: 'jp-hikari-foods',
    shortDescription: '地元農家と連携し、地産地消の食品を全国に届けるメーカー',
    description: '地域農家と直接契約し、無農薬・減農薬の農産物を使った加工食品を製造・販売。フードロス削減にも取り組み、地域の農業支援と持続可能な食品製造を両立させている。',
    tags: JSON.stringify(['食品', '地産地消', 'フードロス削減']),
    totalSupportPoints: 870, supportCount: 58,
  },
  {
    countryCode: 'JP', category: 'organization', name: '日本伝統文化継承の会',
    slug: 'jp-dentou-bunka-keisho',
    shortDescription: '日本の伝統芸能・工芸の継承と普及を目的とするNPO',
    description: '能・狂言・歌舞伎など日本の伝統芸能の次世代への継承と、外国人向けの文化体験プログラムを提供するNPO法人。全国の小中学校での出張公演も行い、子供たちへの伝統文化教育に貢献している。',
    tags: JSON.stringify(['NPO', '伝統芸能', '文化継承']),
    totalSupportPoints: 1100, supportCount: 73,
  },
  {
    countryCode: 'JP', category: 'organization', name: '子育て応援ネットワーク',
    slug: 'jp-kosodate-ouen-net',
    shortDescription: '全国の子育て家庭を支援するボランティア団体',
    description: '育児に悩む保護者へのオンライン相談、産後ケアサポート、パパ向け育児ワークショップなどを展開。地域コミュニティとの連携を強め、孤立しがちな子育て家庭に寄り添う活動を続けている。',
    tags: JSON.stringify(['子育て支援', 'ボランティア', 'コミュニティ']),
    totalSupportPoints: 930, supportCount: 61,
  },
  {
    countryCode: 'JP', category: 'organization', name: '障がい者就労支援センター「はたらく」',
    slug: 'jp-hataraku-center',
    shortDescription: '障がいのある方の就職・職場定着を支援する団体',
    description: '障がいのある方が能力を活かして働けるよう、職業訓練から就職活動、職場定着まで一貫支援。企業向けの障がい者雇用研修も実施し、インクルーシブな職場環境の普及に取り組んでいる。',
    tags: JSON.stringify(['就労支援', '障がい者', 'インクルーシブ']),
    totalSupportPoints: 750, supportCount: 49,
  },
  {
    countryCode: 'JP', category: 'project', name: '海ごみゼロプロジェクト',
    slug: 'jp-umi-gomi-zero',
    shortDescription: '全国の海岸清掃と海洋プラスチック削減を進める活動',
    description: '毎月全国30か所以上の海岸で清掃活動を実施。回収したごみのデータを分析し、政策提言や企業との連携による発生源対策も行っている。学校との連携プログラムを通じて若い世代への環境教育にも貢献。',
    tags: JSON.stringify(['環境', '海洋保全', 'ボランティア']),
    totalSupportPoints: 1380, supportCount: 92,
  },
  {
    countryCode: 'JP', category: 'project', name: '若者IT教育プロジェクト',
    slug: 'jp-wakamono-it-edu',
    shortDescription: '地方の子供たちにプログラミング・IT教育を届ける活動',
    description: '過疎地域や離島の小中学生を対象に、無償でプログラミング教室を開催。オンライン授業と現地出張授業を組み合わせ、都市部との教育格差の解消を目指している。3年間で延べ5,000名以上に教育を提供。',
    tags: JSON.stringify(['教育', 'IT', '地方創生', 'プログラミング']),
    totalSupportPoints: 1450, supportCount: 95,
  },
  {
    countryCode: 'JP', category: 'project', name: '空き家再生プロジェクト',
    slug: 'jp-akiya-saisei',
    shortDescription: '地方の空き家を活用し、移住・多拠点生活を支援する活動',
    description: '放置空き家のリノベーションと移住希望者のマッチングを行い、地方移住の促進と地域コミュニティの再生を目指す。カフェ・コワーキングスペースへの転用事例を全国に発信している。',
    tags: JSON.stringify(['地方創生', '移住', 'リノベーション']),
    totalSupportPoints: 820, supportCount: 55,
  },
  {
    countryCode: 'JP', category: 'project', name: '伝統工芸デジタルアーカイブ',
    slug: 'jp-crafts-digital-archive',
    shortDescription: '日本の伝統工芸品をデジタル技術で記録・保存・公開するプロジェクト',
    description: '廃絶の危機にある伝統工芸の技術と作品を3Dスキャン・高解像度映像で記録し、無償公開するデジタルアーカイブを構築。国内外の研究者や愛好家が学べる環境を整備している。',
    tags: JSON.stringify(['デジタル', '伝統工芸', '文化保存']),
    totalSupportPoints: 690, supportCount: 46,
  },
  {
    countryCode: 'JP', category: 'local', name: '桜の里まちおこし協議会',
    slug: 'jp-sakura-machi-okoshi',
    shortDescription: '桜の名所を活かした地域活性化に取り組む地域団体',
    description: '春の桜祭りを核に、地元産品の販売、農業体験ツーリズム、移住セミナーを組み合わせた通年型の地域活性化に取り組む。地域の若者と連携したSNS発信で観光客数が3年で倍増。',
    tags: JSON.stringify(['観光', '地域活性化', '農業体験']),
    totalSupportPoints: 760, supportCount: 51,
  },
  {
    countryCode: 'JP', category: 'local', name: '山村振興プロジェクト「みどりの里」',
    slug: 'jp-midori-no-sato',
    shortDescription: '過疎化する山間農村の農業・林業・生活を守る取り組み',
    description: '高齢化・人口減少が進む中山間地域で、農業支援員の派遣、林業の6次産業化、地域内外の交流促進を行う。関係人口の増加と農林業の担い手育成に実績を上げている。',
    tags: JSON.stringify(['農村振興', '農業', '林業', '地方創生']),
    totalSupportPoints: 580, supportCount: 38,
  },
  {
    countryCode: 'JP', category: 'product', name: '国産オーガニックブランド「つちのこ」',
    slug: 'jp-tsuchinoko-organic',
    shortDescription: '国内農家と連携したオーガニック認証農産物ブランド',
    description: '国内300軒以上の有機農家と契約し、安全・安心な農産物を消費者に直接届けるブランド。農家の所得向上と消費者への安全な食の提供を両立。フードロス削減への取り組みも注目されている。',
    tags: JSON.stringify(['オーガニック', '農業', 'フードロス削減']),
    totalSupportPoints: 1020, supportCount: 68,
  },
  {
    countryCode: 'JP', category: 'product', name: '日本語学習アプリ「まなぶ」',
    slug: 'jp-manabu-app',
    shortDescription: '外国人向けに日本語と日本文化を楽しく学べるアプリ',
    description: '世界150か国以上でダウンロードされる日本語学習アプリ。日本の文化・習慣・地域情報も学べるコンテンツで、日本へのインバウンド増加と相互理解促進に貢献している。',
    tags: JSON.stringify(['教育', 'アプリ', '日本語学習', 'インバウンド']),
    totalSupportPoints: 1190, supportCount: 79,
  },
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
    shortDescription: "Preserving and sharing France's regional food traditions",
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
