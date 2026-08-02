import { LEVELS } from "@/domain";
import type { Card, Category, Level } from "@/domain";

/**
 * Kartlar üzerinde saf işlemler.
 *
 * `catalog.ts`'ten ayrı durur çünkü o modül içerik kaydını import eder;
 * buradan tek bir sembol çeken istemci bileşeni bütün kart içeriğini tarayıcı
 * paketine sürüklerdi. Bu dosya yalnızca alan tiplerine bağlıdır.
 */

/**
 * Seviye filtresi — PRD 3.C.
 *
 * Boş seçim "filtre yok" demektir; kullanıcı tüm seviyeleri kapattığında ekranı
 * boşaltmak yerine hepsini göstermek doğru davranıştır.
 */
export function filterByLevel<T extends Card>(
  cards: readonly T[],
  levels: readonly Level[],
): readonly T[] {
  if (levels.length === 0) return cards;
  return cards.filter((card) => levels.includes(card.level));
}

/**
 * Bir kategoride gerçekten bulunan seviyeler — filtre arayüzü için.
 *
 * Sonuç her zaman kanonik CEFR sırasındadır (A1 → B1). Set'in ekleme sırasını
 * döndürmek, kartların diziliş sırasına göre değişen bir filtre üretirdi.
 */
export function levelsInCategory(category: Category): readonly Level[] {
  const seen = new Set<Level>();
  for (const card of [...category.vocab, ...category.quiz]) {
    seen.add(card.level);
  }
  return LEVELS.filter((level) => seen.has(level));
}
