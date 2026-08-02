"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Web Speech API ile telaffuz — PRD 3.C.
 *
 * Tarayıcının yerleşik ses motorunu kullanır: ne sunucu ne de ses dosyası
 * gerekir, statik hosting kısıtına dokunmaz.
 *
 * BU API TUTARSIZDIR; aşağıdakiler gerçek davranışlardır, savunma değil:
 *
 * - `getVoices()` ilk çağrıda çoğu tarayıcıda **boş dizi** döner. Sesler
 *   asenkron yüklenir ve `voiceschanged` olayıyla bildirilir. Yalnızca ilk
 *   çağrıya güvenen kod, sesler yüklendiği halde "ses yok" sanır.
 * - İngilizce ses her cihazda kurulu **değildir**. Bu durumda buton etkin
 *   görünüp sessiz kalmamalı; `supported` bunu bildirir.
 * - iOS Safari, konuşmayı bir **kullanıcı hareketi** olmadan başlatmaz.
 *   Bu yüzden `speak` yalnızca butona basıldığında çağrılır, otomatik değil.
 * - Chrome, `SpeechSynthesisUtterance` nesnesini konuşma bitmeden çöp
 *   toplayabilir ve ses ortada kesilir. Nesne bu yüzden ref'te tutulur.
 *
 * SSR: `supported` `false` başlar. Sunucu ile ilk istemci render'ı böylece
 * aynı çıktıyı üretir, hydration uyuşmazlığı olmaz; gerçek değer efekt
 * içinde belirlenir.
 */
export function useSpeech(lang = "en-US") {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  // Konuşma çalışma zamanında da başarısız olabilir (ses aygıtı yok, ağ sesi
  // indirilemedi). Sessiz kalmak kullanıcıya "bozuk" hissi verir; hata
  // arayüzde gösterilebilsin diye durum olarak tutuluyor.
  const [failed, setFailed] = useState(false);
  const voice = useRef<SpeechSynthesisVoice | null>(null);
  const held = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const synth = window.speechSynthesis;
    const wanted = lang.slice(0, 2).toLowerCase();

    function pickVoice() {
      // Bazı platformlar dili `en_US` biçiminde bildirir.
      const match = synth
        .getVoices()
        .find((candidate) =>
          candidate.lang.replace("_", "-").toLowerCase().startsWith(wanted),
        );
      voice.current = match ?? null;
      setSupported(match !== undefined);
    }

    pickVoice();
    synth.addEventListener("voiceschanged", pickVoice);

    return () => {
      synth.removeEventListener("voiceschanged", pickVoice);
      synth.cancel();
    };
  }, [lang]);

  const speak = useCallback(
    (text: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

      const synth = window.speechSynthesis;
      // Önceki söyleyiş iptal edilmezse kuyruğa eklenir; hızlı art arda
      // basışlarda kelimeler sıraya girip üst üste okunur.
      synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;

      // Ses ataması isteğe bağlı bir iyileştirmedir: `lang` tek başına da
      // tarayıcıya doğru sesi seçtirir. Atama başarısız olursa (geçersiz ses
      // nesnesi, platform farkı) konuşmanın tümüyle iptal olmaması için
      // ayrıca korunuyor — aksi halde buton sessizce hiçbir şey yapmaz.
      try {
        if (voice.current) utterance.voice = voice.current;
      } catch {
        // yalnızca `lang` ile devam edilir
      }
      // Öğrenen için hafif yavaş.
      utterance.rate = 0.9;
      utterance.onstart = () => {
        setSpeaking(true);
        setFailed(false);
      };
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => {
        setSpeaking(false);
        setFailed(true);
      };

      held.current = utterance;
      synth.speak(utterance);
    },
    [lang],
  );

  return { supported, speaking, failed, speak };
}
