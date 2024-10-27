import { Box, useTheme } from '@mui/material'
import { Ticket } from './types'

type Props = {
  ticket: Ticket
  matches: number[]
}

export default function TicketBox({ ticket, matches }: Props) {
  const theme = useTheme()
  const digits = ticket.value.split('')
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
      <Box fontSize={'32px'} marginTop={'10px'} fontFamily="monospace">
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
  )
}
