import { Shield } from "@mui/icons-material";
import { Avatar, Box, Chip, Grid, Paper, useTheme } from "@mui/material";
import { teal } from "@mui/material/colors";
import { useEffect, useState } from "react";
import { Item, ItemStatus } from "../types";
import { BorderLinearProgress } from "./BorderLinearProgress";

type Props = {
  items: Item[];
  onItemElimination?: (index: string) => void;
  votes: string[];
};

export default function PollResults({ items, votes, onItemElimination }: Props) {
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

  for (const option of votes) {
    votesByOption[option] += 1;
  }

  const maxVotes = Object.values(votesByOption).reduce((acc, curr) => Math.max(acc, curr), 0);

  const itemIdsWithMaxVotes = Object.keys(votesByOption).filter((key) => votesByOption[key] === maxVotes);

  const totalVotes = votes.length;

  const itemElement = (item: Item, selected: boolean) => {
    const color = selected ? "error" : "default";
    const onClick = selected ? onItemClick : () => {};
    const isProtected = item.status === ItemStatus.Protected;
    return (
      <Chip
        avatar={<Avatar sx={{ backgroundColor: teal[700] }}>{item.id}</Avatar>}
        label={
          <Box display="flex" alignItems={"center"}>
            {item.title}
            {isProtected && <Shield sx={{ marginLeft: 1 }} />}
          </Box>
        }
        color={color}
        onClick={() => onClick(item.id)}
      />
    );
  };

  return (
    <div>
      <Box textAlign="center" display="grid" justifyContent={"center"}>
        <h2 style={{ margin: 0 }}>
          Результаты голосования ({totalVotes}) {timePassed}
        </h2>
        <Paper
          elevation={12}
          sx={{
            ...theme.typography.body2,
            color: theme.palette.text.secondary,
            paddingTop: 0.5,
            paddingBottom: 0.5,
            paddingLeft: 2,
            paddingRight: 2,
            margin: 1,
            width: "max-content",
            border: 1,
            borderColor: theme.palette.info.main,
          }}
        >
          <p style={{ whiteSpace: "pre-wrap" }}>
            Голосуйте номером варианта в чате: '5' а не '555' или '5 5 5' и тд
            {"\n"}
            <u>МОЖНО МЕНЯТЬ ГОЛОС</u>, засчитывается самый последний
          </p>
        </Paper>
      </Box>
      <Grid container columns={4} rowGap={1}>
        {items.map((item, index) => {
          const highlight = totalVotes > 0 && itemIdsWithMaxVotes.includes(item.id);
          const currentVotes = votesByOption[item.id] || 0;
          return (
            <Grid container columns={12} key={index} columnSpacing={4} alignItems="center">
              <Grid item xs={5} textAlign="right">
                {itemElement(item, highlight)}
              </Grid>
              <Grid item xs={4}>
                <BorderLinearProgress
                  sx={{
                    backgroundColor: highlight ? theme.palette.error.light : null,
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
