"use client";

import { LEVELS, isLevel, type Category, type Level } from "@/domain";
import { usePersistentState } from "@/hooks/usePersistentState";
import { filterByLevel, levelsInCategory } from "@/lib/cards";
import { CardCarousel } from "./CardCarousel";
import { QuizCardBack, QuizCardFront } from "./QuizCardFaces";
import { VocabCardBack, VocabCardFront } from "./VocabCardFaces";

/**
 * Kategori sayfasının etkileşimli gövdesi — PRD 3.C.
 *
 * Tersine kart modu ve seviye filtresi burada yaşar; ikisi de kullanıcı
 * tercihi olduğu için localStorage'da saklanır.
 *
 * Kart içeriği sunucudan **veri** olarak gelir (`category`), önceden render
 * edilmiş eleman olarak değil. Sebebi tersine mod: aynı kart iki farklı yüz
 * düzeniyle gösterilebiliyor ve her iki varyantı sunucuda üretip taşımak
 * yükü iki katına çıkarırdı.
 *
 * PROGRE TAKİBİ KAPSAM DIŞI — burada saklanan tek şey mod ve filtre tercihi.
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
    // Bilinmeyen değerler sessizce atılır: içerikten bir seviye kalkarsa
    // eski tercih uygulamayı bozmamalı.
    parse: (raw) => raw.split(",").filter(isLevel),
    serialize: (value) => value.join(","),
  });

  const available = levelsInCategory(category);
  const vocab = filterByLevel(category.vocab, levels);
  const quiz = filterByLevel(category.quiz, levels);

  function toggleLevel(level: Level) {
    const next = levels.includes(level)
      ? levels.filter((candidate) => candidate !== level)
      : [...levels, level];
    // Kanonik sırada saklanır; böylece aynı seçim her zaman aynı dizeyi üretir.
    setLevels(LEVELS.filter((candidate) => next.includes(candidate)));
  }

  // Filtre veya mod değişince carousel'ler sıfırdan başlar. Kart kümesi
  // değiştiğinde eski konumu korumak anlamsız olurdu; ayrıca çevrilmiş kart ve
  // cevaplanmış soru durumları da temizlenir.
  const vocabKey = `${levels.join("-")}|${reversed}`;
  const quizKey = levels.join("-");

  return (
    <>
      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-black/5 bg-white/50 p-3 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/3">
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
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold tracking-tight">
          Kelime kartları <Count shown={vocab.length} total={category.vocab.length} />
        </h2>
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

      <div className="mt-14">
        <h2 className="text-xl font-bold tracking-tight">
          Test kartları <Count shown={quiz.length} total={category.quiz.length} />
        </h2>
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
    </>
  );
}

/** Filtre etkinken "7 / 15", değilken sadece "15". */
function Count({ shown, total }: { shown: number; total: number }) {
  return (
    <span className="font-normal">
      ({shown === total ? total : `${shown} / ${total}`})
    </span>
  );
}
