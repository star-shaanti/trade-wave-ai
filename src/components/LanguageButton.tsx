import React, { useState } from "react";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { supportedLanguages } from "../lib/translations";
import { ChevronDown } from "lucide-react";

interface LanguageButtonProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  className?: string;
}

export const LanguageButton: React.FC<LanguageButtonProps> = ({
  selectedLanguage,
  onLanguageChange,
  className = "w-16 h-8"
}) => {
  const [open, setOpen] = useState(false);
  
  // Trouver la langue actuelle
  const currentLanguage = supportedLanguages.find(lang => lang.code === selectedLanguage);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={`${className} flex items-center justify-between`}>
          <div className="flex items-center space-x-1">
            <span>{currentLanguage?.flag}</span>
            <span className="text-xs font-bold uppercase">
              {selectedLanguage.toUpperCase()}
            </span>
          </div>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {supportedLanguages.map((lang) => (
          <DropdownMenuItem 
            key={lang.code} 
            onClick={() => {
              onLanguageChange(lang.code);
              setOpen(false);
            }}
            className="flex items-center space-x-2"
          >
            <span>{lang.flag}</span>
            <span className="text-xs font-bold uppercase">{lang.code.toUpperCase()}</span>
            <span className="hidden sm:inline ml-2">{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
