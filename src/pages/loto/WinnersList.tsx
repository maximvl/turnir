import { Box } from '@mui/material'
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
            <img
              src="https://cdn.betterttv.net/emote/5590b223b344e2c42a9e28e3/3x.webp"
              width="25px"
            />
          )
        }

        if (winner.super_game_status === 'lose') {
          icon = (
            <img
              src="https://cdn.7tv.app/emote/01H96150H00003CY09NFH3G999/3x.avif"
              height="25px"
            />
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
