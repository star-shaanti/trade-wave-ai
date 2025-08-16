import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Settings, ExternalLink, CreditCard } from "lucide-react";

interface ManageSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManageSubscriptionModal = ({ isOpen, onClose }: ManageSubscriptionModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleManageSubscription = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to access subscription management",
          variant: "destructive",
        });
        return;
      }

      if (data?.url) {
        // Open Stripe customer portal in new tab
        window.open(data.url, '_blank');
        onClose();
      } else {
        toast({
          title: "No Subscription Found",
          description: "You don't have an active subscription to manage",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSubscription = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create checkout session",
          variant: "destructive",
        });
        return;
      }

      if (data?.url) {
        // Open Stripe checkout in new tab
        window.open(data.url, '_blank');
        onClose();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Manage Subscription
          </DialogTitle>
          <DialogDescription>
            Manage your subscription, billing, and payment methods through Stripe's secure portal.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Choose an option below to manage your subscription:
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleManageSubscription}
              disabled={isLoading}
              className="w-full justify-start"
              variant="outline"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Manage Existing Subscription
              <ExternalLink className="h-4 w-4 ml-auto" />
            </Button>

            <Button
              onClick={handleCreateSubscription}
              disabled={isLoading}
              className="w-full justify-start"
            >
              <Settings className="h-4 w-4 mr-2" />
              Subscribe to Premium
              <ExternalLink className="h-4 w-4 ml-auto" />
            </Button>
          </div>

          <div className="text-xs text-muted-foreground mt-4">
            You will be redirected to Stripe's secure portal where you can safely manage your subscription, 
            update payment methods, view invoices, and more.
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full"
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};