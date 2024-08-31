import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function SkipRoundModal({ open, onClose, onConfirm }: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Скип раунда</DialogTitle>
      <DialogContent dividers>Скип раунда нужен чтобы скипать баги а не абузить результаты ходов! </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Отмена
        </Button>
        <Button onClick={onConfirm} color="error">
          Скипнуть
        </Button>
      </DialogActions>
    </Dialog>
  );
}
