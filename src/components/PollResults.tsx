import { Box, Button, Grid } from "@mui/material";
import { useQuery } from "react-query";
import { getPollResults } from "../utils";
import { BorderLinearProgress } from "./BorderLinearProgress";

type Props = {
  pollId: string;
  onItemElimination?: (index: number) => void;
  refetchInterval?: number;
  style: "big" | "small";
};

export default function PollResults({
  pollId,
  onItemElimination,
  refetchInterval,
  style,
}: Props) {
  const fetchParams = refetchInterval ? { refetchInterval } : {};

  const {
    data: resultsResponse,
    status: resultsStatus,
    error: resultsError,
  } = useQuery(
    ["get_results", pollId],
    () => getPollResults(pollId),
    fetchParams,
  );

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

  const onItemClick = (index: number) => {
    if (onItemElimination) {
      onItemElimination(index);
    }
  };

  const votes = resultsResponse.votes;

  const items = resultsResponse.options;
  const itemsVotes = items.map((_item, index) => votes[String(index)] || 0);
  const maxVotes = Math.max(...itemsVotes);
  const maxVotesItemId = itemsVotes.indexOf(maxVotes);

  const totalVotes = Object.values(votes).reduce((acc, curr) => acc + curr, 0);

  const sideSize = style === "big" ? 2 : 1;
  const progressSize = style === "big" ? 1 : 2;

  return (
    <div>
      <Box textAlign="center">
        <h2>Результаты голосования ({totalVotes})</h2>
      </Box>
      <Grid container columns={4} rowGap={1}>
        {items.map((item, index) => {
          const highlight = index === maxVotesItemId;
          const currentVotes = votes[index] || 0;
          return (
            <Grid
              container
              columns={sideSize * 2 + progressSize}
              key={index}
              columnSpacing={4}
            >
              <Grid item xs={sideSize} textAlign="right">
                <Button
                  variant="outlined"
                  sx={highlight ? highlightStyle : {}}
                  onClick={() => onItemClick(index)}
                >
                  {item}
                </Button>
              </Grid>
              <Grid item xs={progressSize} alignContent="center">
                <BorderLinearProgress
                  variant="determinate"
                  value={(currentVotes / totalVotes) * 100}
                />
              </Grid>
              <Grid item xs={sideSize} alignContent="center" textAlign={"left"}>
                {currentVotes}
              </Grid>
            </Grid>
          );
        })}
      </Grid>
    </div>
  );
}
