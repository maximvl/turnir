import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Tooltip,
} from '@mui/material'
import MainMenu from 'common/MainMenu'
import { isUserSubscriber, VkColorsMap } from 'pages/loto2/utils'
import { fetchVotes } from 'pages/turnir/api'
import InfoPanel from 'pages/turnir/components/rounds/shared/InfoPanel'
import { useState } from 'react'
import { useQuery } from 'react-query'
import { Option } from './types'

const MESSAGES_REFETCH_INTERVAL = 2000

export default function ChatOptionsPage() {
  const [lastTs, setLastTs] = useState(() => Math.floor(Date.now() / 1000))
  const [options, setOptions] = useState<Option[]>([])
  const [onlySubscribers, setOnlySubscribers] = useState(true)

  const { data: chatData } = useQuery(
    ['loto', 0, lastTs],
    ({ queryKey }) => {
      return fetchVotes({ ts: queryKey[2] as number })
    },
    {
      refetchInterval: MESSAGES_REFETCH_INTERVAL,
    }
  )

  if (chatData && chatData.chat_messages && chatData.chat_messages.length > 0) {
    const newOptions = chatData.chat_messages
      .filter((msg) => msg.message.startsWith('+'))
      .map((msg) => {
        const text = msg.message.slice(1).trim()
        return {
          id: msg.id,
          user: msg.user,
          text,
        }
      })

    const currentOptionsIds = options.map((o) => o.id)
    const newOptionsFiltered = newOptions.filter(
      (o) => !currentOptionsIds.includes(o.id)
    )

    if (newOptionsFiltered.length > 0) {
      const newOptionsUserIds = newOptionsFiltered.map((o) => o.user.id)
      const optionsToBeKept = options.filter(
        (o) => !newOptionsUserIds.includes(o.user.id)
      )

      setOptions([...newOptionsFiltered, ...optionsToBeKept])
      setLastTs(
        chatData.chat_messages[chatData.chat_messages.length - 1].ts - 5
      )
    }
  }

  const filteredOptinos = onlySubscribers
    ? options.filter((option) => isUserSubscriber(option.user))
    : options

  return (
    <Box>
      <MainMenu title="Варианты из чата" />
      <Box>
        <Box position="absolute" marginLeft={'100px'}>
          <FormGroup>
            <FormControlLabel
              label="Только подписчики"
              control={
                <Checkbox
                  checked={onlySubscribers}
                  onChange={() => setOnlySubscribers((val) => !val)}
                  color="primary"
                />
              }
            />
          </FormGroup>
        </Box>
        <Box display="flex" flexDirection="column" alignItems="center">
          <InfoPanel>
            Пишите в чат +мой вариант
            <br />
            Можно менять вариант
          </InfoPanel>

          <Box textAlign="left" width={'400px'} marginTop={'20px'}>
            {filteredOptinos.map((option, index) => {
              const color = VkColorsMap[option.user.vk_fields?.nickColor || 0]
              const badges = option.user.vk_fields?.badges || []
              return (
                <Box
                  key={index}
                  marginBottom={'5px'}
                  alignItems={'center'}
                  display={'flex'}
                  fontSize={'24'}
                >
                  {option.text}
                  &nbsp;{'-'}&nbsp;
                  <span style={{ color }}>{option.user.username}</span>
                  {badges.map((badge, index) => (
                    <Tooltip title={badge.name} placement="top" key={index}>
                      <img
                        src={badge.largeUrl}
                        alt={'badge'}
                        style={{
                          width: '20px',
                          height: '20px',
                          marginLeft: '5px',
                        }}
                      />
                    </Tooltip>
                  ))}
                </Box>
              )
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
