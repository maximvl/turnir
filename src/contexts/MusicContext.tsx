import { isNil } from "lodash";
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

export default function MusicContextProvider({ children }: { children: React.ReactNode }) {
  const [musicPlaying, setMusicPlaying] = useState<MusicType | undefined>(undefined);

  const [isMuted, setIsMuted] = useState(false);

  const volumeKey = "volume";
  const getStoredVolume = () => {
    const storedVolume = localStorage.getItem(volumeKey);
    if (!isNil(storedVolume)) {
      return parseFloat(storedVolume) || 1;
    }
    return 1;
  };

  const [volume, setVolume] = useState(getStoredVolume());
  const [playPromise, setPlayPromise] = useState<Promise<void> | null>(null);

  const musicMap: { [key: string]: HTMLAudioElement | null } = {};
  for (const key in MusicTypeIds) {
    musicMap[key] = document.getElementById(MusicTypeIds[key as MusicType]) as HTMLAudioElement | null;
  }

  const startMusic = async (music?: MusicType) => {
    if (musicPlaying) {
      const currentMusic = musicMap[musicPlaying];
      if (currentMusic && playPromise) {
        playPromise.then(() => {
          currentMusic.pause();
          currentMusic.currentTime = 0;
        });
      }
    }
    setMusicPlaying(music);
    if (music) {
      const newMusic = musicMap[music];
      if (newMusic) {
        setPlayPromise(newMusic.play());
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
    localStorage.setItem(volumeKey, newVolume.toString());
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
