export type Item = {
  title: string;
  status: ItemStatus;
  eliminationRound?: number;
  eliminationType?: RoundType;
  swappedWith?: string;
  isProtected?: boolean;
  isResurrected?: boolean;
  id: string;
};

export enum ItemStatus {
  Active,
  Eliminated,
}

export enum TurnirState {
  EditCandidates,
  Start,
  RoundSelection,
  RoundStart,
  RoundEnd,
  Victory,
}

export enum RoundType {
  RandomElimination = "RandomElimination",
  StreamerChoice = "StreamerChoice",
  ViewerChoice = "ViewerChoice",
  Protection = "Protection",
  StreamerVsRandom = "StreamerVsRandom",
  Swap = "Swap",
  ClosestVotes = "ClosestVotes",
  Resurrection = "Resurrection",
}

export const ClassicRoundTypes = [RoundType.RandomElimination, RoundType.StreamerChoice, RoundType.ViewerChoice];

export const NewRoundTypes = [
  RoundType.Protection,
  // RoundType.StreamerVsRandom
  RoundType.Swap,
  RoundType.ClosestVotes,
  RoundType.Resurrection,
];

export const RoundTypes = ClassicRoundTypes.concat(NewRoundTypes);

export const RoundTypeNames = {
  [RoundType.RandomElimination]: "Случайное устранение",
  [RoundType.StreamerChoice]: "Выбор стримера",
  [RoundType.ViewerChoice]: "Выбор зрителей",
  [RoundType.Protection]: "Защитный",
  [RoundType.StreamerVsRandom]: "Стример против рандома",
  [RoundType.Swap]: "Подмена",
  [RoundType.ClosestVotes]: "Стример против Чата",
  [RoundType.Resurrection]: "Воскрешение",
};

export const RoundTypeTooltip: { [key: string]: string } = {
  [RoundType.Protection]: "Один раз за турнир случайный вариант получает разовую защиту от вылета",
  [RoundType.StreamerVsRandom]: "Стример выбирает кто вылетит не видя варианты",
  [RoundType.RandomElimination]: "Выбывает случайный вариант",
  [RoundType.StreamerChoice]: "Стример выбирает кто вылетит",
  [RoundType.ViewerChoice]: "Зрители выбирают кто вылетит",
  [RoundType.Swap]: "Случайный вариант скрытно меняется с другим, подмена вскроется когда один из них вылетит",
  [RoundType.ClosestVotes]: "Вылетает вариант получивший наиболее близкое количество голосов к тому что выбрал стример",
  [RoundType.Resurrection]: "На середине турнира выбывший вариант получает возможность вернуться в игру",
};

export const enum MusicType {
  Wheel = "Wheel",
  Victory = "Victory",
  Thinking = "Thinking",
  RickRoll = "RickRoll",
  WrongAnswer = "WrongAnswer",
  Nightsong = "Nightsong",
}

export const MusicTypeIds = {
  [MusicType.Wheel]: "wheel-music",
  [MusicType.Victory]: "victory-music",
  [MusicType.Thinking]: "thinking-music",
  [MusicType.RickRoll]: "rickroll-music",
  [MusicType.WrongAnswer]: "wrong-answer-music",
  [MusicType.Nightsong]: "nightsong-music",
};
