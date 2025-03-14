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
  Tooltip,
} from '@mui/material'
import { useEffect, useState } from 'react'
import useLocalStorage from './hooks/useLocalStorage'
import { ChatConnection, ChatServerType } from '@/pages/turnir/types'
import { useMutation } from '@tanstack/react-query'
import { chatConnect, ChatMessage } from '@/pages/turnir/api'
import useChatMessages from './hooks/useChatMessages'

type Props = {}

type ConnectionState = 'idle' | 'connecting' | 'connected'

export default function ChatConnectionButton(props: Props) {
  const { value: chatConnections, save: saveChatConnections } = useLocalStorage<
    ChatConnection[]
  >({
    key: 'chat-connections',
    defaultValue: [
      {
        channel: '',
        server: 'twitch',
      },
    ],
  })

  const [connectionStates, setConnectionStates] = useState<ConnectionState[]>(
    () => {
      return chatConnections.map(() => 'idle')
    }
  )

  const [open, setOpen] = useState(false)
  const { mutate } = useMutation({ mutationFn: chatConnect })

  const anyConnecting = connectionStates.some((state) => state === 'connecting')
  const { newMessages } = useChatMessages({ fetching: anyConnecting })

  useEffect(() => {
    const getChannelIdForMessage = (message: ChatMessage) => {
      const connection = chatConnections.find(
        (conn) =>
          conn.channel === message.source.channel &&
          conn.server === message.source.server
      )
      if (!connection) {
        return -1
      }
      const index = chatConnections.indexOf(connection)
      return index
    }

    if (newMessages.length > 0) {
      const msg = newMessages[0]
      const id = getChannelIdForMessage(msg)
      const state = connectionStates[id]
      if (state === 'connecting') {
        setConnectionStates((prev) => {
          const newState = [...prev]
          newState[id] = 'connected'
          return newState
        })
      }
    }
  }, [newMessages])

  const serverNames = {
    twitch: 'twitch.tv',
    vkvideo: 'vkvideo.ru',
    nuum: 'nuum.ru',
    goodgame: 'goodgame.ru',
  }

  const getConnectionMessage = (server: ChatServerType, channel: string) => {
    let statusMessage = 'не подключен'
    if (channel && server) {
      const serverName = serverNames[server as ChatServerType]
      statusMessage = `${serverName}/${channel}`
    }
    return statusMessage
  }

  const handleConnect = (c: ChatConnection) => {
    setConnectionStates((prev) => {
      const newState = [...prev]
      const index = chatConnections.findIndex(
        (conn) => conn.server === c.server && conn.channel === c.channel
      )
      if (index === -1) {
        return prev
      }
      newState[index] = 'connecting'
      return newState
    })
    mutate({ channel: c.channel, server: c.server })
  }

  const handleOpen = () => {
    const newStates: ConnectionState[] = chatConnections.map(() => 'idle')
    setConnectionStates(newStates)
    setOpen(true)
  }

  useEffect(() => {
    if (!open) {
      chatConnections.forEach((conn, idx) => {
        const state = connectionStates[idx]
        if (state === 'idle') {
          handleConnect(conn)
        }
      })
    }
  }, [chatConnections, connectionStates, open])

  const handleSaveServer = (conn: ChatConnection, server: ChatServerType) => {
    const index = chatConnections.indexOf(conn)
    const newConnections = [...chatConnections]
    newConnections[index] = { ...conn, server }
    saveChatConnections(newConnections)
    // setServer(server)
  }

  const handleSaveChannel = (conn: ChatConnection, channel: string) => {
    const index = chatConnections.indexOf(conn)
    const newConnections = [...chatConnections]
    newConnections[index] = { ...conn, channel }
    saveChatConnections(newConnections)
    // setChannel(channel)
  }

  const addChatConnection = () => {
    saveChatConnections([...chatConnections, { server: 'twitch', channel: '' }])
  }

  return (
    <Box>
      <Box display="flex" flexDirection="column">
        <Button
          onClick={handleOpen}
          variant="contained"
          color="inherit"
          sx={{ textTransform: 'none' }}
        >
          <Settings style={{ marginRight: '10px' }} />
          Подключить чаты
          {chatConnections.map((conn, idx) => {
            const state = connectionStates[idx]
            const tooltip = `${serverNames[conn.server]}/${conn.channel}`
            if (state === 'connected') {
              return (
                <Tooltip title={tooltip} key={idx}>
                  <RadioButtonChecked
                    color="success"
                    sx={{ marginLeft: '10px' }}
                  />
                </Tooltip>
              )
            }

            if (state === 'idle') {
              return (
                <Tooltip title={tooltip} key={idx}>
                  <Error color="error" sx={{ marginLeft: '10px' }} />
                </Tooltip>
              )
            }

            if (state === 'connecting') {
              return (
                <Tooltip title={tooltip} key={idx}>
                  <CircularProgress size="20px" sx={{ marginLeft: '10px' }} />
                </Tooltip>
              )
            }
            return null
          })}
        </Button>
      </Box>
      <Dialog open={open} maxWidth="sm" fullWidth>
        <DialogTitle>Подключение к чату</DialogTitle>
        <DialogContent
          sx={{
            paddingTop: '20px',
            paddingLeft: '20px',
            paddingRight: '20px',
            paddingBottom: '0px',
          }}
        >
          {chatConnections.map((conn, idx) => {
            const state = connectionStates[idx]
            return (
              <Box key={idx} display="flex" alignItems="flex-end">
                <FormControl
                  variant="standard"
                  sx={{ marginTop: '10px', display: 'flex' }}
                >
                  <InputLabel>Сервер</InputLabel>
                  <Select
                    style={{ minWidth: '150px', marginBottom: '2.5px' }}
                    onChange={(e) =>
                      handleSaveServer(conn, e.target.value as ChatServerType)
                    }
                    value={conn.server}
                    label="Сервер"
                  >
                    <MenuItem value="twitch">twitch.tv</MenuItem>
                    <MenuItem value="vkvideo">vkvideo.ru</MenuItem>
                    <MenuItem value="nuum">nuum.ru</MenuItem>
                    <MenuItem value="goodgame">goodgame.ru</MenuItem>
                  </Select>
                </FormControl>
                <span style={{ marginBottom: '5px' }}>&nbsp;/</span>
                <Box
                  display="flex"
                  alignItems="baseline"
                  sx={{ marginLeft: '10px' }}
                >
                  <Input
                    placeholder="канал"
                    value={conn.channel}
                    onChange={(e) => handleSaveChannel(conn, e.target.value)}
                    sx={{ marginTop: '10px', marginRight: '20px' }}
                  />
                  <Button
                    variant="contained"
                    onClick={() => handleConnect(conn)}
                    disabled={state === 'connecting'}
                  >
                    Подключиться
                  </Button>
                </Box>
                {state === 'connected' && (
                  <Box marginTop="10px" color="green">
                    Подключено!
                  </Box>
                )}
              </Box>
            )
          })}
        </DialogContent>
        <DialogActions style={{ marginTop: '20px' }}>
          <Box display="flex" justifyContent="space-between" width="100%">
            <Button onClick={() => addChatConnection()}>Добавить чат</Button>
            <Button onClick={() => setOpen(false)}>Закрыть</Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
