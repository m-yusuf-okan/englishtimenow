"use client";

import { useState, type KeyboardEvent, type ReactNode } from "react";

/**
 * Kart çevirme davranışı — PRD 3.B.
 *
 * İçerikten bağımsızdır: yüzleri prop olarak alır, ne gösterdiğini bilmez.
 * Kelime ve test kartları aynı mekanizmayı paylaşır.
 *
 * KATMANLAMA — bu bileşen **yalnızca** `rotateY` uygular. Konum, ölçek ve
 * opacity Faz 4'teki carousel'e ait ve onu saran elemana yazılacak. İkisini
 * aynı elemana koymak `transform`'u çakıştırır: carousel kartı yerine
 * taşıdığında flip dönüşü silinir.
 *
 * ERİŞİLEBİLİRLİK
 * - Kabuk `<button>` değil `role="button"` taşıyan bir `div`. Sebebi HTML
 *   içerik modeli: `<button>` yalnızca ifade içeriği alabilir, kart yüzleri ise
 *   başlık ve liste içeriyor. Bunun bedeli Enter/Space'i elle bağlamaktır.
 * - Görünmeyen yüz `inert` alır. `backface-visibility: hidden` yalnızca görsel
 *   gizler; ekran okuyucu ve klavye o yüzün içeriğine yine ulaşırdı.
 * - `aria-pressed` çevrilme durumunu bildirir.
 * - `motion-reduce` açıkken dönüş animasyonu anında tamamlanır.
 */
export function FlipCard({
  front,
  back,
  label,
  interactive = true,
  className = "",
}: {
  front: ReactNode;
  back: ReactNode;
  /** Kabuğun erişilebilir adı, örn. `"give up — kartı çevir"`. */
  label: string;
  /**
   * Carousel'de yalnızca merkezdeki kart etkindir. Etkisiz kartlar odak
   * sırasından ve erişilebilirlik ağacından çıkar, tıklamayı da yutmaz —
   * aksi halde yandaki yarı saydam kart tıklanıp çevrilebilirdi.
   */
  interactive?: boolean;
  className?: string;
}) {
  const [flipped, setFlipped] = useState(false);

  const toggle = () => {
    if (interactive) setFlipped((value) => !value);
  };

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!interactive) return;
    if (event.key !== " " && event.key !== "Enter") return;
    // Space'in sayfayı kaydırmasını engelle — `role="button"` gerçek bir
    // butonun varsayılan tuş davranışını miras almaz.
    event.preventDefault();
    toggle();
  }

  return (
    <div
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : -1}
      aria-pressed={interactive ? flipped : undefined}
      aria-label={interactive ? label : undefined}
      aria-hidden={!interactive}
      onClick={toggle}
      onKeyDown={handleKeyDown}
      // `h-full`: kart bir ızgara/carousel hücresini tamamen doldurur, böylece
      // aynı satırdaki kartlar eşit yükseklikte görünür.
      className={`h-full rounded-2xl perspective-distant select-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${
        interactive ? "cursor-pointer" : "pointer-events-none"
      } ${className}`}
    >
      <div
        className={`grid h-full transform-3d transition-transform duration-500 ease-out motion-reduce:transition-none ${
          flipped ? "rotate-y-180" : ""
        }`}
      >
        {/* İki yüz de aynı grid hücresinde: hücre en uzun yüze göre boyutlanır,
            böylece çevirirken kartın yüksekliği değişmez. */}
        <div className="col-start-1 row-start-1 backface-hidden" inert={flipped}>
          {front}
        </div>
        <div
          className="col-start-1 row-start-1 rotate-y-180 backface-hidden"
          inert={!flipped}
        >
          {back}
        </div>
      </div>
    </div>
  );
}
