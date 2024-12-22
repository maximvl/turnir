import { Box, useTheme } from '@mui/material'
import wood from '@/assets/wood.png'

type Props = {
  value: string
  big?: boolean
}

export default function DrawnNumber({ value, big }: Props) {
  const theme = useTheme()
  const red = theme.palette.error.main
  return (
    <Box
      border={`3px solid ${red}`}
      borderRadius={'50%'}
      paddingLeft={'5px'}
      paddingRight={'5px'}
      color={red}
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
