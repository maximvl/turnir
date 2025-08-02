import { Box } from '@mui/material'
import { ChatMessage } from '../turnir/types'
import { useEffect, useRef } from 'react'

type Props = {
  messages: ChatMessage[]
}

export default function ChatBox({ messages }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages.length])

  return (
    <Box>
      {/* <Box>Сообщения {username}</Box> */}
      <Box
        ref={containerRef}
        style={{ backgroundColor: '#222222' }}
        height={'200px'}
        // width={'inherit'}
        maxWidth={'360px'}
        // width={'600px'}
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
