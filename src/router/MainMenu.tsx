import { VolumeOff, VolumeUp } from '@mui/icons-material'
import { Box, Button, Slider, Typography } from '@mui/material'
import ReleaseNotes from 'components/ReleaseNotes'
import { MusicContext } from 'contexts/MusicContext'
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
          <Button onClick={() => navigate('/turnir')} variant="text">
            Турнир
          </Button>
          <Button onClick={() => navigate('/voting')}>Голосование</Button>
        </Box>
        <Box display="flex">
          <Box display="flex" alignItems="flex-end" width="250px">
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
