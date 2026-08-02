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

## Yol haritası

Fazlı plan üzerinden ilerleniyor. Faz 0 (iskelet, statik export, araç zinciri)
tamamlandı. Sıradaki faz: veri modeli ve tip sistemi (`src/data/`), ardından
routing, flip mekaniği, 3D carousel, Web Speech API, quiz kartları.

Mimari kararlar:

- **Framer Motion kullanılmıyor.** Carousel ayrık pozisyonlar arasında geçiyor;
  saf CSS `transition` + `transform` yeterli, swipe için küçük bir Pointer
  Events hook'u yazılacak. Bağımlılık eklemeden önce bu kararı gözden geçir.
- **İlerleme takibi (hangi kart öğrenildi) kapsam dışı.** localStorage yalnızca
  mod ve seviye filtresi tercihini tutacak.
