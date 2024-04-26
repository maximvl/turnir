import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { Item } from "../types";
import PollResults from "./PollResults";
import { useQuery } from "react-query";
import { fetchVotes, resetVotes } from "../utils";

type Props = {
  items: Item[];
  onItemElimination: (index: string) => void;
};

type VotesDict = {
  [key: string]: number;
};

const VOTES_REFETCH_INTERVAL = 3000;

function initVotesMap(items: Item[]): VotesDict {
  return items.reduce((acc: VotesDict, item) => {
    acc[item.id] = 0;
    return acc;
  }, {});
}

type ResetState = "started" | "finished";

export default function ViewerChoiceRound({ items, onItemElimination }: Props) {
  const [votesMap, setVotesMap] = useState(initVotesMap(items));
  const [resetState, setResetState] = useState<ResetState>("started");

  const {
    data: votes,
    error,
    isLoading,
  } = useQuery(["votes", items.length], fetchVotes, {
    refetchInterval: VOTES_REFETCH_INTERVAL,
  });

  const resetPoll = async () => {
    setResetState("started");
    await resetVotes(items.map((item) => item.id));
    setVotesMap(initVotesMap(items));
    setResetState("finished");
  };

  useEffect(() => {
    resetPoll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  useEffect(() => {
    resetPoll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return <div>Ошибка: {error.toString()}</div>;
  }

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (
    votes?.poll_votes &&
    Object.keys(votes.poll_votes).length === Object.keys(votesMap).length
  ) {
    let changed = false;
    for (const optionId in votes.poll_votes) {
      const votesAmount = votes.poll_votes[optionId];
      if (optionId in votesMap && votesMap[optionId] !== votesAmount) {
        votesMap[optionId] = votesAmount;
        changed = true;
      }
    }
    if (changed) {
      setVotesMap({ ...votesMap });
    }
  }

  if (resetState === "started") {
    return <div>Сброс голосов...</div>;
  }

  return (
    <div>
      <Box
        display="inline-block"
        alignItems="center"
        style={{ paddingLeft: 16 }}
      >
        <PollResults
          items={items}
          votes={votesMap}
          onItemElimination={onItemElimination}
        />
      </Box>
    </div>
  );
}
