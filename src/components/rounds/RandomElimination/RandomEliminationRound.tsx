import { Item } from "types";
import Wheel from "../shared/Wheel";

type Props = {
  items: Item[];
  onItemWinning: (id: string) => void;
};

export default function RandomEliminationRound({ items, onItemWinning }: Props) {
  return <Wheel items={items} onItemWinning={onItemWinning} />;
}
