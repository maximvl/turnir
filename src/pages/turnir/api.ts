import { random } from 'lodash'
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
  achievemnt: VkUserBadgeAchievement
}

type VkUserFields = {
  nickColor: number
  isChatModerator: boolean
  isChannelModerator: boolean
  roles: VkUserRole[]
  badges: VkUserBadge[]
}

type ChatUser = {
  id: number
  username: string
  vk_fields?: VkUserFields
}

export type ChatMessage = {
  id: number
  ts: number
  message: string
  user: ChatUser
}

export type ChatMessagesResponse = {
  chat_messages: null | ChatMessage[]
}

export type FetchVotesParams = {
  queryKey: (string | number)[]
}

export async function fetchVotes({
  queryKey,
}: FetchVotesParams): Promise<ChatMessagesResponse> {
  const [, , ts] = queryKey
  if (MOCK_API) {
    const makeMessage = () => {
      const user_id = random(1, 100)
      return {
        id: 93152579,
        message: '+лото',
        ts: Math.round(new Date().getTime() / 1000),
        user: {
          id: user_id,
          username: user_id.toString(),
        },
      }
    }
    const messages: ChatMessage[] = Array.from({ length: 10 }, makeMessage)
    return { chat_messages: messages }
  }
  return fetch(`${URL_PREFIX}/turnir-api/votes?ts=${ts}`).then((res) =>
    res.json()
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
