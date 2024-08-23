import { Box } from "@mui/material";
import { Item } from "types";
import InfoPanel from "../shared/InfoPanel";
import ListChoice from "../shared/ListChoice";

type Props = {
  items: Item[];
  onItemSelect: (itemId: string) => void;
};

export default function DarkPactRound({ items, onItemSelect }: Props) {
  const round = Math.round(items.length / 2);
  return (
    <Box>
      <Box display="flex" justifyContent="center">
        <InfoPanel>
          <p>
            Выбери вариант, он пропускает половину турнира ({round} раундов)
            <br />
            Но ему придется ролить 50/50 чтобы вернуться в турнир
          </p>
        </InfoPanel>
      </Box>
      <Box marginTop={2}>
        <ListChoice items={items} onSelect={onItemSelect} />
      </Box>
    </Box>
  );
}
