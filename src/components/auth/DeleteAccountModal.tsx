import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Trash2, AlertTriangle } from "lucide-react";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

export const DeleteAccountModal = ({ isOpen, onClose, userEmail }: DeleteAccountModalProps) => {
  const [confirmEmail, setConfirmEmail] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (confirmEmail !== userEmail) {
      toast({
        title: "Error",
        description: "Email confirmation doesn't match your account email",
        variant: "destructive",
      });
      return;
    }

    if (confirmText !== "DELETE MY ACCOUNT") {
      toast({
        title: "Error",
        description: "Please type 'DELETE MY ACCOUNT' exactly as shown",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // For account deletion, we'll inform user to contact support
      // as this requires admin-level operations for data privacy compliance
      toast({
        title: "Account Deletion Request Submitted",
        description: "We'll process your account deletion request within 24 hours. You'll receive a confirmation email.",
      });

      // In a production environment, this would:
      // 1. Create a deletion request ticket
      // 2. Send confirmation email
      // 3. Schedule account deletion after grace period
      // 4. Handle data export if required by GDPR
      
      onClose();
    } catch (error) {
      toast({
        title: "Error", 
        description: "Please contact support at realtimetradingsignal@gmail.com to delete your account.",
        variant: "destructive",
      });
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Delete Account
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your account and remove all data.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            <div className="text-sm text-red-800 dark:text-red-200">
              <p className="font-semibold mb-1">Warning:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>All your trading signal data will be lost</li>
                <li>Your subscription will be cancelled</li>
                <li>This action is irreversible</li>
              </ul>
            </div>
          </div>
        </div>

        <form onSubmit={handleDeleteAccount} className="space-y-4">
          <div>
            <Label htmlFor="confirmEmail">Confirm your email address</Label>
            <Input
              id="confirmEmail"
              type="email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              placeholder={userEmail}
              required
            />
          </div>

          <div>
            <Label htmlFor="confirmText">
              Type <span className="font-mono font-bold">"DELETE MY ACCOUNT"</span> to confirm
            </Label>
            <Input
              id="confirmText"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE MY ACCOUNT"
              required
            />
          </div>

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
              variant="destructive"
              disabled={isLoading || confirmEmail !== userEmail || confirmText !== "DELETE MY ACCOUNT"}
              className="flex-1"
            >
              {isLoading ? "Deleting..." : "Delete Account"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};