"use client";

import { useRef, type MouseEvent, type PointerEvent } from "react";

/**
 * Yatay kaydırma algılama — PRD 3.B.
 *
 * Pointer Events kullanılıyor: dokunma, fare ve kalem tek kod yoluyla
 * karşılanır, ayrı `touch*` / `mouse*` çiftleri gerekmez.
 *
 * ÇÖZDÜĞÜ ÜÇ TUZAK
 * 1. Kaydırma bittiğinde tarayıcı yine bir `click` üretir; önlem alınmazsa
 *    her kaydırma aynı zamanda kartı çevirir. `suppressClickAfterSwipe`
 *    yakalama (capture) evresinde bu tıklamayı yutar.
 * 2. Dikey kaydırma çalınmamalı. Hareket daha çok dikeyse olay yok sayılır ve
 *    sayfa normal şekilde kayar (kapsayıcıda ayrıca `touch-action: pan-y`).
 * 3. Parmak elemandan çıkarsa `pointerup` kaybolur; `setPointerCapture` ile
 *    olay aynı elemanda kalır.
 */
export interface SwipeOptions {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  /** Kaydırma sayılması için gereken en küçük yatay mesafe (piksel). */
  threshold?: number;
}

export function usePointerSwipe({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
}: SwipeOptions) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);

  function onPointerDown(event: PointerEvent<HTMLElement>) {
    // Yalnızca birincil düğme/parmak. Sağ tık ve çoklu dokunma yok sayılır.
    if (!event.isPrimary || event.button !== 0) return;
    start.current = { x: event.clientX, y: event.clientY };
    swiped.current = false;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Pointer artık aktif değilse tarayıcı istisna fırlatır. Yakalama bir
      // iyileştirmedir; olmadan da kaydırma çalışır, bu yüzden sessizce geçilir.
    }
  }

  function onPointerUp(event: PointerEvent<HTMLElement>) {
    const origin = start.current;
    start.current = null;
    if (!origin) return;

    const dx = event.clientX - origin.x;
    const dy = event.clientY - origin.y;

    // Dikey baskınsa bu bir kaydırma değil, sayfa gezinmesidir.
    if (Math.abs(dy) > Math.abs(dx)) return;
    if (Math.abs(dx) < threshold) return;

    swiped.current = true;
    if (dx < 0) onSwipeLeft();
    else onSwipeRight();
  }

  function onPointerCancel() {
    start.current = null;
  }

  /**
   * Kapsayıcıya `onClickCapture` olarak bağlanır. Kaydırmanın hemen ardından
   * gelen sentetik tıklamayı durdurur, böylece kart çevrilmez.
   */
  function suppressClickAfterSwipe(event: MouseEvent<HTMLElement>) {
    if (!swiped.current) return;
    swiped.current = false;
    event.stopPropagation();
    event.preventDefault();
  }

  return {
    swipeHandlers: { onPointerDown, onPointerUp, onPointerCancel },
    suppressClickAfterSwipe,
  };
}
