import { Box } from '@mui/material'

type Props = {
  username: string
  messages: string[]
}

export default function ChatBox({ username, messages }: Props) {
  return (
    <Box>
      <Box>Сообщения {username}</Box>
      <Box
        style={{ backgroundColor: '#222222' }}
        height={'200px'}
        width={'500px'}
        padding={'10px'}
      >
        {messages.map((msg, index) => {
          return (
            <Box key={index}>
              <span>
                {username}: {msg}
              </span>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
