import type { Decision, Link, Project } from '../../types/content.ts'
import { projects as en } from '../en/projects.ts'

// The Turkish text of a project. Slugs, links, stacks and statuses stay shared with English.
// Featured projects also need their case study; content:check makes sure nothing is missing.
type ProjectText = {
  title?: string // only where the name is a description, not a product name
  tagline: string
  role: string
  period: string
  problem?: string
  solution?: string
  decisions?: Decision[]
  highlights?: string[]
  limitations?: string[]
  related?: Link[]
}

const SOLO = 'Tek geliştirici.'
const BTC = '2026 · BTC Bilişim stajı'

export const PROJECT_TEXT: Record<string, ProjectText> = {
  'hotel-commerce-service': {
    tagline:
      'Gerçek bir otel veri seti üzerine kurulu, uçtan uca otel arama ve rezervasyon platformu.',
    role: 'Tek geliştirici — backend, arama, frontend, CI ve deploy.',
    period: BTC,
    problem:
      'Binlerce otel arasında arama anlık hissettirmeli — tam metin arama, filtreler, facet sayıları ve fiyat aralıkları aynı anda. Rezervasyonlar asla çakışmamalı, ev sahipleri de kimsenin incelemediği ilanları yayınlayamamalı.',
    solution:
      'Kalıcı veri için H2’yi, arama için ayrı bir Apache Solr indeksini kullanan bir Spring Boot API’si, Angular arayüzü ve üç rol: misafirler, ev sahipleri ve platform yöneticisi. Veriler gerçek bir otel veri setinden geliyor (Kaggle’daki TBO Hotels, 1M+ satır); repo, ilk çalıştırmada hazır olsun diye ~5.000 otellik bir alt küme içeriyor.',
    decisions: [
      {
        title: 'Arama indeksi, yayının kapısı',
        why: 'Ev sahibinin eklediği yeni otel H2’ye PENDING olarak kaydedilir ama indekslenmez. Solr’a ancak platform yöneticisi onaylayınca girer; onaylanmamış bir otel aramada hiç çıkmaz. Bir birim testi (HotelListingServiceTest) bu kuralı güvenceye alıyor.',
      },
      {
        title: 'Arama, filtreleme ve sıralama için ayrı alanlar',
        why: 'Şehir hem string (birebir filtreler ve facet sayıları için) hem de analiz edilmiş metin (büyük-küçük harf duyarsız arama için) olarak tutuluyor; “berlin” yazınca Berlin’deki her otel bulunuyor. Sıralamanın da kendi alanları var, çünkü metin alanları sıralanamıyor, string yıldızlar ise alfabetik sıralanıyor (FIVE < FOUR < ONE).',
      },
      {
        title: 'Çakışan rezervasyonlar tek sorguda yakalanıyor',
        why: 'Aynı oda için ikinci bir rezervasyon, klasik aralık kontrolüyle — `checkIn < :checkOut AND checkOut > :checkIn` — tek bir JPQL sorgusunda reddediliyor.',
      },
      {
        title: 'Kendini onaran bir arama indeksi',
        why: 'Kalıcı kaynak H2. Uygulama açılırken bir reindex adımı, indeks yoksa — ya da belgelerde yeni eklenen bir alan eksikse — Solr’u yeniden kuruyor; çünkü yalnızca belge saymak şema değişikliklerini gözden kaçırır.',
      },
      {
        title: 'Varsayılan olarak güvenli',
        why: 'Kullanıcı kimliği URL’den ya da istek gövdesinden değil, doğrulanmış JWT’den geliyor; kimse başkasının rezervasyonunu iptal edemiyor. Giriş hataları hangi e-postaların kayıtlı olduğunu ele vermiyor. Yüklenen dosyalar UUID ile yeniden adlandırılıyor, içerik tipi ve uzantı ayrı ayrı kontrol ediliyor.',
      },
    ],
    highlights: [
      'Ülke / şehir / yıldız facet’leri, fiyat aralığı filtresi, sıralama ve sayfalama ile tam metin arama',
      'Tarih çakışması kontrollü rezervasyon ve iptal; favoriler',
      'Ev sahipliği başvuruları, platform yöneticisinin incelemesi ve onayıyla',
      'E-posta doğrulama ve kimin ne zaman ne yaptığını gösteren yönetici denetim kaydı (audit log)',
      'Her push’ta CI; Docker Compose tüm sistemi tek komutla ayağa kaldırıyor',
    ],
    limitations: [
      'Otel fotoğrafları, yorumlar ve gecelik fiyatlar demo değerler (veri setinde bunlar yok), bu yüzden tüm oteller genelinde fiyata göre sıralama yok.',
    ],
  },
  'hotel-ai-concierge': {
    tagline:
      'Serbest yazılmış istekleri anlayan ve LLM tool calling ile gerçek otel API’sinde arama yapan bir WhatsApp asistanı.',
    role: SOLO,
    period: BTC,
    problem:
      'İlk WhatsApp botu kural tabanlıydı: şehri, tarihleri ve kişi sayısını adım adım soruyor, biri doğal yazdığı anda dağılıyordu — “bu hafta sonu Antalya’da 2000 TL altı 4 yıldızlı bir yer bul”.',
    solution:
      'Artık mesajı bir LLM okuyor ve hangi araçları çağıracağına kendisi karar veriyor — otel ara, detay getir, odaları listele — hepsi gerçek Hotel Commerce Service API’sine karşı; sonra doğal dilde cevap veriyor. WhatsApp katmanı aynı kaldı, sadece “beyin” değişti.',
    decisions: [
      {
        title: 'Tek bir prompt yerine ajan döngüsü',
        why: 'Düşün → bir aracı çağır → sonucu oku → tekrar düşün → cevapla. Döngü, WhatsApp’tan ayrı olarak kendi modülünde (src/ai/agent.js) duruyor.',
      },
      {
        title: 'Her aracın iki yarısı var',
        why: 'Modelin gördüğü bir şema ve otel backend’ine gerçek HTTP çağrısını yapan bir yürütücü. Model yalnızca zaten var olan ve zaten güvenli olan endpoint’ler üzerinden hareket edebiliyor.',
      },
      {
        title: 'Sağlayıcıdan bağımsız',
        why: 'OpenAI uyumlu bir istemci sayesinde Groq, Gemini ve yerel bir Ollama modeli arasında geçiş kodda değil, .env dosyasında yapılan bir değişiklik.',
      },
      {
        title: '“Asla uydurma”',
        why: 'System prompt, otel sorularını hafızadan cevaplamayı yasaklıyor: her otel, fiyat ve oda bir araç çağrısından gelmek zorunda.',
      },
    ],
    highlights: [
      'Serbest yazılmış Türkçe mesajları yapılandırılmış otel aramalarına çeviriyor',
      'Hotel Commerce Service backend’ini hiç değiştirmeden kullanıyor',
      'Katmanlı yapı: iletim · yapay zekâ · konuşma durumu · handler’lar',
    ],
    limitations: [
      'Konuşma geçmişi bellekte tutuluyor, bot yeniden başlayınca sıfırlanıyor.',
      'Resmi olmayan bir WhatsApp Web istemcisi olan whatsapp-web.js üzerinde çalışıyor — demo için uygun, gerçek trafik için değil.',
    ],
    related: [
      { label: 'Kural tabanlı önceki sürüm', href: '/projects/hotel-whatsapp-bot' },
      { label: 'Hotel Commerce Service', href: '/projects/hotel-commerce-service' },
    ],
  },
  'exam-verification-engine': {
    tagline:
      'Taranmış sınav kâğıtlarını şablonlarıyla karşılaştıran ve sonuca ne kadar güvendiğini raporlayan bir bilgisayarlı görü motoru.',
    role: 'Bir takımın sınav değerlendirme sistemindeki benim payım: layout parser’ı ve takımın FastAPI değerlendirme backend’ine entegre edilen bu doğrulama motorunu ben geliştirdim. Electron sınav oluşturucuyu ve değerlendirme backend’inin kendisini takım arkadaşlarım geliştirdi.',
    period: '2026 · Yazılım Mühendisliği dersi',
    problem:
      'Sınavlar basılıyor, elle dolduruluyor ve geri taranıyor — eğri, bulanık ya da kaymış. Değerlendirmeden önce sistemin, her taranmış sayfada her soru kutusunun tam yerini ve taramanın güvenilecek kadar iyi olup olmadığını bilmesi gerekiyor.',
    solution:
      'Motor taranmış sayfayı ve sınavın JSON şablonunu alıyor; tarama kalitesini kontrol ediyor, köşelerdeki dört hedef işaretini buluyor, sayfayı homografiyle düzeltiyor, ardından her soru bölgesini doğrulayıp öğrencinin işaretlerini tespit ediyor. Çıktı olarak işaretlenmiş bir görüntü ve PASS / PARTIAL / FAIL sonuçlu bir rapor üretiyor.',
    decisions: [
      {
        title: 'Sınav düzenleri kod değil, veri',
        why: 'Her sınav formatı bir JSON şablonunda tanımlı; yeni bir sınav, yeni kod değil yeni bir şablon demek.',
      },
      {
        title: 'Hedef işaretleri ve homografi',
        why: 'Köşelerdeki dört hedef işareti, baskı ve taramanın getirdiği dönmeyi ve eğikliği geri alan bir perspektif dönüşümü sağlıyor.',
      },
      {
        title: 'Okumadan önce taramayı kontrol et',
        why: 'Önce bulanıklık, dönme ve parlaklık ölçülüyor; böylece kötü bir tarama, kendinden emin bir yanlış cevap üretmek yerine güven skorunu düşürüyor.',
      },
      {
        title: 'Her soru tipine bir dedektör',
        why: 'Çoktan seçmeli için daire doluluğu, çoklu seçim için kare doluluğu, eşleştirme ve boşluk doldurma için kutu içeriği, açık uçlu sorular için yazı yoğunluğu.',
      },
    ],
    highlights: [
      'PDF sayfaları PyMuPDF ile 300 DPI görüntülere çevriliyor',
      'Birden çok taramayı karşılaştıran ve döndürülmüş / bulanık test varyantları üreten araçlar',
      'Exam Layout Parser olarak başladı, doğrulama motoruna dönüştü',
      'Takımın FastAPI değerlendirme backend’ine entegre edildi',
    ],
    limitations: [
      'Ders sınavlarının şablonlarına göre geliştirildi ve test edildi; başka sınav formatlarına göre değil.',
    ],
    related: [
      {
        label: 'Exam Layout Parser (ilk sürüm)',
        href: 'https://github.com/mertkaya01/ExamLayoutParser',
      },
      {
        label: 'Takım reposu: sınav oluşturucu (Electron)',
        href: 'https://github.com/faruksevuk/iku-exam-generator',
      },
      {
        label: 'Takım reposu: değerlendirme backend’i (FastAPI)',
        href: 'https://github.com/faruksevuk/iku-exam-backend',
      },
    ],
  },
  marketplace: {
    tagline:
      'Alıcılar, satıcılar ve yöneticiler için Spring Boot ve Angular ile geliştirilmiş çok satıcılı B2C pazaryeri.',
    role: SOLO,
    period: BTC,
    problem:
      'Trendyol tarzı bir pazaryerinde farklı yetkilere sahip üç tür kullanıcı, varyantlı ve stoklu ürünler, bir de satın alma sırasında bir şey değişse bile fiyatın, stoğun ve kuponun tutarlı kalması gereken bir ödeme akışı var.',
    solution:
      'Katmanlı bir Spring Boot API’si (entity → repository → service → controller, her sınırda DTO’lar) ve standalone component’ler, signal’lar ve lazy route’larla bir Angular 22 arayüzü. Alıcılar alışveriş yapıp siparişlerini takip ediyor, satıcılar ürünlerini yönetip siparişleri hazırlıyor, yöneticiler yeni satıcıları onaylıyor.',
    decisions: [
      {
        title: 'Yeniden kullanım tespitli refresh token rotasyonu',
        why: 'Her yenilemede yeni bir refresh token veriliyor; eski bir token tekrar kullanılırsa bu, yeniden kullanım olarak yakalanıyor.',
      },
      {
        title: 'Ödeme tek bir transaction’da',
        why: 'Stok düşülüyor, adresin ve fiyatların anlık kopyası alınıyor ve kupon uygulanıyor — hepsi birlikte. Böylece sonradan değişen fiyatlar geçmiş siparişleri asla değiştirmiyor.',
      },
      {
        title: 'Arama bir soyutlamanın arkasında',
        why: 'Filtreleme, sıralama ve sayfalama, ileride Solr ile değiştirilebilecek bir arayüzün arkasında JPA Specification’larla yapılıyor.',
      },
      {
        title: 'Yapılandırmayla veritabanından bağımsız',
        why: 'Geliştirmede dosya tabanlı H2, üretimde PostgreSQL; geçiş yalnızca yapılandırmayla.',
      },
    ],
    highlights: [
      'Kendi fiyatı ve stoğu olan ürün varyantları (renk / beden)',
      'Sepet → ödeme → kargo zaman çizelgeli sipariş takibi',
      'Satıcı paneli: gelir, siparişler, puan, düşük stok uyarıları',
      'Kuponlar, doğrulanmış alıcı yorumları, soru-cevap, koyu / açık tema, TR / EN',
    ],
    limitations: ['Canlı demo yok — repodan yerelde çalışıyor.'],
  },
  'uptime-monitor': {
    tagline:
      'Bir servis listesini OpenFeign ile düzenli aralıklarla yokluyor, açık / kapalı durumunu ve gecikmeyi gösteriyor, ücretsiz katmandaki deploy’ları uyanık tutuyor.',
    role: SOLO,
    period: '2026',
  },
  'hotel-whatsapp-bot': {
    tagline:
      'Kullanıcıyı otel aramasında adım adım yönlendiren ve Java API’si üzerinden kendi hesabıyla rezervasyon yapan, kural tabanlı bir WhatsApp botu.',
    role: SOLO,
    period: '2026',
  },
  'zenith-whatsapp-bot': {
    tagline:
      'Temiz, katmanlı mimari pratiği için geliştirilmiş bir komut botu: yeni bir komut eklemek, tek bir dosya eklemek demek.',
    role: SOLO,
    period: '2026',
  },
  'weather-currency-bot': {
    tagline:
      'Hava durumu ve döviz komutlarını ücretsiz Open-Meteo ve Frankfurter API’lerinden gelen canlı verilerle yanıtlıyor.',
    role: SOLO,
    period: '2026',
  },
  'capstone-secure-network': {
    title: 'Küçük Bir Şirket için Siber Güvenli Ağ',
    tagline:
      'Bitirme projesi: ayrı Extranet ve Intranet bölgeleri olan sanallaştırılmış bir kurumsal ağ — iki ağ geçidinde NAT ve güvenlik duvarları, Snort ile saldırı tespiti, dışarıya web erişimini filtreleyen bir Squid proxy ve merkezi giriş için OpenLDAP.',
    role: 'Takım lideri — ağ test ortamını tasarlayıp kurdum (üç kişilik takım).',
    period: '2025–2026 · Bitirme projesi',
  },
  linguatype: {
    tagline:
      'Aynı zamanda iki dilli bir EN ↔ TR kelime çalıştırıcısı olan, Monkeytype tarzı bir yazma hızı testi.',
    role: SOLO,
    period: '2026',
  },
  'data-analysis-engine': {
    tagline:
      'Ham CSV verisini Pandas ile temizleyen, yeni sütunlar türeten ve sonuçları SQLite’a kaydeden bir komut satırı aracı.',
    role: SOLO,
    period: '2023',
  },
}

export const projects: Project[] = en.map((project) => {
  const { related, ...text } = PROJECT_TEXT[project.slug]
  return {
    ...project,
    ...text,
    links: { ...project.links, ...(related ? { related } : {}) },
  } as Project
})
