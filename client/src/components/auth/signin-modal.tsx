import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { LogIn, AlertTriangle, ExternalLink } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SignInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SignInModal({ open, onOpenChange }: SignInModalProps) {
  const { signInWithGoogle } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showSetupInstructions, setShowSetupInstructions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hostname = window.location.hostname;

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      setIsSigningIn(true);
      const userCredential = await signInWithGoogle();
      
      // Send welcome email to new users
      if (userCredential.user?.email) {
        try {
          await fetch('/api/email/test', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: userCredential.user.email })
          });
        } catch (emailError) {
          console.error("Failed to send welcome email:", emailError);
          // Don't block sign in if email fails
        }
      }
      
      onOpenChange(false); // Close modal on successful sign-in
    } catch (error: any) {
      console.error("Error during sign in:", error);
      if (error.code === "auth/unauthorized-domain") {
        setError("This domain is not authorized in your Firebase project.");
        setShowSetupInstructions(true);
      } else {
        setError(error.message || "An error occurred during sign in");
      }
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
        
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {showSetupInstructions ? (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 my-4">
            <h3 className="font-medium text-amber-900 flex items-center mb-2">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Domain Not Authorized
            </h3>
            <p className="text-sm text-amber-800 mb-3">
              You need to add this domain to your Firebase project's authorized domains list:
            </p>
            <div className="bg-amber-100 p-2 rounded font-mono text-xs mb-3">
              {hostname}
            </div>
            <ol className="text-sm text-amber-800 list-decimal list-inside space-y-2">
              <li>Go to the Firebase console</li>
              <li>Select your project: "culinarymuse-66553"</li>
              <li>Click "Authentication" in the left sidebar</li>
              <li>Go to the "Settings" tab</li>
              <li>Scroll to "Authorized domains" and click "Add domain"</li>
              <li>Add the domain shown above</li>
              <li>Click "Add"</li>
            </ol>
            <Button 
              className="w-full mt-4" 
              variant="outline"
              onClick={() => window.open("https://console.firebase.google.com/", "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Firebase Console
            </Button>
          </div>
        ) : (
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
        )}

        <DialogFooter className="sm:justify-start">
          <div className="w-full text-xs text-muted-foreground">
            Need help with authentication?
            {!showSetupInstructions && (
              <Button 
                variant="link" 
                size="sm" 
                className="px-0 ml-1 text-xs"
                onClick={() => setShowSetupInstructions(!showSetupInstructions)}
              >
                Show setup instructions
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}