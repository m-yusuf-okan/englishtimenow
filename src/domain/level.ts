/**
 * CEFR seviyeleri. PRD kapsamı A1–B1 ile sınırlı.
 *
 * Seviye listesinin tek kaynağı burasıdır: filtre bileşenleri, doğrulayıcı ve
 * içerik dosyaları hep bu diziden türer. Yeni bir seviye eklemek için tek
 * değişiklik noktası bu dosya.
 */
export const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

export type Level = (typeof LEVELS)[number];

/** Dışarıdan gelen (URL parametresi, localStorage) string'i daraltmak için. */
export function isLevel(value: string): value is Level {
  return (LEVELS as readonly string[]).includes(value);
}
