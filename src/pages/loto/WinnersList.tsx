import { Box, Tooltip } from '@mui/material'
import { formatUnixToDate } from './utils'
import { useQuery } from '@tanstack/react-query'
import { fetchLotoWinners } from '../turnir/api'
import useLocalStorage from '@/common/hooks/useLocalStorage'

export default function WinnersList() {
  const { value: channel } = useLocalStorage({ key: 'chat_channel' })
  const { value: platform } = useLocalStorage({ key: 'chat_platform' })

  const { data: pastLotoWinnersData } = useQuery({
    queryKey: ['loto-winners'],
    queryFn: () => fetchLotoWinners(platform, channel),
  })

  let pastLotoWinners = pastLotoWinnersData?.winners || []
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

        return (
          <Box key={i} display="flex" alignItems="center" whiteSpace="nowrap">
            {formatUnixToDate(winner.created_at)} {winner.username}
            <span style={{ marginLeft: '10px' }} />
            {icon}
          </Box>
        )
      })}
    </Box>
  )
}
