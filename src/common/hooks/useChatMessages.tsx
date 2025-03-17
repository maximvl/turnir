import { isEmpty } from 'lodash'
import { useEffect, useState } from 'react'
import { useQueries, useQuery } from '@tanstack/react-query'
import { fetchMessages, ChatMessage } from '@/pages/turnir/api'
import useLocalStorage from './useLocalStorage'
import { ChatConnection, ChatServerType } from '@/pages/turnir/types'

type Props = {
  fetching?: boolean
}

const REFETCH_INTERVAL = 2000

export default function useChatMessages({ fetching }: Props) {
  const { value: chatConnections } = useLocalStorage<ChatConnection[]>({
    key: 'chat-connections',
    defaultValue: [],
  })

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessages, setNewMessages] = useState<ChatMessage[]>([])

  const [lastTs, setLastTs] = useState<number>(() =>
    Math.floor(Date.now() / 1000)
  )

  const reset = () => {
    setMessages([])
    setLastTs(Math.floor(Date.now() / 1000))
  }

  const queries = chatConnections
    .filter((conn) => conn.channel !== '')
    .map((conn) => {
      return {
        queryKey: ['chatMessages', conn, lastTs],
        queryFn: () => {
          return fetchMessages({
            platform: conn.server,
            channel: conn.channel,
            ts: lastTs,
          })
        },
        refetchInterval: REFETCH_INTERVAL,
        enabled: fetching,
      }
    })

  // const { data: chatData, error, isLoading }
  const results = useQueries({ queries })

  // const {
  //   data: chatData,
  //   error,
  //   isLoading,
  // } = useQuery({
  //   queryKey: ['chatMessages', channel, lastTs],
  //   queryFn: () => {
  //     if (!channel || !platform) {
  //       return
  //     }
  //     return fetchMessages({ platform, channel, ts: lastTs })
  //   },
  //   refetchInterval: REFETCH_INTERVAL,
  //   enabled: fetching && channel !== null,
  // })

  const lastTsList = results.map(
    ({ error, isLoading, data: chatData }, index) => {
      if (!error && !isLoading && !isEmpty(chatData?.chat_messages)) {
        // todo remove duplicates votes for same user id
        // use only the latest one

        // const messagesPerUser: { [key: number]: ChatMessage } = {}
        // for (const vote of messagesSorted) {
        //   messagesPerUser[vote.user.id] = vote
        // }

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

  const lastTsFiltered = lastTsList.filter((ts) => ts !== undefined)

  let lastTsMin = null
  if (lastTsFiltered.length > 0) {
    lastTsMin = Math.min(...lastTsFiltered)
  }

  useEffect(() => {
    if (lastTsMin && lastTsMin > lastTs) {
      setLastTs(lastTsMin)
    }
  }, [lastTsMin, lastTs])

  return {
    messages,
    newMessages,
    reset,
  }
}
