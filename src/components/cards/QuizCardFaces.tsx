import type { ColorTheme, QuizCard } from "@/domain";
import { CLOZE_BLANK, themeTokens } from "@/domain";
import { CardShell } from "./CardShell";

/**
 * Test kartının iki yüzü — PRD 2.D.
 *
 * `format` ayrık birleşim olduğu için her dal derleyici tarafından denetlenir;
 * yeni bir soru biçimi eklendiğinde burası derleme hatası verir.
 *
 * Faz 2 kapsamında şıklar yalnızca gösteriliyor, henüz seçilebilir değil —
 * cevap durumu yönetimi Faz 6'ya ait.
 */

/** Cloze sorusundaki `___` işaretini görsel bir boşluğa çevirir. */
function ClozePrompt({ prompt, muted }: { prompt: string; muted: string }) {
  const [before, after] = prompt.split(CLOZE_BLANK);

  return (
    <p lang="en" className="text-xl leading-relaxed">
      {before}
      <span
        aria-label="boşluk"
        className={`mx-1 inline-block w-24 border-b-2 border-dashed align-baseline ${muted}`}
      />
      {after}
    </p>
  );
}

export function QuizCardFront({ card, theme }: { card: QuizCard; theme: ColorTheme }) {
  const tokens = themeTokens(theme);

  return (
    <CardShell theme={theme} level={card.level} label="Soru">
      <div className="flex flex-1 flex-col justify-center gap-4">
        {card.format === "cloze" ? (
          <ClozePrompt prompt={card.prompt} muted={tokens.border} />
        ) : (
          <>
            <p lang="en" className="text-xl leading-relaxed">
              {card.prompt}
            </p>
            <ul className="grid gap-2">
              {card.options.map((option) => (
                <li
                  key={option}
                  lang="en"
                  className={`rounded-lg border px-3 py-2 ${tokens.border}`}
                >
                  {option}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </CardShell>
  );
}

export function QuizCardBack({ card, theme }: { card: QuizCard; theme: ColorTheme }) {
  const tokens = themeTokens(theme);

  return (
    <CardShell theme={theme} level={card.level} label="Cevap">
      <div className="flex flex-1 flex-col gap-4">
        <p lang="en" className="text-2xl font-semibold">
          {card.answer}
        </p>
        <p className={`text-sm leading-relaxed ${tokens.muted}`}>{card.explanation}</p>
      </div>
    </CardShell>
  );
}
