import { Avatar, Box, Chip, Grid, useTheme } from "@mui/material";
import { teal } from "@mui/material/colors";
import { isNull } from "lodash";
import { useContext, useEffect, useReducer, useState } from "react";
import { MusicContext } from "contexts/MusicContext";
import { Item, MusicType } from "types";
import ItemTitle from "components/ItemTitle";

type Props = {
  items: Item[];
  onItemElimination: (index: string) => void;
};

const selectionReducer = (state: string | null, value: string | null): string | null => {
  if (!isNull(state) && !isNull(value)) {
    return state;
  }
  return value;
};

export default function StreamerChoiceRound({ items, onItemElimination }: Props) {
  const theme = useTheme();
  const { setMusicPlaying } = useContext(MusicContext);

  const [selectedItemId, selectionDispatch] = useReducer(selectionReducer, null);

  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    if (selectedItemId) {
      const failureEvent = Math.random() > 0.7;
      if (failureEvent) {
        setBlinking(true);
        setMusicPlaying(MusicType.WrongAnswer);
        setTimeout(() => {
          selectionDispatch(null);
          setBlinking(false);
          onItemElimination(selectedItemId);
        }, 2500);
      } else {
        selectionDispatch(null);
        onItemElimination(selectedItemId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItemId]);

  const highlightStyle = {
    "&:hover": {
      backgroundColor: theme.palette.error.light,
      //textDecoration: "line-through",
    },
  };

  const selectedHighlight = {
    backgroundColor: theme.palette.error.light,
    "&:hover": {
      backgroundColor: theme.palette.error.light,
    },
  };

  const onSelectItem = (id: string) => {
    selectionDispatch(id);
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
        className={blinking && isSelected ? "blinking" : ""}
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
