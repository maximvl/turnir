import { Box } from '@mui/material'
import DrawnNumber from './DrawnNumber'
import Flipper from './Flipper'

type Props = {
  options: string[]
  revealedOptionsIds: number[]
  onOptionClick: (id: number) => void
  matches: number[]
  revealAll?: boolean
}

export default function SuperGameBox({
  options,
  revealedOptionsIds,
  onOptionClick,
  matches,
  revealAll,
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
        const match = matches.includes(index)

        const hiddenValue = revealAll ? option : '?'

        return (
          <Box
            onClick={() => onOptionClick(index)}
            key={index}
            style={{ cursor: 'pointer' }}
          >
            <Flipper
              frontSide={
                <DrawnNumber
                  value={hiddenValue}
                  variant={revealAll ? 'grey' : undefined}
                />
              }
              backSide={
                <DrawnNumber
                  value={option}
                  variant={match ? 'green' : undefined}
                />
              }
              disabled={revealAll || revealed}
            />
          </Box>
        )
      })}
    </Box>
  )
}
