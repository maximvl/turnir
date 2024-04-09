import { QueryClient, QueryClientProvider } from "react-query";
import { Params, useLoaderData } from "react-router";
import PollResults from "../components/PollResults";
import { getPollResults, PollResults as PollResultsType } from "../utils";

const queryClient = new QueryClient();

export async function pollResultsLoader({
  params,
}: {
  params: Params<string>;
}): Promise<{ poll: PollResultsType }> {
  const poll = await getPollResults(params.pollId || "");
  return { poll };
}

export default function PollResultsPage() {
  const params = useLoaderData() as { poll: PollResultsType };
  const poll = params.poll;
  if (!poll) {
    return <div>Ошибка данных голосования</div>;
  }
  return (
    <QueryClientProvider client={queryClient}>
      <PollResults pollId={poll.poll_id} style={"big"} />
    </QueryClientProvider>
  );
}
