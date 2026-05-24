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
