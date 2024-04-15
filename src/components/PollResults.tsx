import { Box, Button, Grid, useTheme } from "@mui/material";
import { useQuery } from "react-query";
import { useLocation } from "react-router";
import { getPollResults } from "../utils";
import { BorderLinearProgress } from "./BorderLinearProgress";

type Props = {
  pollId: string;
  onItemElimination?: (index: number) => void;
  refetchInterval?: number;
  big?: boolean;
};

export default function PollResults({
  pollId,
  onItemElimination,
  refetchInterval,
  big,
}: Props) {
  const theme = useTheme();
  const location = useLocation();

  const isDuplicateVote = Boolean(
    location.state && location.state["duplicate"],
  );

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
    backgroundColor: theme.palette.error.light,
    "&:hover": {
      backgroundColor: theme.palette.error.light,
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

  const sideSize = big ? 2 : 1;
  const progressSize = big ? 1 : 2;

  const itemElement = (index: number, title: string, selected: boolean) => {
    if (onItemElimination) {
      const style = selected ? highlightStyle : {};
      return (
        <Button
          variant="outlined"
          sx={style}
          onClick={() => onItemClick(index)}
        >
          {title}
        </Button>
      );
    }
    const style = selected
      ? { color: theme.palette.error.light, margin: 0 }
      : { margin: 0 };
    return <h2 style={style}>{title}</h2>;
  };

  return (
    <div>
      <Box textAlign="center">
        <h2>Результаты голосования ({totalVotes})</h2>
      </Box>
      {isDuplicateVote && (
        <Box textAlign="center">
          <h3 style={{ color: theme.palette.error.light }}>
            Вы уже голосовали
          </h3>
        </Box>
      )}
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
              alignItems="center"
            >
              <Grid item xs={sideSize} textAlign="right">
                {itemElement(index, item, highlight)}
              </Grid>
              <Grid item xs={progressSize}>
                <BorderLinearProgress
                  variant="determinate"
                  value={(currentVotes / totalVotes) * 100}
                />
              </Grid>
              <Grid item xs={sideSize} textAlign={"left"}>
                {currentVotes}
              </Grid>
            </Grid>
          );
        })}
      </Grid>
    </div>
  );
}
