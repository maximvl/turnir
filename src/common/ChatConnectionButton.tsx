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
import { useEffect, useState } from 'react'
import useLocalStorage from './hooks/useLocalStorage'
import { ChatServerType } from '@/pages/turnir/types'
import { useMutation } from '@tanstack/react-query'
import { chatConnect } from '@/pages/turnir/api'
import useChatMessages from './hooks/useChatMessages'

type Props = {}

export default function ChatConnectionButton(props: Props) {
  const { save, load } = useLocalStorage()
  const [state, setState] = useState<'idle' | 'connecting'>('idle')

  const [open, setOpen] = useState(false)
  const [channel, setChannel] = useState<string | null>(() =>
    load('chat_channel', null)
  )
  const [server, setServer] = useState<ChatServerType | null>(() =>
    load('chat_server', null)
  )

  const { mutate } = useMutation({ mutationFn: chatConnect })
  const { newMessages } = useChatMessages({ fetching: state === 'connecting' })

  useEffect(() => {
    if (newMessages.length > 0 && state === 'connecting') {
      setState('idle')
      setIsConnected(true)
    }
  }, [newMessages])

  const [isConnected, setIsConnected] = useState(false)

  let statusMessage = 'Чат не подключен'
  if (channel && server) {
    statusMessage = `${server}/${channel}`
  }

  const handleConnect = () => {
    setState('connecting')
    if (channel && server) {
      mutate({ channel, server })
    }
  }

  const saveServer = (server: ChatServerType) => {
    save('chat_server', server)
    setServer(server)
  }

  const saveChannel = (channel: string) => {
    save('chat_channel', channel)
    setChannel(channel)
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
              onChange={(e) => saveServer(e.target.value as ChatServerType)}
              value={server}
              label="Сервер"
            >
              <MenuItem value="twitch">twitch.tv</MenuItem>
              <MenuItem value="vkvideo">vkvideo.ru</MenuItem>
            </Select>
          </FormControl>
          <Box display="flex" alignItems="baseline" sx={{ marginTop: '10px' }}>
            <Input
              placeholder="канал"
              onChange={(e) => saveChannel(e.target.value)}
              sx={{ marginTop: '10px', marginRight: '20px' }}
            />
            <Button variant="contained" onClick={handleConnect}>
              Подключиться
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}