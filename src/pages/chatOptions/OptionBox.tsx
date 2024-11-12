import { Box } from '@mui/material'
import { Option } from './types'

type Props = {
  option: Option
}

export default function OptionBox({ option }: Props) {
  return (
    <Box
      style={{ backgroundColor: '#444444' }}
      width={'fit-content'}
      minWidth={'200px'}
    >
      <Box>{option.user.username}</Box>
      <Box>{option.text}</Box>
    </Box>
  )
}
