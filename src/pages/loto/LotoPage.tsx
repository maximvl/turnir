import { Box, Button } from '@mui/material'
import MainMenu from 'common/MainMenu'
import { sample, uniq } from 'lodash'
import { fetchVotes } from 'pages/turnir/api'
import InfoPanel from 'pages/turnir/components/rounds/shared/InfoPanel'
import { useEffect, useRef, useState } from 'react'
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
  const [nextDigit, setNextDigit] = useState<string>('-')
  const [nextDigitState, setNextDigitState] = useState<
    'idle' | 'roll_start' | 'rolling'
  >('idle')

  const digitOptions = useRef(DIGITS)
  const nextDigitRef = useRef(nextDigit)

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

  useEffect(() => {
    if (nextDigitState === 'roll_start') {
      setNextDigitState('rolling')
      const interval = setInterval(() => {
        const optionsExcludingCurrent = digitOptions.current.filter(
          (digit) => digit !== nextDigitRef.current
        )
        const nextDigit = sample(optionsExcludingCurrent) as string
        setNextDigit(nextDigit)
        nextDigitRef.current = nextDigit
      }, 100)
      setTimeout(() => {
        clearInterval(interval)
        setNextDigitState('idle')
        setFilter((prev) => [...prev, nextDigitRef.current])
      }, 2000)
    }
  }, [nextDigitState, nextDigit])

  const filterText = filter.join('')

  let filteredTickets = tickets
  if (filterText.length > 0) {
    filteredTickets = tickets.filter((ticket) =>
      ticket.value.startsWith(filterText)
    )
  }

  useEffect(() => {
    const filteredOptions = uniq(
      filteredTickets.map((ticket) => ticket.value[filterText.length])
    )
    digitOptions.current = filteredOptions
    if (filteredTickets.length === 1) {
      setState('win')
    }
  }, [filteredTickets, filterText])

  console.log('filteredTickets', filteredTickets, filterText, nextDigitState)

  const displayValue =
    nextDigitState === 'rolling' ? filterText + nextDigit : filterText

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

          {['playing', 'win'].includes(state) && (
            <Box marginTop={'40px'}>
              <Box display="flex" alignItems="center" justifyContent={'center'}>
                <span style={{ fontSize: '24px' }}>Выигрышная комбинация:</span>
                <span
                  style={{
                    fontSize: '48px',
                    marginLeft: '20px',
                    fontFamily: 'monospace',
                  }}
                >
                  {fillWithDashes(displayValue)}
                </span>
              </Box>
              <Box
                textAlign={'center'}
                marginTop={'20px'}
                marginBottom={'40px'}
              >
                {state === 'playing' && (
                  <Button
                    variant="outlined"
                    onClick={() => setNextDigitState('roll_start')}
                    disabled={
                      filterText.length === 5 || nextDigitState !== 'idle'
                    }
                  >
                    Следующая цифра
                  </Button>
                )}
                {state === 'win' && <Box fontSize={'32px'}>Победитель</Box>}
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
