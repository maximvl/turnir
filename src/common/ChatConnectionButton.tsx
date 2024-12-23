import { Error, RadioButtonChecked, Settings } from '@mui/icons-material'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Input,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material'
import { useState } from 'react'

type Props = {}

type ServerType = 'twitch.tv' | 'vkvideo.ru'

export default function ChatConnectionButton(props: Props) {
  const [open, setOpen] = useState(false)
  const [channel, setChannel] = useState<string | null>(null)
  const [server, setServer] = useState<string | null>(null)

  const [isConnected, setIsConnected] = useState(true)

  let statusMessage = 'Чат не подключен'
  if (channel && server) {
    statusMessage = `${server}/${channel}`
  }

  return (
    <Box>
      <Box display="flex" alignItems="center">
        <Button onClick={() => setOpen(true)}>
          <Settings />
        </Button>
        {isConnected ? (
          <Box display="flex" alignItems="center">
            <RadioButtonChecked color="success" sx={{ marginRight: '10px' }} />
            {statusMessage}
          </Box>
        ) : (
          <Box display="flex" alignItems="center">
            <Error color="error" sx={{ marginRight: '10px' }} />
            {statusMessage}
          </Box>
        )}
      </Box>
      <Dialog open={open}>
        <DialogTitle>Подключение к чату</DialogTitle>
        <DialogContent sx={{ padding: '20px' }}>
          <FormControl fullWidth sx={{ marginTop: '10px' }}>
            <InputLabel>Сервер</InputLabel>
            <Select
              onChange={(e) => setServer(e.target.value as ServerType)}
              value={server}
              label="Сервер"
            >
              <MenuItem value="twitch.tv">twitch.tv</MenuItem>
              <MenuItem value="vkvideo.ru">vkvideo.ru</MenuItem>
            </Select>
          </FormControl>
          <Box display="flex" alignItems="baseline" sx={{ marginTop: '10px' }}>
            <Input
              placeholder="канал"
              onChange={(e) => setChannel(e.target.value)}
              sx={{ marginTop: '10px', marginRight: '20px' }}
            />
            <Button variant="contained">Подключиться</Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
