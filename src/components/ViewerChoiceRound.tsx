import { Box, Button, Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { Item } from "../types";
import { createPoll, getPollResults } from "../utils";
import PollResults from "./PollResults";

type Props = {
  items: Item[];
  onItemElimination: (index: number) => void;
};

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
        items={items}
        onItemElimination={onItemElimination}
      />
    </div>
  );
}
