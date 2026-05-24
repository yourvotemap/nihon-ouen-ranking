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
