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
import {
  ChatMessage,
  ChatUser,
  createLotoWinners,
  fetchLotoWinners,
  LotoWinnersCreate,
  LotoWinnerUpdate,
  updateLotoWinner,
  VkMention,
} from '@/pages/turnir/api'
import InfoPanel from '@/pages/turnir/components/rounds/shared/InfoPanel'
import { MusicType } from '@/pages/turnir/types'
import { useContext, useEffect, useRef, useState } from 'react'
import './styles.css'
import TicketBox from './TicketBox'
import { SuperGameGuess, SuperGameResultItem, Ticket, TicketId } from './types'
import ChatBox from './ChatBox'
import {
  genTicket,
  isUserSubscriber,
  NumberToFancyName,
  formatSeconds,
  formatSecondsZero,
  generateSuperGameValues,
  randomTicketColor,
  formatUnixToDate,
} from './utils'
import DrawnNumber from './DrawnNumber'
import useChatMessages from '@/common/hooks/useChatMessages'
import useTimer from '@/common/hooks/useTimer'
import SuperGameBox from './SuperGameBox'
import SuperGamePlayerStats from './SuperGamePlayerStats'
import { useMutation, useQuery } from '@tanstack/react-query'
import useLocalStorage from '@/common/hooks/useLocalStorage'
import WinnersList from './WinnersList'

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

const BingoImage = sample([
  'https://s3.gifyu.com/images/b2PmQ.gif',
  'https://s3.gifyu.com/images/b2Pmn.gif',
  'https://s3.gifyu.com/images/b2PqT.gif',
  'https://s3.gifyu.com/images/b2Pmf.gif',
])

const SuperGameBaseGuessAmount = 5
const WinMatchAmount = 3
const SuperGameOptionsAmount = 30

export default function LotoPage() {
  const [state, setState] = useState<
    'registration' | 'playing' | 'win' | 'super_game'
  >('registration')
  const [ticketsFromChat, setTicketsFromChat] = useState<Ticket[]>([])
  const [ticketsFromPoints, setTicketsFromPoints] = useState<Ticket[]>([])

  const [superGameValues] = useState<SuperGameResultItem[]>(() =>
    generateSuperGameValues({
      amount: 30,
      smallPrizes: 3,
      mediumPrizes: 2,
      bigPrizes: 1,
    })
  )
  const [superGameGuesses, setSuperGameGuesses] = useState<SuperGameGuess[]>([])
  const [superGameRevealedIds, setSuperGameRevealedIds] = useState<number[]>([])

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

  const { value: timerRef, setValue: setTimerValue } = useTimer(60 * 3)
  const [timerStatus, setTimerStatus] = useState<'off' | 'on'>('off')

  const [savedWinnersIds, setSavedWinnersIds] = useState<{
    [k: string]: number
  }>({})

  const timerValue = timerRef.current

  const { mutate: saveWinners } = useMutation({
    mutationFn: (params: LotoWinnersCreate) => createLotoWinners(params),
  })

  const { mutate: updateWinner } = useMutation({
    mutationFn: (params: LotoWinnerUpdate) => updateLotoWinner(params),
  })

  const { value: channel } = useLocalStorage({ key: 'chat_channel' })
  const { value: platform } = useLocalStorage({ key: 'chat_platform' })

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

      const winners = ticketsWithHighestMatches.map((ticket) => ({
        username: allUsersById[ticket.owner_id].username,
        super_game_status: 'skip' as const,
      }))

      saveWinners(
        { winners, server: platform, channel },
        {
          onSuccess: (response) => {
            setSavedWinnersIds(response.ids)
          },
        }
      )
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

  const superGameResultMap: {
    [k: string]: (SuperGameResultItem | null)[]
  } = {}

  const superGameBonusGuesses: { [k: string]: number } = {}

  if (state === 'super_game') {
    superGameGuesses.forEach((guess) => {
      const result = guess.value.map((n) =>
        superGameRevealedIds.includes(n) ? superGameValues[n] : null
      )
      superGameResultMap[guess.id] = result
      superGameBonusGuesses[guess.id] = result.filter(
        (r) => r !== null && r !== 'empty'
      ).length
    })
  }

  if (
    (state === 'win' || state === 'super_game') &&
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

        const superGameMessages = newMessages.filter((msg) =>
          msg.message.toLowerCase().startsWith('+супер')
        )

        if (superGameMessages.length > 0) {
          for (const msg of superGameMessages) {
            const trimmed = msg.message.trim()
            const currentGuess = uniq(
              trimmed
                .split(' ')
                .map((n) => parseInt(n) - 1)
                .filter((n) => n >= 0 && n < SuperGameOptionsAmount)
                .filter((n) => !superGameRevealedIds.includes(n))
            )

            const messageFromSameUser = superGameGuesses.find(
              (guess) => guess.owner_id === msg.user.id
            )

            if (messageFromSameUser) {
              const bonusGuessesAmount =
                superGameBonusGuesses[messageFromSameUser.id]
              const totalGuessesAmount =
                bonusGuessesAmount + SuperGameBaseGuessAmount
              const remaining =
                totalGuessesAmount - messageFromSameUser.value.length

              const previousGuessFiltered = currentGuess.filter(
                (n) => !messageFromSameUser.value.includes(n)
              )

              const limitedGuess = previousGuessFiltered.slice(0, remaining)
              messageFromSameUser.value = uniq([
                ...messageFromSameUser.value,
                ...limitedGuess,
              ])
              setSuperGameGuesses([...superGameGuesses])
            } else {
              const limitedGuess = currentGuess.slice(
                0,
                SuperGameBaseGuessAmount
              )

              const guess: SuperGameGuess = {
                id: msg.id,
                owner_id: msg.user.id,
                owner_name: msg.user.username,
                value: limitedGuess,
              }

              setSuperGameGuesses((prev) => [...prev, guess])
            }
          }

          if (state === 'win') {
            setState('super_game')
          }
        }
      }
    }
  }

  const superGameSelectedIds = uniq(
    flatten(superGameGuesses.map((guess) => guess.value))
  )

  // console.log('super game guesses', superGameResultMap)

  const allSuperGuessesRevealed = Object.keys(superGameResultMap).every(
    (key) =>
      superGameResultMap[key].filter((v) => v !== null).length ===
      SuperGameBaseGuessAmount + superGameBonusGuesses[key]
  )

  const superGameFinished = state === 'super_game' && allSuperGuessesRevealed

  useEffect(() => {
    const superGameWinners = superGameGuesses.filter((guess) => {
      const result = superGameResultMap[guess.id]
      return result.some((r) => r !== 'empty')
    })

    const superGameLosers = superGameGuesses.filter((guess) => {
      const result = superGameResultMap[guess.id]
      return result.every((r) => r === 'empty')
    })

    superGameWinners.forEach((winner) => {
      const user = allUsersById[winner.owner_id]
      const winnerId = savedWinnersIds[user.username]
      if (winnerId) {
        updateWinner({
          id: winnerId,
          super_game_status: 'win',
          server: platform,
          channel,
        })
      }
    })

    superGameLosers.forEach((loser) => {
      const user = allUsersById[loser.owner_id]
      const winnerId = savedWinnersIds[user.id]
      if (winnerId) {
        updateWinner({
          id: winnerId,
          super_game_status: 'lose',
          server: platform,
          channel,
        })
      }
    })
  }, [superGameFinished])

  let nextNumberText = NumberToFancyName[nextNumber]

  const currentNumberMatchesAmount = totalTickets.filter((ticket) =>
    ticket.value.includes(nextNumber)
  ).length

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
                <WinnersList />
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
                    onClick={() => setState('playing')}
                    disabled={totalTickets.length === 0}
                  >
                    Начать розыгрыш{' '}
                    {timerStatus === 'on' &&
                      `(${formatSecondsZero(timerValue)})`}
                  </Button>
                </Box>
              </Box>
            </>
          )}

          {state !== 'registration' && (
            <Box position="absolute">
              <WinnersList />
            </Box>
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
                          <DrawnNumber>{value}</DrawnNumber>
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
                        <DrawnNumber big>{nextNumber}</DrawnNumber>
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
                        <h3>
                          Чтобы сыграть в СУПЕР-ИГРУ напиши в чат
                          <br />
                          +супер {'<пять номеров ячеек>'}
                          <br />
                          Например: +супер 8 4 22 12 30
                        </h3>
                      </InfoPanel>
                    </Box>
                    <Box
                      display="flex"
                      justifyContent="center"
                      marginTop="10px"
                      marginBottom="10px"
                    >
                      <SuperGameBox
                        options={superGameValues}
                        selected={[]}
                        revealedOptionsIds={[]}
                        onOptionReveal={() => {}}
                      />
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {state === 'super_game' && superGameGuesses.length > 0 && (
            <Box display="flex" justifyContent="center">
              <Box>
                <Box textAlign="center" display="flex" justifyContent="center">
                  <InfoPanel>
                    Победитель открывает {SuperGameBaseGuessAmount} ячеек
                    <br /> И может выиграть супер-приз!
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
                  {superGameGuesses
                    .map((t) => allUsersById[t.owner_id].username)
                    .join(', ')}
                </Box>
                <Box display="flex" justifyContent="center">
                  <SuperGameBox
                    options={superGameValues}
                    revealedOptionsIds={superGameRevealedIds}
                    onOptionReveal={(id: number) => {
                      setSuperGameRevealedIds((prev) => uniq([...prev, id]))
                    }}
                    revealAll={superGameFinished}
                    selected={superGameSelectedIds}
                  />
                </Box>

                <Box
                  marginBottom={'40px'}
                  marginTop={'50px'}
                  textAlign={'center'}
                  fontSize={'32px'}
                  justifyContent="center"
                  alignItems="center"
                >
                  {superGameGuesses.map((guess, index) => {
                    return (
                      <Box
                        marginBottom="20px"
                        key={index}
                        style={{ backgroundColor: randomTicketColor(index) }}
                        borderRadius="10px"
                        paddingLeft="20px"
                        paddingRight="20px"
                      >
                        <SuperGamePlayerStats
                          guess={guess}
                          result={superGameResultMap[guess.id]}
                          guessesAmount={
                            superGameBonusGuesses[guess.id] +
                            SuperGameBaseGuessAmount
                          }
                        />
                      </Box>
                    )
                  })}
                </Box>
              </Box>
            </Box>
          )}

          <Box
            display={'flex'}
            flexWrap={'wrap'}
            justifyContent={'center'}
            marginLeft="150px"
            // paddingLeft="200px"
          >
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
