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
  fetchSignInMethodsForEmail
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<any>;
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

  // Sign in with Google
  async function signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();

      // Add scopes if needed
      provider.addScope('email');
      provider.addScope('profile');

      console.log("Initializing Google Sign-In with:", {
        providerId: provider.providerId,
        customParameters: provider.customParameters,
        scopes: provider.scopes,
        projectId: auth.app.options.projectId
      });

      // Handle unauthorized domain error
      // This is a temporary solution to show user what they need to do
      // Ideally, the domain should be added to authorized domains in Firebase Console
      const currentDomain = window.location.origin;

      // Set custom parameters
      provider.setCustomParameters({
        prompt: 'select_account',
        // The 'login_hint' parameter can help prevent the "illegal URL for new iframe" error
        login_hint: 'user@example.com'
      });

      // Try popup first (for modal dialog)
      try {
        const result = await signInWithPopup(auth, provider);
        
        // Verify user was properly saved
        const email = result.user.email;
        if (email) {
          // Check if methods are properly registered
          const methods = await fetchSignInMethodsForEmail(auth, email);
          console.log("Auth methods after Google sign-in:", {
            email,
            methods,
            isNewUser: result.additionalUserInfo?.isNewUser,
            providerId: result.additionalUserInfo?.providerId,
            providerData: result.user.providerData
          });

          // If methods don't include google.com, something went wrong
          if (!methods.includes('google.com')) {
            console.error("Google auth method not properly registered");
            throw new Error("Authentication error - provider not registered");
          }
        }

        // Verify the user is properly persisted
        const methods = await fetchSignInMethodsForEmail(auth, result.user.email!);
        console.log("Auth methods after Google sign-in:", methods);

        return result;
      } catch (popupError: any) {
        console.warn("Popup sign in failed, trying redirect:", popupError);

        // If popup fails (common on mobile or with popup blockers), fall back to redirect
        if (popupError.code === 'auth/popup-blocked' || 
            popupError.code === 'auth/popup-closed-by-user' ||
            popupError.message?.includes('iframe')) {
          // Use redirect as fallback
          await signInWithRedirect(auth, provider);
          return null; // The redirect will reload the page
        }
        throw popupError; // Re-throw if it's not a popup issue
      }
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