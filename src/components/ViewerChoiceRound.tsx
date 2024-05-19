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

const VOTES_REFETCH_INTERVAL = 2000;

type ResetState = "started" | "finished";

export default function ViewerChoiceRound({ items, onItemElimination }: Props) {
  const [votesMap, setVotesMap] = useState<VotesDict>({});
  const [resetState, setResetState] = useState<ResetState>("started");
  const [voteMessages, setVoteMessages] = useState<PollVote[]>([]);
  const [lastTs, setLastTs] = useState<number>(() =>
    Math.floor(Date.now() / 1000),
  );

  const {
    data: votes,
    error,
    isLoading,
  } = useQuery(["votes", items.length, lastTs], fetchVotes, {
    refetchInterval: VOTES_REFETCH_INTERVAL,
  });

  // console.log("votes", votes);

  const resetPoll = async () => {
    setResetState("started");
    await resetVotes(items.map((item) => item.id));
    setVotesMap({});
    setVoteMessages([]);
    setLastTs(Math.floor(Date.now() / 1000));
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

  if (isEmpty(votesMap) && isLoading) {
    return <div>Загрузка...</div>;
  }

  if (!isEmpty(votes?.poll_votes) && votes?.poll_votes) {
    // todo remove duplicates votes for same user id
    // use only the latest one
    const votesSorted = votes.poll_votes.sort((a, b) => {
      return a.ts - b.ts;
    });
    const votesPerUser: { [key: number]: PollVote } = {};

    const itemIds = new Set(items.map((item) => item.id));
    for (const vote of votesSorted) {
      if (!itemIds.has(vote.message)) {
        continue;
      }
      votesPerUser[vote.user_id] = vote;
    }

    const newVotes = Object.values(votesPerUser).filter((vote) => {
      return vote.message !== votesMap[vote.user_id];
    });

    // console.log("update:", newVotes);
    if (!isEmpty(newVotes)) {
      const newVotesMap = newVotes.reduce((acc, vote) => {
        acc[vote.user_id] = vote.message;
        return acc;
      }, {} as VotesDict);
      const tsSorted = newVotes.map((vote) => vote.ts).sort();
      const lastVoteTs = tsSorted[tsSorted.length - 1];

      setVotesMap({ ...votesMap, ...newVotesMap });
      setVoteMessages([...voteMessages, ...newVotes]);
      setLastTs(lastVoteTs);
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
