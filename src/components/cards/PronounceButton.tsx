"use client";

import { useSpeech } from "@/hooks/useSpeech";

/**
 * Sesli telaffuz butonu — PRD 2.C.
 *
 * - `stopPropagation`: kart yüzeyi tıklamayla çevriliyor; olay yukarı
 *   bırakılırsa kelimeyi dinlemek isteyen kullanıcı kartı da çevirmiş olur.
 * - İngilizce ses motoru yoksa buton **devre dışı** görünür. Etkin görünüp
 *   sessiz kalan bir buton en kötü seçenektir.
 * - Konuşma başladıktan sonra da başarısız olabilir (ses aygıtı yok, ağ sesi
 *   inmedi). O durumda buton görünür bir uyarıya döner; sessizce hiçbir şey
 *   olmaması kullanıcıya uygulamanın bozuk olduğunu düşündürür.
 * - Konuşma bir kullanıcı hareketiyle başlar; iOS Safari başka türlüsüne
 *   izin vermez.
 */
export function PronounceButton({ text }: { text: string }) {
  const { supported, speaking, failed, speak } = useSpeech();

  const label = !supported
    ? "Bu cihazda İngilizce ses motoru yok"
    : failed
      ? "Ses çalınamadı — tekrar dene"
      : `${text} kelimesini dinle`;

  return (
    <button
      type="button"
      disabled={!supported}
      aria-label={label}
      title={label}
      onClick={(event) => {
        event.stopPropagation();
        speak(text);
      }}
      className={`inline-flex items-center gap-2 rounded-full border border-current/30 px-4 py-2 text-sm font-semibold transition-all hover:scale-[1.03] hover:bg-current/10 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 ${
        speaking ? "animate-pulse" : ""
      }`}
    >
      <span aria-hidden="true">{failed ? "🔇" : speaking ? "🔊" : "🔈"}</span>
      {failed ? "Tekrar dene" : "Dinle"}
    </button>
  );
}
