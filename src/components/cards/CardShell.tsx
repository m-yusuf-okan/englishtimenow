import type { ColorTheme, Level } from "@/domain";
import { themeTokens } from "@/domain";

/**
 * Bir kart yüzünün ortak zemini.
 *
 * Cam görünüm üç katmandan gelir: yarı saydam degrade yüzey, `backdrop-blur`
 * ile arkasının bulanıklaşması ve üst kenardaki ince ışık çizgisi
 * (`before` katmanı yerine `ring-inset` ile). Zemin düz olsaydı saydamlık
 * görünmezdi; sayfa arka planındaki ışıma bunun için var.
 *
 * `div` kullanılıyor, `article` değil: bu yüzler `FlipCard` içinde yaşıyor ve
 * kart yüzeyi tıklamayla çeviriyor.
 *
 * Yükseklik dışarıdan gelir (`h-full`): flip kabuğu iki yüzü aynı grid
 * hücresine yığar, hücre en uzun yüze göre boyutlanır ve iki yüz de o
 * yüksekliği doldurur — çevirirken kart zıplamaz.
 */
export function CardShell({
  theme,
  level,
  label,
  actions,
  children,
  className = "",
  isStarred = false,
  onToggleStar,
}: {
  theme: ColorTheme;
  level: Level;
  /** Yüzün adı: "Ön yüz" / "Arka yüz" / "Soru" / "Cevap". Görünür metindir. */
  label: string;
  /** Yüze ait denetimler (çevir, dinle). Kartın alt şeridinde durur. */
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  isStarred?: boolean;
  onToggleStar?: () => void;
}) {
  const tokens = themeTokens(theme);

  return (
    <div
      className={`flex h-full flex-col gap-4 sm:gap-5 rounded-3xl border p-4 sm:p-6 shadow-xl ring-1 shadow-black/5 ring-white/40 backdrop-blur-xl ring-inset dark:shadow-black/40 dark:ring-white/10 ${tokens.surface} ${tokens.border} ${tokens.text} ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className={`text-[0.7rem] font-semibold tracking-[0.14em] uppercase ${tokens.muted}`}
        >
          {label}
        </span>
        <div className="flex items-center gap-2">
          {onToggleStar && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onToggleStar();
              }}
              aria-pressed={isStarred}
              aria-label={isStarred ? "Yıldızı kaldır" : "Yıldızla"}
              title={isStarred ? "Yıldızı kaldır" : "Yıldızla"}
              className={`p-1 transition-transform active:scale-90 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-md cursor-pointer ${
                isStarred ? "text-amber-500" : "opacity-40 hover:opacity-100"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill={isStarred ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4.5"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </button>
          )}
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide ${tokens.accent} ${tokens.onAccent}`}
          >
            {level}
          </span>
        </div>
      </div>

      {children}

      {actions ? (
        <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-current/10 pt-4">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
