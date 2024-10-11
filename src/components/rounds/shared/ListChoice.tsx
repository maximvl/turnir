import { Grid } from '@mui/material'
import SelectItem from 'components/SelectItem'
import { Item } from 'types'

type Props = {
  items: Item[]
  onSelect: (id: string) => void
}

export default function ListChoice({ items, onSelect }: Props) {
  const onSelectItem = (id: string) => {
    onSelect(id)
  }

  return (
    <Grid container columns={1} rowGap={1}>
      {items.map((item, index) => {
        return (
          <Grid item xs={1} key={index}>
            <SelectItem
              item={item}
              selected={false}
              onItemClick={onSelectItem}
              highlightOnHover
            />
          </Grid>
        )
      })}
    </Grid>
  )
}
