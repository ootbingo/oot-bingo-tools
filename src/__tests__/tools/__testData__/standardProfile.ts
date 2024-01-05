import { Profile } from "oot-bingo-generator/build/types/settings";

export const standardProfile: Profile = {
  minimumSynergy: -3,
  maximumSynergy: 7,
  maximumIndividualSynergy: 3.75,
  initialOffset: 1,
  maximumOffset: 2,
  baselineTime: 24.75,
  timePerDifficulty: 0.75,
  tooMuchSynergy: 100,
  useFrequencyBalancing: true,
} as const;
