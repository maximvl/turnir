import { ChatConnection } from '../turnir/types'

export type TicketId = string & { readonly brand: unique symbol }

export type Ticket = {
  id: TicketId
  owner_id: string
  owner_name: string
  value: string[]
  color: string
  variant: number
  type: 'chat' | 'points'
  source: ChatConnection
  created_at: number
  isLatecomer: boolean
}

export type SuperGameGuess = {
  id: string
  owner_id: string
  owner_name: string
  value: number[]
}

export type SuperGameResultItem = 'empty' | 'x1' | 'x2' | 'x3' | string
