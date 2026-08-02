"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

/**
 * Kart çevirme davranışı — PRD 3.B.
 *
 * İçerikten bağımsızdır: yüzleri prop olarak alır, ne gösterdiğini bilmez.
 *
 * KATMANLAMA — bu bileşen **yalnızca** `rotateY` uygular. Konum, ölçek ve
 * opacity carousel'e ait ve onu saran elemana yazılır. İkisini aynı elemana
 * koymak `transform`'u çakıştırır.
 *
 * NEDEN KABUK BİR BUTON DEĞİL
 * Önceki tasarımda tüm kart `role="button"` taşıyordu. ARIA'da `button`
 * rolünün alt öğeleri **sunumsal** sayılır (axe-core rol tablosu:
 * `childrenPresentational: true`), yani kartın içine konan gerçek bir butona
 * — telaffuz butonu gibi — ekran okuyucu erişemez; axe bunu
 * `nested-interactive` olarak işaretler.
 *
 * Bu yüzden sorumluluklar ayrıldı:
 * - Kart yüzeyi yalnızca **işaretçi kolaylığıdır**: tıklayınca/dokununca
 *   çevirir (PRD 3.B). Erişilebilirlik ağacında bir denetim değildir.
 * - Çevirme işleminin asıl denetimi yüzlerin içindeki gerçek `<button>`,
 *   yani `FlipButton`. Klavye desteği ondan doğal olarak gelir.
 * - Yüzlerin içine başka butonlar (telaffuz) serbestçe konabilir.
 *
 * Görünmeyen yüz `inert` alır: `backface-visibility: hidden` yalnızca görsel
 * gizler, onsuz ekran okuyucu ve Tab sırası gizli yüzün içeriğine ulaşır.
 */

interface FlipState {
  flipped: boolean;
  toggle: () => void;
}

const FlipContext = createContext<FlipState | null>(null);

/** Yüzlerin içindeki denetimler çevirme durumuna buradan erişir. */
export function useFlip(): FlipState {
  const state = useContext(FlipContext);
  if (!state) throw new Error("useFlip yalnızca FlipCard içinde kullanılabilir.");
  return state;
}

export function FlipCard({
  front,
  back,
  interactive = true,
  className = "",
}: {
  front: ReactNode;
  back: ReactNode;
  /**
   * Carousel'de yalnızca merkezdeki kart etkindir. Etkisiz kart tümüyle
   * `inert` olur: odak sırasından, erişilebilirlik ağacından ve tıklamadan
   * aynı anda çıkar. `aria-hidden` tek başına yetmezdi — içindeki butonlar
   * odaklanabilir kalır ve "gizli ama odaklanabilir" ihlali doğardı.
   */
  interactive?: boolean;
  className?: string;
}) {
  const [flipped, setFlipped] = useState(false);
  const toggle = () => setFlipped((value) => !value);

  return (
    <FlipContext.Provider value={{ flipped, toggle }}>
      <div
        inert={!interactive}
        onClick={toggle}
        className={`h-full rounded-2xl perspective-distant select-none ${
          interactive ? "cursor-pointer" : ""
        } ${className}`}
      >
        <div
          className={`grid h-full transform-3d transition-transform duration-500 ease-out motion-reduce:transition-none ${
            flipped ? "rotate-y-180" : ""
          }`}
        >
          {/* İki yüz de aynı grid hücresinde: hücre en uzun yüze göre
              boyutlanır, böylece çevirirken kartın yüksekliği değişmez. */}
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
    </FlipContext.Provider>
  );
}
