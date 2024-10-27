import { VolumeOff, VolumeUp } from '@mui/icons-material'
import { Box, Button, Slider } from '@mui/material'
import ReleaseNotes from './ReleaseNotes'
import { MusicContext } from './hooks/MusicContext'
import { useContext } from 'react'
import { useNavigate } from 'react-router'

type Props = {
  title: string
}

export default function MainMenu({ title }: Props) {
  const navigate = useNavigate()
  const { isMuted, setIsMuted, volume, setVolume } = useContext(MusicContext)
  return (
    <Box>
      <Box
        sx={{
          textAlign: 'left',
          float: 'left',
          position: 'absolute',
          paddingLeft: 6,
          paddingTop: 3,
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <Box display="flex">
          <Button onClick={() => navigate('/turnir')}>Турнир</Button>
          <Button onClick={() => navigate('/voting')}>Голосование</Button>
          <Button onClick={() => navigate('/loto')}>Лото</Button>
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
        style={{
          fontWeight: 'bold',
          fontSize: '2em',
          margin: 20,
          textAlign: 'center',
        }}
      >
        <Box>{title}</Box>
      </Box>
    </Box>
  )
}
