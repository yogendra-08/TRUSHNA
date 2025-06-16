// src/contexts/ThemeContext.tsx
"use client";
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export type Theme = "light" | "dark" | "cyberpunk" | "glassmorphism" | "solarized";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isMounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [storedTheme, setStoredTheme] = useLocalStorage<Theme>("trushna-theme", "light");
  const [currentTheme, setCurrentTheme] = useState<Theme>("light"); // Default for SSR, will be updated
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setCurrentTheme(storedTheme);
  }, [storedTheme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setCurrentTheme(newTheme);
    setStoredTheme(newTheme);
  }, [setStoredTheme]);
  
  useEffect(() => {
    if (isMounted) {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark", "cyberpunk", "glassmorphism", "solarized");
      root.classList.add(currentTheme);
    }
  }, [currentTheme, isMounted]);

  if (!isMounted) {
     // Render nothing or a placeholder on the server/first client render to avoid mismatch
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, setTheme, isMounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
