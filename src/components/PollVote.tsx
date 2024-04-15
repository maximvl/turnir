import { Button, Grid, useTheme } from "@mui/material";
import { useNavigate } from "react-router";
import { PollResults, pollVote } from "../utils";

type Props = {
  poll: PollResults;
};

export default function PollVote({ poll }: Props) {
  const navigate = useNavigate();
  const theme = useTheme();

  const onClick = async (optionId: number) => {
    const response = await pollVote(poll.poll_id, optionId);
    console.log(response);
    if (response.result === "duplicate") {
      console.log("duplicate");
      navigate(`/poll/${poll.poll_id}/results`, {
        state: { duplicate: 1 },
      });
    } else {
      navigate(`/poll/${poll.poll_id}/results`);
    }
  };

  const options = poll.options;

  const highlightStyle = {
    "&:hover": {
      backgroundColor: theme.palette.error.light,
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
