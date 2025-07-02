import { debounce, isEmpty } from 'lodash'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useQueries } from '@tanstack/react-query'
import { ApiError, fetchMessages } from '@/pages/turnir/api'
import useLocalStorage from './useLocalStorage'
import {
  ChatConnection,
  ChatMessage,
  ChatServerType,
} from '@/pages/turnir/types'

type Props = {
  fetching?: boolean
  debug?: boolean
}

const REFETCH_INTERVAL = 2000

export default function useChatMessages({ fetching, debug = true }: Props) {
  const { value: chatConnections } = useLocalStorage<ChatConnection[]>({
    key: 'chat-connections',
    defaultValue: [],
  })

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessages, setNewMessages] = useState<ChatMessage[]>([])
  const [errorsStartedAt, setErrorsStartedAt] = useState<number | null>(null)
  const [lastErrorAt, setLastErrorAt] = useState<number | null>(null)

  const [lastTsPerConnection, setLastTsPerConnection] = useState<{
    [key: string]: number
  }>(() => {
    const result: { [key: string]: number } = {}
    for (const conn of chatConnections) {
      result[connectionToStream(conn)] = Date.now()
    }
    return result
  })

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
  if (errorsStartedAt) {
    if (Date.now() - errorsStartedAt > 30000) {
      refetchInterval = REFETCH_INTERVAL * 3
    } else if (Date.now() - errorsStartedAt > 10000) {
      refetchInterval = REFETCH_INTERVAL * 1.5
    }
  }

  console.log({
    refetchInterval,
  })

  const queries = chatConnections
    .filter((conn) => conn.channel !== '')
    .map((conn) => {
      let lastTs = lastTsPerConnection[connectionToStream(conn)]
      if (!lastTs) {
        lastTs = Date.now()
        lastTsPerConnection[connectionToStream(conn)] = lastTs
      }
      return {
        queryKey: ['chatMessages', conn.server, conn.channel, lastTs],
        queryFn: () => {
          return fetchMessages({
            platform: conn.server,
            channel: conn.channel,
            ts: lastTs,
          })
        },
        retry: 1,
        refetchInterval,
        enabled: fetching,
      }
    })

  const { save: triggerReconnect } = useLocalStorage<ChatConnection>({
    key: 'reconnect-chat',
  })

  const alreadyReconnecting = useRef<Set<string>>(new Set())
  const results = useQueries({ queries })

  const lastTsList = results.map(
    ({ error, isLoading, data: chatData }, index) => {
      const queryKey = queries[index].queryKey as [
        string,
        ChatServerType,
        string,
        number,
      ]

      if (error) {
        if (
          error instanceof ApiError &&
          error.body.error === 'channel not found'
        ) {
          if (lastErrorAt === null || Date.now() - lastErrorAt > 1000) {
            setLastErrorAt(Date.now())
          }
          if (errorsStartedAt === null) {
            setErrorsStartedAt(Date.now())
          }
          // console.log('updating connection set')
          alreadyReconnecting.current.add(`${queryKey[1]}/${queryKey[2]}`)
        }
        return 'error'
      }

      if (!error && !isLoading && !isEmpty(chatData?.chat_messages)) {
        // todo remove duplicates votes for same user id
        // use only the latest one

        const sourceServer = queryKey[1]
        const sourceChannel = queryKey[2]

        const dataMessages = chatData?.chat_messages ?? []
        const updatedMessages = dataMessages.map((msg) => {
          return {
            ...msg,
            key: `${sourceServer}-${sourceChannel}-${msg.id}`,
            source: {
              server: sourceServer,
              channel: sourceChannel,
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

  useEffect(() => {
    for (const conn of alreadyReconnecting.current) {
      triggerReconnect({
        server: conn.split('/')[0] as ChatServerType,
        channel: conn.split('/')[1],
      })
    }
    alreadyReconnecting.current.clear()
  }, [lastErrorAt])

  const noErrors = lastTsList.every((ts) => ts !== 'error')
  useEffect(() => {
    if (noErrors) {
      if (lastErrorAt !== null) {
        setLastErrorAt(null)
      }
      if (errorsStartedAt !== null) {
        setErrorsStartedAt(null)
      }
    }
  }, [noErrors])

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
