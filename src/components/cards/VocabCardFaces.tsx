import type { ColorTheme, VocabCard } from "@/domain";
import { themeTokens } from "@/domain";
import { CardShell } from "./CardShell";

/**
 * Kelime kartının iki yüzü — PRD 2.C.
 *
 * Yüzler ayrı bileşenler: Faz 3'teki flip kabuğu ikisini aynı anda DOM'a koyup
 * birini `backface-visibility` ile gizleyecek. Tek bileşen içinde koşullu
 * render etmek o mekanizmayı imkânsız kılardı.
 *
 * DİL İŞARETLEMESİ: arayüz Türkçe (`<html lang="tr">`), bu yüzden her İngilizce
 * metin parçası kendi `lang="en"` niteliğini taşır. Ekran okuyucu o parçalarda
 * İngilizce sese geçer — dil öğrenme uygulamasında istenen davranış budur.
 */

export function VocabCardFront({
  card,
  theme,
  reversed = false,
}: {
  card: VocabCard;
  theme: ColorTheme;
  /** Tersine kart modu — PRD 3.C. Ön yüzde Türkçe karşılık gösterilir. */
  reversed?: boolean;
}) {
  const tokens = themeTokens(theme);

  return (
    <CardShell theme={theme} level={card.level} label="Ön yüz">
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
        {reversed ? (
          <p className="text-3xl font-semibold text-balance">{card.translation}</p>
        ) : (
          <>
            <p lang="en" className="text-3xl font-semibold text-balance">
              {card.term}
            </p>
            <p className={`font-mono text-sm ${tokens.muted}`}>{card.ipa}</p>
          </>
        )}
      </div>
    </CardShell>
  );
}

export function VocabCardBack({
  card,
  theme,
  reversed = false,
}: {
  card: VocabCard;
  theme: ColorTheme;
  reversed?: boolean;
}) {
  const tokens = themeTokens(theme);

  return (
    <CardShell theme={theme} level={card.level} label="Arka yüz">
      <div className="flex flex-1 flex-col gap-4">
        {reversed ? (
          <p lang="en" className="text-2xl font-semibold">
            {card.term}
          </p>
        ) : (
          <p className="text-2xl font-semibold">{card.translation}</p>
        )}

        <div className="space-y-1">
          <p lang="en" className="leading-relaxed">
            {card.example.en}
          </p>
          {/* PRD 2.C: örnek cümlenin Türkçesi parantez içinde, hemen alt satırda. */}
          <p className={`text-sm leading-relaxed ${tokens.muted}`}>({card.example.tr})</p>
        </div>

        <div className="space-y-1">
          <h3 className={`text-xs font-medium tracking-wide uppercase ${tokens.muted}`}>
            Kullanım
          </h3>
          <ul className="flex flex-wrap gap-2">
            {card.collocations.map((collocation) => (
              <li
                key={collocation}
                lang="en"
                className={`rounded-md border px-2 py-1 font-mono text-xs ${tokens.border}`}
              >
                {collocation}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </CardShell>
  );
}
