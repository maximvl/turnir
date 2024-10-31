import { ChatUser } from 'pages/turnir/api'

export type Ticket = {
  owner: string
  value: string
  color: string
  variant: number
}

export type Ticket2 = {
  id: string
  owner: ChatUser
  value: string[]
  color: string
  variant: number
}
