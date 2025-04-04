import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import SignInModal from "./signin-modal";

interface LoginButtonProps {
  className?: string;
}

export default function LoginButton({ className }: LoginButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button 
        onClick={() => setIsModalOpen(true)}
        className={className || "bg-orange-500 hover:bg-orange-600 transition-colors"}
      >
        Get Started
      </Button>
      
      <SignInModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
}