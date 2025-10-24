import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { supportedLanguages } from "../lib/translations";

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  className?: string;
  showText?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange,
  className = "w-16 h-8",
  showText = true
}) => {
  const handleLanguageChange = (value: string) => {
    onLanguageChange(value);
  };

  // Trouver la langue actuelle
  const currentLanguage = supportedLanguages.find(lang => lang.code === selectedLanguage);

  return (
    <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
      <SelectTrigger className={className}>
        <SelectValue>
          <div className="flex items-center">
            <span>{currentLanguage?.flag}</span>
            {showText && (
              <span className="ml-1 text-xs font-bold uppercase">
                {selectedLanguage.toUpperCase()}
              </span>
            )}
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {supportedLanguages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <span className="flex items-center space-x-2">
              <span>{lang.flag}</span>
              <span className="hidden sm:inline">{lang.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};