import { random, sample } from 'lodash'
import { ItemStatus, Item, ChatServerType, ChatConnection } from './types'

export function createItem(index: string, title: string = ''): Item {
  return { title, status: ItemStatus.Active, id: index }
}

const URL_PREFIX = '/v2'
// const URL_PREFIX = 'http://127.0.0.1:8080/v2'

const MOCK_API =
  import.meta.env.MODE === 'development' && !URL_PREFIX.includes('127.0.0.1')

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
  source: ChatConnection
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
  source: ChatConnection
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

let chatResultMock: ChatMessagesResponse | null = null

declare global {
  interface Window {
    debugSendChat: (user_id: string, message: string) => void
  }
}

if (MOCK_API) {
  window.debugSendChat = function (user_id: string, message: string) {
    chatResultMock = {
      chat_messages: [
        {
          id: Math.random().toString() + Math.random().toString(),
          message,
          ts: Math.round(new Date().getTime() / 1000),
          user: {
            id: user_id,
            username: user_id,
            source: { server: 'vk' as ChatServerType, channel: 'test' },
          },
          source: { server: 'vk' as ChatServerType, channel: 'test' },
        },
      ],
    }
  }
}

export async function fetchMessages({
  channel,
  ts,
  textFilter,
  platform,
}: FetchMessagesParams): Promise<ChatMessagesResponse> {
  if (MOCK_API) {
    // console.log('fetching messages', channel, ts, textFilter, platform)
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
        source: {
          server: platform,
          channel,
        },
        message: sample(['+лото']),
        ts: Math.round(new Date().getTime() / 1000),
        user: {
          id: `${user_id}`,
          username: user_id.toString(),
          source: { server: platform, channel },
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
      const user_id = random(1, 300)
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
      const user_id = 58
      return {
        id: `${user_id}-super6`,
        message: '+супер 1 2',
        ts: Math.round(new Date().getTime() / 1000),
        user: {
          id: `${user_id}`,
          username: `Player-${user_id}`,
        },
      }
    }

    if (chatResultMock) {
      const result = chatResultMock
      chatResultMock = null
      return result
    }

    const messages: ChatMessage[] = Array.from({ length: 500 }, makeMessage)
    const gameMessages = [makeGameMessage(), makeGameMessage()]
    // return { chat_messages: [makeSuperGameMessage()] }
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

type SuperGameStatus = 'skip' | 'win' | 'lose'

type LotWinner = {
  username: string
  super_game_status: SuperGameStatus
}

export type LotoWinnersCreate = {
  server: string
  channel: string
  winners: LotWinner[]
}

type LotoWinnerCreateResponse = {
  ids: { [key: string]: number }
}

export async function createLotoWinners({
  server,
  channel,
  winners,
}: LotoWinnersCreate): Promise<LotoWinnerCreateResponse> {
  return fetch(`${URL_PREFIX}/turnir-api/loto_winners`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ winners, channel, server }),
  }).then((res) => res.json())
}

export type LotoWinnerUpdate = {
  id: number
  super_game_status: SuperGameStatus
  server: string
  channel: string
}

export async function updateLotoWinner({
  id,
  super_game_status,
  server,
  channel,
}: LotoWinnerUpdate): Promise<Response> {
  return fetch(`${URL_PREFIX}/turnir-api/loto_winners/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ super_game_status, server, channel }),
  })
}

export type LotoWinner = {
  id: number
  username: string
  super_game_status: SuperGameStatus
  created_at: number
  stream_channel: string
}

type FetchLotoWinnersResponse = {
  winners: LotoWinner[]
}

export async function fetchLotoWinners(
  server: string,
  channel: string
): Promise<FetchLotoWinnersResponse> {
  if (MOCK_API) {
    return {
      winners: [
        {
          id: 1,
          username: 'user1',
          super_game_status: 'win',
          stream_channel: 'twitch/lasqa',
          created_at: Date.now() / 1000,
        },
        {
          id: 2,
          username: 'user2',
          super_game_status: 'lose',
          stream_channel: 'vkvideo/lasqa',
          created_at: Date.now() / 1000,
        },
        {
          id: 3,
          username: 'user3',
          super_game_status: 'skip',
          stream_channel: '',
          created_at: Date.now() / 1000,
        },
      ],
    }
  }

  return fetch(
    `${URL_PREFIX}/turnir-api/loto_winners?server=${server}&channel=${channel}`
  ).then((res) => res.json())
}

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting'

type ConnectionsStatusResponse = {
  connections: { [key: string]: ConnectionStatus }
}

export async function getConnectionsStatus(): Promise<ConnectionsStatusResponse> {
  if (MOCK_API) {
    return {
      connections: {
        'vkvideo/lasqa': 'connecting',
        'twitch/praden': 'connected',
        'nuum/segall': 'disconnected',
        'goodgame/roadhouse': 'disconnected',
      },
    }
  }
  return fetch(`${URL_PREFIX}/turnir-api/chat_connections`).then((res) =>
    res.json()
  )
}
