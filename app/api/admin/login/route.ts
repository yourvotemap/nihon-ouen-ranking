import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const expected = process.env.ADMIN_PASSWORD ?? 'admin1234';
  if (password !== expected) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }
  const token = Buffer.from(expected).toString('base64');
  const res = NextResponse.json({ ok: true });
  res.cookies.set('admin_token', token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 });
  return res;
}
