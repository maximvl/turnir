import { Box, useTheme } from '@mui/material'
import { SuperGameGuess, SuperGameResultItem } from './types'

type Props = {
  result: (SuperGameResultItem | null)[]
  guess: SuperGameGuess
  guessesAmount: number
}

export default function SuperGamePlayerStats({
  result,
  guess,
  guessesAmount,
}: Props) {
  const theme = useTheme()

  const guessed = guess.value.map((val) => val + 1)
  const remainingAmount = guessesAmount - guessed.length
  const isFinished =
    remainingAmount === 0 && result.every((val) => val !== null)

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

  // console.log('res', result)

  const showSuperWin = score === 10

  let scoreHeader = (
    <Box>
      {guess.owner_name} очки:&nbsp;
      {score}
    </Box>
  )

  if (isFinished && score > 0) {
    scoreHeader = (
      <Box display="flex" justifyContent="center" alignItems="center">
        <img
          src="https://freepngimg.com/download/mouth/92712-ear-head-twitch-pogchamp-emote-free-download-png-hq.png"
          style={{ width: '64px', marginRight: '15px' }}
        />
        {guess.owner_name} очки: {score}
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

  if (isFinished && score === 0) {
    scoreHeader = (
      <Box display="flex" justifyContent="center" alignItems="center">
        <img
          src="https://cdn.betterttv.net/emote/656c936c06a047dd60c2de5e/3x.webp"
          style={{ width: '48px', marginRight: '15px' }}
        />
        {guess.owner_name} проигрывает
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

  if (showSuperWin) {
    scoreHeader = (
      <Box justifyContent="center" alignItems="center">
        <img
          src="https://s13.gifyu.com/images/b2NwE.gif"
          style={{ width: '300px', marginRight: '15px' }}
        />
        <Box>{guess.owner_name} угадывает ВСЁ</Box>
      </Box>
    )
  }

  return (
    <Box>
      {scoreHeader}
      <span style={{ fontFamily: 'monospace' }}>
        &nbsp;
        {guessed.map((val, i) => {
          const display = val < 10 ? `0${val}` : val
          const itemResult = result[i]
          const isRevealed = itemResult !== null
          const isEmpty = itemResult === 'empty'

          // console.log('result', itemResult, val, i, isRevealed, isEmpty)

          let color = theme.palette.text.secondary
          if (isRevealed && !isEmpty) {
            color = theme.palette.success.main
          }
          if (isRevealed && isEmpty) {
            color = theme.palette.error.main
          }

          return (
            <span key={i} style={{ color }}>
              {display}&nbsp;
            </span>
          )
        })}
        {Array.from({ length: remainingAmount }).map((_, i) => (
          <span key={i} style={{ color: theme.palette.text.secondary }}>
            {'--'}&nbsp;
          </span>
        ))}
      </span>
    </Box>
  )
}
