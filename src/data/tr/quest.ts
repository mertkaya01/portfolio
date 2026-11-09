import type { Chapter, ChapterId } from '../../types/content.ts'
import { chapters as en } from '../en/quest.ts'

type ChapterText = {
  title: string
  period?: string // only when it reads differently in Turkish
  captions: Record<string, string> // by scene id — the same ids as in English (content:check)
}

// The five sets in Turkish
export const QUEST_TEXT: Record<ChapterId, ChapterText> = {
  highschool: {
    title: 'Lise',
    captions: {
      wake: 'Lisede sıradan bir gün. Alarm çalıyor.',
      bus: 'Okula sabah otobüsü.',
      class: 'Sayısal bölüm — arkadaşlarla ders.',
      lunch:
        'Fahreddin Kerim Gökay Anadolu Lisesi. Öğle arası: bahçede bir top — voleybol burada başlıyor.',
      training:
        'Okuldan sonra idman. 2020 başı, Aydın — liselerarası Türkiye şampiyonası, orta oyuncu.',
      night: 'Eve dönüş, ders, uyku. Tekrar.',
    },
  },
  exam: {
    title: 'Üniversite Sınavı',
    captions: {
      prep: 'Üniversite sınavına hazırlıkla geçen koca bir yıl.',
      mocks: 'Deneme sınavları. Optik formlar. Minik dairelere kurşun kalem işaretleri.',
      'exam-day': 'Sınav günü.',
      accepted: 'Kabul: İstanbul Kültür Üniversitesi, Bilgisayar Mühendisliği.',
    },
  },
  university: {
    title: 'Üniversite – Bilgisayar Müh.',
    captions: {
      iku: 'İstanbul Kültür Üniversitesi · Bilgisayar Mühendisliği.',
      courses: 'Veri yapıları, işletim sistemleri, yazılım mühendisliği, gömülü sistemler.',
      volleyball: 'Voleybol durmadı: üniversite takımında smaçör, 9 numara.',
      'exam-reader': 'Optik form dolduran çocuk, taranmış sınavları okuyan bir yazılım geliştirdi.',
      capstone: 'Bitirme projesi: küçük bir şirket için siber güvenli bir ağ.',
    },
  },
  erasmus: {
    title: 'Erasmus',
    captions: {
      move: 'İstanbul → Brandenburg an der Havel.',
      havel: 'Havel kıyısında altı ay — mükemmeldi.',
      'th-brandenburg':
        'TH Brandenburg’da Erasmus değişimi — bilgisayar bilimi dersleri ve yüksek lisans seviyesinde işletme dersleri.',
      teams: 'Uluslararası öğrencilerle takım projeleri.',
    },
  },
  now: {
    title: 'Tie-break',
    captions: {
      graduated: 'Mezun oldum.',
      internship:
        'BTC Bilişim’de staj: bir otel platformu, bir pazaryeri ve yapay zekâ destekli WhatsApp botları.',
      looking: 'Şimdi: yeni takımımı arıyorum.',
    },
  },
}

export const chapters: Chapter[] = en.map((chapter) => {
  const text = QUEST_TEXT[chapter.id]
  return {
    ...chapter,
    title: text.title,
    period: text.period ?? chapter.period,
    // a caption missing in Turkish falls back to English (content:check reports it)
    scenes: chapter.scenes.map((scene) => ({
      ...scene,
      caption: text.captions[scene.id] ?? scene.caption,
    })),
  }
})
