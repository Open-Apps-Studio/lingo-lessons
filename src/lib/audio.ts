import {
  createAudioPlayer,
  setAudioModeAsync,
  useAudioPlayer,
  type AudioPlayer,
} from "expo-audio";
import * as Speech from "expo-speech";

import { audioManifest } from "../content/audio-manifest";
import { getPack } from "./content";

setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});

const TTS_LOCALES: Record<string, string> = {
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
  it: "it-IT",
  pt: "pt-BR",
  ja: "ja-JP",
  ko: "ko-KR",
  zh: "zh-CN",
};

let voicePlayer: AudioPlayer | null = null;

export function speakTarget(courseId: string, text: string) {
  Speech.stop();
  const key = `${courseId}:${text}`;
  const source = audioManifest[key];
  if (source) {
    if (!voicePlayer) voicePlayer = createAudioPlayer(source);
    else voicePlayer.replace(source);
    voicePlayer.seekTo(0);
    voicePlayer.play();
    return;
  }
  const pack = getPack(courseId);
  const locale = TTS_LOCALES[pack.targetCode] ?? "en-US";
  Speech.speak(text, { language: locale, rate: 0.9 });
}

export function useSfx() {
  const correct = useAudioPlayer(require("@/assets/sfx/correct.wav"));
  const incorrect = useAudioPlayer(require("@/assets/sfx/incorrect.wav"));
  const finish = useAudioPlayer(require("@/assets/sfx/finish.mp3"));

  const play = (player: ReturnType<typeof useAudioPlayer>) => {
    player.seekTo(0);
    player.play();
  };

  return {
    playCorrect: () => play(correct),
    playIncorrect: () => play(incorrect),
    playFinish: () => play(finish),
  };
}
