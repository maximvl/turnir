import { Box } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { Item, MusicType } from 'pages/turnir/types'
import PollResults from './PollResults'
import { ChatMessage } from 'pages/turnir/api'
import VotesLog from './VotesLog'
import { isEmpty } from 'lodash'
import useChatVoting from '../../../hooks/useChatVoting'
import { MusicContext } from 'common/hooks/MusicContext'

type Props = {
  items: Item[]
  onItemElimination: (index: string) => void
  logFormatter?: (
    vote: ChatMessage,
    formattedTime: string,
    optionTitle: string
  ) => string
  subscriberOnly: boolean
}

export default function ViewerChoiceRound({
  items,
  onItemElimination,
  logFormatter,
  subscriberOnly,
}: Props) {
  const { votesMap, voteMessages, state, setState, error, isLoading } =
    useChatVoting({ items, subscriberOnly })

  const { setMusicPlaying } = useContext(MusicContext)

  useEffect(() => {
    setMusicPlaying(MusicType.RickRoll)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length])

  useEffect(() => {
    if (state === 'initial') {
      setState('voting')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  const [time, setTime] = useState(() => 0)
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(time + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [time])

  if (error) {
    return <div>Ошибка: {error.toString()}</div>
  }

  if (isEmpty(votesMap) && isLoading) {
    return <div>Загрузка...</div>
  }

  return (
    <Box
      display="inline-block"
      alignItems="center"
      style={{ paddingLeft: 16, width: '100%' }}
    >
      <PollResults
        items={items}
        votes={Object.values(votesMap)}
        onItemElimination={onItemElimination}
        time={time}
      />
      <Box marginTop={2}>
        <VotesLog
          votes={voteMessages}
          items={items}
          logFormatter={logFormatter}
          isFinished={state === 'finished'}
        />
      </Box>
    </Box>
  )
}
