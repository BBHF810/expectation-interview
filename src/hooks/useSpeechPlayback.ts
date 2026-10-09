"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSavedTtsVoice } from "@/lib/tts-voices";
import {
  fetchPlayableTts,
  fetchServerTts,
  getSharedAudio,
  normalizeTtsText,
  unlockAudioOnUserAction,
  TtsPlayableAudio,
} from "@/lib/tts-client";

interface UseSpeechPlaybackOptions {
  /** 読み上げるテキスト（ふりがな付きでも可） */
  text: string;
  /** 音声ONかどうか（ミュート時は false） */
  enabled: boolean;
  /** true の間は再生しない（質問生成中など） */
  blocked?: boolean;
  /** 先行取得済みの音声URL（再生開始時点で存在すれば使用。後から届いても再生をやり直さない） */
  preferredSrc?: string;
  /** 音声準備中に文面を隠す最大時間 */
  revealTimeoutMs?: number;
  /** 再生が始まらない場合に次の手段へ切り替えるまでの時間 */
  stallTimeoutMs?: number;
}

const isTestEnv = () => typeof process !== "undefined" && process.env?.NODE_ENV === "test";

/**
 * 質問・締めコメントの読み上げを一元管理するフック。
 *
 * - アプリ共通の Audio 要素を使い回す（iOS の自動再生制限対策）
 * - クラウドVOICEVOX → サーバーTTS → ブラウザ標準読み上げ の順に自動フォールバック
 * - 再生が始まらない（ストリームが詰まる）場合も一定時間で次の手段へ切り替える
 * - 自動再生がブロックされた場合は needsTap=true を返し、タップで再生できるようにする
 */
export function useSpeechPlayback({
  text,
  enabled,
  blocked = false,
  preferredSrc,
  revealTimeoutMs = 1500,
  stallTimeoutMs = 5000,
}: UseSpeechPlaybackOptions) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [needsTap, setNeedsTap] = useState(false);
  const [replayToken, setReplayToken] = useState(0);

  const preferredSrcRef = useRef(preferredSrc);
  preferredSrcRef.current = preferredSrc;

  const sessionRef = useRef(0);
  const cleanupRef = useRef<(() => void) | null>(null);

  const stop = useCallback(() => {
    sessionRef.current += 1;
    const audio = getSharedAudio();
    if (audio) {
      audio.onplay = null;
      audio.onplaying = null;
      audio.oncanplay = null;
      audio.onended = null;
      audio.onerror = null;
      try {
        audio.pause();
      } catch {}
    }
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    setIsSpeaking(false);
    setIsPreparing(false);
  }, []);

  /** もう一度読み上げる（タップ操作から呼ぶことで iOS でも確実に再生できる） */
  const replay = useCallback(() => {
    unlockAudioOnUserAction();
    setNeedsTap(false);
    setReplayToken((t) => t + 1);
  }, []);

  useEffect(() => {
    const spoken = normalizeTtsText(text);
    if (!spoken || blocked || !enabled || isTestEnv()) {
      stop();
      return;
    }

    stop();
    const session = sessionRef.current;
    const alive = () => sessionRef.current === session;

    setNeedsTap(false);
    setIsPreparing(true);

    const revealTimer = setTimeout(() => {
      if (alive()) setIsPreparing(false);
    }, revealTimeoutMs);
    const reveal = () => {
      clearTimeout(revealTimer);
      if (alive()) setIsPreparing(false);
    };

    const speakWithBrowser = () => {
      reveal();
      if (!alive() || typeof window === "undefined" || !("speechSynthesis" in window)) return;
      try {
        const synth = window.speechSynthesis;
        synth.cancel();
        const u = new SpeechSynthesisUtterance(spoken);
        u.lang = "ja-JP";
        u.rate = 1.0;
        u.pitch = 1.05;
        const jaVoice = synth.getVoices().find((v) => v.lang?.toLowerCase().startsWith("ja"));
        if (jaVoice) u.voice = jaVoice;
        u.onstart = () => alive() && setIsSpeaking(true);
        u.onend = () => alive() && setIsSpeaking(false);
        u.onerror = () => alive() && setIsSpeaking(false);
        synth.speak(u);
      } catch {}
    };

    const playSource = (source: TtsPlayableAudio, onFail: () => void) => {
      const audio = getSharedAudio();
      if (!audio || !alive()) {
        source.cleanup?.();
        return;
      }
      if (cleanupRef.current) cleanupRef.current();
      cleanupRef.current = source.cleanup ?? null;

      let started = false;
      let finished = false;

      const detach = () => {
        audio.onplay = null;
        audio.onplaying = null;
        audio.oncanplay = null;
        audio.onended = null;
        audio.onerror = null;
      };

      const fail = () => {
        if (finished || !alive()) return;
        finished = true;
        clearTimeout(stallTimer);
        detach();
        try {
          audio.pause();
        } catch {}
        onFail();
      };

      const stallTimer = setTimeout(() => {
        if (!started) fail();
      }, stallTimeoutMs);

      audio.oncanplay = reveal;
      audio.onplay = reveal;
      audio.onplaying = () => {
        started = true;
        clearTimeout(stallTimer);
        reveal();
        if (alive()) setIsSpeaking(true);
      };
      audio.onended = () => {
        finished = true;
        clearTimeout(stallTimer);
        detach();
        if (alive()) setIsSpeaking(false);
        if (cleanupRef.current) {
          cleanupRef.current();
          cleanupRef.current = null;
        }
      };
      audio.onerror = () => {
        if (!started) {
          fail();
        } else if (alive()) {
          setIsSpeaking(false);
        }
      };

      try {
        audio.src = source.src;
        const p = audio.play();
        if (p !== undefined) {
          p.catch((err: any) => {
            if (!alive() || err?.name === "AbortError") return;
            if (err?.name === "NotAllowedError") {
              // 自動再生がブロックされた → 他の手段も同様にブロックされるため、タップを促す
              finished = true;
              clearTimeout(stallTimer);
              detach();
              reveal();
              setNeedsTap(true);
              return;
            }
            fail();
          });
        }
      } catch {
        fail();
      }
    };

    const voice = getSavedTtsVoice();

    const tryServerThenBrowser = async () => {
      if (!alive()) return;
      try {
        const serverSource = await fetchServerTts(spoken, voice);
        if (!alive()) {
          serverSource.cleanup?.();
          return;
        }
        playSource(serverSource, speakWithBrowser);
      } catch {
        speakWithBrowser();
      }
    };

    (async () => {
      try {
        const pre = preferredSrcRef.current;
        const source: TtsPlayableAudio = pre
          ? { src: pre, engine: "VOICEVOX (Cloud)" }
          : await fetchPlayableTts(spoken, voice);
        if (!alive()) {
          source.cleanup?.();
          return;
        }
        // クラウドのストリーミングURL等で失敗したらサーバーTTSへ、サーバー由来ならブラウザ読み上げへ
        const isFromServer = source.src.startsWith("blob:") && source.engine !== "VOICEVOX";
        playSource(source, isFromServer ? speakWithBrowser : tryServerThenBrowser);
      } catch {
        // fetchPlayableTts はサーバーTTSまで失敗した場合のみ throw する
        speakWithBrowser();
      }
    })();

    return () => {
      clearTimeout(revealTimer);
      stop();
    };
    // preferredSrc は意図的に依存に含めない（後から届いても再生をやり直さない）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, enabled, blocked, replayToken, stop, revealTimeoutMs, stallTimeoutMs]);

  return { isSpeaking, isPreparing, needsTap, stop, replay };
}
