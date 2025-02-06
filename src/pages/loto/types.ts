export type TicketId = string

export type Ticket = {
  id: TicketId
  owner_id: string
  owner_name: string
  value: string[]
  color: string
  variant: number
  source: 'chat' | 'points'
}

export type SuperGameGuess = {
  id: string
  owner_id: string
  owner_name: string
  value: number[]
}

export type SuperGameResultItem = 'empty' | 'x1' | 'x2' | 'x3'
