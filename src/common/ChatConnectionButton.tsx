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
import { useEffect, useState } from 'react'
import useLocalStorage from './hooks/useLocalStorage'
import { ChatConnection, ChatServerType } from '@/pages/turnir/types'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
  chatConnect,
  ChatMessage,
  ConnectionStatus,
  getConnectionsStatus,
} from '@/pages/turnir/api'
import useChatMessages from './hooks/useChatMessages'
import debounce from 'lodash/debounce'

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

  const {
    data: connectionsStatus,
    refetch: refetchConnectionsStatus,
    isFetching: isConnectionsStatusFetching,
  } = useQuery({
    queryKey: ['chat_connections_status'],
    queryFn: getConnectionsStatus,
  })

  const [connectionStates, setConnectionStates] = useState<ConnectionStatus[]>(
    () => {
      return chatConnections.map(() => 'disconnected')
    }
  )

  const [open, setOpen] = useState(false)
  const { mutate: connectToChat } = useMutation({
    mutationFn: chatConnect,
    onSettled: () => {
      console.log('refetching connections status')
      refetchConnectionsStatus()
    },
  })

  // const anyConnecting = connectionStates.some((state) => state === 'connecting')
  // const { newMessages } = useChatMessages({
  //   fetching: anyConnecting,
  //   debug: false,
  // })

  // useEffect(() => {
  //   const getChannelIdForMessage = (message: ChatMessage) => {
  //     const connection = chatConnections.find(
  //       (conn) =>
  //         conn.channel === message.source.channel &&
  //         conn.server === message.source.server
  //     )
  //     if (!connection) {
  //       return -1
  //     }
  //     const index = chatConnections.indexOf(connection)
  //     return index
  //   }

  //   if (newMessages.length > 0) {
  //     const msg = newMessages[0]
  //     const id = getChannelIdForMessage(msg)
  //     const state = connectionStates[id]
  //     if (state === 'connecting') {
  //       setConnectionStates((prev) => {
  //         const newState = [...prev]
  //         newState[id] = 'connected'
  //         return newState
  //       })
  //     }
  //   }
  // }, [newMessages])

  useEffect(() => {
    console.log('connection status hook')
    if (!connectionsStatus) {
      return
    }

    const newStates = chatConnections.map((conn, idx) => {
      const stream = `${conn.server}/${conn.channel}`
      const state = connectionsStatus.connections[stream]
      if (state === undefined) {
        return 'disconnected'
      }
      return state
    })
    console.log('new states', newStates)
    setConnectionStates(newStates)
  }, [connectionsStatus, isConnectionsStatusFetching])

  const serverNames = {
    twitch: 'twitch.tv',
    vkvideo: 'vkvideo.ru',
    nuum: 'nuum.ru',
    goodgame: 'goodgame.ru',
  }

  // const getConnectionMessage = (server: ChatServerType, channel: string) => {
  //   let statusMessage = 'не подключен'
  //   if (channel && server) {
  //     const serverName = serverNames[server as ChatServerType]
  //     statusMessage = `${serverName}/${channel}`
  //   }
  //   return statusMessage
  // }

  const handleConnect = (c: ChatConnection) => {
    if (
      connectionStates[chatConnections.indexOf(c)] === 'connecting' ||
      isConnectionsStatusFetching
    ) {
      return
    }

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
    console.log('connecting to', c, connectionStates)
    connectToChat({ channel: c.channel, server: c.server })
  }

  const handleConnectDebounced = debounce(handleConnect, 10000)

  const handleOpen = () => {
    // const newStates: ConnectionStatus[] = chatConnections.map(
    //   () => 'disconnected'
    // )
    // setConnectionStates(newStates)
    setOpen(true)
  }

  useEffect(() => {
    if (!open) {
      const nonEmptyConnections = chatConnections.filter(
        (conn) => conn.channel !== ''
      )
      const hasChanges = nonEmptyConnections.some((conn, idx) => {
        const currentConn = chatConnections[idx]
        return (
          conn.server !== currentConn.server ||
          conn.channel !== currentConn.channel
        )
      })

      if (nonEmptyConnections.length !== chatConnections.length || hasChanges) {
        saveChatConnections(nonEmptyConnections)
        return
      }
      console.log('reconnection debounced hook')

      nonEmptyConnections.forEach((conn, idx) => {
        const state = connectionStates[idx] || 'disconnected'
        if (state === 'disconnected') {
          console.log('reconnecting to', conn)
          // handleConnectDebounced(conn)
        }
      })
    }
  }, [chatConnections, connectionStates, open])

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
                    {state === 'connecting' && 'Подключяюсь'}
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
