import type { Chapter, ChapterId } from '../../types/content.ts'
import { chapters as en } from '../en/quest.ts'

type ChapterText = Pick<Chapter, 'title' | 'beats'>

// The five sets in Turkish. Same number of lines per set as in English (content:check checks).
const TEXT: Record<ChapterId, ChapterText> = {
  highschool: {
    title: 'Lise',
    beats: [
      'İstanbul, 2017.',
      'Fahreddin Kerim Gökay Anadolu Lisesi — sayısal bölüm. Voleybol burada başlıyor.',
      'İlk maç: libero oynadım. Ağır yenildik.',
      '2020 başı: Aydın’da liselerarası Türkiye şampiyonası. Orta oyuncu oynadım — zordu ve harikaydı.',
    ],
  },
  exam: {
    title: 'Sınav',
    beats: [
      'Üniversite sınavına hazırlıkla geçen koca bir yıl.',
      'Deneme sınavları. Optik formlar. Minik dairelere kurşun kalem işaretleri.',
      'Sınav günü.',
      'Kabul: İstanbul Kültür Üniversitesi, Bilgisayar Mühendisliği.',
    ],
  },
  university: {
    title: 'Üniversite',
    beats: [
      'İstanbul Kültür Üniversitesi · Bilgisayar Mühendisliği.',
      'Veri yapıları, işletim sistemleri, yazılım mühendisliği, gömülü sistemler.',
      'Optik form dolduran çocuk, taranmış sınavları okuyan bir yazılım geliştirdi.',
      'Bitirme projesi: küçük bir şirket için siber güvenli bir ağ.',
    ],
  },
  erasmus: {
    title: 'Erasmus',
    beats: [
      'İstanbul → Brandenburg an der Havel.',
      'TH Brandenburg’da Erasmus değişimi — Bilgisayar Bilimi ve Medya.',
      'Uluslararası öğrencilerle takım projeleri.',
    ],
  },
  now: {
    title: 'Tie-break',
    beats: [
      'Mezun oldum.',
      'BTC Bilişim’de staj: bir otel platformu, bir pazaryeri ve yapay zekâ destekli WhatsApp botları.',
      'Şimdi: yeni takımımı arıyorum.',
    ],
  },
}

export const chapters: Chapter[] = en.map((chapter) => ({ ...chapter, ...TEXT[chapter.id] }))
