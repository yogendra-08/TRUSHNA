
// src/components/SettingsMenu.tsx
"use client";

import { Menu, History, RotateCcw, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { AboutDialog } from "./AboutDialog";

interface SettingsMenuProps {
  onClearChat: () => void;
  onNewChat: () => void;
}

export function SettingsMenu({ onClearChat, onNewChat }: SettingsMenuProps) {
  const { theme } = useTheme();
  const [isAboutDialogOpen, setIsAboutDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className={cn("border-accent hover:border-primary", theme === "cyberpunk" || theme === "glassmorphism" ? "hover:glow-primary-box" : "")}>
            <Menu className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">Open settings menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className={cn(
            "w-56",
            theme === "cyberpunk" ? "bg-popover cyberpunk:cyber-border" :
            theme === "glassmorphism" ? "glassmorphism:glass-ui-element" :
            "bg-popover border-border"
          )}
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel>Appearance</DropdownMenuLabel>
             <div className="px-2 py-1.5"> 
               <ThemeSwitcher />
             </div>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel>Chat</DropdownMenuLabel>
            <DropdownMenuItem onClick={onClearChat} className="hover:bg-accent focus:bg-accent">
              <History className="mr-2 h-4 w-4" />
              Clear Chat History
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onNewChat} className="hover:bg-accent focus:bg-accent">
              <RotateCcw className="mr-2 h-4 w-4" />
              New Chat
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel>Application</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setIsAboutDialogOpen(true)} className="hover:bg-accent focus:bg-accent">
              <Info className="mr-2 h-4 w-4" />
              About Us
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <AboutDialog isOpen={isAboutDialogOpen} onOpenChange={setIsAboutDialogOpen} />
    </>
  );
}
