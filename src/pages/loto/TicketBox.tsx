import { Box, Tooltip, useTheme } from '@mui/material'
import { Fragment } from 'react'
import { Ticket2 as Ticket } from './types'
import TicketImg1 from '@/assets/ticket1.svg'
import TicketImg2 from '@/assets/ticket2.svg'
import TicketImg3 from '@/assets/ticket3.svg'
import TicketImg4 from '@/assets/ticket4.svg'
import AnimeBackground from '@/assets/sakura1.webp'
import { VkColorsMap } from './utils'
import { ChatUser } from '@/pages/turnir/api'

type MatchRange = {
  start: number
  end: number
}

type Props = {
  ticket: Ticket
  owner?: ChatUser
  matches: number[]
  isWinner?: boolean
}

export default function TicketBox({ ticket, matches, owner, isWinner }: Props) {
  const theme = useTheme()

  // const Ticket = [TicketImg1, TicketImg2, TicketImg3, TicketImg4][
  //   ticket.variant - 1
  // ]

  let maxRange: MatchRange | null = null
  const matchRanges: MatchRange[] = []
  const hasMatches = matches.some((match) => match === 1)
  if (isWinner || hasMatches) {
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
    if (currentRange !== null) {
      matchRanges.push(currentRange)
    }

    maxRange = matchRanges.reduce((prev, current) =>
      prev.end - prev.start > current.end - current.start ? prev : current
    )
  }

  const highlightColor = theme.palette.error.main
  const winnerColor = theme.palette.warning.main

  const badges = owner?.vk_fields?.badges || []
  const roles = owner?.vk_fields?.roles || []

  const isAnime = roles.some((role) => role.name === 'Анимеёб')

  const darkTextColor = '#1E3E62'
  const darkTextHighlight = '#800000'
  const darkTextWin = '#3C0753'

  const userColor = VkColorsMap[owner?.vk_fields?.nickColor ?? -1] || 'white'

  const gradients = [
    'radial-gradient(circle, rgba(63,94,251,1) 0%, rgba(252,70,107,1) 100%)',
    'radial-gradient(circle, rgba(63,94,251,1) 0%, rgba(255,165,0,1) 100%)',
    'radial-gradient(circle, rgba(32,178,170,1) 0%, rgba(255,127,80,1) 100%)',
    'radial-gradient(circle, rgba(75,0,130,1) 0%, rgba(64,224,208,1) 100%)',
    'radial-gradient(circle, rgba(0,255,127,1) 0%, rgba(138,43,226,1) 100%)',
    'radial-gradient(circle, rgba(25,25,112,1) 0%, rgba(128,0,128,1) 100%)',
    'radial-gradient(circle, rgba(0,100,100,1) 0%, rgba(138,54,15,1) 100%)',
    'radial-gradient(circle, rgba(139,0,0,1) 0%, rgba(204,85,0,1) 100%)',
  ]

  let ticketBackground = ticket.color
  if (isAnime) {
    ticketBackground = `url(${AnimeBackground})`
  }
  if (ticket.source === 'points') {
    ticketBackground = gradients[ticket.variant]
  }

  return (
    <Box position="relative">
      {/* <Ticket width={'auto'} height={'80px'} style={{ color: ticket.color }} /> */}
      <Box
        // position="absolute"
        // top={'8px'}
        // left={'15px'}
        style={{
          backgroundColor: ticket.color,
          backgroundImage: isAnime ? `url(${AnimeBackground})` : 'none',
          backgroundSize: 'cover',
          background: ticketBackground,
        }}
        // width={'140px'}
        // height={'64px'}
        border={isWinner ? `2px solid ${winnerColor}` : '2px solid #333333'}
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
          display={'flex'}
          alignItems={'center'}
          width={'fit-content'}
          style={{
            backgroundColor: '#333333',
          }}
          fontSize={'24px'}
        >
          {badges.map((badge, index) => {
            return (
              <Tooltip
                title={badge.name}
                placement="top"
                style={{ marginRight: '5px' }}
                key={index}
              >
                <img
                  key={index}
                  src={badge.largeUrl}
                  width={'24px'}
                  alt={'badge'}
                />
              </Tooltip>
            )
          })}
          {roles.map((role, index) => {
            return (
              <Tooltip
                title={role.name}
                placement="top"
                style={{ marginRight: '5px' }}
                key={index}
              >
                <img
                  key={index}
                  src={role.largeUrl}
                  width={'24px'}
                  alt={'role'}
                />
              </Tooltip>
            )
          })}
          <span style={{ color: userColor }}>{ticket.owner_name}</span>
        </Box>
        <Box
          fontSize={'24px'}
          marginTop={'5px'}
          fontFamily="monospace"
          display={'flex'}
          justifyContent={'center'}
          width={'100%'}
        >
          {ticket.value.map((value, index) => {
            const addSpace = index !== 0
            let style: { [k: string]: string } = {}
            if (isAnime) {
              style = { color: darkTextColor }
            }

            if (matches[index]) {
              style = { color: highlightColor, textDecoration: 'line-through' }
              if (isAnime) {
                style.color = darkTextHighlight
              }
            }
            if (
              isWinner &&
              maxRange &&
              maxRange.start <= index &&
              index <= maxRange.end
            ) {
              style = { color: winnerColor, textDecoration: 'line-through' }
              if (isAnime) {
                style.color = darkTextWin
              }
            }

            const isWithinRange = matchRanges.some(
              (range) => range.start < index && index <= range.end
            )

            return (
              <Fragment key={index}>
                {addSpace && (
                  <span
                    style={{
                      color: style.color || 'white',
                      textDecoration: isWithinRange ? 'line-through' : '',
                    }}
                  >
                    &nbsp;
                  </span>
                )}
                <span style={style}>{value}</span>
              </Fragment>
            )
          })}
        </Box>
      </Box>
    </Box>
  )
}
