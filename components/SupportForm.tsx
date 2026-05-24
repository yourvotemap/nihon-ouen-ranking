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
