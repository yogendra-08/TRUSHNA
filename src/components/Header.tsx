
// src/components/Header.tsx
"use client";

import { SettingsMenu } from "@/components/SettingsMenu";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onClearChat: () => void;
  onNewChat: () => void;
}

export function Header({ onClearChat, onNewChat }: HeaderProps) {
  const { theme } = useTheme();
  return (
    <header
      className={cn(
        "flex items-center justify-between p-3 md:p-4 border-b sticky top-0 z-40 bg-background/80 backdrop-blur-md",
        theme === "cyberpunk" ? "border-primary" : "border-border", 
        theme === "glassmorphism" ? "frosted-glass !bg-transparent border-0" : ""
      )}
    >
      <h1 className={cn(
        "text-xl md:text-2xl font-headline font-semibold",
        theme === "cyberpunk" || theme === "glassmorphism" ? "glow-primary-text animate-pulse-text-glow" : "text-foreground"
      )}>
        Trushna Virtual Assistant
      </h1>
      <SettingsMenu onClearChat={onClearChat} onNewChat={onNewChat} />
    </header>
  );
}
