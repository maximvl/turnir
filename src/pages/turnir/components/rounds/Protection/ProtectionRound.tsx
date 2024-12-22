import { Button } from '@mui/material'
import { Shield } from '@mui/icons-material'
import { Item } from '@/pages/turnir/types'
import Wheel from '../shared/Wheel'
import InfoPanel from '../shared/InfoPanel'

type Props = {
  items: Item[]
  onItemProtection: (index: string) => void
}

export default function ProtectionRound({ items, onItemProtection }: Props) {
  const ProtectButton = ({
    children,
    ...props
  }: React.ComponentProps<typeof Button>): React.ReactElement => {
    return (
      <Button {...props} color="success">
        Защитить <Shield sx={{ marginLeft: 1 }} color={'action'} />
      </Button>
    )
  }

  return (
    <div style={{ display: 'grid', justifyContent: 'center' }}>
      <InfoPanel>
        <p>Случайный вариант получит одноразовую защиту от вылета</p>
      </InfoPanel>
      <Wheel
        items={items}
        onItemWinning={onItemProtection}
        ButtonComponent={ProtectButton}
      />
    </div>
  )
}
