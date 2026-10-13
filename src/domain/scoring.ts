import { ScoreBreakdown, LevelConfig } from '../types/game';

export function getComboMultiplier(streak: number): number {
  if (streak >= 6) return 3.0;
  if (streak >= 4) return 2.0;
  if (streak >= 2) return 1.5;
  return 1.0;
}

export function calculateTheoreticalMax(level: LevelConfig): number {
  let baseSum = 0;
  for (let i = 0; i < level.ringCount; i++) {
    const ringBase = 1000 * (1 + i);
    // Ideal streak would ramp up to 3.0x
    const multiplier = getComboMultiplier(i + 1);
    baseSum += ringBase * multiplier;
  }
  // Max speed bonus (2.0x) and No-slowmo bonus (+25% = 1.25x)
  return Math.round(baseSum * 2.0 * 1.25);
}

export function computeStageScore(params: {
  level: LevelConfig;
  ringsLocked: { ringIndex: number; streakAtLock: number; speedAtLock: number }[];
  penaltyCount: number;
  usedSlowMo: boolean;
  timeTakenSec: number;
  maxStreak: number;
}): ScoreBreakdown {
  const { level, ringsLocked, penaltyCount, usedSlowMo, timeTakenSec, maxStreak } = params;

  let rawPoints = 0;
  let comboBonusPoints = 0;
  let speedBonusAccumulator = 0;

  ringsLocked.forEach(({ ringIndex, streakAtLock, speedAtLock }) => {
    const baseVal = 1000 * (1 + ringIndex);
    const mult = getComboMultiplier(streakAtLock);
    const ringScore = baseVal * mult;
    rawPoints += baseVal;
    comboBonusPoints += (ringScore - baseVal);

    // Speed bonus: 1.0 + (abs(speedAtLock) / 200), clamped between 1.0 and 2.0
    const spdMultiplier = Math.min(2.0, Math.max(1.0, 1.0 + (Math.abs(speedAtLock) / 180)));
    speedBonusAccumulator += spdMultiplier;
  });

  const avgSpeedMultiplier = ringsLocked.length > 0 
    ? Number((speedBonusAccumulator / ringsLocked.length).toFixed(2))
    : 1.0;

  const penaltyDeductions = penaltyCount * 300;
  const subtotal = Math.max(0, (rawPoints + comboBonusPoints) * avgSpeedMultiplier - penaltyDeductions);

  const slowMoBonusPoints = !usedSlowMo ? Math.round(subtotal * 0.25) : 0;
  const totalScore = Math.round(subtotal + slowMoBonusPoints);

  const theoreticalMax = calculateTheoreticalMax(level);
  const accuracyPercentage = Math.min(100, Math.max(0, Math.round((totalScore / theoreticalMax) * 100)));

  let rank: 'S' | 'A' | 'B' | 'C' | 'D' = 'D';
  if (accuracyPercentage >= 95) rank = 'S';
  else if (accuracyPercentage >= 80) rank = 'A';
  else if (accuracyPercentage >= 65) rank = 'B';
  else if (accuracyPercentage >= 50) rank = 'C';

  return {
    rawPoints,
    comboBonusPoints,
    speedMultiplier: avgSpeedMultiplier,
    slowMoBonusPoints,
    penaltyDeductions,
    totalScore,
    theoreticalMaxScore: theoreticalMax,
    accuracyPercentage,
    rank,
    isSyncPerfect: rank === 'S',
    timeTakenSec: Number(timeTakenSec.toFixed(1)),
    usedSlowMo,
    maxStreak,
  };
}
