import type { Level } from "./level.ts";

/**
 * Boşluk doldurma sorularında boşluğu işaretleyen belirteç.
 * Doğrulayıcı her cloze sorusunda bunun varlığını şart koşar.
 */
export const CLOZE_BLANK = "___";

interface CardBase {
  /**
   * Katalog genelinde benzersiz. Dizi indeksi yerine kalıcı kimlik kullanmak
   * şart: seviye filtresi diziyi daraltır, araya kart eklemek sırayı kaydırır.
   * Konvansiyon: `<kategori-öneki>-<slug>` (örn. `phv-give-up`).
   */
  readonly id: string;
  readonly level: Level;
}

/**
 * Kelime kartı — PRD 2.C.
 * Ön yüz: `term` + `ipa` (+ telaffuz butonu). Arka yüz: geri kalanı.
 */
export interface VocabCard extends CardBase {
  readonly kind: "vocab";
  /** İngilizce kelime/öbek. */
  readonly term: string;
  /** IPA okunuş; eğik çizgiler dahil yazılır: `/ˌɡɪv ˈʌp/`. */
  readonly ipa: string;
  /** Türkçe karşılık. */
  readonly translation: string;
  /** A2 seviyesinde örnek cümle ve Türkçesi. */
  readonly example: {
    readonly en: string;
    readonly tr: string;
  };
  /** Kelimenin sık eşleştiği yapılar (örn. `depend + on`). En az bir tane. */
  readonly collocations: readonly string[];
}

interface QuizCardBase extends CardBase {
  readonly kind: "quiz";
  /** Soru metni. */
  readonly prompt: string;
  /** Doğru cevap. */
  readonly answer: string;
  /** Arka yüzdeki kısa gramer/bağlam açıklaması. */
  readonly explanation: string;
}

/** Boşluk doldurma. `prompt` içinde {@link CLOZE_BLANK} bulunmak zorunda. */
export interface ClozeQuizCard extends QuizCardBase {
  readonly format: "cloze";
}

/** Çoktan seçmeli. `answer`, `options` içinde yer almak zorunda. */
export interface MultipleChoiceQuizCard extends QuizCardBase {
  readonly format: "multiple-choice";
  readonly options: readonly string[];
}

/**
 * İki soru biçimi ayrık birleşim olarak modellendi: `format` alanına bakan
 * bileşen her dalda hangi alanların var olduğunu derleyiciden öğrenir ve yeni
 * bir biçim eklendiğinde eksik dal derleme hatası verir.
 */
export type QuizCard = ClozeQuizCard | MultipleChoiceQuizCard;

export type Card = VocabCard | QuizCard;

export function isVocabCard(card: Card): card is VocabCard {
  return card.kind === "vocab";
}

export function isQuizCard(card: Card): card is QuizCard {
  return card.kind === "quiz";
}
