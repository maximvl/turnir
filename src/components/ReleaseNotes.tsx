import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

type ReleaseNote = {
  version: string;
  date: string;
  changes: string[];
};

const releaseNotesData: ReleaseNote[] = [
  {
    version: "1.1",
    date: "2024-03-07",
    changes: [
      "Пофикшен редкий краш голосования чата",
      "Выровнен уровень громкости музыки",
      "Добавлен слайдер громкости",
      "Улучшена автопрокрутка лога голосования",
    ],
  },
  {
    version: "1.0",
    date: "2024-03-01",
    changes: [
      "Темная тема по-умолчанию",
      "Добавлено колесо рандома",
      "Добавлена музыка для разных раундов",
      "Улучшено голосование зрителей",
      "Новый экран победы",
    ],
  },
];

export default function ReleaseNotes() {
  const [show, setShow] = useState(false);
  const storageKey = "lastSeenVersion";

  useEffect(() => {
    const latestVersion = releaseNotesData[0].version;
    const lastSeen = window.localStorage.getItem(storageKey);
    if (lastSeen !== latestVersion) {
      setShow(true);
      window.localStorage.setItem(storageKey, latestVersion);
    }
  }, []);

  return (
    <>
      <Typography
        variant="body2"
        style={{ cursor: "pointer" }}
        onClick={() => setShow(true)}
      >
        <Button>Что нового</Button>
      </Typography>
      <Dialog
        open={show}
        onClose={() => setShow(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Что нового</DialogTitle>
        <DialogContent dividers>
          {releaseNotesData.map((releaseNote) => {
            return (
              <div key={releaseNote.version}>
                <Typography variant="h6">
                  Версия {releaseNote.version}
                </Typography>
                <Typography variant="body1">
                  <ul>
                    {releaseNote.changes.map((change, index) => (
                      <li key={index}>{change}</li>
                    ))}
                  </ul>
                </Typography>
              </div>
            );
          })}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShow(false)} color="primary">
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
