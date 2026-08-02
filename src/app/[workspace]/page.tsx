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
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">{workspace.title}</h1>
      <p className="mt-2 text-black/60 dark:text-white/60">{workspace.description}</p>

      <ul className="mt-8 grid gap-4">
        {workspace.categories.map((category) => {
          const tokens = themeTokens(category.theme);

          return (
            <li key={category.slug}>
              <Link
                href={`/${workspace.slug}/${category.slug}`}
                className={`block rounded-2xl border p-5 transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:outline-none ${tokens.surface} ${tokens.border} ${tokens.text}`}
              >
                <h2 className="text-lg font-semibold">{category.title}</h2>
                <p className={`mt-1 text-sm ${tokens.muted}`}>{category.description}</p>
                <p className={`mt-3 text-xs ${tokens.muted}`}>
                  {category.vocab.length} kelime · {category.quiz.length} test kartı
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
