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
