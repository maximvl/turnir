import { Button } from "@mui/material";
import useChatVoting from "components/hooks/useChatVoting";
import { MusicContext } from "contexts/MusicContext";
import { isEmpty } from "lodash";
import { useContext, useEffect, useState } from "react";
import { Item, MusicType } from "types";
import { PollVote } from "utils";
import PollResults from "../ViewerChoice/PollResults";
import VotesLog from "../ViewerChoice/VotesLog";

type Props = {
  items: Item[];
  onItemElimination: (itemId: string) => void;
};

type State = "voting" | "show_results";

const voteFormatter = (vote: PollVote, formattedTime: string, optionName: string) => {
  return `${formattedTime}: ${vote.username} голосует за ${vote.message} (${optionName})`;
};

export default function ResurrectionVoting({ items, onItemElimination }: Props) {
  const { setState: setVotingState, votesMap, voteMessages, error, isLoading } = useChatVoting({ items });

  const { setMusicPlaying } = useContext(MusicContext);
  const [state, setState] = useState<State>("voting");

  useEffect(() => {
    setTime(0);
    setVotingState("voting");
    setState("voting");
    setMusicPlaying(MusicType.RickRoll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  const [time, setTime] = useState(() => 0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(time + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [time]);

  if (error) {
    return <div>Ошибка: {error.toString()}</div>;
  }

  if (isEmpty(votesMap) && isLoading) {
    return <div>Загрузка...</div>;
  }

  const onVotingStop = () => {
    setVotingState("finished");
    setState("show_results");
    setMusicPlaying(undefined);
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
          <VotesLog items={items} votes={voteMessages} isFinished={false} logFormatter={voteFormatter} />
        </>
      )}
      {state === "show_results" && (
        <PollResults
          items={items}
          votes={Object.values(votesMap)}
          onItemElimination={onItemElimination}
          showInfo={false}
        />
      )}
    </div>
  );
}
