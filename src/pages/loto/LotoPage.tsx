import { Box, Button } from '@mui/material'
import MainMenu from 'common/MainMenu'
import { fetchVotes } from 'pages/turnir/api'
import InfoPanel from 'pages/turnir/components/rounds/shared/InfoPanel'
import { useState } from 'react'
import { useQuery } from 'react-query'
import TicketBox from './TicketBox'
import { Ticket } from './types'
import { generateTicket } from './utils'

const VOTES_REFETCH_INTERVAL = 2000

export default function LotoPage() {
  const [state, setState] = useState<'idle' | 'voting'>('voting')
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [lastTs, setLastTs] = useState(() => Math.floor(Date.now() / 1000))

  const { data: chatMessages } = useQuery(
    ['loto', 0, lastTs],
    (args) => fetchVotes(args),
    {
      refetchInterval: VOTES_REFETCH_INTERVAL,
      enabled: state === 'voting',
    }
  )

  if (chatMessages?.poll_votes && chatMessages.poll_votes.length > 0) {
    const lastVote = chatMessages.poll_votes[chatMessages.poll_votes.length - 1]
    const currentOwners = tickets.map((ticket) => ticket.owner)
    let newOwners: string[] = []
    newOwners = chatMessages.poll_votes.map((vote) => vote.username)
    newOwners = newOwners.filter((owner) => !currentOwners.includes(owner))

    if (newOwners.length > 0) {
      setLastTs(lastVote.ts)
      setTickets([
        ...newOwners.map((owner) => ({ owner, value: generateTicket() })),
        ...tickets,
      ])
    }
  }

  return (
    <Box>
      <MainMenu title={'Лото с чатом'} />
      <Box
        display="flex"
        justifyContent={'center'}
        paddingLeft={'100px'}
        paddingRight={'100px'}
      >
        <Box>
          <Box display={'flex'} justifyContent={'center'}>
            <InfoPanel>
              <p>
                Пишите в чат <strong>+лото</strong> чтобы получить билет
              </p>
            </InfoPanel>
          </Box>
          <Box
            fontSize={'32px'}
            textAlign={'center'}
            display={'flex'}
            alignItems={'center'}
            justifyContent={'center'}
            marginTop={'40px'}
            marginBottom={'20px'}
          >
            Участники: {tickets.length}
            <Button
              variant="contained"
              color="primary"
              style={{ marginLeft: '30px' }}
            >
              Начать
            </Button>
          </Box>
          <Box display={'flex'} flexWrap={'wrap'}>
            {tickets.map((ticket, i) => {
              return <TicketBox key={i} ticket={ticket} />
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
