import { Box, Button, Input, TextField } from "@mui/material";
import useChatVoting from "components/hooks/useChatVoting";
import { isEmpty, isUndefined } from "lodash";
import { useContext, useEffect, useState } from "react";
import { Item, MusicType } from "types";
import PollResults from "../ViewerChoice/PollResults";
import VotesLog from "../ViewerChoice/VotesLog";
import InfoPanel from "../shared/InfoPanel";
import { MusicContext } from "contexts/MusicContext";

type Props = {
  items: Item[];
  onItemElimination: (id: string) => void;
};

export default function ClosestVotesRound({ items, onItemElimination }: Props) {
  const { state, setState, votesMap, voteMessages, error, isLoading } = useChatVoting({ items });
  const { setMusicPlaying } = useContext(MusicContext);

  const [time, setTime] = useState(() => 0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(time + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [time]);

  const [targetNumber, setTargetNumber] = useState<number | undefined>(undefined);

  useEffect(() => {
    setTargetNumber(undefined);
    setTime(0);
  }, [items.length]);
  // console.log("target:", targetNumber)

  const onStart = () => {
    setState("voting");
    setMusicPlaying(MusicType.RickRoll);
  };

  if (error) {
    return <div>Ошибка: {error.toString()}</div>;
  }

  if (isEmpty(votesMap) && isLoading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div>
      {state === "initial" && (
        <>
          <div style={{ display: "grid", justifyContent: "center" }}>
            <InfoPanel>
              <p style={{ whiteSpace: "pre-wrap" }}>
                Стример загадывает случайное число {"\n"}Выбывает вариант с количеством голосов наиболее близким к
                загаданному
              </p>
            </InfoPanel>
          </div>
          <Box display={"flex"} justifyContent={"center"}>
            <TextField
              placeholder="Количество голосов"
              value={targetNumber?.toString() ?? ""}
              type="password"
              onChange={(event) => {
                const value = event.target.value;
                const chars = value
                  .split("")
                  .filter((char) => ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(char));
                const filteredValue = chars.join("");
                if (filteredValue === "") {
                  setTargetNumber(undefined);
                  return;
                }
                setTargetNumber(Number.parseInt(filteredValue, 10));
              }}
            />
            <Button variant="contained" color="primary" sx={{ marginLeft: 2 }} onClick={onStart}>
              Начать
            </Button>
          </Box>
        </>
      )}
      {state === "voting" && (
        <>
          <Button variant="contained" color="error" onClick={() => setState("finished")}>
            Закончить
          </Button>
          <PollResults
            items={items}
            votes={Object.values(votesMap)}
            onItemElimination={() => {}}
            hideResults
            time={time}
          />
          <VotesLog items={items} votes={voteMessages} isFinished={false} />
        </>
      )}
      {state === "finished" && !isUndefined(targetNumber) && (
        <>
          <div style={{ display: "grid", justifyContent: "center" }}>
            <InfoPanel>
              <h3>Загаданное число: {targetNumber}</h3>
            </InfoPanel>
          </div>
          <PollResults
            items={items}
            votes={Object.values(votesMap)}
            onItemElimination={onItemElimination}
            showInfo={false}
            winnerCheck={(votes: number) => 1000 - Math.abs(votes - targetNumber)}
          />
        </>
      )}
    </div>
  );
}
