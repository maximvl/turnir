import { RestartAlt, SkipNext } from '@mui/icons-material'
import StartIcon from '@mui/icons-material/Start'
import { Box, Checkbox, FormControlLabel, Grid, Tooltip } from '@mui/material'
import Button from '@mui/material/Button'
import 'App.css'
import ItemsList from 'components/ItemsList'
import RoundContent from 'components/rounds/shared/RoundContent'
import RoundTitle from 'components/rounds/shared/RoundTitle'
import SavePreset from 'components/SavePreset'
import SwapRevealModal from 'components/modals/SwapRevealModal'
import Victory from 'components/Victory'
import { MusicContext } from 'contexts/MusicContext'
import { filter, isEmpty, sample, toString } from 'lodash'
import { useContext, useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { useParams } from 'react-router'
import {
  ClassicRoundTypes,
  Item,
  ItemStatus,
  MusicType,
  NewRoundTypes,
  RoundType,
  RoundTypeNames,
  RoundTypes,
  RoundTypeTooltip,
  TurnirState,
} from 'types'
import { createItem, fetchPreset } from 'utils'
import MainMenu from './MainMenu'
import ProtectionRemoveModal from 'components/modals/ProtectionRemoveModal'
import SkipRoundModal from 'components/modals/SkipRoundModal'

const queryClient = new QueryClient()

function TournirApp() {
  const increaseAmount = 10
  const initialItems = 10
  const [roundNumber, setRoundNumber] = useState(0)
  const [currentRoundType, setCurrentRoundType] = useState<RoundType | null>(
    null
  )

  const [title, setTitle] = useState('')
  const [roundId, setRoundId] = useState(0)

  const { id: presetId } = useParams()
  const loadPreset = async (presetId: string) => {
    const preset = await fetchPreset(presetId).catch((e) => ({
      error: 'Error loading preset',
      exception: e,
    }))
    if ('error' in preset) {
      setTitle('Error loading preset')
      console.log(preset)
      return
    }
    setItems(
      preset.options.map((title, index) =>
        createItem((index + 1).toString(), title)
      )
    )
    setTitle(preset.title)
  }

  const [oneTimeRounds, setOneTimeRounds] = useState({
    [RoundType.Protection]: true,
    [RoundType.Swap]: true,
    [RoundType.Resurrection]: true,
    [RoundType.Deal]: true,
    [RoundType.DealReturn]: true,
  })

  const disableOneTimeRound = (round: RoundType) => {
    setOneTimeRounds({ ...oneTimeRounds, [round]: false })
  }

  const [items, setItems] = useState<Item[]>(() => {
    if (presetId) {
      return []
    }
    return Array(initialItems)
      .fill(0)
      .map((_, index) => createItem(toString(index + 1)))
  })
  const [turnirState, setTurnirState] = useState<TurnirState>(
    TurnirState.EditCandidates
  )

  const [noRoundRepeat, setNoRoundRepeat] = useState(true)
  const [lastNonBonusRoundType, setLastNonBonusRoundType] =
    useState<RoundType | null>(null)

  const [roundTypes, setRoundTypes] = useState<Map<RoundType, boolean>>(
    RoundTypes.reduce((acc, t) => acc.set(t, true), new Map())
  )

  const [showSwapModal, setShowSwapModal] = useState(false)
  const [initialSwapItem, setInitialSwapItem] = useState<Item | undefined>(
    undefined
  )
  const [actionSwapItem, setActionSwapItem] = useState<Item | undefined>(
    undefined
  )

  const [showProtectionModal, setShowProtectionModal] = useState(false)
  const [showSkipRoundModal, setShowSkipRoundModal] = useState(false)

  const allRounds = Array.from(roundTypes.keys())
  const activeRounds: RoundType[] = filter(allRounds, (key) =>
    Boolean(roundTypes.get(key))
  )

  const classicRounds = allRounds.filter((round) =>
    ClassicRoundTypes.includes(round)
  )
  const newRounds = allRounds.filter((round) => NewRoundTypes.includes(round))

  useEffect(() => {
    if (presetId) {
      loadPreset(presetId)
    }
    // eslint-disable-next-line
  }, [presetId])

  const { setMusicPlaying } = useContext(MusicContext)

  const nonEmptyItems = items.filter((item) => !isEmpty(item.title))
  const activeItems = nonEmptyItems.filter(
    (item) => item.status === ItemStatus.Active
  )
  const eliminatedItems = nonEmptyItems.filter(
    (item) => item.status === ItemStatus.Eliminated
  )
  const swapItem = activeItems.find((item) => item.swappedWith !== undefined)
  const targetSwapItem = activeItems.find(
    (item) => item.id === swapItem?.swappedWith
  )

  const protectedItem = activeItems.find((item) => item.isProtected)
  const dealItem = nonEmptyItems.find(
    (item) => item.status === ItemStatus.Excluded
  )

  // console.log("deal item", dealItem);

  // console.log("swap:", swapItem, targetSwapItem);

  const addMoreItems = () => {
    const nextIndex = items.length
    setItems([
      ...items,
      ...Array(increaseAmount)
        .fill(0)
        .map((_, index) => createItem(toString(index + nextIndex + 1))),
    ])
  }

  const setItemValue = (id: number, text: string) => {
    items[id].title = text
    setItems([...items])
  }

  const setNextRoundType = () => {
    setMusicPlaying(undefined)
    let roundOptions = activeRounds
    roundOptions.push(RoundType.DealReturn)
    // if (roundTypes.get(RoundType.Deal) && oneTimeRounds[RoundType.Deal]) {
    //   roundOptions.push(RoundType.DealReturn);
    // }

    const inactiveOneTimeRounds = Object.entries(oneTimeRounds)
      .filter(([key, value]) => !value)
      .map(([key, value]) => key)

    if (items.length < 6) {
      roundOptions = roundOptions.filter((round) => round !== RoundType.Deal)
    }

    roundOptions = roundOptions.filter(
      (round) => !inactiveOneTimeRounds.includes(round)
    )

    if (noRoundRepeat && roundOptions.length > 1 && lastNonBonusRoundType) {
      roundOptions = roundOptions.filter(
        (round) => round !== lastNonBonusRoundType
      )
    }

    const resurrectionRoundEnabled = roundOptions.includes(
      RoundType.Resurrection
    )
    const dealRoundEnabled = roundOptions.includes(RoundType.Deal)
    const dealReturnEnabled = roundOptions.includes(RoundType.DealReturn)

    // console.log({
    //   roundOptions,
    //   resurrectionRoundEnabled,
    //   dealRoundEnabled,
    //   dealReturnEnabled,
    //   inactiveOneTimeRounds,
    //   oneTimeRounds,
    // });
    if (
      !resurrectionRoundEnabled &&
      dealItem &&
      dealReturnEnabled &&
      (eliminatedItems.length >= activeItems.length || activeItems.length <= 2)
    ) {
      roundOptions = [RoundType.DealReturn]
    } else {
      roundOptions = roundOptions.filter(
        (round) => round !== RoundType.DealReturn
      )
    }

    // this is ran before current item is eliminated
    if (
      resurrectionRoundEnabled &&
      eliminatedItems.length >= activeItems.length
    ) {
      roundOptions = [RoundType.Resurrection]
    } else {
      roundOptions = roundOptions.filter(
        (round) => round !== RoundType.Resurrection
      )
    }

    // console.log("prophecy enabled", prophecyRoundEnabled);
    if (dealRoundEnabled) {
      roundOptions = [RoundType.Deal]
    } else {
      roundOptions = roundOptions.filter((round) => round !== RoundType.Deal)
    }

    const nextRoundType = sample(roundOptions) as RoundType

    if (nextRoundType in oneTimeRounds) {
      disableOneTimeRound(nextRoundType)
    } else {
      setLastNonBonusRoundType(nextRoundType)
    }

    console.log('setting next round', nextRoundType)
    setCurrentRoundType(nextRoundType)
    setTurnirState(TurnirState.RoundStart)
  }

  useEffect(() => {
    if (turnirState === TurnirState.Start) {
      setRoundId(roundId + 1)
      setNextRoundType()
    }
    if (turnirState === TurnirState.RoundChange) {
      if (activeItems.length === 1) {
        setTurnirState(TurnirState.Victory)
        setMusicPlaying(MusicType.Victory)
      } else {
        setRoundNumber(roundNumber + 1)
        setNextRoundType()
      }
    }
    // eslint-disable-next-line
  }, [turnirState, items])

  const finishRound = () => {
    setTurnirState(TurnirState.RoundChange)
    setItems([...items])
  }

  const startTurnir = () => {
    nonEmptyItems.forEach((item) => {
      item.status = ItemStatus.Active
      item.eliminationRound = undefined
      item.eliminationType = undefined
      item.isProtected = false
      item.swappedWith = undefined
      item.isResurrected = false
      item.hasDeal = false
    })
    setCurrentRoundType(null)
    setItems([...nonEmptyItems])
    setRoundNumber(1)
    setRoundId(0)
    setOneTimeRounds({
      [RoundType.Resurrection]: true,
      [RoundType.Protection]: true,
      [RoundType.Swap]: true,
      [RoundType.Deal]: true,
      [RoundType.DealReturn]: true,
    })
    setLastNonBonusRoundType(null)
    setTurnirState(TurnirState.Start)
  }

  const onSkipRoundClick = () => {
    // setNextRoundType();
    // setTurnirState(TurnirState.RoundChange);
    setShowSkipRoundModal(true)
  }

  const onItemElimination = (id: string) => {
    if (dealItem && dealItem.id === id) {
      dealItem.status = ItemStatus.Eliminated
      dealItem.eliminationRound = roundNumber
      if (currentRoundType) {
        dealItem.eliminationType = currentRoundType
      }
      finishRound()
      return
    }

    const item = activeItems.find((item) => item.id === id)
    if (item) {
      if (item.isProtected) {
        setShowProtectionModal(true)
      } else if (item.swappedWith && targetSwapItem) {
        setShowSwapModal(true)
        setInitialSwapItem(item)
        setActionSwapItem(targetSwapItem)
      } else if (
        targetSwapItem &&
        swapItem?.swappedWith &&
        item.id === targetSwapItem.id
      ) {
        setShowSwapModal(true)
        setInitialSwapItem(item)
        setActionSwapItem(swapItem)
      } else {
        item.status = ItemStatus.Eliminated
        item.eliminationRound = roundNumber
        if (currentRoundType) {
          item.eliminationType = currentRoundType
        }
        setRoundNumber(roundNumber + 1)
        finishRound()
      }
    }
  }

  const onItemProtection = (id: string) => {
    const item = activeItems.find((item) => item.id === id)
    if (item) {
      item.isProtected = true
      finishRound()
    }
  }

  const onItemSwap = (id: string) => {
    const item = activeItems.find((item) => item.id === id)
    if (item) {
      const targetItem = sample(activeItems.filter((i) => i.id !== id))
      if (!targetItem) {
        return
      }
      item.swappedWith = targetItem.id
      finishRound()
    }
  }

  const onItemResurrection = (id: string) => {
    const item = eliminatedItems.find((item) => item.id === id)
    if (item) {
      item.isResurrected = true
      item.status = ItemStatus.Active
      item.eliminationRound = undefined
      item.eliminationType = undefined
      finishRound()
    }
  }

  const onDealReturn = (id: string) => {
    if (dealItem) {
      dealItem.status = ItemStatus.Active
      dealItem.eliminationRound = undefined
      dealItem.eliminationType = undefined
      finishRound()
    }
  }

  const onItemDeal = (id: string) => {
    const item = activeItems.find((item) => item.id === id)
    if (item) {
      item.hasDeal = true
      item.status = ItemStatus.Excluded
      finishRound()
    }
  }

  const onRestartClick = () => {
    setTurnirState(TurnirState.EditCandidates)
    setMusicPlaying(undefined)
  }

  const onRoundTypeClick = (roundType: RoundType) => {
    roundTypes.set(roundType, !roundTypes.get(roundType))
    setRoundTypes(new Map(roundTypes))
  }

  const canEditItems = turnirState === TurnirState.EditCandidates

  return (
    <>
      <MainMenu title={title ? `Турнир: ${title}` : 'Турнир'} />
      <Grid
        container
        columnSpacing={0}
        border={0}
        columns={12}
        sx={{ borderTop: 0.5, borderBottom: 0.5, borderColor: 'grey.700' }}
      >
        <Grid
          item
          xs={canEditItems ? 6 : 4}
          borderRight={0.5}
          borderColor="grey.700"
        >
          <Grid container columns={canEditItems ? 6 : 4}>
            <Grid
              item
              xs={4}
              paddingTop={2}
              paddingLeft={2}
              borderBottom={0.5}
              borderColor="grey.700"
              sx={{ width: '100%', paddingBottom: 2 }}
            >
              <Grid container>
                <Grid item marginRight={2}>
                  <Button
                    variant="contained"
                    color="error"
                    disabled={turnirState === TurnirState.EditCandidates}
                    onClick={onRestartClick}
                    endIcon={<RestartAlt />}
                  >
                    Рестарт
                  </Button>
                </Grid>
                <Grid item marginRight={2}>
                  <Button
                    variant="contained"
                    disabled={turnirState !== TurnirState.RoundStart}
                    onClick={onSkipRoundClick}
                    endIcon={<SkipNext />}
                  >
                    Скипнуть раунд
                  </Button>
                </Grid>
                <Grid item marginRight={2}>
                  <Button
                    variant="contained"
                    onClick={startTurnir}
                    disabled={
                      nonEmptyItems.length === 0 ||
                      turnirState !== TurnirState.EditCandidates
                    }
                    endIcon={<StartIcon />}
                    color="success"
                  >
                    Запуск
                  </Button>
                </Grid>
              </Grid>
            </Grid>

            {canEditItems && (
              <Grid
                item
                xs={2}
                borderBottom={0.5}
                paddingTop={2}
                paddingLeft={2}
                borderLeft={0.5}
                borderColor="grey.700"
              >
                <Tooltip title="Один и тот же раунд не будет повторяться подряд">
                  <FormControlLabel
                    control={
                      <Checkbox
                        disabled={!canEditItems}
                        checked={noRoundRepeat}
                        style={{ paddingTop: 0, paddingBottom: 0 }}
                        onChange={() => setNoRoundRepeat(!noRoundRepeat)}
                      />
                    }
                    label={'Антиповтор раундов'}
                  />
                </Tooltip>
              </Grid>
            )}

            <Grid
              item
              xs={4}
              paddingLeft={2}
              paddingTop={2}
              borderColor={'grey.700'}
            >
              <ItemsList
                items={items}
                setItem={setItemValue}
                activeItems={nonEmptyItems}
                canEditItems={canEditItems}
              />
            </Grid>

            {canEditItems ? (
              <>
                <Grid
                  item
                  xs={2}
                  paddingTop={2}
                  borderLeft={0.5}
                  borderColor={'grey.700'}
                >
                  <Grid container columns={1}>
                    <Box
                      borderBottom={0.5}
                      borderColor={'grey.700'}
                      width={'100%'}
                      paddingBottom={2}
                    >
                      <Box paddingLeft={2}>
                        <Grid item>Классические раунды</Grid>
                        {classicRounds.map((roundType, index) => {
                          return (
                            <Grid item key={index} xs={1} paddingTop={1}>
                              <Tooltip
                                title={
                                  RoundTypeTooltip[roundType as string] || ''
                                }
                              >
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      disabled={
                                        turnirState !==
                                        TurnirState.EditCandidates
                                      }
                                      checked={roundTypes.get(roundType)}
                                      style={{
                                        paddingTop: 0,
                                        paddingBottom: 0,
                                      }}
                                      onChange={() =>
                                        onRoundTypeClick(roundType)
                                      }
                                    />
                                  }
                                  label={RoundTypeNames[roundType]}
                                />
                              </Tooltip>
                            </Grid>
                          )
                        })}
                      </Box>
                    </Box>
                    <Box paddingTop={2} paddingLeft={2}>
                      <Grid item xs={1}>
                        Новые раунды
                      </Grid>

                      {newRounds.map((roundType, index) => {
                        return (
                          <Grid item key={index} xs={1} paddingTop={1}>
                            <Tooltip
                              title={
                                RoundTypeTooltip[roundType as string] || ''
                              }
                            >
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    disabled={
                                      turnirState !== TurnirState.EditCandidates
                                    }
                                    checked={roundTypes.get(roundType)}
                                    style={{ paddingTop: 0, paddingBottom: 0 }}
                                    onChange={() => onRoundTypeClick(roundType)}
                                  />
                                }
                                label={RoundTypeNames[roundType]}
                              />
                            </Tooltip>
                          </Grid>
                        )
                      })}
                    </Box>
                  </Grid>
                </Grid>

                <Grid
                  item
                  xs={4}
                  paddingLeft={2}
                  paddingBottom={2}
                  paddingTop={2}
                >
                  <Button variant="contained" onClick={addMoreItems}>
                    Добавить слотов
                  </Button>
                  <Box component="span" sx={{ marginLeft: 2 }}>
                    <SavePreset items={activeItems} title={title} />
                  </Box>
                </Grid>
                <Grid item xs={2} borderLeft={0.5} borderColor={'grey.700'} />
              </>
            ) : (
              <Grid item xs={4} paddingTop={2} />
            )}
          </Grid>
        </Grid>

        {turnirState === TurnirState.RoundStart && currentRoundType && (
          <>
            <Grid item xs={5} padding={2}>
              <Box textAlign="center">
                <RoundTitle
                  roundNumber={roundNumber}
                  roundType={currentRoundType}
                  itemsLeft={activeItems.length}
                  totalRounds={nonEmptyItems.length - 1}
                />
                <RoundContent
                  roundType={currentRoundType}
                  roundId={roundId}
                  activeItems={activeItems}
                  eliminatedItems={eliminatedItems}
                  onItemElimination={onItemElimination}
                  onItemProtection={onItemProtection}
                  onItemSwap={onItemSwap}
                  onItemResurrection={onItemResurrection}
                  onIteamDeal={onItemDeal}
                  dealItem={dealItem}
                  onDealReturn={onDealReturn}
                />
              </Box>
            </Grid>
            <Grid item xs={3} />
          </>
        )}

        {turnirState === TurnirState.Victory && (
          <Grid item xs={8} textAlign={'center'}>
            <Victory winner={activeItems[0]} />
          </Grid>
        )}
      </Grid>

      {initialSwapItem && actionSwapItem && (
        <SwapRevealModal
          open={showSwapModal}
          onClose={() => {
            setShowSwapModal(false)
            initialSwapItem.swappedWith = undefined
            actionSwapItem.swappedWith = undefined
            onItemElimination(actionSwapItem.id)
          }}
          initialItem={initialSwapItem}
          actionItem={actionSwapItem}
        />
      )}
      {protectedItem && (
        <ProtectionRemoveModal
          open={showProtectionModal}
          onClose={() => {
            setShowProtectionModal(false)
            protectedItem.isProtected = false
            finishRound()
          }}
          item={protectedItem}
        />
      )}
      <SkipRoundModal
        open={showSkipRoundModal}
        onClose={() => {
          setShowSkipRoundModal(false)
        }}
        onConfirm={() => {
          setShowSkipRoundModal(false)
          finishRound()
        }}
      />
    </>
  )
}

export default TournirApp
