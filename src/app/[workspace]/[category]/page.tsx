import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryCards } from "@/components/cards/CategoryCards";
import { themeTokens } from "@/domain";
import { findCategory, findWorkspace, listCategoryRoutes } from "@/lib/catalog";

export const dynamicParams = false;

export function generateStaticParams() {
  // Bkz. `[workspace]/page.tsx`: readonly → mutable kopya sınırda alınır.
  return [...listCategoryRoutes()];
}

type Params = Promise<{ workspace: string; category: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { workspace, category: categorySlug } = await params;
  const category = findCategory(workspace, categorySlug);
  return { title: category ? `${category.title} — englishtimenow` : "englishtimenow" };
}

/**
 * Kategori sayfası — Faz 3 sürümü.
 *
 * Kartlar çevrilebilir ama hâlâ ızgara halinde listeleniyor; carousel Faz 4'te
 * gelecek. Kart yüzleri sunucuda render edilip `FlipCard`'a prop olarak
 * geçiyor, böylece içerik istemci paketine girmiyor.
 */
export default async function CategoryPage({ params }: { params: Params }) {
  const { workspace: workspaceSlug, category: categorySlug } = await params;

  const workspace = findWorkspace(workspaceSlug);
  const category = findCategory(workspaceSlug, categorySlug);

  if (!workspace || !category) notFound();

  const tokens = themeTokens(category.theme);

  return (
    <main className="relative mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      {/* Kategori rengiyle ışıma. Kartların cam etkisi ancak arkada düz
          olmayan bir yüzey varsa okunur. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div
          className={`absolute -top-16 left-1/2 h-80 w-136 -translate-x-1/2 rounded-full blur-3xl ${tokens.glow}`}
        />
      </div>

      <p className={`text-sm font-medium ${tokens.muted}`}>{workspace.title}</p>
      <h1 className="mt-1 text-4xl font-bold tracking-tight">{category.title}</h1>
      <p className="mt-3 max-w-xl leading-relaxed text-black/60 dark:text-white/55">
        {category.description}
      </p>

      {/* Kartlar veri olarak geçer: mod ve filtre istemci durumudur. */}
      <CategoryCards category={category} />
    </main>
  );
}
