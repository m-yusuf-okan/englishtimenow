// İçerik göreli yolla import ediliyor (alias ile değil): aynı dosya böylece
// hem Next tarafından derlenebiliyor hem de Node ile doğrudan çalıştırılıp
// test edilebiliyor. domain/content katmanları da aynı kuralı izler.
import { catalog } from "../content/index.ts";
import type { Category, Workspace } from "@/domain";

/**
 * Katalog sorgu katmanı.
 *
 * Uygulama kodu `@/content`'i doğrudan import etmez; içeriğe yalnızca buradan
 * erişir. Böylece dosya düzeni değiştiğinde (kategoriler klasörlere bölündüğünde,
 * içerik JSON'a taşındığında) sayfa ve bileşenlere dokunmak gerekmez.
 *
 * Aramalar modül yüklenirken bir kez kurulan Map'ler üzerinden yapılır; her
 * çağrıda diziyi taramak, kategori sayısı büyüdüğünde build süresine yansırdı.
 */

const workspacesBySlug = new Map<string, Workspace>(
  catalog.map((workspace) => [workspace.slug, workspace]),
);

const categoriesByPath = new Map<string, Category>(
  catalog.flatMap((workspace) =>
    workspace.categories.map(
      (category) => [`${workspace.slug}/${category.slug}`, category] as const,
    ),
  ),
);

/** Kullanıcıya gösterilecek sırayla tüm workspace'ler. */
export function listWorkspaces(): readonly Workspace[] {
  return catalog;
}

export function findWorkspace(slug: string): Workspace | undefined {
  return workspacesBySlug.get(slug);
}

export function findCategory(
  workspaceSlug: string,
  categorySlug: string,
): Category | undefined {
  return categoriesByPath.get(`${workspaceSlug}/${categorySlug}`);
}

/** Bir kategorinin ait olduğu workspace. Breadcrumb ve geri navigasyonu için. */
export function findParentWorkspace(categorySlug: string): Workspace | undefined {
  return catalog.find((workspace) =>
    workspace.categories.some((category) => category.slug === categorySlug),
  );
}

export interface WorkspaceRoute {
  readonly workspace: string;
}

export interface CategoryRoute {
  readonly workspace: string;
  readonly category: string;
}

/** `/[workspace]` rotaları — `generateStaticParams` için. */
export function listWorkspaceRoutes(): readonly WorkspaceRoute[] {
  return catalog.map((workspace) => ({ workspace: workspace.slug }));
}

/**
 * Statik export'ta her dinamik rota önceden bilinmek zorundadır;
 * `generateStaticParams` bu listeyi olduğu gibi döndürür.
 */
export function listCategoryRoutes(): readonly CategoryRoute[] {
  return catalog.flatMap((workspace) =>
    workspace.categories.map((category) => ({
      workspace: workspace.slug,
      category: category.slug,
    })),
  );
}

// Kartlar üzerindeki saf işlemler (`filterByLevel`, `levelsInCategory`)
// bilinçli olarak `./cards.ts`'te durur: bu modül içerik kaydını import ettiği
// için buradan tek sembol çeken istemci bileşeni tüm içeriği paketine alırdı.
