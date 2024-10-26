import { Box } from '@mui/material'
import { MusicContext } from 'common/hooks/MusicContext'
import { useContext, useEffect } from 'react'
import { Item, MusicType } from 'pages/turnir/types'
import InfoPanel from '../shared/InfoPanel'
import ListChoice from '../shared/ListChoice'

type Props = {
  items: Item[]
  onItemSelect: (itemId: string) => void
}

export default function DealRound({ items, onItemSelect }: Props) {
  const { setMusicPlaying } = useContext(MusicContext)
  useEffect(() => {
    setMusicPlaying(MusicType.Light)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length])

  const round = Math.round(items.length / 2)
  return (
    <Box>
      <Box display="flex" justifyContent="center">
        <InfoPanel>
          <p>
            Выбери вариант, он пропускает половину турнира ({round} раундов)
            <br />
            Но ему придется ролить 50/50 чтобы вернуться в турнир
          </p>
        </InfoPanel>
      </Box>
      <Box marginTop={2}>
        <ListChoice items={items} onSelect={onItemSelect} />
      </Box>
    </Box>
  )
}
