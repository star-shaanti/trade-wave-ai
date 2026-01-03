import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { useLanguage } from "../hooks/useLanguage";
import { getTranslations } from "../lib/translations";
import { useToast } from "../hooks/use-toast";

interface CookieSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CookieSettingsModal: React.FC<CookieSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { selectedLanguage } = useLanguage();
  const t = getTranslations(selectedLanguage);
  const { toast } = useToast();
  
  const [necessaryCookies, setNecessaryCookies] = useState(true);
  const [analyticsCookies, setAnalyticsCookies] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Charger les préférences actuelles
      const necessary = localStorage.getItem("necessaryCookies") === "true";
      const analytics = localStorage.getItem("analyticsCookies") === "true";
      
      setNecessaryCookies(necessary);
      setAnalyticsCookies(analytics);
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem("cookieConsent", "custom");
    localStorage.setItem("necessaryCookies", "true"); // Toujours activés
    localStorage.setItem("analyticsCookies", analyticsCookies ? "true" : "false");
    
    toast({
      title: t.cookieSavePreferences,
      description: "Your cookie preferences have been saved.",
    });
    
    onClose();
  };

  const handleAcceptAll = () => {
    localStorage.setItem("cookieConsent", "accepted");
    localStorage.setItem("necessaryCookies", "true");
    localStorage.setItem("analyticsCookies", "true");
    setAnalyticsCookies(true);
    
    toast({
      title: t.cookieAcceptAll,
      description: "All cookies have been enabled.",
    });
    
    onClose();
  };

  const handleRejectAll = () => {
    localStorage.setItem("cookieConsent", "rejected");
    localStorage.setItem("necessaryCookies", "true"); // Toujours activés
    localStorage.setItem("analyticsCookies", "false");
    setAnalyticsCookies(false);
    
    toast({
      title: t.cookieRejectAll,
      description: "Only necessary cookies are enabled.",
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t.cookieSettingsTitle}</DialogTitle>
          <DialogDescription>
            {t.cookieSettingsDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Cookies nécessaires */}
          <div className="flex items-start justify-between space-x-4 p-4 border rounded-lg">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="necessary" className="font-semibold cursor-pointer">
                  {t.cookieNecessary}
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                {t.cookieNecessaryDescription}
              </p>
            </div>
            <Switch
              id="necessary"
              checked={necessaryCookies}
              disabled={true}
              onCheckedChange={() => {}}
            />
          </div>

          {/* Cookies analytiques */}
          <div className="flex items-start justify-between space-x-4 p-4 border rounded-lg">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="analytics" className="font-semibold cursor-pointer">
                  {t.cookieAnalytics}
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                {t.cookieAnalyticsDescription}
              </p>
            </div>
            <Switch
              id="analytics"
              checked={analyticsCookies}
              onCheckedChange={setAnalyticsCookies}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleRejectAll}
            className="flex-1"
          >
            {t.cookieRejectAll}
          </Button>
          <Button
            variant="outline"
            onClick={handleSave}
            className="flex-1"
          >
            {t.cookieSavePreferences}
          </Button>
          <Button
            onClick={handleAcceptAll}
            className="flex-1"
          >
            {t.cookieAcceptAll}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};