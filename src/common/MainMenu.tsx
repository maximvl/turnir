import { VolumeOff, VolumeUp } from '@mui/icons-material'
import { Box, Button, Slider } from '@mui/material'
import ReleaseNotes from './ReleaseNotes'
import { MusicContext } from './hooks/MusicContext'
import { useContext } from 'react'
import { useNavigate } from 'react-router'
import { MusicType } from 'pages/turnir/types'

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

  return (
    <Box marginTop={'10px'}>
      <Box
        marginTop={'10px'}
        sx={{
          textAlign: 'left',
          float: 'left',
          position: 'absolute',
          paddingLeft: 6,
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <Box display="flex">
          <Button onClick={openTurnirPage}>Турнир</Button>
          <Button onClick={openVotingPage}>Голосование</Button>
          <Button onClick={openLotoPage}>Лото 2.0</Button>
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
