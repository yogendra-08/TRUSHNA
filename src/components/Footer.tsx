
// src/components/Footer.tsx
"use client";

import { GithubIcon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

export function Footer() {
  const { theme } = useTheme();
  return (
    <footer
      className={cn(
        "p-3 md:p-4 border-t text-center text-xs md:text-sm",
        theme === "cyberpunk" ? "border-primary text-accent/90 bg-background/80 backdrop-blur-md" :
        theme === "glassmorphism" ? "frosted-glass !bg-transparent border-0 text-foreground/80" :
        "border-border text-muted-foreground bg-background/80 backdrop-blur-md"
      )}
    >
      <div className="flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-3">
        <span>Developed by Yogendra Bhange and Trushna Bankar</span>
        <div className="flex gap-3">
          <a
            href="https://github.com/yogendra-27-bhange"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Yogendra Bhange's GitHub"
            className={cn("hover:text-primary transition-colors", theme === "cyberpunk" || theme === "glassmorphism" ? "hover:glow-primary-text" : "")}
          >
            <GithubIcon className="w-4 h-4 md:w-5 md:h-5" />
          </a>
          <a
            href="https://github.com/trushna-888"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Trushna Bankar's GitHub"
            className={cn("hover:text-primary transition-colors", theme === "cyberpunk" || theme === "glassmorphism" ? "hover:glow-primary-text" : "")}
          >
            <GithubIcon className="w-4 h-4 md:w-5 md:h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
