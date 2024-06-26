import { Box, Button, Input, Slider, TextField } from "@mui/material";
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

type State = "voting" | "streamer_choice" | "show_results";

export default function ClosestVotesRound({ items, onItemElimination }: Props) {
  const {
    state: votingState,
    setState: setVotingState,
    votesMap,
    voteMessages,
    error,
    isLoading,
  } = useChatVoting({ items });
  const { setMusicPlaying } = useContext(MusicContext);

  const [state, setState] = useState<State>("voting");

  const [time, setTime] = useState(() => 0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(time + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [time]);

  const [targetNumber, setTargetNumber] = useState<number>(0);

  useEffect(() => {
    setTargetNumber(0);
    setTime(0);
    setVotingState("voting");
    setState("voting");
    setMusicPlaying(MusicType.RickRoll);
  }, [items.length]);
  // console.log("target:", targetNumber)

  if (error) {
    return <div>Ошибка: {error.toString()}</div>;
  }

  if (isEmpty(votesMap) && isLoading) {
    return <div>Загрузка...</div>;
  }

  const votesByOption: { [key: string]: number } = {};
  for (const vote of Object.values(votesMap)) {
    if (vote in votesByOption) {
      votesByOption[vote] += 1;
    } else {
      votesByOption[vote] = 1;
    }
  }

  const maxVotes = Math.max(...Object.values(votesByOption));
  const minVotes = Math.min(...Object.values(votesByOption));

  const onVotingStop = () => {
    setVotingState("finished");
    setState("streamer_choice");
  };

  const onShowResults = () => {
    setState("show_results");
  };

  return (
    <div>
      {state === "voting" && (
        <>
          <Button variant="contained" color="error" onClick={onVotingStop}>
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
      {state === "streamer_choice" && (
        <>
          <div style={{ display: "grid", justifyContent: "center" }}>
            <InfoPanel>
              <h3>Будет удален вариант с наиболее близким числом голосов</h3>
            </InfoPanel>
          </div>
          <Box display="flex" justifyContent="center" sx={{ margin: 2, marginTop: 4 }}>
            <Slider
              sx={{ width: "60%" }}
              aria-label="Количество голосов"
              valueLabelDisplay="on"
              value={targetNumber}
              min={minVotes}
              max={maxVotes}
              step={1}
              onChange={(_event, value) => setTargetNumber(value as number)}
            />
          </Box>

          <Button variant="contained" color="success" sx={{ margin: 2 }} onClick={onShowResults}>
            Показать голоса
          </Button>
        </>
      )}
      {state === "show_results" && (
        <>
          <div style={{ display: "grid", justifyContent: "center" }}>
            <InfoPanel>
              <h3>Будет удален вариант с наиболее близким числом голосов</h3>
            </InfoPanel>
          </div>
          <Box display="flex" justifyContent="center" sx={{ margin: 2, marginTop: 5 }}>
            <Slider
              disabled
              sx={{ width: "60%" }}
              aria-label="Количество голосов"
              valueLabelDisplay="on"
              value={targetNumber}
              min={minVotes}
              max={maxVotes}
              step={1}
              // onChange={(_event, value) => setTargetNumber(value as number)}
            />
          </Box>
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
