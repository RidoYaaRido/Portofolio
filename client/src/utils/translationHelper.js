// translationHelper.js - Bilingual support helper utility

export const translateTextApi = async (text, targetLang) => {
  if (!text || text.trim() === '') return '';
  try {
    const sl = targetLang === 'en' ? 'id' : 'en';
    const tl = targetLang;
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`
    );
    if (!response.ok) throw new Error('Translation failed');
    const data = await response.json();
    if (data && data[0]) {
      return data[0].map(item => item[0]).join('');
    }
    return text;
  } catch (error) {
    console.error('Translation API error:', error);
    return text;
  }
};

export const parseTranslated = (val) => {
  if (!val) return { id: '', en: '' };
  if (typeof val === 'object') {
    return {
      id: val.id || '',
      en: val.en || ''
    };
  }
  try {
    const obj = JSON.parse(val);
    if (obj && typeof obj === 'object' && (obj.id !== undefined || obj.en !== undefined)) {
      return {
        id: obj.id || '',
        en: obj.en || ''
      };
    }
  } catch (e) {
    // Not valid JSON, return as both values for backward compatibility
  }
  return { id: val, en: val };
};

export const translateText = (val, lang = 'id') => {
  const parsed = parseTranslated(val);
  return parsed[lang] || parsed['id'] || parsed['en'] || '';
};

export const dictionary = {
  id: {
    about: 'Tentang',
    resume: 'Resume',
    portfolio: 'Portofolio',
    blog: 'Blog',
    contact: 'Kontak',
    email: 'SUREL',
    phone: 'TELEPON',
    birthday: 'TANGGAL LAHIR',
    location: 'LOKASI',
    whatImDoing: 'Apa Yang Saya Lakukan',
    education: 'Pendidikan',
    experience: 'Pengalaman',
    certifications: 'Sertifikasi',
    skills: 'Keahlian',
    sendMessage: 'Kirim Pesan',
    name: 'Nama',
    emailLabel: 'Alamat Email',
    message: 'Pesan',
    subject: 'Subjek',
    sending: 'Mengirim...',
    successContact: 'Pesan berhasil dikirim!',
    failedContact: 'Gagal mengirim pesan.',
    noProjects: 'Tidak ada proyek di kategori ini.',
    noBlogs: 'Belum ada postingan blog.',
    readMore: 'Baca Selengkapnya',
    readTime: 'menit baca',
    featured: 'Unggulan',
    category: 'Kategori',
    status: 'Status',
    description: 'Deskripsi',
    technologies: 'Teknologi',
    liveDemo: 'Demo Langsung',
    githubRepo: 'Repositori GitHub',
    tapForDetails: 'Ketuk untuk detail',
    noDescription: 'Tidak ada deskripsi tersedia.',
    aboutSkill: 'Tentang keahlian ini',
    skillOverview: 'Ikhtisar Keahlian',
    expert: 'Ahli',
    advanced: 'Mahir',
    intermediate: 'Menengah',
    competent: 'Kompeten',
    beginner: 'Pemula',
    formNamePlaceholder: 'Nama Lengkap',
    formEmailPlaceholder: 'Alamat email Anda',
    formMessagePlaceholder: 'Pesan Anda...',
    loading: 'Memuat...'
  },
  en: {
    about: 'About',
    resume: 'Resume',
    portfolio: 'Portfolio',
    blog: 'Blog',
    contact: 'Contact',
    email: 'EMAIL',
    phone: 'PHONE',
    birthday: 'BIRTHDAY',
    location: 'LOCATION',
    whatImDoing: "What I'm Doing",
    education: 'Education',
    experience: 'Experience',
    certifications: 'Certifications',
    skills: 'Skills',
    sendMessage: 'Send Message',
    name: 'Name',
    emailLabel: 'Email Address',
    message: 'Message',
    subject: 'Subject',
    sending: 'Sending...',
    successContact: 'Message sent successfully!',
    failedContact: 'Failed to send message.',
    noProjects: 'No projects available in this category.',
    noBlogs: 'No blog posts available yet.',
    readMore: 'Read More',
    readTime: 'min read',
    featured: 'Featured',
    category: 'Category',
    status: 'Status',
    description: 'Description',
    technologies: 'Technologies',
    liveDemo: 'Live Demo',
    githubRepo: 'GitHub Repository',
    tapForDetails: 'Tap for details',
    noDescription: 'No description available.',
    aboutSkill: 'About this skill',
    skillOverview: 'Skill Overview',
    expert: 'Expert',
    advanced: 'Advanced',
    intermediate: 'Intermediate',
    competent: 'Competent',
    beginner: 'Beginner',
    formNamePlaceholder: 'Full Name',
    formEmailPlaceholder: 'Your email address',
    formMessagePlaceholder: 'Your message...',
    loading: 'Loading...'
  }
};
