import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Slider,
  Tooltip,
} from '@mui/material'
import { MusicContext } from '@/common/hooks/MusicContext'
import MainMenu from '@/common/MainMenu'
import { flatten, sample, uniq, uniqBy } from 'lodash'
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
import { Ticket, TicketId } from './types'
import ChatBox from './ChatBox'
import {
  genTicket,
  isUserSubscriber,
  NumberToFancyName,
  formatSeconds,
  formatSecondsZero,
  generateSuperGameOptions,
  randomTicketColor,
} from './utils'
import DrawnNumber from './DrawnNumber'
import useChatMessages from '@/common/hooks/useChatMessages'
import useTimer from '@/common/hooks/useTimer'
import SuperGameBox from './SuperGameBox'

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

const SuperGameBaseDraws = 5
const SuperGameTicketLength = 5
const WinMatchAmount = 1

export default function LotoPage() {
  const [state, setState] = useState<
    'registration' | 'playing' | 'win' | 'super_game'
  >('registration')
  const [ticketsFromChat, setTicketsFromChat] = useState<Ticket[]>([])
  const [ticketsFromPoints, setTicketsFromPoints] = useState<Ticket[]>([])

  const [superGameTickets, setSuperGameTickets] = useState<Ticket[]>([])
  const [superGameOptions, setSuperGameOptions] = useState<string[]>([])
  const [superGameRevealedIds, setSuperGameRevealedIds] = useState<number[]>([])

  const [allUsersById, setAllUsersById] = useState<{ [key: string]: ChatUser }>(
    {}
  )

  const [hostSuperNumbers, setHostSuperNumbers] = useState<string[]>([])

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

  const { value: timerRef, setValue: setTimerValue } = useTimer(60 * 3)
  const [timerStatus, setTimerStatus] = useState<'off' | 'on'>('off')

  const timerValue = timerRef.current

  const startTimer = () => {
    setTimerStatus('on')
    const interval = setInterval(() => {
      if (timerRef.current === 0) {
        clearInterval(interval)
      } else {
        setTimerValue(timerRef.current - 1)
      }
    }, 1000)
  }

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
    fetching: state !== 'playing',
  })

  if (state === 'registration' && chatMessages.length > 0) {
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
        let nextNumber = nextNumberRef.current

        drawNumber(nextNumber)
        if (state === 'playing') {
          setDrawnNumbers((prev) => [...prev, nextNumber])
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
    if (highestMatches >= WinMatchAmount && state === 'playing') {
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

  // console.log('msgs', chatMessages, 'winners', winners)

  if (
    (state === 'win' || state === 'super_game') &&
    superGameRevealedIds.length === 0 &&
    chatMessages.length > 0 &&
    winners.length > 0
  ) {
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
          for (const msg of superGameMessages) {
            const trimmed = msg.message.trim()
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

            const limitedGuess = superGameGuesses.slice(
              0,
              SuperGameTicketLength
            )

            const superGameTicketsValues = superGameTickets.map((t) => t.value)
            const superGameCombinedOptions = uniq([
              ...flatten(superGameTicketsValues),
              ...limitedGuess,
            ])

            setSuperGameOptions(
              generateSuperGameOptions(superGameCombinedOptions, 30)
            )

            const ticket: Ticket = {
              id: msg.id,
              owner_id: msg.user.id,
              owner_name: msg.user.username,
              value: limitedGuess,
              color: randomTicketColor(),
              variant: 0,
              source: 'chat',
            }
            setSuperGameTickets((prev) => [...prev, ticket])
          }

          setState('super_game')

          // scroll to the top smoothly
          window.scrollTo({
            top: 0,
            behavior: 'smooth',
          })
        }
      }
    }
  }

  const handleCustomSuperNumbersClick = () => {
    const input =
      prompt('Скрой экран и введи до 10 чисел (1-99) через пробел') ?? ''
    const trimmed = input.trim().split(' ')
    const inputGuesses = uniq(
      trimmed
        .map((n) => parseInt(n))
        .filter((n) => n > 0 && n < 100)
        .map((n) => {
          if (n < 10) {
            return `0${n}`
          }
          return n.toString()
        })
    )
    setHostSuperNumbers(inputGuesses)
  }

  const superGameTicketStateMap: {
    [k: string]: { matchesIds: number[]; matches: number[] }
  } = {}

  let superGameRevealedMatchesIds: number[] = []

  if (state === 'super_game') {
    const revealedOptions = superGameRevealedIds.map((n) => superGameOptions[n])
    superGameTickets.forEach((ticket) => {
      const matchesIds = superGameRevealedIds.filter((n) =>
        ticket.value.includes(superGameOptions[n])
      )
      superGameRevealedMatchesIds = uniq([
        ...superGameRevealedMatchesIds,
        ...matchesIds,
      ])

      const matches = ticket.value.map((number) =>
        revealedOptions.includes(number) ? 1 : 0
      )

      superGameTicketStateMap[ticket.id] = {
        matches,
        matchesIds,
      }
    })
  }

  const superGameRevealedMatches = superGameRevealedMatchesIds.map(
    (n) => superGameOptions[n]
  )

  const superGameTotalMatchesCount = superGameRevealedMatchesIds.length

  const superGameDrawsAmount = superGameTotalMatchesCount + SuperGameBaseDraws
  const allSuperTicketsMatched = Object.values(superGameTicketStateMap).every(
    (val) => val.matchesIds.length === SuperGameTicketLength
  )

  const superGameFinished =
    state === 'super_game' &&
    (superGameRevealedIds.length === superGameDrawsAmount ||
      allSuperTicketsMatched)

  let nextNumberText = NumberToFancyName[nextNumber]

  const currentNumberMatchesAmount = totalTickets.filter((ticket) =>
    ticket.value.includes(nextNumber)
  ).length

  let lastRevealedOption: string | undefined = undefined
  let lastRevealedOptionMatched = false
  if (superGameRevealedIds.length > 0) {
    lastRevealedOption = superGameOptions[superGameRevealedIds.slice(-1)[0]]
    nextNumberText = NumberToFancyName[lastRevealedOption]
    lastRevealedOptionMatched = superGameTickets.some(
      (ticket) =>
        lastRevealedOption && ticket.value.includes(lastRevealedOption)
    )
  }

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
          {state === 'registration' && (
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
                <Slider
                  value={timerValue}
                  onChange={(_, value) => setTimerValue(value as number)}
                  aria-labelledby="discrete-slider"
                  valueLabelDisplay="auto"
                  valueLabelFormat={formatSeconds}
                  step={30}
                  marks
                  min={60}
                  max={400}
                />
                <Button
                  variant="contained"
                  onClick={startTimer}
                  disabled={timerStatus === 'on'}
                >
                  Запустить таймер
                </Button>
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
                // marginTop={'40px'}
                marginBottom={'20px'}
              >
                Билетов: {totalTickets.length}
                <Box
                  marginTop="15px"
                  display={'flex'}
                  alignItems={'center'}
                  justifyContent={'center'}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    style={{ marginLeft: '30px' }}
                    onClick={() => setState('playing')}
                    disabled={totalTickets.length === 0}
                  >
                    Начать розыгрыш{' '}
                    {timerStatus === 'on' &&
                      `(${formatSecondsZero(timerValue)})`}
                  </Button>
                  {hostSuperNumbers.length == 0 && (
                    <Button
                      color="warning"
                      variant="contained"
                      style={{ marginLeft: '20px' }}
                      onClick={handleCustomSuperNumbersClick}
                    >
                      Ввести числа супер игры
                    </Button>
                  )}
                </Box>
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
                    {nextDigitState === 'idle' && nextNumber && (
                      <Box marginTop="5px">
                        Билетов с числом: {currentNumberMatchesAmount}
                      </Box>
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
                        Достать бочонок
                      </Button>
                    </Box>
                  </>
                )}
                {state === 'win' && (
                  <Box marginTop={'10px'}>
                    <Box fontSize={'48px'}>
                      {winners.length > 1 ? 'Победители' : 'Победитель'}:{' '}
                      {winners.map((w) => w.owner_name).join(', ')}
                    </Box>
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

          {state === 'super_game' && superGameTickets.length > 0 && (
            <Box display="flex" justifyContent="center">
              <Box>
                <Box textAlign="center" display="flex" justifyContent="center">
                  <InfoPanel>
                    Ведущий открывает {SuperGameBaseDraws} чисел
                    <br /> И получи супер-приз!
                    <br />
                    Каждое угаданное число дает дополнительный ролл
                  </InfoPanel>
                </Box>
                <Box
                  fontSize={'48px'}
                  marginBottom={'20px'}
                  textAlign={'center'}
                >
                  Супер Игра с{' '}
                  {superGameTickets
                    .map((t) => allUsersById[t.owner_id].username)
                    .join(', ')}
                </Box>
                <Box display="flex" justifyContent="center">
                  <SuperGameBox
                    options={superGameOptions}
                    revealedOptionsIds={superGameRevealedIds}
                    onOptionClick={(id: number) => {
                      if (superGameRevealedIds.length < superGameDrawsAmount) {
                        setSuperGameRevealedIds((prev) => [...prev, id])
                      }
                    }}
                    matches={superGameRevealedMatchesIds}
                    revealAll={superGameFinished}
                  />
                </Box>
                <Box marginBottom={'30px'}>
                  <Box
                    marginTop={'20px'}
                    fontSize={'48px'}
                    display={'flex'}
                    alignItems={'center'}
                    justifyContent={'center'}
                    textAlign={'center'}
                  >
                    {lastRevealedOption ? (
                      <DrawnNumber
                        value={lastRevealedOption}
                        big
                        matchAnimation={superGameRevealedMatches.includes(
                          lastRevealedOption
                        )}
                      />
                    ) : (
                      <Box marginTop={'40px'}></Box>
                    )}
                  </Box>
                  {lastRevealedOption && (
                    <Box
                      fontSize={'18px'}
                      textAlign={'center'}
                      marginTop="10px"
                    >
                      {nextNumberText}
                    </Box>
                  )}
                </Box>
                {superGameFinished && (
                  <Box
                    marginBottom={'40px'}
                    marginTop={'20px'}
                    textAlign={'center'}
                    fontSize={'32px'}
                    justifyContent="center"
                    alignItems="center"
                  >
                    {superGameTickets.map((ticket) => {
                      const matchesCount =
                        superGameTicketStateMap[ticket.id].matchesIds.length

                      if (matchesCount > 0) {
                        return (
                          <Box
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                          >
                            <img
                              src="https://freepngimg.com/download/mouth/92712-ear-head-twitch-pogchamp-emote-free-download-png-hq.png"
                              style={{ width: '64px', marginRight: '15px' }}
                            />
                            {ticket.owner_name} угадывает {matchesCount}
                            <img
                              src="https://freepngimg.com/download/mouth/92712-ear-head-twitch-pogchamp-emote-free-download-png-hq.png"
                              style={{
                                width: '64px',
                                marginLeft: '15px',
                                transform: 'rotateY(180deg)',
                              }}
                            />
                          </Box>
                        )
                      }
                      return (
                        <Box
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                        >
                          <img
                            src="https://cdn.betterttv.net/emote/656c936c06a047dd60c2de5e/3x.webp"
                            style={{ width: '48px', marginRight: '15px' }}
                          />
                          {ticket.owner_name} проигрывает
                          <img
                            src="https://cdn.betterttv.net/emote/656c936c06a047dd60c2de5e/3x.webp"
                            style={{
                              width: '48px',
                              marginLeft: '15px',
                              transform: 'rotateY(180deg)',
                            }}
                          />
                        </Box>
                      )
                    })}
                  </Box>
                )}
                <Box
                  marginBottom={'200px'}
                  display={'flex'}
                  justifyContent={'center'}
                  gap="20px"
                >
                  {superGameTickets.map((ticket, i) => {
                    return (
                      <TicketBox
                        ticket={ticket}
                        matches={superGameTicketStateMap[ticket.id].matches}
                        owner={allUsersById[ticket.owner_id]}
                        big
                      />
                    )
                  })}
                </Box>
              </Box>
            </Box>
          )}

          <Box display={'flex'} flexWrap={'wrap'} justifyContent={'center'}>
            {orderedTickets.map((ticket, i) => {
              const isWinner = winners.includes(ticket)
              const chatMessages = winnerMessages.filter(
                (msg) => msg.user.id === ticket.owner_id
              )
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
                      {showWinnerChat && <ChatBox messages={chatMessages} />}
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
