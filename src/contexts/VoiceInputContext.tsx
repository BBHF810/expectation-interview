"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type VoiceInputMode = "web_speech_api" | "media_recorder";

interface VoiceInputContextType {
  mode: VoiceInputMode;
  setMode: (mode: VoiceInputMode) => void;
  switchMode: (mode: VoiceInputMode) => void;
}

const STORAGE_KEY = "expectation_voice_input_mode";

const DEFAULT_MODE: VoiceInputMode =
  typeof process !== "undefined" && process.env?.NODE_ENV === "test"
    ? "web_speech_api"
    : "media_recorder";

const VoiceInputContext = createContext<VoiceInputContextType>({
  mode: DEFAULT_MODE,
  setMode: () => {},
  switchMode: () => {},
});

export const VoiceInputProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<VoiceInputMode>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === "web_speech_api" || saved === "media_recorder") {
          return saved;
        }
      } catch {}
    }
    const envMode = process.env.NEXT_PUBLIC_VOICE_INPUT_MODE;
    if (envMode === "web_speech_api") return "web_speech_api";
    if (envMode === "media_recorder") return "media_recorder";
    return DEFAULT_MODE;
  });

  const setMode = (newMode: VoiceInputMode) => {
    setModeState(newMode);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, newMode);
      } catch {}
    }
  };

  return (
    <VoiceInputContext.Provider value={{ mode, setMode, switchMode: setMode }}>
      {children}
    </VoiceInputContext.Provider>
  );
};

export const useVoiceInputMode = (): VoiceInputContextType => {
  return useContext(VoiceInputContext);
};
