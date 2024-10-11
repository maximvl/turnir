import { GifBox } from '@mui/icons-material'
import { Avatar, Box, Chip, Divider, Grid, useTheme } from '@mui/material'
import { teal } from '@mui/material/colors'
import ItemTitle from 'components/ItemTitle'
import SelectItem from 'components/SelectItem'
import { Item } from 'types'
import InfoPanel from '../shared/InfoPanel'
import { BorderLinearProgress } from './BorderLinearProgress'

type Props = {
  items: Item[]
  onItemElimination?: (index: string) => void
  votes: string[]
  time?: number
  hideResults?: boolean
  winnerCheck?: (votes: number) => number
  showInfo?: boolean
}

const defaultWinnerCheck = (votes: number) => {
  return votes
}

export default function PollResults({
  items,
  votes,
  onItemElimination,
  time,
  hideResults,
  winnerCheck = defaultWinnerCheck,
  showInfo = true,
}: Props) {
  const theme = useTheme()

  let timePassed = undefined
  if (time !== undefined) {
    const seconds = time % 60
    const minutes = Math.floor(time / 60)
    const secondsString = seconds < 10 ? `0${seconds}` : `${seconds}`
    const minutesString = minutes < 10 ? `0${minutes}` : `${minutes}`
    timePassed = `${minutesString}:${secondsString}`
  }

  const onItemClick = (index: string) => {
    if (onItemElimination) {
      onItemElimination(index)
    }
  }

  const votesByOption = items.reduce(
    (acc, curr) => {
      acc[curr.id] = 0
      return acc
    },
    {} as { [key: string]: number }
  )

  for (const option of votes) {
    votesByOption[option] += 1
  }

  const winningVoteAmount = Object.values(votesByOption).reduce(
    (acc, votes) => Math.max(acc, winnerCheck(votes)),
    Object.values(votesByOption)[0] || 0
  )

  const itemIdsWithWinningVotes = Object.keys(votesByOption).filter(
    (key) => winnerCheck(votesByOption[key]) === winningVoteAmount
  )

  // const maxVotes = Object.values(votesByOption).reduce((acc, curr) => Math.max(acc, curr), 0);
  // const itemIdsWithMaxVotes = Object.keys(votesByOption).filter((key) => votesByOption[key] === maxVotes);
  const totalVotes = votes.length

  return (
    <div>
      <Box textAlign="center" display="grid" justifyContent={'center'}>
        <h2 style={{ margin: 0 }}>
          Результаты голосования {hideResults && 'скрыты'} ({totalVotes}){' '}
          {timePassed || ''}
        </h2>
        {showInfo && (
          <InfoPanel>
            <p style={{ whiteSpace: 'pre-wrap' }}>
              Голосуйте номером варианта в чате: '5' а не '555' или '5 5 5' и тд
              {'\n'}
              <u>МОЖНО МЕНЯТЬ ГОЛОС</u>, засчитывается самый последний
            </p>
          </InfoPanel>
        )}
      </Box>
      <Grid container columns={4} rowGap={1} marginTop={2}>
        {items.map((item, index) => {
          const highlight =
            totalVotes > 0 &&
            itemIdsWithWinningVotes.includes(item.id) &&
            !hideResults
          const currentVotes = votesByOption[item.id] || 0
          return (
            <Grid
              container
              columns={12}
              key={index}
              columnSpacing={4}
              alignItems="center"
            >
              <Grid item xs={7} textAlign="right">
                <SelectItem
                  item={item}
                  selected={highlight}
                  onItemClick={onItemClick}
                />
              </Grid>
              <Grid item xs={4}>
                <BorderLinearProgress
                  sx={{
                    backgroundColor: highlight
                      ? theme.palette.error.light
                      : null,
                  }}
                  variant="determinate"
                  value={hideResults ? 0 : (currentVotes / totalVotes) * 100}
                />
              </Grid>
              <Grid item xs={1} textAlign={'left'}>
                {hideResults ? '?' : currentVotes}
              </Grid>
            </Grid>
          )
        })}
      </Grid>
    </div>
  )
}
