import { Box, Button } from "@mui/material";
import { Item, ItemStatus } from "types";
import InfoPanel from "../shared/InfoPanel";
import Wheel from "../shared/Wheel";

type Props = {
  item: Item;
  onItemElimination: (itemId: string) => void;
  onItemReturn: (itemId: string) => void;
};

export default function DarkPactReturn({ item, onItemReturn, onItemElimination }: Props) {
  const savedOption = { id: "1", title: "Возвращение", status: ItemStatus.Active };
  const eliminatedOption = { id: "2", title: "Выбывание", status: ItemStatus.Active };

  const wheelItems = [savedOption, eliminatedOption];

  const onItemWinning = (itemId: string) => {
    if (itemId === savedOption.id) {
      onItemReturn(item.id);
    } else {
      onItemElimination(item.id);
    }
  };

  const buttonGenerator = (item: Item) => {
    if (item.id === savedOption.id) {
      const ResurrectButton = ({ children, ...props }: React.ComponentProps<typeof Button>): React.ReactElement => {
        return (
          <Button {...props} color="success">
            Вернуть в турнир
          </Button>
        );
      };
      return ResurrectButton;
    }
    const EliminateButton = ({ children, ...props }: React.ComponentProps<typeof Button>): React.ReactElement => {
      return (
        <Button {...props} color="error">
          Удалить из турнира
        </Button>
      );
    };
    return EliminateButton;
  };

  return (
    <Box>
      <Box display="flex" justifyContent="center">
        <InfoPanel>
          <p>
            {item.title} {<br />}должен заплатить за счастливый билет
          </p>
        </InfoPanel>
      </Box>
      <Wheel items={wheelItems} onItemWinning={onItemWinning} buttonGenerator={buttonGenerator} />
    </Box>
  );
}
