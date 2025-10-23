// Système de traduction simple pour la section d'affiliation
export interface Language {
  code: string;
  name: string;
  flag: string;
}

export const supportedLanguages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
];

// Traductions pour la section d'affiliation
export const affiliationTranslations = {
  en: {
    title: "Partner with Us & Earn!",
    description: "Become an affiliate partner",
    email: "realtimetradingsignal@gmail.com"
  },
  fr: {
    title: "Rejoignez notre programme d'affiliation",
    description: "Gagnez 35% de commission sur chaque inscription générée via vos liens uniques.",
    email: "realtimetradingsignal@gmail.com"
  },
  es: {
    title: "¡Únete a nuestro programa de afiliados!",
    description: "Gana 35% de comisión por cada registro generado a través de tus enlaces únicos.",
    email: "realtimetradingsignal@gmail.com"
  },
  de: {
    title: "Werden Sie unser Partner & verdienen Sie!",
    description: "Verdienen Sie 35% Provision für jede über Ihre eindeutigen Links generierte Registrierung.",
    email: "realtimetradingsignal@gmail.com"
  },
  it: {
    title: "Diventa nostro partner e guadagna!",
    description: "Guadagna il 35% di commissione su ogni registrazione generata tramite i tuoi link unici.",
    email: "realtimetradingsignal@gmail.com"
  },
  pt: {
    title: "Torne-se nosso parceiro e ganhe!",
    description: "Ganhe 35% de comissão em cada registro gerado através dos seus links únicos.",
    email: "realtimetradingsignal@gmail.com"
  },
  ru: {
    title: "Станьте нашим партнером и зарабатывайте!",
    description: "Получайте 35% комиссии с каждой регистрации, сгенерированной через ваши уникальные ссылки.",
    email: "realtimetradingsignal@gmail.com"
  },
  zh: {
    title: "加入我们的合作伙伴计划！",
    description: "通过您的专属链接生成的每个注册获得35%佣金。",
    email: "realtimetradingsignal@gmail.com"
  },
  ja: {
    title: "私たちのパートナーシッププログラムに参加しましょう！",
    description: "あなたのユニークなリンクを通じて生成された各登録で35%のコミッションを獲得。",
    email: "realtimetradingsignal@gmail.com"
  },
  ko: {
    title: "우리의 파트너십 프로그램에 참여하세요!",
    description: "귀하의 고유 링크를 통해 생성된 각 등록에 대해 35% 커미션을 받으세요.",
    email: "realtimetradingsignal@gmail.com"
  },
  ar: {
    title: "انضم إلى برنامج الشراكة الخاص بنا!",
    description: "اكسب 35% عمولة على كل تسجيل يتم إنشاؤه عبر روابطك الفريدة.",
    email: "realtimetradingsignal@gmail.com"
  },
  hi: {
    title: "हमारे साझेदारी कार्यक्रम में शामिल हों!",
    description: "आपके अद्वितीय लिंक के माध्यम से उत्पन्न प्रत्येक पंजीकरण पर 35% कमीशन कमाएं।",
    email: "realtimetradingsignal@gmail.com"
  }
};

// Fonction pour obtenir la traduction selon la langue
export const getAffiliationTranslation = (languageCode: string) => {
  return affiliationTranslations[languageCode as keyof typeof affiliationTranslations] || affiliationTranslations.en;
};

// Fonction pour détecter la langue du navigateur
export const detectBrowserLanguage = (): string => {
  const browserLang = navigator.language.split('-')[0];
  return supportedLanguages.find(lang => lang.code === browserLang)?.code || 'en';
};
