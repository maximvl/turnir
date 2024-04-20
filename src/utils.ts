import { ItemStatus, Item } from "./types";

export function createItem(index: string): Item {
  return { title: "", status: ItemStatus.Active, id: index };
}

export type PollVotes = {
  poll_votes: null | { [key: string]: number };
};

export async function fetchVotes(): Promise<PollVotes> {
  return fetch("/turnir-api/votes").then((res) => res.json());
}

export async function resetVotes(): Promise<number> {
  return fetch("/turnir-api/votes/reset").then((res) => res.status);
}
