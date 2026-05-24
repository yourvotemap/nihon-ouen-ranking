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

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">管理ダッシュボード</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: '掲載件数', value: entities.length },
          { label: '応援コメント', value: visibleSupports.length },
          { label: '未対応通報', value: openReports.length },
          { label: '購入件数', value: recentPurchases.filter(p => p.status === 'paid').length },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 text-center shadow-sm">
            <div className="text-2xl font-black text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[['entities', '掲載管理'], ['supports', 'コメント管理'], ['reports', '通報一覧'], ['purchases', 'ポイント購入'], ['accounts', 'アカウント']].map(([t, l]) => (
          <Link key={t} href={`/admin?tab=${t}`}
            className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? 'bg-slate-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}>
            {l}
          </Link>
        ))}
      </div>

      {tab === 'entities' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">名前</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">カテゴリ</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">ポイント</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">状態</th>
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
                    <td className="px-4 py-3 text-gray-500 text-right hidden sm:table-cell">{e.totalSupportPoints.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        e.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>{e.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <form action="/api/admin/entities" method="POST" className="inline">
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
        </div>
      )}

      {tab === 'supports' && (
        <div className="space-y-3">
          {visibleSupports.length === 0 && (
            <p className="text-center text-gray-400 py-8">応援コメントはありません</p>
          )}
          {visibleSupports.map(s => (
            <div key={s.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-400 mb-1">
                    {s.entity.name} · {s.points}pt · {new Date(s.createdAt).toLocaleString('ja-JP')}
                    {s.supporterName && ` · ${s.supporterName}`}
                  </div>
                  <p className="text-sm text-gray-700">{s.comment}</p>
                </div>
                <form action="/api/admin/supports" method="POST" className="shrink-0">
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
          {openReports.length === 0 && (
            <p className="text-center text-gray-400 py-8">未対応の通報はありません</p>
          )}
          {openReports.map(r => (
            <div key={r.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-400 mb-1">
                    {r.targetType} · {r.reason} · {new Date(r.createdAt).toLocaleString('ja-JP')}
                  </div>
                  {r.detail && <p className="text-sm text-gray-700">{r.detail}</p>}
                  <p className="text-xs text-gray-400 mt-1 font-mono">ID: {r.targetId}</p>
                </div>
                <form action="/api/admin/reports" method="POST" className="shrink-0">
                  <input type="hidden" name="id" value={r.id} />
                  <button type="submit" className="text-xs text-gray-500 hover:text-gray-700 whitespace-nowrap">対応済み</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

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
    </div>
  );
}
