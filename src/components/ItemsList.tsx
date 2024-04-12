import { OpenInNewOutlined } from "@mui/icons-material";
import { Box, Button, Grid, Stack, TextField, useTheme } from "@mui/material";
import React from "react";
import { Item, ItemStatus, RoundTypeNames } from "../types";

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

  const theme = useTheme();

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>Кандидаты ({activeItems.length})</h3>
      <Grid
        container
        rowGap={1}
        columns={1}
        direction="column"
        alignItems={"flex-start"}
        border={0}
      >
        {items.map((item, index) => {
          const itemColor =
            item.status === ItemStatus.Active
              ? theme.palette.success.main
              : theme.palette.error.main;

          let itemTitle = item.title;
          // if (item.eliminationType && item.eliminationType) {
          //   itemTitle = `${itemTitle} [${RoundTypeNames[item.eliminationType]} #${item.eliminationRound}]`;
          // }
          return (
            <Grid container columns={12} key={index}>
              <Grid item xs={10} width="inherit">
                <Box
                  display={"flex"}
                  alignItems="center"
                  width={"inherit"}
                  style={{ paddingRight: 10 }}
                >
                  {index + 1}.
                  <Box width={10} />
                  {canEditItems ? (
                    <TextField
                      variant="standard"
                      value={item.title}
                      fullWidth
                      onChange={(event) =>
                        handleChange(event.target.value, index)
                      }
                      disabled={!canEditItems}
                    />
                  ) : (
                    <div style={{ fontSize: 20, color: itemColor }}>
                      {itemTitle}
                    </div>
                  )}
                </Box>
              </Grid>
              <Grid item xs={2} paddingLeft={1}>
                {item.title && (
                  <a
                    href={`https://www.kinopoisk.ru/index.php?kp_query=${item.title}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      КП
                      <OpenInNewOutlined />
                    </Stack>
                  </a>
                )}
              </Grid>
            </Grid>
          );
        })}
      </Grid>
    </div>
  );
}
