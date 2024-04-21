import { Avatar, Box, Chip, Grid, useTheme } from "@mui/material";
import { Item } from "../types";
import { BorderLinearProgress } from "./BorderLinearProgress";

type Props = {
  items: Item[];
  onItemElimination?: (index: string) => void;
  votes: { [key: string]: number };
};

export default function PollResults({
  items,
  votes,
  onItemElimination,
}: Props) {
  const theme = useTheme();

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

  const noVotes = Object.values(votes).every((v) => v === 0);
  const maxVotes = Object.values(votes).reduce(
    (acc, curr) => Math.max(acc, curr),
    0,
  );

  const itemIdsWithMaxVotes = Object.keys(votes).filter(
    (key) => votes[key] === maxVotes,
  );

  const totalVotes = Object.values(votes).reduce((acc, curr) => acc + curr, 0);

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
        <h2>Результаты голосования ({totalVotes})</h2>
        <p>Голосуйте номером варианта в чате</p>
      </Box>
      <Grid container columns={4} rowGap={1}>
        {items.map((item, index) => {
          const highlight = !noVotes && itemIdsWithMaxVotes.includes(item.id);
          const currentVotes = votes[item.id] || 0;
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
