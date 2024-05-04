import React, { useContext, useEffect, useState } from "react";
import "../App.css";
import ItemsList from "../components/ItemsList";
import Button from "@mui/material/Button";
import {
  Item,
  ItemStatus,
  RoundType,
  RoundTypes,
  TurnirState,
  RoundTypeNames,
  MusicType,
} from "../types";
import {
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  Tooltip,
} from "@mui/material";
import { isEmpty, sample, filter, toString } from "lodash";
import { createItem } from "../utils";
import RoundTitle from "../components/RoundTitle";
import RoundContent from "../components/RoundContent";
import { QueryClient, QueryClientProvider } from "react-query";
import StartIcon from "@mui/icons-material/Start";
import { RestartAlt, SkipNext, VolumeOff, VolumeUp } from "@mui/icons-material";
import { MusicContext } from "../contexts/MusicContext";
import Victory from "../components/Victory";
import Wheel from "../components/Wheel";

const queryClient = new QueryClient();

function TournirApp() {
  const increaseAmount = 10;
  const initialItems = 10;
  const [roundNumber, setRoundNumber] = useState(1);
  const [currentRoundType, setCurrentRoundType] = useState(
    RoundType.RandomElimination,
  );

  const [items, setItems] = useState<Item[]>([]);
  const [turnirState, setTurnirState] = useState<TurnirState>(
    TurnirState.EditCandidates,
  );

  const [noRoundRepeat, setNoRoundRepeat] = useState(true);

  const [roundTypes, setRoundTypes] = useState<Map<RoundType, boolean>>(
    RoundTypes.reduce((acc, t) => acc.set(t, true), new Map()),
  );

  const allRounds = Array.from(roundTypes.keys());
  const activeRounds: RoundType[] = filter(allRounds, (key) =>
    Boolean(roundTypes.get(key)),
  );

  useEffect(() => {
    setItems(
      Array(initialItems)
        .fill(0)
        .map((_, index) => createItem(toString(index + 1))),
    );
  }, []);

  const { setMusicPlaying, isMuted, setIsMuted } = useContext(MusicContext);

  const nonEmptyItems = items.filter((item) => !isEmpty(item.title));
  const activeItems = nonEmptyItems.filter(
    (item) => item.status === ItemStatus.Active,
  );

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
    let nextRoundType = null;
    if (noRoundRepeat) {
      const remainingRounds = activeRounds.filter(
        (round) => round !== currentRoundType,
      );
      nextRoundType = sample(remainingRounds) as RoundType;
    } else {
      nextRoundType = sample(activeRounds) as RoundType;
    }
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
    setNextRoundType();
  };

  const onNextRoundClick = () => {
    setRoundNumber(roundNumber + 1);
    setNextRoundType();
  };

  const onItemElimination = (id: string) => {
    const item = activeItems.find((item) => item.id === id);
    if (item) {
      item.status = ItemStatus.Eliminated;
      item.eliminationRound = roundNumber;
      item.eliminationType = currentRoundType;
      setItems([...items]);

      if (activeItems.length === 2 && turnirState === TurnirState.Start) {
        setTurnirState(TurnirState.Victory);
        setMusicPlaying(MusicType.Victory);
      } else {
        setRoundNumber(roundNumber + 1);
        setNextRoundType();
      }
    }
  };

  const onRestartClick = () => {
    setTurnirState(TurnirState.EditCandidates);
    setRoundNumber(1);
    items.forEach((item) => {
      item.status = ItemStatus.Active;
      item.eliminationRound = undefined;
      item.eliminationType = undefined;
    });
    setItems([...items]);
    setMusicPlaying(undefined);
  };

  const onRoundTypeClick = (roundType: RoundType) => {
    roundTypes.set(roundType, !roundTypes.get(roundType));
    setRoundTypes(new Map(roundTypes));
  };

  const canEditItems = turnirState === TurnirState.EditCandidates;

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          style={{
            fontWeight: "bold",
            fontSize: "2em",
            margin: 20,
          }}
        >
          Турнир
        </Box>
      </div>
      <Grid
        container
        columnSpacing={0}
        border={0}
        columns={12}
        sx={{ borderTop: 0.5, borderBottom: 0.5, borderColor: "grey.700" }}
      >
        <Grid
          item
          xs={4}
          border={0}
          paddingTop={2}
          sx={{ width: "100%", paddingBottom: 2 }}
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
            borderColor: "grey.700",
          }}
        >
          <Grid container rowGap={2} alignItems="baseline" columns={1}>
            <Grid item xs={1} paddingLeft={2}>
              <Button variant="outlined" onClick={() => setIsMuted(!isMuted)}>
                {isMuted ? <VolumeOff /> : <VolumeUp />}
              </Button>
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
            <Grid item xs={1} paddingLeft={2}>
              Раунды
            </Grid>

            {allRounds.map((roundType, index) => {
              return (
                <Grid item key={index} xs={1} paddingLeft={2}>
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
            <Grid item paddingLeft={2} xs={1}>
              <Button
                variant="contained"
                disabled={
                  turnirState !== TurnirState.RoundEnd &&
                  turnirState !== TurnirState.Start
                }
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

        <Grid
          item
          xs={6}
          border={0}
          paddingTop={2}
          paddingRight={6}
          paddingBottom={2}
          textAlign="center"
        >
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
              />
            </div>
          )}
          {turnirState === TurnirState.Victory && (
            <Victory winner={activeItems[0]} />
          )}
        </Grid>
      </Grid>
    </QueryClientProvider>
  );
}

export default TournirApp;
