"use client";

import { useRef, type MouseEvent, type PointerEvent } from "react";

/**
 * Yatay kaydırma algılama — PRD 3.B.
 *
 * Pointer Events kullanılıyor: dokunma, fare ve kalem tek kod yoluyla
 * karşılanır, ayrı `touch*` / `mouse*` çiftleri gerekmez.
 *
 * ⚠ POINTER CAPTURE'I `pointerdown`'DA ALMA — bu kritik.
 * Bir eleman pointer'ı yakaladığında tarayıcı, o dizinin sonundaki `click`
 * olayını gerçek hedefe değil **yakalayan elemana** gönderir. Kapsayıcı
 * `pointerdown` anında yakalarsa kartın içindeki her buton ("Anlamı göster",
 * "Dinle", "Kontrol et") sessizce ölür: görünür, etkin, odaklanabilir — ama
 * `onClick` hiç çalışmaz.
 *
 * Bu yüzden yakalama **tembel**: yalnızca hareket eşiği aşılıp bunun bir
 * kaydırma olduğu kesinleştiğinde alınır. Dokunuşlar hiç yakalama tetiklemez,
 * dolayısıyla butonlar normal çalışır.
 *
 * Not: `element.click()` ile yapılan sentetik tıklamalar bu yeniden
 * hedeflemeden etkilenmez. Bu hatayı yalnızca gerçek işaretçi girdisi
 * (CDP `Input.dispatchMouseEvent`, ya da elle deneme) ortaya çıkarır.
 *
 * DİĞER İKİ TUZAK
 * - Kaydırma bittiğinde tarayıcı yine bir `click` üretir; önlem alınmazsa her
 *   kaydırma aynı zamanda kartı çevirir. `suppressClickAfterSwipe` yakalama
 *   evresinde bu tıklamayı yutar.
 * - Dikey kaydırma çalınmamalı. Hareket daha çok dikeyse olay yok sayılır
 *   (kapsayıcıda ayrıca `touch-action: pan-y`).
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
  const start = useRef<{ x: number; y: number; id: number } | null>(null);
  const capturing = useRef(false);
  const swiped = useRef(false);

  /** Hareket yatay ve eşiği aşıyor mu? */
  function isSwipe(dx: number, dy: number): boolean {
    return Math.abs(dx) >= threshold && Math.abs(dx) >= Math.abs(dy);
  }

  function onPointerDown(event: PointerEvent<HTMLElement>) {
    // Yalnızca birincil düğme/parmak. Sağ tık ve çoklu dokunma yok sayılır.
    if (!event.isPrimary || event.button !== 0) return;
    start.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
    capturing.current = false;
    swiped.current = false;
    // Burada setPointerCapture YOK — bkz. dosya başlığı.
  }

  function onPointerMove(event: PointerEvent<HTMLElement>) {
    const origin = start.current;
    if (!origin || capturing.current) return;
    if (!isSwipe(event.clientX - origin.x, event.clientY - origin.y)) return;

    // Artık bunun bir kaydırma olduğu kesin. Parmak elemandan çıksa bile
    // `pointerup` alabilmek için pointer'ı şimdi yakala.
    capturing.current = true;
    try {
      event.currentTarget.setPointerCapture(origin.id);
    } catch {
      // Pointer artık aktif değilse tarayıcı istisna fırlatır. Yakalama bir
      // iyileştirmedir; olmadan da kaydırma çalışır.
    }
  }

  function finish(event: PointerEvent<HTMLElement>) {
    const origin = start.current;
    start.current = null;

    if (origin && capturing.current) {
      try {
        event.currentTarget.releasePointerCapture(origin.id);
      } catch {
        // zaten serbest bırakılmış
      }
    }
    capturing.current = false;
    return origin;
  }

  function onPointerUp(event: PointerEvent<HTMLElement>) {
    const origin = finish(event);
    if (!origin) return;

    const dx = event.clientX - origin.x;
    const dy = event.clientY - origin.y;
    if (!isSwipe(dx, dy)) return;

    swiped.current = true;
    if (dx < 0) onSwipeLeft();
    else onSwipeRight();
  }

  function onPointerCancel(event: PointerEvent<HTMLElement>) {
    finish(event);
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
    swipeHandlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel },
    suppressClickAfterSwipe,
  };
}
