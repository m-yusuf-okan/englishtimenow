"use client";

import { useState, useMemo } from "react";
import { LEVELS, isLevel, type Category, type Level } from "@/domain";
import { usePersistentState } from "@/hooks/usePersistentState";
import { filterByLevel, levelsInCategory, getBaseId } from "@/lib/cards";
import { CardCarousel } from "./CardCarousel";
import { QuizCardBack, QuizCardFront } from "./QuizCardFaces";
import { VocabCardBack, VocabCardFront } from "./VocabCardFaces";
import { MatchGame } from "./MatchGame";

/**
 * Kategori sayfasının sekmeli etkileşimli gövdesi — PRD 3.C + Favoriler + Karıştırma.
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

  // Yıldızlı kelime listesi (Global)
  const [starred, setStarred] = usePersistentState<readonly string[]>({
    key: "englishtimenow:starred",
    fallback: [],
    parse: (raw) => raw.split(",").filter(Boolean),
    serialize: (value) => value.join(","),
  });

  // "Sadece Yıldızlılar" filtre durumu
  const [onlyStarred, setOnlyStarred] = usePersistentState<boolean>({
    key: `englishtimenow:only-starred:${category.slug}`,
    fallback: false,
    parse: (raw) => (raw === "1" ? true : raw === "0" ? false : null),
    serialize: (value) => (value ? "1" : "0"),
  });

  // Karıştırma durumları (Oturum bazlı)
  const [shuffled, setShuffled] = useState(false);
  const [shuffleSeed, setShuffleSeed] = useState(0);

  const toggleShuffle = () => {
    if (!shuffled) {
      setShuffleSeed(Math.random());
    }
    setShuffled(!shuffled);
  };

  const reShuffle = () => {
    setShuffleSeed(Math.random());
  };

  function toggleStar(id: string) {
    const baseId = getBaseId(id);
    const isStarred = starred.includes(baseId);
    const next = isStarred
      ? starred.filter((item) => item !== baseId)
      : [...starred, baseId];
    setStarred(next);
  }

  const available = levelsInCategory(category);

  // Yıldız filtresine göre filtreleme mantığı
  const baseFilter = (card: { id: string }) => {
    if (!onlyStarred) return true;
    return starred.includes(getBaseId(card.id));
  };

  // Seviye filtresine göre filtrele
  const vocabFiltered = useMemo(() => {
    return filterByLevel(category.vocab, levels).filter(baseFilter);
  }, [category.vocab, levels, onlyStarred, starred]);

  const quizFiltered = useMemo(() => {
    return filterByLevel(category.quiz, levels).filter(baseFilter);
  }, [category.quiz, levels, onlyStarred, starred]);

  // Karıştırma işlemi
  const finalVocab = useMemo(() => {
    if (!shuffled) return vocabFiltered;
    const list = [...vocabFiltered];
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j]!, list[i]!];
    }
    return list;
  }, [vocabFiltered, shuffled, shuffleSeed]);

  const finalQuiz = useMemo(() => {
    if (!shuffled) return quizFiltered;
    const list = [...quizFiltered];
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j]!, list[i]!];
    }
    return list;
  }, [quizFiltered, shuffled, shuffleSeed]);

  function toggleLevel(level: Level) {
    const next = levels.includes(level)
      ? levels.filter((candidate) => candidate !== level)
      : [...levels, level];
    setLevels(LEVELS.filter((candidate) => next.includes(candidate)));
  }

  // Karıştırılınca veya modlar değişince carousel'i remount edip sıfırlamak için key'i güncelliyoruz
  const vocabKey = `${levels.join("-")}|${reversed}|${shuffled ? shuffleSeed : "default"}`;
  const quizKey = `${levels.join("-")}|${shuffled ? shuffleSeed : "default"}`;

  return (
    <>
      {/* Üst Filtre Paneli */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-black/5 bg-white/50 p-3 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/3">
        <div className="flex flex-wrap items-center gap-4">
          {/* Seviye Seçimi */}
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

          {/* Yıldızlı Filtresi */}
          <button
            type="button"
            aria-pressed={onlyStarred}
            onClick={() => setOnlyStarred(!onlyStarred)}
            className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none cursor-pointer ${
              onlyStarred
                ? "border-transparent bg-amber-500 text-white shadow-lg shadow-amber-500/15"
                : "border-black/10 bg-white/60 backdrop-blur-xl hover:bg-white/90 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            }`}
          >
            ⭐ Sadece Yıldızlılar
          </button>

          {/* Karıştırma Seçeneği (Eşleştirme oyunu zaten karışıktır) */}
          {activeTab !== "match" && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                aria-pressed={shuffled}
                onClick={toggleShuffle}
                className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none cursor-pointer ${
                  shuffled
                    ? "border-transparent bg-indigo-600 text-white shadow-lg shadow-indigo-600/15 dark:bg-indigo-500"
                    : "border-black/10 bg-white/60 backdrop-blur-xl hover:bg-white/90 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                }`}
              >
                🔀 Karıştır
              </button>
              {shuffled && (
                <button
                  type="button"
                  onClick={reShuffle}
                  title="Yeniden Karıştır"
                  className="rounded-full border border-black/10 bg-white/60 p-1 text-sm transition-transform active:scale-95 hover:bg-white/90 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 cursor-pointer"
                >
                  🔄
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tersine Mod (Sadece Öğrenme sekmesinde gösterilir) */}
        {activeTab === "learn" ? (
          <button
            type="button"
            aria-pressed={reversed}
            onClick={() => setReversed(!reversed)}
            className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none cursor-pointer ${
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
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-t-lg cursor-pointer ${
            activeTab === "learn"
              ? "border-black text-black dark:border-white dark:text-white"
              : "border-transparent text-black/50 hover:text-black/80 dark:text-white/50 dark:hover:text-white/80"
          }`}
        >
          Öğren (Kartlar) <Count shown={finalVocab.length} total={category.vocab.length} />
        </button>

        <button
          id="tab-quiz"
          type="button"
          role="tab"
          aria-selected={activeTab === "quiz"}
          aria-controls="panel-quiz"
          onClick={() => setActiveTab("quiz")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-t-lg cursor-pointer ${
            activeTab === "quiz"
              ? "border-black text-black dark:border-white dark:text-white"
              : "border-transparent text-black/50 hover:text-black/80 dark:text-white/50 dark:hover:text-white/80"
          }`}
        >
          Sınav (Test) <Count shown={finalQuiz.length} total={category.quiz.length} />
        </button>

        <button
          id="tab-match"
          type="button"
          role="tab"
          aria-selected={activeTab === "match"}
          aria-controls="panel-match"
          onClick={() => setActiveTab("match")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-t-lg cursor-pointer ${
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
              emptyMessage={onlyStarred ? "Yıldızlı kelime kartınız bulunmuyor." : "Seçili seviyede kelime kartı yok."}
              items={finalVocab.map((card) => {
                const isStarred = starred.includes(getBaseId(card.id));
                return {
                  id: card.id,
                  front: (
                    <VocabCardFront
                      card={card}
                      theme={category.theme}
                      reversed={reversed}
                      isStarred={isStarred}
                      onToggleStar={() => toggleStar(card.id)}
                    />
                  ),
                  back: (
                    <VocabCardBack
                      card={card}
                      theme={category.theme}
                      reversed={reversed}
                      isStarred={isStarred}
                      onToggleStar={() => toggleStar(card.id)}
                    />
                  ),
                };
              })}
            />
          </div>
        )}

        {activeTab === "quiz" && (
          <div id="panel-quiz" role="tabpanel" aria-labelledby="tab-quiz">
            <CardCarousel
              key={quizKey}
              label="Test kartları"
              emptyMessage={onlyStarred ? "Yıldızlı kelimelerinize ait test kartı bulunmuyor." : "Seçili seviyede test kartı yok."}
              items={finalQuiz.map((card) => {
                const isStarred = starred.includes(getBaseId(card.id));
                return {
                  id: card.id,
                  front: (
                    <QuizCardFront
                      card={card}
                      theme={category.theme}
                      isStarred={isStarred}
                      onToggleStar={() => toggleStar(card.id)}
                    />
                  ),
                  back: (
                    <QuizCardBack
                      card={card}
                      theme={category.theme}
                      isStarred={isStarred}
                      onToggleStar={() => toggleStar(card.id)}
                    />
                  ),
                };
              })}
            />
          </div>
        )}

        {activeTab === "match" && (
          <div id="panel-match" role="tabpanel" aria-labelledby="tab-match">
            <MatchGame
              category={category}
              levels={levels}
              onlyStarred={onlyStarred}
              starredList={starred}
            />
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
