/**
 * Единый источник правды о сайте.
 * Публичный URL приходит из переменной окружения NEXT_PUBLIC_SITE_URL.
 * Пока переменная не задана — сайт считается неопубликованным:
 * robots закрывает индексацию, страницы отдают noindex.
 */

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

/** true, когда сайт официально опубликован на своём домене. */
export const isPublished = Boolean(rawSiteUrl);

/** Базовый URL без завершающего слэша. Для превью — безопасный локальный адрес. */
export const siteUrl = (rawSiteUrl || "http://localhost:3000").replace(/\/+$/, "");

export const site = {
  /** Название проекта. Уточняется на этапе позиционирования. */
  name: "Ольга Бакушкина — графический дизайнер",
  /** Короткое описание для метатегов. Уточняется на этапе контента. */
  description:
    "Айдентика, упаковка, digital и бренд-персонажи. Портфолио графического дизайнера полного цикла.",
  /** Короткая строка для OG-карточки (до ~70 знаков). */
  ogTagline: "Графический дизайнер полного цикла",
  locale: "ru_RU",
  lang: "ru",
} as const;

export function absoluteUrl(path = "/"): string {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
