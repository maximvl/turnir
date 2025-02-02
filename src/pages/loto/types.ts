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
