import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  User, 
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword, 
  signInWithPopup,
  signInWithRedirect, 
  getRedirectResult,
  signOut, 
  onAuthStateChanged,
  fetchSignInMethodsForEmail,
  UserCredential
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<any>;
  signInWithEmail: (email: string, password: string) => Promise<UserCredential>;
  signUpWithEmail: (email: string, password: string) => Promise<UserCredential>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Check for redirect result on initial load
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          // User successfully signed in with redirect
          setCurrentUser(result.user);
          toast({
            title: "Sign in successful",
            description: `Welcome, ${result.user.displayName || 'User'}!`,
          });
        }
      } catch (error: any) {
        console.error("Error processing redirect:", error);
        toast({
          variant: "destructive",
          title: "Authentication failed",
          description: error?.message || "Failed to sign in with Google",
        });
      } finally {
        setLoading(false);
      }
    };

    handleRedirectResult();
  }, [toast]);

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Sign in with Google - improved version
  async function signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.setCustomParameters({ prompt: 'select_account' });

      const result = await signInWithPopup(auth, provider);

      const linkedProviders = result.user.providerData.map(p => p.providerId);
      if (!linkedProviders.includes("google.com")) {
        throw new Error("Google provider not linked properly.");
      }

      // Check if this is a new user by comparing creation time with last sign-in time
      if (result.user.email && 
          result.user.metadata.creationTime === result.user.metadata.lastSignInTime) {
        await fetch('/api/email/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: result.user.email,
            name: result.user.displayName || 'there',
          }),
        });
      }

      return result;
    } catch (error: any) {
      console.error("Google Sign-In failed:", error);
      
      // If popup fails, try redirect as fallback
      if (error.code === 'auth/popup-blocked' || 
          error.code === 'auth/popup-closed-by-user' ||
          error.message?.includes('iframe')) {
        try {
          const provider = new GoogleAuthProvider();
          provider.addScope('email');
          provider.setCustomParameters({ prompt: 'select_account' });
          await signInWithRedirect(auth, provider);
          return null; // The redirect will reload the page
        } catch (redirectError) {
          console.error("Redirect sign-in also failed:", redirectError);
          throw new Error("Failed to sign in with Google.");
        }
      }
      
      toast({
        variant: "destructive",
        title: "Authentication failed",
        description: error?.message || "Failed to sign in with Google",
      });
      throw new Error("Failed to sign in with Google.");
    }
  }

  async function logOut() {
    try {
      await signOut(auth);
      toast({
        title: "Signed out",
        description: "You have been successfully signed out",
      });
    } catch (error: any) {
      console.error("Error signing out:", error);
      toast({
        variant: "destructive",
        title: "Sign out failed",
        description: error?.message || "Failed to sign out",
      });
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signUpWithEmail = async (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const value = {
    currentUser,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}