"use client";

import { useState } from "react";
import { CLOZE_BLANK, themeTokens, type ColorTheme, type QuizCard } from "@/domain";
import { isAnswerCorrect } from "@/lib/quiz";

/**
 * Test kartının cevaplanabilir ön yüzü — PRD 2.D.
 *
 * İki biçim de aynı durumu paylaşır: `submitted` bir kez dolduktan sonra soru
 * kilitlenir ve geri bildirim gösterilir.
 *
 * - Tıklamalar `stopPropagation` ile durdurulur. Kart yüzeyi tıklamayla
 *   çeviriyor; şık seçmek ya da girişe tıklamak kartı çevirmemeli.
 * - Doğru/yanlış **yalnızca renkle** anlatılmaz; her durumda metin ve simge
 *   eşlik eder (WCAG 1.4.1).
 * - Sonuç `aria-live` bölgesinde duyurulur; ekran okuyucu kullanıcısı geri
 *   bildirimi görmeden de öğrenir.
 * - Doğruluk renkleri karta göre değişmez: tema rengi kategoriyi ayırt etmek
 *   içindir, "doğru" her kategoride aynı yeşil olmalıdır.
 */
export function QuizInteraction({ card, theme }: { card: QuizCard; theme: ColorTheme }) {
  const [submitted, setSubmitted] = useState<string | null>(null);
  const tokens = themeTokens(theme);

  const answered = submitted !== null;
  const correct = answered && isAnswerCorrect(card, submitted);

  return (
    <div
      // Kart yüzeyine ulaşmasın: seçim yapmak kartı çevirmemeli.
      onClick={(event) => event.stopPropagation()}
      className="flex flex-1 flex-col justify-center gap-3 sm:gap-4"
    >
      {card.format === "cloze" ? (
        <ClozeQuestion card={card} answered={answered} onSubmit={setSubmitted} />
      ) : (
        <MultipleChoiceQuestion
          card={card}
          submitted={submitted}
          onSubmit={setSubmitted}
          muted={tokens.muted}
        />
      )}

      <p aria-live="polite" className="min-h-6 text-sm font-medium">
        {answered ? (
          correct ? (
            <span className="text-emerald-700 dark:text-emerald-300">✓ Doğru</span>
          ) : (
            <span className="text-rose-700 dark:text-rose-300">
              ✗ Yanlış — doğrusu: <span lang="en">{card.answer}</span>
            </span>
          )
        ) : null}
      </p>
    </div>
  );
}

function ClozeQuestion({
  card,
  answered,
  onSubmit,
}: {
  card: QuizCard & { format: "cloze" };
  answered: boolean;
  onSubmit: (value: string) => void;
}) {
  const [value, setValue] = useState("");
  const [before, after] = card.prompt.split(CLOZE_BLANK);

  function submit() {
    if (answered || value.trim().length === 0) return;
    onSubmit(value);
  }

  return (
    <div className="space-y-3">
      <p lang="en" className="text-lg sm:text-xl leading-relaxed">
        {before}
        <input
          type="text"
          value={value}
          lang="en"
          disabled={answered}
          aria-label="Boşluğa gelecek kelime"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") submit();
          }}
          className="mx-1 w-36 rounded-md border-b-2 border-dashed border-current/50 bg-current/5 px-2 py-0.5 text-center font-semibold focus:border-solid focus:bg-current/10 focus:outline-none disabled:opacity-70"
        />
        {after}
      </p>

      {answered ? null : (
        <button
          type="button"
          onClick={submit}
          className="self-start rounded-full border border-current/30 px-4 py-2 text-sm font-semibold transition-transform hover:scale-[1.03] hover:bg-current/10 focus-visible:ring-2 focus-visible:outline-none active:scale-95"
        >
          Kontrol et
        </button>
      )}
    </div>
  );
}

function MultipleChoiceQuestion({
  card,
  submitted,
  onSubmit,
  muted,
}: {
  card: QuizCard & { format: "multiple-choice" };
  submitted: string | null;
  onSubmit: (value: string) => void;
  muted: string;
}) {
  const answered = submitted !== null;

  return (
    <>
      <p lang="en" className="text-lg sm:text-xl leading-relaxed">
        {card.prompt}
      </p>

      <div role="group" aria-label="Şıklar" className="grid gap-2">
        {card.options.map((option) => {
          const chosen = submitted === option;
          const isAnswer = option === card.answer;

          // Cevaplandıktan sonra doğru şık her hâlükârda işaretlenir; yanlış
          // seçen kullanıcı doğrusunu görmek için kartı çevirmek zorunda kalmaz.
          const state = !answered
            ? "idle"
            : isAnswer
              ? "correct"
              : chosen
                ? "wrong"
                : "muted";

          return (
            <button
              key={option}
              type="button"
              lang="en"
              // `disabled` yerine `aria-disabled`: kilitlenince odak seçilen
              // şıkta kalır, `disabled` olsaydı odak gövdeye düşerdi.
              aria-disabled={answered}
              aria-label={answered && isAnswer ? `${option} — doğru cevap` : undefined}
              onClick={() => {
                if (!answered) onSubmit(option);
              }}
              className={`rounded-xl border px-3 py-2.5 sm:px-4 sm:py-3 text-left text-sm sm:text-base font-medium transition-all focus-visible:ring-2 focus-visible:outline-none ${STATE_CLASSES[state]} ${
                state === "muted" ? muted : ""
              } ${answered ? "cursor-default" : "hover:translate-x-0.5 hover:bg-current/10"}`}
            >
              <span aria-hidden="true" className="mr-2 inline-block w-4">
                {answered && isAnswer ? "✓" : answered && chosen ? "✗" : ""}
              </span>
              {option}
            </button>
          );
        })}
      </div>
    </>
  );
}

/** Doğruluk renkleri temadan bağımsızdır — bkz. bileşen başlığı. */
const STATE_CLASSES = {
  idle: "border-current/25",
  correct: "border-emerald-500 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200",
  wrong: "border-rose-500 bg-rose-500/15 text-rose-800 dark:text-rose-200",
  muted: "border-current/15 opacity-60",
} as const;
