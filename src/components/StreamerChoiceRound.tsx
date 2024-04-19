import { Button, Grid, useTheme } from "@mui/material";
import { Item } from "../types";

type Props = {
  items: Item[];
  onItemElimination: (index: string) => void;
};

export default function StreamerChoiceRound({
  items,
  onItemElimination,
}: Props) {
  const theme = useTheme();

  const highlightStyle = {
    "&:hover": {
      backgroundColor: theme.palette.error.light,
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
              onClick={() => onItemElimination(item.id)}
            >
              {item.title}
            </Button>
          </Grid>
        );
      })}
    </Grid>
  );
}
