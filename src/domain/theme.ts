/**
 * Kategori renk temaları.
 *
 * DİKKAT — Tailwind v4 sınıf adlarını kaynak kodda *statik metin* olarak arar.
 * `bg-${theme}-500` gibi bir şablon literali asla derlenmez ve stil sessizce
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
 * Bileşenler ham renk adı değil bu demeti alır; "emerald bir kart nasıl
 * görünür" kararı tek yerde durur ve kart bileşenleri renkten habersiz kalır.
 */
export interface ThemeTokens {
  /** Kart camı: yarı saydam zemin + degrade. */
  readonly surface: string;
  /** Cam kenarı. Üstte ışık, altta koyu his verir. */
  readonly border: string;
  /** Kart üzerindeki birincil metin. */
  readonly text: string;
  /** İkincil/soluk metin (IPA, ipucu). */
  readonly muted: string;
  /** Dolu vurgu: birincil buton ve seviye rozeti. */
  readonly accent: string;
  /** Vurgu üzerindeki metin rengi. */
  readonly onAccent: string;
  /** Sayfa arka planındaki ışıma lekesi. */
  readonly glow: string;
  /** Klavye odak halkası. */
  readonly ring: string;
}

export const THEME_TOKENS: Readonly<Record<ColorTheme, ThemeTokens>> = {
  emerald: {
    surface:
      "bg-gradient-to-br from-emerald-50/90 to-emerald-100/60 dark:from-emerald-400/12 dark:to-emerald-900/25",
    border: "border-emerald-300/60 dark:border-emerald-300/20",
    text: "text-emerald-950 dark:text-emerald-50",
    muted: "text-emerald-800/70 dark:text-emerald-200/65",
    accent: "bg-emerald-600 dark:bg-emerald-400",
    onAccent: "text-white dark:text-emerald-950",
    glow: "bg-emerald-400/30 dark:bg-emerald-400/20",
    ring: "focus-visible:ring-emerald-500",
  },
  indigo: {
    surface:
      "bg-gradient-to-br from-indigo-50/90 to-indigo-100/60 dark:from-indigo-400/12 dark:to-indigo-900/25",
    border: "border-indigo-300/60 dark:border-indigo-300/20",
    text: "text-indigo-950 dark:text-indigo-50",
    muted: "text-indigo-800/70 dark:text-indigo-200/65",
    accent: "bg-indigo-600 dark:bg-indigo-400",
    onAccent: "text-white dark:text-indigo-950",
    glow: "bg-indigo-400/30 dark:bg-indigo-400/20",
    ring: "focus-visible:ring-indigo-500",
  },
  amber: {
    surface:
      "bg-gradient-to-br from-amber-50/90 to-amber-100/60 dark:from-amber-400/12 dark:to-amber-900/25",
    border: "border-amber-300/60 dark:border-amber-300/20",
    text: "text-amber-950 dark:text-amber-50",
    muted: "text-amber-800/70 dark:text-amber-200/65",
    accent: "bg-amber-500 dark:bg-amber-400",
    onAccent: "text-white dark:text-amber-950",
    glow: "bg-amber-400/30 dark:bg-amber-400/20",
    ring: "focus-visible:ring-amber-500",
  },
  rose: {
    surface:
      "bg-gradient-to-br from-rose-50/90 to-rose-100/60 dark:from-rose-400/12 dark:to-rose-900/25",
    border: "border-rose-300/60 dark:border-rose-300/20",
    text: "text-rose-950 dark:text-rose-50",
    muted: "text-rose-800/70 dark:text-rose-200/65",
    accent: "bg-rose-600 dark:bg-rose-400",
    onAccent: "text-white dark:text-rose-950",
    glow: "bg-rose-400/30 dark:bg-rose-400/20",
    ring: "focus-visible:ring-rose-500",
  },
  sky: {
    surface:
      "bg-gradient-to-br from-sky-50/90 to-sky-100/60 dark:from-sky-400/12 dark:to-sky-900/25",
    border: "border-sky-300/60 dark:border-sky-300/20",
    text: "text-sky-950 dark:text-sky-50",
    muted: "text-sky-800/70 dark:text-sky-200/65",
    accent: "bg-sky-600 dark:bg-sky-400",
    onAccent: "text-white dark:text-sky-950",
    glow: "bg-sky-400/30 dark:bg-sky-400/20",
    ring: "focus-visible:ring-sky-500",
  },
  violet: {
    surface:
      "bg-gradient-to-br from-violet-50/90 to-violet-100/60 dark:from-violet-400/12 dark:to-violet-900/25",
    border: "border-violet-300/60 dark:border-violet-300/20",
    text: "text-violet-950 dark:text-violet-50",
    muted: "text-violet-800/70 dark:text-violet-200/65",
    accent: "bg-violet-600 dark:bg-violet-400",
    onAccent: "text-white dark:text-violet-950",
    glow: "bg-violet-400/30 dark:bg-violet-400/20",
    ring: "focus-visible:ring-violet-500",
  },
};

export function themeTokens(theme: ColorTheme): ThemeTokens {
  return THEME_TOKENS[theme];
}
