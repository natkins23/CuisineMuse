import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { LogIn } from "lucide-react";
import { SiGoogle } from "react-icons/si";

interface SignInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SignInModal({ open, onOpenChange }: SignInModalProps) {
  const { signInWithGoogle } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signInWithGoogle();
      onOpenChange(false); // Close modal on successful sign-in
    } catch (error) {
      console.error("Error during sign in:", error);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">Sign In</DialogTitle>
          <DialogDescription className="text-center">
            Continue with your Google account to save recipes and personalize your experience.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-4 py-4">
          <Button 
            variant="outline" 
            className="flex items-center justify-center w-full p-6"
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
          >
            <SiGoogle className="h-5 w-5 mr-2 text-red-500" />
            <span>{isSigningIn ? "Signing in..." : "Continue with Google"}</span>
          </Button>
          
          <div className="text-center text-sm text-muted-foreground mt-4">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}