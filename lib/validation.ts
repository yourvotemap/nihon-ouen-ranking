const NG_WORDS = ['死ね', '殺す', 'バカ', 'アホ', '消えろ'];

export function containsNgWords(text: string): boolean {
  return NG_WORDS.some(w => text.includes(w));
}

export function validateSupport(data: unknown): { valid: boolean; error?: string } {
  if (typeof data !== 'object' || data === null) return { valid: false, error: '不正なデータ' };
  const d = data as Record<string, unknown>;

  if (typeof d.points !== 'number' || d.points < 1 || d.points > 100) {
    return { valid: false, error: '応援ポイントは1〜100の整数で入力してください' };
  }
  if (typeof d.comment !== 'string' || d.comment.trim().length < 10) {
    return { valid: false, error: '応援理由は10文字以上入力してください' };
  }
  if ((d.comment as string).length > 500) {
    return { valid: false, error: '応援理由は500文字以内で入力してください' };
  }
  if (containsNgWords(d.comment as string)) {
    return { valid: false, error: '不適切な表現が含まれています' };
  }
  if (d.supporterName && typeof d.supporterName === 'string' && d.supporterName.length > 50) {
    return { valid: false, error: '応援者名は50文字以内で入力してください' };
  }
  return { valid: true };
}
