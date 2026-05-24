export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-slate-800 text-white py-3 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="font-bold">🛠️ 管理画面 | 日本応援ランキング</span>
          <a href="/jp" className="text-sm text-gray-400 hover:text-white transition-colors">サイトに戻る</a>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
