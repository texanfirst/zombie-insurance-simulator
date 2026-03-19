export type ThreatLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';

export interface ThreatForecast {
  homeAttack: ThreatLevel;
  injury: ThreatLevel;
  supplyLoss: ThreatLevel;
  evacuation: ThreatLevel;
  overallDanger: ThreatLevel;
}

const THREAT_LEVELS: ThreatLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'EXTREME'];

function shiftLevel(level: ThreatLevel, delta: number): ThreatLevel {
  const idx = THREAT_LEVELS.indexOf(level);
  const newIdx = Math.max(0, Math.min(THREAT_LEVELS.length - 1, idx + delta));
  return THREAT_LEVELS[newIdx];
}

function baseFromProb(prob: number, wave: number): ThreatLevel {
  // Scale probability up with wave
  const scaled = prob + (wave - 1) * 0.015;
  if (scaled < 0.18) return 'LOW';
  if (scaled < 0.28) return 'MEDIUM';
  if (scaled < 0.38) return 'HIGH';
  return 'EXTREME';
}

function overallFromWave(wave: number): ThreatLevel {
  if (wave <= 5) return Math.random() < 0.6 ? 'LOW' : 'MEDIUM';
  if (wave <= 10) return 'MEDIUM';
  if (wave <= 15) return Math.random() < 0.5 ? 'MEDIUM' : 'HIGH';
  if (wave <= 20) return 'HIGH';
  return Math.random() < 0.5 ? 'HIGH' : 'EXTREME';
}

export function generateThreatForecast(wave: number, difficulty: string): ThreatForecast {
  const diffMod = difficulty === 'hard' ? 0.05 : difficulty === 'easy' ? -0.05 : 0;

  let homeAttack = baseFromProb(0.25 + diffMod, wave);
  let injury = baseFromProb(0.20 + diffMod, wave);
  let supplyLoss = baseFromProb(0.25 + diffMod, wave);
  let evacuation = baseFromProb(0.15 + diffMod, wave);

  // Add noise: ~30% chance each category shifts +/- 1
  if (Math.random() < 0.3) homeAttack = shiftLevel(homeAttack, Math.random() < 0.5 ? 1 : -1);
  if (Math.random() < 0.3) injury = shiftLevel(injury, Math.random() < 0.5 ? 1 : -1);
  if (Math.random() < 0.3) supplyLoss = shiftLevel(supplyLoss, Math.random() < 0.5 ? 1 : -1);
  if (Math.random() < 0.3) evacuation = shiftLevel(evacuation, Math.random() < 0.5 ? 1 : -1);

  const overallDanger = overallFromWave(wave);

  return { homeAttack, injury, supplyLoss, evacuation, overallDanger };
}
