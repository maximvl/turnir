import { isNil } from 'lodash'
import { createContext, useEffect, useState } from 'react'
import { MusicType, MusicTypeIds } from 'pages/turnir/types'

export type MusicContextType = {
  musicPlaying?: MusicType
  setMusicPlaying: (music?: MusicType) => void
  isMuted: boolean
  setIsMuted: (isMuted: boolean) => void
  volume: number
  setVolume: (volume: number) => void
}

export const MusicContext = createContext<MusicContextType>({
  musicPlaying: undefined,
  setMusicPlaying: (music?: MusicType) => {},
  isMuted: false,
  setIsMuted: (muted: boolean) => {},
  volume: 1,
  setVolume: (volume: number) => {},
})

const MusicMap: { [key: string]: HTMLAudioElement | null } = {}
for (const key in MusicTypeIds) {
  MusicMap[key] = document.getElementById(
    MusicTypeIds[key as MusicType]
  ) as HTMLAudioElement | null
}

export default function MusicContextProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [currentMusic, setCurrentMusic] = useState<MusicType | undefined>(
    undefined
  )
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    if (!currentMusic) {
      return
    }
    const music = MusicMap[currentMusic]
    if (!music) {
      return
    }
    if (isPlaying) {
      music.currentTime = 0
      music.play()
    } else {
      music.pause()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMusic, isPlaying])

  const volumeKey = 'volume'
  const getStoredVolume = () => {
    const storedVolume = localStorage.getItem(volumeKey)
    if (!isNil(storedVolume)) {
      return parseFloat(storedVolume) || 1
    }
    return 1
  }

  const [volume, setVolume] = useState(getStoredVolume())
  useEffect(() => {
    for (const music of Object.values(MusicMap)) {
      if (music) {
        music.volume = volume
      }
    }
  }, [volume])

  const startMusic = (music?: MusicType) => {
    if (currentMusic) {
      const current = MusicMap[currentMusic]
      if (current && !current.paused) {
        if (music === currentMusic) {
          current.currentTime = 0
        } else {
          current.pause()
          current.currentTime = 0
        }
      }
    }
    setCurrentMusic(music)
    setIsPlaying(!!music)
  }

  const updateMuted = (muted: boolean) => {
    setIsMuted(muted)
    for (const music of Object.values(MusicMap)) {
      if (music) {
        music.muted = muted
      }
    }
  }

  const updateVolume = (newVolume: number) => {
    setVolume(newVolume)
    localStorage.setItem(volumeKey, newVolume.toString())
  }

  return (
    <MusicContext.Provider
      value={{
        musicPlaying: currentMusic,
        setMusicPlaying: startMusic,
        isMuted,
        setIsMuted: updateMuted,
        volume,
        setVolume: updateVolume,
      }}
    >
      {children}
    </MusicContext.Provider>
  )
}
