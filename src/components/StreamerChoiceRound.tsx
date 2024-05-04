import { Shield } from "@mui/icons-material";
import { Avatar, Box, Button, Chip, Grid, useTheme } from "@mui/material";
import { Item, ItemStatus } from "../types";

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

  const itemElement = (item: Item) => {
    const isProtected = item.status === ItemStatus.Protected;
    return (
      <Chip
        avatar={<Avatar>{item.id}</Avatar>}
        label={
          <Box display="flex" alignItems={"center"}>
            {item.title}
            {isProtected && <Shield />}
          </Box>
        }
        sx={highlightStyle}
        onClick={() => onItemElimination(item.id)}
      />
    );
  };

  return (
    <Grid container columns={1} rowGap={1}>
      {items.map((item, index) => {
        return (
          <Grid item xs={1} key={index}>
            {itemElement(item)}
          </Grid>
        );
      })}
    </Grid>
  );
}
