import { Box, useTheme } from '@mui/material'

type Props = {
  value: string
  big?: boolean
  matchAnimation?: boolean
  variant?: 'green' | 'grey'
}

export default function DrawnNumber({
  value,
  big,
  matchAnimation,
  variant,
}: Props) {
  const theme = useTheme()
  let color = theme.palette.error.main
  if (variant === 'green') {
    color = theme.palette.success.main
  }
  if (variant === 'grey') {
    color = theme.palette.grey[500]
  }

  return (
    <Box
      className={matchAnimation ? 'enlarge-item' : ''}
      border={`3px solid ${color}`}
      borderRadius={'50%'}
      // paddingLeft={'5px'}
      // paddingRight={'5px'}
      color={color}
      width={big ? '68px' : '54px'}
      height={big ? '68px' : '54px'}
      style={{
        fontSize: big ? '42px' : '32px',
        fontFamily: 'monospace',
        backgroundColor: '#f4e1c7',
      }}
      textAlign="center"
    >
      {value}
    </Box>
  )
}
