import { QueryFunctionContext } from "react-query";
import { ItemStatus, Item } from "./types";

export function createItem(content: string = ""): Item {
  return { title: content, status: ItemStatus.Active };
}

export type CreatePollResponse = {
  poll_id: string;
};

const POLL_API_URL =
  "https://qfldcznx8c.execute-api.eu-north-1.amazonaws.com/default";

export async function createPoll(items: Item[]): Promise<CreatePollResponse> {
  return { poll_id: "zCES" };
  const options = items.map((item: Item) => item.title);
  const body = {
    options,
  };
  const res = await fetch(`${POLL_API_URL}/CreatePoll`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return res.json() as unknown as CreatePollResponse;
}

export type PollResults = {
  options: string[];
  votes: { [id: string]: number };
  poll_id: string;
};

export async function getPollResults(poll_id: string): Promise<PollResults> {
  const res = await fetch(`${POLL_API_URL}/FetchPoll?poll_id=${poll_id}`);
  return res.json() as unknown as PollResults;
}

export async function pollVote(
  poll_id: string,
  option_id: number,
): Promise<void> {
  await fetch(`${POLL_API_URL}/VotePoll?poll_id=${poll_id}`, {
    method: "POST",
    body: JSON.stringify({ option_id }),
  });
  return;
}
