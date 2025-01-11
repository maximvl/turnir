import { Box, useTheme } from '@mui/material'
import wood from '@/assets/wood.png'

type Props = {
  value: string
  big?: boolean
  matchAnimation?: boolean
  highlight?: boolean
}

export default function DrawnNumber({
  value,
  big,
  matchAnimation,
  highlight,
}: Props) {
  const theme = useTheme()
  const color = highlight
    ? theme.palette.success.main
    : theme.palette.error.main
  return (
    <Box
      className={matchAnimation ? 'enlarge-item' : ''}
      border={`3px solid ${color}`}
      borderRadius={'50%'}
      paddingLeft={'5px'}
      paddingRight={'5px'}
      color={color}
      width={'fit-content'}
      style={{
        fontSize: big ? '42px' : '32px',
        fontFamily: 'monospace',
        backgroundColor: '#f4e1c7',
      }}
    >
      {value}
    </Box>
  )
}
