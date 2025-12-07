import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import TermsConditions from "./pages/TermsConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import PricingPlans from "./pages/PricingPlans";
import PaymentSuccess from "./pages/PaymentSuccess";
import NotFound from "./pages/NotFound";
import FAQ from "./pages/FAQ";
import TradingRisks from "./pages/TradingRisks";
import LegalNotice from "./pages/LegalNotice";

const queryClient = new QueryClient();

const App = () => {
  console.log("App component is rendering");
  
  // Détecter et stocker le paramètre d'affiliation 'ref' dès le chargement
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const affiliateRef = urlParams.get('ref');
    
    if (affiliateRef) {
      // Stocker dans localStorage pour le préserver lors de la navigation
      localStorage.setItem('affiliate_ref', affiliateRef);
      console.log('[AFFILIATION] ✅ Paramètre ref détecté dans l\'URL et stocké:', affiliateRef);
      console.log('[AFFILIATION] 💾 Ref sauvegardé dans localStorage pour la session');
      
      // Nettoyer l'URL en retirant le paramètre ref pour une navigation propre
      // (optionnel, mais garde l'URL propre)
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('ref');
      window.history.replaceState({}, '', newUrl.toString());
    } else {
      // Si pas de ref dans l'URL, vérifier s'il existe déjà dans localStorage
      const storedRef = localStorage.getItem('affiliate_ref');
      if (storedRef) {
        console.log('[AFFILIATION] 📌 Ref existant trouvé dans localStorage:', storedRef);
        console.log('[AFFILIATION] ✅ Ce ref sera utilisé pour le suivi d\'affiliation');
      } else {
        console.log('[AFFILIATION] ℹ️ Aucun ref d\'affiliation trouvé (ni dans l\'URL ni dans localStorage)');
      }
    }
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/pricing" element={<PricingPlans />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/terms-conditions" element={<TermsConditions />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/trading-risks" element={<TradingRisks />} />
            <Route path="/legal-notice" element={<LegalNotice />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
