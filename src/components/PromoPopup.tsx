import React, { useState, useEffect } from "react";
import { X, CheckCircle, Zap, Shield, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";

interface PromoPopupProps {
  translations: Record<string, string>;
  onGetStarted: () => void;
}

export const PromoPopup: React.FC<PromoPopupProps> = ({ translations, onGetStarted }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem("promoPopupShown");
    if (alreadyShown) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
      sessionStorage.setItem("promoPopupShown", "true");
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => setIsVisible(false), 300);
  };

  const handleCta = () => {
    handleClose();
    onGetStarted();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className={`relative w-full max-w-lg bg-background border border-border rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
          isClosing ? "opacity-0 scale-95" : "opacity-100 scale-100 animate-in fade-in zoom-in-95"
        }`}
      >
        {/* Gradient top bar */}
        <div className="h-1.5 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600" />

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted transition-colors z-10"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>

        <div className="p-6 md:p-8">
          {/* Warning icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <Shield className="h-8 w-8 text-red-500" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-2">
            {translations.popupTitle || "Don't Trade Blind!"}
          </h2>

          {/* Subtitle */}
          <p className="text-center text-red-500 font-semibold mb-4">
            {translations.popupSubtitle || "93% of traders lose money using unverified signals."}
          </p>

          {/* Highlight */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-5">
            <p className="text-sm md:text-base text-center font-medium text-foreground">
              {translations.popupHighlight || "Market Signals24 is the ONLY platform that triple-validates every signal before sending it to you."}
            </p>
          </div>

          {/* Bullet points */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start space-x-3">
              <Zap className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-muted-foreground">
                {translations.popupBullet1 || "AI analyzes 10,000+ data points per second"}
              </span>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-muted-foreground">
                {translations.popupBullet2 || "Expert traders confirm every signal manually"}
              </span>
            </div>
            <div className="flex items-start space-x-3">
              <TrendingUp className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-muted-foreground">
                {translations.popupBullet3 || "Market conditions verified in real-time"}
              </span>
            </div>
          </div>

          {/* CTA Button */}
          <Button
            onClick={handleCta}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 text-base rounded-xl shadow-lg"
            size="lg"
          >
            {translations.popupCta || "Get Verified Signals Now"}
          </Button>

          {/* Dismiss text */}
          <button
            onClick={handleClose}
            className="w-full mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors text-center underline-offset-2 hover:underline"
          >
            {translations.popupDismiss || "I'll risk trading without verification"}
          </button>
        </div>
      </div>
    </div>
  );
};
