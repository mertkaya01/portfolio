import type { Certificate, Education } from '../../types/content.ts'
import { certificates as enCertificates, education as en } from '../en/education.ts'

type EducationText = Pick<Education, 'school' | 'degree' | 'location' | 'details'>

// Turkish text for each school, by its English name (dates stay shared)
export const EDUCATION_TEXT: Record<string, EducationText> = {
  'Istanbul Kültür University': {
    school: 'İstanbul Kültür Üniversitesi',
    degree: 'Bilgisayar Mühendisliği (Lisans)',
    location: 'İstanbul',
    details: [
      'İlgili dersler: Veri Yapıları ve Algoritmalar, Nesneye Yönelik Programlama, İşletim Sistemleri, Yazılım Mühendisliği, Gömülü Sistemler ve Arduino.',
      'Bitirme projesi (takım lideri): Küçük Ölçekli Kurumsal Ağlar için Siber Güvenli Mimari Tasarımı.',
    ],
  },
  'Technische Hochschule Brandenburg': {
    school: 'Technische Hochschule Brandenburg',
    degree: 'Erasmus değişimi · Bilgisayar Bilimi ve Medya',
    location: 'Brandenburg an der Havel, Almanya',
    details: [
      'Uluslararası bir ortamda Bilgisayar Bilimi dersleri ve yüksek lisans seviyesinde işletme dersleri.',
      'Uluslararası öğrencilerle takım projeleri.',
    ],
  },
  'Fahreddin Kerim Gökay Anatolian High School': {
    school: 'Fahreddin Kerim Gökay Anadolu Lisesi',
    degree: 'Sayısal bölüm',
    location: 'İstanbul',
    details: [],
  },
}

export const education: Education[] = en.map((school) => ({
  ...school,
  ...EDUCATION_TEXT[school.school],
}))

const CERTIFICATE_NAMES: Record<string, string> = {
  'Introduction to Software Testing (participation)': 'Yazılım Testine Giriş (katılım)',
  'Linux Fundamentals 101 · 201 · 301 · 401': 'Linux Temelleri 101 · 201 · 301 · 401',
}

export const certificates: Certificate[] = enCertificates.map((cert) => ({
  ...cert,
  name: CERTIFICATE_NAMES[cert.name] ?? cert.name,
}))
