import { isEmpty } from "lodash";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { Item } from "types";
import { fetchVotes, PollVote } from "utils";

type Props = {
  items: Item[];
};

type VotesDict = {
  [key: string]: string;
};

type VotingState = "initial" | "voting" | "finished";

const VOTES_REFETCH_INTERVAL = 2000;

export default function useChatVoting({ items }: Props) {
  const [votesMap, setVotesMap] = useState<VotesDict>({});
  const [voteMessages, setVoteMessages] = useState<PollVote[]>([]);

  const [state, setState] = useState<VotingState>("initial");
  const [lastTs, setLastTs] = useState<number>(() => Math.floor(Date.now() / 1000));

  const resetPoll = async () => {
    setState("initial");
    setVotesMap({});
    setVoteMessages([]);
    setLastTs(Math.floor(Date.now() / 1000));
    // setTime(timer || 0);
  };

  useEffect(() => {
    resetPoll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  const {
    data: votes,
    error,
    isLoading,
  } = useQuery(["votes", items.length, lastTs], (args) => fetchVotes(args), {
    refetchInterval: VOTES_REFETCH_INTERVAL,
    enabled: state === "voting",
  });

  if (!error && !isLoading && !isEmpty(votes?.poll_votes)) {
    // todo remove duplicates votes for same user id
    // use only the latest one
    const votesSorted =
      votes?.poll_votes?.sort((a, b) => {
        return a.ts - b.ts;
      }) || [];

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

  return {
    votesMap,
    voteMessages,
    state,
    setState,
    error,
    isLoading,
  };
}
