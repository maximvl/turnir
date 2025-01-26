import { isEmpty } from 'lodash'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchMessages, ChatMessage } from '@/pages/turnir/api'
import useLocalStorage from './useLocalStorage'
import { ChatServerType } from '@/pages/turnir/types'

type Props = {
  fetching?: boolean
}

const REFETCH_INTERVAL = 2000

export default function useChatMessages({ fetching }: Props) {
  const { value: channel } = useLocalStorage({ key: 'chat_channel' })
  const { value: platform } = useLocalStorage({ key: 'chat_platform' })

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessages, setNewMessages] = useState<ChatMessage[]>([])

  const [lastTs, setLastTs] = useState<number>(() =>
    Math.floor(Date.now() / 1000)
  )

  const reset = () => {
    setMessages([])
    setLastTs(Math.floor(Date.now() / 1000))
  }

  const {
    data: chatData,
    error,
    isLoading,
  } = useQuery({
    queryKey: ['chatMessages', channel, lastTs],
    queryFn: () => {
      if (!channel || !platform) {
        return undefined
      }
      return fetchMessages({ platform, channel, ts: lastTs })
    },
    refetchInterval: REFETCH_INTERVAL,
    enabled: fetching && channel !== null,
  })

  if (!error && !isLoading && !isEmpty(chatData?.chat_messages)) {
    // todo remove duplicates votes for same user id
    // use only the latest one

    // const messagesPerUser: { [key: number]: ChatMessage } = {}
    // for (const vote of messagesSorted) {
    //   messagesPerUser[vote.user.id] = vote
    // }

    const currentMessagesIds = messages.map((msg) => msg.id)
    const data = chatData?.chat_messages || []

    const newMessages = data.filter(
      (msg) => !currentMessagesIds.includes(msg.id)
    )

    if (!isEmpty(newMessages)) {
      const tsSorted = newMessages.map((msg) => msg.ts).sort()
      const lastVoteTs = tsSorted[tsSorted.length - 1]

      const sortedTotal = [...messages, ...newMessages].sort(
        (a, b) => a.ts - b.ts
      )

      setNewMessages(newMessages)
      setMessages(sortedTotal)
      setLastTs(lastVoteTs)
    }
  }

  return {
    messages,
    newMessages,
    error,
    isLoading,
    reset,
  }
}
