import { Box, Button } from '@mui/material'
import { MusicContext } from 'common/hooks/MusicContext'
import MainMenu from 'common/MainMenu'
import { flatten, sample, uniq } from 'lodash'
import { fetchVotes, ChatMessage } from 'pages/turnir/api'
import InfoPanel from 'pages/turnir/components/rounds/shared/InfoPanel'
import { MusicType } from 'pages/turnir/types'
import { useContext, useEffect, useRef, useState } from 'react'
import bingo from 'images/bingo1.gif'
import { useQuery } from 'react-query'
import TicketBox from './TicketBox'
import { Ticket } from './types'
import ChatBox from './ChatBox'

const VOTES_REFETCH_INTERVAL = 2000

const DIGITS = '0123456789'.split('')

export default function LotoPage() {
  const [state, setState] = useState<'voting' | 'playing' | 'win'>('voting')
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [lastTs, setLastTs] = useState(() => Math.floor(Date.now() / 1000))
  const [filter, setFilter] = useState<string[]>([])
  const [nextDigit, setNextDigit] = useState<string>('-')
  const [nextDigitState, setNextDigitState] = useState<
    'idle' | 'roll_start' | 'rolling'
  >('idle')

  const [winnerMessages, setWinnerMessages] = useState<ChatMessage[]>([])

  const digitOptions = useRef(DIGITS)
  const nextDigitRef = useRef(nextDigit)

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
      (msg) => msg.message.toLowerCase() === '+лото'
    )
    if (filteredVotes.length > 0) {
      const lastVote =
        chatMessages.chat_messages[chatMessages.chat_messages.length - 1]
      const currentOwners = tickets.map((ticket) => ticket.owner)

      let newOwners: string[] = []
      newOwners = filteredVotes.map((vote) => vote.user.username)
      newOwners = newOwners.filter((owner) => !currentOwners.includes(owner))
      newOwners = uniq(newOwners)

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
        const optionsExcludingCurrent = digitOptions.current.filter(
          (digit) => digit !== nextDigitRef.current
        )
        const nextDigit = sample(optionsExcludingCurrent) as string
        setNextDigit(nextDigit)
        nextDigitRef.current = nextDigit
      }, 100)
      setTimeout(() => {
        clearInterval(interval)
        setNextDigitState('idle')
        setFilter((prev) => [...prev, nextDigitRef.current])
      }, 3000)
    }
  }, [nextDigitState, nextDigit])

  const filterText = filter.join('')

  let filteredTickets = tickets
  let matchesPerTicket: { [k: string]: number[] } = {}
  for (const ticket of tickets) {
    matchesPerTicket[ticket.owner] = []
  }

  if (filterText.length > 0) {
    // check that each ticket contains digets in any order withour repeats
    filteredTickets = tickets.filter((ticket) => {
      const match = getMatches(ticket.value.split(''), filter)
      matchesPerTicket[ticket.owner] = match
      const matchesAmount = match.filter((m) => m === 1).length
      return matchesAmount === filter.length
    })
  }

  useEffect(() => {
    if (filteredTickets.length === 1 && state === 'playing') {
      setState('win')
    }
  }, [filteredTickets.length, state])

  const winner = filteredTickets[0]

  if (
    state === 'win' &&
    chatMessages?.chat_messages &&
    chatMessages.chat_messages.length > 0 &&
    winner
  ) {
    const messagesByWinner = chatMessages.chat_messages.filter(
      (vote) => vote.user.username === winner.owner
    )
    if (messagesByWinner.length > 0) {
      const currentMessagesIds = winnerMessages.map((m) => m.id)
      const newMessages = messagesByWinner.filter(
        (m) => !currentMessagesIds.includes(m.id)
      )
      if (newMessages.length > 0) {
        setWinnerMessages([...winnerMessages, ...newMessages])
        setLastTs(messagesByWinner[messagesByWinner.length - 1].ts)
      }
    }
  }

  const ticketsDigits = filteredTickets.map((ticket) => {
    const match = matchesPerTicket[ticket.owner]
    if (match.length === 0) {
      return ticket.value.split('')
    }
    const unmatchedDigits = ticket.value
      .split('')
      .filter((_, i) => match[i] === 0)
    return unmatchedDigits
  })
  const filteredOptions = uniq(flatten(ticketsDigits))
  digitOptions.current = filteredOptions

  const displayValue =
    nextDigitState === 'rolling' ? filterText + nextDigit : filterText

  return (
    <Box onClick={startMusic}>
      <MainMenu title={'Лото с чатом'} />
      <Box
        display="flex"
        justifyContent={'center'}
        paddingLeft={'100px'}
        paddingRight={'100px'}
      >
        <Box>
          {state === 'voting' && (
            <>
              <Box display={'flex'} justifyContent={'center'}>
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
                marginTop={'40px'}
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
            <Box marginTop={'40px'}>
              <Box display="flex" alignItems="center" justifyContent={'center'}>
                <span style={{ fontSize: '24px' }}>Выигрышная комбинация:</span>
                <span
                  style={{
                    fontSize: '48px',
                    marginLeft: '20px',
                    fontFamily: 'monospace',
                  }}
                >
                  {fillWithDashes(displayValue)}
                </span>
              </Box>
              <Box textAlign={'center'}>
                {state === 'playing' && (
                  <Box marginBottom={'60px'}>
                    <Button
                      variant="outlined"
                      onClick={() => setNextDigitState('roll_start')}
                      disabled={
                        filterText.length === 5 || nextDigitState !== 'idle'
                      }
                    >
                      Следующая цифра
                    </Button>
                  </Box>
                )}
                {state === 'win' && (
                  <Box>
                    <img src={bingo} alt="bingo" width={'200px'} />
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {state !== 'win' && (
            <Box display={'flex'} flexWrap={'wrap'} justifyContent={'center'}>
              {filteredTickets.map((ticket, i) => {
                return (
                  <Box key={i} marginTop={'20px'} marginRight={'20px'}>
                    <TicketBox
                      ticket={ticket}
                      matches={matchesPerTicket[ticket.owner]}
                    />
                  </Box>
                )
              })}
            </Box>
          )}
          {state === 'win' && winner && (
            <>
              <Box display={'flex'} justifyContent={'center'}>
                <TicketBox
                  ticket={winner}
                  matches={matchesPerTicket[winner.owner]}
                />
              </Box>
              <Box
                display={'flex'}
                justifyContent={'center'}
                marginTop={'20px'}
              >
                <ChatBox
                  username={winner.owner}
                  messages={winnerMessages.map((m) => m.message)}
                />
              </Box>
            </>
          )}
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

// const unique5DigitCombinations = generateUnique5DigitCombinations()

// function generateTicket() {
//   return sample(unique5DigitCombinations)
// }

// function generateTicket() {
//   // returns random number of 5 digits
//   const d1 = sample(DIGITS)
//   const d2 = sample(DIGITS)
//   const d3 = sample(DIGITS)
//   const d4 = sample(DIGITS)
//   const d5 = sample(DIGITS)
//   return `${d1}${d2}${d3}${d4}${d5}`
// }

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

// function generateUnique5DigitCombinations(): string[] {
//   const results: string[] = []
//   const digits = Array.from({ length: 10 }, (_, i) => i.toString())

//   function backtrack(start: number, current: string[]) {
//     if (current.length === 5) {
//       results.push(current.join(''))
//       return
//     }

//     for (let i = start; i < digits.length; i++) {
//       current.push(digits[i])
//       backtrack(i + 1, current) // move to the next digit to avoid repetition
//       current.pop() // backtrack
//     }
//   }

//   backtrack(0, [])
//   return results
// }

// function generateUnique5DigitCombinationsWithRepetition(): string[] {
//   const results: Set<string> = new Set()
//   const digits = Array.from({ length: 10 }, (_, i) => i.toString())

//   function backtrack(current: string[], start: number) {
//     if (current.length === 5) {
//       results.add(current.sort().join('')) // Sort to ensure uniqueness
//       return
//     }

//     for (let i = start; i < digits.length; i++) {
//       current.push(digits[i])
//       backtrack(current, i) // Allow current digit to be reused
//       current.pop() // backtrack
//     }
//   }

//   backtrack([], 0)
//   return Array.from(results)
// }

function generateUnique5DigitCombinationsWithLimitedRepetitions(): string[] {
  const results: Set<string> = new Set()
  const digits = Array.from({ length: 10 }, (_, i) => i.toString())

  function backtrack(
    current: string[],
    start: number,
    digitCount: Record<string, number>
  ) {
    if (current.length === 5) {
      results.add(current.slice().sort().join('')) // Sort to ensure uniqueness
      return
    }

    for (let i = start; i < digits.length; i++) {
      const digit = digits[i]
      if ((digitCount[digit] || 0) < 2) {
        // Check if the digit can still be added
        current.push(digit)
        digitCount[digit] = (digitCount[digit] || 0) + 1

        backtrack(current, i, digitCount)

        // Backtrack
        current.pop()
        digitCount[digit] -= 1
      }
    }
  }

  backtrack([], 0, {})
  return Array.from(results)
}

const ticketCombinations =
  generateUnique5DigitCombinationsWithLimitedRepetitions()
// console.log(ticketCombinations)

function generateTicket() {
  if (ticketCombinations.length > 0) {
    const ticket = sample(ticketCombinations) as string
    ticketCombinations.splice(ticketCombinations.indexOf(ticket), 1)
    return ticket
  }
  return null
}
