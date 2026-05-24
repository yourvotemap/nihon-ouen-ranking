export type CategoryId =
  | 'person' | 'company' | 'organization' | 'political_party'
  | 'media' | 'project' | 'local' | 'product';

export const CATEGORIES = [
  { id: 'person' as CategoryId,          label: '人物',              emoji: '👤', featured: true },
  { id: 'company' as CategoryId,         label: '企業',              emoji: '🏢', featured: true },
  { id: 'organization' as CategoryId,    label: '団体',              emoji: '🤝', featured: true },
  { id: 'political_party' as CategoryId, label: '政党',              emoji: '🏛️', featured: false },
  { id: 'media' as CategoryId,           label: 'メディア',           emoji: '📺', featured: false },
  { id: 'project' as CategoryId,         label: 'プロジェクト・活動', emoji: '🚀', featured: true },
  { id: 'local' as CategoryId,           label: '自治体・地域',       emoji: '🏘️', featured: true },
  { id: 'product' as CategoryId,         label: '商品・サービス',     emoji: '📦', featured: true },
] as const;

export const FEATURED_CATEGORIES = CATEGORIES.filter(c => c.featured);

export function getCategoryLabel(id: string): string {
  return CATEGORIES.find(c => c.id === id)?.label ?? id;
}

export function getCategoryEmoji(id: string): string {
  return CATEGORIES.find(c => c.id === id)?.emoji ?? '📌';
}
