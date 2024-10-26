import { Box, Button } from '@mui/material'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Item } from 'pages/turnir/types'
import { PollVote } from 'pages/turnir/api'

type Props = {
  votes: PollVote[]
  items: Item[]
  logFormatter?: (
    vote: PollVote,
    formattedTime: string,
    optionName: string
  ) => string
  isFinished: boolean
  hideVotes?: boolean
}

const voteFormatter = (
  vote: PollVote,
  formattedTime: string,
  optionName: string
) => {
  return `${formattedTime}: ${vote.username} голосует против ${vote.message} (${optionName})`
}

export default function VotesLog({
  votes,
  items,
  logFormatter = voteFormatter,
  isFinished,
  hideVotes,
}: Props) {
  // console.log("votes", votes);
  const scrollableRef = useRef<HTMLDivElement>(null)
  const automaticScroll = useRef(true)
  const lastScrollTime = useRef<number>(new Date().getTime())
  const [showLogs, setShowLogs] = useState(!hideVotes)

  const scrollToBottom = () => {
    const scrollableElement = scrollableRef?.current
    if (scrollableElement) {
      scrollableElement.scrollTop = scrollableElement.scrollHeight
    }
  }

  useEffect(() => {
    const time = new Date().getTime()
    if (automaticScroll.current || time - lastScrollTime.current > 3000) {
      automaticScroll.current = true
      scrollToBottom()
    }
  }, [votes.length])

  useEffect(() => {
    if (isFinished) {
      scrollToBottom()
    }
  }, [isFinished])

  const onScroll = (event: React.UIEvent) => {
    const time = new Date().getTime()
    const timeDiff = time - lastScrollTime.current
    if (timeDiff < 1000) {
      automaticScroll.current = false
    }
    lastScrollTime.current = time
  }

  useLayoutEffect(() => {
    if (automaticScroll.current) {
      scrollToBottom()
    }
  }, [scrollableRef, votes.length, isFinished])

  const itemNameMap = items.reduce(
    (acc, item) => {
      acc[item.id] = item.title
      return acc
    },
    {} as Record<string, string>
  )

  const formatTime = (ts: number) => {
    const date = new Date(ts * 1000)
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const seconds = date.getSeconds()
    const pad = (num: number) => (num < 10 ? `0${num}` : num)
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  }

  return (
    <Box>
      Лог голосования
      <Button
        variant="outlined"
        onClick={() => setShowLogs(!showLogs)}
        sx={{ marginLeft: 2 }}
      >
        {showLogs ? 'Скрыть логи' : 'Показать логи'}
      </Button>
      {showLogs && (
        <Box
          sx={{
            border: '1px solid',
            m: 1,
            overflow: 'scroll',
            height: '300px',
          }}
          ref={scrollableRef}
          onScroll={onScroll}
        >
          {votes.map((vote, index) => (
            <Box
              textAlign={'left'}
              key={index}
              component="span"
              sx={{
                display: 'block',
                m: 1,
              }}
            >
              {logFormatter(
                vote,
                formatTime(vote.ts),
                itemNameMap[vote.message]
              )}
            </Box>
          ))}
          {isFinished && (
            <Box
              textAlign={'center'}
              component="span"
              sx={{ display: 'block', m: 1 }}
            >
              Голосование завершено
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}
