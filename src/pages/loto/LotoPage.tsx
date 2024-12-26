import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Tooltip,
} from '@mui/material'
import { MusicContext } from '@/common/hooks/MusicContext'
import MainMenu from '@/common/MainMenu'
import { sample, uniq, uniqBy } from 'lodash'
import { ChatMessage, ChatUser, VkMention } from '@/pages/turnir/api'
import InfoPanel from '@/pages/turnir/components/rounds/shared/InfoPanel'
import { MusicType } from '@/pages/turnir/types'
import { useContext, useEffect, useRef, useState } from 'react'
import bingo1 from '@/assets/bingo1.gif'
import bingo2 from '@/assets/bingo2.gif'
import bingo3 from '@/assets/bingo3.webp'
import bingo4 from '@/assets/bingo4.webp'
import './styles.css'
import TicketBox from './TicketBox'
import { Ticket2 as Ticket, Ticket2, TicketId } from './types'
import ChatBox from './ChatBox'
import { genTicket, isUserSubscriber, NumberToFancyName } from './utils'
import DrawnNumber from './DrawnNumber'
import useChatMessages from '@/common/hooks/useChatMessages'

const CHAT_BOT_NAME = 'ChatBot'
const LOTO_MATCH = 'лото'

// numbers from 01 to 99
let DrawingNumbers: string[] = []
function resetDrawingNumbers() {
  DrawingNumbers = Array.from({ length: 99 }, (_, i) =>
    (i + 1).toString().padStart(2, '0')
  )
}
resetDrawingNumbers()

const BingoImage = sample([bingo1, bingo2, bingo3, bingo4])

export default function LotoPage() {
  const [state, setState] = useState<
    'voting' | 'playing' | 'win' | 'super_game'
  >('voting')
  const [ticketsFromChat, setTicketsFromChat] = useState<Ticket[]>([])
  const [ticketsFromPoints, setTicketsFromPoints] = useState<Ticket[]>([])

  const [superGameGuesses, setSuperGameGuesses] = useState<string[]>([])
  const [superGameDraws, setSuperGameDraws] = useState<string[]>([])

  const [allUsersById, setAllUsersById] = useState<{ [key: string]: ChatUser }>(
    {}
  )

  const [drawnNumbers, setDrawnNumbers] = useState<string[]>([])

  const [nextNumber, setNextNumber] = useState<string>('')
  const [nextDigitState, setNextDigitState] = useState<
    'idle' | 'roll_start' | 'rolling'
  >('idle')

  const [winnerMessages, setWinnerMessages] = useState<ChatMessage[]>([])
  const nextNumberRef = useRef(nextNumber)

  const [showWinnerChat, setShowWinnerChat] = useState(false)

  const [enableChatTickets, setEnableChatTickets] = useState(true)
  const [enablePointsTickets, setEnablePointsTickets] = useState(true)
  const [onlySubscribers, setOnlySubscribers] = useState(false)

  const music = useContext(MusicContext)

  const startMusic = () => {
    if (!music.musicPlaying) {
      music.setMusicPlaying(MusicType.Loto)
    }
  }

  const participatingUserIds = Object.values(allUsersById)
    .filter((user) => {
      if (onlySubscribers) {
        return isUserSubscriber(user)
      }
      return true
    })
    .map((user) => user.id)

  const { newMessages: chatMessages } = useChatMessages({
    fetching: state === 'voting' || state === 'win',
  })

  if (state === 'voting' && chatMessages.length > 0) {
    const messagesUsers = uniqBy(
      chatMessages.map((msg) => msg.user),
      (user) => user.id
    )
    if (messagesUsers.length > 0) {
      const newUsersById = messagesUsers.reduce(
        (acc, user) => {
          if (!allUsersById[user.id]) {
            acc[user.id] = user
          }
          return acc
        },
        {} as { [key: string]: ChatUser }
      )
      if (Object.keys(newUsersById).length > 0) {
        setAllUsersById((prev) => ({ ...prev, ...newUsersById }))
      }
    }

    const lotoMessages = chatMessages.filter((msg) =>
      msg.message.toLowerCase().includes(LOTO_MATCH)
    )

    if (lotoMessages.length > 0) {
      const lotoMessagesFromUsers = lotoMessages
        .filter((msg) => msg.user.username !== CHAT_BOT_NAME)
        .map((msg) => {
          return {
            user_id: msg.user.id,
            username: msg.user.username,
            text: msg.message,
          }
        })

      const newTicketsFromChat = getNewTickets(
        ticketsFromChat,
        lotoMessagesFromUsers,
        'chat'
      )
      if (newTicketsFromChat.length > 0) {
        setTicketsFromChat([...newTicketsFromChat, ...ticketsFromChat])
      }

      const lotoMessagesFromBotRaw = lotoMessages.filter(
        (msg) =>
          msg.user.username === CHAT_BOT_NAME &&
          msg.vk_fields &&
          msg.vk_fields.mentions.length > 0
      )

      const lotoMessagesFromBot = lotoMessagesFromBotRaw.map((msg) => {
        const mention = msg.vk_fields?.mentions[0] as VkMention
        return { user_id: `${mention.id}`, username: mention.displayName }
      })

      const newTicketsFromPoints = getNewTickets(
        ticketsFromPoints,
        lotoMessagesFromBot,
        'points'
      )
      if (newTicketsFromPoints.length > 0) {
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
        if (state === 'playing') {
          setDrawnNumbers((prev) => [...prev, nextNumberRef.current])
        }
        if (state === 'super_game') {
          setSuperGameDraws((prev) => [...prev, nextNumberRef.current])
        }
      }, 3000)
    }
  }, [nextDigitState, nextNumber, state])

  let totalTickets: Ticket[] = []
  if (enableChatTickets) {
    totalTickets = [...totalTickets, ...ticketsFromChat]
  }
  if (enablePointsTickets) {
    totalTickets = [...totalTickets, ...ticketsFromPoints]
  }

  totalTickets = totalTickets.filter((ticket) =>
    participatingUserIds.includes(ticket.owner_id)
  )

  useEffect(() => {
    document.title = `Лото - ${totalTickets.length} участников`
  }, [totalTickets.length])

  let matchesPerTicket: { [id: TicketId]: number[] } = {}
  for (const ticket of totalTickets) {
    matchesPerTicket[ticket.id] = []
  }

  if (drawnNumbers.length > 0) {
    // for each ticket find matches with drawn numbers
    for (const ticket of totalTickets) {
      const matches = ticket.value.map((number) =>
        drawnNumbers.includes(number) ? 1 : 0
      )
      matchesPerTicket[ticket.id] = matches
    }
  }

  const consequentMatchesPerTicket = totalTickets.map((ticket) => {
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
  const orderedTickets = [...totalTickets].sort((a, b) => {
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

  const winners = ['win', 'super_game'].includes(state)
    ? ticketsWithHighestMatches
    : []

  if (state === 'win' && chatMessages.length > 0 && winners.length > 0) {
    const messagesFromWinners = chatMessages.filter((msg) =>
      winners.some((w) => msg.user.id === w.owner_id)
    )
    if (messagesFromWinners.length > 0) {
      const currentMessagesIds = winnerMessages.map((m) => m.id)
      const newMessages = messagesFromWinners.filter(
        (m) => !currentMessagesIds.includes(m.id)
      )
      if (newMessages.length > 0) {
        setWinnerMessages([...winnerMessages, ...newMessages])

        const superGameMessages = newMessages.filter(
          (msg) =>
            msg.message.toLowerCase().startsWith('+супер') &&
            msg.message.match(/(\d{1,2}\s){4}\d{1,2}/)
        )

        if (superGameMessages.length > 0) {
          const trimmed = superGameMessages[0].message.trim()
          const superGameGuesses = uniq(
            trimmed
              .split(' ')
              .map((n) => parseInt(n))
              .filter((n) => n > 0 && n < 100)
              .map((n) => {
                if (n < 10) {
                  return `0${n}`
                }
                return n.toString()
              })
          )

          const limitedGuess = superGameGuesses.slice(0, 5)

          setState('super_game')
          setSuperGameGuesses(limitedGuess)
          resetDrawingNumbers()
          setNextNumber('')
          // scroll to the top smoothly
          window.scrollTo({
            top: 0,
            behavior: 'smooth',
          })
        }
      }
    }
  }

  let superGameMatches: number[] = []
  let superGameTicket: Ticket2 | null = null
  let superGameMatchesCount = 0
  if (state === 'super_game') {
    superGameTicket = {
      ...winners[0],
      value: superGameGuesses,
    }
    superGameMatches = superGameTicket.value.map((number) =>
      superGameDraws.includes(number) ? 1 : 0
    )
    superGameMatchesCount = superGameMatches.reduce((acc, val) => acc + val, 0)
  }

  const super_game_finished =
    state === 'super_game' && superGameDraws.length === 10

  const nextNumberText = NumberToFancyName[nextNumber]

  return (
    <Box onClick={startMusic} className="loto-page">
      <MainMenu title={'Лото 2.0 с чатом'} />
      <Box
        display="flex"
        justifyContent={'center'}
        paddingLeft={'100px'}
        paddingRight={'100px'}
      >
        <Box marginBottom={'200px'} width={'100%'}>
          {state === 'voting' && (
            <>
              <Box position="absolute">
                <FormGroup>
                  <FormControlLabel
                    label="Билеты с чата"
                    control={
                      <Checkbox
                        checked={enableChatTickets}
                        onChange={() => setEnableChatTickets((val) => !val)}
                        color="primary"
                      />
                    }
                  />
                  <Tooltip title="Пока только для ВК">
                    <FormControlLabel
                      label="Билеты с поинтов"
                      control={
                        <Checkbox
                          checked={enablePointsTickets}
                          onChange={() => setEnablePointsTickets((val) => !val)}
                          color="primary"
                        />
                      }
                    />
                  </Tooltip>
                  <Tooltip title="Пока только для ВК">
                    <FormControlLabel
                      label="Только для САБОВ"
                      control={
                        <Checkbox
                          checked={onlySubscribers}
                          onChange={() => setOnlySubscribers((val) => !val)}
                          color="primary"
                        />
                      }
                    />
                  </Tooltip>
                </FormGroup>
              </Box>
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
                  <p>
                    Можно писать свои числа:{' '}
                    <strong>+лото 4 8 15 23 42 14 89</strong>
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
                Участники: {totalTickets.length}
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
                <Box display={'flex'} justifyContent={'center'}>
                  <Box
                    display={'flex'}
                    justifyContent={'center'}
                    textAlign={'center'}
                    width={'900px'}
                    flexWrap={'wrap'}
                  >
                    {drawnNumbers.map((value, index) => {
                      return (
                        <Box marginLeft={'5px'} marginRight={'5px'} key={index}>
                          <DrawnNumber value={value} />
                        </Box>
                      )
                    })}
                  </Box>
                </Box>
              </Box>
              <Box textAlign={'center'}>
                {(state === 'playing' || state === 'win') && (
                  <Box>
                    <Box
                      marginTop={'10px'}
                      fontSize={'48px'}
                      display={'flex'}
                      alignItems={'center'}
                      justifyContent={'center'}
                      textAlign={'center'}
                    >
                      {nextNumber.length > 0 && (
                        <DrawnNumber value={nextNumber} big />
                      )}
                      {nextNumber.length === 0 && (
                        <Box marginTop={'40px'}></Box>
                      )}
                    </Box>
                    {nextNumberText && nextDigitState === 'idle' && (
                      <Box fontSize={'18px'}>{nextNumberText}</Box>
                    )}
                  </Box>
                )}
                {state === 'playing' && (
                  <>
                    <Box marginBottom={'40px'} marginTop={'20px'}>
                      <Button
                        variant="contained"
                        onClick={() => setNextDigitState('roll_start')}
                        disabled={nextDigitState !== 'idle'}
                      >
                        Следующее число
                      </Button>
                    </Box>
                  </>
                )}
                {state === 'win' && (
                  <Box marginTop={'10px'}>
                    <img src={BingoImage} alt="bingo" width={'200px'} />
                    <Box
                      textAlign="center"
                      display="flex"
                      justifyContent="center"
                    >
                      <InfoPanel>
                        <h2>
                          Чтобы сыграть в СУПЕР-ИГРУ напиши в чат
                          <br />
                          +супер {'<пять чисел через пробел>'}
                          <br />
                          Например: +супер 31 4 76 38 95
                        </h2>
                      </InfoPanel>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {state === 'super_game' && superGameTicket && (
            <Box display="flex" justifyContent="center">
              <Box>
                <Box
                  textAlign={'center'}
                  display="flex"
                  justifyContent="center"
                >
                  <InfoPanel>
                    Угадай любое 5 чисел
                    <br /> И получи супер-приз!
                  </InfoPanel>
                </Box>
                <Box
                  fontSize={'48px'}
                  marginBottom={'20px'}
                  textAlign={'center'}
                >
                  Супер Игра с {superGameTicket.owner_name}
                </Box>
                <Box
                  display={'flex'}
                  justifyContent={'center'}
                  textAlign={'center'}
                  width={'900px'}
                  flexWrap={'wrap'}
                >
                  {superGameDraws.map((value, index) => {
                    return (
                      <Box marginLeft={'5px'} marginRight={'5px'} key={index}>
                        <DrawnNumber value={value} />
                      </Box>
                    )
                  })}
                </Box>
                <Box marginBottom={'30px'}>
                  <Box
                    marginTop={'10px'}
                    fontSize={'48px'}
                    display={'flex'}
                    alignItems={'center'}
                    justifyContent={'center'}
                    textAlign={'center'}
                  >
                    {nextNumber.length > 0 && (
                      <DrawnNumber value={nextNumber} big />
                    )}
                    {nextNumber.length === 0 && <Box marginTop={'40px'}></Box>}
                  </Box>
                  {nextNumberText && nextDigitState === 'idle' && (
                    <Box fontSize={'18px'} textAlign={'center'}>
                      {nextNumberText}
                    </Box>
                  )}
                </Box>
                {!super_game_finished && (
                  <Box
                    marginBottom={'40px'}
                    marginTop={'20px'}
                    textAlign={'center'}
                  >
                    <Button
                      variant="contained"
                      onClick={() => setNextDigitState('roll_start')}
                      disabled={nextDigitState !== 'idle'}
                    >
                      Следующее число
                    </Button>
                  </Box>
                )}
                {super_game_finished && (
                  <Box
                    marginBottom={'40px'}
                    marginTop={'20px'}
                    textAlign={'center'}
                    fontSize={'32px'}
                  >
                    {superGameMatchesCount > 0 ? (
                      <Box>
                        {superGameTicket.owner_name} угадывает{' '}
                        {superGameMatchesCount}!
                      </Box>
                    ) : (
                      <Box>{superGameTicket.owner_name} проигрывает!</Box>
                    )}
                  </Box>
                )}
                <Box
                  marginBottom={'200px'}
                  display={'flex'}
                  justifyContent={'center'}
                >
                  <TicketBox
                    ticket={superGameTicket}
                    matches={superGameMatches}
                    owner={allUsersById[superGameTicket.owner_id]}
                  />
                </Box>
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
                    owner={allUsersById[ticket.owner_id]}
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

type UserInfo = {
  user_id: string
  username: string
  text?: string
}

function getNewTickets(
  currentTickets: Ticket[],
  newMessages: UserInfo[],
  source: 'chat' | 'points'
) {
  const currentOwners = currentTickets.map((ticket) => `${ticket.owner_id}`)

  let newOwners: UserInfo[] = newMessages.filter(
    (owner) => !currentOwners.includes(owner.user_id)
  )
  newOwners = uniqBy(newOwners, (owner) => owner.user_id)

  if (newOwners.length > 0) {
    const newOwnersTickets = newOwners.map((owner) =>
      genTicket({
        owner_id: owner.user_id,
        owner_name: owner.username,
        drawOptions: DrawingNumbers,
        source,
        text: owner.text,
      })
    )

    const newOwnersTicketsFiltered = newOwnersTickets.filter(
      (ticket) => ticket.value !== null
    ) as Ticket[]

    return newOwnersTicketsFiltered
  }
  return []
}
