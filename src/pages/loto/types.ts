import { ChatConnection, ChatServerType } from '../turnir/types'

export type TicketId = string

export type Ticket = {
  id: TicketId
  owner_id: string
  owner_name: string
  value: string[]
  color: string
  variant: number
  type: 'chat' | 'points'
  source: ChatConnection
}

export type SuperGameGuess = {
  id: string
  owner_id: string
  owner_name: string
  value: number[]
}

export type SuperGameResultItem = 'empty' | 'x1' | 'x2' | 'x3'
