import { Button } from "@mui/material";
import { Shield } from "@mui/icons-material";
import { Item } from "../types";
import Wheel from "./Wheel";

type Props = {
  items: Item[];
  onItemProtection: (index: string) => void;
};

export default function ProtectionRound({ items, onItemProtection }: Props) {
  const ProtectButton = ({
    children,
    ...props
  }: React.ComponentProps<typeof Button>): React.ReactElement => {
    return (
      <Button {...props} color="success">
        Защитить <Shield sx={{ marginLeft: 1 }} />
      </Button>
    );
  };

  return (
    <Wheel
      items={items}
      onItemWinning={onItemProtection}
      ButtonComponent={ProtectButton}
    />
  );
}
