export type TierKey = 'low' | 'mid' | 'high'

export const HERO_AB_TUNING = {
  cameraTravel: {
    high: 96,
    mid: 89,
    low: 81,
  } as Record<TierKey, number>,
  runCurve: {
    launchEnd: 0.21,
    launchDistance: 0.28,
    cruiseEnd: 0.74,
    cruiseDistance: 0.78,
    settleStart: 0.34,
    settleEnd: 0.56,
    settleDepth: 0.07,
    endPushStart: 0.84,
    endPushDepth: 0.04,
  },
  nearPracticalIntensity: 1.16,
  flashOnset: 0.93,
  overlayOpacity: {
    openingMin: 0.18,
    openingMax: 0.43,
    settledMin: 0.34,
    settledMax: 0.78,
  },
} as const
