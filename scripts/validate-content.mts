import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CLOZE_BLANK, LEVELS } from "../src/domain/index.ts";
import type { Category, QuizCard, VocabCard, Workspace, Catalog } from "../src/domain/index.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKSPACES_DIR = path.resolve(__dirname, "../src/content/workspaces");
const OUTPUT_FILE = path.resolve(__dirname, "../src/content/generated-catalog.ts");

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const IPA_PATTERN = /^\/.+\/$/;

const problems: string[] = [];

function fail(where: string, message: string): void {
  problems.push(`${where}: ${message}`);
}

function requireText(where: string, field: string, value: string): void {
  if (!value || value.trim().length === 0) fail(where, `\`${field}\` boş olamaz`);
}

/** Aynı değerin birden çok kez kullanıldığı yerleri bildirir. */
function reportDuplicates(where: string, label: string, values: readonly string[]): void {
  const seen = new Set<string>();
  const duplicated = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicated.add(value);
    seen.add(value);
  }
  for (const value of duplicated) {
    fail(where, `${label} tekrar ediyor: \`${value}\``);
  }
}

function checkVocabCard(where: string, card: VocabCard): void {
  requireText(where, "term", card.term);
  requireText(where, "translation", card.translation);
  requireText(where, "example.en", card.example.en);
  requireText(where, "example.tr", card.example.tr);

  if (!IPA_PATTERN.test(card.ipa)) {
    fail(where, `IPA eğik çizgiler arasında yazılmalı, bulunan: \`${card.ipa}\``);
  }
  if (!card.collocations || card.collocations.length === 0) {
    fail(where, "en az bir kolokasyon gerekli (PRD 2.C)");
  }

  const sentence = card.example.en.toLowerCase();
  const [head, ...particles] = card.term.toLowerCase().split(" ");
  const required = particles.length > 0 ? particles : [head!];

  for (const part of required) {
    if (!sentence.includes(part)) {
      fail(where, `örnek cümle \`${card.term}\` ile uyuşmuyor (\`${part}\` geçmiyor)`);
    }
  }
}

function checkQuizCard(where: string, card: QuizCard): void {
  requireText(where, "prompt", card.prompt);
  requireText(where, "answer", card.answer);
  requireText(where, "explanation", card.explanation);

  if (card.format === "cloze") {
    const blanks = card.prompt.split(CLOZE_BLANK).length - 1;
    if (blanks !== 1) {
      fail(
        where,
        `cloze sorusunda tam olarak bir \`${CLOZE_BLANK}\` olmalı, bulunan: ${blanks}`,
      );
    }
    return;
  }

  if (!card.options || card.options.length < 2) {
    fail(where, "çoktan seçmeli soruda en az iki şık olmalı");
  } else {
    if (!card.options.includes(card.answer)) {
      fail(where, `doğru cevap \`${card.answer}\` şıklar arasında yok`);
    }
    reportDuplicates(where, "şık", card.options);
  }
}

function checkCategory(workspaceSlug: string, category: Category): void {
  const where = `${workspaceSlug}/${category.slug}`;

  if (!SLUG_PATTERN.test(category.slug)) {
    fail(where, `kategori slug'ı kebab-case olmalı: \`${category.slug}\``);
  }
  requireText(where, "title", category.title);
  requireText(where, "description", category.description);

  if (!category.vocab || category.vocab.length === 0) {
    fail(where, "kategori en az bir kelime kartı içermeli");
  }
  if (!category.quiz || category.quiz.length === 0) {
    fail(where, "kategori en az bir test kartı içermeli");
  }

  const vocabLength = category.vocab ? category.vocab.length : 0;
  const quizLength = category.quiz ? category.quiz.length : 0;

  // PRD 2.D: test kartı sayısı kelime sayısına yakın olmalı.
  const ratio = quizLength / Math.max(vocabLength, 1);
  if (ratio < 0.5) {
    fail(
      where,
      `test kartı sayısı (${quizLength}) kelime sayısına (${vocabLength}) göre çok düşük`,
    );
  }

  if (category.vocab) {
    for (const card of category.vocab) checkVocabCard(`${where}#${card.id}`, card);
  }
  if (category.quiz) {
    for (const card of category.quiz) checkQuizCard(`${where}#${card.id}`, card);
  }

  if (category.vocab) {
    reportDuplicates(
      where,
      "kelime",
      category.vocab.map((card) => card.term.toLowerCase()),
    );
  }
}

function checkWorkspace(workspace: Workspace): void {
  const where = workspace.slug;

  if (!SLUG_PATTERN.test(workspace.slug)) {
    fail(where, `workspace slug'ı kebab-case olmalı: \`${workspace.slug}\``);
  }
  requireText(where, "title", workspace.title);
  requireText(where, "description", workspace.description);

  if (!workspace.categories || workspace.categories.length === 0) {
    fail(where, "workspace en az bir kategori içermeli");
  }

  reportDuplicates(
    where,
    "kategori slug'ı",
    workspace.categories.map((category) => category.slug),
  );

  for (const category of workspace.categories) checkCategory(workspace.slug, category);
}

// --- Keşif ve Derleme Adımı ---------------------------------------------

function compileCatalog(): Catalog {
  const catalogList: Workspace[] = [];

  if (!fs.existsSync(WORKSPACES_DIR)) {
    fail("fs", `İçerik dizini bulunamadı: ${WORKSPACES_DIR}`);
    return [];
  }

  const workspaceDirs = fs.readdirSync(WORKSPACES_DIR);

  for (const slug of workspaceDirs) {
    const wsPath = path.join(WORKSPACES_DIR, slug);
    if (!fs.statSync(wsPath).isDirectory()) continue;

    // workspace.json oku
    const wsMetaPath = path.join(wsPath, "workspace.json");
    if (!fs.existsSync(wsMetaPath)) {
      fail(slug, "workspace.json dosyası bulunamadı");
      continue;
    }

    let wsMeta;
    try {
      wsMeta = JSON.parse(fs.readFileSync(wsMetaPath, "utf-8"));
    } catch (e: any) {
      fail(slug, `workspace.json parse hatası: ${e.message}`);
      continue;
    }

    const categories: Category[] = [];
    const files = fs.readdirSync(wsPath);

    for (const filename of files) {
      if (filename === "workspace.json" || !filename.endsWith(".json")) continue;

      const catPath = path.join(wsPath, filename);
      let catData;
      try {
        catData = JSON.parse(fs.readFileSync(catPath, "utf-8"));
      } catch (e: any) {
        fail(`${slug}/${filename}`, `JSON parse hatası: ${e.message}`);
        continue;
      }

      // Dosya adının slug ile eşleştiğini doğrula
      const expectedSlug = path.basename(filename, ".json");
      if (catData.slug !== expectedSlug) {
        fail(
          `${slug}/${filename}`,
          `Dosya adı ile slug alanı uyuşmuyor: dosya adı \`${filename}\`, slug \`${catData.slug}\``,
        );
      }

      const { $schema, ...cleanCatData } = catData;
      categories.push(cleanCatData as any);
    }

    catalogList.push({
      slug,
      title: wsMeta.title || "",
      description: wsMeta.description || "",
      categories,
    });
  }

  return catalogList;
}

// --- Çalıştır ------------------------------------------------------------

console.log("-> İçerik keşfi ve derlemesi başlatılıyor...");
const catalogData = compileCatalog();

if (catalogData.length === 0) {
  fail("catalog", "katalog boş");
}

reportDuplicates(
  "catalog",
  "workspace slug'ı",
  catalogData.map((workspace) => workspace.slug),
);

for (const workspace of catalogData) {
  checkWorkspace(workspace);
}

// Kart kimlikleri katalog genelinde benzersiz olmalı
const allCards = catalogData.flatMap((workspace) =>
  workspace.categories.flatMap((category) => [
    ...(category.vocab || []),
    ...(category.quiz || []),
  ]),
);
reportDuplicates(
  "catalog",
  "kart id'si",
  allCards.map((card) => card.id),
);

const levelCounts = new Map<string, number>();
for (const card of allCards) {
  levelCounts.set(card.level, (levelCounts.get(card.level) ?? 0) + 1);
}

if (problems.length > 0) {
  console.error(`\n✗ İçerik doğrulaması başarısız — ${problems.length} sorun:\n`);
  for (const problem of problems) console.error(`  • ${problem}`);
  console.error("");
  process.exit(1);
}

// generated-catalog.ts dosyasına yaz
const generatedCode = `/**
 * Bu dosya validate-content.mts tarafından otomatik üretilmiştir.
 * MANUEL OLARAK DÜZENLEMEYİNİZ.
 */
import type { Catalog } from "../domain/index.ts";

export const catalog: Catalog = ${JSON.stringify(catalogData, null, 2)} as const;
`;

try {
  fs.writeFileSync(OUTPUT_FILE, generatedCode, "utf-8");
} catch (e: any) {
  console.error(`✗ generated-catalog.ts yazılamadı: ${e.message}`);
  process.exit(1);
}

const categoryCount = catalogData.reduce(
  (total, workspace) => total + workspace.categories.length,
  0,
);
const levelSummary = LEVELS.map(
  (level) => `${level}:${levelCounts.get(level) ?? 0}`,
).join("  ");

console.log(
  `✓ İçerik başarıyla derlendi ve doğrulandı — ${catalogData.length} workspace, ${categoryCount} kategori, ${allCards.length} kart  (${levelSummary})`,
);
