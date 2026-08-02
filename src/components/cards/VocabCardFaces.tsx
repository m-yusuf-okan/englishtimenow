import type { ColorTheme, VocabCard } from "@/domain";
import { themeTokens } from "@/domain";
import { CardShell } from "./CardShell";
import { FlipButton } from "./FlipButton";
import { PronounceButton } from "./PronounceButton";

/**
 * Kelime kartının iki yüzü — PRD 2.C.
 *
 * Yüzler ayrı bileşenler: flip kabuğu ikisini aynı anda DOM'a koyup birini
 * `backface-visibility` ile gizler. Tek bileşen içinde koşullu render etmek o
 * mekanizmayı imkânsız kılardı.
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
    <CardShell
      theme={theme}
      level={card.level}
      label="Ön yüz"
      actions={
        <>
          <FlipButton
            theme={theme}
            label={reversed ? "İngilizcesini göster" : "Anlamı göster"}
          />
          {/* Tersine modda ön yüzde telaffuz YOK: buton İngilizce kelimeyi
              seslendirir ve aktif hatırlamanın istediği cevabı doğrudan ele
              verirdi. Arka yüzde, kelime açıldıktan sonra kullanılabilir. */}
          {reversed ? null : <PronounceButton text={card.term} />}
        </>
      }
    >
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
        {reversed ? (
          <p className="text-4xl leading-tight font-bold text-balance">
            {card.translation}
          </p>
        ) : (
          <>
            <p
              lang="en"
              className="text-5xl leading-tight font-bold tracking-tight text-balance"
            >
              {card.term}
            </p>
            <p className={`font-mono text-base ${tokens.muted}`}>{card.ipa}</p>
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
    <CardShell
      theme={theme}
      level={card.level}
      label="Arka yüz"
      actions={
        <>
          <FlipButton
            theme={theme}
            label={reversed ? "Türkçesine dön" : "Kelimeye dön"}
          />
          <PronounceButton text={card.term} />
        </>
      }
    >
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto">
        {reversed ? (
          <div>
            <p lang="en" className="text-3xl font-bold tracking-tight">
              {card.term}
            </p>
            <p className={`mt-1 font-mono text-sm ${tokens.muted}`}>{card.ipa}</p>
          </div>
        ) : (
          <p className="text-3xl leading-tight font-bold text-balance">
            {card.translation}
          </p>
        )}

        <div className="space-y-1.5">
          <p lang="en" className="text-lg leading-relaxed font-medium">
            {card.example.en}
          </p>
          {/* PRD 2.C: örnek cümlenin Türkçesi parantez içinde, hemen alt satırda. */}
          <p className={`text-sm leading-relaxed ${tokens.muted}`}>({card.example.tr})</p>
        </div>

        <div className="space-y-2">
          <h3
            className={`text-[0.7rem] font-semibold tracking-[0.14em] uppercase ${tokens.muted}`}
          >
            Kullanım
          </h3>
          <ul className="flex flex-wrap gap-2">
            {card.collocations.map((collocation) => (
              <li
                key={collocation}
                lang="en"
                className="rounded-lg border border-current/20 bg-current/5 px-2.5 py-1 font-mono text-xs"
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
