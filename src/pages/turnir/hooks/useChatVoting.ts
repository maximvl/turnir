import { isEmpty } from 'lodash'
import { useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import { Item } from '@/pages/turnir/types'
import { fetchVotes, ChatMessage } from '@/pages/turnir/api'

type Props = {
  items: Item[]
  subscriberOnly: boolean
}

type VotesDict = {
  [key: string]: string
}

type VotingState = 'initial' | 'voting' | 'finished'

const VOTES_REFETCH_INTERVAL = 2000

export default function useChatVoting({ items, subscriberOnly }: Props) {
  const [votesMap, setVotesMap] = useState<VotesDict>({})
  const [voteMessages, setVoteMessages] = useState<ChatMessage[]>([])

  const [state, setState] = useState<VotingState>('initial')
  const [lastTs, setLastTs] = useState<number>(() =>
    Math.floor(Date.now() / 1000)
  )

  const resetPoll = async () => {
    setState('initial')
    setVotesMap({})
    setVoteMessages([])
    setLastTs(Math.floor(Date.now() / 1000))
    // setTime(timer || 0);
  }

  useEffect(() => {
    resetPoll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length])

  const {
    data: votes,
    error,
    isLoading,
  } = useQuery(
    ['votes', items.length, lastTs],
    ({ queryKey }) => fetchVotes({ ts: queryKey[2] as number }),
    {
      refetchInterval: VOTES_REFETCH_INTERVAL,
      enabled: state === 'voting',
    }
  )

  if (!error && !isLoading && !isEmpty(votes?.chat_messages)) {
    // todo remove duplicates votes for same user id
    // use only the latest one
    const votesSorted =
      votes?.chat_messages?.sort((a, b) => {
        return a.ts - b.ts
      }) || []

    const votesPerUser: { [key: number]: ChatMessage } = {}
    const itemIds = new Set(items.map((item) => item.id))
    for (const vote of votesSorted) {
      if (!itemIds.has(vote.message)) {
        continue
      }
      if (subscriberOnly) {
        const userBadges = vote.user.vk_fields?.badges || []
        const subscriberBadges = userBadges.filter(
          (badge) => badge.achievement.type === 'subscription'
        )
        if (subscriberBadges.length === 0) {
          continue
        }
      }
      votesPerUser[vote.user.id] = vote
    }

    const newVotes = Object.values(votesPerUser).filter((vote) => {
      return vote.message !== votesMap[vote.user.id]
    })

    if (!isEmpty(newVotes)) {
      const newVotesMap = newVotes.reduce((acc, vote) => {
        acc[vote.user.id] = vote.message
        return acc
      }, {} as VotesDict)
      const tsSorted = newVotes.map((vote) => vote.ts).sort()
      const lastVoteTs = tsSorted[tsSorted.length - 1]

      setVotesMap({ ...votesMap, ...newVotesMap })
      setVoteMessages([...voteMessages, ...newVotes])
      setLastTs(lastVoteTs)
    }
  }

  return {
    votesMap,
    voteMessages,
    state,
    setState,
    error,
    isLoading,
  }
}
