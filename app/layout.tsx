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
