import { Item } from "../types";
import Wheel from "./Wheel";

type Props = {
  items: Item[];
  onItemProtection: (index: string) => void;
};

export default function ProtectionRound({ items, onItemProtection }: Props) {
  return (
    <Wheel
      items={items}
      onItemWinning={onItemProtection}
      winningButtonText={"Защитить"}
    />
  );
}
