/**
 * Kategori renk temaları.
 *
 * DİKKAT — Tailwind v4 sınıf adlarını kaynak kodda *statik metin* olarak arar.
 * `bg-${theme}-50` gibi bir şablon literali asla derlenmez ve stil sessizce
 * kaybolur. Bu yüzden her tema için sınıflar aşağıda tam adıyla yazılıdır.
 * Yeni tema eklerken sınıfları elle yazmak zorunludur; üretmeye çalışma.
 */
export const COLOR_THEMES = [
  "emerald",
  "indigo",
  "amber",
  "rose",
  "sky",
  "violet",
] as const;

export type ColorTheme = (typeof COLOR_THEMES)[number];

/**
 * Bir temanın bileşenlere verdiği sınıf demeti.
 *
 * Bileşenler ham renk adı değil bu demeti alır; böylece "emerald kartı nasıl
 * görünür" kararı tek yerde durur ve kart bileşenleri renkten habersiz kalır.
 */
export interface ThemeTokens {
  /** Kart gövdesi zemini. */
  readonly surface: string;
  /** Kart kenarlığı. */
  readonly border: string;
  /** Kart üzerindeki birincil metin. */
  readonly text: string;
  /** İkincil/soluk metin (IPA, ipucu). */
  readonly muted: string;
  /** Vurgu dolgusu (rozet, aktif nokta). */
  readonly accent: string;
  /** Klavye odak halkası. */
  readonly ring: string;
}

export const THEME_TOKENS: Readonly<Record<ColorTheme, ThemeTokens>> = {
  emerald: {
    surface: "bg-emerald-50 dark:bg-emerald-950",
    border: "border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-950 dark:text-emerald-50",
    muted: "text-emerald-700 dark:text-emerald-300",
    accent: "bg-emerald-500",
    ring: "focus-visible:ring-emerald-500",
  },
  indigo: {
    surface: "bg-indigo-50 dark:bg-indigo-950",
    border: "border-indigo-200 dark:border-indigo-800",
    text: "text-indigo-950 dark:text-indigo-50",
    muted: "text-indigo-700 dark:text-indigo-300",
    accent: "bg-indigo-500",
    ring: "focus-visible:ring-indigo-500",
  },
  amber: {
    surface: "bg-amber-50 dark:bg-amber-950",
    border: "border-amber-200 dark:border-amber-800",
    text: "text-amber-950 dark:text-amber-50",
    muted: "text-amber-700 dark:text-amber-300",
    accent: "bg-amber-500",
    ring: "focus-visible:ring-amber-500",
  },
  rose: {
    surface: "bg-rose-50 dark:bg-rose-950",
    border: "border-rose-200 dark:border-rose-800",
    text: "text-rose-950 dark:text-rose-50",
    muted: "text-rose-700 dark:text-rose-300",
    accent: "bg-rose-500",
    ring: "focus-visible:ring-rose-500",
  },
  sky: {
    surface: "bg-sky-50 dark:bg-sky-950",
    border: "border-sky-200 dark:border-sky-800",
    text: "text-sky-950 dark:text-sky-50",
    muted: "text-sky-700 dark:text-sky-300",
    accent: "bg-sky-500",
    ring: "focus-visible:ring-sky-500",
  },
  violet: {
    surface: "bg-violet-50 dark:bg-violet-950",
    border: "border-violet-200 dark:border-violet-800",
    text: "text-violet-950 dark:text-violet-50",
    muted: "text-violet-700 dark:text-violet-300",
    accent: "bg-violet-500",
    ring: "focus-visible:ring-violet-500",
  },
};

export function themeTokens(theme: ColorTheme): ThemeTokens {
  return THEME_TOKENS[theme];
}
