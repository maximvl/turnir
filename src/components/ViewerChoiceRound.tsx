import { Box } from "@mui/material";
import { useQuery } from "react-query";
import { Item } from "../types";
import { createPoll } from "../utils";
import PollResults from "./PollResults";

type Props = {
  items: Item[];
  onItemElimination: (index: number) => void;
};

const POLL_FETCH_INTERVAL = 3000;

export default function ViewerChoiceRound({ items, onItemElimination }: Props) {
  const {
    data: createResponse,
    status: createStatus,
    error: createError,
  } = useQuery(["create_poll", items.length], () => createPoll(items), {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  if (createStatus === "error") {
    return <div>Ошибка создания голосования: {createError as string}</div>;
  }

  if (createStatus === "loading") {
    return <div>Создание голосования...</div>;
  }

  if (!createResponse) {
    return <div>Ошибка: данные не получены</div>;
  }

  const pollId = createResponse.poll_id;
  let currentUrl = window.location.href;
  if (!currentUrl.endsWith("/")) {
    currentUrl += "/";
  }
  const pollUrl = `${currentUrl}poll/${pollId}`;

  return (
    <div>
      <Box
        display="inline-block"
        alignItems="center"
        style={{ marginBottom: 20 }}
      >
        {pollUrl && (
          <a href={pollUrl} target="_blank" rel="noreferrer">
            {pollUrl}
          </a>
        )}
      </Box>
      <PollResults
        pollId={pollId}
        onItemElimination={onItemElimination}
        refetchInterval={POLL_FETCH_INTERVAL}
        style={"small"}
      />
    </div>
  );
}
