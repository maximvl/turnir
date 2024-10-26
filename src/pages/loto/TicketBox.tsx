import { Box } from '@mui/material'
import { Ticket } from './types'

type Props = {
  ticket: Ticket
}

export default function TicketBox({ ticket }: Props) {
  return (
    <Box
      border={'1px solid grey'}
      borderRadius={'10px'}
      paddingLeft={'10px'}
      paddingRight={'10px'}
      paddingTop={'5px'}
      paddingBottom={'5px'}
      marginTop={'20px'}
      marginRight={'20px'}
      lineHeight={'1.0'}
    >
      {ticket.owner}
      <Box fontSize={'32px'} marginTop={'10px'}>
        {ticket.value}
      </Box>
    </Box>
  )
}
