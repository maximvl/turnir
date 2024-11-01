import { Box, Button } from '@mui/material'
import { MusicContext } from 'common/hooks/MusicContext'
import MainMenu from 'common/MainMenu'
import { sample, sampleSize, uniqBy } from 'lodash'
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
import { Ticket2 as Ticket, TicketId } from './types'
import ChatBox from './ChatBox'
import { genTicket, NumberToFancyName } from './utils'

const VOTES_REFETCH_INTERVAL = 2000

const CHAT_BOT_NAME = 'ChatBot'
const LOTO_MATCH = 'лото'

// numbers from 01 to 99
const DrawingNumbers = Array.from({ length: 99 }, (_, i) =>
  (i + 1).toString().padStart(2, '0')
)

const BingoImage = sample([bingo1, bingo2, bingo3, bingo4])

export default function LotoPage() {
  const [state, setState] = useState<'voting' | 'playing' | 'win'>('voting')
  const [ticketsFromChat, setTicketsFromChat] = useState<Ticket[]>([])
  const [ticketsFromPoints, setTicketsFromPoints] = useState<Ticket[]>([])
  const [lastTs, setLastTs] = useState(() => Math.floor(Date.now() / 1000))

  const [drawnNumbers, setDrawnNumbers] = useState<string[]>([])

  const [nextNumber, setNextNumber] = useState<string>('')
  const [nextDigitState, setNextDigitState] = useState<
    'idle' | 'roll_start' | 'rolling'
  >('idle')

  const [winnerMessages, setWinnerMessages] = useState<ChatMessage[]>([])
  const nextNumberRef = useRef(nextNumber)

  const [showWinnerChat, setShowWinnerChat] = useState(false)

  const music = useContext(MusicContext)

  const startMusic = () => {
    if (!music.musicPlaying) {
      music.setMusicPlaying(MusicType.Loto)
    }
  }

  const { data: chatMessages } = useQuery(
    ['loto', 0, lastTs],
    ({ queryKey }) => {
      if (state === 'voting') {
        return fetchVotes({ ts: queryKey[2] as number, textFilter: LOTO_MATCH })
      }
      return fetchVotes({ ts: queryKey[2] as number })
    },
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
    const lotoMessages = chatMessages.chat_messages.filter((msg) =>
      msg.message.toLowerCase().includes(LOTO_MATCH)
    )
    if (lotoMessages.length > 0) {
      const lastMsg =
        chatMessages.chat_messages[chatMessages.chat_messages.length - 1]

      const lotoMessagesFromUsers = lotoMessages.filter(
        (msg) => msg.user.username !== CHAT_BOT_NAME
      )
      const newTicketsFromChat = getNewTickets(
        ticketsFromChat,
        lotoMessagesFromUsers
      )
      if (newTicketsFromChat.length > 0) {
        setLastTs(lastMsg.ts)
        setTicketsFromChat([...newTicketsFromChat, ...ticketsFromChat])
      }

      const lotoMessagesFromBotRow = lotoMessages.filter(
        (msg) =>
          msg.user.username === CHAT_BOT_NAME &&
          msg.vk_fields &&
          msg.vk_fields.mentions.length > 0
      )
      const lotoMessagesFromBot = lotoMessagesFromBotRow.map((msg) => {
        msg.user.username = msg.vk_fields?.mentions[0].displayName as string
        msg.user.id = msg.vk_fields?.mentions[0].id as number
        return msg
      })

      const newTicketsFromPoints = getNewTickets(
        ticketsFromPoints,
        lotoMessagesFromBot
      )
      if (newTicketsFromPoints.length > 0) {
        setLastTs(lastMsg.ts)
        setTicketsFromPoints([...newTicketsFromPoints, ...ticketsFromPoints])
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

  useEffect(() => {
    document.title = `Лото - ${ticketsFromChat.length} участников`
  }, [ticketsFromChat.length])

  let matchesPerTicket: { [id: TicketId]: number[] } = {}
  for (const ticket of ticketsFromChat) {
    matchesPerTicket[ticket.id] = []
  }

  if (drawnNumbers.length > 0) {
    // for each ticket find matches with drawn numbers
    for (const ticket of ticketsFromChat) {
      const matches = ticket.value.map((number) =>
        drawnNumbers.includes(number) ? 1 : 0
      )
      matchesPerTicket[ticket.id] = matches
    }
  }

  const consequentMatchesPerTicket = ticketsFromChat.map((ticket) => {
    const matches = matchesPerTicket[ticket.id]
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
    return { id: ticket.id, matches: maxConsequentMatches }
  })

  const consequentMatchesMap = consequentMatchesPerTicket.reduce(
    (acc, val) => {
      acc[val.id] = val.matches
      return acc
    },
    {} as { [id: string]: number }
  )

  // order tickets by consequent matches then by total matches
  const orderedTickets = [...ticketsFromChat].sort((a, b) => {
    const aMatches = consequentMatchesMap[a.id]
    const bMatches = consequentMatchesMap[b.id]
    if (aMatches === bMatches) {
      return (
        b.value.filter((n) => drawnNumbers.includes(n)).length -
        a.value.filter((n) => drawnNumbers.includes(n)).length
      )
    }
    return bMatches - aMatches
  })

  const highestMatches =
    orderedTickets.length > 0 ? consequentMatchesMap[orderedTickets[0].id] : 0
  const ticketsWithHighestMatches = orderedTickets.filter(
    (ticket) => consequentMatchesMap[ticket.id] === highestMatches
  )

  useEffect(() => {
    if (highestMatches >= 3 && state === 'playing') {
      setState('win')
    }
  }, [highestMatches, state])

  useEffect(() => {
    if (state === 'win') {
      setShowWinnerChat((val) => !val)
    }
  }, [state])

  const winners = state === 'win' ? ticketsWithHighestMatches : []

  if (
    state === 'win' &&
    chatMessages?.chat_messages &&
    chatMessages.chat_messages.length > 0 &&
    winners.length > 0
  ) {
    const messagesFromWinners = chatMessages.chat_messages.filter((msg) =>
      winners.some((w) => msg.user.id === w.owner.id)
    )
    if (messagesFromWinners.length > 0) {
      const currentMessagesIds = winnerMessages.map((m) => m.id)
      const newMessages = messagesFromWinners.filter(
        (m) => !currentMessagesIds.includes(m.id)
      )
      if (newMessages.length > 0) {
        setWinnerMessages([...winnerMessages, ...newMessages])
        setLastTs(messagesFromWinners[messagesFromWinners.length - 1].ts)
      }
    }
  }

  const drawnNumbersText = drawnNumbers.join(' ')
  const nextNumberText = NumberToFancyName[nextNumber]

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
                Участники: {ticketsFromChat.length}
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
                    {nextNumber.length === 0 && nextDigitState === 'idle' && (
                      <Box marginTop={'40px'}></Box>
                    )}
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
                    matches={matchesPerTicket[ticket.id]}
                    isWinner={isWinner}
                  />
                  {isWinner && (
                    <>
                      <Button
                        onClick={() => setShowWinnerChat(!showWinnerChat)}
                      >
                        Показать чат
                      </Button>
                      {showWinnerChat && <ChatBox messages={winnerMessages} />}
                    </>
                  )}
                </Box>
              )
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

function drawNumber(next: string) {
  DrawingNumbers.splice(DrawingNumbers.indexOf(next), 1)
  // console.log('DrawingNumbers', DrawingNumbers)
  return next
}

// Как сделать отображение новых наград публичными/приватными?
// Нужно ввести в чате своего канала соответствующую команду:
// Сделать отображения публичными: /rewardalert public
// Сделать отображения приватными: /rewardalert private

function getNewTickets(currentTickets: Ticket[], newMessages: ChatMessage[]) {
  const currentOwners = currentTickets.map((ticket) => ticket.owner.id)

  let newOwners: ChatUser[] = []
  newOwners = newMessages.map((msg) => msg.user)
  newOwners = newOwners.filter((owner) => !currentOwners.includes(owner.id))
  newOwners = uniqBy(newOwners, (owner) => owner.id)

  if (newOwners.length > 0) {
    const newOwnersTickets = newOwners.map((owner) =>
      genTicket({ owner, drawOptions: DrawingNumbers })
    )

    const newOwnersTicketsFiltered = newOwnersTickets.filter(
      (ticket) => ticket.value !== null
    ) as Ticket[]

    return newOwnersTicketsFiltered
  }
  return []
}
