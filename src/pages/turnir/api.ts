import { random } from 'lodash'
import { ItemStatus, Item } from './types'

const MOCK_API = process.env.NODE_ENV === 'development'

export function createItem(index: string, title: string = ''): Item {
  return { title, status: ItemStatus.Active, id: index }
}

const URL_PREFIX = '/v2'

export type PollVote = {
  id: number
  ts: number
  username: string
  user_id: number
  message: string
}

export type PollVotes = {
  poll_votes: null | PollVote[]
}

export type FetchVotesParams = {
  queryKey: (string | number)[]
}

export async function fetchVotes({
  queryKey,
}: FetchVotesParams): Promise<PollVotes> {
  const [, , ts] = queryKey
  if (MOCK_API) {
    const makeMessage = () => {
      const user_id = random(1, 100)
      return {
        id: 93152579,
        message: random(1, 5).toString(),
        ts: Math.round(new Date().getTime() / 1000),
        user_id: user_id,
        username: user_id.toString(),
      }
    }
    const messages: PollVote[] = Array.from({ length: 2 }, makeMessage)
    return { poll_votes: messages }
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
