// Difficulty system for Zombie Insurance Simulator

import { DifficultyPreset, Difficulty } from '@/types/game';

export const DIFFICULTY_PRESETS: Record<Difficulty, DifficultyPreset> = {
  easy: {
    name: 'easy',
    label: 'Easy',
    description: 'For beginners. More money, less damage, shorter game.',
    startMoney: 15000,
    startHealth: 120,
    waveCount: 15,
    baseEarningsMultiplier: 1.2,
    damageMultiplier: 0.75,
    insuranceCostMultiplier: 0.9,
    safeRoundChance: 0.20
  },
  medium: {
    name: 'medium',
    label: 'Medium',
    description: 'The standard experience. Balanced risk and reward.',
    startMoney: 10000,
    startHealth: 100,
    waveCount: 20,
    baseEarningsMultiplier: 1.0,
    damageMultiplier: 1.0,
    insuranceCostMultiplier: 1.0,
    safeRoundChance: 0.15
  },
  hard: {
    name: 'hard',
    label: 'Hard',
    description: 'For experts. Less money, more damage, longer survival.',
    startMoney: 7500,
    startHealth: 80,
    waveCount: 25,
    baseEarningsMultiplier: 0.8,
    damageMultiplier: 1.25,
    insuranceCostMultiplier: 1.1,
    safeRoundChance: 0.05
  }
};

export function getDifficultyPreset(difficulty: Difficulty): DifficultyPreset {
  return DIFFICULTY_PRESETS[difficulty];
}

export function getDifficultyColor(difficulty: Difficulty): string {
  switch (difficulty) {
    case 'easy': return 'text-green-400';
    case 'medium': return 'text-yellow-400';
    case 'hard': return 'text-red-400';
  }
}

export function getDifficultyBgColor(difficulty: Difficulty): string {
  switch (difficulty) {
    case 'easy': return 'bg-green-500/20 border-green-500';
    case 'medium': return 'bg-yellow-500/20 border-yellow-500';
    case 'hard': return 'bg-red-500/20 border-red-500';
  }
}
