import { Box, useTheme } from '@mui/material'

export type Variant = 'match' | 'empty' | 'inactive' | 'active'

type Props = {
  children?: React.ReactNode
  big?: boolean
  matchAnimation?: boolean
  variant: Variant
  animationColor?: string
}

export default function DrawnNumber({
  children,
  big,
  matchAnimation,
  variant,
  animationColor,
}: Props) {
  const theme = useTheme()
  let color = theme.palette.error.main
  if (variant === 'empty') {
    color = theme.palette.error.main
  }
  if (variant === 'match') {
    color = theme.palette.success.main
  }
  if (variant === 'inactive') {
    color = theme.palette.grey[500]
  }
  if (variant === 'active') {
    color = theme.palette.secondary.dark
  }

  const borderColorValue =
    variant === 'inactive' ? theme.palette.grey[500] : color

  const backgroundColor = animationColor ?? '#f4e1c7'

  return (
    <Box
      display="flex"
      alignContent="center"
      justifyContent="center"
      alignItems="center"
      className={matchAnimation ? 'enlarge-item' : ''}
      border={`3px solid ${borderColorValue}`}
      borderRadius={'50%'}
      color={color}
      width={big ? '68px' : '54px'}
      height={big ? '68px' : '54px'}
      style={{
        fontSize: big ? '42px' : '32px',
        fontFamily: 'monospace',
        backgroundColor,
      }}
      textAlign="center"
    >
      {children}
    </Box>
  )
}
