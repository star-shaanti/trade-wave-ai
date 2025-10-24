// Système de traduction global pour tout le site
export interface Language {
  code: string;
  name: string;
  flag: string;
}

export const supportedLanguages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
];

// Traductions globales pour tout le site
export const globalTranslations = {
  en: {
    // Contenu principal
    heroTitle: "AI-POWERED REAL-TIME TRADING SIGNALS",
    heroSubtitle: "AND OUR PROFESSIONAL TRADERS",
    heroDescription: "Harness the power of our advanced AI to get institutional-grade BUY/SELL signals for Forex, Indices, and Crypto markets.",
    activeTraders: "active traders online",
    
    // Boutons et actions
    signIn: "Sign In",
    signUp: "Sign Up",
    getStarted: "Get Started",
    upgradeNow: "Upgrade Now",
    learnMore: "Learn More",
    
    // Section d'affiliation
    affiliateTitle: "Join our affiliate program",
    affiliateDescription: "Earn 35% commission on each registration generated via your unique links.",
    affiliateButton: "Join the program",
    affiliateLink: "Click here to join the affiliate program",
    affiliateStats: "COMMISSIONS PAID",
    affiliateEmail: "realtimetradingsignal@gmail.com",
    
    // Trading Bot Settings
    tradingBotSettings: "Trading Bot Settings",
    configureTradingSettings: "Configure your trading settings",
    category: "Category",
    asset: "Asset",
    timeframe: "Timeframe",
    open: "Open",
    closed: "Closed",
    logInToGetSignals: "Log In to Get Signals",
    
    // Active Signals
    activeSignals: "ACTIVE SIGNALS",
    noActiveSignals: "No active signals.",
    selectSettingsFirst: "First select settings, then click on Start Signals, and you will see the active signal here.",
    startSignals: "Start Signals"
  },
  fr: {
    // Contenu principal
    heroTitle: "SIGNAUX DE TRADING EN TEMPS RÉEL ALIMENTÉS PAR IA",
    heroSubtitle: "ET NOS TRADERS PROFESSIONNELS",
    heroDescription: "Exploitez la puissance de notre IA avancée pour obtenir des signaux ACHETER/VENDRE de niveau institutionnel pour les marchés Forex, Indices et Crypto.",
    activeTraders: "traders actifs en ligne",
    
    // Boutons et actions
    signIn: "Se connecter",
    signUp: "S'inscrire",
    getStarted: "Commencer",
    upgradeNow: "Mettre à niveau maintenant",
    learnMore: "En savoir plus",
    
    // Section d'affiliation
    affiliateTitle: "Rejoignez notre programme d'affiliation",
    affiliateDescription: "Gagnez 35% de commission sur chaque inscription générée via vos liens uniques.",
    affiliateButton: "Rejoindre le programme",
    affiliateLink: "Cliquez ici pour rejoindre le programme d'affiliation",
    affiliateStats: "COMMISSIONS PAYÉES",
    affiliateEmail: "realtimetradingsignal@gmail.com",
    
    // Trading Bot Settings
    tradingBotSettings: "Paramètres du Bot de Trading",
    configureTradingSettings: "Configurez vos paramètres de trading",
    category: "Catégorie",
    asset: "Actif",
    timeframe: "Période",
    open: "Ouvert",
    closed: "Fermé",
    logInToGetSignals: "Se connecter pour obtenir les signaux",
    
    // Active Signals
    activeSignals: "SIGNAUX ACTIFS",
    noActiveSignals: "Aucun signal actif.",
    selectSettingsFirst: "Sélectionnez d'abord les paramètres, puis cliquez sur Démarrer les signaux, et vous verrez le signal actif ici.",
    startSignals: "Démarrer les signaux"
  },
  es: {
    // Contenu principal
    heroTitle: "SEÑALES DE TRADING EN TIEMPO REAL IMPULSADAS POR IA",
    heroSubtitle: "Y NUESTROS TRADERS PROFESIONALES",
    heroDescription: "Aprovecha el poder de nuestra IA avanzada para obtener señales COMPRAR/VENDER de nivel institucional para mercados Forex, Índices y Crypto.",
    activeTraders: "traders activos en línea",
    
    // Boutons et actions
    signIn: "Iniciar sesión",
    signUp: "Registrarse",
    getStarted: "Comenzar",
    upgradeNow: "Actualizar ahora",
    learnMore: "Saber más",
    
    // Section d'affiliation
    affiliateTitle: "Únete a nuestro programa de afiliados",
    affiliateDescription: "Gana 35% de comisión en cada registro generado a través de tus enlaces únicos.",
    affiliateButton: "Únete al programa",
    affiliateLink: "Haz clic aquí para unirte al programa de afiliados",
    affiliateStats: "COMISIONES PAGADAS",
    affiliateEmail: "realtimetradingsignal@gmail.com",
    
    // Trading Bot Settings
    tradingBotSettings: "Configuración del Bot de Trading",
    configureTradingSettings: "Configura tus parámetros de trading",
    category: "Categoría",
    asset: "Activo",
    timeframe: "Marco temporal",
    open: "Abierto",
    closed: "Cerrado",
    logInToGetSignals: "Iniciar sesión para obtener señales",
    
    // Active Signals
    activeSignals: "SEÑALES ACTIVAS",
    noActiveSignals: "No hay señales activas.",
    selectSettingsFirst: "Primero selecciona la configuración, luego haz clic en Iniciar Señales, y verás la señal activa aquí.",
    startSignals: "Iniciar Señales"
  },
  it: {
    // Contenu principal
    heroTitle: "SEGNALI DI TRADING IN TEMPO REALE ALIMENTATI DA IA",
    heroSubtitle: "E I NOSTRI TRADER PROFESSIONISTI",
    heroDescription: "Sfrutta il potere della nostra IA avanzata per ottenere segnali COMPRA/VENDI di livello istituzionale per i mercati Forex, Indici e Crypto.",
    activeTraders: "trader attivi online",
    
    // Boutons et actions
    signIn: "Accedi",
    signUp: "Registrati",
    getStarted: "Inizia",
    upgradeNow: "Aggiorna ora",
    learnMore: "Scopri di più",
    
    // Section d'affiliation
    affiliateTitle: "Unisciti al nostro programma di affiliazione",
    affiliateDescription: "Guadagna il 35% di commissione su ogni registrazione generata tramite i tuoi link unici.",
    affiliateButton: "Unisciti al programma",
    affiliateLink: "Clicca qui per unirti al programma di affiliazione",
    affiliateStats: "COMMISSIONI PAGATE",
    affiliateEmail: "realtimetradingsignal@gmail.com",
    
    // Trading Bot Settings
    tradingBotSettings: "Impostazioni Bot di Trading",
    configureTradingSettings: "Configura le tue impostazioni di trading",
    category: "Categoria",
    asset: "Attivo",
    timeframe: "Timeframe",
    open: "Aperto",
    closed: "Chiuso",
    logInToGetSignals: "Accedi per ottenere i segnali",
    
    // Active Signals
    activeSignals: "SEGNALI ATTIVI",
    noActiveSignals: "Nessun segnale attivo.",
    selectSettingsFirst: "Prima seleziona le impostazioni, poi clicca su Inizia Segnali, e vedrai il segnale attivo qui.",
    startSignals: "Inizia Segnali"
  },
  pt: {
    // Contenu principal
    heroTitle: "SINAIS DE TRADING EM TEMPO REAL ALIMENTADOS POR IA",
    heroSubtitle: "E NOSSOS TRADERS PROFISSIONAIS",
    heroDescription: "Aproveite o poder da nossa IA avançada para obter sinais COMPRAR/VENDER de nível institucional para mercados Forex, Índices e Crypto.",
    activeTraders: "traders ativos online",
    
    // Boutons et actions
    signIn: "Entrar",
    signUp: "Registrar",
    getStarted: "Começar",
    upgradeNow: "Atualizar agora",
    learnMore: "Saber mais",
    
    // Section d'affiliation
    affiliateTitle: "Junte-se ao nosso programa de afiliados",
    affiliateDescription: "Ganhe 35% de comissão em cada registro gerado através dos seus links únicos.",
    affiliateButton: "Juntar-se ao programa",
    affiliateLink: "Clique aqui para se juntar ao programa de afiliados",
    affiliateStats: "COMISSÕES PAGAS",
    affiliateEmail: "realtimetradingsignal@gmail.com"
  },
  ru: {
    // Contenu principal
    heroTitle: "СИГНАЛЫ ТОРГОВЛИ В РЕАЛЬНОМ ВРЕМЕНИ НА ОСНОВЕ ИИ",
    heroSubtitle: "И НАШИ ПРОФЕССИОНАЛЬНЫЕ ТРЕЙДЕРЫ",
    heroDescription: "Используйте силу нашего продвинутого ИИ для получения институциональных сигналов ПОКУПАТЬ/ПРОДАВАТЬ для рынков Forex, Индексов и Крипто.",
    activeTraders: "активных трейдеров онлайн",
    
    // Boutons et actions
    signIn: "Войти",
    signUp: "Зарегистрироваться",
    getStarted: "Начать",
    upgradeNow: "Обновить сейчас",
    learnMore: "Узнать больше",
    
    // Section d'affiliation
    affiliateTitle: "Присоединяйтесь к нашей партнерской программе",
    affiliateDescription: "Зарабатывайте 35% комиссии с каждой регистрации, сгенерированной через ваши уникальные ссылки.",
    affiliateButton: "Присоединиться к программе",
    affiliateLink: "Нажмите здесь, чтобы присоединиться к партнерской программе",
    affiliateStats: "ВЫПЛАЧЕННЫЕ КОМИССИИ",
    affiliateEmail: "realtimetradingsignal@gmail.com"
  },
  ar: {
    // Contenu principal
    heroTitle: "إشارات التداول في الوقت الفعلي مدعومة بالذكاء الاصطناعي",
    heroSubtitle: "وتجارنا المحترفون",
    heroDescription: "استفد من قوة الذكاء الاصطناعي المتقدم للحصول على إشارات شراء/بيع على مستوى المؤسسات لأسواق الفوركس والمؤشرات والعملات المشفرة.",
    activeTraders: "تاجر نشط على الإنترنت",
    
    // Boutons et actions
    signIn: "تسجيل الدخول",
    signUp: "التسجيل",
    getStarted: "ابدأ",
    upgradeNow: "ترقية الآن",
    learnMore: "اعرف المزيد",
    
    // Section d'affiliation
    affiliateTitle: "انضم إلى برنامج الشراكة الخاص بنا",
    affiliateDescription: "اكسب 35% عمولة على كل تسجيل يتم إنشاؤه عبر روابطك الفريدة.",
    affiliateButton: "انضم إلى البرنامج",
    affiliateLink: "انقر هنا للانضمام إلى برنامج الشراكة",
    affiliateStats: "العمولات المدفوعة",
    affiliateEmail: "realtimetradingsignal@gmail.com"
  },
  hi: {
    // Contenu principal
    heroTitle: "AI-संचालित रियल-टाइम ट्रेडिंग सिग्नल",
    heroSubtitle: "और हमारे पेशेवर ट्रेडर",
    heroDescription: "फॉरेक्स, इंडेक्स और क्रिप्टो बाजारों के लिए संस्थागत-ग्रेड खरीद/बेच सिग्नल प्राप्त करने के लिए हमारी उन्नत AI की शक्ति का उपयोग करें।",
    activeTraders: "सक्रिय ट्रेडर ऑनलाइन",
    
    // Boutons et actions
    signIn: "साइन इन",
    signUp: "साइन अप",
    getStarted: "शुरू करें",
    upgradeNow: "अभी अपग्रेड करें",
    learnMore: "और जानें",
    
    // Section d'affiliation
    affiliateTitle: "हमारे सहयोग कार्यक्रम में शामिल हों",
    affiliateDescription: "आपके अद्वितीय लिंक के माध्यम से उत्पन्न प्रत्येक पंजीकरण पर 35% कमीशन कमाएं।",
    affiliateButton: "कार्यक्रम में शामिल हों",
    affiliateLink: "सहयोग कार्यक्रम में शामिल होने के लिए यहां क्लिक करें",
    affiliateStats: "भुगतान किए गए कमीशन",
    affiliateEmail: "realtimetradingsignal@gmail.com"
  }
};

// Fonction pour détecter la langue du navigateur
export const detectBrowserLanguage = (): string => {
  if (typeof window === 'undefined') return 'en';
  
  const browserLang = navigator.language || navigator.languages?.[0] || 'en';
  const langCode = browserLang.split('-')[0];
  
  // Vérifier si la langue est supportée
  const isSupported = supportedLanguages.some(lang => lang.code === langCode);
  return isSupported ? langCode : 'en';
};

// Fonction pour obtenir les traductions
export const getTranslations = (language: string) => {
  return globalTranslations[language as keyof typeof globalTranslations] || globalTranslations.en;
};