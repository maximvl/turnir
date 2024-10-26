import { Box } from '@mui/material'
import SelectItem from '../../SelectItem'
import { Item } from 'pages/turnir/types'

type Props = {
  items: Item[]
  onSelect: (id: string) => void
}

export default function ListChoice({ items, onSelect }: Props) {
  const onSelectItem = (id: string) => {
    onSelect(id)
  }

  return (
    <Box display="flex" justifyContent="center">
      <Box width="fit-content" textAlign="left">
        {items.map((item, index) => {
          return (
            <Box key={index} marginBottom={'15px'}>
              <SelectItem
                item={item}
                selected={false}
                onItemClick={onSelectItem}
                highlightOnHover
              />
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
