import { Box, Tooltip } from '@mui/material'
import { formatUnixToDate } from './utils'
import { useQueries, useQuery } from '@tanstack/react-query'
import { fetchLotoWinners, LotoWinner } from '../turnir/api'
import useLocalStorage from '@/common/hooks/useLocalStorage'
import { ChatConnection } from '../turnir/types'

export default function WinnersList() {
  const { value: chatConnections } = useLocalStorage<ChatConnection[]>({
    key: 'chat-connections',
    defaultValue: [],
  })
  const { value: channel } = useLocalStorage<string>({ key: 'chat_channel' })
  const { value: platform } = useLocalStorage<string>({ key: 'chat_platform' })

  const queries = chatConnections.map((connection) => {
    return {
      queryKey: ['loto-winners', connection.server, connection.channel],
      queryFn: () => {
        return fetchLotoWinners(connection.server, connection.channel)
      },
    }
  })

  const results = useQueries({ queries })

  let pastLotoWinners: LotoWinner[] = []
  results.map(({ data: winnersList }) => {
    if (winnersList && winnersList.winners) {
      pastLotoWinners = [...pastLotoWinners, ...winnersList.winners]
    }
  })

  pastLotoWinners.sort((a, b) => b.created_at - a.created_at)

  return (
    <Box
      marginTop="20px"
      padding="10px"
      borderRadius="5px"
      style={{ backgroundColor: '#654b3c' }}
    >
      Прошлые победители:
      {pastLotoWinners.map((winner, i) => {
        let icon = null
        if (winner.super_game_status === 'win') {
          icon = (
            <Tooltip title="Победил в супер-игре" placement="top">
              <img
                src="https://cdn.7tv.app/emote/01F9FS6EEG0006XXD6DX0K9Y04/3x.avif"
                width="25px"
              />
            </Tooltip>
          )
        }

        if (winner.super_game_status === 'lose') {
          icon = (
            <Tooltip title="Проиграл в супер-игре" placement="top">
              <img
                src="https://cdn.7tv.app/emote/01H96150H00003CY09NFH3G999/3x.avif"
                height="25px"
              />
            </Tooltip>
          )
        }

        let iconLink = 'https://cdn-icons-png.flaticon.com/512/7261/7261483.png'
        if (winner.stream_channel.startsWith('twitch')) {
          iconLink = 'https://cdn-icons-png.flaticon.com/512/3992/3992643.png'
        }
        if (winner.stream_channel.startsWith('vkvideo')) {
          iconLink =
            'https://vkvideo.ru/images/icons/favicons/fav_vk_video_2x.ico?8'
        }

        return (
          <Box key={i} display="flex" alignItems="center" whiteSpace="nowrap">
            <Tooltip title={winner.stream_channel} placement="top">
              <img src={iconLink} width="25px" />
            </Tooltip>
            <span style={{ marginLeft: '10px' }} />
            {formatUnixToDate(winner.created_at)} {winner.username}
            <span style={{ marginLeft: '10px' }} />
            {icon}
          </Box>
        )
      })}
    </Box>
  )
}
