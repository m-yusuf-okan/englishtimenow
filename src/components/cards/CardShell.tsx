import type { ColorTheme, Level } from "@/domain";
import { themeTokens } from "@/domain";

/**
 * Bir kart yüzünün ortak zemini: tema rengi, kenarlık, iç boşluk, seviye rozeti.
 *
 * Kart bileşenleri renk adını değil hazır sınıf demetini kullanır; "emerald bir
 * kart nasıl görünür" kararı tek yerde (domain/theme.ts) durur.
 *
 * `div` kullanılıyor, `article` değil: bu yüzler `FlipCard` içinde
 * `role="button"` taşıyan bir kabuğun içinde yaşıyor ve buton içinde akış
 * içeriği (article) barındırmak geçersiz HTML üretirdi.
 *
 * Yükseklik dışarıdan gelir (`h-full`): flip kabuğu iki yüzü aynı grid
 * hücresine yığar, hücre en uzun yüze göre boyutlanır ve iki yüz de o
 * yüksekliği doldurur — çevirirken kart zıplamaz.
 */
export function CardShell({
  theme,
  level,
  label,
  children,
  className = "",
}: {
  theme: ColorTheme;
  level: Level;
  /** Yüzün adı: "Ön yüz" / "Arka yüz" / "Soru" / "Cevap". Görünür metindir. */
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  const tokens = themeTokens(theme);

  return (
    <div
      className={`flex h-full flex-col gap-4 rounded-2xl border p-6 shadow-sm ${tokens.surface} ${tokens.border} ${tokens.text} ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className={`text-xs font-medium tracking-wide uppercase ${tokens.muted}`}>
          {label}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold text-white ${tokens.accent}`}
        >
          {level}
        </span>
      </div>
      {children}
    </div>
  );
}
