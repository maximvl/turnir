import { Box, useTheme } from '@mui/material'
import { Ticket } from './types'
import { ReactComponent as TicketImg1 } from 'images/ticket1.svg'
import { ReactComponent as TicketImg2 } from 'images/ticket2.svg'
import { ReactComponent as TicketImg3 } from 'images/ticket3.svg'
import { ReactComponent as TicketImg4 } from 'images/ticket4.svg'

type Props = {
  ticket: Ticket
  matches: number[]
}

export default function TicketBox({ ticket, matches }: Props) {
  const theme = useTheme()
  const digits = ticket.value.split('')

  const Ticket = [TicketImg1, TicketImg2, TicketImg3, TicketImg4][
    ticket.variant - 1
  ]

  return (
    <Box position="relative">
      <Ticket
        width={'150px'}
        height={'80px'}
        style={{ width: '150px', color: ticket.color }}
      />

      <Box
        position="absolute"
        top={'8px'}
        left={'12px'}
        width={'126px'}
        height={'64px'}
        border={'2px solid black'}
        borderRadius={'10px'}
        paddingLeft={'12px'}
        paddingRight={'10px'}
        paddingTop={'4px'}
        paddingBottom={'5px'}
        lineHeight={'1.0'}
        overflow={'hidden'}
      >
        {ticket.owner}
        <Box fontSize={'32px'} marginTop={'5px'} fontFamily="monospace">
          {digits.map((value, index) => {
            if (matches[index]) {
              return (
                <span key={index} style={{ color: theme.palette.error.main }}>
                  {value}
                </span>
              )
            }
            return <span key={index}>{value}</span>
          })}
        </Box>
      </Box>
    </Box>
  )
}
