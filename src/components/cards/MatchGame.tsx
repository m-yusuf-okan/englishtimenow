"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { usePersistentState } from "@/hooks/usePersistentState";
import { themeTokens } from "@/domain";
import type { Category, ColorTheme, Level, VocabCard } from "@/domain";
import { filterByLevel } from "@/lib/cards";

interface GameCard {
  readonly id: string;
  readonly vocabId: string;
  readonly type: "term" | "translation";
  readonly text: string;
}

export function MatchGame({
  category,
  levels,
}: {
  category: Category;
  levels: readonly Level[];
}) {
  const tokens = themeTokens(category.theme);

  // Filtrelenmiş kelimeler
  const vocabList = useMemo(() => {
    return filterByLevel(category.vocab, levels);
  }, [category.vocab, levels]);

  // Seviye filtresine göre benzersiz depolama anahtarı
  const bestTimeKey = useMemo(() => {
    const levelStr = [...levels].sort().join("-");
    return `englishtimenow:best:${category.slug}:${levelStr || "all"}`;
  }, [category.slug, levels]);

  const [bestTime, setBestTime] = usePersistentState<number | null>({
    key: bestTimeKey,
    fallback: null,
    parse: (raw) => (raw ? parseFloat(raw) : null),
    serialize: (value) => (value !== null ? value.toString() : ""),
  });

  const [gameState, setGameState] = useState<"idle" | "playing" | "completed">("idle");
  const [cards, setCards] = useState<readonly GameCard[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [matched, setMatched] = useState<ReadonlySet<string>>(new Set());
  const [incorrect, setIncorrect] = useState<ReadonlySet<string>>(new Set());
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isNewRecord, setIsNewRecord] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const incorrectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Oyunu başlat/sıfırla
  const initGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (incorrectTimeoutRef.current) clearTimeout(incorrectTimeoutRef.current);

    setGameState("idle");
    setSelected(null);
    setMatched(new Set());
    setIncorrect(new Set());
    setElapsedTime(0);
    setIsNewRecord(false);
    startTimeRef.current = null;

    if (vocabList.length < 3) {
      setCards([]);
      return;
    }

    // Rastgele 4 kelime seç
    const shuffledVocab = [...vocabList].sort(() => Math.random() - 0.5);
    const selectedVocab = shuffledVocab.slice(0, Math.min(vocabList.length, 4));

    // Kart çiftlerini oluştur
    const termCards: GameCard[] = selectedVocab.map((v) => ({
      id: `${v.id}-term`,
      vocabId: v.id,
      type: "term",
      text: v.term,
    }));

    const translationCards: GameCard[] = selectedVocab.map((v) => ({
      id: `${v.id}-tr`,
      vocabId: v.id,
      type: "translation",
      text: v.translation,
    }));

    // Kartları karıştır (Fisher-Yates)
    const allCards = [...termCards, ...translationCards];
    for (let i = allCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allCards[i], allCards[j]] = [allCards[j]!, allCards[i]!];
    }

    setCards(allCards);
  };

  // Seviye veya kelimeler değişirse oyunu otomatik sıfırla
  useEffect(() => {
    initGame();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (incorrectTimeoutRef.current) clearTimeout(incorrectTimeoutRef.current);
    };
  }, [vocabList, bestTimeKey]);

  // Zamanlayıcı
  useEffect(() => {
    if (gameState === "playing") {
      startTimeRef.current = Date.now() - elapsedTime * 1000;
      timerRef.current = setInterval(() => {
        if (startTimeRef.current !== null) {
          const delta = (Date.now() - startTimeRef.current) / 1000;
          setElapsedTime(delta);
        }
      }, 50); // Hassas sayaç için 50ms
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  const handleCardClick = (card: GameCard) => {
    if (matched.has(card.vocabId) || incorrect.has(card.id)) return;

    // Shake animasyonu oynatılırken yeni tıklamalara izin verme
    if (incorrect.size > 0) return;

    // Oyunu başlat
    let currentStatus = gameState;
    if (gameState === "idle") {
      setGameState("playing");
      currentStatus = "playing";
      startTimeRef.current = Date.now();
    }

    // İlk kart seçimi
    if (selected === null) {
      setSelected(card.id);
      return;
    }

    // Aynı karta tekrar basıldıysa seçimi kaldır
    if (selected === card.id) {
      setSelected(null);
      return;
    }

    const firstCard = cards.find((c) => c.id === selected)!;

    // Eşleşme kontrolü
    if (firstCard.vocabId === card.vocabId && firstCard.type !== card.type) {
      // DOĞRU EŞLEŞME
      const nextMatched = new Set(matched);
      nextMatched.add(card.vocabId);
      setMatched(nextMatched);
      setSelected(null);

      // Oyun bitti mi?
      const totalPairsNeeded = cards.length / 2;
      if (nextMatched.size === totalPairsNeeded) {
        setGameState("completed");
        const finalTime = startTimeRef.current
          ? (Date.now() - startTimeRef.current) / 1000
          : elapsedTime;
        
        setElapsedTime(finalTime);

        // Rekor kontrolü ve kaydı
        if (bestTime === null || finalTime < bestTime) {
          setBestTime(finalTime);
          setIsNewRecord(true);
        }
      }
    } else {
      // YANLIŞ EŞLEŞME
      setIncorrect(new Set([firstCard.id, card.id]));
      setSelected(null);

      incorrectTimeoutRef.current = setTimeout(() => {
        setIncorrect(new Set());
      }, 400); // Shake animasyon süresiyle uyumlu (400ms)
    }
  };

  if (vocabList.length < 3) {
    return (
      <div className="py-12 text-center">
        <p className="text-black/50 dark:text-white/50">
          Eşleştirme oyunu oynayabilmek için bu filtrede en az 3 kelime bulunmalıdır.
        </p>
      </div>
    );
  }

  return (
    <section aria-label="Kelime Eşleştirme Oyunu" className="mt-6 flex flex-col gap-6">
      {/* Oyun Üst Paneli: Zamanlayıcı ve Rekor */}
      <div className="flex items-center justify-between rounded-2xl border border-black/5 bg-white/40 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/3">
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-black/40 dark:text-white/40">
            Süre
          </span>
          <span className="font-mono text-2xl font-bold tabular-nums">
            {elapsedTime.toFixed(2)}s
          </span>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-black/40 dark:text-white/40">
            En İyi Derece
          </span>
          <span className="font-mono text-xl font-bold text-indigo-600 dark:text-indigo-400">
            {bestTime !== null ? `${bestTime.toFixed(2)}s` : "—"}
          </span>
        </div>

        <button
          type="button"
          onClick={initGame}
          className="rounded-xl border border-black/10 bg-white/60 px-4 py-2 text-sm font-semibold transition-transform hover:scale-[1.03] active:scale-95 focus-visible:ring-2 focus-visible:outline-none dark:border-white/10 dark:bg-white/5"
        >
          Yeniden Başlat
        </button>
      </div>

      {/* Oyun Alanı */}
      <div className="relative min-h-[340px]">
        {gameState !== "completed" ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {cards.map((card) => {
              const isSelected = selected === card.id;
              const isMatched = matched.has(card.vocabId);
              const isIncorrect = incorrect.has(card.id);

              return (
                <button
                  key={card.id}
                  type="button"
                  lang="en"
                  onClick={() => handleCardClick(card)}
                  style={{
                    // Eşleşen kartları yerleşim kaymasın diye gizliyoruz ama DOM'da tutuyoruz
                    visibility: isMatched ? "hidden" : "visible",
                  }}
                  className={`flex h-28 items-center justify-center rounded-2xl border p-4 text-center text-sm font-semibold shadow-md transition-all ring-1 ring-inset focus-visible:ring-2 focus-visible:outline-none select-none
                    ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-500/10 text-indigo-950 dark:text-indigo-200 ring-indigo-500/30 scale-[1.02]"
                        : isIncorrect
                          ? "border-rose-500 bg-rose-500/15 text-rose-800 dark:text-rose-200 ring-rose-500/30 animate-shake"
                          : `border-black/10 bg-white/70 hover:translate-y-[-2px] hover:bg-white/90 active:scale-95 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white`
                    }
                  `}
                >
                  <span className="text-balance leading-snug">{card.text}</span>
                </button>
              );
            })}
          </div>
        ) : (
          /* Oyun Tamamlandı Ekranı */
          <div className="flex flex-col items-center justify-center rounded-3xl border border-black/10 bg-white/60 p-8 text-center shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5 animate-flash-correct">
            <span className="text-5xl" role="img" aria-label="Tebrikler">
              {isNewRecord ? "🏆" : "🎉"}
            </span>
            <h3 className="mt-4 text-2xl font-bold tracking-tight">
              {isNewRecord ? "Yeni Rekor!" : "Harika Eşleştirme!"}
            </h3>
            <p className="mt-2 text-black/60 dark:text-white/60">
              Tüm kelimeleri başarıyla eşleştirdiniz.
            </p>

            <div className="mt-6 flex flex-col gap-1 font-mono">
              <span className="text-sm uppercase tracking-wider text-black/40 dark:text-white/40">
                Süreniz
              </span>
              <span className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {elapsedTime.toFixed(2)}s
              </span>
            </div>

            <button
              type="button"
              onClick={initGame}
              className={`mt-8 rounded-full px-6 py-3 text-base font-semibold shadow-lg transition-transform hover:scale-[1.03] active:scale-95 focus-visible:ring-2 focus-visible:outline-none ${tokens.accent} ${tokens.onAccent} ${tokens.ring}`}
            >
              Tekrar Oyna
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
