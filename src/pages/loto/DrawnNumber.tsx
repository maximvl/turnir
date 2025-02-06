import { Box, useTheme } from '@mui/material'

export type Variant = 'green' | 'grey' | 'orange'

type Props = {
  children?: React.ReactNode
  big?: boolean
  matchAnimation?: boolean
  variant?: Variant
}

export default function DrawnNumber({
  children,
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
  if (variant === 'orange') {
    color = theme.palette.info.main
  }

  return (
    <Box
      display="flex"
      alignContent="center"
      justifyContent="center"
      alignItems="center"
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
      {children}
    </Box>
  )
}
