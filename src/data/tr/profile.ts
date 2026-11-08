import type { Profile } from '../../types/content.ts'
import { profile as en } from '../en/profile.ts'

// Turkish profile: the English one with the text replaced (links, numbers and dates stay shared)
export const profile: Profile = {
  ...en,
  headline: 'Bilgisayar Mühendisi · Backend ve Full-stack · Uygulamalı Yapay Zekâ',
  location: 'İstanbul, Türkiye',
  photo: { ...en.photo, alt: 'Mert Kaya’nın portresi' },
  summary:
    'İstanbul Kültür Üniversitesi Bilgisayar Mühendisliği mezunuyum. Spring Boot ve Angular ile uçtan uca sistemler, Python, OpenCV ve LLM’lerle uygulamalı yapay zekâ araçları geliştiriyorum. Dokuz yıllık rekabetçi voleybol bana iyi bir takımın nasıl çalıştığını öğretti — şimdi yeni takımımı arıyorum.',
  availability: 'Yeni fırsatlara açığım',
  lookingFor: [
    'Junior Backend Mühendisi',
    'Junior Full-stack Mühendisi',
    'Uygulamalı Yapay Zekâ / Bilgisayarlı Görü',
  ],
  spokenLanguages: [
    { name: 'Türkçe', level: 'Anadil' },
    { name: 'İngilizce', level: 'C1' },
    { name: 'Almanca', level: 'A2' },
  ],
  licenses: ['A2 ve B sınıfı sürücü belgesi', 'Drone pilotu', 'Tekne ehliyeti', 'Telsiz operatörü'],
  volleyball: {
    ...en.volleyball,
    position: 'Smaçör',
    positionNote:
      'Smaçör — ve o gün takımda hangi pozisyon eksikse. Yazılım ekibinde de durum aynı.',
  },
  sport: {
    ...en.sport,
    highlights: [
      {
        label: 'Voleybol',
        icon: 'volleyball',
        text: 'Dokuz sezon rekabetçi voleybol — bugün smaçör, 9 numara.',
      },
      {
        label: 'Lise',
        icon: 'medal',
        text: 'Lise boyunca voleybol ve atletizm; liselerarası turnuvalarda madalyalar.',
      },
      {
        label: 'Oryantiring ve atletizm',
        icon: 'compass',
        text: 'Oryantiring ve kısa mesafe koşu dahil atletizmde madalyalar.',
      },
      {
        label: 'Matematik yarışmaları',
        icon: 'math',
        text: 'Olimpiyat tarzı yarışmalar dahil matematik yarışmalarında da madalyalar.',
      },
    ],
  },
}
