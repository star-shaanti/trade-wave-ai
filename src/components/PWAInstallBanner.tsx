import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor, Chrome, Safari, Share2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Détecter si l'app est déjà installée (standalone mode)
    const checkStandalone = () => {
      // @ts-ignore - window.navigator.standalone est spécifique à iOS
      if (window.navigator.standalone === true) {
        return true;
      }
      
      // Pour Android et autres navigateurs, vérifier le display-mode
      if (window.matchMedia('(display-mode: standalone)').matches) {
        return true;
      }
      
      // Vérifier si l'app est lancée depuis l'écran d'accueil (fullscreen)
      if (window.matchMedia('(display-mode: fullscreen)').matches) {
        return true;
      }

      // Vérifier si on est dans une webview (app installée)
      // @ts-ignore
      if (window.navigator.standalone !== undefined) {
        // @ts-ignore
        return window.navigator.standalone === true;
      }
      
      return false;
    };

    // Détecter iOS
    const checkIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
      const isSafari = /safari/.test(userAgent) && !/chrome|chromium|fxios/.test(userAgent);
      return isIOSDevice && isSafari;
    };

    // Vérifier si la bannière a été rejetée (dans localStorage)
    const checkDismissed = () => {
      const dismissedTime = localStorage.getItem('pwa-banner-dismissed');
      if (dismissedTime) {
        const dismissedDate = new Date(parseInt(dismissedTime));
        const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
        // Réafficher après 7 jours
        if (daysSinceDismissed < 7) {
          return true; // Bannière rejetée récemment
        } else {
          // Réafficher après 7 jours, supprimer le flag
          localStorage.removeItem('pwa-banner-dismissed');
        }
      }
      return false; // Bannière pas rejetée ou rejetée il y a plus de 7 jours
    };

    // Vérifications initiales
    const standalone = checkStandalone();
    const ios = checkIOS();
    const isDismissed = checkDismissed();
    
    setIsStandalone(standalone);
    setIsIOS(ios);
    setDismissed(isDismissed);

    // Si déjà installé ou rejeté, ne pas afficher
    if (standalone || isDismissed) {
      return;
    }

    // Écouter l'événement beforeinstallprompt (Chrome, Edge, etc.)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Afficher la bannière après 3 secondes
      setTimeout(() => {
        setShowBanner(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Pour iOS et autres navigateurs sans beforeinstallprompt
    if (ios) {
      // Si iOS et pas déjà installé, afficher les instructions
      setTimeout(() => {
        if (!standalone && !isDismissed) {
          setShowBanner(true);
        }
      }, 3000);
    } else {
      // Pour les autres navigateurs (Firefox, Safari desktop, etc.)
      // Vérifier si le navigateur supporte PWA
      const supportsPWA = 'serviceWorker' in navigator;
      if (supportsPWA) {
        setTimeout(() => {
          if (!standalone && !isDismissed) {
            setShowBanner(true);
          }
        }, 3000);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Cacher immédiatement notre bannière
      setShowBanner(false);
      
      // Déclencher directement le prompt natif du navigateur
      // (La confirmation du navigateur est obligatoire pour la sécurité)
      deferredPrompt.prompt();
      
      // Attendre la réponse de l'utilisateur
      const { outcome } = await deferredPrompt.userChoice;
      
      // Nettoyer après la réponse
      setDeferredPrompt(null);
      
      // Si installé, la bannière ne s'affichera plus (détection standalone)
      if (outcome === 'accepted') {
        // L'app sera installée, le mode standalone sera détecté automatiquement
        setIsStandalone(true);
      } else {
        // Si l'utilisateur a annulé, considérer comme rejeté pour éviter de harceler
        setDismissed(true);
        localStorage.setItem('pwa-banner-dismissed', Date.now().toString());
      }
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setDismissed(true);
    localStorage.setItem('pwa-banner-dismissed', Date.now().toString());
  };

  // Ne pas afficher si déjà installé ou rejeté
  if (isStandalone || !showBanner || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-r from-[#0a0e1a] to-[#13182b] border-t border-[#00d4aa]/30 shadow-2xl">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-card/90 backdrop-blur-sm border border-[#00d4aa]/20">
          <div className="flex items-center gap-4 flex-1">
            {isIOS ? (
              <>
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#00d4aa] to-[#0095ff] flex items-center justify-center">
                  <Share2 className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white text-sm sm:text-base mb-1">
                    Installer l'application
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Appuyez sur <Share2 className="inline h-3 w-3" /> puis "Sur l'écran d'accueil"
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#00d4aa] to-[#0095ff] flex items-center justify-center">
                  <Download className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white text-sm sm:text-base mb-1">
                    Installer l'application
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Accédez aux signaux de trading même hors ligne
                  </p>
                </div>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {!isIOS && deferredPrompt && (
              <button
                onClick={handleInstall}
                className="px-4 py-2 bg-gradient-to-r from-[#0095ff] to-[#00d4aa] text-white rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Installer</span>
              </button>
            )}
            <button
              onClick={handleDismiss}
              className="p-2 text-muted-foreground hover:text-white transition-colors rounded-lg hover:bg-white/10"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
