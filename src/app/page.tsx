import Link from "next/link";
import { themeTokens } from "@/domain";
import { listWorkspaces } from "@/lib/catalog";

export default function Home() {
  const workspaces = listWorkspaces();

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-20">
      <p className="text-sm font-semibold tracking-[0.18em] text-indigo-600 uppercase dark:text-indigo-300">
        Kelime kartlarıyla İngilizce
      </p>
      <h1 className="mt-3 text-5xl font-bold tracking-tight text-balance sm:text-6xl">
        englishtimenow
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-black/60 dark:text-white/55">
        Telaffuzuyla, örnek cümlesiyle ve testiyle kelime çalış. Bir çalışma alanı seçerek
        başla.
      </p>

      <ul className="mt-14 grid gap-5 sm:grid-cols-2">
        {workspaces.map((workspace) => {
          const lead = themeTokens(workspace.categories[0]?.theme ?? "indigo");

          return (
            <li key={workspace.slug} className="group relative">
              {/* Kartın arkasındaki ışıma yalnızca hover/odakta belirir. */}
              <div
                aria-hidden="true"
                className={`absolute -inset-2 -z-10 rounded-4xl opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100 ${lead.glow}`}
              />
              <Link
                href={`/${workspace.slug}`}
                className="block h-full rounded-3xl border border-black/10 bg-white/60 p-7 shadow-lg ring-1 shadow-black/5 ring-white/50 backdrop-blur-xl transition-transform ring-inset group-hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none dark:border-white/10 dark:bg-white/5 dark:shadow-black/30 dark:ring-white/10"
              >
                <h2 className="text-xl font-bold tracking-tight">{workspace.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-black/60 dark:text-white/55">
                  {workspace.description}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {workspace.categories.map((category) => {
                    const tokens = themeTokens(category.theme);
                    return (
                      <span
                        key={category.slug}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${tokens.surface} ${tokens.border} ${tokens.text}`}
                      >
                        <span
                          aria-hidden="true"
                          className={`size-1.5 rounded-full ${tokens.accent}`}
                        />
                        {category.title}
                      </span>
                    );
                  })}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
