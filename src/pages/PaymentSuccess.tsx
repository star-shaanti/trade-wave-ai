import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { checkSubscription } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Check subscription status after payment
    const verifyPayment = async () => {
      try {
        await checkSubscription();
        toast({
          title: "Welcome to Premium!",
          description: "Your subscription is now active. Enjoy premium trading signals!",
        });
      } catch (error) {
        console.error("Error verifying subscription:", error);
      }
    };

    verifyPayment();
  }, [checkSubscription, toast]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-muted-foreground mb-6">
            Thank you for your purchase. You now have access to premium trading signals.
          </p>
          
          <div className="space-y-3">
            <Button
              onClick={() => navigate("/")}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Trading Signals
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;