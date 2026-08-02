import type { QuizCard, VocabCard } from "./card.ts";
import type { ColorTheme } from "./theme.ts";

/**
 * Alt kategori — PRD 2.B. Kartların gerçekte yaşadığı yer.
 *
 * `vocab` ve `quiz` ayrı diziler; tek bir karışık dizi olsaydı her tüketici
 * filtrelemek zorunda kalırdı ve carousel'in "kelime modu / test modu" ayrımı
 * çalışma zamanına kayardı.
 */
export interface Category {
  /** URL parçası. Workspace içinde benzersiz, kebab-case. */
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  /** Kategoriyi görsel olarak ayrıştıran tema — PRD 2.B. */
  readonly theme: ColorTheme;
  readonly vocab: readonly VocabCard[];
  readonly quiz: readonly QuizCard[];
}

/** Üst seviye gruplama — PRD 2.A. */
export interface Workspace {
  /** URL parçası. Katalog genelinde benzersiz, kebab-case. */
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly categories: readonly Category[];
}

/** Tüm içeriğin kökü. */
export type Catalog = readonly Workspace[];
