import type { ColorTheme, QuizCard } from "@/domain";
import { themeTokens } from "@/domain";
import { CardShell } from "./CardShell";
import { FlipButton } from "./FlipButton";
import { QuizInteraction } from "./QuizInteraction";

/**
 * Test kartının iki yüzü — PRD 2.D.
 *
 * Soru yüzünün etkileşimi `QuizInteraction`'a devredilmiştir; burada yalnızca
 * kabuk ve cevap yüzü var.
 */

export function QuizCardFront({
  card,
  theme,
  isStarred = false,
  onToggleStar,
}: {
  card: QuizCard;
  theme: ColorTheme;
  isStarred?: boolean;
  onToggleStar?: () => void;
}) {
  return (
    <CardShell
      theme={theme}
      level={card.level}
      label="Soru"
      isStarred={isStarred}
      onToggleStar={onToggleStar}
      actions={<FlipButton theme={theme} label="Cevabı göster" />}
    >
      <QuizInteraction card={card} theme={theme} />
    </CardShell>
  );
}

export function QuizCardBack({
  card,
  theme,
  isStarred = false,
  onToggleStar,
}: {
  card: QuizCard;
  theme: ColorTheme;
  isStarred?: boolean;
  onToggleStar?: () => void;
}) {
  const tokens = themeTokens(theme);

  return (
    <CardShell
      theme={theme}
      level={card.level}
      label="Cevap"
      isStarred={isStarred}
      onToggleStar={onToggleStar}
      actions={<FlipButton theme={theme} label="Soruya dön" />}
    >
      <div className="flex flex-1 flex-col justify-center gap-4">
        <p lang="en" className="text-3xl leading-tight font-bold text-balance">
          {card.answer}
        </p>
        <p className={`text-base leading-relaxed ${tokens.muted}`}>{card.explanation}</p>
      </div>
    </CardShell>
  );
}
