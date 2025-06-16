
// src/components/ThemeSwitcher.tsx
"use client";

import { Moon, Sun, LayersIcon, PaletteIcon, TerminalSquareIcon } from "lucide-react";
import { useTheme, type Theme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function ThemeSwitcher() {
  const { setTheme, theme, isMounted } = useTheme();

  if (!isMounted) {
    return <div className="w-10 h-10 rounded-md bg-muted animate-pulse" />; // Placeholder for SSR
  }

  const iconClass = "h-[1.2rem] w-[1.2rem] transition-all";

  const renderTriggerIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className={iconClass} />;
      case "dark":
        return <Moon className={iconClass} />;
      case "cyberpunk":
        return <TerminalSquareIcon className={iconClass} />;
      case "glassmorphism":
        return <LayersIcon className={iconClass} />;
      case "solarized":
        return <PaletteIcon className={iconClass} />; 
      default:
        return <Sun className={iconClass} />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className={cn("border-accent hover:border-primary", theme === "cyberpunk" || theme === "glassmorphism" ? "hover:glow-primary-box" : "")}>
          {renderTriggerIcon()}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className={cn(
            theme === "cyberpunk" ? "bg-popover cyberpunk:cyber-border" : 
            theme === "glassmorphism" ? "glassmorphism:glass-ui-element" : 
            "bg-popover border-border"
        )}
      >
        <DropdownMenuItem onClick={() => setTheme("light")} className="hover:bg-accent focus:bg-accent">
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="hover:bg-accent focus:bg-accent">
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("cyberpunk")} className="hover:bg-accent focus:bg-accent">
          <TerminalSquareIcon className="mr-2 h-4 w-4" />
          Cyberpunk
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("glassmorphism")} className="hover:bg-accent focus:bg-accent">
          <LayersIcon className="mr-2 h-4 w-4" />
          Glassmorphism
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("solarized")} className="hover:bg-accent focus:bg-accent">
          <PaletteIcon className="mr-2 h-4 w-4" />
          Solarized
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
