import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  useTheme,
} from '@mui/material'
import { Item } from 'pages/turnir/types'

type Props = {
  open: boolean
  onClose: () => void
  initialItem: Item
  actionItem: Item
}

export default function SwapRevealModal({
  open,
  onClose,
  initialItem,
  actionItem,
}: Props) {
  const theme = useTheme()
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Подмена!</DialogTitle>
      <DialogContent dividers>
        {actionItem.isProtected ? (
          <>
            Вместо удаления{' '}
            <span style={{ color: theme.palette.success.main }}>
              {initialItem.title}
            </span>{' '}
            снимается защита с{' '}
            <span style={{ color: theme.palette.error.main }}>
              {actionItem.title}
            </span>
            !
          </>
        ) : (
          <>
            Вместо{' '}
            <span style={{ color: theme.palette.success.main }}>
              {initialItem.title}
            </span>{' '}
            удаляется{' '}
            <span style={{ color: theme.palette.error.main }}>
              {actionItem.title}
            </span>
            !
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Согласен
        </Button>
      </DialogActions>
    </Dialog>
  )
}
