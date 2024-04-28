import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { Item } from "../types";
import PollResults from "./PollResults";
import { useQuery } from "react-query";
import { fetchVotes, resetVotes } from "../utils";
import { isFinite } from "lodash";

type Props = {
  items: Item[];
  onItemElimination: (index: string) => void;
};

type VotesDict = {
  [key: string]: string;
};

const VOTES_REFETCH_INTERVAL = 3000;

type ResetState = "started" | "finished";

export default function ViewerChoiceRound({ items, onItemElimination }: Props) {
  const [votesMap, setVotesMap] = useState<VotesDict>({});
  const [voterIds, setVoterIds] = useState(new Set<number>());
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
    // await resetVotes(items.map((item) => item.id));
    setVotesMap({});
    setVoterIds(new Set<number>());
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

  if (votes?.poll_votes) {
    for (const vote of votes.poll_votes) {
      if (voterIds.has(vote.user_id)) {
        continue;
      }
      const voteOption = vote.message;
      if (items.every((item) => item.id !== voteOption)) {
        continue;
      }
      voterIds.add(vote.user_id);
      setVoterIds(new Set(voterIds));

      votesMap[vote.username] = voteOption;
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
