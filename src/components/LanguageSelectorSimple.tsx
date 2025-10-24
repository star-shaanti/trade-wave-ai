import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { supportedLanguages } from "../lib/translations";

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  className?: string;
}

export const LanguageSelectorSimple: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange,
  className = "w-16 h-8"
}) => {
  return (
    <Select value={selectedLanguage} onValueChange={onLanguageChange}>
      <SelectTrigger className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {supportedLanguages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <span className="flex items-center space-x-2">
              <span>{lang.flag}</span>
              <span className="text-xs font-bold uppercase">{lang.code.toUpperCase()}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
