import { Box, Button } from '@mui/material'
import MainMenu from 'common/MainMenu'
import InfoPanel from 'pages/turnir/components/rounds/shared/InfoPanel'
import TicketBox from './TicketBox'
import { generateTicket } from './utils'

export default function LotoPage() {
  const tickets = Array.from({ length: 20 }).map((_, i) => {
    return { owner: `User ${i}`, value: generateTicket() }
  })
  return (
    <Box>
      <MainMenu title={'Лото с чатом'} />
      <Box
        display="flex"
        justifyContent={'center'}
        paddingLeft={'100px'}
        paddingRight={'100px'}
      >
        <Box>
          <Box display={'flex'} justifyContent={'center'}>
            <InfoPanel>
              <p>
                Пишите в чат <strong>+лото</strong> чтобы получить билет
              </p>
            </InfoPanel>
          </Box>
          <Box
            fontSize={'32px'}
            textAlign={'center'}
            display={'flex'}
            alignItems={'center'}
            justifyContent={'center'}
            marginTop={'40px'}
            marginBottom={'20px'}
          >
            Участники: {tickets.length}
            <Button
              variant="contained"
              color="primary"
              style={{ marginLeft: '30px' }}
            >
              Начать
            </Button>
          </Box>
          <Box display={'flex'} flexWrap={'wrap'}>
            {tickets.map((ticket, i) => {
              return <TicketBox key={i} ticket={ticket} />
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
