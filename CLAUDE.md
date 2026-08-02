# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Ne olduğu

Statik bir İngilizce kelime kartı (flashcard) uygulaması. Ürün gereksinimleri
`README.md` içindeki PRD'de; tasarım kararlarının kaynağı orasıdır.

**Belirleyici kısıt: backend yok.** Veritabanı, API, sunucu yok. Tüm içerik repo
içinde tipli `.ts` veri yapıları olarak durur ve `next build` ile statik HTML'e
gömülür. Bu, `output: 'export'` demek — server actions, route handler'lar
(GET dışı), ISR ve middleware kullanılamaz. Bunlardan birine ihtiyaç duyan bir
çözüm öneriyorsan yanlış yoldasın.

## Komutlar

| Komut                  | Ne yapar                                        |
| ---------------------- | ----------------------------------------------- |
| `npm run dev`          | Geliştirme sunucusu (Turbopack), localhost:3000 |
| `npm run build`        | Statik export üretir → `out/`                   |
| `npm run preview`      | `out/` klasörünü statik sunar (build'den sonra) |
| `npm run typecheck`    | `tsc --noEmit`                                  |
| `npm run lint`         | ESLint                                          |
| `npm run format`       | Prettier ile yaz                                |
| `npm run format:check` | Prettier doğrulaması (CI için)                  |

`npm start` **yoktur ve olamaz** — `next start` bir sunucu gerektirir,
`output: 'export'` ile hata verir. Build çıktısını görmek için `npm run preview`.

## Sürümler

Next.js 16.2.12 (App Router, Turbopack), React 19.2.4, Tailwind CSS v4,
TypeScript strict. Next 16 önceki sürümlerden ayrışıyor — API veya konvansiyon
konusunda emin değilsen `node_modules/next/dist/docs/` altındaki yerel dokümanı
oku, hafızadan yazma.

## Bilinen tuzaklar

- **Tailwind v4 dinamik sınıf üretmez.** PRD kategori başına dinamik renk teması
  istiyor; `bg-${theme}-500` gibi şablon literalleri derlenmez. Tema renkleri
  sabit sınıf adları içeren bir eşleme tablosundan gelmeli.
- **Ev dizininde başıboş bir `package-lock.json` var** (`C:\Users\Lenovo\`).
  Turbopack workspace kökünü oraya kaydırıyordu; `next.config.ts` içindeki
  `turbopack.root` bunu sabitliyor. O satırı silme.
- **`npm audit` 3 high uyarısı verir** (postcss, sharp) — ikisi de Next'in kendi
  bağımlılığı ve `audit fix --force` Next'i 9.3.3'e düşürür. Dokunma. Statik
  sitede ikisi de çalışma zamanına ulaşmıyor.
- **`README.md` ve `AGENTS.md` Prettier'dan hariç tutuldu** — elle yazılmış
  dokümanlar, biçimlendirici yeniden düzenlemesin.

## Mimari

Katmanlar ve **tek yönlü** bağımlılık akışı:

```
src/content ──► src/domain ◄── src/lib/catalog ──► src/app
                    ▲
              scripts/validate-content.mts
```

- **`src/domain/`** — ortak dil: `Level`, `ColorTheme`+`THEME_TOKENS`, `VocabCard`,
  `QuizCard`, `Category`, `Workspace`. Hiçbir şey import etmez, framework'süzdür.
  Yeni bir alan kuralı buraya yazılır.
- **`src/content/`** — yalnızca veri. İçerik yazarı sadece burayı açar.
  `src/content/index.ts` tek kayıt noktasıdır; yeni workspace eklemek iki satır
  (import + dizi elemanı).
- **`src/lib/catalog.ts`** — içeriğe erişimin **tek** kapısı. Sayfalar ve
  bileşenler `@/content`'i doğrudan import etmez. Aramalar modül yüklenirken
  kurulan Map'ler üzerinden yapılır.
- **`src/app/`** — UI.

Konvansiyonlar:

- **Kart id'leri kalıcı ve katalog genelinde benzersiz** (`phv-give-up`,
  `tec-deploy`). Dizi indeksi kimlik olarak kullanılamaz: seviye filtresi diziyi
  daraltır, araya kart eklemek sırayı kaydırır.
- **`domain`, `content` ve `lib/catalog` birbirini açık `.ts` uzantısıyla ve
  göreli yolla import eder.** Sebebi mimari değil araçsal: aynı dosyalar böylece
  hem Next tarafından derlenir hem de Node ile doğrudan çalıştırılabilir
  (doğrulayıcı ve testler bundan faydalanır). İçerik dosyalarındaki
  `import type { … } from "@/domain"` alias'ı ise tip-yalnız olduğu için
  Node tarafından silinir, sorun çıkarmaz.
- **Quiz kartları ayrık birleşim** (`format: "cloze" | "multiple-choice"`).
  Yeni bir soru biçimi eklendiğinde eksik `switch` dalları derleme hatası verir.
- **Bir cloze sorusunda tam olarak bir `___` bulunur**, cevap kaç kelime olursa
  olsun. Doğrulayıcı bunu zorlar.
- **Dil işaretlemesi:** sayfa `lang="tr"` (arayüz Türkçe). Karttaki her İngilizce
  metin — `term`, `example.en`, quiz `prompt`/`answer`/`options` — kendi
  elemanında `lang="en"` taşımalı. Ekran okuyucu böylece o parçalarda İngilizce
  sese geçer; dil öğrenme uygulamasında istenen davranış budur. Bu işaretleme
  Web Speech API'den bağımsızdır: telaffuz butonu sesi koddaki açık `lang`
  parametresiyle seçer.

### İçerik doğrulama

`npm run validate:content` — `prebuild` kancasıyla her build'den önce koşar,
başarısız olursa build durur.

Şema kütüphanesi (zod vb.) **bilinçli olarak eklenmedi**: içerik derlenen `.ts`
dosyalarında yaşıyor, yani şekli `tsc` zaten garanti ediyor. Doğrulayıcı yalnızca
tipin ifade edemediği kuralları denetler — id benzersizliği, çoktan seçmeli
cevabın şıklar arasında olması, IPA'nın `/…/` biçimi, örnek cümlenin kelimeyle
uyuşması. İçerik ileride harici JSON'a taşınırsa bu karar yeniden değerlendirilmeli.

## Yol haritası

Fazlı plan üzerinden ilerleniyor. **Faz 0** (iskelet, statik export, araç
zinciri) ve **Faz 1** (alan modeli, içerik katmanı, sorgu API'si, doğrulayıcı;
1 workspace / 2 kategori / 60 kart) tamamlandı.

**Faz 2** (routing, `WorkspaceSidebar`), **Faz 3** (flip) ve **Faz 4**
(3D carousel, swipe, klavye) tamamlandı. Üretilen rotalar: `/`,
`/[workspace]`, `/[workspace]/[category]`.

Sıradaki: **Faz 5** — Web Speech API ile sesli telaffuz. Ardından quiz
etkileşimi, modlar/filtreler, erişilebilirlik sertleştirmesi.

### Bileşen katmanlaması

Kart bileşenleri bilinçli olarak üç kabuğa bölündü, her faz bir kabuk ekler:

```
CardShell          → tema/kenarlık/seviye rozeti (Faz 2, durumsuz)
  *CardFront/Back  → içerik yüzleri        (Faz 2, durumsuz)
    Flashcard      → flip davranışı        (Faz 3)
      CardCarousel → konum + swipe         (Faz 4)
```

Flip dönüşü ile carousel konumlandırması **aynı DOM elemanına uygulanamaz** —
`transform` çakışır. Dış eleman konum/ölçek/opacity, iç eleman `rotateY` alır.

### Flip mekaniği (Faz 3)

- Tailwind v4'ün yerleşik 3D sınıfları kullanılıyor: `transform-3d`,
  `backface-hidden`, `rotate-y-180`, `perspective-distant`. Arbitrary property
  yazmaya gerek yok.
- İki yüz **aynı grid hücresinde** yığılı (`col-start-1 row-start-1`), mutlak
  konumlandırma yok. Hücre en uzun yüze göre boyutlanır; kart çevrilirken
  yüksekliği değişmez. `FlipCard` ve `CardShell` `h-full` taşır ki aynı satırdaki
  kartlar eşit yükseklikte olsun.
- Kabuk `<button>` **değil**, `role="button"` taşıyan bir `div`. Sebep HTML
  içerik modeli: `<button>` yalnızca ifade içeriği alabilir, kart yüzlerinde
  başlık ve liste var. Bedeli: Enter/Space elle bağlanır ve Space'in sayfayı
  kaydırmaması için `preventDefault` gerekir.
- **Görünmeyen yüz `inert` alır.** `backface-visibility: hidden` yalnızca görsel
  gizler; onsuz ekran okuyucu ve Tab sırası gizli yüzün içeriğine ulaşır. Bu
  satırı silme.
- `motion-reduce:transition-none` ile hareket azaltma tercihi karşılanır.

### Carousel (Faz 4)

- **Konum `style` ile, tema `className` ile.** Kart konumları hesaplanan
  değerlerdir; `translate-x-[${n}%]` gibi bir şablon literali Tailwind
  tarafından hiç derlenmez. Geometri bu yüzden inline `style`, renkler ise
  sınıf üzerinden verilir.
- **Yalnızca merkeze en yakın 2 kart DOM'a girer** (`VISIBLE_RADIUS`).
- **Yalnızca etkin kart etkileşimlidir** (`FlipCard`'ın `interactive` prop'u);
  yan kartlar `aria-hidden`, `tabindex="-1"` ve `pointer-events-none` alır.
- **Kaydırma sonrası sentetik tıklama yutulur.** Tarayıcı kaydırmanın ardından
  yine `click` üretir; `suppressClickAfterSwipe` yakalama evresinde bunu
  durdurmasa her kaydırma aynı zamanda kartı çevirirdi.
- **Gezinme güncelleyici biçimde yazılır** (`setIndex(c => …)`). `index + 1`
  yazılırsa değer render kapanışından okunur ve aynı yığında düşen iki olay
  (tuş tekrarı) tek adım ilerletir.
- Ok tuşları `preventDefault` ile sayfayı kaydırmaz; kapsayıcıda
  `touch-action: pan-y` olduğu için dikey kaydırma tarayıcıda kalır.

### Tarayıcıda test ederken

Ekran görüntüsü alırken `--virtual-time-budget` **CSS geçişleriyle
senkron değildir**: sanal zaman JS zamanlayıcılarını ileri sarar ama geçiş
yarım kalmış olabilir ve hem görüntü hem `getComputedStyle()` ara değer
gösterir. Bu, var olmayan bir hata gibi görünür. Yerleşmiş hali ölçmek için
ya inline `style` niteliğini oku (React'in yazdığı gerçek değer) ya da
görüntüden önce `*{transition:none !important}` enjekte et.

### Rota notları

- Her dinamik sayfa `export const dynamicParams = false` taşır; statik export
  bilinmeyen slug'ları üretemez.
- `generateStaticParams` **değiştirilebilir** dizi ister. Katalog katmanı
  bilinçli olarak `readonly` döndürdüğü için kopya sayfa sınırında alınır:
  `return [...listCategoryRoutes()]`.
- Rota tipleri `.next/dev/types/` altında üretilir ve **bayatlar**: yeni rota
  eklendikten sonra `tsc` eski dosyalar yüzünden alakasız hata verirse
  `.next` silinip yeniden build alınmalı.

Mimari kararlar:

- **Framer Motion kullanılmıyor.** Carousel ayrık pozisyonlar arasında geçiyor;
  saf CSS `transition` + `transform` yeterli, swipe için küçük bir Pointer
  Events hook'u yazılacak. Bağımlılık eklemeden önce bu kararı gözden geçir.
- **İlerleme takibi (hangi kart öğrenildi) kapsam dışı.** localStorage yalnızca
  mod ve seviye filtresi tercihini tutacak.
