import type { Locale } from './i18n';

export type CountryUrlCode = 'jp' | 'us' | 'tw' | 'uk' | 'fr' | 'in';
export type CountryDbCode = 'JP' | 'US' | 'TW' | 'UK' | 'FR' | 'IN';

export const VALID_COUNTRY_URLS: CountryUrlCode[] = ['jp', 'us', 'tw', 'uk', 'fr', 'in'];

export const COUNTRIES = [
  { code: 'JP' as CountryDbCode, urlCode: 'jp' as CountryUrlCode, flag: '🇯🇵', names: { ja: '日本', en: 'Japan', zh: '日本' } },
  { code: 'US' as CountryDbCode, urlCode: 'us' as CountryUrlCode, flag: '🇺🇸', names: { ja: 'アメリカ', en: 'United States', zh: '美国' } },
  { code: 'TW' as CountryDbCode, urlCode: 'tw' as CountryUrlCode, flag: '🇹🇼', names: { ja: '台湾', en: 'Taiwan', zh: '台湾' } },
  { code: 'UK' as CountryDbCode, urlCode: 'uk' as CountryUrlCode, flag: '🇬🇧', names: { ja: 'イギリス', en: 'United Kingdom', zh: '英国' } },
  { code: 'FR' as CountryDbCode, urlCode: 'fr' as CountryUrlCode, flag: '🇫🇷', names: { ja: 'フランス', en: 'France', zh: '法国' } },
  { code: 'IN' as CountryDbCode, urlCode: 'in' as CountryUrlCode, flag: '🇮🇳', names: { ja: 'インド', en: 'India', zh: '印度' } },
] as const;

export function urlToDbCode(urlCode: string): string {
  return urlCode.toUpperCase();
}

export function dbToUrlCode(dbCode: string): string {
  return dbCode.toLowerCase();
}

export function getCountryName(urlCode: string, locale: Locale): string {
  const c = COUNTRIES.find(c => c.urlCode === urlCode.toLowerCase());
  if (!c) return urlCode.toUpperCase();
  return (c.names as Record<string, string>)[locale] ?? c.names.en;
}

export function getCountryFlag(urlCode: string): string {
  return COUNTRIES.find(c => c.urlCode === urlCode.toLowerCase())?.flag ?? '🌍';
}

export function isValidCountryUrl(v: string): v is CountryUrlCode {
  return VALID_COUNTRY_URLS.includes(v as CountryUrlCode);
}
