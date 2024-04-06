import { RoundType, RoundTypeNames } from "../types";

type Props = {
  roundNumber: number;
  roundType: RoundType;
};

export default function RoundTitle({ roundNumber, roundType }: Props) {
  return (
    <div>
      <h3 style={{ marginTop: 0 }}>
        Раунд {roundNumber}: {RoundTypeNames[roundType]}
      </h3>
    </div>
  );
}
