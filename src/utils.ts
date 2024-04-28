import { ItemStatus, Item } from "./types";

export function createItem(index: string): Item {
  return { title: "", status: ItemStatus.Active, id: index };
}

export type PollVote = {
  username: string;
  user_id: number;
  message: string;
};

export type PollVotes = {
  poll_votes: null | PollVote[];
};

export async function fetchVotes(): Promise<PollVotes> {
  return fetch("/turnir-api/votes").then((res) => res.json());
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
