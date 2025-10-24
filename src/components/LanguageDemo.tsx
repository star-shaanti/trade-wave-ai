import React from 'react';
import { LanguageSelector } from './LanguageSelector';
import { useLanguage } from '../hooks/useLanguage';
import { getTranslations } from '../lib/translations';

export const LanguageDemo: React.FC = () => {
  const { selectedLanguage, changeLanguage } = useLanguage();
  const translations = getTranslations(selectedLanguage);

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Démonstration du sélecteur de langue</h3>
      
      <div className="flex items-center space-x-4 mb-4">
        <span className="text-sm text-gray-600">Langue actuelle:</span>
        <LanguageSelector
          selectedLanguage={selectedLanguage}
          onLanguageChange={changeLanguage}
          className="w-20 h-10"
          showText={true}
        />
      </div>

      <div className="space-y-2">
        <p><strong>Titre:</strong> {translations.title}</p>
        <p><strong>Description:</strong> {translations.description}</p>
        <p><strong>Email:</strong> {translations.email}</p>
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
        <p className="text-sm text-blue-600 dark:text-blue-400">
          <strong>Note:</strong> Le sélecteur affiche maintenant seulement 2 lettres grandes (ex: "FR") 
          et cache les petites lettres. Le changement de langue est sauvegardé automatiquement 
          et fonctionne dans tous les onglets.
        </p>
      </div>
    </div>
  );
};
