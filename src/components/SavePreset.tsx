import { Save } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Item } from "../types";
import { Preset, ErrorResponse, savePreset, updatePreset } from "../utils";

type Props = {
  items: Item[];
  title: string;
};

export default function SavePreset({ items, title: currentTitle }: Props) {
  const { id: presetId } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState(currentTitle);
  const [error, setError] = useState<string | null>(null);
  const onSave = async () => {
    const options = items.map((item) => item.title);
    let preset: Preset | ErrorResponse | void;
    if (presetId) {
      preset = await updatePreset(presetId, title, options).catch((e) => {
        setError(e);
        return;
      });
    } else {
      preset = await savePreset(title, options).catch((e) => {
        setError(e);
        return;
      });
    }

    if (preset) {
      if ("error" in preset) {
        setError(preset.error);
        return;
      }
      if (presetId === preset.id) {
        navigate(0);
      } else {
        navigate(`/turnir/${preset.id}`);
      }
      setShow(false);
    }
  };
  return (
    <>
      <Dialog open={show} onClose={() => setShow(false)} fullWidth>
        <DialogTitle id="alert-dialog-title">Сохранить пресет</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Название пресета"
            type="text"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {error && <Box>Ошибка: {error}</Box>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShow(false)}>Отмена</Button>
          <Button onClick={onSave} autoFocus>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
      <Button
        variant="outlined"
        endIcon={<Save />}
        onClick={() => setShow(true)}
      >
        Сохранить
      </Button>
    </>
  );
}
