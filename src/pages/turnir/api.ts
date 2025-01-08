import { random, sample } from 'lodash'
import { ItemStatus, Item, ChatServerType } from './types'

export function createItem(index: string, title: string = ''): Item {
  return { title, status: ItemStatus.Active, id: index }
}

const URL_PREFIX = '/v2'
// const URL_PREFIX = 'http://localhost:8080/v2'

const MOCK_API =
  import.meta.env.MODE === 'development' && !URL_PREFIX.includes('localhost')

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

type TwitchBadge = {
  id: string
  title: string
  image_url_4x: string
}

type TwitchUserFields = {
  color?: string
  badges: TwitchBadge[]
}

export type ChatUser = {
  id: string
  username: string
  vk_fields?: VkUserFields
  twitch_fields?: TwitchUserFields
}

export type VkMention = {
  id: number
  displayName: string
}

type VkChatFields = {
  mentions: VkMention[]
}

export type ChatMessage = {
  id: string
  ts: number
  message: string
  user: ChatUser
  vk_fields?: VkChatFields
}

export type ChatMessagesResponse = {
  chat_messages: null | ChatMessage[]
}

export type FetchMessagesParams = {
  channel: string
  platform: ChatServerType
  ts: number
  textFilter?: string
}

export async function fetchMessages({
  channel,
  ts,
  textFilter,
  platform,
}: FetchMessagesParams): Promise<ChatMessagesResponse> {
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
      const colors = [
        '#0000FF',
        '#FF7F50',
        '#1E90FF',
        '#00FF7F',
        '#9ACD32',
        '#008000',
        '#FF4500',
        '#FF0000',
        '#DAA520',
        '#FF69B4',
        '#5F9EA0',
        '#2E8B57',
        '#D2691E',
        '#8A2BE2',
        '#B22222',
      ]

      return {
        id: '93152579',
        message: sample(['+лото']),
        ts: Math.round(new Date().getTime() / 1000),
        user: {
          id: `${user_id}`,
          username: user_id.toString(),
          // vk_fields: {
          //   nickColor: 0,
          //   isChatModerator: false,
          //   isChannelModerator: false,
          //   badges: [makeBadge(), makeBadge(), makeBadge()],
          //   roles: [],
          // },
          twitch_fields: {
            color: sample(colors),
            badges: [],
          },
        },
      }
    }

    const makeBotMessage = () => {
      const user_id = random(1, 100)
      return {
        id: '93152579',
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
        id: '93152579',
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
        id: '93152579111',
        message: '+супер 8 17 23 41 99',
        ts: Math.round(new Date().getTime() / 1000),
        user: {
          id: `${user_id}`,
          username: `Player-${user_id}`,
        },
      }
    }

    const messages: ChatMessage[] = Array.from({ length: 20 }, makeMessage)
    const gameMessages = [makeGameMessage(), makeGameMessage()]
    // return { chat_messages: messages }
    return { chat_messages: messages }
  }

  const params = new URLSearchParams()
  params.set('platform', platform)
  params.set('channel', channel)
  params.set('ts', ts.toString())
  if (textFilter && textFilter.length > 0) {
    params.set('text_filter', textFilter)
  }
  return fetch(
    `${URL_PREFIX}/turnir-api/chat_messages?${params.toString()}`
  ).then((res) => res.json())
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

type ChatConnectResponse = {
  status: 'ok'
}

type ChatConnectParams = {
  server: ChatServerType
  channel: string
}

export async function chatConnect({
  server,
  channel,
}: ChatConnectParams): Promise<ChatConnectResponse> {
  if (MOCK_API) {
    return { status: 'ok' }
  }
  const params = new URLSearchParams()
  params.set('channel', channel)
  params.set('platform', server)
  return fetch(`${URL_PREFIX}/turnir-api/chat_connect?${params.toString()}`, {
    method: 'POST',
  }).then((res) => res.json())
}
