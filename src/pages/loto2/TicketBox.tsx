import { Box, Tooltip, useTheme } from '@mui/material'
import { Fragment } from 'react'
import { Ticket2 as Ticket } from './types'
import { ReactComponent as TicketImg1 } from 'images/ticket1.svg'
import { ReactComponent as TicketImg2 } from 'images/ticket2.svg'
import { ReactComponent as TicketImg3 } from 'images/ticket3.svg'
import { ReactComponent as TicketImg4 } from 'images/ticket4.svg'
import AnimeBackground from 'images/sakura1.webp'
import { VkColorsMap } from './utils'

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

  const badges = ticket.owner.vk_fields?.badges || []
  const roles = ticket.owner.vk_fields?.roles || []

  const isAnime = roles.some((role) => role.name === 'Анимеёб')

  const darkTextColor = '#1E3E62'
  const darkTextHighlight = '#800000'
  const darkTextWin = '#3C0753'

  const userColor =
    VkColorsMap[ticket.owner.vk_fields?.nickColor ?? -1] || 'white'

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
            backgroundColor: isAnime ? 'black' : ticket.color,
          }}
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
                  width={'16px'}
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
                  width={'16px'}
                  alt={'role'}
                />
              </Tooltip>
            )
          })}
          <span style={{ color: userColor }}>{ticket.owner.username}</span>
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
