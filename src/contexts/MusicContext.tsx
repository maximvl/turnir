import { createContext, useState } from "react";
import { MusicType, MusicTypeIds } from "../types";

export type MusicContextType = {
  musicPlaying?: MusicType;
  setMusicPlaying: (music?: MusicType) => void;
  isMuted: boolean;
  setIsMuted: (isMuted: boolean) => void;
  volume: number;
  setVolume: (volume: number) => void;
};

export const MusicContext = createContext<MusicContextType>({
  musicPlaying: undefined,
  setMusicPlaying: (_1?: MusicType) => {},
  isMuted: false,
  setIsMuted: (_1: boolean) => {},
  volume: 1,
  setVolume: (_1: number) => {},
});

export default function MusicContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [musicPlaying, setMusicPlaying] = useState<MusicType | undefined>(
    undefined,
  );

  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);

  const wheelMusic = document.getElementById(
    MusicTypeIds[MusicType.Wheel],
  ) as HTMLAudioElement | null;

  const victoryMusic = document.getElementById(
    MusicTypeIds[MusicType.Victory],
  ) as HTMLAudioElement | null;

  const thinkingMusic = document.getElementById(
    MusicTypeIds[MusicType.Thinking],
  ) as HTMLAudioElement | null;

  const rickRollMusic = document.getElementById(
    MusicTypeIds[MusicType.RickRoll],
  ) as HTMLAudioElement | null;

  const wrongAnswerMusic = document.getElementById(
    MusicTypeIds[MusicType.WrongAnswer],
  ) as HTMLAudioElement | null;

  const musicMap = {
    [MusicType.Wheel]: wheelMusic,
    [MusicType.Victory]: victoryMusic,
    [MusicType.Thinking]: thinkingMusic,
    [MusicType.RickRoll]: rickRollMusic,
    [MusicType.WrongAnswer]: wrongAnswerMusic,
  };

  const startMusic = (music?: MusicType) => {
    if (musicPlaying) {
      const currentMusic = musicMap[musicPlaying];
      if (currentMusic) {
        currentMusic.pause();
        currentMusic.currentTime = 0;
      }
    }
    setMusicPlaying(music);
    if (music) {
      const newMusic = musicMap[music];
      if (newMusic) {
        newMusic.play();
      }
    }
  };

  const updateMuted = (muted: boolean) => {
    setIsMuted(muted);
    for (const music of Object.values(musicMap)) {
      if (music) {
        music.muted = muted;
      }
    }
  };

  const updateVolume = (newVolume: number) => {
    setVolume(newVolume);
    for (const music of Object.values(musicMap)) {
      if (music) {
        music.volume = newVolume;
      }
    }
  };

  return (
    <MusicContext.Provider
      value={{
        musicPlaying,
        setMusicPlaying: startMusic,
        isMuted,
        setIsMuted: updateMuted,
        volume,
        setVolume: updateVolume,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
}
