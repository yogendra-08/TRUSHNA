
// src/hooks/useSpeechSynthesis.ts
"use client";

import { useState, useCallback, useEffect, useRef } from 'react';

interface SpeechSynthesisOptions {
  onEnd?: () => void;
}

export function useSpeechSynthesis(options?: SpeechSynthesisOptions) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const [voicesReady, setVoicesReady] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSupported(true);
      
      const onVoicesChanged = () => {
        if (window.speechSynthesis.getVoices().length > 0) {
          setVoicesReady(true);
          window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
        }
      };

      if (window.speechSynthesis.getVoices().length > 0) {
        setVoicesReady(true);
      } else {
        window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
      }

      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
      };
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!supported || !text) {
      if (!supported) console.warn("Speech synthesis not supported.");
      if (!text) console.warn("Speak called with empty text.");
      return;
    }

    const performActualSpeak = (txt: string) => {
        if (typeof window !== 'undefined' && window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel(); 
        }

        const utterance = new SpeechSynthesisUtterance(txt);
        utteranceRef.current = utterance;

        const voices = typeof window !== 'undefined' ? window.speechSynthesis.getVoices() : [];
        if (voices.length > 0) {
          let selectedVoice = null;
          // Prioritize English (US/UK) female voices
          const preferredVoices = voices.filter(voice =>
            (voice.lang.startsWith('en-US') || voice.lang.startsWith('en-GB')) &&
            (voice.name.toLowerCase().includes('female') ||
             voice.name.toLowerCase().includes('zira') || // Microsoft Zira
             voice.name.toLowerCase().includes('susan') || // Older Apple voice
             voice.name.toLowerCase().includes('samantha') // Common voice name
            )
          );

          if (preferredVoices.length > 0) {
            selectedVoice = preferredVoices[0];
          } else {
            // Fallback: any English (US/UK) voice if no preferred female found
            const anyEnglishVoice = voices.find(voice => voice.lang.startsWith('en-US') || voice.lang.startsWith('en-GB'));
            if (anyEnglishVoice) {
              selectedVoice = anyEnglishVoice;
            } else {
              // Fallback: first available voice as a last resort
              selectedVoice = voices[0];
            }
          }
          
          if (selectedVoice) {
            utterance.voice = selectedVoice;
          }
        }

        utterance.onstart = () => {
          setIsSpeaking(true);
        };
        utterance.onend = () => {
          setIsSpeaking(false);
          options?.onEnd?.();
          utteranceRef.current = null;
        };
        utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
          if (event.error === 'interrupted') {
            console.info(
              `SpeechSynthesisUtterance: Speech was interrupted (likely by a new speak call). Type='${event.error}'`,
              {
                details: {
                  textAttempted: txt.substring(0, 70) + (txt.length > 70 ? "..." : ""),
                },
              }
            );
          } else {
            console.error(
              `SpeechSynthesisUtterance.onerror: Type='${event.error}'`,
              {
                details: {
                  charIndex: event.charIndex,
                  elapsedTime: event.elapsedTime,
                  textAttempted: txt.substring(0, 70) + (txt.length > 70 ? "..." : ""),
                  voice: utterance.voice
                    ? `${utterance.voice.name} (Lang: ${utterance.voice.lang}, Default: ${utterance.voice.default})`
                    : `Voice not set (Utterance lang: ${utterance.lang || "not set"})`,
                  isVoicesArrayEmpty: typeof window !== 'undefined' && window.speechSynthesis ? window.speechSynthesis.getVoices().length === 0 : 'unknown',
                },
                rawEvent: event, 
              }
            );
          }
          setIsSpeaking(false);
          utteranceRef.current = null;
        };
        
        if (typeof window !== 'undefined') {
          window.speechSynthesis.speak(utterance);
        }
    };

    if (voicesReady && typeof window !== 'undefined' && window.speechSynthesis.getVoices().length > 0) {
      performActualSpeak(text);
    } else if (typeof window !== 'undefined') {
      const voicesChangedCallback = () => {
        setVoicesReady(true); 
        if (window.speechSynthesis.getVoices().length > 0) {
          performActualSpeak(text);
        } else {
          console.warn("SpeechSynthesis: 'voiceschanged' fired, but getVoices() is still empty. Cannot speak.");
        }
        window.speechSynthesis.removeEventListener('voiceschanged', voicesChangedCallback);
      };
      window.speechSynthesis.addEventListener('voiceschanged', voicesChangedCallback);
    }
  }, [supported, options, voicesReady]);

  const cancel = useCallback(() => {
    if (!supported || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    utteranceRef.current = null;
  }, [supported]);

  return { speak, cancel, isSpeaking, supported, voicesReady };
}

