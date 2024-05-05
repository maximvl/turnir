import { Button } from "@mui/material";
import { Shield } from "@mui/icons-material";
import { Item } from "../types";
import Wheel, { ButtonProps } from "./Wheel";

type Props = {
  items: Item[];
  onItemProtection: (index: string) => void;
};

export default function ProtectionRound({ items, onItemProtection }: Props) {
  const ProtectButton = ({
    selectedItemId,
    onClick,
    children,
    ...props
  }: ButtonProps) => {
    const onClickWrapper = (evt: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(evt);
      if (selectedItemId) {
        onItemProtection(selectedItemId);
      }
    };
    return (
      <Button {...props} color="success" onClick={onClickWrapper}>
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
