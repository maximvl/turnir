import { NewReleases } from '@mui/icons-material'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material'
import { isNil } from 'lodash'
import { useEffect, useState } from 'react'

type ReleaseNote = {
  version: string
  date: string
  changes: string[]
}

const releaseNotesData: ReleaseNote[] = [
  {
    version: '1.33',
    date: '2025-07-03',
    changes: [
      'Улучшено переподключение к чатам',
      'Добавлена опция ограничения бочонков до 90 (как в реальном лото)',
      'Добавлена возможность реролить билет пока не начался розыгрыш',
    ],
  },
  {
    version: '1.32',
    date: '2025-06-25',
    changes: [
      'Улучшена сортировка билетов: теперь первыми будут билеты с наибольшим шансом на победу, а не те у которых больше общее количество совпадений',
      'Добавлено выделение последнего бочонока в билетах',
    ],
  },
  {
    version: '1.31',
    date: '2025-06-22',
    changes: [
      'Добавлена настройка ручного ввода бочонков',
      'Добавлена возможность менять настройки по ходу игры',
    ],
  },
  {
    version: '1.30',
    date: '2025-05-27',
    changes: [
      'Теперь можно получать билеты во время розыгрыша (билет не будет иметь выпавшие бочонки)',
      'Билеты хоста лото отображаются отдельно',
      'Улучшены цвета фона билетов',
      'Показывается время получения билета когда несколько собрали выигрышную комбинацию',
    ],
  },
  {
    version: '1.29',
    date: '2025-05-13',
    changes: ['Добавлена интеграция с YouTube'],
  },
  {
    version: '1.28',
    date: '2025-05-09',
    changes: ['Пофикшено сохранение статуса супер игры'],
  },
  {
    version: '1.27',
    date: '2025-05-04',
    changes: ['Пофикшено соединение с GoodGame'],
  },
  {
    version: '1.26',
    date: '2025-05-03',
    changes: ['Добавлена интеграция с Kick'],
  },
  {
    version: '1.25',
    date: '2025-04-28',
    changes: [
      'Добавлена возможность розыгрывать награды стрима в супер игре лото (пока только на vkvideo)',
    ],
  },
  {
    version: '1.24',
    date: '2025-04-21',
    changes: [
      'Пофикшен баг с возможностью получать в билете больше чисел чем положено',
    ],
  },
  {
    version: '1.23',
    date: '2025-03-29',
    changes: [
      'Добавлена настройка времени доставания бочонков',
      'Пофикшено сохранение победителей',
    ],
  },
  {
    version: '1.22',
    date: '2025-03-25',
    changes: ['Улучшен статус подключения к чатам'],
  },
  {
    version: '1.21',
    date: '2025-03-21',
    changes: ['Добавлена полная конфигурация лото и супер игры'],
  },
  {
    version: '1.20',
    date: '2025-03-20',
    changes: [
      'Добавлена возможность удаления победителя и продолжения лото',
      'Улучшено отображение таймера',
    ],
  },
  {
    version: '1.19',
    date: '2025-03-18',
    changes: ['В лото теперь может быть только один победитель'],
  },
  {
    version: '1.18',
    date: '2025-03-14',
    changes: ['Добавлена возможность подключать несколько чатов'],
  },
  {
    version: '1.17',
    date: '2025-02-15',
    changes: ['Добавлено сохранение победителей лото'],
  },
  {
    version: '1.16',
    date: '2025-02-11',
    changes: ['Улучшено отображение супер игры'],
  },
  {
    version: '1.15',
    date: '2025-02-02',
    changes: ['Полностью переделана супер игра лото'],
  },
  {
    version: '1.14',
    date: '2025-01-12',
    changes: [
      'Улучшено отображение билетов',
      'Улучшено отображение супер игры',
      'Добавлен таймер',
    ],
  },
  {
    version: '1.13',
    date: '2025-01-10',
    changes: [
      'Улучшена интеграция с чатом твича',
      'Добавлена интеграция с nuum и goodgame',
    ],
  },
  {
    version: '1.12',
    date: '2024-12-25',
    changes: ['Добавлена интеграция с чатом твича'],
  },
  {
    version: '1.11',
    date: '2024-10-01',
    changes: ['Добавлено лото'],
  },
  {
    version: '1.10',
    date: '2024-08-24',
    changes: [
      'Добавлен новый раунд: Счастливый билетик',
      'Все бонусные раунды теперь могут появляться только один раз',
      'Обновлен интерфейс',
    ],
  },
  {
    version: '1.9',
    date: '2024-08-10',
    changes: ['Добавлен новый раунд: Воскрешение'],
  },
  {
    version: '1.8',
    date: '2024-06-30',
    changes: ['Добавлен новый раунд: Стример против Чата'],
  },
  {
    version: '1.7',
    date: '2024-06-22',
    changes: ['Добавлена отдельная страница голосования'],
  },
  {
    version: '1.6',
    date: '2024-06-21',
    changes: ['Добавлен новый раунд: Подмена'],
  },
  {
    version: '1.5',
    date: '2024-06-20',
    changes: ['Улучшена плавность колеса рандома, добавлен шанс возврата'],
  },
  {
    version: '1.4',
    date: '2024-06-19',
    changes: ['Улучшено отображение инструкций голосования'],
  },
  {
    version: '1.3',
    date: '2024-05-21',
    changes: ['Бекенд полностью переписан с Python на Crystal'],
  },
  {
    version: '1.2',
    date: '2024-05-14',
    changes: ['Добавлено сохранение пресетов'],
  },
  {
    version: '1.1',
    date: '2024-05-07',
    changes: [
      'Пофикшен редкий краш голосования чата',
      'Выровнен уровень громкости музыки',
      'Добавлен слайдер громкости',
      'Улучшена автопрокрутка лога голосования',
    ],
  },
  {
    version: '1.0',
    date: '2024-05-01',
    changes: [
      'Темная тема по-умолчанию',
      'Добавлено колесо рандома',
      'Добавлена музыка для разных раундов',
      'Улучшено голосование зрителей',
      'Новый экран победы',
    ],
  },
]

export default function ReleaseNotes() {
  const [show, setShow] = useState(false)
  const storageKey = 'lastSeenVersion'
  const latestVersion = releaseNotesData[0].version
  const [lastSeenVersion, setLastSeenVersion] = useState<string | null>(null)

  useEffect(() => {
    const lastSeen = window.localStorage.getItem(storageKey)
    if (lastSeen !== latestVersion) {
      setLastSeenVersion(lastSeen || '0.0')
      setShow(true)
      window.localStorage.setItem(storageKey, latestVersion)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <Button onClick={() => setShow(true)}>Что нового</Button>
      <Dialog
        open={show}
        onClose={() => setShow(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Что нового</DialogTitle>
        <DialogContent dividers>
          {releaseNotesData.map((releaseNote) => {
            let highlight = true
            if (isNil(lastSeenVersion)) {
              highlight = false
            } else {
              highlight =
                parseFloat(lastSeenVersion) < parseFloat(releaseNote.version)
            }
            return (
              <div key={releaseNote.version} style={{ alignItems: 'center' }}>
                {/* <Typography variant="h6">Версия {releaseNote.version}</Typography> */}
                <Box display={'flex'} alignItems={'center'}>
                  <Typography variant="h6">
                    {new Date(releaseNote.date).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Typography>
                  {highlight && (
                    <NewReleases color="primary" style={{ marginLeft: 2 }} />
                  )}
                </Box>

                <ul>
                  {releaseNote.changes.map((change, index) => (
                    <li key={index}>
                      <Typography variant="body1">{change}</Typography>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShow(false)} color="primary">
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
