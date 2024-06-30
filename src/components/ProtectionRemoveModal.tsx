import { Button, Dialog, DialogActions, DialogContent, DialogTitle, useTheme } from "@mui/material";
import { Item } from "types";

type Props = {
  open: boolean;
  onClose: () => void;
  item: Item;
};

export default function ProtectionRemoveModal({ open, onClose, item }: Props) {
  const theme = useTheme();
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Защита!</DialogTitle>
      <DialogContent dividers>
        Вместо удаления <span style={{ color: theme.palette.success.main }}>{item.title}</span> с него снимается защита!
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Согласен
        </Button>
      </DialogActions>
    </Dialog>
  );
}
