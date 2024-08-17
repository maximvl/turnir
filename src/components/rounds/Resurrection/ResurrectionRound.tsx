import { Item } from "types";
import InfoPanel from "../shared/InfoPanel";
import Wheel from "../shared/Wheel";
import { Box, Button, useTheme } from "@mui/material";
import Icon from "@mdi/react";
import { mdiCross, mdiEmoticonDevil } from "@mdi/js";
import { useEffect, useState } from "react";
import ListChoice from "../shared/ListChoice";
import PrayImage from "images/pray.webp";
import ChristImage from "images/christ.webp";

type Props = {
  activeItems: Item[];
  eliminatedItems: Item[];
  onItemResurrection: (id: string, eliminationId?: string) => void;
};

type State = "initial" | "resurrection" | "demonic-resurrection";

export default function ResurrectionRound({ activeItems, eliminatedItems, onItemResurrection }: Props) {
  const [state, setState] = useState<State>("initial");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  useEffect(() => {
    setState("initial");
  }, [activeItems.length]);

  const handleResurrectionWithElimination = (eliminationId: string) => {
    if (selectedItemId) {
      onItemResurrection(selectedItemId, eliminationId);
    }
  };

  const selectedItemTitle = selectedItemId ? eliminatedItems.find((item) => item.id === selectedItemId)?.title : null;

  return (
    <>
      {state === "initial" && (
        <Box style={{ display: "grid", justifyContent: "center" }}>
          <InfoPanel>
            <p>Обычное воскрешение возвращает случайный вариант в игру</p>
            <p>Демоническое воскрешение возвращает выбранный вариант но в замен случайного</p>
          </InfoPanel>
          <Box marginTop={2}>
            <Button variant="contained" color="success" onClick={() => setState("resurrection")}>
              Воскрешение
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => setState("demonic-resurrection")}
              sx={{ marginLeft: 2 }}
            >
              Демоническое воскрешение
            </Button>
          </Box>
        </Box>
      )}
      {state === "resurrection" && (
        <Box>
          <Wheel
            items={eliminatedItems}
            onItemWinning={onItemResurrection}
            ButtonComponent={ResurrectButton}
            centerImage={PrayImage}
          />
        </Box>
      )}
      {state === "demonic-resurrection" && !selectedItemId && (
        <Box>
          <Box sx={{ display: "grid", justifyContent: "center", marginBottom: 2 }}>
            <InfoPanel>
              <p>Выбери вариант для воскрешения</p>
            </InfoPanel>
          </Box>
          <ListChoice items={eliminatedItems} onSelect={setSelectedItemId} />
        </Box>
      )}
      {state === "demonic-resurrection" && selectedItemId && (
        <Box>
          <Box sx={{ display: "grid", justifyContent: "center", marginBottom: 2 }}>
            <InfoPanel>
              <p>{selectedItemTitle} заменит одного из участников</p>
            </InfoPanel>
          </Box>
          <Wheel
            items={activeItems}
            onItemWinning={handleResurrectionWithElimination}
            ButtonComponent={DemonicResurrectButton}
            centerImage={ChristImage}
          />
        </Box>
      )}
    </>
  );
}

const ResurrectButton = ({ children, ...props }: React.ComponentProps<typeof Button>): React.ReactElement => {
  return (
    <Button {...props} color="success">
      Воскресить <Icon path={mdiCross} style={{ width: 24, height: 24, marginLeft: 10 }} color="white" />
    </Button>
  );
};

const DemonicResurrectButton = ({ children, ...props }: React.ComponentProps<typeof Button>): React.ReactElement => {
  const theme = useTheme();
  return (
    <Button {...props} color="success">
      Воскресить{" "}
      <Icon
        path={mdiEmoticonDevil}
        style={{ width: 24, height: 24, marginLeft: 10 }}
        color={theme.palette.error.main}
      />
    </Button>
  );
};
