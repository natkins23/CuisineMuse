import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SuggestionChipProps {
  text: string;
  variant?: "neutral" | "green" | "blue" | "purple" | "orange";
  onClick?: () => void;
  isSelected?: boolean;
  disabled?: boolean;
}

export default function SuggestionChip({ 
  text, 
  variant = "neutral", 
  onClick,
  isSelected = false,
  disabled = false
}: SuggestionChipProps) {
  const baseClasses = "suggestion-chip border rounded-full px-3 py-1 text-sm font-medium mt-2 transition-all duration-200";
  
  // Base styles for inactive vs active states
  const cursorClasses = disabled 
    ? "cursor-not-allowed opacity-40" 
    : "cursor-pointer";
  
  // Color variants for inactive state (outline style)
  const inactiveVariantClasses = {
    neutral: "bg-white border-neutral-200 text-neutral-700 hover:border-orange-300",
    green: "bg-white border-green-200 text-green-700 hover:border-green-400",
    blue: "bg-white border-blue-200 text-blue-700 hover:border-blue-400",
    purple: "bg-white border-purple-200 text-purple-700 hover:border-purple-400",
    orange: "bg-white border-orange-200 text-orange-700 hover:border-orange-400"
  };
  
  // Color variants for active state (solid style with white text)
  const activeVariantClasses = {
    neutral: "bg-neutral-600 border-neutral-600 text-white",
    green: "bg-green-600 border-green-600 text-white",
    blue: "bg-blue-600 border-blue-600 text-white",
    purple: "bg-purple-600 border-purple-600 text-white",
    orange: "bg-orange-600 border-orange-600 text-white"
  };
  
  return (
    <motion.span
      className={cn(
        baseClasses, 
        cursorClasses,
        isSelected 
          ? activeVariantClasses[variant]
          : inactiveVariantClasses[variant]
      )}
      onClick={disabled ? undefined : onClick}
      whileHover={disabled ? {} : { y: -2, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
      whileTap={disabled ? {} : { scale: 0.97 }}
    >
      {text}
    </motion.span>
  );
}