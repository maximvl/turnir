import { ChatUser } from 'pages/turnir/api'

export type Ticket = {
  owner: string
  value: string
  color: string
  variant: number
}

export type Ticket2 = {
  owner: ChatUser
  value: string[]
  color: string
  variant: number
}
