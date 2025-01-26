import { Error, RadioButtonChecked, Settings } from '@mui/icons-material'
import {
  Box,
  Button,
  CircularProgress,
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
  const { value: channel, save: saveChannel } = useLocalStorage({
    key: 'chat_channel',
  })
  const { value: server, save: savePlaftorm } = useLocalStorage({
    key: 'chat_platform',
  })
  const [state, setState] = useState<'idle' | 'connecting' | 'connected'>(
    'idle'
  )

  const [open, setOpen] = useState(false)
  // const [channel, setChannel] = useState<string | null>(channelDefault)
  // const [server, setServer] = useState<ChatServerType | null>(serverDefault)

  const { mutate } = useMutation({ mutationFn: chatConnect })
  const { newMessages } = useChatMessages({ fetching: state === 'connecting' })

  useEffect(() => {
    if (newMessages.length > 0 && state === 'connecting') {
      setState('connected')
    }
  }, [newMessages])

  let statusMessage = 'не подключен'
  if (channel && server) {
    const serverNames = {
      twitch: 'twitch.tv',
      vkvideo: 'vkvideo.ru',
      nuum: 'nuum.ru',
      goodgame: 'goodgame.ru',
    }
    const serverName = serverNames[server as ChatServerType]
    statusMessage = `${serverName}/${channel}`
  }

  const handleConnect = () => {
    if (channel && server) {
      setState('connecting')
      mutate({ channel, server })
    }
  }

  const handleOpen = () => {
    setOpen(true)
    if (state === 'connecting') {
      setState('idle')
    }
  }

  useEffect(() => {
    if (channel && server && state === 'idle' && !open) {
      handleConnect()
    }
  }, [channel, server, state, open])

  const handleSaveServer = (server: ChatServerType) => {
    savePlaftorm(server)
    // setServer(server)
  }

  const handleSaveChannel = (channel: string) => {
    saveChannel(channel)
    // setChannel(channel)
  }

  return (
    <Box>
      <Box display="flex" alignItems="center">
        <Button
          onClick={handleOpen}
          variant="contained"
          color="inherit"
          sx={{ textTransform: 'none' }}
        >
          {state === 'connected' && (
            <Box display="flex" alignItems="center">
              <RadioButtonChecked
                color="success"
                sx={{ marginRight: '10px' }}
              />
              Чат {statusMessage}
            </Box>
          )}
          {state === 'idle' && (
            <Box display="flex" alignItems="center">
              <Error color="error" sx={{ marginRight: '10px' }} />
              Чат {statusMessage}
            </Box>
          )}
          {state === 'connecting' && (
            <Box display="flex" alignItems="center">
              <CircularProgress size="20px" sx={{ marginRight: '10px' }} />
              Подключение к {statusMessage}
            </Box>
          )}
        </Button>
      </Box>
      <Dialog open={open}>
        <DialogTitle>Подключение к чату</DialogTitle>
        <DialogContent
          sx={{
            paddingTop: '20px',
            paddingLeft: '20px',
            paddingRight: '20px',
            paddingBottom: '0px',
          }}
        >
          <FormControl fullWidth sx={{ marginTop: '10px' }}>
            <InputLabel>Сервер</InputLabel>
            <Select
              onChange={(e) =>
                handleSaveServer(e.target.value as ChatServerType)
              }
              value={server}
              label="Сервер"
            >
              <MenuItem value="twitch">twitch.tv</MenuItem>
              <MenuItem value="vkvideo">vkvideo.ru</MenuItem>
              <MenuItem value="nuum">nuum.ru</MenuItem>
              <MenuItem value="goodgame">goodgame.ru</MenuItem>
            </Select>
          </FormControl>
          <Box display="flex" alignItems="baseline" sx={{ marginTop: '10px' }}>
            <Input
              placeholder="канал"
              value={channel}
              onChange={(e) => handleSaveChannel(e.target.value)}
              sx={{ marginTop: '10px', marginRight: '20px' }}
            />
            <Button
              variant="contained"
              onClick={handleConnect}
              disabled={!channel || !server || state === 'connecting'}
            >
              Подключиться
            </Button>
          </Box>
          {state === 'connected' && (
            <Box marginTop="10px" color="green">
              Подключено!
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
