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
    setOpen(false);
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-red-300"
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
