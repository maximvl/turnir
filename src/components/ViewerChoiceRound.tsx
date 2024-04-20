import { Box } from "@mui/material";
import { useState } from "react";
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

function initVotesMap(items: Item[]): VotesDict {
  return items.reduce((acc: VotesDict, item) => {
    acc[item.id] = 0;
    return acc;
  }, {});
}

export default function ViewerChoiceRound({ items, onItemElimination }: Props) {
  const [votesMap, setVotesMap] = useState(initVotesMap(items));

  const {
    data: votes,
    error,
    isLoading,
  } = useQuery(["votes", items.length], fetchVotes);

  useQuery(["reset", items.length], resetVotes);

  if (error) {
    return <div>Ошибка: {error as string}</div>;
  }

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  if (votes?.poll_votes) {
    for (const optionId in Object.keys(votes.poll_votes)) {
      const votesAmount = votes.poll_votes[optionId];
      if (optionId in votesMap) {
        votesMap[optionId] = votesAmount;
      }
    }
    setVotesMap({ ...votesMap });
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
