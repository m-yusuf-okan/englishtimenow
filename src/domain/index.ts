/**
 * Alan modeli (domain) — uygulamanın ortak dili.
 *
 * Bu katman hiçbir framework'e bağlı değildir: React, Next veya Tailwind
 * çalışma zamanı içermez. İçerik dosyaları ve doğrulayıcı script'i buradaki
 * tiplere dayanır, bu yüzden bağımlılık yönü tek taraflıdır:
 *
 *     content ──► domain ◄── lib/catalog ──► app
 *
 * domain hiçbir şeyi import etmez.
 */
export { LEVELS, isLevel } from "./level.ts";
export type { Level } from "./level.ts";

export { COLOR_THEMES, THEME_TOKENS, themeTokens } from "./theme.ts";
export type { ColorTheme, ThemeTokens } from "./theme.ts";

export { CLOZE_BLANK, isQuizCard, isVocabCard } from "./card.ts";
export type {
  Card,
  ClozeQuizCard,
  MultipleChoiceQuizCard,
  QuizCard,
  VocabCard,
} from "./card.ts";

export type { Catalog, Category, Workspace } from "./taxonomy.ts";
