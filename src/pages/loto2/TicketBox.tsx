import { Box, useTheme } from '@mui/material'
import { Ticket2 as Ticket } from './types'
import { ReactComponent as TicketImg1 } from 'images/ticket1.svg'
import { ReactComponent as TicketImg2 } from 'images/ticket2.svg'
import { ReactComponent as TicketImg3 } from 'images/ticket3.svg'
import { ReactComponent as TicketImg4 } from 'images/ticket4.svg'

type MatchRange = {
  start: number
  end: number
}

type Props = {
  ticket: Ticket
  matches: number[]
  isWinner?: boolean
}

export default function TicketBox({ ticket, matches, isWinner }: Props) {
  const theme = useTheme()

  // const Ticket = [TicketImg1, TicketImg2, TicketImg3, TicketImg4][
  //   ticket.variant - 1
  // ]

  let maxRange: MatchRange | null = null
  if (isWinner) {
    const matchRanges: MatchRange[] = []
    // fill match ranges
    let currentRange: MatchRange | null = null
    for (let i = 0; i < matches.length; i++) {
      if (matches[i] === 1) {
        if (currentRange === null) {
          currentRange = { start: i, end: i }
        } else {
          currentRange.end = i
        }
      } else {
        if (currentRange !== null) {
          matchRanges.push(currentRange)
          currentRange = null
        }
      }
    }
    maxRange = matchRanges.reduce((prev, current) =>
      prev.end - prev.start > current.end - current.start ? prev : current
    )
  }

  const highlightColor = theme.palette.error.main
  const winnerColor = theme.palette.warning.main

  return (
    <Box position="relative">
      {/* <Ticket width={'auto'} height={'80px'} style={{ color: ticket.color }} /> */}
      <Box
        // position="absolute"
        // top={'8px'}
        // left={'15px'}
        style={{ backgroundColor: ticket.color }}
        // width={'140px'}
        // height={'64px'}
        border={isWinner ? `2px solid ${winnerColor}` : '2px solid transparent'}
        borderRadius={'10px'}
        // paddingLeft={'12px'}
        // paddingRight={'10px'}
        paddingTop={'5px'}
        paddingBottom={'5px'}
        paddingLeft={'10px'}
        paddingRight={'10px'}
        lineHeight={'1.0'}
        // overflow={'hidden'}
        // whiteSpace="nowrap"
      >
        <Box
        // overflow={'hidden'}
        // height={'17px'}
        // paddingLeft={'5px'}
        // textOverflow="ellipsis"
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
          {ticket.value.map((value, index) => {
            const addSpace = index !== 0
            let style = {}
            if (matches[index]) {
              style = { color: highlightColor }
            }
            if (maxRange && maxRange.start <= index && index <= maxRange.end) {
              style = { color: winnerColor }
            }
            return (
              <span key={index} style={style}>
                {addSpace && <span>&nbsp;</span>}
                {value}
              </span>
            )
          })}
        </Box>
      </Box>
    </Box>
  )
}
