import { Box } from '@mui/material'
import { SuperGameResultItem } from './types'

type Props = {
  result: SuperGameResultItem[]
  owner_name: string
  guessesAmount: number
}

export default function SuperGamePlayerStats({
  result,
  owner_name,
  guessesAmount,
}: Props) {
  const revealedAmount = result.length

  const isFinished = revealedAmount === guessesAmount
  const score =
    result.reduce((acc, val) => {
      if (val === 'x1') {
        return acc + 1
      }
      if (val === 'x2') {
        return acc + 2
      }
      if (val === 'x3') {
        return acc + 3
      }
      return acc
    }, 0) || 0

  if (!isFinished) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center">
        {owner_name} очки: {score} ({revealedAmount}/{guessesAmount})
      </Box>
    )
  }

  const showSuperWin = score === 10
  if (showSuperWin) {
    return (
      <Box justifyContent="center" alignItems="center">
        <img
          src="https://s13.gifyu.com/images/b2NwE.gif"
          style={{ width: '300px', marginRight: '15px' }}
        />
        <Box>{owner_name} угадывает ВСЁ</Box>
      </Box>
    )
  }

  if (score > 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center">
        <img
          src="https://freepngimg.com/download/mouth/92712-ear-head-twitch-pogchamp-emote-free-download-png-hq.png"
          style={{ width: '64px', marginRight: '15px' }}
        />
        {owner_name} очки: {score}
        <img
          src="https://freepngimg.com/download/mouth/92712-ear-head-twitch-pogchamp-emote-free-download-png-hq.png"
          style={{
            width: '64px',
            marginLeft: '15px',
            transform: 'rotateY(180deg)',
          }}
        />
      </Box>
    )
  }
  return (
    <Box display="flex" justifyContent="center" alignItems="center">
      <img
        src="https://cdn.betterttv.net/emote/656c936c06a047dd60c2de5e/3x.webp"
        style={{ width: '48px', marginRight: '15px' }}
      />
      {owner_name} проигрывает
      <img
        src="https://cdn.betterttv.net/emote/656c936c06a047dd60c2de5e/3x.webp"
        style={{
          width: '48px',
          marginLeft: '15px',
          transform: 'rotateY(180deg)',
        }}
      />
    </Box>
  )
}
