"use client";

import { LEVELS, isLevel, type Category, type Level } from "@/domain";
import { usePersistentState } from "@/hooks/usePersistentState";
import { filterByLevel, levelsInCategory } from "@/lib/cards";
import { CardCarousel } from "./CardCarousel";
import { QuizCardBack, QuizCardFront } from "./QuizCardFaces";
import { VocabCardBack, VocabCardFront } from "./VocabCardFaces";
import { MatchGame } from "./MatchGame";

/**
 * Kategori sayfasının sekmeli etkileşimli gövdesi — PRD 3.C + Oyunlaştırma.
 *
 * Sekmeler, seviye filtresi ve tersine mod burada yaşar; hepsi kullanıcı
 * tercihleri olup localStorage'da saklanır.
 */

const REVERSE_KEY = "englishtimenow:reverse";
const LEVELS_KEY = "englishtimenow:levels";

export function CategoryCards({ category }: { category: Category }) {
  const [reversed, setReversed] = usePersistentState<boolean>({
    key: REVERSE_KEY,
    fallback: false,
    parse: (raw) => (raw === "1" ? true : raw === "0" ? false : null),
    serialize: (value) => (value ? "1" : "0"),
  });

  const [levels, setLevels] = usePersistentState<readonly Level[]>({
    key: LEVELS_KEY,
    fallback: [],
    parse: (raw) => raw.split(",").filter(isLevel),
    serialize: (value) => value.join(","),
  });

  const [activeTab, setActiveTab] = usePersistentState<"learn" | "quiz" | "match">({
    key: `englishtimenow:active-tab:${category.slug}`,
    fallback: "learn",
    parse: (raw) => (raw === "learn" || raw === "quiz" || raw === "match" ? raw : null),
    serialize: (value) => value,
  });

  const available = levelsInCategory(category);
  const vocab = filterByLevel(category.vocab, levels);
  const quiz = filterByLevel(category.quiz, levels);

  function toggleLevel(level: Level) {
    const next = levels.includes(level)
      ? levels.filter((candidate) => candidate !== level)
      : [...levels, level];
    setLevels(LEVELS.filter((candidate) => next.includes(candidate)));
  }

  const vocabKey = `${levels.join("-")}|${reversed}`;
  const quizKey = levels.join("-");

  return (
    <>
      {/* Üst Filtre Paneli */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-black/5 bg-white/50 p-3 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/3">
        <div
          role="group"
          aria-label="Seviye filtresi"
          className="flex items-center gap-2"
        >
          <span className="text-sm text-black/60 dark:text-white/60">Seviye</span>
          {available.map((level) => {
            const active = levels.includes(level);
            return (
              <button
                key={level}
                type="button"
                aria-pressed={active}
                onClick={() => toggleLevel(level)}
                className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                  active
                    ? "border-transparent bg-black text-white shadow-lg shadow-black/15 dark:bg-white dark:text-black"
                    : "border-black/10 bg-white/60 backdrop-blur-xl hover:bg-white/90 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                }`}
              >
                {level}
              </button>
            );
          })}
          {levels.length === 0 ? (
            <span className="text-xs text-black/45 dark:text-white/45">
              (hepsi gösteriliyor)
            </span>
          ) : null}
        </div>

        {/* Tersine Mod sadece Öğrenme sekmesinde gösterilir */}
        {activeTab === "learn" ? (
          <button
            type="button"
            aria-pressed={reversed}
            onClick={() => setReversed(!reversed)}
            className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none ${
              reversed
                ? "border-transparent bg-black text-white shadow-lg shadow-black/15 dark:bg-white dark:text-black"
                : "border-black/10 bg-white/60 backdrop-blur-xl hover:bg-white/90 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            }`}
          >
            <span aria-hidden="true" className="mr-1.5">
              ⇄
            </span>
            Tersine kart modu
          </button>
        ) : null}
      </div>

      {/* Sekme Yönlendirme Barı (Sleek Capsule Tabs) */}
      <div className="mt-8 flex border-b border-black/10 dark:border-white/10" role="tablist" aria-label="Kategori modları">
        <button
          id="tab-learn"
          type="button"
          role="tab"
          aria-selected={activeTab === "learn"}
          aria-controls="panel-learn"
          onClick={() => setActiveTab("learn")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-t-lg ${
            activeTab === "learn"
              ? "border-black text-black dark:border-white dark:text-white"
              : "border-transparent text-black/50 hover:text-black/80 dark:text-white/50 dark:hover:text-white/80"
          }`}
        >
          Öğren (Kartlar) <Count shown={vocab.length} total={category.vocab.length} />
        </button>

        <button
          id="tab-quiz"
          type="button"
          role="tab"
          aria-selected={activeTab === "quiz"}
          aria-controls="panel-quiz"
          onClick={() => setActiveTab("quiz")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-t-lg ${
            activeTab === "quiz"
              ? "border-black text-black dark:border-white dark:text-white"
              : "border-transparent text-black/50 hover:text-black/80 dark:text-white/50 dark:hover:text-white/80"
          }`}
        >
          Sınav (Test) <Count shown={quiz.length} total={category.quiz.length} />
        </button>

        <button
          id="tab-match"
          type="button"
          role="tab"
          aria-selected={activeTab === "match"}
          aria-controls="panel-match"
          onClick={() => setActiveTab("match")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-t-lg ${
            activeTab === "match"
              ? "border-black text-black dark:border-white dark:text-white"
              : "border-transparent text-black/50 hover:text-black/80 dark:text-white/50 dark:hover:text-white/80"
          }`}
        >
          Oyna (Eşleştirme)
        </button>
      </div>

      {/* Aktif Sekme Gövdesi */}
      <div className="mt-4">
        {activeTab === "learn" && (
          <div id="panel-learn" role="tabpanel" aria-labelledby="tab-learn">
            <CardCarousel
              key={vocabKey}
              label="Kelime kartları"
              emptyMessage="Seçili seviyede kelime kartı yok."
              items={vocab.map((card) => ({
                id: card.id,
                front: (
                  <VocabCardFront card={card} theme={category.theme} reversed={reversed} />
                ),
                back: (
                  <VocabCardBack card={card} theme={category.theme} reversed={reversed} />
                ),
              }))}
            />
          </div>
        )}

        {activeTab === "quiz" && (
          <div id="panel-quiz" role="tabpanel" aria-labelledby="tab-quiz">
            <CardCarousel
              key={quizKey}
              label="Test kartları"
              emptyMessage="Seçili seviyede test kartı yok."
              items={quiz.map((card) => ({
                id: card.id,
                front: <QuizCardFront card={card} theme={category.theme} />,
                back: <QuizCardBack card={card} theme={category.theme} />,
              }))}
            />
          </div>
        )}

        {activeTab === "match" && (
          <div id="panel-match" role="tabpanel" aria-labelledby="tab-match">
            <MatchGame category={category} levels={levels} />
          </div>
        )}
      </div>
    </>
  );
}

/** Filtre etkinken "7 / 15", değilken sadece "15". */
function Count({ shown, total }: { shown: number; total: number }) {
  return (
    <span className="font-normal text-xs ml-1 opacity-70">
      ({shown === total ? total : `${shown} / ${total}`})
    </span>
  );
}
