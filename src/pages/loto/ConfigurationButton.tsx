import useLocalStorage from '@/common/hooks/useLocalStorage'
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  MenuItem,
  Select,
  Slider,
  useTheme,
} from '@mui/material'
import { range } from 'lodash'
import { useState } from 'react'

type Props = {}

export const defaultConfig = {
  win_matches_amount: 3,
  super_game_options_amount: 30,
  super_game_guesses_amount: 5,
  super_game_1_pointers: 3,
  super_game_2_pointers: 2,
  super_game_3_pointers: 1,
  super_game_bonus_guesses_enabled: true,
}

export default function ConfigurationButton(props: Props) {
  const { value: config, save: updateConfig } = useLocalStorage({
    key: 'loto-config',
    defaultValue: defaultConfig,
  })

  const [modalOpen, setModalOpen] = useState(false)
  const theme = useTheme()

  const resetConfig = () => {
    updateConfig(defaultConfig)
  }

  const superGameWinChange =
    winningProbability(
      config.super_game_options_amount,
      config.super_game_1_pointers +
        config.super_game_2_pointers +
        config.super_game_3_pointers,
      config.super_game_guesses_amount
    ) * 100

  return (
    <>
      <Button variant="contained" onClick={() => setModalOpen(true)}>
        Настройки лото
      </Button>
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
        <DialogTitle>Параметры лото и супер игры</DialogTitle>
        <DialogContent>
          <Box>Лото</Box>
          <Box display="flex" alignItems="center">
            <Box marginRight="10px">
              Количество совпадений подряд для победы
            </Box>
            <FormControl size="small">
              <Select
                value={config.win_matches_amount}
                onChange={(e) =>
                  updateConfig({
                    ...config,
                    win_matches_amount: Number(e.target.value),
                  })
                }
              >
                {range(1, 9).map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Divider sx={{ marginTop: '10px', marginBottom: '10px' }} />
          <Box>Супер игра</Box>
          <Box display="flex" alignItems="center">
            <Box marginRight="10px">Количество ячеек в супер игре</Box>
            <FormControl size="small">
              <Select
                value={config.super_game_options_amount}
                onChange={(e) =>
                  updateConfig({
                    ...config,
                    super_game_options_amount: Number(e.target.value),
                  })
                }
              >
                {range(1, 100).map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box display="flex" alignItems="center">
            <Box marginRight="10px">Сколько ячеек открывать в супер игре</Box>
            <FormControl size="small">
              <Select
                value={config.super_game_guesses_amount}
                onChange={(e) =>
                  updateConfig({
                    ...config,
                    super_game_guesses_amount: Number(e.target.value),
                  })
                }
              >
                {range(1, 21).map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box display="flex" alignItems="center">
            <Box marginRight="10px">Выигрышных ячеек по 1 очку</Box>
            <FormControl size="small">
              <Select
                value={config.super_game_1_pointers}
                onChange={(e) =>
                  updateConfig({
                    ...config,
                    super_game_1_pointers: Number(e.target.value),
                  })
                }
              >
                {range(0, 21).map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box display="flex" alignItems="center">
            <Box marginRight="10px">Выигрышных ячеек по 2 очка</Box>
            <FormControl size="small">
              <Select
                value={config.super_game_2_pointers}
                onChange={(e) =>
                  updateConfig({
                    ...config,
                    super_game_2_pointers: Number(e.target.value),
                  })
                }
              >
                {range(0, 21).map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box display="flex" alignItems="center">
            <Box marginRight="10px">Выигрышных ячеек по 3 очка</Box>
            <FormControl size="small">
              <Select
                value={config.super_game_3_pointers}
                onChange={(e) =>
                  updateConfig({
                    ...config,
                    super_game_3_pointers: Number(e.target.value),
                  })
                }
              >
                {range(0, 21).map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box display="flex" alignItems="center">
            <Box marginRight="10px">
              Давать бонусные открытия за угаданные ячейки
            </Box>
            <Checkbox
              checked={config.super_game_bonus_guesses_enabled}
              onChange={(e) =>
                updateConfig({
                  ...config,
                  super_game_bonus_guesses_enabled: e.target.checked,
                })
              }
            />
          </Box>
          <Box
            sx={{
              border: `2px solid ${theme.palette.primary.main}`,
              borderRadius: '5px',
              textAlign: 'center',
              marginTop: '20px',
            }}
          >
            Шанс победы в супер-игре: {superGameWinChange.toFixed(2)}%
          </Box>
        </DialogContent>
        <DialogActions>
          <Box display="flex" justifyContent="space-between" width="100%">
            <Button color="warning" onClick={resetConfig}>
              Сбросить
            </Button>
            <Button onClick={() => setModalOpen(false)}>Закрыть</Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  )
}

function combination(total: number, choose: number): number {
  if (choose > total || choose < 0) return 0
  if (choose > total - choose) choose = total - choose // Use symmetry C(n, k) = C(n, n-k)

  let result = 1
  for (let i = 0; i < choose; i++) {
    result = (result * (total - i)) / (i + 1)
  }
  return result
}

function winningProbability(
  totalNumbers: number,
  winningNumbers: number,
  playerDraws: number
): number {
  if (
    winningNumbers > totalNumbers ||
    playerDraws > totalNumbers ||
    winningNumbers < 0 ||
    playerDraws < 0
  ) {
    return 0 // Invalid cases
  }

  const totalWaysToDraw = combination(totalNumbers, playerDraws)
  const waysToDrawNoWinningNumbers = combination(
    totalNumbers - winningNumbers,
    playerDraws
  )

  return 1 - waysToDrawNoWinningNumbers / totalWaysToDraw
}

// Example usage: 50 total numbers, 10 winning numbers, player draws 5
// console.log(winningProbability(50, 10, 5)) // Output: ~0.623
