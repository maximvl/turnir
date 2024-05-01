import React, { useEffect, useState } from "react";
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
  MusicTypeIds,
} from "../types";
import {
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  Tooltip,
  useTheme,
} from "@mui/material";
import { isEmpty, sample, filter, toString } from "lodash";
import { createItem } from "../utils";
import RoundTitle from "../components/RoundTitle";
import RoundContent from "../components/RoundContent";
import { QueryClient, QueryClientProvider } from "react-query";
import StartIcon from "@mui/icons-material/Start";
import { RestartAlt, SkipNext } from "@mui/icons-material";
import fireworks from "../images/fireworks.gif";

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

  const [musicPlaying, setMusicPlaying] = useState<MusicType | undefined>(
    undefined,
  );

  const wheelMusic = document.getElementById(
    MusicTypeIds[MusicType.WheelMusic],
  ) as HTMLAudioElement | null;

  if (wheelMusic) {
    console.log("have wheel music");
    if (musicPlaying === MusicType.WheelMusic) {
      console.log("starting play");
      wheelMusic.play();
    } else {
      console.log("stopping play");
      wheelMusic.pause();
      wheelMusic.currentTime = 0;
    }
  }

  const victoryMusic = document.getElementById(
    MusicTypeIds[MusicType.VictoryMusic],
  ) as HTMLAudioElement | null;

  if (victoryMusic) {
    console.log("have victory music");
    if (musicPlaying === MusicType.VictoryMusic) {
      console.log("starting play");
      victoryMusic.play();
    } else {
      console.log("stopping play");
      victoryMusic.pause();
      victoryMusic.currentTime = 0;
    }
  }

  const allRounds = Array.from(roundTypes.keys());
  const activeRounds: RoundType[] = filter(allRounds, (key) =>
    Boolean(roundTypes.get(key)),
  );

  const theme = useTheme();

  useEffect(() => {
    setItems(
      Array(initialItems)
        .fill(0)
        .map((_, index) => createItem(toString(index + 1))),
    );
  }, []);

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
    if (nextRoundType === RoundType.RandomElimination) {
      console.log("starting music");
      setMusicPlaying(MusicType.WheelMusic);
    } else {
      setMusicPlaying(undefined);
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
      setRoundNumber(roundNumber + 1);
      setNextRoundType();

      if (activeItems.length === 2 && turnirState === TurnirState.Start) {
        setTurnirState(TurnirState.Victory);
        setMusicPlaying(MusicType.VictoryMusic);
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
        <Divider />
      </div>
      <Grid container columnSpacing={0} border={0} columns={12}>
        <Grid item xs={4} border={0} paddingTop={2}>
          <Grid container columns={1} border={0} rowGap={2} paddingLeft={6}>
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
        <Divider orientation="vertical" flexItem />
        <Grid item xs={2} border={0} paddingRight={0} paddingTop={2}>
          <Grid container rowGap={2} alignItems="baseline" columns={1}>
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
        <Divider orientation="vertical" flexItem />
        <Grid item xs={5} border={0} paddingTop={2} textAlign="center">
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
            <div>
              <h1>Победитель</h1>
              <h2 style={{ color: theme.palette.primary.dark }}>
                {activeItems[0].title.toLocaleUpperCase()}
              </h2>
              <img src={fireworks} alt="" />
            </div>
          )}
        </Grid>
      </Grid>
    </QueryClientProvider>
  );
}

export default TournirApp;
