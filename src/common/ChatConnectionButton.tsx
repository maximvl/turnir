import { chatConnect, ConnectionStatus } from '@/pages/turnir/api'
import { ChatConnection, ChatServerType } from '@/pages/turnir/types'
import { DeleteForever, Settings } from '@mui/icons-material'
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
import { debounce } from 'lodash'
import { ServerIcons } from '@/pages/loto/utils'

type Props = {}

export default function ChatConnectionButton(props: Props) {
  const { value: chatConnections, save: saveChatConnections } = useLocalStorage<
    ChatConnection[]
  >({
    key: 'chat-connections',
    defaultValue: [],
  })

  const { value: chatToReconnect, save: saveChatToReconnect } =
    useLocalStorage<ChatConnection | null>({
      key: 'reconnect-chat',
    })

  const [connectionStates, setConnectionStates] = useState<ConnectionStatus[]>(
    () => {
      return chatConnections.map(() => 'disconnected')
    }
  )

  // console.log('connection states', connectionStates)

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

  useEffect(() => {
    if (!chatToReconnect) {
      return
    }
    const index = chatConnections.findIndex(
      (conn) =>
        conn.server === chatToReconnect.server &&
        conn.channel === chatToReconnect.channel
    )
    if (index !== -1 && connectionStates[index] !== 'connecting') {
      setConnectionStates((prev) => {
        const newState = [...prev]
        newState[index] = 'connecting'
        return newState
      })
      connectToChat(chatToReconnect)
    }
    saveChatToReconnect(null) // Clear the reconnect state after attempting to connect
  }, [chatToReconnect])

  const serverNames = {
    twitch: 'twitch.tv',
    vkvideo: 'vkvideo.ru',
    nuum: 'nuum.ru',
    goodgame: 'goodgame.ru',
    kick: 'kick.com',
    youtube: 'youtube.com',
  }

  const handleConnect = (c: ChatConnection) => {
    // console.log('connecting to chat', c)
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
    connectToChat({ channel: c.channel, server: c.server })
  }

  const handleConnectDebourced = debounce(handleConnect, 1500)

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
      // console.log(
      //   'reconnection debounced hook',
      //   connectionStates,
      //   nonEmptyConnections
      // )

      nonEmptyConnections.forEach((conn, idx) => {
        const state = connectionStates[idx] ?? 'disconnected'
        // console.log('effect', conn, connectionStates, state)
        if (state === 'disconnected' || state === undefined) {
          // console.log('reconnecting to', conn)
          handleConnectDebourced(conn)
        }
      })
    }
  }, [open, connectionStates, chatConnections])

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

    let finalChannel = channel
    if (conn.server === 'youtube') {
      if (!channel.startsWith('@')) {
        finalChannel = '@' + channel
      }
    }
    newConnections[index] = { ...conn, channel: finalChannel }
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
                  <img
                    src={ServerIcons[conn.server]}
                    width="20px"
                    style={{ marginLeft: '10px' }}
                  />
                </Tooltip>
              )
            }

            if (state === 'disconnected') {
              return (
                <Tooltip title={tooltip} key={idx}>
                  <img
                    src={ServerIcons[conn.server]}
                    width="20px"
                    style={{
                      marginLeft: '10px',
                      // opacity: 0.4,
                      filter: 'grayscale(1)',
                    }}
                  />
                </Tooltip>
              )
            }

            return (
              <Tooltip title={tooltip} key={idx}>
                <CircularProgress size="20px" sx={{ marginLeft: '10px' }} />
              </Tooltip>
            )
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
                    <MenuItem value="kick">kick.com</MenuItem>
                    <MenuItem value="vkvideo">vkvideo.ru</MenuItem>
                    <MenuItem value="youtube">youtube.com</MenuItem>
                    <MenuItem value="goodgame">goodgame.ru</MenuItem>
                    <MenuItem value="nuum">nuum.ru</MenuItem>
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
                  {/* <Button
                    variant="contained"
                    color={state === 'connected' ? 'success' : 'primary'}
                    onClick={() => handleConnect(conn)}
                    disabled={state === 'connecting'}
                  >
                    {state === 'connecting' && 'Подключаюсь'}
                    {state === 'connected' && 'Подключено'}
                    {state === 'disconnected' && 'Подключить'}
                  </Button> */}
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
