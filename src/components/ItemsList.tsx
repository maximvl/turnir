import { Box, Grid, TextField } from "@mui/material";
import React from "react";
import { Item, ItemStatus } from "../types";

type Props = {
  items: Item[];
  setItem: (id: number, text: string) => void;
  activeItems: Item[];
  canEditItems: boolean;
};

export default function ItemsList({
  items,
  setItem,
  activeItems,
  canEditItems,
}: Props) {
  const handleChange = (text: string, index: number) => {
    setItem(index, text);
  };

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>Кандидаты ({activeItems.length})</h3>
      <Grid
        container
        rowGap={1}
        columns={2}
        direction="column"
        alignItems={"flex-start"}
        border={0}
      >
        {items.map((item, index) => {
          const itemColor = item.status === ItemStatus.Active ? "green" : "red";
          return (
            <Box
              key={index}
              display="flex"
              alignItems="center"
              width={"inherit"}
            >
              <div>{index + 1}.</div>
              <Box width={10} />
              {canEditItems ? (
                <TextField
                  variant="standard"
                  value={item.title}
                  fullWidth
                  onChange={(event) => handleChange(event.target.value, index)}
                  disabled={!canEditItems}
                />
              ) : (
                <div style={{ fontSize: 20, color: itemColor }}>
                  {item.title}
                </div>
              )}
            </Box>
          );
        })}
      </Grid>
    </div>
  );
}
