import { Box } from '@mui/material'
import DrawnNumber from './DrawnNumber'

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
        let variant: 'green' | 'grey' | undefined = undefined
        const revealed = revealedOptionsIds.includes(index)
        const match = matches.includes(index)

        if (match) {
          variant = 'green'
        }

        if (!match && !revealed && revealAll) {
          variant = 'grey'
        }

        let value = '?'
        if (revealed || revealAll) {
          value = option
        }

        return (
          <Box
            onClick={() => onOptionClick(index)}
            key={index}
            style={{ cursor: 'pointer' }}
          >
            <DrawnNumber value={value} variant={variant} />
          </Box>
        )
      })}
    </Box>
  )
}
