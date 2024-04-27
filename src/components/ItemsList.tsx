import { OpenInNewOutlined } from "@mui/icons-material";
import { Box, Grid, Stack, TextField, useTheme } from "@mui/material";
import { isEmpty } from "lodash";
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
  return (
    <div>
      {canEditItems ? (
        <EditableItemsList items={items} setItem={setItem} />
      ) : (
        <NonEditableItemsList items={activeItems} />
      )}
    </div>
  );
}

type EditableItemProps = {
  item: Item;
  index: number;
  handleChange: (text: string) => void;
  handlePaste: (lines: string[]) => void;
};

function EditableItem({
  item,
  handleChange,
  handlePaste,
  index,
}: EditableItemProps) {
  return (
    <TextField
      variant="standard"
      value={item.title}
      fullWidth
      onPaste={(event) => {
        event.preventDefault();
        const text = event.clipboardData.getData("text");
        const textLines = text.split("\n").filter((line) => !isEmpty(line));
        console.log(textLines);
        handlePaste(textLines);
      }}
      onChange={(event) => handleChange(event.target.value)}
    />
  );
}

type EditableItemsListProps = {
  items: Item[];
  setItem: (index: number, text: string) => void;
};

function EditableItemsList({ items, setItem }: EditableItemsListProps) {
  const handleChange = (index: number, text: string) => {
    setItem(index, text);
  };

  const activeItems = items.filter((item) => !isEmpty(item.title));

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
                  <EditableItem
                    item={item}
                    handleChange={(text) => handleChange(index, text)}
                    handlePaste={(lines) => {
                      for (let i = 0; i < lines.length; i++) {
                        handleChange(index + i, lines[i]);
                      }
                    }}
                    index={index}
                  />
                </Box>
              </Grid>
              <Grid item xs={2} paddingLeft={1}>
                {item.title && <KPLink item={item} />}
              </Grid>
            </Grid>
          );
        })}
      </Grid>
    </div>
  );
}

type NonEditableItemsListProps = {
  items: Item[];
};

function NonEditableItemsList({ items }: NonEditableItemsListProps) {
  const theme = useTheme();

  const activeItems = items.filter((item) => item.status === ItemStatus.Active);
  const eliminatedItems = items.filter(
    (item) => item.status === ItemStatus.Eliminated,
  );

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>Участники ({activeItems.length})</h3>
      <Grid
        container
        rowGap={1}
        columns={1}
        direction="column"
        alignItems={"flex-start"}
        border={0}
      >
        {activeItems.map((item) => {
          let itemTitle = item.title;
          // if (item.eliminationType && item.eliminationType) {
          //   itemTitle = `${itemTitle} [${RoundTypeNames[item.eliminationType]} #${item.eliminationRound}]`;
          // }
          return (
            <Grid container columns={12} key={item.id}>
              <Grid item xs={10} width="inherit">
                <Box
                  display={"flex"}
                  alignItems="center"
                  width={"inherit"}
                  style={{ paddingRight: 10 }}
                >
                  {item.id}.
                  <Box width={10} />
                  <Box color={theme.palette.success.main}>{itemTitle}</Box>
                </Box>
              </Grid>
              <Grid item xs={2} paddingLeft={1}>
                {item.title && <KPLink item={item} />}
              </Grid>
            </Grid>
          );
        })}
        <Grid item>
          <h3>Выбывшие ({eliminatedItems.length})</h3>
        </Grid>
        {eliminatedItems.map((item) => {
          let itemTitle = item.title;
          // if (item.eliminationType && item.eliminationType) {
          //   itemTitle = `${itemTitle} [${RoundTypeNames[item.eliminationType]} #${item.eliminationRound}]`;
          // }
          return (
            <Grid container columns={12} key={item.id}>
              <Grid item xs={10} width="inherit">
                <Box
                  display={"flex"}
                  alignItems="center"
                  width={"inherit"}
                  style={{ paddingRight: 10 }}
                >
                  {item.id}.
                  <Box width={10} />
                  <Box color={theme.palette.error.light}>{itemTitle}</Box>
                </Box>
              </Grid>
              <Grid item xs={2} paddingLeft={1}>
                {item.title && <KPLink item={item} />}
              </Grid>
            </Grid>
          );
        })}
      </Grid>
    </div>
  );
}

type KPLinkProps = {
  item: Item;
};

function KPLink({ item }: KPLinkProps) {
  return (
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
  );
}
