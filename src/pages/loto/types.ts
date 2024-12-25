export type Ticket = {
  owner: string
  value: string
  color: string
  variant: number
}

export type TicketId = string

export type Ticket2 = {
  id: TicketId
  owner_id: string
  owner_name: string
  value: string[]
  color: string
  variant: number
  source: 'chat' | 'points'
}
