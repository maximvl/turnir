import { Box } from '@mui/material'
import DrawnNumber, { Variant } from './DrawnNumber'
import Flipper from './Flipper'
import { SuperGameResultItem } from './types'

type Props = {
  options: SuperGameResultItem[]
  revealedOptionsIds: number[]
  onOptionReveal: (id: number) => void
  revealAll?: boolean
  selected: number[]
}

export default function SuperGameBox({
  options,
  revealedOptionsIds,
  onOptionReveal,
  revealAll,
  selected,
}: Props) {
  return (
    <Box
      display="flex"
      justifyContent="center"
      flexWrap="wrap"
      textAlign="center"
      width="630px"
      gap="10px"
    >
      {options.map((option, index) => {
        const revealed = revealedOptionsIds.includes(index)
        const displayItem = <DisplayItem item={option} />

        const hiddenValue = revealAll
          ? displayItem
          : (index + 1).toString().padStart(2, '0')

        const clickable =
          selected.includes(index) && !revealedOptionsIds.includes(index)

        let frontVariant: Variant = 'grey'
        if (selected.includes(index)) {
          frontVariant = 'orange'
        }
        if (revealed && option !== 'empty') {
          frontVariant = 'green'
        }

        return (
          <Box key={index} style={{ cursor: clickable ? 'pointer' : 'none' }}>
            <Flipper
              frontSide={
                <DrawnNumber variant={frontVariant}>{hiddenValue}</DrawnNumber>
              }
              backSide={
                <DrawnNumber variant={option === 'empty' ? undefined : 'green'}>
                  {displayItem}
                </DrawnNumber>
              }
              disabled={!clickable}
              onFlip={() => onOptionReveal(index)}
            />
          </Box>
        )
      })}
    </Box>
  )
}

type DisplayProps = {
  item: SuperGameResultItem
}

function DisplayItem({ item }: DisplayProps) {
  if (item === 'x1') {
    return (
      <img
        src="https://images.live.vkvideo.ru/smile/2ec232fd-bb31-4122-b3d1-4c8e7b721561/icon/size/medium"
        width="30px"
        height="30px"
        alt="option"
      />
    )
  }

  if (item === 'x2') {
    return (
      <img
        src="https://images.live.vkvideo.ru/smile/c78b5408-e42c-4aeb-b6f5-9ca21d73c0f1/icon/size/medium"
        width="30px"
        height="30px"
        alt="option"
      />
    )
  }

  if (item === 'x3') {
    return (
      <img
        src="https://freepngimg.com/download/mouth/92712-ear-head-twitch-pogchamp-emote-free-download-png-hq.png"
        width="40px"
        height="40px"
        alt="option"
      />
    )
  }
  return null
}
