import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { X, AlertTriangle, ExternalLink } from "lucide-react";

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CancelSubscriptionModal = ({ isOpen, onClose }: CancelSubscriptionModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCancelSubscription = async () => {
    setIsLoading(true);
    
    try {
      // Show confirmation message
      toast({
        title: "Redirecting to Stripe",
        description: "You will be redirected to Stripe to cancel your subscription safely.",
      });

      // Small delay for user to see the message
      setTimeout(() => {
        // Open Stripe cancellation link
        window.open('https://billing.stripe.com/p/login/5kQ5kD5DMeKH8zC7xXdfG00', '_blank');
        onClose();
        setIsLoading(false);
      }, 1000);

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to redirect to cancellation portal. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <X className="h-5 w-5" />
            Cancel Subscription
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel your subscription? This action will stop your recurring billing.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div className="text-sm text-orange-800 dark:text-orange-200">
              <p className="font-semibold mb-1">Before you cancel:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>You'll lose access to premium trading signals</li>
                <li>Your subscription will end at the current billing period</li>
                <li>You can resubscribe anytime</li>
                <li>No refunds for the current billing period</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-sm text-muted-foreground mb-4">
          You will be redirected to Stripe's secure portal to safely cancel your subscription.
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={isLoading}
          >
            Keep Subscription
          </Button>
          <Button
            onClick={handleCancelSubscription}
            disabled={isLoading}
            variant="destructive"
            className="flex-1"
          >
            {isLoading ? "Redirecting..." : (
              <>
                Cancel Subscription
                <ExternalLink className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};