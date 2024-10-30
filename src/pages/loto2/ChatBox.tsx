import { Box } from '@mui/material'
import { ChatMessage } from 'pages/turnir/api'

type Props = {
  messages: ChatMessage[]
}

export default function ChatBox({ messages }: Props) {
  return (
    <Box>
      {/* <Box>Сообщения {username}</Box> */}
      <Box
        style={{ backgroundColor: '#222222' }}
        height={'200px'}
        // width={'500px'}
        padding={'10px'}
        overflow={'auto'}
      >
        {messages.map((msg, index) => {
          return (
            <Box key={index}>
              <span>
                {msg.user.username}: {msg.message}
              </span>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
