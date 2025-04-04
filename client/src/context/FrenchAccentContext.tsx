
import React, { createContext, useContext, useState, useEffect } from "react";

interface FrenchAccentContextType {
  frenchAccent: boolean;
  toggleFrenchAccent: () => void;
}

const FrenchAccentContext = createContext<FrenchAccentContextType>({
  frenchAccent: true,
  toggleFrenchAccent: () => {},
});

export function FrenchAccentProvider({ children }: { children: React.ReactNode }) {
  const [frenchAccent, setFrenchAccent] = useState(() => {
    const saved = localStorage.getItem("frenchAccent");
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem("frenchAccent", JSON.stringify(frenchAccent));
  }, [frenchAccent]);

  const toggleFrenchAccent = () => setFrenchAccent(!frenchAccent);

  return (
    <FrenchAccentContext.Provider value={{ frenchAccent, toggleFrenchAccent }}>
      {children}
    </FrenchAccentContext.Provider>
  );
}

export const useFrenchAccent = () => useContext(FrenchAccentContext);
