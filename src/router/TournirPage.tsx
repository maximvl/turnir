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
} from "../types";
import {
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  useTheme,
} from "@mui/material";
import { isEmpty, sample, filter } from "lodash";
import { createItem } from "../utils";
import RoundTitle from "../components/RoundTitle";
import RoundContent from "../components/RoundContent";
import { QueryClient, QueryClientProvider } from "react-query";
import StartIcon from "@mui/icons-material/Start";
import { RestartAlt, SkipNext } from "@mui/icons-material";

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

  const [roundTypes, setRoundTypes] = useState<Map<RoundType, boolean>>(
    RoundTypes.reduce((acc, t) => acc.set(t, true), new Map()),
  );

  const allRounds = Array.from(roundTypes.keys());
  const activeRounds: RoundType[] = filter(allRounds, (key) =>
    Boolean(roundTypes.get(key)),
  );

  const theme = useTheme();

  useEffect(() => {
    setItems(
      Array(initialItems)
        .fill(0)
        .map(() => createItem()),
    );
  }, []);

  const nonEmptyItems = items.filter((item) => !isEmpty(item.title));
  const activeItems = nonEmptyItems.filter(
    (item) => item.status === ItemStatus.Active,
  );

  useEffect(() => {
    if (activeItems.length === 1 && turnirState === TurnirState.Start) {
      setTurnirState(TurnirState.Victory);
    }
  }, [activeItems.length, turnirState]);

  const addMoreItems = () => {
    setItems([
      ...items,
      ...Array(increaseAmount)
        .fill(0)
        .map(() => createItem()),
    ]);
  };

  const setItemValue = (id: number, text: string) => {
    items[id].title = text;
    setItems([...items]);
  };

  const startTurnir = () => {
    setTurnirState(TurnirState.Start);
    setItems([...nonEmptyItems]);
    setCurrentRoundType(sample(activeRounds) as RoundType);
  };

  const onNextRoundClick = () => {
    setRoundNumber(roundNumber + 1);
    setCurrentRoundType(sample(activeRounds) as RoundType);
  };

  const onItemElimination = (id: number) => {
    activeItems[id].status = ItemStatus.Eliminated;
    setItems([...items]);
    setRoundNumber(roundNumber + 1);
    const nextRound = sample(activeRounds) as RoundType;
    setCurrentRoundType(nextRound);
  };

  const onRestartClick = () => {
    setTurnirState(TurnirState.EditCandidates);
    setRoundNumber(1);
    items.forEach((item) => {
      item.status = ItemStatus.Active;
    });
    setItems([...items]);
  };

  const onRoundTypeClick = (roundType: RoundType) => {
    roundTypes.set(roundType, !roundTypes.get(roundType));
    setRoundTypes(new Map(roundTypes));
  };

  const canEditItems = turnirState === TurnirState.EditCandidates;

  return (
    <QueryClientProvider client={queryClient}>
      <div className="App" style={{ marginBottom: 20 }}>
        <h1>Турнир</h1>
        <Divider />
      </div>
      <Grid container columnSpacing={0} border={0} columns={12}>
        <Grid item xs={4} border={0}>
          <Grid
            container
            columns={1}
            border={0}
            rowGap={2}
            paddingLeft={6}
            paddingRight={3}
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
                  Добавить
                </Button>
              </Grid>
            )}
          </Grid>
        </Grid>
        <Divider orientation="vertical" flexItem style={{ marginRight: 20 }} />
        <Grid item xs={2} border={0} paddingRight={0}>
          <Grid container rowGap={2} alignItems="baseline">
            {allRounds.map((roundType, index) => {
              return (
                <Grid item key={index}>
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

            <Grid item>
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
            <Grid item width="inherit">
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
            <Grid item width="inherit">
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
        <Grid item xs={5} border={0} textAlign="center">
          {turnirState === TurnirState.Start && (
            <div>
              <RoundTitle
                roundNumber={roundNumber}
                roundType={currentRoundType}
                itemsLeft={activeItems.length}
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
            </div>
          )}
        </Grid>
      </Grid>
    </QueryClientProvider>
  );
}

export default TournirApp;
