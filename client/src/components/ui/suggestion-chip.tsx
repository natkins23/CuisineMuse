import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SuggestionChipProps {
  text: string;
  variant?: "neutral" | "green" | "blue" | "purple" | "orange";
  onClick?: () => void;
}

export default function SuggestionChip({ 
  text, 
  variant = "neutral", 
  onClick 
}: SuggestionChipProps) {
  const baseClasses = "suggestion-chip border rounded-full px-3 py-1 text-sm font-medium mt-2 cursor-pointer transition-all duration-200";
  
  const variantClasses = {
    neutral: "bg-white border-neutral-200 text-neutral-700 hover:border-orange-300",
    green: "bg-white border-green-200 text-green-800 hover:border-green-400",
    blue: "bg-white border-blue-200 text-blue-700 hover:border-blue-400",
    purple: "bg-white border-purple-200 text-purple-700 hover:border-purple-400",
    orange: "bg-white border-orange-200 text-orange-700 hover:border-orange-400"
  };
  
  return (
    <motion.span
      className={cn(baseClasses, variantClasses[variant])}
      onClick={onClick}
      whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
      whileTap={{ scale: 0.97 }}
    >
      {text}
    </motion.span>
  );
}
