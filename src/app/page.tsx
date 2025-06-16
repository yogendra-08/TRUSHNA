
// src/app/page.tsx
"use client";

import { TrushnaAssistant, type Message, type Reminder } from "@/components/TrushnaAssistant";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useTheme } from "@/contexts/ThemeContext";
import { useEffect } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";

export default function Home() {
  const { isMounted: isThemeMounted, theme } = useTheme();
  const [messages, setMessages] = useLocalStorage<Message[]>("trushna-messages", []);
  const [initialGreetingSpoken, setInitialGreetingSpoken] = useLocalStorage<boolean>("trushna-greeting-spoken", false);
  const [reminders, setReminders] = useLocalStorage<Reminder[]>("trushna-reminders", []);

  useEffect(() => {
    // This effect can remain for any future client-side logic
    // that needs to run after the theme is mounted.
  }, [isThemeMounted]);

  if (!isThemeMounted) {
    // Render nothing or a minimal loader until theme (and thus SSR/CSR sync) is resolved
    return <div className="fixed inset-0 bg-background z-[200]" />; 
  }

  const handleClearChat = () => {
    setMessages([]);
    // Optionally, you might want to reset other things or keep the greeting spoken status
  };

  const handleNewChat = () => {
    setMessages([]);
    setInitialGreetingSpoken(false);
    setReminders([]); // Clear reminders for a truly new chat session
  };

  const addMessage = (sender: "user" | "assistant", text: string, imageUrl?: string, isError?: boolean) => {
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), sender, text, timestamp: new Date(), imageUrl, isError },
    ]);
  };

  return (
    <main className={cn(
      "flex flex-col min-h-screen text-foreground",
      theme === 'cyberpunk' ? 'futuristic-cyber-bg' : 
      theme === 'glassmorphism' ? 'glassmorphism-page-bg' : 
      'bg-background'
    )}>
      <Header onClearChat={handleClearChat} onNewChat={handleNewChat} />
      <div className="flex-grow relative overflow-hidden">
        <TrushnaAssistant
          messages={messages}
          setMessages={setMessages}
          initialGreetingSpoken={initialGreetingSpoken}
          setInitialGreetingSpoken={setInitialGreetingSpoken}
          reminders={reminders}
          setReminders={setReminders}
          addMessage={addMessage}
        />
      </div>
      <Footer />
    </main>
  );
}
