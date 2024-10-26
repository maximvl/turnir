import { Box, Button, Slider } from '@mui/material'
import useChatVoting from '../../../hooks/useChatVoting'
import { isEmpty } from 'lodash'
import { useContext, useEffect, useState } from 'react'
import { Item, MusicType } from 'pages/turnir/types'
import PollResults from '../ViewerChoice/PollResults'
import VotesLog from '../ViewerChoice/VotesLog'
import InfoPanel from '../shared/InfoPanel'
import { MusicContext } from 'common/hooks/MusicContext'
import { PollVote } from 'pages/turnir/api'

type Props = {
  items: Item[]
  onItemElimination: (id: string) => void
}

type State = 'voting' | 'streamer_choice' | 'show_results'

const voteFormatter = (
  vote: PollVote,
  formattedTime: string,
  optionName: string
) => {
  return `${formattedTime}: ${vote.username} голосует ${vote.message} (${optionName})`
}

export default function ClosestVotesRound({ items, onItemElimination }: Props) {
  const {
    setState: setVotingState,
    votesMap,
    voteMessages,
    error,
    isLoading,
  } = useChatVoting({ items })
  const { setMusicPlaying } = useContext(MusicContext)

  const [state, setState] = useState<State>('voting')
  const [disabledStop, setDisabledStop] = useState(true)

  const [time, setTime] = useState(() => 0)

  useEffect(() => {
    if (time >= 15 && disabledStop) {
      setDisabledStop(false)
    }
  }, [time, disabledStop])

  const [targetNumber, setTargetNumber] = useState<number>(0)

  useEffect(() => {
    setTargetNumber(0)
    setTime(0)
    setVotingState('voting')
    setState('voting')
    setMusicPlaying(MusicType.RickRoll)
    setDisabledStop(true)

    const interval = setInterval(() => {
      setTime((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length])
  // console.log("target:", targetNumber)

  if (error) {
    return <div>Ошибка: {error.toString()}</div>
  }

  if (isEmpty(votesMap) && isLoading) {
    return <div>Загрузка...</div>
  }

  const votesByOption: { [key: string]: number } = {}
  for (const vote of Object.values(votesMap)) {
    if (vote in votesByOption) {
      votesByOption[vote] += 1
    } else {
      votesByOption[vote] = 1
    }
  }

  const maxVotes = Math.max(...Object.values(votesByOption))
  const minVotes = Math.min(...Object.values(votesByOption))

  const onVotingStop = () => {
    setVotingState('finished')
    setState('streamer_choice')
  }

  const onShowResults = () => {
    setState('show_results')
  }

  return (
    <div>
      {state === 'voting' && (
        <>
          <Button
            variant="contained"
            color="error"
            onClick={onVotingStop}
            disabled={disabledStop}
          >
            Закончить {disabledStop && ` (блокировка на ${15 - time} секунд)`}
          </Button>
          <PollResults
            items={items}
            votes={Object.values(votesMap)}
            onItemElimination={() => {}}
            hideResults
            time={time}
          />
          <Box marginTop={2}>
            <VotesLog
              items={items}
              votes={voteMessages}
              isFinished={false}
              logFormatter={voteFormatter}
              hideVotes
            />
          </Box>
        </>
      )}
      {state === 'streamer_choice' && (
        <>
          <div style={{ display: 'grid', justifyContent: 'center' }}>
            <InfoPanel>
              <p>Стример пытается угадать сколько глосов за разные варианты</p>
              <h3>Будет удален вариант с наиболее близким числом голосов</h3>
            </InfoPanel>
          </div>
          <Box
            display="flex"
            justifyContent="center"
            sx={{ margin: 2, marginTop: 4 }}
          >
            <Slider
              sx={{ width: '60%' }}
              aria-label="Количество голосов"
              valueLabelDisplay="on"
              value={targetNumber}
              min={0}
              max={maxVotes}
              step={1}
              onChange={(_event, value) => setTargetNumber(value as number)}
            />
          </Box>

          <Button
            variant="contained"
            color="success"
            sx={{ margin: 2 }}
            onClick={onShowResults}
          >
            Показать голоса
          </Button>
        </>
      )}
      {state === 'show_results' && (
        <>
          <div style={{ display: 'grid', justifyContent: 'center' }}>
            <InfoPanel>
              <p>Стример пытается угадать сколько голосов за разные варианты</p>
              <h3>Будет удален вариант с наиболее близким числом голосов</h3>
            </InfoPanel>
          </div>
          <Box
            display="flex"
            justifyContent="center"
            sx={{ margin: 2, marginTop: 5 }}
          >
            <Slider
              disabled
              sx={{ width: '60%' }}
              aria-label="Количество голосов"
              valueLabelDisplay="on"
              value={targetNumber}
              min={minVotes}
              max={maxVotes}
              step={1}
              // onChange={(_event, value) => setTargetNumber(value as number)}
            />
          </Box>
          <PollResults
            items={items}
            votes={Object.values(votesMap)}
            onItemElimination={onItemElimination}
            showInfo={false}
            winnerCheck={(votes: number) =>
              1000 - Math.abs(votes - targetNumber)
            }
          />
        </>
      )}
    </div>
  )
}
