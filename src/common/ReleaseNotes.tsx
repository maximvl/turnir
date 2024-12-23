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
    version: "1.10",
    date: "2024-08-24",
    changes: [
      "Добавлен новый раунд: Счастливый билетик",
      "Все бонусные раунды теперь могут появляться только один раз",
      "Обновлен интерфейс",
    ],
  },
  {
    version: "1.9",
    date: "2024-08-10",
    changes: ["Добавлен новый раунд: Воскрешение"],
  },
  {
    version: "1.8",
    date: "2024-06-30",
    changes: ["Добавлен новый раунд: Стример против Чата"],
  },
  {
    version: "1.7",
    date: "2024-06-22",
    changes: ["Добавлена отдельная страница голосования"],
  },
  {
    version: "1.6",
    date: "2024-06-21",
    changes: ["Добавлен новый раунд: Подмена"],
  },
  {
    version: "1.5",
    date: "2024-06-20",
    changes: ["Улучшена плавность колеса рандома, добавлен шанс возврата"],
  },
  {
    version: "1.4",
    date: "2024-06-19",
    changes: ["Улучшено отображение инструкций голосования"],
  },
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Button onClick={() => setShow(true)}>Что нового</Button>
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
                  <Typography variant="h6">
                    {new Date(releaseNote.date).toLocaleDateString(undefined, {
                      year: "2-digit",
                      month: "long",
                      day: "numeric",
                    })}
                  </Typography>
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
