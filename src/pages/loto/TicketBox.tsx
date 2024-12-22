import { Box, useTheme } from '@mui/material'
import { Ticket } from './types'
import TicketImg1 from '@/assets/ticket1.svg'
import TicketImg2 from '@/assets/ticket2.svg'
import TicketImg3 from '@/assets/ticket3.svg'
import TicketImg4 from '@/assets/ticket4.svg'

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
      <Ticket width={'170px'} height={'80px'} style={{ color: ticket.color }} />

      <Box
        position="absolute"
        top={'8px'}
        left={'15px'}
        width={'140px'}
        height={'64px'}
        border={'2px solid black'}
        borderRadius={'10px'}
        // paddingLeft={'12px'}
        // paddingRight={'10px'}
        paddingTop={'4px'}
        paddingBottom={'5px'}
        lineHeight={'1.0'}
        overflow={'hidden'}
        whiteSpace="nowrap"
      >
        <Box
          overflow={'hidden'}
          height={'17px'}
          paddingLeft={'5px'}
          textOverflow="ellipsis"
        >
          {ticket.owner}
        </Box>
        <Box
          fontSize={'32px'}
          marginTop={'5px'}
          fontFamily="monospace"
          display={'flex'}
          justifyContent={'center'}
          width={'100%'}
        >
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
