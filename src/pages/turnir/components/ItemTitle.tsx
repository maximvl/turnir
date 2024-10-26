import { mdiCross } from '@mdi/js'
import Icon from '@mdi/react'
import { Casino, ChangeCircle, Shield } from '@mui/icons-material'
import { Box } from '@mui/material'
import { Item } from 'pages/turnir/types'

type Props = {
  item: Item
  fontSize?: number
}

export default function ItemTitle(props: Props) {
  return (
    <Box
      display="flex"
      alignItems="center"
      style={{ fontSize: props.fontSize || '18px' }}
    >
      {props.item.title}
      {props.item.isProtected && (
        <Shield sx={{ marginLeft: 1 }} color={'success'} />
      )}
      {props.item.swappedWith && (
        <ChangeCircle sx={{ marginLeft: 1 }} color={'warning'} />
      )}
      {props.item.isResurrected && (
        <Icon
          path={mdiCross}
          style={{ width: 24, height: 24, marginLeft: 7 }}
          color="white"
        />
      )}
      {props.item.hasDeal && <Casino sx={{ marginLeft: 1 }} color="action" />}
    </Box>
  )
}
