import { RestartAlt, SkipNext, VolumeOff, VolumeUp } from "@mui/icons-material";
import StartIcon from "@mui/icons-material/Start";
import { Box, Checkbox, Divider, FormControlLabel, Grid, Slider, Tooltip } from "@mui/material";
import Button from "@mui/material/Button";
import "App.css";
import ItemsList from "components/ItemsList";
import RoundContent from "components/rounds/shared/RoundContent";
import RoundTitle from "components/rounds/shared/RoundTitle";
import SavePreset from "components/SavePreset";
import SwapRevealModal from "components/SwapRevealModal";
import Victory from "components/Victory";
import { MusicContext } from "contexts/MusicContext";
import { filter, isEmpty, sample, toString } from "lodash";
import { useContext, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { useParams } from "react-router";
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
} from "types";
import { createItem, fetchPreset } from "utils";
import MainMenu from "./MainMenu";

const queryClient = new QueryClient();

function TournirApp() {
  const increaseAmount = 10;
  const initialItems = 10;
  const [roundNumber, setRoundNumber] = useState(0);
  const [currentRoundType, setCurrentRoundType] = useState(RoundType.RandomElimination);

  const [title, setTitle] = useState("");

  const { id: presetId } = useParams();
  const loadPreset = async (presetId: string) => {
    const preset = await fetchPreset(presetId).catch((e) => ({
      error: "Error loading preset",
      exception: e,
    }));
    if ("error" in preset) {
      setTitle("Error loading preset");
      console.log(preset);
      return;
    }
    setItems(preset.options.map((title, index) => createItem((index + 1).toString(), title)));
    setTitle(preset.title);
  };

  const [protectionRoundEnabled, setProtectionRoundEnabled] = useState(true);
  const [swapRoundEnabled, setSwapRoundEnabled] = useState(true);

  const [items, setItems] = useState<Item[]>(() => {
    if (presetId) {
      return [];
    }
    return Array(initialItems)
      .fill(0)
      .map((_, index) => createItem(toString(index + 1)));
  });
  const [turnirState, setTurnirState] = useState<TurnirState>(TurnirState.EditCandidates);

  const [noRoundRepeat, setNoRoundRepeat] = useState(true);

  const [roundTypes, setRoundTypes] = useState<Map<RoundType, boolean>>(
    RoundTypes.reduce((acc, t) => acc.set(t, true), new Map()),
  );

  const [showSwapModal, setShowSwapModal] = useState(false);
  const [initialSwapItem, setInitialSwapItem] = useState<Item | undefined>(undefined);
  const [actionSwapItem, setActionSwapItem] = useState<Item | undefined>(undefined);

  const allRounds = Array.from(roundTypes.keys());
  const activeRounds: RoundType[] = filter(allRounds, (key) => Boolean(roundTypes.get(key)));

  const classicRounds = allRounds.filter((round) => ClassicRoundTypes.includes(round));
  const newRounds = allRounds.filter((round) => NewRoundTypes.includes(round));

  useEffect(() => {
    if (presetId) {
      loadPreset(presetId);
    }
    // eslint-disable-next-line
  }, [presetId]);

  const { setMusicPlaying, isMuted, setIsMuted, volume, setVolume } = useContext(MusicContext);

  const nonEmptyItems = items.filter((item) => !isEmpty(item.title));
  const activeItems = nonEmptyItems.filter((item) => item.status !== ItemStatus.Eliminated);
  const swapItem = activeItems.find((item) => item.swappedWith !== undefined);
  const targetSwapItem = activeItems.find((item) => item.id === swapItem?.swappedWith);
  // console.log("swap:", swapItem, targetSwapItem);

  const addMoreItems = () => {
    const nextIndex = items.length;
    setItems([
      ...items,
      ...Array(increaseAmount)
        .fill(0)
        .map((_, index) => createItem(toString(index + nextIndex + 1))),
    ]);
  };

  const setItemValue = (id: number, text: string) => {
    items[id].title = text;
    setItems([...items]);
  };

  const setNextRoundType = () => {
    let roundOptions = activeRounds;
    if (!protectionRoundEnabled) {
      roundOptions = roundOptions.filter((round) => round !== RoundType.Protection);
    }
    if (!swapRoundEnabled) {
      roundOptions = roundOptions.filter((round) => round !== RoundType.Swap);
    }
    if (noRoundRepeat && roundOptions.length > 1 && roundNumber > 0) {
      roundOptions = roundOptions.filter((round) => round !== currentRoundType);
    }
    const nextRoundType = sample(roundOptions) as RoundType;

    switch (nextRoundType) {
      case RoundType.StreamerChoice:
        setMusicPlaying(MusicType.Thinking);
        break;
      case RoundType.ViewerChoice:
        setMusicPlaying(MusicType.RickRoll);
        break;
      default:
        setMusicPlaying(undefined);
        break;
    }
    setCurrentRoundType(nextRoundType);
  };

  const startTurnir = () => {
    setTurnirState(TurnirState.Start);
    setItems([...nonEmptyItems]);
    setRoundNumber(1);
    setNextRoundType();
  };

  const onNextRoundClick = () => {
    setNextRoundType();
  };

  const onItemElimination = (id: string) => {
    const item = activeItems.find((item) => item.id === id);
    if (item) {
      if (item.isProtected) {
        item.isProtected = false;
        setNextRoundType();
      } else if (item.swappedWith && targetSwapItem) {
        setShowSwapModal(true);
        setInitialSwapItem(item);
        setActionSwapItem(targetSwapItem);
        item.swappedWith = undefined;
      } else if (targetSwapItem && swapItem && item.id === targetSwapItem.id) {
        setShowSwapModal(true);
        setInitialSwapItem(item);
        setActionSwapItem(swapItem);
        swapItem.swappedWith = undefined;
      } else {
        item.status = ItemStatus.Eliminated;
        item.eliminationRound = roundNumber;
        item.eliminationType = currentRoundType;
        setRoundNumber(roundNumber + 1);
        if (activeItems.length === 2 && turnirState === TurnirState.Start) {
          setTurnirState(TurnirState.Victory);
          setMusicPlaying(MusicType.Victory);
        } else {
          setNextRoundType();
        }
      }
      setItems([...items]);
    }
  };

  const onItemProtection = (id: string) => {
    const item = activeItems.find((item) => item.id === id);
    if (item) {
      item.isProtected = true;
      setProtectionRoundEnabled(false);
      setItems([...items]);
      setNextRoundType();
    }
  };

  const onItemSwap = (id: string) => {
    const item = activeItems.find((item) => item.id === id);
    if (item) {
      const targetItem = sample(activeItems.filter((i) => i.id !== id));
      if (!targetItem) {
        return;
      }
      item.swappedWith = targetItem.id;
      setSwapRoundEnabled(false);
      setItems([...items]);
      setNextRoundType();
    }
  };

  const onRestartClick = () => {
    setTurnirState(TurnirState.EditCandidates);
    setRoundNumber(1);
    items.forEach((item) => {
      item.status = ItemStatus.Active;
      item.eliminationRound = undefined;
      item.eliminationType = undefined;
      item.isProtected = false;
      item.swappedWith = undefined;
    });
    setItems([...items]);
    setMusicPlaying(undefined);
    setProtectionRoundEnabled(true);
    setSwapRoundEnabled(true);
  };

  const onRoundTypeClick = (roundType: RoundType) => {
    roundTypes.set(roundType, !roundTypes.get(roundType));
    setRoundTypes(new Map(roundTypes));
  };

  const canEditItems = turnirState === TurnirState.EditCandidates;

  return (
    <QueryClientProvider client={queryClient}>
      <MainMenu title={title ? `Турнир: ${title}` : "Турнир"} />
      <Grid
        container
        columnSpacing={0}
        border={0}
        columns={12}
        sx={{ borderTop: 0.5, borderBottom: 0.5, borderColor: "grey.700" }}
      >
        <Grid item xs={4} border={0} paddingTop={2} sx={{ width: "100%", paddingBottom: 2 }}>
          <Grid container columns={1} border={0} rowGap={2} paddingLeft={6} paddingRight={2}>
            <Grid item xs={1} paddingLeft={0}>
              <ItemsList items={items} setItem={setItemValue} activeItems={nonEmptyItems} canEditItems={canEditItems} />
            </Grid>
            {canEditItems && (
              <Grid item xs={1}>
                <Button variant="contained" onClick={addMoreItems}>
                  Добавить слотов
                </Button>
                <Box component="span" sx={{ marginLeft: 2 }}>
                  <SavePreset items={activeItems} title={title} />
                </Box>
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
            borderColor: "grey.700",
          }}
        >
          <Grid container rowGap={2} alignItems="baseline" columns={1}>
            <Grid item xs={1} paddingLeft={2} display="flex" alignItems={"center"}>
              <Button variant="outlined" onClick={() => setIsMuted(!isMuted)} sx={{ marginRight: 2 }}>
                {isMuted ? <VolumeOff /> : <VolumeUp />}
              </Button>
              <Slider
                aria-label="Volume"
                value={volume}
                min={0}
                max={1}
                step={0.01}
                onChange={(_evt, value) => {
                  setVolume(value as number);
                }}
                sx={{ marginRight: 2 }}
              />
            </Grid>
            <Grid item xs={1} paddingLeft={2}>
              <Tooltip title="Один и тот же раунд не будет повторяться подряд">
                <FormControlLabel
                  control={
                    <Checkbox
                      disabled={turnirState !== TurnirState.EditCandidates}
                      checked={noRoundRepeat}
                      style={{ paddingTop: 0, paddingBottom: 0 }}
                      onChange={() => setNoRoundRepeat(!noRoundRepeat)}
                    />
                  }
                  label={"Антиповтор раундов"}
                />
              </Tooltip>
            </Grid>

            <Grid item xs={1}>
              <Divider style={{ width: "inherit" }} />
            </Grid>

            <Grid item xs={1} paddingLeft={2}>
              Классические раунды
            </Grid>

            {classicRounds.map((roundType, index) => {
              return (
                <Grid item key={index} xs={1} paddingLeft={2}>
                  <Tooltip title={RoundTypeTooltip[roundType as string] || ""}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          disabled={turnirState !== TurnirState.EditCandidates}
                          checked={roundTypes.get(roundType)}
                          style={{ paddingTop: 0, paddingBottom: 0 }}
                          onChange={() => onRoundTypeClick(roundType)}
                        />
                      }
                      label={RoundTypeNames[roundType]}
                    />
                  </Tooltip>
                </Grid>
              );
            })}

            <Grid item xs={1}>
              <Divider style={{ width: "inherit" }} />
            </Grid>

            <Grid item xs={1} paddingLeft={2}>
              Новые раунды
            </Grid>

            {newRounds.map((roundType, index) => {
              return (
                <Grid item key={index} xs={1} paddingLeft={2}>
                  <Tooltip title={RoundTypeTooltip[roundType as string] || ""}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          disabled={turnirState !== TurnirState.EditCandidates}
                          checked={roundTypes.get(roundType)}
                          style={{ paddingTop: 0, paddingBottom: 0 }}
                          onChange={() => onRoundTypeClick(roundType)}
                        />
                      }
                      label={RoundTypeNames[roundType]}
                    />
                  </Tooltip>
                </Grid>
              );
            })}

            <Grid item xs={1}>
              <Divider style={{ width: "inherit" }} />
            </Grid>

            <Grid item paddingLeft={2} xs={1}>
              <Button
                variant="contained"
                onClick={startTurnir}
                disabled={nonEmptyItems.length === 0 || turnirState !== TurnirState.EditCandidates}
                endIcon={<StartIcon />}
                color="success"
              >
                Запуск
              </Button>
            </Grid>
            <Grid item paddingLeft={2} xs={1}>
              <Button
                variant="contained"
                disabled={turnirState !== TurnirState.RoundEnd && turnirState !== TurnirState.Start}
                onClick={onNextRoundClick}
                endIcon={<SkipNext />}
              >
                Скипнуть раунд
              </Button>
            </Grid>
            <Grid item paddingLeft={2} xs={1}>
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
          </Grid>
        </Grid>

        <Grid item xs={6} border={0} paddingTop={2} paddingRight={6} paddingBottom={2} textAlign="center">
          {turnirState === TurnirState.Start && (
            <div>
              <RoundTitle
                roundNumber={roundNumber}
                roundType={currentRoundType}
                itemsLeft={activeItems.length}
                totalRounds={nonEmptyItems.length - 1}
              />
              <RoundContent
                roundType={currentRoundType}
                items={activeItems}
                onItemElimination={onItemElimination}
                onItemProtection={onItemProtection}
                onItemSwap={onItemSwap}
              />
            </div>
          )}
          {turnirState === TurnirState.Victory && <Victory winner={activeItems[0]} />}
        </Grid>
      </Grid>
      {initialSwapItem && actionSwapItem && (
        <SwapRevealModal
          open={showSwapModal}
          onClose={() => {
            onItemElimination(actionSwapItem.id);
            setShowSwapModal(false);
          }}
          initialItem={initialSwapItem}
          actionItem={actionSwapItem}
        />
      )}
    </QueryClientProvider>
  );
}

export default TournirApp;
