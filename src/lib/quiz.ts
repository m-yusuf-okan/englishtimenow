import type { QuizCard } from "@/domain";

/**
 * Cevap karşılaştırma kuralları.
 *
 * Kullanıcı yazımı ile beklenen cevap arasındaki anlamsız farklar elenir:
 * baştaki/sondaki boşluk, çoklu boşluk, harf büyüklüğü ve sondaki noktalama.
 * `"Set  up."` ile `"set up"` aynı sayılır.
 *
 * DİKKAT — `toLowerCase()` kullanılıyor, `toLocaleLowerCase()` değil.
 * Arayüz Türkçe olduğu için yerel ayara duyarlı bir küçültme cazip görünür ama
 * karşılaştırılan metinler İngilizcedir: Türkçe yerelinde `"I"` → `"ı"` olur ve
 * `"I"` içeren her cevap yanlış işaretlenirdi.
 */
export function normalizeAnswer(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.,!?;:]+$/, "");
}

export function isAnswerCorrect(card: QuizCard, input: string): boolean {
  return normalizeAnswer(input) === normalizeAnswer(card.answer);
}
