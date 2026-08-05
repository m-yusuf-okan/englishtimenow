"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("englishtimenow:theme") as Theme | null;
    if (saved) setTheme(saved);
  }, []);

  const applyTheme = (nextTheme: Theme) => {
    setTheme(nextTheme);
    localStorage.setItem("englishtimenow:theme", nextTheme);

    const isDark =
      nextTheme === "dark" ||
      (nextTheme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  if (!mounted) {
    return (
      <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-4 dark:border-white/10">
        <span className="text-xs font-semibold uppercase tracking-wider text-black/50 dark:text-white/40">
          Tema
        </span>
        <div className="h-7 w-28 rounded-xl bg-black/5 dark:bg-white/5 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-4 dark:border-white/10">
      <span className="text-xs font-semibold uppercase tracking-wider text-black/50 dark:text-white/40">
        Tema
      </span>
      <div className="flex rounded-xl bg-black/5 p-0.5 dark:bg-white/5">
        {(["light", "dark", "system"] as const).map((t) => {
          const active = theme === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => applyTheme(t)}
              className={`rounded-lg px-2.5 py-1 text-[0.7rem] font-medium capitalize transition-colors focus-visible:outline-none cursor-pointer ${
                active
                  ? "bg-white text-black shadow-sm dark:bg-zinc-800 dark:text-white"
                  : "text-black/50 hover:text-black/80 dark:text-white/50 dark:hover:text-white/80"
              }`}
            >
              {t === "system" ? "Sistem" : t === "light" ? "Açık" : "Koyu"}
            </button>
          );
        })}
      </div>
    </div>
  );
}
