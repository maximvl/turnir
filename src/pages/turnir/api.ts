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
  const params = new URLSearchParams()
  params.set('platform', platform)
  params.set('channel', channel)
  params.set('ts', ts.toString())
  if (textFilter && textFilter.length > 0) {
    params.set('text_filter', textFilter)
  }
  const url = `${URL_PREFIX}/turnir-api/chat_messages?${params.toString()}`

  if (MOCK_API) {
    console.log(`GET ${url}`)
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

  return fetch(url).then((res) => res.json())
}

export async function resetVotes(options: string[]): Promise<number> {
  const url = `${URL_PREFIX}/turnir-api/votes/reset`
  const body = JSON.stringify({ vote_options: options })
  if (MOCK_API) {
    console.log(`POST ${url}`, body)
    return 200
  }

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
  const url = `${URL_PREFIX}/turnir-api/presets`
  const body = JSON.stringify({ options, title })

  if (MOCK_API) {
    console.log(`POST ${url}`, body)
    return { id: 'test', options, title }
  }
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  }).then((res) => res.json())
}

export async function updatePreset(
  id: string,
  title: string,
  options: string[]
): Promise<Preset | ErrorResponse> {
  const url = `${URL_PREFIX}/turnir-api/presets/${id}`
  const body = JSON.stringify({ options, title })
  if (MOCK_API) {
    console.log(`POST ${url}`, body)
    return { id, options, title }
  }
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  }).then((res) => res.json())
}

export async function fetchPreset(id: string): Promise<Preset | ErrorResponse> {
  const url = `${URL_PREFIX}/turnir-api/presets/${id}`
  if (MOCK_API) {
    console.log(`GET ${url}`)
    return { id, options: ['a', 'b', 'c'], title: `test ${random(1, 1000)}` }
  }
  return fetch(url).then((res) => res.json())
}

export type ChatConnectResponse = {
  stream_status: ConnectionStatus
}

type ChatConnectParams = {
  server: ChatServerType
  channel: string
}

export async function chatConnect({
  server,
  channel,
}: ChatConnectParams): Promise<ChatConnectResponse> {
  const params = new URLSearchParams()
  params.set('channel', channel)
  params.set('platform', server)
  const url = `${URL_PREFIX}/turnir-api/chat_connect?${params.toString()}`

  if (MOCK_API) {
    console.log(`POST ${url}`)
    await new Promise((resolve) => setTimeout(resolve, 3000))
    return { stream_status: 'connected' }
  }

  return fetch(url, {
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
  const url = `${URL_PREFIX}/turnir-api/loto_winners`
  const body = JSON.stringify({
    winners,
    channel,
    server,
  })
  if (MOCK_API) {
    console.log(`POST ${url}`, body)
    return {
      ids: winners.reduce(
        (acc, winner) => ({ ...acc, [winner.username]: random(1, 10000) }),
        {}
      ),
    }
  }
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
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
  const url = `${URL_PREFIX}/turnir-api/loto_winners/${id}`
  const body = JSON.stringify({
    super_game_status,
    server,
    channel,
  })
  if (MOCK_API) {
    console.log(`POST ${url}`, body)
    return new Response()
  }

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
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
  const url = `${URL_PREFIX}/turnir-api/loto_winners?server=${server}&channel=${channel}`

  if (MOCK_API) {
    console.log(`GET ${url}`)
    const makeWinner = (): LotoWinner => {
      const id = random(1, 10000)
      return {
        id,
        username: `user-${id}-very-very-long-name`,
        super_game_status: sample(['win', 'lose', 'skip']) as SuperGameStatus,
        created_at: Date.now() / 1000,
        stream_channel: sample([
          'twitch/lasqa',
          'vkvideo/lasqa',
          'goodgame/lasqa',
        ]),
      }
    }

    return {
      winners: Array.from({ length: 10 }, makeWinner),
    }
  }

  return fetch(url).then((res) => res.json())
}

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting'

type ConnectionsStatusResponse = {
  connections: { [key: string]: ConnectionStatus }
}

export async function getConnectionsStatus(): Promise<ConnectionsStatusResponse> {
  const url = `${URL_PREFIX}/turnir-api/chat_connections`

  if (MOCK_API) {
    console.log(`GET ${url}`)
    return {
      connections: {
        'vkvideo/lasqa': 'connecting',
        'twitch/praden': 'connected',
        'nuum/segall': 'disconnected',
        'goodgame/roadhouse': 'disconnected',
      },
    }
  }
  return fetch(url).then((res) => res.json())
}

export type VkRole = {
  id: string
  name: string
  largeUrl: string
  description: string
  bgColor: number
  price: number
}

type VkRolesResponse = {
  roles: {
    data: {
      rewards: VkRole[]
    }
  }
}

export function fetchStreamInfo(
  server: ChatServerType,
  channel: string
): Promise<VkRolesResponse> {
  const params = new URLSearchParams()
  params.set('platform', server)
  params.set('channel', channel)
  const url = `${URL_PREFIX}/turnir-api/stream_info?${params.toString()}`

  if (MOCK_API) {
    console.log(`GET ${url}`)
    return Promise.resolve({
      roles: {
        data: {
          rewards: [
            {
              id: '1',
              name: 'Топ 1',
              largeUrl:
                'https://images.live.vkplay.ru/badge/232c3913-274a-4c02-8d23-6576f7d48e98/icon/size/large?change_time=1691761874',
              description: 'Топ 1',
              bgColor: 0,
              price: 0,
            },
            {
              id: '2',
              name: 'Топ 2',
              largeUrl:
                'https://images.live.vkplay.ru/badge/232c3913-274a-4c02-8d23-6576f7d48e98/icon/size/large?change_time=1691761874',
              description: 'Топ 2',
              bgColor: 0,
              price: 0,
            },
          ],
        },
      },
    })
  }
  return fetch(url).then((res) => res.json())
}
