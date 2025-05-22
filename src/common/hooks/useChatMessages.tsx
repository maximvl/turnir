import { isEmpty } from 'lodash'
import { useEffect, useState } from 'react'
import { useQueries } from '@tanstack/react-query'
import { fetchMessages, ChatMessage } from '@/pages/turnir/api'
import useLocalStorage from './useLocalStorage'
import { ChatConnection } from '@/pages/turnir/types'

type Props = {
  fetching?: boolean
  debug?: boolean
}

const REFETCH_INTERVAL = 2000

export default function useChatMessages({ fetching, debug = true }: Props) {
  const [errorsAmount, setErrorsAmount] = useState(0)
  const { value: chatConnections } = useLocalStorage<ChatConnection[]>({
    key: 'chat-connections',
    defaultValue: [],
  })

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessages, setNewMessages] = useState<ChatMessage[]>([])

  const [lastTsPerConnection, setLastTsPerConnection] = useState<{
    [key: string]: number
  }>(() => {
    const result: { [key: string]: number } = {}
    for (const conn of chatConnections) {
      result[connectionToStream(conn)] = Date.now()
    }
    return result
  })

  // const [lastTs, setLastTs] = useState<number>(() => Date.now())

  const reset = () => {
    setMessages([])
    setLastTsPerConnection((current) => {
      const result: { [key: string]: number } = {}
      for (const key in current) {
        result[key] = Date.now()
      }
      return result
    })
  }

  let refetchInterval = REFETCH_INTERVAL
  if (errorsAmount > 50) {
    refetchInterval = REFETCH_INTERVAL * 5
  }
  if (errorsAmount > 100) {
    refetchInterval = REFETCH_INTERVAL * 10
  }

  const queries = chatConnections
    .filter((conn) => conn.channel !== '')
    .map((conn) => {
      let lastTs = lastTsPerConnection[connectionToStream(conn)]
      if (!lastTs) {
        lastTs = Date.now()
        lastTsPerConnection[connectionToStream(conn)] = lastTs
      }
      return {
        queryKey: ['chatMessages', conn, lastTs],
        queryFn: () => {
          return fetchMessages({
            platform: conn.server,
            channel: conn.channel,
            ts: lastTs,
          })
        },
        refetchInterval,
        enabled: fetching,
      }
    })

  // const { data: chatData, error, isLoading }
  const results = useQueries({ queries })

  const lastTsList = results.map(
    ({ error, isLoading, data: chatData }, index) => {
      if (error) {
        setErrorsAmount((prev) => prev + 1)
        if (debug) {
          console.error('Error fetching chat messages:', error)
        }
        return 'error'
      }

      if (!error && !isLoading && !isEmpty(chatData?.chat_messages)) {
        // todo remove duplicates votes for same user id
        // use only the latest one

        const queryKey = queries[index].queryKey as [
          string,
          ChatConnection,
          number,
        ]
        const source = queryKey[1]

        const dataMessages = chatData?.chat_messages ?? []
        const updatedMessages = dataMessages.map((msg) => {
          return {
            ...msg,
            key: `${source.server}-${source.channel}-${msg.id}`,
            source: {
              server: source.server,
              channel: source.channel,
            },
          }
        })

        const currentMessagesIds = messages.map((msg) => msg.id)

        const newDataMessages = updatedMessages.filter(
          (msg) => !currentMessagesIds.includes(msg.id)
        )

        if (!isEmpty(newDataMessages)) {
          const tsSorted = newDataMessages.map((msg) => msg.ts).sort()
          const lastVoteTs = tsSorted[tsSorted.length - 1]

          const sortedTotal = [...messages, ...newDataMessages].sort(
            (a, b) => a.ts - b.ts
          )

          setNewMessages(newDataMessages)
          setMessages(sortedTotal)
          return lastVoteTs
          // setLastTs(lastVoteTs)
        }
      }
    }
  )

  const noErrors = lastTsList.every((ts) => ts !== 'error')
  useEffect(() => {
    if (noErrors && errorsAmount > 0) {
      setErrorsAmount(0)
    }
  }, [noErrors, errorsAmount])

  const lastTsChanges: { [key: string]: number } = {}
  lastTsList.forEach((ts, index) => {
    if (ts !== undefined && ts !== 'error') {
      const queryKey = queries[index].queryKey as [
        string,
        ChatConnection,
        number,
      ]
      const source = queryKey[1]
      lastTsChanges[connectionToStream(source)] = ts
    }
  })

  if (Object.keys(lastTsChanges).length > 0) {
    setLastTsPerConnection((current) => {
      return {
        ...current,
        ...lastTsChanges,
      }
    })
  }

  return {
    messages,
    newMessages,
    reset,
  }
}

function connectionToStream(connection: ChatConnection) {
  return `${connection.server}/${connection.channel}`
}
