import { NewReleases } from "@mui/icons-material";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { isNil } from "lodash";
import { useEffect, useState } from "react";

type ReleaseNote = {
  version: string;
  date: string;
  changes: string[];
};

const releaseNotesData: ReleaseNote[] = [
  {
    version: "1.3",
    date: "2024-05-21",
    changes: ["Бекенд полностью переписан с Python на Crystal"],
  },
  {
    version: "1.2",
    date: "2024-05-14",
    changes: ["Добавлено сохранение пресетов"],
  },
  {
    version: "1.1",
    date: "2024-05-07",
    changes: [
      "Пофикшен редкий краш голосования чата",
      "Выровнен уровень громкости музыки",
      "Добавлен слайдер громкости",
      "Улучшена автопрокрутка лога голосования",
    ],
  },
  {
    version: "1.0",
    date: "2024-05-01",
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
  const latestVersion = releaseNotesData[0].version;
  const [lastSeenVersion, setLastSeenVersion] = useState<string | null>(null);

  useEffect(() => {
    const lastSeen = window.localStorage.getItem(storageKey);
    if (lastSeen !== latestVersion) {
      setLastSeenVersion(lastSeen || "0.0");
      setShow(true);
      window.localStorage.setItem(storageKey, latestVersion);
    }
  }, []);

  return (
    <>
      <Typography variant="body2" style={{ cursor: "pointer" }} onClick={() => setShow(true)}>
        <Button>Что нового</Button>
      </Typography>
      <Dialog open={show} onClose={() => setShow(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Что нового</DialogTitle>
        <DialogContent dividers>
          {releaseNotesData.map((releaseNote) => {
            let highlight = true;
            if (isNil(lastSeenVersion)) {
              highlight = false;
            } else {
              highlight = parseFloat(lastSeenVersion) < parseFloat(releaseNote.version);
            }
            return (
              <div key={releaseNote.version} style={{ alignItems: "center" }}>
                {/* <Typography variant="h6">Версия {releaseNote.version}</Typography> */}
                <Box display={"flex"} alignItems={"center"}>
                  <Typography variant="h6">{releaseNote.date}</Typography>
                  {highlight && <NewReleases color="primary" style={{ marginLeft: 2 }} />}
                </Box>

                <ul>
                  {releaseNote.changes.map((change, index) => (
                    <li key={index}>
                      <Typography variant="body1">{change}</Typography>
                    </li>
                  ))}
                </ul>
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
