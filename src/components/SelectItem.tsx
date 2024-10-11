import { Box, Chip, Divider, useTheme } from '@mui/material'
import ItemTitle from 'components/ItemTitle'
import { useState } from 'react'
import { Item } from 'types'

type Props = {
  item: Item
  selected: boolean
  onItemClick: (id: string) => void
  highlightOnHover?: boolean
}

export default function SelectItem({
  item,
  selected,
  onItemClick,
  highlightOnHover,
}: Props) {
  const theme = useTheme()
  const [isHovered, setIsHovered] = useState(false)

  const onClick = selected
    ? onItemClick
    : () => {
        highlightOnHover && onItemClick(item.id)
      }

  const highlightStyle = {
    backgroundColor: theme.palette.error.light,
  }

  let highlight = false
  if (highlightOnHover && isHovered) {
    highlight = true
  } else if (selected) {
    highlight = true
  }

  return (
    <Chip
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      label={
        <Box display="flex">
          <span
            style={{
              fontSize: '20px',
              marginRight: '5px',
              color: highlight ? 'white' : '#ff9800',
            }}
          >
            {item.id}
          </span>
          <Divider
            orientation="vertical"
            flexItem
            style={{
              marginRight: '5px',
              backgroundColor: highlight ? 'white' : '#757575',
            }}
          />
          <ItemTitle item={item} />
        </Box>
      }
      style={highlight ? highlightStyle : {}}
      onClick={() => onClick(item.id)}
    />
  )
}
