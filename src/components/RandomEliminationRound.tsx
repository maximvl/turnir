import { Box, Button, Grid, useTheme } from "@mui/material";
import { sample } from "lodash";
import { useEffect, useReducer, useState } from "react";
import { Item } from "../types";
import { BorderLinearProgress } from "./BorderLinearProgress";

type Props = {
  items: Item[];
  onItemElimination: (index: string) => void;
};

enum SelectionTaskState {
  StartNext = "StartNext",
  Idle = "Idle",
}

const SELECTION_TIMEOUT_MIN = 800;
const SELECTION_TIMEOUT_MAX = 1500;

const PROGRESS_BAR_TIMEOUT = 400;
const FINAL_TIMEOUT = 1000;

function randomTimeout() {
  return (
    Math.random() * (SELECTION_TIMEOUT_MAX - SELECTION_TIMEOUT_MIN) +
    SELECTION_TIMEOUT_MIN
  );
}

enum SelectionActionType {
  ChoseItem,
}

type SelectionAction = {
  type: SelectionActionType.ChoseItem;
  itemsCount: number;
};

type SelectionState = {
  itemsCount: number;
  selectedItemId: number;
};

function selectRandomItemId(itemsCount: number, selectedItemId: number) {
  const candidates = [];
  for (let i = 0; i < itemsCount; i++) {
    if (i !== selectedItemId) {
      candidates.push(i);
    }
  }
  return sample(candidates) || 0;
}

function selectionReducer(
  state: SelectionState,
  action: SelectionAction,
): SelectionState {
  switch (action.type) {
    case SelectionActionType.ChoseItem: {
      const selectedItemId = selectRandomItemId(
        action.itemsCount,
        state.selectedItemId,
      );
      return {
        itemsCount: action.itemsCount,
        selectedItemId,
      };
    }
    default: {
      return state;
    }
  }
}

function selectionTaskReducer(
  _state: SelectionTaskState,
  action: SelectionTaskState,
): SelectionTaskState {
  return action;
}

function progressBarReducer(_status: number, action: number): number {
  return action;
}

export default function RandomEliminationRound({
  items,
  onItemElimination,
}: Props) {
  const [selectionState, selectionDispatch] = useReducer(selectionReducer, {
    itemsCount: items.length,
    selectedItemId: selectRandomItemId(items.length, -1),
  });

  const [selectionTaskState, selectionTaskDispatch] = useReducer(
    selectionTaskReducer,
    SelectionTaskState.StartNext,
  );

  const [progressBar, progressBarDispatch] = useReducer(progressBarReducer, 0);
  const [eliminationStarted, setEliminationStarted] = useState(false);

  const theme = useTheme();

  const progressBarFinished = progressBar >= 100;

  const [selectedItemId, setSelectedItemId] = useState(-1);
  useEffect(() => {
    if (!progressBarFinished) {
      setSelectedItemId(selectionState.selectedItemId);
    }
  }, [selectionState.selectedItemId, progressBarFinished]);

  useEffect(() => {
    if (progressBarFinished && !eliminationStarted) {
      setEliminationStarted(true);
      const itemId = items[selectedItemId].id;
      setTimeout(() => {
        onItemElimination(itemId);
        setEliminationStarted(false);
      }, FINAL_TIMEOUT);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressBarFinished]);

  useEffect(() => {
    if (!progressBarFinished) {
      const timeout = setTimeout(() => {
        progressBarDispatch(progressBar + 5);
      }, PROGRESS_BAR_TIMEOUT);
      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressBarFinished, progressBar]);

  useEffect(() => {
    if (selectionTaskState === SelectionTaskState.Idle) {
      selectionDispatch({
        type: SelectionActionType.ChoseItem,
        itemsCount: items.length,
      });
      selectionTaskDispatch(SelectionTaskState.StartNext);
      progressBarDispatch(0);
      setEliminationStarted(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  useEffect(() => {
    if (selectionTaskState === SelectionTaskState.StartNext) {
      selectionTaskDispatch(SelectionTaskState.Idle);
      if (!progressBarFinished) {
        setTimeout(() => {
          selectionTaskDispatch(SelectionTaskState.StartNext);
          selectionDispatch({
            type: SelectionActionType.ChoseItem,
            itemsCount: items.length,
          });
        }, randomTimeout());
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionTaskState]);

  const highlightStyle = {
    backgroundColor: theme.palette.error.light,
    textDecoration: "line-through",
    "&:hover": {
      backgroundColor: theme.palette.error.light,
      textDecoration: "line-through",
    },
  };

  return (
    <div>
      <Box
        display="inline-block"
        alignItems="center"
        width={"200px"}
        style={{ marginBottom: 20 }}
      >
        <BorderLinearProgress variant="determinate" value={progressBar} />
      </Box>
      <Grid container columns={1} rowGap={1}>
        {items.map((item, index) => {
          const style = index === selectedItemId ? highlightStyle : {};
          return (
            <Grid item xs={1} key={index}>
              <Button variant="outlined" sx={style}>
                {item.title}
              </Button>
            </Grid>
          );
        })}
      </Grid>
    </div>
  );
}
