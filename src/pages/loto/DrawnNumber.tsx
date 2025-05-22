import { Box, useTheme } from '@mui/material'
import { motion, useAnimation, useTime, useTransform } from 'framer-motion'
import React, { useEffect, useTransition } from 'react'

export type Variant = 'match' | 'empty' | 'inactive' | 'active'

type Props = {
  children?: React.ReactNode
  big?: boolean
  matchAnimation?: boolean
  variant: Variant
  animationColor?: string
  selected?: boolean
}

export default function DrawnNumber({
  children,
  big,
  matchAnimation,
  variant,
  animationColor,
  selected,
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

  const time = useTime()
  const rotate = useTransform(time, [0, 3000], [0, 360], {
    clamp: false,
  })

  const rotatingBg = useTransform(rotate, (r) => {
    return `conic-gradient(from ${r}deg, #ff4545, #00ff99, #006aff, #ff0095, #ff4545)`
  })

  const size = big ? 68 : 54
  const borderWidth = 4

  // Animated gradient border
  if (selected) {
    return (
      <motion.div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          padding: 4,
          background: rotatingBg,
        }}
      >
        <Box
          display="flex"
          alignContent="center"
          justifyContent="center"
          alignItems="center"
          className={matchAnimation ? 'enlarge-item' : ''}
          borderRadius={'50%'}
          color={color}
          width={size}
          height={size}
          // border={`3px solid ${borderColorValue}`}
          style={{
            fontSize: big ? '42px' : '32px',
            fontFamily: 'monospace',
            backgroundColor,
          }}
          textAlign="center"
          overflow="hidden"
        >
          {children}
        </Box>
      </motion.div>
    )
  }

  // Original solid border for other variants
  return (
    <Box
      display="flex"
      alignContent="center"
      justifyContent="center"
      alignItems="center"
      className={matchAnimation ? 'enlarge-item' : ''}
      borderRadius={'50%'}
      color={color}
      width={size}
      height={size}
      border={`3px solid ${borderColorValue}`}
      style={{
        fontSize: big ? '42px' : '32px',
        fontFamily: 'monospace',
        backgroundColor,
      }}
      textAlign="center"
      overflow="hidden"
    >
      {children}
    </Box>
  )
}
