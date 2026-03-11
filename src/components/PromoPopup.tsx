import React, { useState, useEffect } from "react";
import { X, CheckCircle, Zap, TrendingUp, Award, ExternalLink } from "lucide-react";

interface PromoPopupProps {
  translations: Record<string, string>;
  onGetStarted: () => void;
}

const MS24_URL = "https://marketsignals24.com/";
const STORAGE_KEY = "ms24_promo_shown";

export const PromoPopup: React.FC<PromoPopupProps> = ({ translations }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // localStorage: popup shown only ONCE ever (not once per session)
    if (localStorage.getItem(STORAGE_KEY)) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
      localStorage.setItem(STORAGE_KEY, "true");
    }, 20000); // 20 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => setIsVisible(false), 300);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className={`relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
          isClosing ? "opacity-0 scale-95" : "opacity-100 scale-100 animate-in fade-in zoom-in-95"
        }`}
      >
        {/* Gradient top bar */}
        <div className="h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"
          aria-label="Close"
        >
          <X className="h-4 w-4 text-slate-500" />
        </button>

        <div className="p-6 md:p-8">
          {/* Badge */}
          <div className="flex justify-center mb-4">
            <span className="inline-flex items-center gap-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
              <Award className="h-3.5 w-3.5" />
              {translations.popupBadge || "#1 Most Used Platform — 2026"}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-xl md:text-2xl font-extrabold text-center text-slate-900 dark:text-white mb-2 leading-tight">
            {translations.popupTitle || "Discover Our New Platform"}
          </h2>

          {/* Domain */}
          <p className="text-center text-blue-600 dark:text-blue-400 font-bold text-base mb-3 tracking-tight">
            marketsignals24.com
          </p>

          {/* Description */}
          <p className="text-center text-slate-600 dark:text-slate-300 text-sm mb-5 leading-relaxed">
            {translations.popupHighlight ||
              "Ranked among the most-used trading signal platforms of 2026. Institutional-grade AI precision, validated by professional analysts — built for traders who demand results."}
          </p>

          {/* Bullet points */}
          <div className="space-y-2.5 mb-6">
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
              <Zap className="h-4 w-4 text-yellow-500 flex-shrink-0" />
              <span className="text-xs text-slate-700 dark:text-slate-300">
                {translations.popupBullet1 || "Ultra-precise signals powered by real-time AI analysis"}
              </span>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span className="text-xs text-slate-700 dark:text-slate-300">
                {translations.popupBullet2 || "Every signal manually reviewed by certified expert traders"}
              </span>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
              <TrendingUp className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <span className="text-xs text-slate-700 dark:text-slate-300">
                {translations.popupBullet3 || "Trusted by thousands of active traders worldwide in 2026"}
              </span>
            </div>
          </div>

          {/* CTA Button */}
          <a
            href={MS24_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 text-sm rounded-xl shadow-lg transition-all"
          >
            {translations.popupCta || "Visit Market Signals 24"}
            <ExternalLink className="h-4 w-4" />
          </a>

          {/* Dismiss */}
          <button
            onClick={handleClose}
            className="w-full mt-3 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors text-center"
          >
            {translations.popupDismiss || "Continue on this platform"}
          </button>
        </div>
      </div>
    </div>
  );
};
