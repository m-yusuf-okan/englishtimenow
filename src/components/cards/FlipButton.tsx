"use client";

import { themeTokens, type ColorTheme } from "@/domain";
import { useFlip } from "./FlipCard";

/**
 * Kartı çeviren asıl denetim.
 *
 * Kartın **birincil eylemi** budur, o yüzden dolu vurgu rengiyle çizilir.
 * Önceki sürümde %25 opaklıkta kenarlıklı küçük bir pill'di ve 480px'lik boş
 * bir kartın köşesinde kayboluyordu — kullanıcı kartın çevrildiğini fark
 * etmiyordu. Görünmeyen bir denetim, çalışmayan bir denetimdir.
 *
 * `stopPropagation`: kart yüzeyi de tıklamayla çeviriyor. Olay yukarı
 * bırakılırsa iki çevirme üst üste binip kart yerinde kalır.
 */
export function FlipButton({ label, theme }: { label: string; theme: ColorTheme }) {
  const { flipped, toggle } = useFlip();
  const tokens = themeTokens(theme);

  return (
    <button
      type="button"
      aria-pressed={flipped}
      onClick={(event) => {
        event.stopPropagation();
        toggle();
      }}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-lg shadow-black/10 transition-transform hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-95 ${tokens.accent} ${tokens.onAccent} ${tokens.ring}`}
    >
      <span aria-hidden="true">↻</span>
      {label}
    </button>
  );
}
