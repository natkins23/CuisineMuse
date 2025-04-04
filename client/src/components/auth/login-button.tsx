import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

interface LoginButtonProps {
  className?: string;
}

export default function LoginButton({ className }: LoginButtonProps) {
  const { signInWithGoogle } = useAuth();

  return (
    <Button 
      onClick={signInWithGoogle}
      className={className || "bg-orange-500 hover:bg-orange-600 transition-colors"}
    >
      <LogIn className="h-4 w-4 mr-2" />
      Sign In
    </Button>
  );
}