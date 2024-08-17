import { Avatar, Chip, Grid, useTheme } from "@mui/material";
import { teal } from "@mui/material/colors";
import ItemTitle from "components/ItemTitle";
import { isNull } from "lodash";
import { useReducer } from "react";
import { Item } from "types";

type Props = {
  items: Item[];
  onSelect: (id: string) => void;
};

const selectionReducer = (state: string | null, value: string | null): string | null => {
  if (!isNull(state) && !isNull(value)) {
    return state;
  }
  return value;
};

export default function ListChoice({ items, onSelect }: Props) {
  const theme = useTheme();
  const [selectedItemId, selectionDispatch] = useReducer(selectionReducer, null);

  const highlightStyle = {
    "&:hover": {
      backgroundColor: theme.palette.error.light,
    },
  };

  const selectedHighlight = {
    backgroundColor: theme.palette.error.light,
    "&:hover": {
      backgroundColor: theme.palette.error.light,
    },
  };

  const onSelectItem = (id: string) => {
    // selectionDispatch(id);
    onSelect(id);
  };

  const itemElement = (item: Item) => {
    const isSelected = selectedItemId === item.id;
    let style = {};
    if (isSelected) {
      style = selectedHighlight;
    } else if (isNull(selectedItemId)) {
      style = highlightStyle;
    }

    return (
      <Chip
        avatar={<Avatar sx={{ backgroundColor: teal[700] }}>{item.id}</Avatar>}
        label={<ItemTitle item={item} />}
        sx={style}
        onClick={() => onSelectItem(item.id)}
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
