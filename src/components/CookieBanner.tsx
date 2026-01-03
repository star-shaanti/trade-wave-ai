import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { CookieSettingsModal } from "./CookieSettingsModal";
import { useLanguage } from "../hooks/useLanguage";
import { getTranslations } from "../lib/translations";
import { X, Settings } from "lucide-react";

export const CookieBanner: React.FC = () => {
  const { selectedLanguage } = useLanguage();
  const t = getTranslations(selectedLanguage);
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Vérifier si le consentement a déjà été donné
    const cookieConsent = localStorage.getItem("cookieConsent");
    if (!cookieConsent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("cookieConsent", "accepted");
    localStorage.setItem("necessaryCookies", "true");
    localStorage.setItem("analyticsCookies", "true");
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    localStorage.setItem("cookieConsent", "rejected");
    localStorage.setItem("necessaryCookies", "true"); // Toujours activés
    localStorage.setItem("analyticsCookies", "false");
    setShowBanner(false);
  };

  const handleSettings = () => {
    setShowSettings(true);
  };

  const handleSettingsClose = () => {
    setShowSettings(false);
    // Vérifier si le consentement a été donné dans les paramètres
    const cookieConsent = localStorage.getItem("cookieConsent");
    if (cookieConsent) {
      setShowBanner(false);
    }
  };

  if (!showBanner) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-semibold mb-1">{t.cookieBannerTitle}</h3>
              <p className="text-sm text-muted-foreground">
                {t.cookieBannerDescription}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSettings}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                {t.cookieSettings}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRejectAll}
              >
                {t.cookieRejectAll}
              </Button>
              <Button
                size="sm"
                onClick={handleAcceptAll}
              >
                {t.cookieAcceptAll}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <CookieSettingsModal
        isOpen={showSettings}
        onClose={handleSettingsClose}
      />
    </>
  );
};