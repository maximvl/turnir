import { random } from "lodash";
import { ItemStatus, Item } from "./types";

export function createItem(index: string): Item {
  return { title: "", status: ItemStatus.Active, id: index };
}

export type PollVote = {
  id: number;
  ts: number;
  username: string;
  user_id: number;
  message: string;
};

export type PollVotes = {
  poll_votes: null | PollVote[];
};

export type FetchVotesParams = {
  queryKey: (string | number)[];
};

export async function fetchVotes({
  queryKey,
}: FetchVotesParams): Promise<PollVotes> {
  const [, , ts] = queryKey;
  // const messages = [
  //   {
  //     id: 93152579,
  //     message: random(1, 5).toString(),
  //     ts: 1714571372,
  //     user_id: random(10000, 99999),
  //     username: random(10000, 99999).toString(),
  //   },
  // ];
  // return { poll_votes: messages };
  return fetch(`/turnir-api/votes?ts=${ts}`).then((res) => res.json());
}

export async function resetVotes(options: string[]): Promise<number> {
  return fetch("/turnir-api/votes/reset", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ vote_options: options }),
  }).then((res) => res.status);
}
