import { Box, Tooltip, useTheme } from '@mui/material'
import { Fragment } from 'react'
import { Ticket } from './types'
import TicketImg1 from '@/assets/ticket1.svg'
import TicketImg2 from '@/assets/ticket2.svg'
import TicketImg3 from '@/assets/ticket3.svg'
import TicketImg4 from '@/assets/ticket4.svg'
import AnimeBackground from '@/assets/sakura1.webp'
import { isBrightColor, VkColorsMap } from './utils'
import { ChatUser } from '@/pages/turnir/api'
import { ChatServerType } from '../turnir/types'

type MatchRange = {
  start: number
  end: number
}

type Props = {
  ticket: Ticket
  owner?: ChatUser
  matches: number[]
  isWinner?: boolean
  big?: boolean
  superHighlight?: boolean
}

const ServerIcons: { [k in ChatServerType]: string } = {
  twitch: 'https://cdn-icons-png.flaticon.com/512/3992/3992643.png',
  vkvideo: 'https://vkvideo.ru/images/icons/favicons/fav_vk_video_2x.ico?8',
  kick: 'https://kick.com/favicon.ico',
  goodgame: 'https://static.goodgame.ru/images/favicon/favicon-32x32.png',
  nuum: 'https://cdn-icons-png.flaticon.com/512/7261/7261483.png',
}

export default function TicketBox({
  ticket,
  matches,
  owner,
  isWinner,
  big,
  superHighlight,
}: Props) {
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

  const doSuperHighlight =
    superHighlight && matches.every((match) => match === 1)

  const highlightColor = theme.palette.error.main
  const winnerColor = theme.palette.warning.main

  const vkBadges = owner?.vk_fields?.badges || []
  const vkRoles = owner?.vk_fields?.roles || []

  const isAnime = vkRoles.some((role) => role.name === 'Анимеёб')

  const twitchColor = owner?.twitch_fields?.color
  const twitchBadges = owner?.twitch_fields?.badges || []

  const darkTextColor = '#1E3E62'
  const darkTextHighlight = '#800000'
  const darkTextWin = '#3C0753'

  const userColor =
    VkColorsMap[owner?.vk_fields?.nickColor ?? -1] || twitchColor || '#FFFFFF'

  const isUserColorBright = isBrightColor(userColor)
  const nickBackgroundColor = isUserColorBright ? '#191970' : '#B2AC88'

  const gradients = [
    'radial-gradient(circle, rgba(63,94,251,1) 0%, rgba(252,70,107,1) 100%)',
    'radial-gradient(circle, rgba(63,94,251,1) 0%, rgba(255,165,0,1) 100%)',
    'radial-gradient(circle, rgba(56,173,169,1) 0%, rgba(54,54,206,1) 100%)',
    'radial-gradient(circle, rgba(74,85,227,1) 0%, rgba(234,88,12,1) 100%)',
    'radial-gradient(circle, rgba(32,74,112,1) 0%, rgba(20,34,74,1) 100%)',
    'radial-gradient(circle, rgba(25,25,112,1) 0%, rgba(128,0,128,1) 100%)',
    'radial-gradient(circle, rgba(102,126,234,1) 0%, rgba(118,75,162,1) 100%)',
    'radial-gradient(circle, rgba(131,58,180,1) 0%, rgba(253,114,114,1) 100%)',
  ]

  let ticketBackground = ticket.color
  if (ticket.type === 'points' || twitchBadges.length > 0) {
    ticketBackground = gradients[ticket.variant]
  }
  if (isAnime) {
    ticketBackground = `url(${AnimeBackground})`
  }

  const itemSize = big ? '36px' : '24px'

  const channelName = `${ticket.source.server}/${ticket.source.channel}`
  const iconLink = ServerIcons[ticket.source.server]

  return (
    <Box position="relative">
      <Box
        style={{
          backgroundColor: ticket.color,
          backgroundImage: isAnime ? `url(${AnimeBackground})` : 'none',
          backgroundSize: 'cover',
          background: ticketBackground,
        }}
        border={
          isWinner ? `2px solid ${winnerColor}` : `2px solid ${userColor}`
        }
        borderRadius={'10px'}
        paddingTop={'5px'}
        paddingBottom={'5px'}
        paddingLeft={'10px'}
        paddingRight={'10px'}
        lineHeight={'1.0'}
      >
        <Box
          display={'flex'}
          justifyContent={'center'}
          textAlign={'center'}
          alignItems={'center'}
          fontSize={itemSize}
          position="relative"
        >
          <Box
            display="flex"
            width={'fit-content'}
            style={{
              backgroundColor: nickBackgroundColor,
            }}
          >
            {vkBadges.map((badge, index) => {
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
                    width={itemSize}
                    alt={'badge'}
                  />
                </Tooltip>
              )
            })}
            {vkRoles.map((role, index) => {
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
                    width={itemSize}
                    alt={'role'}
                  />
                </Tooltip>
              )
            })}
            {twitchBadges.map((badge, index) => {
              return (
                <Tooltip
                  title={badge.title}
                  placement="top"
                  style={{ marginRight: '5px' }}
                  key={index}
                >
                  <img
                    key={index}
                    src={badge.image_url_4x}
                    width={itemSize}
                    height={itemSize}
                    alt={'badge'}
                  />
                </Tooltip>
              )
            })}
            <span style={{ color: userColor }}>{ticket.owner_name}</span>
          </Box>
          <Box
            position="absolute"
            right={'0px'}
            top={'0px'}
            style={
              ticket.source.server === 'goodgame'
                ? { backgroundColor: 'black' }
                : {}
            }
          >
            <Tooltip title={channelName} placement="top">
              <img src={iconLink} width={itemSize} height={itemSize} alt={''} />
            </Tooltip>
          </Box>
        </Box>
        <Box
          fontSize={itemSize}
          marginTop={'5px'}
          fontFamily="monospace"
          display={'flex'}
          justifyContent={'center'}
          width={'100%'}
          className={doSuperHighlight ? 'color-animation' : ''}
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

            if (doSuperHighlight) {
              delete style.color
            }

            return (
              <Fragment key={index}>
                {addSpace && (
                  <span
                    style={{
                      color: style.color,
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
