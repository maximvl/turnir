import { chatConnect, ConnectionStatus } from '@/pages/turnir/api'
import { ChatConnection, ChatServerType } from '@/pages/turnir/types'
import {
  DeleteForever,
  Error,
  RadioButtonChecked,
  Settings,
} from '@mui/icons-material'
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
import { useMutation } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import useLocalStorage from './hooks/useLocalStorage'

type Props = {}

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

  const [connectionStates, setConnectionStates] = useState<ConnectionStatus[]>(
    () => {
      return chatConnections.map(() => 'disconnected')
    }
  )

  const [open, setOpen] = useState(false)
  const { mutate: connectToChat } = useMutation({
    mutationFn: chatConnect,
    onSettled: (data, error, params) => {
      // console.log('settled', params, data)
      if (!data || error) {
        return
      }
      setConnectionStates((prev) => {
        const newState = [...prev]
        const index = chatConnections.findIndex(
          (conn) =>
            conn.server === params.server && conn.channel === params.channel
        )
        if (index === -1) {
          return prev
        }
        newState[index] = data.stream_status
        return newState
      })
    },
  })

  const serverNames = {
    twitch: 'twitch.tv',
    vkvideo: 'vkvideo.ru',
    nuum: 'nuum.ru',
    goodgame: 'goodgame.ru',
  }

  const handleConnect = (c: ChatConnection) => {
    setConnectionStates((prev) => {
      const newState = [...prev]
      const index = chatConnections.findIndex(
        (conn) => conn.server === c.server && conn.channel === c.channel
      )
      // console.log('updating index', index)
      if (index === -1) {
        return prev
      }
      newState[index] = 'connecting'
      // console.log('new state', newState)
      return newState
    })
    // console.log('connecting to', c, connectionStates)
    connectToChat({ channel: c.channel, server: c.server })
  }

  const handleOpen = () => {
    setOpen(true)
  }

  useEffect(() => {
    if (!open) {
      const nonEmptyConnections = chatConnections.filter(
        (conn) => conn.channel !== ''
      )

      if (nonEmptyConnections.length !== chatConnections.length) {
        saveChatConnections(nonEmptyConnections)
        return
      }
      // console.log('reconnection debounced hook', connectionStates)

      nonEmptyConnections.forEach((conn, idx) => {
        const state = connectionStates[idx] || 'disconnected'
        // console.log('effect', conn, connectionStates, state)
        if (state === 'disconnected') {
          // console.log('reconnecting to', conn)
          handleConnect(conn)
        }
      })
    }
  }, [open, connectionStates])

  const handleSaveServer = (conn: ChatConnection, server: ChatServerType) => {
    const index = chatConnections.indexOf(conn)
    const newConnections = [...chatConnections]
    newConnections[index] = { ...conn, server }
    saveChatConnections(newConnections)
    setConnectionStates((prev) => {
      const newState = [...prev]
      newState[index] = 'disconnected'
      return newState
    })
  }

  const handleSaveChannel = (conn: ChatConnection, channel: string) => {
    const index = chatConnections.indexOf(conn)
    const newConnections = [...chatConnections]
    newConnections[index] = { ...conn, channel }
    saveChatConnections(newConnections)
    setConnectionStates((prev) => {
      const newState = [...prev]
      newState[index] = 'disconnected'
      return newState
    })
  }

  const addChatConnection = () => {
    saveChatConnections([...chatConnections, { server: 'twitch', channel: '' }])
  }

  const removeChatConnection = (index: number) => {
    const newConnections = chatConnections.filter((_, idx) => idx !== index)
    saveChatConnections(newConnections)
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

            if (state === 'disconnected') {
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
      <Dialog open={open} maxWidth="xl">
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
            const state = connectionStates[idx] || 'disconnected'
            return (
              <Box key={idx} display="flex" alignItems="flex-end">
                <FormControl
                  variant="standard"
                  sx={{ marginTop: '10px', display: 'flex' }}
                >
                  <InputLabel>Сервер</InputLabel>
                  <Select
                    style={{ minWidth: '150px' }}
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
                <span
                  style={{
                    marginBottom: '3px',
                    marginLeft: '5px',
                    fontWeight: 'bold',
                  }}
                >
                  &nbsp;/
                </span>
                <Box
                  display="flex"
                  alignItems="flex-end"
                  sx={{ marginLeft: '5px' }}
                >
                  <Input
                    placeholder="канал"
                    value={conn.channel}
                    onChange={(e) => handleSaveChannel(conn, e.target.value)}
                    sx={{ marginTop: '10px', marginRight: '20px' }}
                  />
                  <Button
                    variant="contained"
                    color={state === 'connected' ? 'success' : 'primary'}
                    onClick={() => handleConnect(conn)}
                    disabled={state === 'connecting'}
                  >
                    {state === 'connecting' && 'Подключаюсь'}
                    {state === 'connected' && 'Подключено'}
                    {state === 'disconnected' && 'Подключить'}
                  </Button>
                  <Button
                    color="error"
                    variant="contained"
                    style={{ marginLeft: '10px' }}
                    onClick={() => removeChatConnection(idx)}
                  >
                    <DeleteForever />
                  </Button>
                </Box>
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
