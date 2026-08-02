"use client";

import { useState, type KeyboardEvent, type ReactNode } from "react";
import { usePointerSwipe } from "@/hooks/usePointerSwipe";
import { FlipCard } from "./FlipCard";

/**
 * 3D kart carousel'i — PRD 3.A.
 *
 * Merkezdeki kart tam boyut ve opaklıkta; komşular küçültülmüş ve solgun.
 *
 * KATMANLAMA — bu bileşen kartı yalnızca *konumlandırır* (translate + scale +
 * opacity). Çevirme dönüşü `FlipCard`'ın iç elemanında yaşar. İkisini aynı
 * elemana yazmak `transform`'u çakıştırır ve kart taşındığında çevrilme silinir.
 *
 * NEDEN INLINE STYLE — konum değerleri karta göre hesaplanıyor. Tailwind sınıf
 * adlarını kaynakta statik metin olarak arar, `translate-x-[${n}%]` gibi bir
 * şablon literali hiç derlenmez. Hesaplanan geometri bu yüzden `style` ile
 * verilir; tema renkleri ise sınıflarla (bkz. domain/theme.ts).
 *
 * PENCERELEME — yalnızca merkeze en yakın {@link VISIBLE_RADIUS} kart DOM'a
 * girer. 100+ kartlık bir kategoride hepsini render etmek her geçişte gereksiz
 * düzen hesabı doğururdu.
 */

/** Merkezin her iki yanında render edilecek kart sayısı. */
const VISIBLE_RADIUS = 2;

/** Uzaklığa göre görünüm. Dizin = |offset|. */
const DEPTH = [
  { shift: 0, scale: 1, opacity: 1, z: 30 },
  { shift: 76, scale: 0.88, opacity: 0.4, z: 20 },
  { shift: 142, scale: 0.76, opacity: 0.15, z: 10 },
] as const;

/**
 * Yüzler React elemanı olarak geçer, fonksiyon olarak değil: sunucu
 * bileşeninden istemci bileşenine fonksiyon aktarılamaz, eleman aktarılabilir.
 * Kartı bu yüzden carousel kurar — hangi kartın etkin olduğunu zaten o bilir.
 */
export interface CarouselItem {
  readonly id: string;
  /** Etkin kartın erişilebilir adı. */
  readonly label: string;
  readonly front: ReactNode;
  readonly back: ReactNode;
}

export function CardCarousel({
  items,
  label,
  emptyMessage = "Bu filtreye uyan kart yok.",
}: {
  items: readonly CarouselItem[];
  /** Bölgenin erişilebilir adı, örn. "Kelime kartları". */
  label: string;
  emptyMessage?: string;
}) {
  const [index, setIndex] = useState(0);

  const count = items.length;

  // Sınırlarda durur, başa sarmaz: sonsuz döngü kullanıcıya nerede olduğunu
  // kaybettirir ve "3 / 15" sayacını anlamsızlaştırır.
  const clamp = (value: number) => Math.min(Math.max(value, 0), count - 1);

  // Güncelleyici biçim şart. `index + 1` yazılsaydı değer render kapanışından
  // okunurdu ve aynı yığında düşen iki olay (tuş tekrarı, hızlı tıklama) aynı
  // eski değeri görüp tek adım ilerlerdi.
  const next = () => setIndex((current) => clamp(current + 1));
  const previous = () => setIndex((current) => clamp(current - 1));

  const { swipeHandlers, suppressClickAfterSwipe } = usePointerSwipe({
    onSwipeLeft: next,
    onSwipeRight: previous,
  });

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    // Ok tuşlarının sayfayı kaydırmasını engelle.
    event.preventDefault();
    if (event.key === "ArrowLeft") previous();
    else next();
  }

  if (count === 0) {
    return (
      <p className="py-10 text-center text-black/50 dark:text-white/50">{emptyMessage}</p>
    );
  }

  return (
    <section aria-label={label} className="mt-4">
      <div
        onKeyDown={handleKeyDown}
        onClickCapture={suppressClickAfterSwipe}
        {...swipeHandlers}
        // Kenar maskesi: yan kartlar kapsayıcı sınırında sert kesilmek yerine
        // silinerek kaybolur. Solma yalnızca dış %6'da; merkezdeki kart bu
        // aralığa hiç girmediği için etkilenmez.
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
        }}
        // `touch-pan-y`: dikey kaydırma tarayıcıda kalır, yatayı biz yönetiriz.
        className="relative h-120 touch-pan-y overflow-hidden"
      >
        {items.map((item, itemIndex) => {
          const offset = itemIndex - index;
          const distance = Math.abs(offset);
          if (distance > VISIBLE_RADIUS) return null;

          const depth = DEPTH[distance] ?? DEPTH[DEPTH.length - 1]!;
          const active = offset === 0;
          const direction = Math.sign(offset);

          return (
            <div
              key={item.id}
              style={{
                transform: `translateX(calc(-50% + ${direction * depth.shift}%)) scale(${depth.scale})`,
                opacity: depth.opacity,
                zIndex: depth.z,
              }}
              className="absolute top-0 left-1/2 h-full w-[min(22rem,82vw)] transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none"
            >
              <FlipCard
                front={item.front}
                back={item.back}
                label={item.label}
                interactive={active}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={previous}
          disabled={index === 0}
          className="rounded-full border border-black/15 px-4 py-2 text-sm disabled:opacity-30 focus-visible:ring-2 focus-visible:outline-none dark:border-white/20"
        >
          <span aria-hidden="true">←</span>
          <span className="sr-only">Önceki kart</span>
        </button>

        {/* Kart değişimini ekran okuyucuya bildirir. */}
        <p
          aria-live="polite"
          className="text-sm tabular-nums text-black/60 dark:text-white/60"
        >
          {index + 1} / {count}
        </p>

        <button
          type="button"
          onClick={next}
          disabled={index === count - 1}
          className="rounded-full border border-black/15 px-4 py-2 text-sm disabled:opacity-30 focus-visible:ring-2 focus-visible:outline-none dark:border-white/20"
        >
          <span aria-hidden="true">→</span>
          <span className="sr-only">Sonraki kart</span>
        </button>
      </div>
    </section>
  );
}
