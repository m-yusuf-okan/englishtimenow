import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { themeTokens } from "@/domain";
import { findWorkspace, listWorkspaceRoutes } from "@/lib/catalog";

// Statik export dinamik rotaları önceden bilmek zorunda; bilinmeyen slug'lar
// build'de üretilmez ve 404 döner.
export const dynamicParams = false;

export function generateStaticParams() {
  // Next değiştirilebilir dizi bekliyor; katalog katmanı bilinçli olarak
  // `readonly` döndürdüğü için kopya burada, sınırda alınıyor.
  return [...listWorkspaceRoutes()];
}

type Params = Promise<{ workspace: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { workspace: slug } = await params;
  const workspace = findWorkspace(slug);
  return { title: workspace ? `${workspace.title} — englishtimenow` : "englishtimenow" };
}

export default async function WorkspacePage({ params }: { params: Params }) {
  const { workspace: slug } = await params;
  const workspace = findWorkspace(slug);

  if (!workspace) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <h1 className="text-4xl font-bold tracking-tight">{workspace.title}</h1>
      <p className="mt-3 max-w-xl leading-relaxed text-black/60 dark:text-white/55">
        {workspace.description}
      </p>

      <ul className="mt-10 grid gap-5">
        {workspace.categories.map((category) => {
          const tokens = themeTokens(category.theme);

          return (
            <li key={category.slug} className="group relative">
              <div
                aria-hidden="true"
                className={`absolute -inset-2 -z-10 rounded-4xl opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100 ${tokens.glow}`}
              />
              <Link
                href={`/${workspace.slug}/${category.slug}`}
                className={`block rounded-3xl border p-6 shadow-lg ring-1 shadow-black/5 ring-white/40 backdrop-blur-xl transition-transform ring-inset group-hover:-translate-y-1 focus-visible:ring-2 focus-visible:outline-none dark:shadow-black/30 dark:ring-white/10 ${tokens.surface} ${tokens.border} ${tokens.text} ${tokens.ring}`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className={`size-2.5 rounded-full ${tokens.accent}`}
                  />
                  <h2 className="text-xl font-bold tracking-tight">{category.title}</h2>
                </div>
                <p className={`mt-2 leading-relaxed ${tokens.muted}`}>
                  {category.description}
                </p>
                <p className={`mt-4 text-xs font-semibold tracking-wide ${tokens.muted}`}>
                  {category.vocab.length} KELİME · {category.quiz.length} TEST KARTI
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
