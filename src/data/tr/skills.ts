import type { SkillGroup } from '../../types/content.ts'
import { skillGroups as en } from '../en/skills.ts'

type GroupText = {
  title: string
  summary: string
  // only the skills whose name or detail needs Turkish; technology names stay as they are
  skills?: Record<string, { name?: string; detail?: string }>
}

// Turkish text for each group, by its English title (levels and projects stay shared)
export const SKILL_TEXT: Record<string, GroupText> = {
  Languages: {
    title: 'Diller',
    summary: 'Kod yazdığım diller — en çok Java ve TypeScript.',
    skills: {
      'C · C++': { detail: 'Başlangıç seviyesi' },
      R: { detail: 'Başlangıç seviyesi' },
      Arduino: { detail: 'Gömülü sistemler dersi' },
    },
  },
  Backend: {
    title: 'Backend',
    summary: 'REST API’leri, güvenlik ve veri erişimi — çoğunlukla Java ve Spring Boot.',
    skills: { 'REST API design': { name: 'REST API tasarımı' } },
  },
  Frontend: {
    title: 'Frontend',
    summary: 'Angular ve React ile tek sayfalı uygulamalar.',
  },
  'AI & Data': {
    title: 'Yapay Zekâ ve Veri',
    summary: 'Python ile bilgisayarlı görü, gerçek API’leri çağıran LLM ajanları, veri temizleme.',
    skills: { 'LLM tool calling · agents': { name: 'LLM tool calling · ajanlar' } },
  },
  'Databases & Search': {
    title: 'Veritabanları ve Arama',
    summary: 'Tam metin arama, ilişkisel ve NoSQL veritabanları.',
  },
  'DevOps & Tools': {
    title: 'DevOps ve Araçlar',
    summary: 'Versiyon kontrolü, container’lar, CI pipeline’ları, deploy ve otomatik testler.',
    skills: {
      'Git · GitHub': { detail: 'Bu sayfadaki her proje GitHub’da bir Git reposunda.' },
      Linux: { detail: 'Linux Temelleri 101–401 sertifikası; bitirme projemin sunucuları.' },
    },
  },
  'Networking & Security': {
    title: 'Ağ ve Güvenlik',
    summary: 'Bölümlere ayrılmış, izlenen bir kurumsal ağ — bitirme projem.',
    skills: {
      'Network segmentation': {
        name: 'Ağ segmentasyonu',
        detail:
          'Yalnızca ağ geçitleri üzerinden birbirine bağlanan, herkese açık bir Extranet (DMZ) ve özel bir Intranet.',
      },
      'Firewall & gateway rules': {
        name: 'Güvenlik duvarı ve ağ geçidi kuralları',
        detail:
          'Bölgeler arasında hangi trafiğin geçebileceğine karar veren sınır ve intranet ağ geçitleri.',
      },
      'Intrusion detection': {
        name: 'Saldırı tespiti',
        detail: 'Intranet ağ geçidinde trafiği şüpheli hareketlere karşı izleyen Snort.',
      },
      'Proxy-based web filtering': {
        name: 'Proxy tabanlı web filtreleme',
        detail:
          'Şirket içi kullanıcıların internet erişimine aracılık eden ve onu filtreleyen bir Squid proxy.',
      },
      'Central authentication': {
        name: 'Merkezi kimlik doğrulama',
        detail: 'OpenLDAP ile ağdaki her kullanıcı için tek bir kimlik.',
      },
      'Linux server administration': {
        name: 'Linux sunucu yönetimi',
        detail:
          'Oracle VirtualBox üzerinde Ubuntu Server sanal makineleri, Apache web sunucusu ve Dnsmasq DNS.',
      },
    },
  },
  'Creative & AI tools': {
    title: 'Yaratıcı ve Yapay Zekâ Araçları',
    summary: 'Tasarım, video düzenleme, 3D ve yapay zekâ araçları.',
  },
}

export const skillGroups: SkillGroup[] = en.map((group) => {
  const text = SKILL_TEXT[group.title]
  return {
    ...group,
    title: text.title,
    summary: text.summary,
    skills: group.skills.map((skill) => ({ ...skill, ...text.skills?.[skill.name] })),
  }
})
