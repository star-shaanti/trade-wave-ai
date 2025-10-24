import { useState, useEffect } from 'react';
import { detectBrowserLanguage } from '../lib/translations';

export const useLanguage = () => {
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    // Charger la langue sauvegardée ou détecter celle du navigateur
    const savedLanguage = localStorage.getItem('selectedLanguage');
    return savedLanguage || detectBrowserLanguage();
  });

  const changeLanguage = (language: string) => {
    setSelectedLanguage(language);
    localStorage.setItem('selectedLanguage', language);
  };

  // Écouter les changements de localStorage depuis d'autres onglets
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'selectedLanguage' && e.newValue) {
        setSelectedLanguage(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    selectedLanguage,
    changeLanguage,
    setSelectedLanguage
  };
};
