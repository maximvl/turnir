import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { Item } from "../types";
import PollResults from "./PollResults";
import { useQuery } from "react-query";
import { fetchVotes, PollVote, resetVotes } from "../utils";
import VotesLog from "./VotesLog";
import { isEmpty } from "lodash";

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
  const [resetState, setResetState] = useState<ResetState>("started");
  const [voteMessages, setVoteMessages] = useState<PollVote[]>([]);
  const [startTs, setStartTs] = useState<number>(() =>
    Math.floor(Date.now() / 1000),
  );

  const {
    data: votes,
    error,
    isLoading,
  } = useQuery(["votes", items.length, startTs], fetchVotes, {
    refetchInterval: VOTES_REFETCH_INTERVAL,
  });

  const resetPoll = async () => {
    setResetState("started");
    await resetVotes(items.map((item) => item.id));
    setVotesMap({});
    setVoteMessages([]);
    setStartTs(Math.floor(Date.now() / 1000));
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

  if (!isEmpty(votes?.poll_votes) && votes?.poll_votes) {
    for (const vote of votes.poll_votes) {
      const voteOption = vote.message;
      if (items.every((item) => item.id !== voteOption)) {
        continue;
      }

      if (votesMap[vote.user_id] === voteOption) {
        continue;
      }

      votesMap[vote.user_id] = voteOption;
      setVotesMap({ ...votesMap });
      voteMessages.push(vote);
      setVoteMessages([...voteMessages]);
    }
  }

  // console.log("messages", voteMessages);

  if (resetState === "started") {
    return <div>Сброс голосов...</div>;
  }

  return (
    <div>
      <Box
        display="inline-block"
        alignItems="center"
        style={{ paddingLeft: 16, width: "100%" }}
      >
        <PollResults
          items={items}
          votes={Object.values(votesMap)}
          onItemElimination={onItemElimination}
        />
        <div style={{ marginTop: 20 }}>
          <VotesLog votes={voteMessages} items={items} />
        </div>
      </Box>
    </div>
  );
}
