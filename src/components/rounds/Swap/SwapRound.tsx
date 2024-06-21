import { ChangeCircle } from "@mui/icons-material";
import { Button } from "@mui/material";
import { Item } from "types";
import Wheel from "../RandomElimination/Wheel";
import InfoPanel from "../shared/InfoPanel";

type Props = {
  items: Item[];
  onItemSwap: (index: string) => void;
};

export default function SwapRound(props: Props) {
  const SwapButton = ({ children, ...props }: React.ComponentProps<typeof Button>): React.ReactElement => {
    return (
      <Button {...props} color="info">
        Подменить <ChangeCircle sx={{ marginLeft: 1 }} color={"action"} />
      </Button>
    );
  };
  return (
    <>
      <div style={{ display: "grid", justifyContent: "center" }}>
        <InfoPanel>
          <p style={{ whiteSpace: "pre-wrap" }}>
            Случайный вариант секретно меняется с другим
            {"\n"}
            Подмена вскроется когда один из них вылетает
          </p>
        </InfoPanel>
      </div>
      <Wheel items={props.items} onItemWinning={props.onItemSwap} ButtonComponent={SwapButton} />
    </>
  );
}
