import { QueryClient, QueryClientProvider } from "react-query";
import { Params, useLoaderData } from "react-router-dom";
import { getPollResults, PollResults } from "../utils";
import PollVote from "./PollVote";

const queryClient = new QueryClient();

export async function pollLoader({
  params,
}: {
  params: Params<string>;
}): Promise<{ poll: PollResults }> {
  const poll = await getPollResults(params.pollId || "");
  return { poll };
}

export default function PollApp() {
  const params = useLoaderData() as { poll: PollResults };
  const poll = params.poll;
  if (!poll) {
    return <div>Ошибка данных голосования</div>;
  }
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <h1>Голосование за вылет</h1>
      </div>
      <PollVote poll={poll} />
    </QueryClientProvider>
  );
}
