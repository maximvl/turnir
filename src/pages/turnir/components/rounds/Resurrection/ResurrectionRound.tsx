import { Item, MusicType } from 'pages/turnir/types'
import InfoPanel from '../shared/InfoPanel'
import Wheel from '../shared/Wheel'
import { Box, Button } from '@mui/material'
import Icon from '@mdi/react'
import { mdiCross } from '@mdi/js'
import { useContext, useEffect, useState } from 'react'
import PrayImage from 'images/pray.webp'
import ResurrectionVoting from './ResurrectionVoting'
import { MusicContext } from 'common/hooks/MusicContext'

type Props = {
  activeItems: Item[]
  eliminatedItems: Item[]
  onItemResurrection: (id: string, eliminationId?: string) => void
}

type State = 'initial' | 'random' | 'voting'

export default function ResurrectionRound({
  activeItems,
  eliminatedItems,
  onItemResurrection,
}: Props) {
  const [state, setState] = useState<State>('initial')
  const { setMusicPlaying } = useContext(MusicContext)

  useEffect(() => {
    setState('initial')
    setMusicPlaying(MusicType.Raphael)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeItems.length])

  return (
    <>
      {state === 'initial' && (
        <Box style={{ justifyContent: 'center' }}>
          <Box style={{ display: 'flex', justifyContent: 'center' }}>
            <InfoPanel>
              <p>Выбери вариант воскрешения</p>
            </InfoPanel>
          </Box>
          <Box marginTop={2}>
            <Button
              variant="contained"
              color="success"
              onClick={() => setState('random')}
            >
              Случайное
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => setState('voting')}
              sx={{ marginLeft: 2 }}
            >
              Выбор чата (скрытое голосование)
            </Button>
          </Box>
        </Box>
      )}
      {state === 'random' && (
        <Box>
          <Wheel
            items={eliminatedItems}
            onItemWinning={onItemResurrection}
            ButtonComponent={ResurrectButton}
            centerImage={PrayImage}
            music={MusicType.Nightsong}
          />
        </Box>
      )}
      {state === 'voting' && (
        <Box>
          <ResurrectionVoting
            items={eliminatedItems}
            onItemElimination={(id) => onItemResurrection(id)}
          />
        </Box>
      )}
    </>
  )
}

const ResurrectButton = ({
  children,
  ...props
}: React.ComponentProps<typeof Button>): React.ReactElement => {
  return (
    <Button {...props} color="success">
      Воскресить{' '}
      <Icon
        path={mdiCross}
        style={{ width: 24, height: 24, marginLeft: 10 }}
        color="white"
      />
    </Button>
  )
}
