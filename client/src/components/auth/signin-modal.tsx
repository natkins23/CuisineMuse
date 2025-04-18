import { useState } from "react";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchSignInMethodsForEmail, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { LogIn, AlertTriangle, ExternalLink } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect } from "react";

function CheckEmailExists({ email, onGoogleSignIn }: { email: string; onGoogleSignIn?: () => void }) {
  const [authMethods, setAuthMethods] = useState<string[]>([]);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const checkEmail = async () => {
      console.log("Checking email:", email);
      try {
        const methods = await fetchSignInMethodsForEmail(auth, email);
        console.log("Auth methods found:", methods);
        setAuthMethods(methods);
        setError(false);
      } catch (e) {
        console.error("Error checking email:", e);
        setError(true);
      }
    };
    checkEmail();
  }, [email]);

  if (error) return <>Authentication error. Please try again.</>;

  if (authMethods.includes('google.com')) {
    return (
      <div className="space-y-2">
        <div className="text-destructive">This account uses Google authentication.</div>
        <Button 
          variant="outline"
          className="w-full"
          onClick={onGoogleSignIn}
        >
          <SiGoogle className="h-5 w-5 mr-2 text-red-500" />
          Continue with Google
        </Button>
      </div>
    );
  }

  return authMethods.length > 0 ? (
    <>
      Your password is incorrect. Try again.
      <br />
      <Button 
        variant="link" 
        className="px-0 w-fit h-auto text-sm text-blue-500 hover:text-blue-600"
        onClick={() => alert("Password reset functionality coming soon!")}
      >
        Reset your password
      </Button>
    </>
  ) : (
    <>No account found with this email. Please sign up.</>
  );
}

interface SignInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const authSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(1, "Password is required")
    .min(7, "Password must be at least 7 characters")
});

type AuthFormData = z.infer<typeof authSchema>;

export default function SignInModal({ open, onOpenChange }: SignInModalProps) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showSetupInstructions, setShowSetupInstructions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      setIsSigningIn(true);
      const userCredential = await signInWithGoogle();

      if (userCredential?.user?.email && userCredential.user.metadata.creationTime === userCredential.user.metadata.lastSignInTime) {
        try {
          const displayName = userCredential.user.displayName || 'there';
          await fetch('/api/email/test', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              email: userCredential.user.email,
              name: displayName
            })
          });
        } catch (emailError) {
          console.error("Failed to send welcome email:", emailError);
        }
      }

      onOpenChange(false);
      window.location.href = '/my-recipes'; // Redirect after successful Google sign-in
    } catch (error: any) {
      console.error("Error during sign in:", error);
      if (error.code === "auth/unauthorized-domain") {
        setError("This domain is not authorized in your Firebase project.");
        setShowSetupInstructions(true);
      } else {
        // Map Firebase error codes to user-friendly messages
        let errorMessage = 'An error occurred. Please try again.';

        // Use explicit conditional checks instead of object lookup to avoid TypeScript issues
        if (error.code === 'auth/invalid-credential') {
          errorMessage = 'These credentials do not exist. Please try again or sign up.';
        } else if (error.code === 'auth/user-disabled') {
          errorMessage = 'This account has been disabled.';
        } else if (error.code === 'auth/user-not-found') {
          errorMessage = 'These credentials do not exist. Please try again or sign up.';
        } else if (error.code === 'auth/wrong-password') {
          errorMessage = 'These credentials do not exist. Please try again or sign up.';
        } else if (error.code === 'auth/too-many-requests') {
          errorMessage = 'Too many attempts. Please try again later.';
        } else if (error.code === 'auth/popup-closed-by-user') {
          errorMessage = 'Sign in was cancelled.';
        } else if (error.code === 'auth/unauthorized-domain') {
          errorMessage = 'This domain is not authorized for sign in.';
        }

        setError(errorMessage);
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleEmailSignIn = async (isSignUp: boolean = false) => {
    try {
      setError(null);
      const isValid = await form.trigger();
      if (!isValid) return;

      const { email: rawEmail, password } = form.getValues();
      const email = rawEmail.trim().toLowerCase();

      if (isSignUp) {
        const methods = await fetchSignInMethodsForEmail(auth, email);

        if (methods.length > 0) {
          if (methods.includes("google.com")) {
            setError("This email is already used with Google Sign-In. Please use that option.");
          } else {
            setError("An account already exists with this email. Please sign in instead.");
          }
          return;
        }
      }

      setIsSigningIn(true);
      const authFunction = isSignUp ? signUpWithEmail : signInWithEmail;
      await authFunction(email, password);

      onOpenChange(false);
      window.location.href = '/my-recipes'; // Redirect after successful email sign-in

      if (isSignUp && userCredential?.user?.email) {
        await fetch('/api/email/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userCredential.user.email,
            name: userCredential.user.email.split('@')[0],
          }),
        });
      }
    } catch (error: any) {
      console.error("Email auth error:", error.code, error.message);
      if (error.code === 'auth/wrong-password') {
        setError("Incorrect password. Please try again.");
      } else if (error.code === 'auth/user-not-found') {
        setError("No account found with this email. Please sign up first.");
      } else if (error.code === 'auth/invalid-credential') {
        setError("Invalid login credentials. Please check your email and password.");
      } else if (error.code === 'auth/too-many-requests') {
        setError("Too many attempts. Please try again later.");
      } else if (error.code === 'auth/invalid-email') {
        setError("Invalid email format. Please enter a valid email address.");
      } else if (error.code === 'auth/weak-password' && isSignUp) {
        setError("Password is too weak. Please use at least 6 characters.");
      } else if (error.code === 'auth/email-already-in-use' && isSignUp) {
        setError("Email is already in use. Please sign in instead.");
      } else {
        setError(error.message || "An unexpected error occurred.");
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
            Continue to save recipes and personalize your experience.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription className="flex flex-col gap-2">
              {error === "Firebase: Error (auth/invalid-credential)." ? (
                <CheckEmailExists 
                  email={form.getValues().email} 
                  onGoogleSignIn={handleGoogleSignIn}
                />
              ) : (
                error
              )}
            </AlertDescription>
          </Alert>
        )}

        {showSetupInstructions ? (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 my-4">
            <h3 className="font-medium text-amber-900 flex items-center mb-2">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Domain Not Authorized
            </h3>
            <p className="text-sm text-amber-800 mb-3">
              Add this domain to your Firebase project's authorized domains:
            </p>
            <div className="bg-amber-100 p-2 rounded font-mono text-xs mb-3">
              {window.location.hostname}
            </div>
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
          <div className="space-y-4">
            <Form {...form}>
              <form className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
            <div className="flex gap-2">
              <Button 
                className="flex-1"
                onClick={() => handleEmailSignIn(false)}
                disabled={isSigningIn}
              >
                Sign In
              </Button>
              <Button 
                className="flex-1"
                variant="outline"
                onClick={() => handleEmailSignIn(true)}
                disabled={isSigningIn}
              >
                Sign Up
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
            >
              <SiGoogle className="h-5 w-5 mr-2 text-red-500" />
              <span>{isSigningIn ? "Signing in..." : "Google"}</span>
            </Button>
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