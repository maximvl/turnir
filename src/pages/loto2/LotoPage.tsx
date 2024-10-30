import { Box, Button } from '@mui/material'
import { MusicContext } from 'common/hooks/MusicContext'
import MainMenu from 'common/MainMenu'
import { capitalize, sample, sampleSize, uniq, uniqBy } from 'lodash'
import { fetchVotes, ChatMessage, ChatUser } from 'pages/turnir/api'
import InfoPanel from 'pages/turnir/components/rounds/shared/InfoPanel'
import { MusicType } from 'pages/turnir/types'
import { useContext, useEffect, useRef, useState } from 'react'
import bingo1 from 'images/bingo1.gif'
import bingo2 from 'images/bingo2.gif'
import bingo3 from 'images/bingo3.webp'
import bingo4 from 'images/bingo4.webp'
import { useQuery } from 'react-query'
import TicketBox from './TicketBox'
import { Ticket2 as Ticket } from './types'
import ChatBox from './ChatBox'
import { NumberToFancyName } from './utils'

const VOTES_REFETCH_INTERVAL = 2000

// numbers from 01 to 99
const DrawingNumbers = Array.from({ length: 99 }, (_, i) =>
  (i + 1).toString().padStart(2, '0')
)

const BingoImage = sample([bingo1, bingo2, bingo3, bingo4])

export default function LotoPage() {
  const [state, setState] = useState<'voting' | 'playing' | 'win'>('voting')
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [lastTs, setLastTs] = useState(() => Math.floor(Date.now() / 1000))

  // const [filter, setFilter] = useState<string[]>([])
  const [drawnNumbers, setDrawnNumbers] = useState<string[]>([])

  const [nextNumber, setNextNumber] = useState<string>('00')
  const [nextDigitState, setNextDigitState] = useState<
    'idle' | 'roll_start' | 'rolling'
  >('idle')

  const [winnerMessages, setWinnerMessages] = useState<ChatMessage[]>([])
  const nextNumberRef = useRef(nextNumber)

  const music = useContext(MusicContext)

  const startMusic = () => {
    if (!music.musicPlaying) {
      music.setMusicPlaying(MusicType.Loto)
    }
  }

  const { data: chatMessages } = useQuery(
    ['loto', 0, lastTs],
    (args) => fetchVotes(args),
    {
      refetchInterval: VOTES_REFETCH_INTERVAL,
      enabled: state === 'voting' || state === 'win',
    }
  )

  if (
    state === 'voting' &&
    chatMessages?.chat_messages &&
    chatMessages.chat_messages.length > 0
  ) {
    const filteredVotes = chatMessages.chat_messages.filter(
      (vote) => vote.message.toLowerCase() === '+лото'
    )
    if (filteredVotes.length > 0) {
      const lastVote =
        chatMessages.chat_messages[chatMessages.chat_messages.length - 1]

      const currentOwners = tickets.map((ticket) => ticket.owner.id)

      let newOwners: ChatUser[] = []
      newOwners = filteredVotes.map((vote) => vote.user)
      newOwners = newOwners.filter((owner) => !currentOwners.includes(owner.id))
      newOwners = uniqBy(newOwners, (owner) => owner.id)

      if (newOwners.length > 0) {
        setLastTs(lastVote.ts)
        const newOwnersTickets = newOwners.map((owner) => ({
          owner,
          value: generateTicket(),
          color: sample([
            '#634f5f', // dark red
            '#654b3c', // brown
            '#4a4857', // greyish
            '#0c5159', // dark green
          ]),
          variant: sample([1, 2, 3, 4]),
        }))

        const newOwnersTicketsFiltered = newOwnersTickets.filter(
          (ticket) => ticket.value !== null
        ) as Ticket[]

        if (newOwnersTicketsFiltered.length > 0) {
          setTickets([...newOwnersTicketsFiltered, ...tickets])
        }
      }
    }
  }

  useEffect(() => {
    if (nextDigitState === 'roll_start') {
      setNextDigitState('rolling')
      const interval = setInterval(() => {
        const nextNumber = sample(DrawingNumbers) as string
        setNextNumber(nextNumber)
        nextNumberRef.current = nextNumber
      }, 100)
      setTimeout(() => {
        clearInterval(interval)
        setNextDigitState('idle')
        drawNumber(nextNumberRef.current)
        setDrawnNumbers((prev) => [...prev, nextNumberRef.current])
      }, 3000)
    }
  }, [nextDigitState, nextNumber])

  let matchesPerTicket: { [owner: string]: number[] } = {}
  for (const ticket of tickets) {
    matchesPerTicket[ticket.owner.id] = []
  }

  if (drawnNumbers.length > 0) {
    // for each ticket find matches with drawn numbers
    for (const ticket of tickets) {
      const matches = ticket.value.map((number) =>
        drawnNumbers.includes(number) ? 1 : 0
      )
      matchesPerTicket[ticket.owner.id] = matches
    }
  }

  const consequentMatchesPerTicket = tickets.map((ticket) => {
    const matches = matchesPerTicket[ticket.owner.id]
    let maxConsequentMatches = 0
    let currentConsequentMatches = 0
    for (const match of matches) {
      if (match === 1) {
        currentConsequentMatches++
        if (currentConsequentMatches > maxConsequentMatches) {
          maxConsequentMatches = currentConsequentMatches
        }
      } else {
        currentConsequentMatches = 0
      }
    }
    return { owner: ticket.owner, matches: maxConsequentMatches }
  })

  const consequentMatchesMap = consequentMatchesPerTicket.reduce(
    (acc, val) => {
      acc[val.owner.id] = val.matches
      return acc
    },
    {} as { [owner: string]: number }
  )

  // order tickets by consequent matches then by total matches
  const orderedTickets = [...tickets].sort((a, b) => {
    const aMatches = consequentMatchesMap[a.owner.id]
    const bMatches = consequentMatchesMap[b.owner.id]
    if (aMatches === bMatches) {
      return (
        b.value.filter((n) => drawnNumbers.includes(n)).length -
        a.value.filter((n) => drawnNumbers.includes(n)).length
      )
    }
    return bMatches - aMatches
  })

  const highestMatches =
    orderedTickets.length > 0
      ? consequentMatchesMap[orderedTickets[0].owner.id]
      : 0
  const ticketsWithHighestMatches = orderedTickets.filter(
    (ticket) => consequentMatchesMap[ticket.owner.id] === highestMatches
  )

  useEffect(() => {
    if (highestMatches >= 3 && state === 'playing') {
      setState('win')
    }
  }, [highestMatches, state])

  const winners = state === 'win' ? ticketsWithHighestMatches : []

  // if (
  //   state === 'win' &&
  //   chatMessages?.poll_votes &&
  //   chatMessages.poll_votes.length > 0 &&
  //   winner
  // ) {
  //   const messagesByWinner = chatMessages.poll_votes.filter(
  //     (vote) => vote.username === winner.owner
  //   )
  //   if (messagesByWinner.length > 0) {
  //     const currentMessagesIds = winnerMessages.map((m) => m.id)
  //     const newMessages = messagesByWinner.filter(
  //       (m) => !currentMessagesIds.includes(m.id)
  //     )
  //     if (newMessages.length > 0) {
  //       setWinnerMessages([...winnerMessages, ...newMessages])
  //       setLastTs(messagesByWinner[messagesByWinner.length - 1].ts)
  //     }
  //   }
  // }

  const drawnNumbersText = drawnNumbers.join(' ')
  const nextNumberText = NumberToFancyName[nextNumber]

  const displayValue =
    nextDigitState === 'rolling'
      ? drawnNumbersText + ` ${nextNumber}`
      : drawnNumbersText

  return (
    <Box onClick={startMusic}>
      <MainMenu title={'Лото 2.0 с чатом'} />
      <Box
        display="flex"
        justifyContent={'center'}
        paddingLeft={'100px'}
        paddingRight={'100px'}
      >
        <Box marginBottom={'200px'}>
          {state === 'voting' && (
            <>
              <Box
                display={'flex'}
                justifyContent={'center'}
                marginBottom={'20px'}
              >
                <InfoPanel>
                  {!music.musicPlaying && <p>Кликни чтобы запустить музыку</p>}
                  <p>
                    Пишите в чат <strong>+лото</strong> чтобы получить билет
                  </p>
                </InfoPanel>
              </Box>

              <Box
                fontSize={'32px'}
                textAlign={'center'}
                display={'flex'}
                alignItems={'center'}
                justifyContent={'center'}
                // marginTop={'40px'}
                marginBottom={'20px'}
              >
                Участники: {tickets.length}
                <Button
                  variant="contained"
                  color="primary"
                  style={{ marginLeft: '30px' }}
                  onClick={() => setState('playing')}
                >
                  Розыгрыш
                </Button>
              </Box>
            </>
          )}

          {['playing', 'win'].includes(state) && (
            <Box>
              <Box>
                <Box display={'flex'} justifyContent={'center'}>
                  <InfoPanel>
                    <p>Побеждает тот кто соберет 3 или больше чисел в ряд</p>
                  </InfoPanel>
                </Box>
                {/* <span style={{ fontSize: '24px' }}>Номера:</span> */}
                <Box
                  display={'flex'}
                  justifyContent={'center'}
                  textAlign={'center'}
                >
                  <span
                    style={{
                      fontSize: '32px',
                      marginLeft: '20px',
                      fontFamily: 'monospace',
                      width: '900px',
                    }}
                  >
                    {drawnNumbersText}
                  </span>
                </Box>
              </Box>
              <Box textAlign={'center'}>
                {(state === 'playing' || state === 'win') && (
                  <Box
                    fontSize={'48px'}
                    alignItems={'center'}
                    justifyContent={'center'}
                    textAlign={'center'}
                  >
                    <span>{nextNumber}</span>
                    {nextNumberText && nextDigitState === 'idle' && (
                      <Box fontSize={'18px'}>{nextNumberText}</Box>
                    )}
                  </Box>
                )}
                {state === 'playing' && (
                  <>
                    <Box marginBottom={'40px'} marginTop={'20px'}>
                      <Button
                        variant="outlined"
                        onClick={() => setNextDigitState('roll_start')}
                        disabled={nextDigitState !== 'idle'}
                      >
                        Следующее число
                      </Button>
                    </Box>
                  </>
                )}
                {state === 'win' && (
                  <Box>
                    <img src={BingoImage} alt="bingo" width={'200px'} />
                  </Box>
                )}
              </Box>
            </Box>
          )}

          <Box display={'flex'} flexWrap={'wrap'} justifyContent={'center'}>
            {orderedTickets.map((ticket, i) => {
              const isWinner = winners.includes(ticket)
              return (
                <Box key={i} marginTop={'20px'} marginRight={'20px'}>
                  <TicketBox
                    ticket={ticket}
                    matches={matchesPerTicket[ticket.owner.id]}
                    isWinner={isWinner}
                  />
                </Box>
              )
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

function fillWithDashes(value: string) {
  const maxSize = 5
  if (value.length > maxSize) {
    return value
  }
  return value + '-'.repeat(maxSize - value.length)
}

function getMatches(value: string[], filter: string[]) {
  let matches: number[] = []
  const filterCopy = [...filter]
  for (const digit of value) {
    const index = filterCopy.indexOf(digit)
    if (index === -1) {
      matches.push(0)
      continue
    }
    matches.push(1)
    filterCopy.splice(index, 1)
  }
  return matches
}

function generateTicket() {
  return sampleSize(DrawingNumbers, 8)
}

function drawNumber(next: string) {
  DrawingNumbers.splice(DrawingNumbers.indexOf(next), 1)
  console.log('DrawingNumbers', DrawingNumbers)
  return next
}
