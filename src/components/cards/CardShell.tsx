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
}: {
  theme: ColorTheme;
  level: Level;
  /** Yüzün adı: "Ön yüz" / "Arka yüz" / "Soru" / "Cevap". Görünür metindir. */
  label: string;
  /** Yüze ait denetimler (çevir, dinle). Kartın alt şeridinde durur. */
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const tokens = themeTokens(theme);

  return (
    <div
      className={`flex h-full flex-col gap-5 rounded-3xl border p-6 shadow-xl ring-1 shadow-black/5 ring-white/40 backdrop-blur-xl ring-inset dark:shadow-black/40 dark:ring-white/10 ${tokens.surface} ${tokens.border} ${tokens.text} ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className={`text-[0.7rem] font-semibold tracking-[0.14em] uppercase ${tokens.muted}`}
        >
          {label}
        </span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide ${tokens.accent} ${tokens.onAccent}`}
        >
          {level}
        </span>
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
