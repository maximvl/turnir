import { Box } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { Item, MusicType } from "types";
import PollResults from "./PollResults";
import { PollVote } from "utils";
import VotesLog from "./VotesLog";
import { isEmpty } from "lodash";
import useChatVoting from "components/hooks/useChatVoting";
import { MusicContext } from "contexts/MusicContext";

type Props = {
  items: Item[];
  onItemElimination: (index: string) => void;
  logFormatter?: (vote: PollVote, formattedTime: string, optionTitle: string) => string;
};

export default function ViewerChoiceRound({ items, onItemElimination, logFormatter }: Props) {
  const { votesMap, voteMessages, state, setState, error, isLoading } = useChatVoting({ items });

  const { setMusicPlaying } = useContext(MusicContext);

  useEffect(() => {
    setMusicPlaying(MusicType.RickRoll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  useEffect(() => {
    if (state === "initial") {
      setState("voting");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

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

  return (
    <Box display="inline-block" alignItems="center" style={{ paddingLeft: 16, width: "100%" }}>
      <PollResults items={items} votes={Object.values(votesMap)} onItemElimination={onItemElimination} time={time} />
      <Box marginTop={2}>
        <VotesLog votes={voteMessages} items={items} logFormatter={logFormatter} isFinished={state === "finished"} />
      </Box>
    </Box>
  );
}
