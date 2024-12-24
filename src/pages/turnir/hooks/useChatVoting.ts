import { isEmpty } from 'lodash'
import { useEffect, useState } from 'react'
import { Item } from '@/pages/turnir/types'
import { ChatMessage } from '@/pages/turnir/api'
import useChatMessages from '@/common/hooks/useChatMessages'

type Props = {
  items: Item[]
  subscriberOnly: boolean
}

type VotesDict = {
  [key: string]: string
}

type VotingState = 'initial' | 'voting' | 'finished'

export default function useChatVoting({ items, subscriberOnly }: Props) {
  const [votesMap, setVotesMap] = useState<VotesDict>({})
  const [state, setState] = useState<VotingState>('initial')

  const resetPoll = async () => {
    setState('initial')
    setVotesMap({})
  }

  const itemIds = new Set(items.map((item) => item.id))

  const {
    newMessages: messages,
    isLoading,
    error,
    reset: resetChat,
  } = useChatMessages({
    fetching: state === 'voting',
  })

  useEffect(() => {
    resetPoll()
    resetChat()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length])

  if (!error && !isLoading && !isEmpty(messages)) {
    // todo remove duplicates votes for same user id
    // use only the latest one
    const msgsPerUser: { [key: number]: ChatMessage } = {}

    for (const msg of messages) {
      if (!itemIds.has(msg.message)) {
        continue
      }
      if (subscriberOnly) {
        const userBadges = msg.user.vk_fields?.badges || []
        const subscriberBadges = userBadges.filter(
          (badge) => badge.achievement.type === 'subscription'
        )
        if (subscriberBadges.length === 0) {
          continue
        }
      }
      msgsPerUser[msg.user.id] = msg
    }

    const newVotes = Object.values(msgsPerUser).filter((msg) => {
      return msg.message !== votesMap[msg.user.id]
    })

    if (!isEmpty(newVotes)) {
      const newVotesMap = newVotes.reduce((acc, vote) => {
        acc[vote.user.id] = vote.message
        return acc
      }, {} as VotesDict)
      setVotesMap({ ...votesMap, ...newVotesMap })
    }
  }

  const voteMessages = messages.filter((msg) => {
    return itemIds.has(msg.message)
  }, [])

  return {
    votesMap,
    voteMessages,
    state,
    setState,
    error,
    isLoading,
  }
}
