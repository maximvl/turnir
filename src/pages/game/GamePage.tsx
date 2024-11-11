import { Button } from '@mui/material'
import { fetchVotes } from 'pages/turnir/api'
import { useEffect, useRef, useState } from 'react'
import { useQuery } from 'react-query'
import GameField from './GameField'
import { Player } from './type'
import { makePlayer } from './utils'

type GameState = 'lobby' | 'turn' | 'playing' | 'win'

const CHAT_REFETCH_INTERVAL = 1000
const JOIN_MESSAGE = '+игра'

export default function GamePage() {
  const [lastTs, setLastTs] = useState(Math.floor(Date.now() / 1000))
  const [state, setState] = useState<GameState>('lobby')
  const [players, setPlayers] = useState<Player[]>([])
  const [attacks, setAttacks] = useState<{ [n: number]: number }>([])
  const [turnTimer, setTurnTimer] = useState(60)
  const timerRef = useRef<number>(60)

  // turn state lasts for 5 seconds, updating state each secand
  useEffect(() => {
    if (state === 'turn') {
      const timer = setInterval(() => {
        setTurnTimer((prev) => {
          timerRef.current = prev - 1
          return prev - 1
        })
        if (timerRef.current <= 0) {
          setState('playing')
          clearInterval(timer)
        }
      }, 1000)
      return () => clearInterval(timer)
    }
    if (state === 'playing') {
      // for each attack target set player status in the same position to dead
      Object.values(attacks).forEach((target) => {
        const hitPlayers = players.filter((p) => p.position === target)
        hitPlayers.forEach((p) => {
          p.status = 'dead'
        })
      })
      setPlayers((prev) => [...prev])
      setState('win')
    }
  }, [state, players, attacks])

  const { data: chatData } = useQuery(
    ['loto', 0, lastTs],
    ({ queryKey }) => {
      return fetchVotes({ ts: queryKey[2] as number })
    },
    {
      refetchInterval: CHAT_REFETCH_INTERVAL,
      enabled: state === 'lobby' || state === 'turn',
    }
  )

  if (
    state === 'lobby' &&
    chatData?.chat_messages &&
    chatData?.chat_messages?.length > 0
  ) {
    const lastMessage =
      chatData.chat_messages[chatData.chat_messages.length - 1]
    if (lastMessage.ts > lastTs + 5) {
      setLastTs(
        chatData.chat_messages[chatData.chat_messages.length - 1].ts - 5
      )
    }

    const joinMessages = chatData.chat_messages.filter((m) =>
      m.message.includes(JOIN_MESSAGE)
    )
    const existingPlayerIds = players.map((p) => p.id)
    const playerCount = players.length
    const getPlayerPosition = (team: 'red' | 'blue') => {
      // returns random position in the grid of 13 columns and 15 rows
      // red team gets random column of 0-6 and blue team of 5-8
      const column =
        team === 'red'
          ? Math.floor(Math.random() * 5)
          : 7 + Math.floor(Math.random() * 5)
      const row = Math.floor(Math.random() * 10)
      return row * 13 + column
    }

    const newPlayers = joinMessages
      .filter((m) => !existingPlayerIds.includes(m.user.id))
      .map((m, index) => {
        const team = (playerCount + index) % 2 === 0 ? 'red' : 'blue'
        return makePlayer({
          id: m.user.id,
          name: m.user.username,
          team,
          position: getPlayerPosition(team),
        })
      })

    console.log('new players', newPlayers)

    if (newPlayers.length > 0) {
      setPlayers((prev) => [...prev, ...newPlayers])
    }
  }

  if (
    state === 'turn' &&
    chatData?.chat_messages &&
    chatData.chat_messages.length > 0
  ) {
    const lastMessage =
      chatData.chat_messages[chatData.chat_messages.length - 1]
    if (lastMessage.ts > lastTs + 5) {
      setLastTs(
        chatData.chat_messages[chatData.chat_messages.length - 1].ts - 5
      )
    }

    const playerIds = players.map((p) => p.id)

    // attack message is a number-location of the attack
    const attackMessages = chatData.chat_messages.filter(
      (m) => /^\d+$/.test(m.message) && playerIds.includes(m.user.id)
    )
    if (attackMessages.length > 0) {
      const newAttacks = attackMessages.reduce(
        (acc, m) => {
          const target = parseInt(m.message)
          if (attacks[m.user.id] !== target && !isNaN(target)) {
            acc[m.user.id] = target
          }
          return acc
        },
        {} as { [n: number]: number }
      )

      if (Object.keys(newAttacks).length > 0) {
        setAttacks((prev) => ({ ...prev, ...newAttacks }))
      }
    }
  }

  let redTeamAlive: Player[] = []
  let blueTeamAlive: Player[] = []
  if (state === 'win') {
    redTeamAlive = players.filter(
      (p) => p.team === 'red' && p.status === 'alive'
    )
    blueTeamAlive = players.filter(
      (p) => p.team === 'blue' && p.status === 'alive'
    )
  }

  return (
    <div>
      <h1>GameMain</h1>
      {state === 'lobby' && (
        <div>
          <Button
            onClick={() => {
              setState('turn')
            }}
          >
            Начать игру
          </Button>
          <div>
            Игроки:
            {players.map((p) => (
              <div key={p.id}>
                {p.name} - {p.team}
              </div>
            ))}
          </div>
        </div>
      )}
      {state === 'turn' && (
        <div>
          <div>До хода: {turnTimer}</div>
          <GameField players={players} />
        </div>
      )}
      {state === 'playing' && (
        <div>
          <div>Играем</div>
        </div>
      )}
      {state === 'win' && (
        <div>
          <div>Победа</div>
          <div>
            Красная команда:
            {redTeamAlive.map((p) => (
              <div key={p.id}>{p.name}</div>
            ))}
          </div>
          <div>
            Синяя команда:
            {blueTeamAlive.map((p) => (
              <div key={p.id}>{p.name}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
