import { Box, Button } from '@mui/material'
import MainMenu from 'common/MainMenu'
import { sample, uniq } from 'lodash'
import { fetchVotes } from 'pages/turnir/api'
import InfoPanel from 'pages/turnir/components/rounds/shared/InfoPanel'
import { useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import TicketBox from './TicketBox'
import { Ticket } from './types'

const VOTES_REFETCH_INTERVAL = 2000

const DIGITS = '0123456789'.split('')

export default function LotoPage() {
  const [state, setState] = useState<'voting' | 'playing' | 'win'>('voting')
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [lastTs, setLastTs] = useState(() => Math.floor(Date.now() / 1000))
  const [filter, setFilter] = useState<string[]>([])
  const [nextDigitState, setNextDigitState] = useState<
    'idle' | 'roll_start' | 'rolling'
  >('idle')

  useEffect(() => {
    if (nextDigitState === 'roll_start') {
      setNextDigitState('rolling')
      const filterSize = filter.length
      setFilter((prev) => [...prev, '-'])
      const interval = setInterval(() => {
        const nextDigit = sample(DIGITS) as string
        setFilter((prev) => [...prev.slice(0, filterSize), nextDigit])
      }, 100)
      setTimeout(() => {
        clearInterval(interval)
        setNextDigitState('idle')
      }, 2000)
    }
  }, [nextDigitState, filter])

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
    newOwners = uniq(newOwners)

    if (newOwners.length > 0) {
      setLastTs(lastVote.ts)
      setTickets([
        ...newOwners.map((owner) => ({ owner, value: generateTicket() })),
        ...tickets,
      ])
    }
  }

  const filterText = filter.join('')

  let filteredTickets = tickets
  if (filterText.length > 0) {
    if (nextDigitState === 'idle' || nextDigitState === 'roll_start') {
      filteredTickets = tickets.filter((ticket) =>
        ticket.value.startsWith(filterText)
      )
    } else {
      const filterBeforeLast = filter.slice(0, filter.length - 1).join('')
      filteredTickets = tickets.filter((ticket) =>
        ticket.value.startsWith(filterBeforeLast)
      )
    }
  }

  console.log('filteredTickets', filteredTickets, filterText, nextDigitState)

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
          {state === 'voting' && (
            <>
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
                  onClick={() => setState('playing')}
                >
                  Розыгрыш
                </Button>
              </Box>
            </>
          )}

          {state === 'playing' && (
            <Box marginTop={'40px'}>
              <Box display="flex" alignItems="center" justifyContent={'center'}>
                <span>Выигрышная комбинация:</span>
                <span
                  style={{
                    fontSize: '48px',
                    marginLeft: '20px',
                    fontFamily: 'monospace',
                  }}
                >
                  {fillWithDashes(filterText)}
                </span>
              </Box>
              <Box
                textAlign={'center'}
                marginTop={'20px'}
                marginBottom={'40px'}
              >
                <Button
                  variant="outlined"
                  onClick={() => setNextDigitState('roll_start')}
                  disabled={
                    filterText.length === 5 || nextDigitState !== 'idle'
                  }
                >
                  Следующая цифра
                </Button>
              </Box>
            </Box>
          )}

          <Box display={'flex'} flexWrap={'wrap'}>
            {filteredTickets.map((ticket, i) => {
              return <TicketBox key={i} ticket={ticket} />
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

function fillWithDashes(value: string) {
  const maxSize = 5
  if (value.length > maxSize) {
    return value
  }
  return value + '-'.repeat(maxSize - value.length)
}

function generateTicket() {
  // returns random number of 5 digits
  const d1 = sample(DIGITS)
  const d2 = sample(DIGITS)
  const d3 = sample(DIGITS)
  const d4 = sample(DIGITS)
  const d5 = sample(DIGITS)
  return `${d1}${d2}${d3}${d4}${d5}`
}
