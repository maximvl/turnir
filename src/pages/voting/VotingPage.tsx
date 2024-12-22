import { RestartAlt, Start } from '@mui/icons-material'
import { Button, Divider, Grid, Slider } from '@mui/material'
import ItemsList from '@/pages/turnir/components/ItemsList'
import ViewerChoiceRound from '@/pages/turnir/components/rounds/ViewerChoice/ViewerChoiceRound'
import { isEmpty, toString } from 'lodash'
import { useState } from 'react'
import { Item, ItemStatus } from '@/pages/turnir/types'
import { createItem, ChatMessage } from '@/pages/turnir/api'
import MainMenu from '@/common/MainMenu'

type VotingStatus = 'idle' | 'voting'

const logFormatter = (
  vote: ChatMessage,
  formattedTime: string,
  optionTitle: string
) => {
  return `${formattedTime}: ${vote.user.username} голосует ${vote.message} (${optionTitle})`
}

export default function VotingPage() {
  const [items, setItems] = useState<Item[]>(() => {
    return Array(10)
      .fill(0)
      .map((_, index) => createItem(toString(index + 1)))
  })
  const [status, setStatus] = useState<VotingStatus>('idle')
  const [timer, setTimer] = useState(60)

  const setItemValue = (id: number, text: string) => {
    items[id].title = text
    setItems([...items])
  }
  const canEditItems = status === 'idle'
  const nonEmptyItems = items.filter((item) => !isEmpty(item.title))
  const activeItems = nonEmptyItems.filter(
    (item) => item.status !== ItemStatus.Eliminated
  )

  const addMoreItems = () => {
    const nextIndex = items.length
    setItems([
      ...items,
      ...Array(10)
        .fill(0)
        .map((_, index) => createItem(toString(index + nextIndex + 1))),
    ])
  }

  const startVoting = () => {
    setStatus('voting')
  }
  const onRestartClick = () => {
    setStatus('idle')
  }
  const onItemChoice = (id: string) => {}

  return (
    <>
      <MainMenu title={'Голосование чата'} />
      <Grid
        container
        columnSpacing={0}
        border={0}
        columns={12}
        sx={{ borderTop: 0.5, borderBottom: 0.5, borderColor: 'grey.700' }}
      >
        <Grid
          item
          xs={4}
          border={0}
          paddingTop={2}
          sx={{ width: '100%', paddingBottom: 2 }}
        >
          <Grid
            container
            columns={1}
            border={0}
            rowGap={2}
            paddingLeft={6}
            paddingRight={2}
          >
            <Grid item xs={1} paddingLeft={0}>
              <ItemsList
                items={items}
                setItem={setItemValue}
                activeItems={nonEmptyItems}
                canEditItems={canEditItems}
                showKPLinks={false}
              />
            </Grid>
            {canEditItems && (
              <Grid item xs={1}>
                <Button variant="contained" onClick={addMoreItems}>
                  Добавить слотов
                </Button>
              </Grid>
            )}
          </Grid>
        </Grid>

        <Grid
          item
          xs={2}
          border={0}
          paddingRight={0}
          paddingTop={2}
          paddingBottom={2}
          sx={{
            borderLeft: 0.5,
            borderRight: 0.5,
            borderColor: 'grey.700',
          }}
        >
          <Grid container rowGap={2} alignItems="baseline" columns={1}>
            <Grid item xs={1} paddingLeft={2} paddingRight={2}>
              Таймер
              <Slider
                defaultValue={timer}
                valueLabelDisplay="auto"
                min={30}
                max={30 * 20}
                step={30}
                onChange={(_, value) => setTimer(value as number)}
                valueLabelFormat={() =>
                  `${Math.floor(timer / 60)}мин ${timer % 60}сек`
                }
                disabled={status === 'voting'}
              />
            </Grid>
            <Grid item xs={1}>
              <Divider style={{ width: 'inherit' }} />
            </Grid>
            <Grid item paddingLeft={2} xs={1}>
              <Button
                variant="contained"
                onClick={startVoting}
                disabled={nonEmptyItems.length === 0 || status === 'voting'}
                endIcon={<Start />}
                color="success"
              >
                Запуск
              </Button>
            </Grid>
            <Grid item paddingLeft={2} xs={1}>
              <Button
                variant="contained"
                color="error"
                disabled={status === 'idle'}
                onClick={onRestartClick}
                endIcon={<RestartAlt />}
              >
                Рестарт
              </Button>
            </Grid>
          </Grid>
        </Grid>

        <Grid
          item
          xs={6}
          border={0}
          paddingTop={2}
          paddingRight={6}
          paddingBottom={2}
          textAlign="center"
        >
          {status === 'voting' && (
            <ViewerChoiceRound
              items={activeItems}
              onItemElimination={onItemChoice}
              logFormatter={logFormatter}
              subscriberOnly={false}
            />
          )}
        </Grid>
      </Grid>
    </>
  )
}
