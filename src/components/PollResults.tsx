import { Button, Grid } from "@mui/material";
import { useQuery } from "react-query";
import { Item } from "../types";
import { getPollResults } from "../utils";
import { BorderLinearProgress } from "./BorderLinearProgress";

type Props = {
  pollId: string;
  items: Item[];
  onItemElimination: (index: number) => void;
};

const POLL_FETCH_INTERVAL = 3000;

export default function PollResults({
  pollId,
  items,
  onItemElimination,
}: Props) {
  const {
    data: resultsResponse,
    status: resultsStatus,
    error: resultsError,
  } = useQuery(["get_results", pollId], () => getPollResults(pollId), {
    refetchInterval: POLL_FETCH_INTERVAL,
  });

  if (resultsStatus === "loading") {
    return <div>Загрузка результатов...</div>;
  }

  if (resultsStatus === "error") {
    return <div>Ошибка загрузки результатов: {resultsError as string}</div>;
  }

  if (!resultsResponse) {
    return <div>Ошибка получания данных</div>;
  }

  const highlightStyle = {
    backgroundColor: "red",
    "&:hover": {
      backgroundColor: "red",
      textDecoration: "line-through",
    },
  };

  const votes = resultsResponse.votes;

  const itemsVotes = items.map((_item, index) => votes[String(index)] || 0);
  const maxVotes = Math.max(...itemsVotes);
  const maxVotesItemId = itemsVotes.indexOf(maxVotes);

  const totalVotes = Object.values(votes).reduce((acc, curr) => acc + curr, 0);

  return (
    <div>
      <h2>Результаты голосования ({totalVotes})</h2>
      <Grid container columns={2} rowGap={1}>
        {items.map((item, index) => {
          const highlight = index === maxVotesItemId;
          const currentVotes = votes[index] || 0;
          return (
            <Grid
              container
              columns={5}
              key={index}
              columnGap={0.5}
              justifyContent="space-around"
            >
              <Grid item xs={2}>
                <Button
                  variant="outlined"
                  sx={highlight ? highlightStyle : {}}
                  onClick={() => onItemElimination(index)}
                >
                  {item.title}
                </Button>
              </Grid>
              <Grid item xs={1} alignContent="center">
                <BorderLinearProgress
                  variant="determinate"
                  value={(currentVotes / totalVotes) * 100}
                />
              </Grid>
              <Grid item xs={1} alignContent="center" textAlign={"left"}>
                {currentVotes}
              </Grid>
            </Grid>
          );
        })}
      </Grid>
    </div>
  );
}
