import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CardCarousel } from "@/components/cards/CardCarousel";
import { QuizCardBack, QuizCardFront } from "@/components/cards/QuizCardFaces";
import { VocabCardBack, VocabCardFront } from "@/components/cards/VocabCardFaces";
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

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <p className="text-sm text-black/50 dark:text-white/50">{workspace.title}</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">{category.title}</h1>
      <p className="mt-2 text-black/60 dark:text-white/60">{category.description}</p>

      <div className="mt-10">
        <h2 className="text-lg font-semibold">
          Kelime kartları ({category.vocab.length})
        </h2>
        <CardCarousel
          label="Kelime kartları"
          items={category.vocab.map((card) => ({
            id: card.id,
            label: `${card.term} — kartı çevir`,
            front: <VocabCardFront card={card} theme={category.theme} />,
            back: <VocabCardBack card={card} theme={category.theme} />,
          }))}
        />
      </div>

      <div className="mt-14">
        <h2 className="text-lg font-semibold">Test kartları ({category.quiz.length})</h2>
        <CardCarousel
          label="Test kartları"
          items={category.quiz.map((card) => ({
            id: card.id,
            label: "Soruyu çevir ve cevabı gör",
            front: <QuizCardFront card={card} theme={category.theme} />,
            back: <QuizCardBack card={card} theme={category.theme} />,
          }))}
        />
      </div>
    </main>
  );
}
