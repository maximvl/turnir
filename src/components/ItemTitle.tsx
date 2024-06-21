import { ChangeCircle, Shield } from "@mui/icons-material";
import { Box } from "@mui/material";
import { Item } from "types";

type Props = {
  item: Item;
};

export default function ItemTitle(props: Props) {
  return (
    <Box display="flex" alignItems="center">
      {props.item.title}
      {props.item.isProtected && <Shield sx={{ marginLeft: 1 }} />}
      {props.item.swappedWith && <ChangeCircle sx={{ marginLeft: 1 }} />}
    </Box>
  );
}
