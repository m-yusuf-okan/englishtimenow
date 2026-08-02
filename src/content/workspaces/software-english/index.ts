import type { Workspace } from "@/domain";
import { phrasalVerbs } from "./phrasal-verbs.ts";
import { techTerms } from "./tech-terms.ts";

/**
 * Kategori sırası burada belirlenir; sidebar ve carousel bu diziyi olduğu gibi
 * kullanır, kendi başına sıralama yapmaz.
 */
export const softwareEnglish: Workspace = {
  slug: "software-english",
  title: "Yazılım İngilizcesi",
  description:
    "Yazılım ekiplerinin gündelik yazışma ve toplantılarında geçen kelimeler, öbek fiiller ve terimler.",
  categories: [phrasalVerbs, techTerms],
};
