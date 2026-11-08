import type { Experience } from '../../types/content.ts'
import { experience as en } from '../en/experience.ts'

type ExperienceText = Pick<Experience, 'role' | 'location' | 'bullets'>

// Turkish text for each job, by company (dates, technologies and projects stay shared)
export const EXPERIENCE_TEXT: Record<string, ExperienceText> = {
  'BTC Bilişim Hizmetleri A.Ş.': {
    role: 'Stajyer',
    location: 'İstanbul',
    bullets: [
      'Spring Boot ve Angular ile uçtan uca bir otel arama ve rezervasyon servisi ile çok satıcılı bir pazaryeri geliştirdim.',
      'Tam metin arama, facet’ler ve fiyat aralığı filtresi için Apache Solr entegre ettim.',
      'Node.js ile WhatsApp otomasyon botları geliştirdim; bunlardan biri, tool calling ile gerçek backend’i çağırarak otel arayan bir LLM ajanı.',
      'GitHub Actions ile CI kurdum, uygulamaları Docker ile container’laştırıp Vercel ve Render’a deploy ettim.',
      'REST API’lerini stateless JWT, rol bazlı erişim kontrolü ve BCrypt ile güvenli hale getirdim.',
      'JUnit 5, Mockito ve Vitest ile birim ve entegrasyon testleri yazdım.',
    ],
  },
  'Modakent Tekstil': {
    role: 'BT Personeli',
    location: 'İstanbul',
    bullets: [
      'Entegra uygulamasını 20’den fazla bilgisayara kurup yapılandırarak fatura ve satış akışını hızlandırdım.',
      'Birden çok satış platformu (Trendyol, N11 ve şirketin sitesi) için ürün verilerini XML ve Excel ile yönettim.',
      'Donanım kurulumları yaptım ve kullanıcıların yeni yazılım araçlarına alışmasına yardımcı oldum.',
    ],
  },
  'INKA Human Resources · ME Agency · BRN&NU Agency': {
    role: 'Yarı Zamanlı Etkinlik Personeli',
    location: 'İstanbul',
    bullets: [
      'Volkswagen Arena, Ülker Spor ve Etkinlik Salonu, Sinan Erdem, Atatürk Kültür Merkezi, Haliç Kongre Merkezi ve TÜYAP’taki etkinliklerde koordinasyon ve organizasyon görevi aldım.',
      'Yenikapı ISTFEST’te BRN&NU ve MR.DIY ile ziyaretçiler için bir oryantiring yarışması yürüttüm; grupları karşıladım, katılımcılarla birebir ilgilendim.',
    ],
  },
}

export const experience: Experience[] = en.map((job) => ({
  ...job,
  ...EXPERIENCE_TEXT[job.company],
}))
