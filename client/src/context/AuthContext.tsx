import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  User, 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithRedirect, 
  getRedirectResult,
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
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

  // Sign in with Google popup (for modal dialog)
  async function signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      
      // Use popup for modal dialog
      await signInWithPopup(auth, provider);
      
      // Alternatively, you can use redirect for a full page redirect approach
      // await signInWithRedirect(auth, provider);
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      toast({
        variant: "destructive",
        title: "Authentication failed",
        description: error?.message || "Failed to sign in with Google",
      });
      throw error; // Re-throw to handle in the component
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

  const value = {
    currentUser,
    loading,
    signInWithGoogle,
    logOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}