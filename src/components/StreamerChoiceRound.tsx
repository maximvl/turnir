import { Button, Grid } from "@mui/material";
import { Item } from "../types";

type Props = {
  items: Item[];
  onItemElimination: (index: number) => void;
};

export default function StreamerChoiceRound({
  items,
  onItemElimination,
}: Props) {
  const highlightStyle = {
    "&:hover": {
      backgroundColor: "red",
      textDecoration: "line-through",
    },
  };
  return (
    <Grid container columns={1} rowGap={1}>
      {items.map((item, index) => {
        return (
          <Grid item xs={1} key={index}>
            <Button
              variant="outlined"
              sx={highlightStyle}
              onClick={() => onItemElimination(index)}
            >
              {item.title}
            </Button>
          </Grid>
        );
      })}
    </Grid>
  );
}
