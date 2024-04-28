import { Avatar, Box, Chip, Grid, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { Item } from "../types";
import { BorderLinearProgress } from "./BorderLinearProgress";

type Props = {
  items: Item[];
  onItemElimination?: (index: string) => void;
  votes: { [key: string]: string };
};

export default function PollResults({
  items,
  votes,
  onItemElimination,
}: Props) {
  const theme = useTheme();

  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(time + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [time]);

  const seconds = time % 60;
  const minutes = Math.floor(time / 60);
  const secondsString = seconds < 10 ? `0${seconds}` : `${seconds}`;
  const minutesString = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const timePassed = `${minutesString}:${secondsString}`;

  const highlightStyle = {
    "&:hover": {
      textDecoration: "line-through",
    },
  };

  const onItemClick = (index: string) => {
    if (onItemElimination) {
      onItemElimination(index);
    }
  };

  const votesByOption = items.reduce(
    (acc, curr) => {
      acc[curr.id] = 0;
      return acc;
    },
    {} as { [key: string]: number },
  );

  for (const vote in votes) {
    const option = votes[vote];
    votesByOption[option] += 1;
  }

  const maxVotes = Object.values(votesByOption).reduce(
    (acc, curr) => Math.max(acc, curr),
    0,
  );

  const itemIdsWithMaxVotes = Object.keys(votesByOption).filter(
    (key) => votesByOption[key] === maxVotes,
  );

  const totalVotes = Object.values(votes).length;

  const itemElement = (item: Item, selected: boolean) => {
    const color = selected ? "error" : "info";
    const onClick = selected ? onItemClick : () => {};
    const style = selected ? highlightStyle : {};
    return (
      <Chip
        avatar={<Avatar>{item.id}</Avatar>}
        label={item.title}
        color={color}
        sx={style}
        onClick={() => onClick(item.id)}
      />
    );
  };

  return (
    <div>
      <Box textAlign="center">
        <h2>
          Результаты голосования ({totalVotes}) {timePassed}
        </h2>
        <p>Голосуйте номером варианта в чате</p>
      </Box>
      <Grid container columns={4} rowGap={1}>
        {items.map((item, index) => {
          const highlight =
            totalVotes > 0 && itemIdsWithMaxVotes.includes(item.id);
          const currentVotes = votesByOption[item.id] || 0;
          return (
            <Grid
              container
              columns={12}
              key={index}
              columnSpacing={4}
              alignItems="center"
            >
              <Grid item xs={5} textAlign="right">
                {itemElement(item, highlight)}
              </Grid>
              <Grid item xs={4}>
                <BorderLinearProgress
                  sx={{
                    backgroundColor: highlight
                      ? theme.palette.error.light
                      : null,
                  }}
                  variant="determinate"
                  value={(currentVotes / totalVotes) * 100}
                />
              </Grid>
              <Grid item xs={1} textAlign={"left"}>
                {currentVotes}
              </Grid>
            </Grid>
          );
        })}
      </Grid>
    </div>
  );
}
