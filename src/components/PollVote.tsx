import { Box, Button, Grid } from "@mui/material";
import { useQuery } from "react-query";
import { getPollResults, PollResults, pollVote } from "../utils";

type Props = {
  poll: PollResults;
};

export default function PollVote({ poll }: Props) {
  // const { data, status, error } = useQuery(
  //   ["poll", poll.poll_id],
  //   () => getPollResults(poll.poll_id),
  //   {
  //     refetchOnWindowFocus: false,
  //     refetchOnReconnect: false,
  //     refetchOnMount: false,
  //   },
  // );

  // if (status === "loading") {
  //   return <div>Загрузка...</div>;
  // }

  // if (status === "error") {
  //   return <div>Ошибка: {error as string}</div>;
  // }

  // if (!data) {
  //   return <div>Данные не найдены</div>;
  // }

  const onClick = async (optionId: number) => {
    await pollVote(poll.poll_id, optionId);
  };

  const options = poll.options;
  const votes = poll.votes;

  const highlightStyle = {
    "&:hover": {
      backgroundColor: "red",
      textDecoration: "line-through",
    },
  };

  return (
    <div>
      <Grid container columns={1} rowGap={2}>
        {options.map((option, index) => {
          return (
            <Grid item xs={1} key={index} textAlign="center">
              <Button
                variant="contained"
                color="primary"
                onClick={() => onClick(index)}
                sx={highlightStyle}
              >
                {option}
              </Button>
            </Grid>
          );
        })}
      </Grid>
    </div>
  );
}
