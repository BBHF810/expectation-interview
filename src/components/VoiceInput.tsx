"use client";

import React from "react";
import { useVoiceInputMode } from "@/contexts/VoiceInputContext";
import {
  VoiceInputWebSpeechAPI,
  VoiceInputProps,
  MAX_AUDIO_CAPTURE_RETRIES,
  AUDIO_CAPTURE_RETRY_DELAY_MS,
} from "./voice-input/VoiceInputWebSpeechAPI";
import { VoiceInputMediaRecorder } from "./voice-input/VoiceInputMediaRecorder";

export type { VoiceInputProps };
export { MAX_AUDIO_CAPTURE_RETRIES, AUDIO_CAPTURE_RETRY_DELAY_MS };

/**
 * 音声入力ディスパッチャー
 * Contextで指定されたモードに応じて Web Speech API または MediaRecorder (Whisper) を切り替える
 */
export const VoiceInput: React.FC<VoiceInputProps> = (props) => {
  const { mode } = useVoiceInputMode();

  if (mode === "media_recorder") {
    return <VoiceInputMediaRecorder {...props} />;
  }

  return <VoiceInputWebSpeechAPI {...props} />;
};