import { Save } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Link as MuiLink,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Item } from "../types";
import { Preset, ErrorResponse, savePreset, updatePreset } from "../utils";

type Props = {
  items: Item[];
  title: string;
};

export default function SavePreset({ items, title: currentTitle }: Props) {
  const { id: presetId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState(currentTitle);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (state?.show_saved) {
      setSaved(true);
      setShow(true);
    } else {
      setError(null);
      setSaved(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setTitle(currentTitle);
  }, [currentTitle]);

  // console.log("state", state);

  const onSave = async () => {
    const options = items.map((item) => item.title);
    let preset: Preset | ErrorResponse | void;
    if (presetId) {
      preset = await updatePreset(presetId, title, options).catch((e) => {
        console.log(e);
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
      navigate(`/turnir/${preset.id}`, { state: { show_saved: true } });
      setSaved(true);
    }
  };

  const onClose = () => {
    setShow(false);
    setSaved(false);
    if (state?.show_saved) {
      navigate(`/turnir/${presetId}`, { state: null });
    }
  };

  return (
    <>
      <Dialog open={show} onClose={onClose} fullWidth>
        <DialogTitle id="alert-dialog-title">Сохранить пресет</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Название"
            type="text"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {error && <Box>Ошибка: {error.toString()}</Box>}
          {saved && (
            <Box>
              Успешно сохранено, ссылка:
              <MuiLink
                target="_blank"
                rel="noopener noreferrer"
                href={`/turnir/${presetId}`}
                sx={{ marginLeft: 1 }}
              >
                {window.location.href}
              </MuiLink>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Закрыть</Button>
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
