import { MusicContext } from '@/common/hooks/MusicContext'
import useChatMessages from '@/common/hooks/useChatMessages'
import useLocalStorage from '@/common/hooks/useLocalStorage'
import useTimer from '@/common/hooks/useTimer'
import MainMenu from '@/common/MainMenu'
import {
  createLotoWinners,
  fetchStreamInfo,
  LotoWinnersCreate,
  LotoWinnerUpdate,
  updateLotoWinner,
  VkRole,
} from '@/pages/turnir/api'
import InfoPanel from '@/pages/turnir/components/rounds/shared/InfoPanel'
import {
  ChatConnection,
  MusicType,
  VkMention,
  ChatUser,
  ChatServerType,
} from '@/pages/turnir/types'
import { PlayCircleFilled } from '@mui/icons-material'
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Slider,
  TextField,
  Tooltip,
} from '@mui/material'
import { useMutation, useQueries } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { flatten, sample, uniq, uniqBy } from 'lodash'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
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
  ServerIcons,
} from './utils'
import WinnersList from './WinnersList'
import ConfigurationButton, { defaultConfig } from './ConfigurationButton'
import AnimatedNumber from './AnimatedNumber'

const CHAT_BOT_NAME = 'ChatBot'
const LOTO_MATCH = 'лото'

const BingoImage = sample([
  'https://s3.gifyu.com/images/b2PmQ.gif',
  'https://s3.gifyu.com/images/b2Pmn.gif',
  'https://s3.gifyu.com/images/b2PqT.gif',
  'https://s3.gifyu.com/images/b2Pmf.gif',
])

export default function LotoPage() {
  const [state, setState] = useState<'registration' | 'playing'>('registration')

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
  for (const [key, value] of Object.entries(lotoConfigLoaded.super_game_vk_rewards ?? {})) {
    if (vkStreams.includes(key)) {
      customVkRewardsEnabled[key] = value
    }
  }

  const lotoConfig = useMemo(() => {
    return {
      ...defaultConfig,
      ...(lotoConfigLoaded as typeof defaultConfig),
    }
  }, [lotoConfigLoaded])

  const drawNumberLimit = lotoConfig.limit_to_90 ? 90 : 99

  const [drawNumbersPool, setDrawNumbersPool] = useState<string[]>(() =>
    Array.from({ length: drawNumberLimit }, (_, i) => (i + 1).toString().padStart(2, '0'))
  )

  const drawNumber = (next: string) => {
    drawNumbersPool.splice(drawNumbersPool.indexOf(next), 1)
    setDrawNumbersPool([...drawNumbersPool])
    return next
  }

  const superGameGuessesAmount = lotoConfig.super_game_guesses_amount

  const [ticketsFromChat, setTicketsFromChat] = useState<Ticket[]>([])
  const [ticketsFromPoints, setTicketsFromPoints] = useState<Ticket[]>([])

  const [superGameValues, setSuperGameValues] = useState<SuperGameResultItem[]>(() =>
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

  const [allUsersById, setAllUsersById] = useState<{ [key: string]: ChatUser }>({})
  const [drawnNumbers, setDrawnNumbers] = useState<string[]>([])

  const [nextNumber, setNextNumber] = useState<string>('')
  const [nextDigitState, setNextDigitState] = useState<'idle' | 'roll_start' | 'rolling'>('idle')

  const [openChats, setOpenChats] = useState<Set<string>>(new Set())
  const nextNumberRef = useRef(nextNumber)

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
  } = useTimer(20)

  const { mutate: saveWinners } = useMutation({
    mutationFn: (params: LotoWinnersCreate) => createLotoWinners(params),
  })

  const { mutate: updateWinner } = useMutation({
    mutationFn: (params: LotoWinnerUpdate) => updateLotoWinner(params),
  })

  const showHappyBirthday =
    chatConnections.some((c) => c.channel.toLowerCase() === 'praden') && false

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

  const { newMessages: newChatMessages, messages: allChatMessages } = useChatMessages({
    fetching: true,
  })

  let hasUpdatedTickets = false

  if (newChatMessages.length > 0) {
    const messagesUsers = uniqBy(
      newChatMessages.map((msg) => ({ ...msg.user, source: msg.source })),
      (user) => user.id
    )

    const newUsersById: { [key: string]: ChatUser } = {}

    if (messagesUsers.length > 0) {
      messagesUsers.reduce((acc, user) => {
        const existingUser = allUsersById[user.id]
        if (!allUsersById[user.id]) {
          acc[user.id] = user
        } else {
          if (existingUser.twitch_fields != user.twitch_fields) {
            acc[user.id] = user
          }
          if (existingUser.vk_fields != user.vk_fields) {
            acc[user.id] = user
          }
        }
        return acc
      }, newUsersById)
      // if (Object.keys(newUsersById).length > 0) {
      //   setAllUsersById((prev) => ({ ...prev, ...newUsersById }))
      // }
    }

    const lotoMessages = newChatMessages.filter((msg) =>
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

      const isLatecomer = state === 'playing'

      const newTicketsFromChat = getNewTickets({
        currentTickets: ticketsFromChat,
        newMessages: lotoMessagesFromUsers,
        type: 'chat',
        isLatecomer,
        drawOptions: drawNumbersPool,
      })
      // if (newTicketsFromChat.length > 0) {
      //   setTicketsFromChat((current) => [...newTicketsFromChat, ...current])
      // }

      if (state === 'registration') {
        hasUpdatedTickets = ticketsFromChat.some((ticket) => {
          const messageFromUser = lotoMessagesFromUsers.find(
            (msg) => msg.user_id === ticket.owner_id
          )
          return messageFromUser && messageFromUser.created_at !== ticket.created_at
        })
      }

      const hasUpdate = newTicketsFromChat.length > 0 || hasUpdatedTickets

      if (hasUpdate) {
        setTicketsFromChat((current) => {
          const update = [
            ...newTicketsFromChat,
            ...current.map((ticket) => {
              if (!hasUpdatedTickets) {
                return ticket
              }
              const messageFromUser = lotoMessagesFromUsers.find(
                (msg) => msg.user_id === ticket.owner_id
              )
              if (messageFromUser && messageFromUser.created_at !== ticket.created_at) {
                console.log('changing ticket for', messageFromUser, ticket)
                return genTicket({
                  ownerId: ticket.owner_id,
                  ownerName: ticket.owner_name,
                  drawOptions: drawNumbersPool,
                  source: ticket.source,
                  text: messageFromUser.text,
                  type: ticket.type,
                  created_at: messageFromUser.created_at,
                  isLatecomer: false,
                })
              }
              return ticket
            }),
          ]
          return update
        })
      }

      const lotoMessagesFromBotRaw = lotoMessages.filter(
        (msg) =>
          msg.user.username === CHAT_BOT_NAME && msg.vk_fields && msg.vk_fields.mentions.length > 0
      )

      lotoMessagesFromBotRaw.reduce((acc, msg) => {
        const mention = msg.vk_fields?.mentions[0] as VkMention
        if (!acc[mention.id] && !allUsersById[mention.id]) {
          acc[mention.id] = {
            id: `${mention.id}`,
            username: mention.displayName,
            source: msg.source,
            created_at: msg.ts,
          } as ChatUser
        }
        return acc
      }, newUsersById)

      if (Object.keys(newUsersById).length > 0) {
        setAllUsersById((prev) => ({ ...prev, ...newUsersById }))
      }

      const lotoMessagesFromBot = lotoMessagesFromBotRaw.map((msg) => {
        const mention = msg.vk_fields?.mentions[0] as VkMention
        return {
          user_id: `${mention.id}`,
          username: mention.displayName,
          source: msg.source,
          created_at: msg.ts,
        } as UserInfo
      })

      const newTicketsFromPoints = getNewTickets({
        currentTickets: ticketsFromPoints,
        newMessages: lotoMessagesFromBot,
        type: 'points',
        isLatecomer,
        drawOptions: drawNumbersPool,
      })
      if (newTicketsFromPoints.length > 0) {
        setTicketsFromPoints((current) => [...newTicketsFromPoints, ...current])
      }
    }
  }

  const onDrawClick = () => {
    if (lotoConfig.manual_draw_enabled) {
      if (nextNumber.length !== 2) {
        document.getElementById('manual-draw-input')?.focus()
        return
      }

      drawNumber(nextNumber)
      setDrawnNumbers((prev) => [...prev, nextNumber])
      setNextNumber('')
      document.getElementById('manual-draw-input')?.focus()
    } else {
      setNextDigitState('roll_start')
    }
  }

  useEffect(() => {
    if (nextDigitState === 'roll_start') {
      setNextDigitState('rolling')

      const nextNumber = sample(drawNumbersPool) as string
      setNextNumber(nextNumber)
      nextNumberRef.current = nextNumber

      // make total time fit even number of animations
      const animationTime = 1400

      setTimeout(() => {
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

  totalTickets = totalTickets.filter((ticket) => participatingUserIds.includes(ticket.owner_id))

  const totalParticiants = uniqBy(totalTickets, (t) => t.owner_id).length
  const ticketsAmountPerServer = totalTickets.reduce(
    (acc, ticket) => {
      const amount = acc[ticket.source.server] ?? 0
      acc[ticket.source.server] = amount + 1
      return acc
    },
    {} as { [key in ChatServerType]: number }
  )
  const ticketsAmountPerServerSorted = Object.entries(ticketsAmountPerServer).sort(
    (a, b) => b[1] - a[1]
  )
  const hasOnly1Server = Object.keys(ticketsAmountPerServer).length === 1

  useEffect(() => {
    document.title = `Лото - ${totalTickets.length} билетов`
  }, [totalTickets.length])

  const ticketStatsMap = useMemo(() => {
    const result: {
      [id: TicketId]: {
        matches: number[]
        minNeeded: number
        totalMatches: number
        created_at: number
      }
    } = {}

    if (drawnNumbers.length > 0) {
      // for each ticket find matches with drawn numbers
      for (const ticket of totalTickets) {
        const matches = ticket.value.map((number) => (drawnNumbers.includes(number) ? 1 : 0))

        let minNeeded = lotoConfig.win_matches_amount
        let windowSum = 0

        // Initialize first window
        for (let i = 0; i < lotoConfig.win_matches_amount; i++) {
          windowSum += matches[i] || 0
        }
        minNeeded = lotoConfig.win_matches_amount - windowSum

        // Slide window
        for (let i = lotoConfig.win_matches_amount; i < matches.length; i++) {
          windowSum += matches[i] - matches[i - lotoConfig.win_matches_amount]
          const needed = lotoConfig.win_matches_amount - windowSum
          if (needed < minNeeded) {
            minNeeded = needed
          }
        }
        result[ticket.id] = {
          matches: matches,
          minNeeded: minNeeded,
          totalMatches: matches.reduce((sum: number, val) => sum + val, 0),
          created_at: ticket.created_at,
        }
      }
    } else {
      for (const ticket of totalTickets) {
        result[ticket.id] = {
          matches: Array(ticket.value.length).fill(0),
          minNeeded: lotoConfig.win_matches_amount,
          totalMatches: 0,
          created_at: ticket.created_at,
        }
      }
    }
    return result
  }, [totalTickets.length, drawnNumbers, hasUpdatedTickets])

  // order tickets by consequent matches then by total matches
  const orderedTickets = useMemo(() => {
    return [...totalTickets].sort((a, b) => {
      if (state === 'registration') {
        return b.created_at - a.created_at
      }

      const aStats = ticketStatsMap[a.id]
      const bStats = ticketStatsMap[b.id]

      // console.log('sorting', {
      //   aStats,
      //   bStats,
      // })

      if (aStats.minNeeded !== bStats.minNeeded) {
        return aStats.minNeeded - bStats.minNeeded
      }

      if (aStats.totalMatches !== bStats.totalMatches) {
        return bStats.totalMatches - aStats.totalMatches
      }

      return aStats.created_at - bStats.created_at
    })
  }, [drawnNumbers, totalTickets.length, state, hasUpdatedTickets])

  const lowestMatchesToWin =
    orderedTickets.length > 0 ? ticketStatsMap[orderedTickets[0].id].minNeeded : 0

  const ticketsWithLowestToWin = orderedTickets.filter(
    (ticket) => ticketStatsMap[ticket.id].minNeeded === lowestMatchesToWin
  )

  const winnersCandidatesByMatches = ticketsWithLowestToWin
    .map((ticket) => {
      return {
        id: ticket.id,
        matches: ticketStatsMap[ticket.id].totalMatches,
      }
    })
    .sort((a, b) => b.matches - a.matches)

  const highestMatchesAmount = winnersCandidatesByMatches[0]?.matches ?? 0
  const winnersByMatchesIds = winnersCandidatesByMatches
    .filter((w) => w.matches === highestMatchesAmount)
    .map((w) => w.id)

  const winnerCandidate = totalTickets
    .filter((ticket) => winnersByMatchesIds.includes(ticket.id))
    .sort((a, b) => a.created_at - b.created_at)[0]

  // console.log({
  //   lowestMatchesToWin,
  //   ticketsWithLowestToWin,
  //   winnerCandidate,
  //   winnersByMatchesIds,
  //   highestMatchesAmount,
  // })

  const hostNicknames = new Set(uniq(chatConnections.map((c) => c.channel.toLowerCase())))
  const hostTickets = totalTickets.filter((ticket) =>
    hostNicknames.has(ticket.owner_name.toLowerCase())
  )
  const nonHostOrderedTickets = orderedTickets.filter(
    (ticket) => !hostNicknames.has(ticket.owner_name.toLowerCase())
  )

  const showWinnerTicketTime = winnersByMatchesIds.length > 1

  const winnerFound = state === 'playing' && winnerCandidate && lowestMatchesToWin <= 0

  const winner = winnerFound ? winnerCandidate : undefined

  useEffect(() => {
    if (winner) {
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
  }, [winner])

  useEffect(() => {
    if (winner) {
      setOpenChats((prev) => {
        return new Set([winner.owner_id])
      })
    }
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
  }, [winner, lotoConfig])

  const superGameResultMap: {
    [k: string]: (SuperGameResultItem | null)[]
  } = {}

  const isInSuperGame =
    winner !== undefined && superGameGuesses.some((guess) => guess.owner_id === winner.owner_id)

  const superGameBonusGuesses: { [k: string]: number } = {}

  if (isInSuperGame) {
    superGameGuesses.forEach((guess) => {
      const result = guess.value.map((n) =>
        superGameRevealedIds.includes(n) ? superGameValues[n] : null
      )
      superGameResultMap[guess.id] = result
      if (lotoConfig.super_game_bonus_guesses_enabled) {
        superGameBonusGuesses[guess.id] = result.filter((r) => r !== null && r !== 'empty').length
      } else {
        superGameBonusGuesses[guess.id] = 0
      }
    })
  }

  const newMessagesFromWinner = winner
    ? newChatMessages.filter((msg) => msg.user.id === winner.owner_id)
    : []

  useEffect(() => {
    const superGameMessages = newMessagesFromWinner.filter((msg) =>
      msg.message.toLowerCase().startsWith('+супер')
    )
    if (superGameMessages.length > 0) {
      for (const msg of superGameMessages) {
        const trimmed = msg.message.trim()
        const currentGuess = uniq(
          trimmed
            .split(' ')
            .map((n) => parseInt(n) - 1)
            .filter((n) => n >= 0 && n < lotoConfig.super_game_options_amount)
            .filter((n) => !superGameRevealedIds.includes(n))
        )

        const messageFromSameUser = superGameGuesses.find((guess) => guess.owner_id === msg.user.id)

        if (messageFromSameUser) {
          const bonusGuessesAmount = superGameBonusGuesses[messageFromSameUser.id]
          const totalGuessesAmount = bonusGuessesAmount + superGameGuessesAmount
          const remaining = totalGuessesAmount - messageFromSameUser.value.length

          const previousGuessFiltered = currentGuess.filter(
            (n) => !messageFromSameUser.value.includes(n)
          )

          const limitedGuess = previousGuessFiltered.slice(0, remaining)
          const newValue = uniq([...messageFromSameUser.value, ...limitedGuess])
          if (messageFromSameUser.value.length !== newValue.length) {
            messageFromSameUser.value = newValue
            setSuperGameGuesses([...superGameGuesses])
          }
        } else {
          const limitedGuess = currentGuess.slice(0, superGameGuessesAmount)

          const guess: SuperGameGuess = {
            id: msg.id,
            owner_id: msg.user.id,
            owner_name: msg.user.username,
            value: limitedGuess,
          }

          setSuperGameGuesses((prev) => [...prev, guess])
          window.scrollTo(0, 200)
        }
      }
    }
  }, [newMessagesFromWinner])

  const superGameSelectedIds = uniq(flatten(superGameGuesses.map((guess) => guess.value)))

  const allSuperGuessesRevealed = Object.keys(superGameResultMap).every(
    (key) =>
      superGameResultMap[key].filter((v) => v !== null).length ===
      superGameGuessesAmount + superGameBonusGuesses[key]
  )

  const superGameFinished = isInSuperGame && allSuperGuessesRevealed

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

  const nextNumberText = NumberToFancyName[nextNumber]

  const currentNumberMatchesAmount = totalTickets.filter((ticket) =>
    ticket.value.includes(nextNumber)
  ).length

  const deleteTicket = (ticket: Ticket) => {
    const newTicketsFromChat = ticketsFromChat.filter((t) => t.id !== ticket.id)
    const newTicketsFromPoints = ticketsFromPoints.filter((t) => t.id !== ticket.id)
    setTicketsFromChat(newTicketsFromChat)
    setTicketsFromPoints(newTicketsFromPoints)

    const newSuperGameGuesses = superGameGuesses.filter(
      (guess) => guess.owner_id !== ticket.owner_id
    )
    setSuperGameGuesses(newSuperGameGuesses)
    setState('playing')
    window.scrollTo(0, 0)
  }

  const animate = state === 'playing' || state === 'registration'
  const TicketsContainer = animate ? motion.div : 'div'

  const mainMenuMemo = useMemo(() => {
    return <MainMenu title={'Лото 2.0 с чатом'} />
  }, [])

  return (
    <Box onClick={startMusic} className="loto-page">
      {mainMenuMemo}
      <Box display="flex" justifyContent={'center'} paddingLeft={'100px'} paddingRight={'100px'}>
        <Box marginBottom={'200px'} width={'100%'}>
          <Box position="absolute" left="20px">
            <ConfigurationButton streamsRewards={streamsInfo} state={state} />
            {state === 'registration' && (
              <>
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
              </>
            )}

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
          {state === 'registration' && (
            <>
              <Box display={'flex'} justifyContent={'center'} marginBottom={'20px'}>
                <InfoPanel>
                  {!music.musicPlaying && <p>Кликни чтобы запустить музыку</p>}
                  <p>
                    Пишите в чат <strong>+лото</strong> чтобы получить билет
                  </p>
                  <p>
                    Можно писать свои числа: <strong>+лото 4 8 15 23 42 14 89</strong>
                  </p>
                </InfoPanel>
              </Box>

              <Box
                fontSize="32px"
                textAlign="center"
                // marginTop={'40px'}
                marginBottom="20px"
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '10px',
                    position: 'relative',
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <div>Всего: {totalParticiants}</div>
                    <div
                      style={{
                        display: 'flex',
                        gap: '10px',
                        position: 'absolute',
                        left: '100%',
                        marginLeft: '30px',
                        top: '30%',
                      }}
                    >
                      {!hasOnly1Server &&
                        ticketsAmountPerServerSorted.map(([server, amount]) => {
                          const icon = ServerIcons[server as ChatServerType]
                          return (
                            <div
                              key={server}
                              style={{
                                fontSize: '20px',
                                display: 'flex',
                                height: '20px',
                                alignItems: 'center',
                                gap: '5px',
                              }}
                            >
                              <img src={icon} width="20px" /> {amount}
                            </div>
                          )
                        })}
                    </div>
                  </div>
                </div>
                <Box
                  marginTop="15px"
                  display={'flex'}
                  alignItems={'center'}
                  justifyContent={'center'}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      setState('playing')
                      document.getElementById('manual-draw-input')?.focus()
                    }}
                    disabled={totalTickets.length === 0}
                  >
                    Начать розыгрыш
                  </Button>
                </Box>
                {(timerMode === 'coundown' || timerValue === 0) && (
                  <Box marginTop="10px">
                    Начало через{' '}
                    <span
                      style={{
                        color: timerValue < 60 ? 'red' : 'white',
                        fontFamily: 'monospace',
                      }}
                    >
                      {formatSecondsZero(timerValue)}
                    </span>
                  </Box>
                )}
              </Box>
            </>
          )}

          {state === 'playing' && !isInSuperGame && (
            <Box>
              <Box>
                <Box display={'flex'} justifyContent={'center'}>
                  <InfoPanel>
                    Побеждает тот кто соберет {lotoConfig.win_matches_amount} или больше чисел в ряд
                    <br />
                    При равном количестве чисел побеждает тот у кого больше совпадений
                    <br />В случае равенства - тот кто раньше получил билет
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
                {(state === 'playing' || (winner && !isInSuperGame)) && (
                  <Box>
                    <Box
                      marginTop={'10px'}
                      fontSize={'48px'}
                      display={'flex'}
                      alignItems={'center'}
                      justifyContent={'center'}
                      textAlign={'center'}
                    >
                      {lotoConfig.manual_draw_enabled ? (
                        !winner && (
                          <Box display="flex" justifyContent="center">
                            <DrawnNumber variant="empty" big>
                              <TextField
                                id="manual-draw-input"
                                type="text"
                                value={nextNumber}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 2)
                                  setNextNumber(value)
                                }}
                                sx={{
                                  '& .MuiInputBase-input': {
                                    textAlign: 'center',
                                    padding: 0,
                                    margin: 0,
                                    fontSize: '36px',
                                    color: 'red', // Change this to any color you want
                                  },
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    border: 'none',
                                  },
                                }}
                              />
                            </DrawnNumber>
                          </Box>
                        )
                      ) : (
                        <>
                          {nextNumber.length > 0 && (
                            <DrawnNumber variant="empty" big>
                              <AnimatedNumber value={nextNumber} height={68} />
                            </DrawnNumber>
                          )}
                          {nextNumber.length === 0 && <Box marginTop={'40px'}></Box>}
                        </>
                      )}
                    </Box>
                    {nextNumberText && nextDigitState === 'idle' ? (
                      <Box fontSize="18px">{nextNumberText}</Box>
                    ) : (
                      <Box fontSize="18px">&nbsp;</Box>
                    )}
                    {nextDigitState === 'idle' && nextNumber ? (
                      <Box marginTop="5px">Билетов с числом: {currentNumberMatchesAmount}</Box>
                    ) : (
                      <Box marginTop="5px">&nbsp;</Box>
                    )}
                  </Box>
                )}
                {state === 'playing' && !winner && (
                  <Box marginBottom={'40px'} marginTop={'20px'}>
                    <Button
                      variant="contained"
                      onClick={onDrawClick}
                      disabled={nextDigitState !== 'idle'}
                    >
                      Достать бочонок
                    </Button>
                  </Box>
                )}
                {winner && !isInSuperGame && (
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

                    <Box textAlign="center" display="flex" justifyContent="center">
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

          {isInSuperGame && (
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
                <Box fontSize={'48px'} marginBottom={'20px'} textAlign={'center'}>
                  Супер Игра с{' '}
                  {superGameGuesses.map((t) => allUsersById[t.owner_id].username).join(', ')}
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

                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 100,
                    damping: 20,
                    duration: 0.5,
                  }}
                >
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
                            guessesAmount={superGameBonusGuesses[guess.id] + superGameGuessesAmount}
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
                </motion.div>
              </Box>
            </Box>
          )}

          <div style={{ position: 'relative' }}>
            <div
              style={{
                position: 'absolute',
                bottom: '20px',
                right: '-50px',
                gap: '10px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {hostTickets.map((ticket, idx) => {
                const isWinner = ticket.id === winner?.id
                return (
                  <TicketBox
                    key={idx}
                    ticket={ticket}
                    matches={ticketStatsMap[ticket.id].matches}
                    isWinner={isWinner}
                    owner={allUsersById[ticket.owner_id]}
                    lastDrawnNumber={drawnNumbers[drawnNumbers.length - 1]}
                  />
                )
              })}
            </div>
          </div>

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
              {nonHostOrderedTickets.map((ticket) => {
                const isWinner = ticket.id === winner?.id
                const isWinnerCandidate = winnersByMatchesIds.includes(ticket.id)
                const showChatMessages = openChats.has(ticket.owner_id)
                const chatMessages = allChatMessages.filter(
                  (msg) => msg.user.id === ticket.owner_id
                )

                return (
                  <TicketsContainer
                    key={ticket.id}
                    layout
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                  >
                    <TicketBox
                      ticket={ticket}
                      matches={ticketStatsMap[ticket.id].matches}
                      isWinner={isWinner}
                      owner={allUsersById[ticket.owner_id]}
                      showTime={isWinnerCandidate && showWinnerTicketTime && Boolean(winner)}
                      lastDrawnNumber={drawnNumbers[drawnNumbers.length - 1]}
                    />
                    {winner && (
                      <Box position="relative">
                        <Box display="flex" justifyContent="space-between">
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => {
                              setOpenChats((prev) => {
                                const newChats = new Set(prev)
                                if (newChats.has(ticket.owner_id)) {
                                  newChats.delete(ticket.owner_id)
                                } else {
                                  newChats.add(ticket.owner_id)
                                }
                                return newChats
                              })
                            }}
                          >
                            {showChatMessages ? 'Скрыть чат' : 'Показать чат'}
                          </Button>
                          <Tooltip title="Удалить участника и продолжить лото">
                            <Box>
                              <Button
                                size="small"
                                color="error"
                                variant="text"
                                disabled={deletionTimerRef.current > 0}
                                onClick={() => deleteTicket(ticket)}
                              >
                                {deletionTimerRef.current > 0 && deletionTimerRef.current} Удалить
                              </Button>
                            </Box>
                          </Tooltip>
                        </Box>
                        {showChatMessages && <ChatBox messages={chatMessages} />}
                      </Box>
                    )}
                  </TicketsContainer>
                )
              })}
            </AnimatePresence>
          </motion.div>
        </Box>
      </Box>
    </Box>
  )
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

type getTicketsParams = {
  currentTickets: Ticket[]
  newMessages: UserInfo[]
  type: 'chat' | 'points'
  isLatecomer: boolean
  drawOptions: string[]
}

function getNewTickets({
  currentTickets,
  newMessages,
  type,
  isLatecomer,
  drawOptions,
}: getTicketsParams) {
  const currentOwners = currentTickets.map((ticket) => `${ticket.owner_id}`)

  let newOwners: UserInfo[] = newMessages.filter((owner) => !currentOwners.includes(owner.user_id))
  newOwners = uniqBy(newOwners, (owner) => owner.user_id)

  if (newOwners.length > 0) {
    const newOwnersTickets = newOwners.map((owner) =>
      genTicket({
        ownerId: owner.user_id,
        ownerName: owner.username,
        drawOptions,
        type,
        text: owner.text,
        source: owner.source,
        created_at: owner.created_at,
        isLatecomer,
      })
    )

    const newOwnersTicketsFiltered = newOwnersTickets.filter(
      (ticket) => ticket.value !== null
    ) as Ticket[]

    return newOwnersTicketsFiltered
  }
  return []
}
