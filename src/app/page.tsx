import Link from "next/link";
import { themeTokens } from "@/domain";
import { listWorkspaces } from "@/lib/catalog";

export default function Home() {
  const workspaces = listWorkspaces();

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">englishtimenow</h1>
      <p className="mt-2 text-black/60 dark:text-white/60">
        Kelime kartlarıyla İngilizce pratik. Bir çalışma alanı seçerek başlayın.
      </p>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {workspaces.map((workspace) => (
          <li key={workspace.slug}>
            <Link
              href={`/${workspace.slug}`}
              className="block h-full rounded-2xl border border-black/10 p-6 transition-colors hover:border-black/25 focus-visible:ring-2 focus-visible:outline-none dark:border-white/15 dark:hover:border-white/30"
            >
              <h2 className="text-lg font-semibold">{workspace.title}</h2>
              <p className="mt-2 text-sm text-black/60 dark:text-white/60">
                {workspace.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {workspace.categories.map((category) => (
                  <span
                    key={category.slug}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${themeTokens(category.theme).surface} ${themeTokens(category.theme).text}`}
                  >
                    {category.title}
                  </span>
                ))}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
