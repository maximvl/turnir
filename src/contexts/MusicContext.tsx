import { createContext, useState } from "react";
import { MusicType, MusicTypeIds } from "../types";

export type MusicContextType = {
  musicPlaying?: MusicType;
  setMusicPlaying: (music?: MusicType) => void;
  isMuted: boolean;
  setIsMuted: (isMuted: boolean) => void;
};

export const MusicContext = createContext<MusicContextType>({
  musicPlaying: undefined,
  setMusicPlaying: (_1?: MusicType) => {},
  isMuted: false,
  setIsMuted: (_1: boolean) => {},
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

  const musicMap = {
    [MusicType.Wheel]: wheelMusic,
    [MusicType.Victory]: victoryMusic,
    [MusicType.Thinking]: thinkingMusic,
    [MusicType.RickRoll]: rickRollMusic,
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

  const setMuted = (muted: boolean) => {
    setIsMuted(muted);
    if (musicPlaying) {
      const currentMusic = musicMap[musicPlaying];
      if (currentMusic) {
        currentMusic.muted = muted;
      }
    }
  };

  return (
    <MusicContext.Provider
      value={{
        musicPlaying,
        setMusicPlaying: startMusic,
        isMuted,
        setIsMuted: setMuted,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
}
