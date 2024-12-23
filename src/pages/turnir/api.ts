import { random, sample } from 'lodash'
import { ItemStatus, Item } from './types'

const MOCK_API = process.env.NODE_ENV === 'development'

export function createItem(index: string, title: string = ''): Item {
  return { title, status: ItemStatus.Active, id: index }
}

const URL_PREFIX = '/v2'

type VkUserRole = {
  id: string
  name: string
  largeUrl: string
  priority: number
}

type VkUserBadgeAchievement = {
  name: string
  type: string
}

type VkUserBadge = {
  id: string
  name: string
  largeUrl: string
  achievement: VkUserBadgeAchievement
}

type VkUserFields = {
  nickColor: number
  isChatModerator: boolean
  isChannelModerator: boolean
  roles: VkUserRole[]
  badges: VkUserBadge[]
}

export type ChatUser = {
  id: number
  username: string
  vk_fields?: VkUserFields
}

export type VkMention = {
  id: number
  displayName: string
}

type VkChatFields = {
  mentions: VkMention[]
}

export type ChatMessage = {
  id: number
  ts: number
  message: string
  user: ChatUser
  vk_fields?: VkChatFields
}

export type ChatMessagesResponse = {
  chat_messages: null | ChatMessage[]
}

export type FetchVotesParams = {
  ts: number
  textFilter?: string
}

export async function fetchVotes({
  ts,
  textFilter,
}: FetchVotesParams): Promise<ChatMessagesResponse> {
  if (MOCK_API) {
    const makeBadge = () => {
      return {
        id: '232c3913-274a-4c02-8d23-6576f7d48e98',
        name: 'Топ 1',
        largeUrl:
          'https://images.live.vkplay.ru/badge/232c3913-274a-4c02-8d23-6576f7d48e98/icon/size/large?change_time=1691761874',
        achievement: {
          name: 'Топ 1',
          type: 's',
        },
      }
    }

    const makeMessage = () => {
      const user_id = random(1, 100)
      return {
        id: 93152579,
        message: sample(['+лото']),
        ts: Math.round(new Date().getTime() / 1000),
        user: {
          id: user_id,
          username: user_id.toString(),
          vk_fields: {
            nickColor: 0,
            isChatModerator: false,
            isChannelModerator: false,
            badges: [makeBadge(), makeBadge(), makeBadge()],
            roles: [],
          },
        },
      }
    }

    const makeBotMessage = () => {
      const user_id = random(1, 100)
      return {
        id: 93152579,
        message: 'получил награду лото',
        ts: Math.round(new Date().getTime() / 1000),
        user: {
          id: 0,
          username: 'ChatBot',
        },
        vk_fields: {
          mentions: [{ id: 5, displayName: user_id.toString() }],
        },
      }
    }

    const makeGameMessage = () => {
      const user_id = random(1, 100)
      return {
        id: 93152579,
        message: '+игра',
        ts: Math.round(new Date().getTime() / 1000),
        user: {
          id: user_id,
          username: `Player-${user_id}`,
        },
      }
    }

    const makeSuperGameMessage = () => {
      const user_id = 13
      return {
        id: 93152579111,
        message: '+супер 8 17 23 41 99',
        ts: Math.round(new Date().getTime() / 1000),
        user: {
          id: user_id,
          username: `Player-${user_id}`,
        },
      }
    }

    const messages: ChatMessage[] = Array.from({ length: 20 }, makeMessage)
    const gameMessages = [makeGameMessage(), makeGameMessage()]
    // return { chat_messages: messages }
    return { chat_messages: [makeSuperGameMessage()] }
  }

  const params = new URLSearchParams()
  params.set('ts', ts.toString())
  if (textFilter && textFilter.length > 0) {
    params.set('text_filter', textFilter)
  }
  return fetch(`${URL_PREFIX}/turnir-api/votes?${params.toString()}`).then(
    (res) => res.json()
  )
}

export async function resetVotes(options: string[]): Promise<number> {
  return fetch(`${URL_PREFIX}/turnir-api/votes/reset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ vote_options: options }),
  }).then((res) => res.status)
}

export type Preset = {
  id: string
  title: string
  options: string[]
}

export type ErrorResponse = {
  error: string
  error_code?: string
}

export async function savePreset(
  title: string,
  options: string[]
): Promise<Preset | ErrorResponse> {
  if (MOCK_API) {
    return { id: 'test', options, title }
  }
  return fetch(`${URL_PREFIX}/turnir-api/presets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ options, title }),
  }).then((res) => res.json())
}

export async function updatePreset(
  id: string,
  title: string,
  options: string[]
): Promise<Preset | ErrorResponse> {
  if (MOCK_API) {
    return { id, options, title }
  }
  return fetch(`${URL_PREFIX}/turnir-api/presets/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ options, title }),
  }).then((res) => res.json())
}

export async function fetchPreset(id: string): Promise<Preset | ErrorResponse> {
  if (MOCK_API) {
    return { id, options: ['a', 'b', 'c'], title: `test ${random(1, 1000)}` }
  }
  return fetch(`${URL_PREFIX}/turnir-api/presets/${id}`).then((res) =>
    res.json()
  )
}
