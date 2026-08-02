"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

/**
 * localStorage'da saklanan tercih durumu.
 *
 * `useSyncExternalStore` kullanılıyor, `useState` + `useEffect` değil.
 * localStorage tanım gereği bir "harici depo"dur ve bu kanca tam onun için
 * vardır: efekt içinde senkron `setState` çağırmak kademeli render doğurur ve
 * React derleyici denetimi bunu hata olarak işaretler.
 *
 * HYDRATION — `getServerSnapshot` her zaman varsayılanı döndürür. Sunucu HTML'i
 * ile ilk istemci render'ı böylece birebir aynı olur; saklanan değer ancak
 * hydration bittikten sonra devreye girer. Doğrudan
 * `useState(() => localStorage.getItem(...))` yazmak statik export'ta klasik
 * hydration uyuşmazlığını üretir.
 *
 * REFERANS KARARLILIĞI — `getSnapshot` her çağrıda yeni bir nesne döndürürse
 * React sonsuz döngüye girer. Ham dize önbelleğe alınır ve yalnızca değiştiğinde
 * yeniden ayrıştırılır; dizi/nesne değerler böylece aynı referansı korur.
 *
 * YAN FAYDA — dinleyiciler `storage` olayına da bağlı olduğu için tercih
 * değişikliği açık diğer sekmelere kendiliğinden yansır.
 *
 * localStorage erişimi istisna fırlatabilir (gizli sekme, kapatılmış site
 * verisi, kota). Tercih saklamak kritik olmadığı için hatalar yutulur.
 */

const listeners = new Set<() => void>();

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  // Aynı sekmedeki yazmalar `storage` olayı üretmez; onları `notify` bildirir.
  window.addEventListener("storage", onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeRaw(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // yazılamadı — tercih bu oturumla sınırlı kalır
  }
  for (const listener of listeners) listener();
}

export function usePersistentState<T>({
  key,
  fallback,
  parse,
  serialize,
}: {
  key: string;
  fallback: T;
  /** Geçersiz/bozuk veri için `null` döndür; o durumda `fallback` kullanılır. */
  parse: (raw: string) => T | null;
  serialize: (value: T) => string;
}): [T, (value: T) => void] {
  // Varsayılan ilk render'da sabitlenir: çağıran taraf `fallback: []` gibi bir
  // literal geçerse her render'da yeni referans oluşur ve anlık görüntü
  // kararsızlaşırdı.
  const initial = useRef(fallback);
  const cache = useRef<{ raw: string | null; value: T } | null>(null);

  const getSnapshot = useCallback(() => {
    const raw = readRaw(key);
    if (cache.current === null || cache.current.raw !== raw) {
      const parsed = raw === null ? null : parse(raw);
      cache.current = { raw, value: parsed ?? initial.current };
    }
    return cache.current.value;
  }, [key, parse]);

  const getServerSnapshot = useCallback(() => initial.current, []);

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = useCallback(
    (next: T) => writeRaw(key, serialize(next)),
    [key, serialize],
  );

  return [value, setValue];
}
