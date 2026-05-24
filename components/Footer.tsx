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
