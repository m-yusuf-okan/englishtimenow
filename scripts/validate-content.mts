/**
 * İçerik bütünlük denetimi. `npm run validate:content` (ve `prebuild`).
 *
 * NEDEN AYRI BİR DOĞRULAYICI VAR
 * TypeScript içeriğin *şeklini* zaten derleme anında garanti ediyor: eksik alan
 * veya yanlış tip `tsc` ile yakalanır. Burada denetlenenler tipin ifade
 * edemediği kurallardır — kimlik benzersizliği, çoktan seçmeli cevabın
 * şıklar arasında bulunması, boşluk işaretinin varlığı gibi.
 *
 * Bu yüzden şema kütüphanesi (zod vb.) eklenmedi: içerik derlenen `.ts`
 * dosyalarında yaşıyor, çalışma zamanında ayrıştırılan bir JSON değil. Şemayı
 * ikinci kez tanımlamak, `tsc`'nin yaptığı işi tekrarlayıp tarayıcı paketine
 * gereksiz kod sokardı. İçerik ileride harici JSON'a taşınırsa bu karar
 * yeniden değerlendirilmeli.
 *
 * Node, TypeScript'i yerel olarak çalıştırdığı için ek bir çalıştırıcıya
 * (tsx/ts-node) gerek yok; import'lar bu yüzden açık `.ts` uzantısı taşır.
 */
import { catalog } from "../src/content/index.ts";
import { CLOZE_BLANK, LEVELS } from "../src/domain/index.ts";
import type { Category, QuizCard, VocabCard, Workspace } from "../src/domain/index.ts";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const IPA_PATTERN = /^\/.+\/$/;

const problems: string[] = [];

function fail(where: string, message: string): void {
  problems.push(`${where}: ${message}`);
}

function requireText(where: string, field: string, value: string): void {
  if (value.trim().length === 0) fail(where, `\`${field}\` boş olamaz`);
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
  if (card.collocations.length === 0) {
    fail(where, "en az bir kolokasyon gerekli (PRD 2.C)");
  }
  // Örnek cümlenin kelimeyle ilgisiz olması tipik bir kopyala-yapıştır hatası.
  //
  // Ana fiil çekime girdiği için doğrudan aranamaz (run → ran, carry → carried,
  // come → came). Buna karşılık öbek fiillerin edatları hiç değişmez, o yüzden
  // çok kelimeli terimlerde ilk kelimeden sonrasını arıyoruz. Tek kelimeli
  // terimlerde alt dizge araması düzenli ekleri zaten karşılıyor
  // (deploy → deployed, request → requests).
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

  if (card.options.length < 2) {
    fail(where, "çoktan seçmeli soruda en az iki şık olmalı");
  }
  if (!card.options.includes(card.answer)) {
    fail(where, `doğru cevap \`${card.answer}\` şıklar arasında yok`);
  }
  reportDuplicates(where, "şık", card.options);
}

function checkCategory(workspace: Workspace, category: Category): void {
  const where = `${workspace.slug}/${category.slug}`;

  if (!SLUG_PATTERN.test(category.slug)) {
    fail(where, `kategori slug'ı kebab-case olmalı: \`${category.slug}\``);
  }
  requireText(where, "title", category.title);
  requireText(where, "description", category.description);

  if (category.vocab.length === 0)
    fail(where, "kategori en az bir kelime kartı içermeli");
  if (category.quiz.length === 0) fail(where, "kategori en az bir test kartı içermeli");

  // PRD 2.D: test kartı sayısı kelime sayısına yakın olmalı.
  const ratio = category.quiz.length / Math.max(category.vocab.length, 1);
  if (ratio < 0.5) {
    fail(
      where,
      `test kartı sayısı (${category.quiz.length}) kelime sayısına (${category.vocab.length}) göre çok düşük`,
    );
  }

  for (const card of category.vocab) checkVocabCard(`${where}#${card.id}`, card);
  for (const card of category.quiz) checkQuizCard(`${where}#${card.id}`, card);

  reportDuplicates(
    where,
    "kelime",
    category.vocab.map((card) => card.term.toLowerCase()),
  );
}

function checkWorkspace(workspace: Workspace): void {
  const where = workspace.slug;

  if (!SLUG_PATTERN.test(workspace.slug)) {
    fail(where, `workspace slug'ı kebab-case olmalı: \`${workspace.slug}\``);
  }
  requireText(where, "title", workspace.title);
  requireText(where, "description", workspace.description);

  if (workspace.categories.length === 0) {
    fail(where, "workspace en az bir kategori içermeli");
  }

  reportDuplicates(
    where,
    "kategori slug'ı",
    workspace.categories.map((category) => category.slug),
  );

  for (const category of workspace.categories) checkCategory(workspace, category);
}

// --- çalıştır ------------------------------------------------------------

if (catalog.length === 0) {
  fail("catalog", "katalog boş");
}

reportDuplicates(
  "catalog",
  "workspace slug'ı",
  catalog.map((workspace) => workspace.slug),
);

for (const workspace of catalog) checkWorkspace(workspace);

// Kart kimlikleri katalog genelinde benzersiz olmalı: seviye filtresi kartları
// kategoriler arasında birleştirebilir ve React anahtarları çakışırsa
// carousel yanlış kartı yeniden kullanır.
const allCards = catalog.flatMap((workspace) =>
  workspace.categories.flatMap((category) => [...category.vocab, ...category.quiz]),
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

const categoryCount = catalog.reduce(
  (total, workspace) => total + workspace.categories.length,
  0,
);
const levelSummary = LEVELS.map(
  (level) => `${level}:${levelCounts.get(level) ?? 0}`,
).join("  ");

console.log(
  `✓ İçerik geçerli — ${catalog.length} workspace, ${categoryCount} kategori, ${allCards.length} kart  (${levelSummary})`,
);
