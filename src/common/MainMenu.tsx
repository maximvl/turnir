import { VolumeOff, VolumeUp } from '@mui/icons-material'
import { Box, Button, Slider } from '@mui/material'
import ReleaseNotes from './ReleaseNotes'
import { MusicContext } from './hooks/MusicContext'
import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { MusicType } from '@/pages/turnir/types'
import ChatConnectionButton from './ChatConnectionButton'

type Props = {
  title: string
}

export default function MainMenu({ title }: Props) {
  const navigate = useNavigate()
  const { isMuted, setIsMuted, volume, setVolume } = useContext(MusicContext)

  const music = useContext(MusicContext)

  const openTurnirPage = () => {
    music.setMusicPlaying(undefined)
    navigate('/turnir')
  }

  const openVotingPage = () => {
    music.setMusicPlaying(undefined)
    navigate('/voting')
  }

  const openLotoPage = () => {
    music.setMusicPlaying(MusicType.Loto)
    navigate('/loto2')
  }

  const openChatOptionsPage = () => {
    music.setMusicPlaying(undefined)
    navigate('/chatOptions')
  }

  return (
    <Box paddingTop={'10px'}>
      <Box textAlign="center" marginBottom="10px">
        <Button onClick={openTurnirPage} sx={{ marginRight: '15px' }}>
          Турнир
        </Button>
        <Button onClick={openVotingPage} sx={{ marginRight: '15px' }}>
          Голосование
        </Button>
        <Button onClick={openLotoPage} sx={{ marginRight: '15px' }}>
          Лото 2.0
        </Button>
        <Button onClick={openChatOptionsPage}>Варианты чата [WIP]</Button>
      </Box>
      <Box
        marginTop={'10px'}
        sx={{
          textAlign: 'left',
          float: 'left',
          position: 'absolute',
          paddingLeft: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <Box display="flex">
          <ChatConnectionButton />
        </Box>
        <Box display="flex" marginRight={'30px'}>
          <Box display="flex" alignItems="flex-end" width="220px">
            <Button
              variant="outlined"
              onClick={() => setIsMuted(!isMuted)}
              sx={{ marginRight: 2 }}
            >
              {isMuted ? <VolumeOff /> : <VolumeUp />}
            </Button>
            <Slider
              aria-label="Volume"
              value={volume}
              min={0}
              max={1}
              step={0.01}
              onChange={(_evt, value) => {
                setVolume(value as number)
              }}
              sx={{ marginRight: 2 }}
            />
          </Box>
          <ReleaseNotes />
        </Box>
      </Box>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        marginBottom={'10px'}
        style={{
          fontWeight: 'bold',
          fontSize: '2em',
          textAlign: 'center',
        }}
      >
        <Box>{title}</Box>
      </Box>
    </Box>
  )
}
