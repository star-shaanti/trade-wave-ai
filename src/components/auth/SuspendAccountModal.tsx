import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, AlertCircle } from "lucide-react";

interface SuspendAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SuspendAccountModal = ({ isOpen, onClose }: SuspendAccountModalProps) => {
  const [suspendReason, setSuspendReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const suspendReasons = [
    { value: "break", label: "Taking a break from trading" },
    { value: "financial", label: "Financial reasons" },
    { value: "dissatisfied", label: "Dissatisfied with service" },
    { value: "technical", label: "Technical issues" },
    { value: "other", label: "Other reason" },
  ];

  const handleSuspendAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!suspendReason) {
      toast({
        title: "Error",
        description: "Please select a reason for suspending your account",
        variant: "destructive",
      });
      return;
    }

    if (suspendReason === "other" && !customReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a custom reason",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Here you would typically call an edge function to handle account suspension
      // For now, we'll simulate the process and provide user feedback
      
      const reason = suspendReason === "other" ? customReason : suspendReasons.find(r => r.value === suspendReason)?.label;
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Account Suspension Request Submitted",
        description: `Your request to suspend your account has been submitted. Reason: ${reason}. You will receive a confirmation email shortly.`,
      });

      // In a real implementation, you might:
      // 1. Call an edge function to log the suspension request
      // 2. Send an email to the user
      // 3. Temporarily disable certain features
      // 4. Update user status in database

      onClose();
      setSuspendReason("");
      setCustomReason("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit suspension request. Please try again or contact support.",
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
          <DialogTitle className="flex items-center gap-2 text-orange-600">
            <CreditCard className="h-5 w-5" />
            Suspend Account
          </DialogTitle>
          <DialogDescription>
            Temporarily suspend your account. You can reactivate it anytime by contacting support.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div className="text-sm text-orange-800 dark:text-orange-200">
              <p className="font-semibold mb-1">Account Suspension:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Your signals will be paused</li>
                <li>Billing will be suspended</li>
                <li>You can reactivate anytime</li>
                <li>No data will be lost</li>
              </ul>
            </div>
          </div>
        </div>

        <form onSubmit={handleSuspendAccount} className="space-y-4">
          <div>
            <Label htmlFor="suspendReason">Reason for suspension</Label>
            <Select value={suspendReason} onValueChange={setSuspendReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {suspendReasons.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {suspendReason === "other" && (
            <div>
              <Label htmlFor="customReason">Please specify</Label>
              <Textarea
                id="customReason"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Tell us more about your reason..."
                className="min-h-[80px]"
              />
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !suspendReason}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              {isLoading ? "Submitting..." : "Suspend Account"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};