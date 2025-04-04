import { useAuth } from "@/context/AuthContext";
import LoginButton from "./login-button";
import UserProfile from "./user-profile";

export default function AuthStatus() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-10 w-10 rounded-full bg-neutral-200 animate-pulse"></div>
    );
  }

  return currentUser ? <UserProfile /> : <LoginButton />;
}