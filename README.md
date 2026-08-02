Proje Gereksinim ve Özellik Dokümanı (PRD)

1. Mimari ve Teknik Altyapı
   • Framework & Deploy: Next.js (App Router), TypeScript. Tamamen statik çıktı (output: 'export') alınarak Vercel veya Netlify üzerinde $0$ maliyetle host edilir.
   • Veri Yönetimi: Backend, veritabanı veya API kullanılmaz. Tüm veriler projenin içinde modüler .ts / .json veri yapıları olarak tutulur.
   • Responsive Tasarım: Web, Tablet, iOS ve Android ekran boyutlarıyla tam uyumlu (Mobile-First yaklaşımı).
   • Erişilebilirlik (Accessibility): Klavye navigasyonu (Sağ/Sol Ok, Boşluk, Özel Kısayol tuşları) ve ekran okuyucu uyumluluğu.
2. Bilgi Hiyerarşisi ve Veri Yapısı (Workspace Model)
   A. Workspace (Çalışma Alanı)
   • Üst seviye gruplama birimidir (Örn: Yazılım İngilizcesi, Günlük Konuşma, Akademik Vocabulary).
   • İçerisinde birden fazla alt kategori barındırır.
   B. Alt Kategoriler (Categories)
   • Odaklanılan alana göre ayrıştırılmış gruplardır (Örn: Phrasal Verbs, Tech Terms, A2 Irregular Verbs).
   • Her alt kategoriye özel Dinamik Renk Teması tanımlanır (Sade tasarımı kırmak ve kategoriyi görsel olarak ayrıştırmak için).
   C. Kelime Kartları (Vocabulary Flashcards)
   • Ön Yüz:
   o İngilizce Kelime
   o Uluslararası Fonetik Alfabe okunuşu (IPA / Phonetic transcript)
   o Sesli Telaffuz Butonu (Web Speech API)
   • Arka Yüz:
   o Türkçe Karşılığı
   o A2 Seviyesinde Örnek İngilizce Cümle
   o Örnek Cümlenin Türkçe Anlamı (Parantez içinde, hemen alt satırda)
   o Kolokasyon / Edat Kullanımı: Kelimenin sık eşleştiği yapılar (Örn: depend + on)
   D. Kelime Test Kartları (Quiz Flashcards)
   • Her alt kategori içerisindeki kelime sayısına yakın miktarda test kartı barındırır.
   • Ön Yüz: Kelime test sorusu (Boşluk doldurma veya çoktan seçmeli format).
   • Arka Yüz: Doğru cevap ve kısa gramer/bağlam açıklaması.
3. Kullanıcı Arayüzü (UI) ve Etkileşim (UX) Özellikleri
   A. Carousel (Kaydırmalı Kart) Görünümü
   • 3D Carousel Yapısı: Ekranın merkezinde odaklanılan aktif kart yer alır.
   • Yan Kart Odaklama: Sol ve sağdaki bir önceki/bir sonraki kartlar daha düşük opacity ($\sim\%40$) ve hafif küçültülmüş ölçek ($scale$) ile görünür.
   • Göz Yormayan Akıcı Animasyonlar: Kart geçişlerinde ve flip (döndürme) efektlerinde yumuşak CSS/Framer Motion geçişleri kullanılır.
   B. Kart Etkileşimleri
   • Tıklama/Dokunma: Kartın üzerine tıklanınca/dokunulunca kart $180^\circ$ dönerek arka yüzü gösterir.
   • Swipe (Kayan Geçiş): Mobil cihazlarda sola kaydırarak sonraki karta, sağa kaydırarak önceki karta geçilir.
   C. Öğrenme Verimini Artıran Ek Modlar
   • Tersine Kart Modu (Reverse Flashcard Mode):
   o Kartın ön yüzünde Türkçe karşılığını gösterip arka yüzünde İngilizcesini gizleyen aktif hatırlama (Active Recall) modu.
   • Sesli Telaffuz (Web Speech API Integration):
   o Cihaz veya sunucu kaynaklarını tüketmeden, tarayıcının yerleşik ses motoruyla doğru İngilizce telaffuzu dinletme yeteneği.
   • Statik Seviye Filtresi:
   o Kartlar zorluk derecesine göre (A1, A2, B1) filtreleme seçeneği sunar.
4. Bileşen (Component) Mimarısı ve Tasarım Sistemi
   • Atomic Component Yapısı:
   o CardContainer: Carousel ve swipe mantığını yöneten kapsayıcı.
   o Flashcard: Ön/Arka yüz çevrilme logic'ini ve UI'ını tutan re-usable bileşen.
   o QuizCard: Test sorularını ve yanıt durumlarını yöneten bileşen.
   o WorkspaceSidebar: Workspace ve alt kategoriler arası geçişi sağlanan navigasyon.
   • Renk Paleti & Temalama:
   o Bileşenler over-engineering edilmeden props üzerinden dinamik renk alır (colorTheme="emerald", colorTheme="indigo" vb.).
   o Sadelikten uzaklaşmamak adına yumuşak, gözü yormayan pastel/dark pastel tonlar tercih edilir.
