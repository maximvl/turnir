import { MusicContext } from '@/common/hooks/MusicContext'
import useChatMessages from '@/common/hooks/useChatMessages'
import useLocalStorage from '@/common/hooks/useLocalStorage'
import useTimer from '@/common/hooks/useTimer'
import MainMenu from '@/common/MainMenu'
import {
  ChatMessage,
  ChatUser,
  createLotoWinners,
  fetchStreamInfo,
  LotoWinnersCreate,
  LotoWinnerUpdate,
  updateLotoWinner,
  VkMention,
  VkRole,
} from '@/pages/turnir/api'
import InfoPanel from '@/pages/turnir/components/rounds/shared/InfoPanel'
import { ChatConnection, MusicType } from '@/pages/turnir/types'
import { Cancel, PlayCircleFilled } from '@mui/icons-material'
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Slider,
  Tooltip,
} from '@mui/material'
import { useMutation, useQueries } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { flatten, sample, uniq, uniqBy } from 'lodash'
import { useContext, useEffect, useRef, useState } from 'react'
import ChatBox from './ChatBox'
import DrawnNumber from './DrawnNumber'
import './styles.css'
import SuperGameBox from './SuperGameBox'
import SuperGamePlayerStats from './SuperGamePlayerStats'
import TicketBox from './TicketBox'
import { SuperGameGuess, SuperGameResultItem, Ticket, TicketId } from './types'
import {
  formatSeconds,
  formatSecondsZero,
  generateSuperGameValues,
  genTicket,
  isUserSubscriber,
  NumberToFancyName,
  randomTicketColor,
} from './utils'
import WinnersList from './WinnersList'
import ConfigurationButton, { defaultConfig } from './ConfigurationButton'
import AnimatedNumber from './AnimatedNumber'

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

export default function LotoPage() {
  const [state, setState] = useState<
    'registration' | 'playing' | 'win' | 'super_game'
  >('registration')

  const { value: chatConnections } = useLocalStorage<ChatConnection[]>({
    key: 'chat-connections',
    defaultValue: [],
  })

  const { value: lotoConfigLoaded } = useLocalStorage({
    key: 'loto-config',
    defaultValue: defaultConfig,
  })

  const vkStreams = chatConnections
    .filter((c) => c.server === 'vkvideo')
    .map((c) => `${c.server}/${c.channel}`)

  const customVkRewardsEnabled: { [stream: string]: {} } = {}
  for (const [key, value] of Object.entries(
    lotoConfigLoaded.super_game_vk_rewards ?? {}
  )) {
    if (vkStreams.includes(key)) {
      customVkRewardsEnabled[key] = value
    }
  }

  const lotoConfig = {
    ...defaultConfig,
    ...(lotoConfigLoaded as typeof defaultConfig),
  }

  const superGameGuessesAmount = lotoConfig.super_game_guesses_amount

  const [ticketsFromChat, setTicketsFromChat] = useState<Ticket[]>([])
  const [ticketsFromPoints, setTicketsFromPoints] = useState<Ticket[]>([])

  const [superGameValues, setSuperGameValues] = useState<SuperGameResultItem[]>(
    () =>
      generateSuperGameValues({
        amount: lotoConfig.super_game_options_amount,
        smallPrizes: lotoConfig.super_game_1_pointers,
        mediumPrizes: lotoConfig.super_game_2_pointers,
        bigPrizes: lotoConfig.super_game_3_pointers,
        customPrizes: customVkRewardsEnabled,
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

  const [startTime, setStartTime] = useState(60 * 3)
  const {
    value: timerRef,
    setValue: setTimerValue,
    mode: timerMode,
    startCountdown: startTimer,
  } = useTimer(startTime)

  const [savedWinnersIds, setSavedWinnersIds] = useState<{
    [k: string]: number
  }>({})

  const timerValue = timerRef.current

  const {
    value: deletionTimerRef,
    startCountdown: startDeletionTimer,
    reset: resetDeletionTimer,
  } = useTimer(30)

  const { mutate: saveWinners } = useMutation({
    mutationFn: (params: LotoWinnersCreate) => createLotoWinners(params),
  })

  const { mutate: updateWinner } = useMutation({
    mutationFn: (params: LotoWinnerUpdate) => updateLotoWinner(params),
  })

  const showHappyBirthday = chatConnections.some(
    (c) => c.channel.toLowerCase() === 'segall' && false
  )

  const infoQueries = chatConnections.map((connection) => ({
    queryKey: ['streamInfo', connection.server, connection.channel],
    queryFn: () => fetchStreamInfo(connection.server, connection.channel),
  }))

  const infoResults = useQueries({ queries: infoQueries })

  const streamsInfo = infoResults.reduce(
    (acc, result, idx) => {
      if (result.data && result.data?.roles?.data?.rewards) {
        const key = `${infoQueries[idx].queryKey[1]}/${infoQueries[idx].queryKey[2]}`
        const rewards = result.data.roles.data.rewards
        const rewardsWithImages = rewards.filter((r) => r.largeUrl !== '')
        acc[key] = { roles: rewardsWithImages }
      }
      return acc
    },
    {} as { [key: string]: { roles: VkRole[] } }
  )

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
      chatMessages.map((msg) => ({ ...msg.user, source: msg.source })),
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
            source: msg.source,
            created_at: msg.ts,
          } as UserInfo
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
        return {
          user_id: `${mention.id}`,
          username: mention.displayName,
          source: msg.source,
          created_at: msg.ts,
        } as UserInfo
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
    const animationTime = lotoConfig.roll_time_seconds * 1000
    // const animationTime = 1000
    if (nextDigitState === 'roll_start') {
      setNextDigitState('rolling')

      const nextNumber = sample(DrawingNumbers) as string
      setNextNumber(nextNumber)
      nextNumberRef.current = nextNumber

      // const interval = setInterval(() => {
      //   const nextNumber = sample(DrawingNumbers) as string
      //   setNextNumber(nextNumber)
      //   nextNumberRef.current = nextNumber
      // }, animationTime)

      // make total time fit even number of animations
      const animationTime = 1400

      setTimeout(() => {
        // clearInterval(interval)
        setNextDigitState('idle')
        let nextNumber = nextNumberRef.current

        drawNumber(nextNumber)
        if (state === 'playing') {
          setDrawnNumbers((prev) => [...prev, nextNumber])
        }
      }, animationTime)
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

  const totalParticiants = uniqBy(totalTickets, (t) => t.owner_id).length

  useEffect(() => {
    document.title = `Лото - ${totalTickets.length} билетов`
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

  const winnersCandidatesByMatches = ticketsWithHighestMatches
    .map((ticket) => {
      return {
        id: ticket.id,
        matches: matchesPerTicket[ticket.id].filter((n) => n === 1).length,
      }
    })
    .sort((a, b) => b.matches - a.matches)

  const highestMatchesAmount = winnersCandidatesByMatches[0]?.matches ?? 0
  const winnersByMatchesIds = winnersCandidatesByMatches
    .filter((w) => w.matches === highestMatchesAmount)
    .map((w) => w.id)

  const winnerCandidate = orderedTickets
    .filter((ticket) => winnersByMatchesIds.includes(ticket.id))
    .sort((a, b) => a.created_at - b.created_at)[0]

  const winner =
    ['win', 'super_game'].includes(state) && winnerCandidate
      ? winnerCandidate
      : undefined

  useEffect(() => {
    if (
      highestMatches >= lotoConfig.win_matches_amount &&
      winnerCandidate &&
      state === 'playing'
    ) {
      setState('win')
      const winnerData = {
        username: allUsersById[winnerCandidate.owner_id].username,
        super_game_status: 'skip' as const,
      }
      saveWinners(
        {
          winners: [winnerData],
          server: winnerCandidate.source.server,
          channel: winnerCandidate.source.channel,
        },
        {
          onSuccess: (response) => {
            setSavedWinnersIds(response.ids)
          },
        }
      )
    }
  }, [highestMatches, state, winnerCandidate])

  useEffect(() => {
    if (state === 'win') {
      setShowWinnerChat(true)
      resetDeletionTimer()
      startDeletionTimer()

      setSuperGameValues(
        generateSuperGameValues({
          amount: lotoConfig.super_game_options_amount,
          smallPrizes: lotoConfig.super_game_1_pointers,
          mediumPrizes: lotoConfig.super_game_2_pointers,
          bigPrizes: lotoConfig.super_game_3_pointers,
          customPrizes: customVkRewardsEnabled,
        })
      )
      setSuperGameGuesses([])
      setSuperGameRevealedIds([])
    }
  }, [state])

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
      if (lotoConfig.super_game_bonus_guesses_enabled) {
        superGameBonusGuesses[guess.id] = result.filter(
          (r) => r !== null && r !== 'empty'
        ).length
      } else {
        superGameBonusGuesses[guess.id] = 0
      }
    })
  }

  if (
    (state === 'win' || state === 'super_game') &&
    chatMessages.length > 0 &&
    winner
  ) {
    const messagesFromWinners = chatMessages.filter(
      (msg) => msg.user.id === winner.owner_id
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
                .filter(
                  (n) => n >= 0 && n < lotoConfig.super_game_options_amount
                )
                .filter((n) => !superGameRevealedIds.includes(n))
            )

            const messageFromSameUser = superGameGuesses.find(
              (guess) => guess.owner_id === msg.user.id
            )

            if (messageFromSameUser) {
              const bonusGuessesAmount =
                superGameBonusGuesses[messageFromSameUser.id]
              const totalGuessesAmount =
                bonusGuessesAmount + superGameGuessesAmount
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
              const limitedGuess = currentGuess.slice(0, superGameGuessesAmount)

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
            window.scrollTo(0, 200)
          }
        }
      }
    }
  }

  const superGameSelectedIds = uniq(
    flatten(superGameGuesses.map((guess) => guess.value))
  )

  const allSuperGuessesRevealed = Object.keys(superGameResultMap).every(
    (key) =>
      superGameResultMap[key].filter((v) => v !== null).length ===
      superGameGuessesAmount + superGameBonusGuesses[key]
  )

  const superGameFinished = state === 'super_game' && allSuperGuessesRevealed

  useEffect(() => {
    const superGameWinnersIds = superGameGuesses
      .filter((guess) => {
        const result = superGameResultMap[guess.id]
        return result.some((r) => r !== 'empty')
      })
      .map((guess) => guess.id)

    const superGameLosersIds = superGameGuesses
      .filter((guess) => {
        const result = superGameResultMap[guess.id]
        return result.every((r) => r === 'empty')
      })
      .map((guess) => guess.id)

    superGameGuesses.forEach((guess) => {
      const user = allUsersById[guess.owner_id]
      const winnerId = savedWinnersIds[user.username]
      let status: 'win' | 'lose' | null = null
      if (superGameWinnersIds.includes(guess.id)) {
        status = 'win'
      } else if (superGameLosersIds.includes(guess.id)) {
        status = 'lose'
      }

      if (winnerId && status) {
        updateWinner({
          id: winnerId,
          super_game_status: status,
          server: user.source.server,
          channel: user.source.channel,
        })
      }
    })
  }, [superGameFinished])

  let nextNumberText = NumberToFancyName[nextNumber]

  const currentNumberMatchesAmount = totalTickets.filter((ticket) =>
    ticket.value.includes(nextNumber)
  ).length

  const deleteWinner = (ticket: Ticket) => {
    const newTicketsFromChat = ticketsFromChat.filter((t) => t.id !== ticket.id)
    const newTicketsFromPoints = ticketsFromPoints.filter(
      (t) => t.id !== ticket.id
    )
    setTicketsFromChat(newTicketsFromChat)
    setTicketsFromPoints(newTicketsFromPoints)

    const newSuperGameGuesses = superGameGuesses.filter(
      (guess) => guess.owner_id !== ticket.owner_id
    )
    setSuperGameGuesses(newSuperGameGuesses)
    setState('playing')
    window.scrollTo(0, 0)
  }

  return (
    <Box onClick={startMusic} className="loto-page">
      <MainMenu title={'Лото 2.0 с чатом'} />

      {state !== 'registration' && (
        <Box position="absolute" left="20px">
          {showHappyBirthday && (
            <Box marginTop="20px" display="flex" justifyContent="center">
              <img
                src="https://i.pinimg.com/originals/f9/f9/de/f9f9de0a26e2c59435e60577624dc8c6.gif"
                style={{ height: '200px' }}
              />
            </Box>
          )}
          <WinnersList />
        </Box>
      )}

      <Box
        display="flex"
        justifyContent={'center'}
        paddingLeft={'100px'}
        paddingRight={'100px'}
      >
        <Box marginBottom={'200px'} width={'100%'}>
          {state === 'registration' && (
            <>
              <Box position="absolute" left="20px">
                <ConfigurationButton streamsRewards={streamsInfo} />
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
                <Box display="flex" alignItems="center">
                  <Slider
                    value={startTime}
                    onChange={(_, value) => {
                      setStartTime(value as number)
                      setTimerValue(value as number)
                    }}
                    aria-labelledby="discrete-slider"
                    valueLabelDisplay="auto"
                    valueLabelFormat={formatSeconds}
                    step={30}
                    marks
                    min={60}
                    max={300}
                  />
                  <Tooltip title="Запустить таймер">
                    <Box
                      sx={{
                        marginLeft: '5px',
                        padding: 0,
                        minWidth: '24px',
                        cursor: 'pointer',
                      }}
                      onClick={startTimer}
                    >
                      <PlayCircleFilled style={{ verticalAlign: 'middle' }} />
                    </Box>
                  </Tooltip>
                </Box>

                {showHappyBirthday && (
                  <Box marginTop="20px" display="flex" justifyContent="center">
                    <img
                      src="https://i.pinimg.com/originals/f9/f9/de/f9f9de0a26e2c59435e60577624dc8c6.gif"
                      style={{ height: '200px' }}
                    />
                  </Box>
                )}

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
                Участников: {totalParticiants}
                {totalParticiants !== totalTickets.length && (
                  <span style={{ marginLeft: '20px' }}>
                    Билетов: {totalTickets.length}
                  </span>
                )}
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
                    Начать розыгрыш
                  </Button>
                </Box>
                {(timerMode === 'coundown' || timerValue === 0) && (
                  <Box marginTop="10px">
                    Начало через{' '}
                    <span style={{ color: timerValue < 60 ? 'red' : 'white' }}>
                      {formatSecondsZero(timerValue)}
                    </span>
                  </Box>
                )}
              </Box>
            </>
          )}

          {['playing', 'win'].includes(state) && (
            <Box>
              <Box>
                <Box display={'flex'} justifyContent={'center'}>
                  <InfoPanel>
                    <p>
                      Побеждает тот кто соберет {lotoConfig.win_matches_amount}{' '}
                      или больше чисел в ряд
                    </p>
                    <p>
                      При равном количестве чисел побеждает тот у кого больше
                      совпадений
                    </p>
                    <p>В случае равенства - тот кто раньше получил билет</p>
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
                          <DrawnNumber variant="empty">{value}</DrawnNumber>
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
                        <DrawnNumber variant="empty" big>
                          <AnimatedNumber value={nextNumber} height={68} />
                        </DrawnNumber>
                      )}
                      {nextNumber.length === 0 && (
                        <Box marginTop={'40px'}></Box>
                      )}
                    </Box>
                    {nextNumberText && nextDigitState === 'idle' ? (
                      <Box fontSize="18px">{nextNumberText}</Box>
                    ) : (
                      <Box fontSize="18px">&nbsp;</Box>
                    )}
                    {nextDigitState === 'idle' && nextNumber ? (
                      <Box marginTop="5px">
                        Билетов с числом: {currentNumberMatchesAmount}
                      </Box>
                    ) : (
                      <Box marginTop="5px">&nbsp;</Box>
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
                {state === 'win' && winner && (
                  <Box marginTop={'10px'}>
                    <Box fontSize={'48px'}>Победитель: {winner.owner_name}</Box>
                    {showHappyBirthday ? (
                      <Box display="flex" justifyContent="center">
                        <img
                          src="https://otkritkis.com/wp-content/uploads/2022/07/iad5f.gif"
                          height="200px"
                        />
                      </Box>
                    ) : (
                      <img src={BingoImage} alt="bingo" width={'200px'} />
                    )}

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
                        streamsRewards={{}}
                        animate
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
                    Победитель открывает {superGameGuessesAmount} ячеек
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
                    streamsRewards={streamsInfo}
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
                            superGameGuessesAmount
                          }
                          maxWinScore={
                            lotoConfig.super_game_1_pointers +
                            lotoConfig.super_game_2_pointers * 2 +
                            lotoConfig.super_game_3_pointers * 3
                          }
                        />
                      </Box>
                    )
                  })}
                </Box>
              </Box>
            </Box>
          )}

          <motion.div
            style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '20px',
              marginLeft: '150px',
            }}
            // paddingLeft="200px"
          >
            <AnimatePresence>
              {orderedTickets.map((ticket) => {
                const isWinner = ticket.id === winner?.id
                const chatMessages = winnerMessages.filter(
                  (msg) => msg.user.id === ticket.owner_id
                )
                return (
                  <motion.div
                    key={ticket.id}
                    layout
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                  >
                    <TicketBox
                      ticket={ticket}
                      matches={matchesPerTicket[ticket.id]}
                      isWinner={isWinner}
                      owner={allUsersById[ticket.owner_id]}
                    />
                    {isWinner && (
                      <Box position="relative">
                        <Box display="flex" justifyContent="space-between">
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => setShowWinnerChat(!showWinnerChat)}
                          >
                            {showWinnerChat ? 'Скрыть чат' : 'Показать чат'}
                          </Button>
                          <Tooltip title="Удалить победителя и продолжить лото">
                            <Box>
                              <Button
                                size="small"
                                color="error"
                                variant="text"
                                disabled={deletionTimerRef.current > 0}
                                onClick={() => deleteWinner(ticket)}
                              >
                                {deletionTimerRef.current > 0 &&
                                  deletionTimerRef.current}{' '}
                                Удалить
                              </Button>
                            </Box>
                          </Tooltip>
                        </Box>
                        {showWinnerChat && <ChatBox messages={chatMessages} />}
                      </Box>
                    )}
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>
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
  source: ChatConnection
  created_at: number
}

function getNewTickets(
  currentTickets: Ticket[],
  newMessages: UserInfo[],
  type: 'chat' | 'points'
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
        type,
        text: owner.text,
        source: owner.source,
        created_at: owner.created_at,
      })
    )

    const newOwnersTicketsFiltered = newOwnersTickets.filter(
      (ticket) => ticket.value !== null
    ) as Ticket[]

    return newOwnersTicketsFiltered
  }
  return []
}
