import { RoundType, RoundTypeNames } from "../types";

type Props = {
  roundNumber: number;
  roundType: RoundType;
  itemsLeft: number;
  totalRounds: number;
};

export default function RoundTitle({
  roundNumber,
  roundType,
  itemsLeft,
  totalRounds,
}: Props) {
  const isFinals = itemsLeft === 2;

  if (isFinals) {
    return (
      <div>
        <h1 style={{ marginTop: 0 }}>Финал</h1>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ marginTop: 0 }}>
        Раунд {roundNumber}/{totalRounds}: {RoundTypeNames[roundType]}
      </h3>
    </div>
  );
}
