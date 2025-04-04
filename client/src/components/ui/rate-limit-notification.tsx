import React, { useState, useEffect } from "react";
import { AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface RateLimitNotificationProps {
  className?: string;
  message?: string;
  onClose?: () => void;
}

export default function RateLimitNotification({
  className,
  message = "You've reached the rate limit for AI requests. Please try again in a few minutes.",
  onClose,
}: RateLimitNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Auto-dismiss after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 10000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 max-w-md bg-destructive text-destructive-foreground p-4 rounded-lg shadow-lg animate-in fade-in-50 slide-in-from-right-5 z-50",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium text-sm">Rate Limit Exceeded</h4>
          <p className="text-sm mt-1 opacity-90">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            if (onClose) onClose();
          }}
          className="flex-shrink-0 rounded-full p-1 hover:bg-destructive-foreground/10 transition-colors"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}