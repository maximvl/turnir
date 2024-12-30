export type Item = {
  title: string
  status: ItemStatus
  eliminationRound?: number
  eliminationType?: RoundType
  swappedWith?: string
  isProtected?: boolean
  isResurrected?: boolean
  hasDeal?: boolean
  id: string
}

export enum ItemStatus {
  Active,
  Eliminated,
  Excluded,
}

export enum TurnirState {
  EditCandidates,
  Start,
  RoundStart,
  RoundChange,
  Victory,
}

export enum RoundType {
  RandomElimination = 'RandomElimination',
  StreamerChoice = 'StreamerChoice',
  ViewerChoice = 'ViewerChoice',
  Protection = 'Protection',
  StreamerVsRandom = 'StreamerVsRandom',
  Swap = 'Swap',
  ClosestVotes = 'ClosestVotes',
  Resurrection = 'Resurrection',
  Deal = 'Deal',
  DealReturn = 'DealReturn',
}

export const ClassicRoundTypes = [
  RoundType.RandomElimination,
  RoundType.StreamerChoice,
  RoundType.ViewerChoice,
]

export const NewRoundTypes = [
  RoundType.Protection,
  // RoundType.StreamerVsRandom
  RoundType.Swap,
  RoundType.ClosestVotes,
  RoundType.Resurrection,
  RoundType.Deal,
]

export const OneTimeRounds = [
  RoundType.Protection,
  RoundType.Swap,
  RoundType.Resurrection,
  RoundType.Deal,
  RoundType.DealReturn,
]

export const RoundTypes = ClassicRoundTypes.concat(NewRoundTypes)

export const RoundTypeNames = {
  [RoundType.RandomElimination]: 'Случайное устранение',
  [RoundType.StreamerChoice]: 'Выбор стримера',
  [RoundType.ViewerChoice]: 'Выбор зрителей',
  [RoundType.Protection]: 'Защитный',
  [RoundType.StreamerVsRandom]: 'Стример против рандома',
  [RoundType.Swap]: 'Подмена',
  [RoundType.ClosestVotes]: 'Стример против Чата',
  [RoundType.Resurrection]: 'Воскрешение',
  [RoundType.Deal]: '"Счастливый" билетик',
  [RoundType.DealReturn]: 'Плата за билет',
}

export const RoundTypeTooltip: { [key: string]: string } = {
  [RoundType.Protection]:
    'Один раз за турнир случайный вариант получает разовую защиту от вылета',
  [RoundType.StreamerVsRandom]: 'Стример выбирает кто вылетит не видя варианты',
  [RoundType.RandomElimination]: 'Выбывает случайный вариант',
  [RoundType.StreamerChoice]: 'Стример выбирает кто вылетит',
  [RoundType.ViewerChoice]: 'Зрители выбирают кто вылетит',
  [RoundType.Swap]:
    'Случайный вариант скрытно меняется с другим, подмена вскроется когда один из них вылетит',
  [RoundType.ClosestVotes]:
    'Вылетает вариант получивший наиболее близкое количество голосов к тому что выбрал стример',
  [RoundType.Resurrection]:
    'На середине турнира выбывший вариант получает возможность вернуться в игру',
  [RoundType.Deal]:
    'Выбранный вариант пропускает половину турнира, но будет ролить 50/50 чтобы вернуться',
}

export const enum MusicType {
  Wheel = 'Wheel',
  Victory = 'Victory',
  Thinking = 'Thinking',
  RickRoll = 'RickRoll',
  WrongAnswer = 'WrongAnswer',
  Nightsong = 'Nightsong',
  Raphael = 'Raphael',
  DeathNote = 'DeathNote',
  Light = 'Light',
  Loto = 'Loto',
}

export const MusicTypeIds = {
  [MusicType.Wheel]: 'wheel-music',
  [MusicType.Victory]: 'victory-music',
  [MusicType.Thinking]: 'thinking-music',
  [MusicType.RickRoll]: 'rickroll-music',
  [MusicType.WrongAnswer]: 'wrong-answer-music',
  [MusicType.Nightsong]: 'nightsong-music',
  [MusicType.Raphael]: 'raphael-music',
  [MusicType.DeathNote]: 'deathnote-music',
  [MusicType.Light]: 'light-music',
  [MusicType.Loto]: 'loto-music',
}

export type ChatServerType = 'twitch' | 'vkvideo' | 'nuum' | 'goodgame'
