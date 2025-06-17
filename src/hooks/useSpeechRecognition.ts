// src/hooks/useSpeechRecognition.ts
"use client";

import { useState, useCallback, useEffect, useRef } from 'react';

// Add type declarations for SpeechRecognition
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognitionOptions {
  onResult?: (transcript: string) => void;
  onWakeWord?: () => void;
  onCommand?: (command: string) => void;
  onError?: (error: string) => void;
  wakeWord?: string;
}

const COMMAND_TIMEOUT = 7000; // Max time to listen for a command after wake word

export function useSpeechRecognition(options?: SpeechRecognitionOptions) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(false);
  const [isAwake, setIsAwake] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const commandTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const isListeningRef = useRef(false);
  const isAwakeRef = useRef(false);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    isAwakeRef.current = isAwake;
  }, [isAwake]);

  const onRecognitionEnd = useCallback(() => {
    if (isListeningRef.current) {
      setIsListening(false); 
      setIsAwake(false);   
    }
  }, []); 


  const stopListening = useCallback(() => {
    if (commandTimeoutRef.current) {
      clearTimeout(commandTimeoutRef.current);
      commandTimeoutRef.current = null;
    }
    
    const rec = recognitionRef.current;
    if (rec && isListeningRef.current) { 
      rec.stop(); 
    }
    setIsListening(false);
    setIsAwake(false);
  }, []);


  const handleError = useCallback((eventOrError: SpeechRecognitionErrorEvent | string) => {
    let errorMessage = typeof eventOrError === 'string' ? eventOrError : eventOrError.error;
    if (typeof eventOrError !== 'string') {
        if (eventOrError.error === 'no-speech') {
            errorMessage = "No speech detected. Please try again.";
        } else if (eventOrError.error === 'audio-capture') {
            errorMessage = "Audio capture failed. Check microphone permissions.";
        } else if (eventOrError.error === 'not-allowed') {
            errorMessage = "Microphone access denied. Please enable it in your browser settings.";
        } else if (eventOrError.error === 'aborted') {
            errorMessage = isAwakeRef.current ? "Command listening aborted." : "Listening aborted.";
        }
    }
    setError(errorMessage);
    options?.onError?.(errorMessage);
    stopListening(); 
  }, [options, stopListening]);


  const handleResult = useCallback((event: SpeechRecognitionEvent) => {
    if (!isListeningRef.current) { 
      return;
    }

    let finalTranscriptPart = '';
    let interimTranscriptPart = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscriptPart += event.results[i][0].transcript;
      } else {
        interimTranscriptPart += event.results[i][0].transcript;
      }
    }
    
    const currentRawText = (interimTranscriptPart || finalTranscriptPart).trim();
    setTranscript(currentRawText); 

    let textForUiUpdate = currentRawText;
    if (options?.wakeWord && isAwakeRef.current) { 
        if (textForUiUpdate.toLowerCase().startsWith(options.wakeWord.toLowerCase())) {
            textForUiUpdate = textForUiUpdate.substring(options.wakeWord.length).trimStart();
        }
    } else if (options?.wakeWord && !isAwakeRef.current) { 
        if (textForUiUpdate.toLowerCase() === options.wakeWord.toLowerCase()){
             textForUiUpdate = ""; 
        }
    }
    options?.onResult?.(textForUiUpdate);

    const finalText = finalTranscriptPart.trim().toLowerCase().replace(/\s+/g, ' ');
    if (!finalText) return;

    if (commandTimeoutRef.current) {
        clearTimeout(commandTimeoutRef.current);
        commandTimeoutRef.current = null;
    }
    
    const processFinalCommand = (command: string) => {
        if (!isListeningRef.current) return; 

        // Clean up the command for better matching
        const cleanedCommand = command
            .toLowerCase()
            .trim()
            .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
            .replace(/[.,]/g, '')  // Remove periods and commas
            .replace(/\s+$/g, ''); // Remove trailing spaces

        options?.onCommand?.(cleanedCommand);
        stopListening(); 
    };

    if (options?.wakeWord) {
      if (!isAwakeRef.current) { 
        if (finalText.includes(options.wakeWord.toLowerCase())) { 
          options.onWakeWord?.();
          setIsAwake(true); 
          
          const commandAfterWakeWord = finalText.substring(finalText.indexOf(options.wakeWord.toLowerCase()) + options.wakeWord.length).trim();
          
          if (recognitionRef.current) {
             recognitionRef.current.stop(); 
          }

          if (commandAfterWakeWord) {
            processFinalCommand(commandAfterWakeWord);
          } else {
            if (recognitionRef.current) {
                setIsListening(false); 
                
                Promise.resolve().then(() => {
                    if (isAwakeRef.current) { 
                        const rec = recognitionRef.current;
                        if (rec) {
                           setIsListening(true); 
                           rec.start();
                           commandTimeoutRef.current = setTimeout(() => {
                             if (isAwakeRef.current) {
                                 handleError("Command listening timed out after wake word.");
                             }
                           }, COMMAND_TIMEOUT);
                        }
                    }
                });
            }
          }
        } else { 
          processFinalCommand(finalText);
        }
      } else { 
        processFinalCommand(finalText);
      }
    } else { 
      processFinalCommand(finalText);
    }
  }, [options, stopListening, handleError, onRecognitionEnd]); 


  const startListening = useCallback(() => {
    if (!supported || !recognitionRef.current) return;
    
    stopListening(); 

    setTranscript(''); 
    setError(null);
    
    const rec = recognitionRef.current;
    rec.onresult = handleResult;
    rec.onerror = (event) => handleError(event);
    rec.onend = onRecognitionEnd; 

    try {
      setIsListening(true); 
      rec.start();
    } catch (e: any) {
      handleError(e);
    }
  }, [supported, stopListening, handleResult, handleError, onRecognitionEnd]);
  
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      setSupported(true);
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!recognitionRef.current) { 
        recognitionRef.current = new SpeechRecognitionAPI();
        recognitionRef.current.continuous = true; 
        recognitionRef.current.interimResults = true;
      }
    } else {
      setSupported(false);
    }

    return () => { 
      const rec = recognitionRef.current;
      if (rec) {
        rec.onresult = null;
        rec.onerror = null;
        rec.onend = null;
        rec.stop();
      }
      if (commandTimeoutRef.current) clearTimeout(commandTimeoutRef.current);
    };
  }, []); 


  return {
    isListening,
    transcript: transcript, 
    error,
    supported,
    isAwake,
    startListening,
    stopListening,
  };
}
