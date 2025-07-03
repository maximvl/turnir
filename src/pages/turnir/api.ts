import { random, sample } from 'lodash'
import { ItemStatus, Item, ChatServerType, ChatMessage } from './types'
import { makeMessage } from './mocks'

export function createItem(index: string, title: string = ''): Item {
  return { title, status: ItemStatus.Active, id: index }
}

const URL_PREFIX = '/v2'
// const URL_PREFIX = 'http://127.0.0.1:8080/v2'

const MOCK_API =
  import.meta.env.MODE === 'development' && !URL_PREFIX.includes('127.0.0.1')

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
let throwApiError: boolean = false

declare global {
  interface Window {
    debugSendChat: (user_id: string, message: string) => void
    debugApiError: () => void
  }
}

if (MOCK_API) {
  window.debugSendChat = function (
    user_id: string,
    message: string,
    server?: string
  ) {
    if (!server) {
      server = 'vkvideo'
    }

    chatResultMock = {
      chat_messages: [
        {
          id: Math.random().toString() + Math.random().toString(),
          message,
          ts: Math.round(new Date().getTime()),
          user: {
            id: user_id,
            username: user_id,
            source: { server: server as ChatServerType, channel: 'lasqa' },
          },
          source: { server: server as ChatServerType, channel: 'lasqa' },
        },
      ],
    }
  }

  window.debugApiError = function () {
    throwApiError = !throwApiError
  }
}

export class ApiError extends Error {
  status: number
  body: {
    error: string
  }

  constructor(
    status: number,
    body: {
      error: string
    }
  ) {
    super(`API Error: ${status}`)
    this.status = status
    this.body = body
  }
}

let mockedMessagesAmount = 200

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

    if (throwApiError) {
      // Simulate an API error
      console.log('throwing api error')
      throw new ApiError(400, {
        error: 'channel not found',
      })
    }

    // console.log('fetching messages', channel, ts, textFilter, platform)

    if (chatResultMock) {
      const result = chatResultMock
      chatResultMock = null
      return result
    }

    // const gameMessages = [makeGameMessage(), makeGameMessage()]
    // return { chat_messages: [makeSuperGameMessage()] }
    const mocksPerRequest = 10
    const mocksLeft = mockedMessagesAmount - mocksPerRequest

    // console.log({ mocksLeft, mockedMessagesAmount, mocksPerRequest })

    if (mocksLeft < 0) {
      return { chat_messages: [] }
    }

    const messages = Array.from({ length: mocksPerRequest }, (_, i) => {
      return makeMessage(platform, channel)
    })

    // console.log({ messages })

    return { chat_messages: messages }
  }

  return fetch(url).then(async (res) => {
    const data = await res.json()
    if (!res.ok) {
      throw new ApiError(res.status, data)
    }
    return data
  })
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
