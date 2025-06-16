
// src/components/TrushnaAssistant.tsx
"use client";

import { generateResponse } from "@/ai/flows/generate-response";
import { generateImage } from "@/ai/flows/generate-image-flow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "@/contexts/ThemeContext";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { parseCommand } from "@/lib/commandParser";
import { cn } from "@/lib/utils";
import { Bot, Mic, MicOff, Send, User, Image as ImageIcon, AlertTriangle, Copy, Download } from "lucide-react";
import { FormEvent, useEffect, useRef, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';

export interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: Date;
  imageUrl?: string;
  isError?: boolean;
}

export interface Reminder {
  id:string;
  task: string;
  dueTime: number;
  originalCommand: string;
  notified: boolean;
}

interface TrushnaAssistantProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  initialGreetingSpoken: boolean;
  setInitialGreetingSpoken: React.Dispatch<React.SetStateAction<boolean>>;
  reminders: Reminder[];
  setReminders: React.Dispatch<React.SetStateAction<Reminder[]>>;
  addMessage: (sender: "user" | "assistant", text: string, imageUrl?: string, isError?: boolean) => void;
}

const MAX_HISTORY_MESSAGES = 6;

const TypingIndicator = () => (
  <div className="flex items-center space-x-1">
    <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
  </div>
);

async function dataUriToBlob(dataUri: string): Promise<Blob> {
  const response = await fetch(dataUri);
  const blob = await response.blob();
  return blob;
}

export function TrushnaAssistant({
  messages,
  initialGreetingSpoken,
  setInitialGreetingSpoken,
  reminders,
  setReminders,
  addMessage,
}: TrushnaAssistantProps) {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { theme } = useTheme();

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { speak, isSpeaking, voicesReady } = useSpeechSynthesis({
    onEnd: () => console.log("Speech finished"),
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && process.env.NODE_ENV === 'production') {
      toast({
        title: "Security & Functionality Warning",
        description: "This page is not loaded over HTTPS. Microphone and some other features like 'Copy Image' require a secure connection (HTTPS) and may not work. Please ensure you are accessing this site via HTTPS.",
        variant: "destructive",
        duration: 30000,
      });
    }
  }, [toast]);

  useEffect(() => {
    if (voicesReady && !initialGreetingSpoken && messages.length === 0) {
      const timerId = setTimeout(() => {
        const currentHour = new Date().getHours();
        let timeGreeting = "";
        if (currentHour < 12) {
          timeGreeting = "Good morning";
        } else if (currentHour < 18) {
          timeGreeting = "Good afternoon";
        } else {
          timeGreeting = "Good evening";
        }
        const greeting = `${timeGreeting}, hi trushna here.`;
        speak(greeting);
        addMessage("assistant", greeting);
        setInitialGreetingSpoken(true);
      }, 200);

      return () => clearTimeout(timerId);
    }
  }, [speak, voicesReady, initialGreetingSpoken, setInitialGreetingSpoken, addMessage, messages.length]);


  const processAndRespond = async (commandText: string) => {
    if (isLoading) {
      console.warn("processAndRespond call ignored: already loading.");
      return;
    }
    if (!commandText.trim()) {
      return;
    }

    setIsLoading(true);
    const userMessageContent = commandText;
    addMessage("user", userMessageContent);
    setInputValue("");

    const parsedCommand = parseCommand(userMessageContent);
    let responseText = "";
    let responseImageUrl: string | undefined = undefined;
    let responseIsError = false;

    const handleBlockedPopup = (actionName: string) => {
      responseText = `I tried to ${actionName}, but it seems your browser blocked it. Please check your pop-up settings.`;
      responseIsError = true;
      toast({
        title: "Action Blocked",
        description: `Could not ${actionName}. Your browser might have blocked the pop-up. Please check your settings.`,
        variant: "destructive",
        duration: 30000,
      });
    };

    switch (parsedCommand.type) {
      case "greeting":
        const greetings = ["Hello there!", "Hi! How can I help you today?", "Hey! What's up?"];
        responseText = greetings[Math.floor(Math.random() * greetings.length)];
        break;
      case "farewell":
        const farewells = ["Goodbye!", "See you later!", "Catch you on the flip side!"];
        responseText = farewells[Math.floor(Math.random() * farewells.length)];
        break;
      case "reminder":
        const { task, timeRaw } = parsedCommand.payload;
        let due = Date.now() + 5 * 60 * 1000;
        let confirmationTimePhrase = 'soon';

        const timeMatch = timeRaw.match(/(\d+)\s*(minute|hour)s?/i);
        if (timeMatch) {
            const amount = parseInt(timeMatch[1]);
            const unit = timeMatch[2].toLowerCase();
            if (unit === 'minute') {
                due = Date.now() + amount * 60 * 1000;
                confirmationTimePhrase = `in ${amount} minute${amount > 1 ? 's' : ''}`;
            } else if (unit === 'hour') {
                due = Date.now() + amount * 60 * 60 * 1000;
                confirmationTimePhrase = `in ${amount} hour${amount > 1 ? 's' : ''}`;
            }
        } else if (timeRaw.toLowerCase() !== 'later' && timeRaw.toLowerCase() !== 'soon') {
             confirmationTimePhrase = `for ${timeRaw}`;
        }

        const newReminder: Reminder = { id: crypto.randomUUID(), task, dueTime: due, originalCommand: userMessageContent, notified: false };
        setReminders(prev => [...prev, newReminder]);
        responseText = `Okay, I've set a reminder for: ${task} ${confirmationTimePhrase}.`;
        toast({ title: "Reminder Set", description: `${task} ${confirmationTimePhrase}` });
        break;
      case "weather":
        responseText = "I can't check the actual weather right now, but I hope it's nice where you are!";
        break;
      case "send_message":
        const { to, body } = parsedCommand.payload;
        if (to && body) {
          window.open(`mailto:${to}?subject=Message from Trushna&body=${encodeURIComponent(body)}`);
          responseText = `I've opened your email client to send a message to ${to}.`;
        } else if (body) {
           window.open(`mailto:?subject=Message from Trushna&body=${encodeURIComponent(body)}`);
           responseText = `I've opened your email client with the message. Please specify recipient.`;
        } else {
          responseText = "I can help draft a message. Who is it for and what should it say?";
        }
        break;
      case "open_url":
        try {
          let urlToOpen = parsedCommand.payload.url;
          if (!/^https?:\/\//i.test(urlToOpen)) {
            urlToOpen = 'https://' + urlToOpen;
          }
          responseText = `Opening ${urlToOpen}...`;
          if (!window.open(urlToOpen, "_blank")) {
            handleBlockedPopup(`open ${urlToOpen}`);
          }
        } catch (e) {
          responseText = `Sorry, I couldn't open that URL. Is it valid?`;
          responseIsError = true;
        }
        break;
      case "get_time":
        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        responseText = `The current time is ${currentTime}.`;
        break;
      case "get_date":
        const currentDate = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        responseText = `Today is ${currentDate}.`;
        break;
      case "open_youtube":
        responseText = "Opening YouTube...";
        if (!window.open("https://youtube.com", "_blank")) {
          handleBlockedPopup("open YouTube");
        }
        break;
      case "play_song_youtube":
        const songName = parsedCommand.payload.songName;
        responseText = `Searching for "${songName}" on YouTube...`;
        const songSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(songName + " song")}`;
        if (!window.open(songSearchUrl, "_blank")) {
          handleBlockedPopup(`search for "${songName}" on YouTube`);
        }
        break;
      case "search_youtube":
        const youtubeQuery = parsedCommand.payload.query;
        responseText = `Searching for "${youtubeQuery}" on YouTube...`;
        const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(youtubeQuery)}`;
        if (!window.open(youtubeSearchUrl, "_blank")) {
          handleBlockedPopup(`search for "${youtubeQuery}" on YouTube`);
        }
        break;
      case "browser_search":
        const browserQuery = parsedCommand.payload.query;
        responseText = `Searching for "${browserQuery}"...`;
        const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(browserQuery)}`;
        if (!window.open(googleSearchUrl, "_blank")) {
          handleBlockedPopup(`search for "${browserQuery}"`);
        }
        break;
      case "open_gmail":
        responseText = "Opening Gmail...";
        if (!window.open("https://mail.google.com", "_blank")) {
          handleBlockedPopup("open Gmail");
        }
        break;
      case "open_google":
        responseText = "Opening Google...";
        if (!window.open("https://google.com", "_blank")) {
          handleBlockedPopup("open Google");
        }
        break;
      case "open_chatgpt":
        responseText = "Opening ChatGPT...";
        if (!window.open("https://chat.openai.com", "_blank")) {
          handleBlockedPopup("open ChatGPT");
        }
        break;
      case "open_brave":
        responseText = "Opening Brave Search...";
        if (!window.open("https://search.brave.com", "_blank")) {
          handleBlockedPopup("open Brave Search");
        }
        break;
      case "open_instagram":
        responseText = "Opening Instagram...";
        if (!window.open("https://instagram.com", "_blank")) {
          handleBlockedPopup("open Instagram");
        }
        break;
      case "open_snapchat":
        responseText = "Opening Snapchat...";
        if (!window.open("https://web.snapchat.com", "_blank")) {
          handleBlockedPopup("open Snapchat");
        }
        break;
      case "open_email":
        responseText = "Opening your email client...";
        if(!window.open("mailto:", "_self")) { 
             handleBlockedPopup("open your email client");
        }
        break;
      case "generate_image":
        try {
          responseText = `Okay, generating an image of: ${parsedCommand.payload.prompt}...`;
          addMessage("assistant", responseText);
          speak(responseText);

          const imageResult = await generateImage({ prompt: parsedCommand.payload.prompt });
          responseText = "Here's the image you requested:";
          responseImageUrl = imageResult.imageUrl;
        } catch (error) {
          console.error("Image generation error:", error);
          responseText = "Sorry, I couldn't generate that image. There might have been an issue with the request or the content.";
          responseIsError = true;
          toast({ title: "Image Generation Failed", description: (error as Error).message || "Could not generate image.", variant: "destructive"});
        }
        break;
      default: // This handles 'unknown' type
        try {
          const historyForAI = messages.slice(-MAX_HISTORY_MESSAGES);
          const chatHistoryString = historyForAI
            .map(msg => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`)
            .join('\\n');

          const aiResponse = await generateResponse({ command: userMessageContent, chatHistory: chatHistoryString });
          responseText = aiResponse.response;
        } catch (error) {
          console.error("AI response error:", error);
          responseText = "Sorry, I had a little trouble thinking about that. Can you try again?";
          responseIsError = true;
          toast({ title: "AI Error", description: "Could not get response from AI.", variant: "destructive"});
        }
    }

    addMessage("assistant", responseText, responseImageUrl, responseIsError);
    if (parsedCommand.type !== "generate_image" || responseIsError) {
        speak(responseText);
    }
    setIsLoading(false);
  };

  const {
    isListening: isMicListening,
    error: micError,
    supported: micSupported,
    startListening: startMicListening,
    stopListening: stopMicListening,
    isAwake,
  } = useSpeechRecognition({
    wakeWord: "hey trushna",
    onWakeWord: () => {
      toast({ title: "Trushna Activated!", description: "Listening for your command...", duration: 3000 });
    },
    onCommand: (command) => {
      if (command && !isLoading) {
        setInputValue(command);
        processAndRespond(command);
      } else if (command && isLoading) {
        console.warn("onCommand received but assistant is already loading. Command ignored:", command);
      }
    },
    onResult: (textForInput) => {
        if (isMicListening) {
            setInputValue(textForInput);
        }
    },
    onError: (errText) => {
      toast({ title: "Microphone Error", description: errText, variant: "destructive" });
    },
  });


  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    processAndRespond(inputValue.trim());
  };

  const handleMicToggle = () => {
    if (!micSupported) {
        toast({ title: "Unsupported", description: "Speech recognition is not supported in your browser.", variant: "destructive"});
        return;
    }
    if (isMicListening) {
      stopMicListening();
    } else {
      setInputValue('');
      startMicListening();
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      const { scrollHeight, clientHeight } = scrollAreaRef.current;
      scrollAreaRef.current.scrollTop = scrollHeight - clientHeight;
    }
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      reminders.forEach(r => {
        if (!r.notified && now >= r.dueTime) {
          speak(`Reminder: ${r.task}`);
          toast({
            title: "Reminder!",
            description: r.task,
            duration: 10000,
          });
          setReminders(prev => prev.map(reminder => reminder.id === r.id ? {...reminder, notified: true} : reminder));
        }
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [reminders, speak, toast, setReminders]);

  const handleCopyImage = async (imageUrl: string) => {
    if (!navigator.clipboard || !navigator.clipboard.write) {
      toast({ title: "Copy Failed", description: "Clipboard API not available. This feature requires HTTPS.", variant: "destructive" });
      return;
    }
    try {
      const blob = await dataUriToBlob(imageUrl);
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      toast({ title: "Image Copied!", description: "The image has been copied to your clipboard." });
    } catch (err) {
      console.error("Failed to copy image:", err);
      toast({ title: "Copy Failed", description: "Could not copy the image to clipboard.", variant: "destructive" });
    }
  };

  const handleDownloadImage = (imageUrl: string) => {
    try {
      const link = document.createElement('a');
      link.href = imageUrl;
      const mimeType = imageUrl.substring(imageUrl.indexOf(':') + 1, imageUrl.indexOf(';'));
      const extension = mimeType.split('/')[1] || 'png';
      link.download = `trushna-generated-image-${Date.now()}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: "Image Downloading", description: "Your image download has started." });
    } catch (err) {
      console.error("Failed to download image:", err);
      toast({ title: "Download Failed", description: "Could not download the image.", variant: "destructive" });
    }
  };


  const assistantIcon = <Bot className="w-8 h-8 text-primary flex-shrink-0 drop-shadow-glow-primary" />;
  const userIcon = <User className="w-8 h-8 text-accent flex-shrink-0 drop-shadow-glow-accent" />;

  const getPlaceholderText = () => {
    if (isMicListening) {
      return isAwake ? "Say your command..." : "Listening for 'Hey Trushna' or direct command...";
    }
    return "Ask Trushna anything...";
  };

  return (
    <div className={cn("flex flex-col h-full p-2 md:p-4")}>
      <ScrollArea className="flex-grow mb-4 pr-2 md:pr-4" ref={scrollAreaRef}>
        <div className="space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex items-start gap-3 max-w-[85%] md:max-w-[75%] animate-fade-in-scale",
                msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              {msg.sender === "assistant" ? assistantIcon : userIcon}
              <div
                className={cn(
                  "rounded-xl px-4 py-3 text-sm md:text-base shadow-md",
                  msg.isError ? "bg-destructive/80 text-destructive-foreground rounded-bl-none" :
                  msg.sender === "user"
                    ? "bg-accent/80 text-accent-foreground rounded-br-none"
                    : "bg-primary/80 text-primary-foreground rounded-bl-none",
                  theme === 'cyberpunk' && msg.sender === 'user' && !msg.isError ? 'border border-accent glow-accent-box' : '',
                  theme === 'cyberpunk' && msg.sender === 'assistant' && !msg.isError ? 'border border-primary glow-primary-box' : '',
                  theme === 'glassmorphism' && !msg.isError ? 'frosted-glass' : ''
                )}
              >
                {msg.isError && <AlertTriangle className="inline-block w-4 h-4 mr-2" />}
                <p className={cn("whitespace-pre-wrap", msg.isError ? "inline" : "")}>{msg.text}</p>
                {msg.imageUrl && (
                  <div className="mt-3">
                    <div className="relative w-full max-w-sm aspect-square overflow-hidden rounded-md border border-border mx-auto">
                       <Image
                          src={msg.imageUrl}
                          alt="Generated image"
                          layout="fill"
                          objectFit="contain"
                          data-ai-hint="abstract creative"
                        />
                    </div>
                    <div className="mt-2.5 flex gap-2 justify-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleCopyImage(msg.imageUrl!)}
                        className={cn(
                          "flex items-center gap-1.5 text-xs px-2.5 py-1 h-auto",
                           theme === "cyberpunk" || theme === "glassmorphism" ? "hover:glow-primary-box" : ""
                        )}
                        aria-label="Copy generated image"
                      >
                        <Copy className="w-3.5 h-3.5" /> Copy
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDownloadImage(msg.imageUrl!)}
                        className={cn(
                          "flex items-center gap-1.5 text-xs px-2.5 py-1 h-auto",
                           theme === "cyberpunk" || theme === "glassmorphism" ? "hover:glow-primary-box" : ""
                        )}
                        aria-label="Download generated image"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </Button>
                    </div>
                  </div>
                )}
                <p className="text-xs opacity-60 mt-1 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3 max-w-[85%] md:max-w-[75%] mr-auto animate-fade-in-scale">
              {assistantIcon}
              <div className={cn(
                "rounded-xl px-4 py-3 text-sm md:text-base shadow-md bg-primary/80 text-primary-foreground rounded-bl-none flex items-center",
                 theme === 'cyberpunk' ? 'border border-primary glow-primary-box' : '',
                 theme === 'glassmorphism' ? 'frosted-glass' : ''
                )}>
                <TypingIndicator />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <form onSubmit={handleSubmit} className={cn(
          "flex items-center gap-2 md:gap-4 p-2 rounded-lg border bg-card shadow-xl relative overflow-hidden",
          theme === 'cyberpunk' ? 'cyberpunk:cyber-border' : '',
          theme === 'glassmorphism' ? 'frosted-glass' : ''
        )}>
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={getPlaceholderText()}
          className="flex-grow bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base md:text-lg placeholder:text-muted-foreground"
          disabled={isLoading}
          aria-label="Command input"
        />
        <Button
          type="button"
          size="icon"
          onClick={handleMicToggle}
          disabled={isLoading || !micSupported}
          variant="ghost"
          className={cn("rounded-full hover:bg-primary/20", isMicListening ? "text-destructive animate-pulse-glow" : "text-primary", (theme === 'cyberpunk' || theme === 'glassmorphism') && !isMicListening ? 'glow-primary-text' : '')}
          aria-label={isMicListening ? "Stop listening" : "Start listening"}
        >
          {isMicListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </Button>
        <Button
          type="submit"
          size="icon"
          disabled={isLoading || !inputValue.trim()}
          className={cn("rounded-full bg-primary text-primary-foreground hover:bg-primary/80", (theme === 'cyberpunk' || theme === 'glassmorphism') ? 'glow-primary-box' : '')}
          aria-label="Send command"
        >
          <Send className="w-5 h-5" />
        </Button>
      </form>
       {micError && <p className="text-xs text-destructive mt-1 text-center">{micError}</p>}
    </div>
  );
}
