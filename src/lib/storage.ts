// localStorage utilities for Zombie Insurance Simulator

import { GameSettings, GameStats, LeaderboardEntry, UnlockedAchievement, Difficulty } from '@/types/game';

const STORAGE_KEYS = {
  SETTINGS: 'zombie-sim-settings',
  STATS: 'zombie-sim-stats',
  ACHIEVEMENTS: 'zombie-sim-achievements',
  LEADERBOARD: 'zombie-sim-leaderboard',
  CLASS_LEADERBOARD: 'zombie-sim-class-leaderboard'
} as const;

// Default values
const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: false, // Off by default for classroom
  soundVolume: 0.7,
  musicEnabled: false,
  musicVolume: 0.5,
  lastDifficulty: 'medium',
  lastCharacter: 'survivor',
  playerName: ''
};

const DEFAULT_STATS: GameStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  totalMoneyEarned: 0,
  totalMoneySpentOnInsurance: 0,
  totalDamageAvoided: 0,
  totalDamageTaken: 0,
  highestScore: 0,
  highestWave: 0,
  perfectHealthWins: 0,
  noInsuranceWins: 0,
  currentStreak: 0,
  longestStreak: 0,
  insuranceTypesUsed: [],
  difficultiesBeaten: [],
  timePlayed: 0,
  lowestMoneyReached: 10000,
  lowestHealthReached: 100,
  wavesWithoutDamage: 0,
  fullCoverageRounds: 0
};

// Generic storage functions
function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

// Settings
export function getSettings(): GameSettings {
  return getItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
}

export function saveSettings(settings: Partial<GameSettings>): void {
  const current = getSettings();
  setItem(STORAGE_KEYS.SETTINGS, { ...current, ...settings });
}

// Stats
export function getStats(): GameStats {
  return getItem(STORAGE_KEYS.STATS, DEFAULT_STATS);
}

export function saveStats(stats: Partial<GameStats>): void {
  const current = getStats();
  setItem(STORAGE_KEYS.STATS, { ...current, ...stats });
}

export function updateStatsAfterGame(
  won: boolean,
  score: number,
  wave: number,
  money: number,
  health: number,
  insuranceSpent: number,
  damageAvoided: number,
  damageTaken: number,
  timePlayed: number,
  usedInsuranceTypes: string[],
  difficulty: Difficulty,
  lowestMoney: number,
  lowestHealth: number,
  wavesWithoutDamage: number,
  fullCoverageRounds: number
): void {
  const stats = getStats();

  stats.gamesPlayed++;
  if (won) {
    stats.gamesWon++;
    stats.currentStreak++;
    stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak);

    if (health >= 100) stats.perfectHealthWins++;
    if (insuranceSpent === 0) stats.noInsuranceWins++;

    if (!stats.difficultiesBeaten.includes(difficulty)) {
      stats.difficultiesBeaten.push(difficulty);
    }
  } else {
    stats.currentStreak = 0;
  }

  stats.totalMoneyEarned += money;
  stats.totalMoneySpentOnInsurance += insuranceSpent;
  stats.totalDamageAvoided += damageAvoided;
  stats.totalDamageTaken += damageTaken;
  stats.highestScore = Math.max(stats.highestScore, score);
  stats.highestWave = Math.max(stats.highestWave, wave);
  stats.timePlayed += timePlayed;
  stats.lowestMoneyReached = Math.min(stats.lowestMoneyReached, lowestMoney);
  stats.lowestHealthReached = Math.min(stats.lowestHealthReached, lowestHealth);
  stats.wavesWithoutDamage = Math.max(stats.wavesWithoutDamage, wavesWithoutDamage);
  stats.fullCoverageRounds = Math.max(stats.fullCoverageRounds, fullCoverageRounds);

  // Track insurance types used
  usedInsuranceTypes.forEach(type => {
    if (!stats.insuranceTypesUsed.includes(type)) {
      stats.insuranceTypesUsed.push(type);
    }
  });

  saveStats(stats);
}

// Achievements
export function getUnlockedAchievements(): UnlockedAchievement[] {
  return getItem(STORAGE_KEYS.ACHIEVEMENTS, []);
}

export function saveAchievement(achievement: UnlockedAchievement): void {
  const achievements = getUnlockedAchievements();
  if (!achievements.find(a => a.id === achievement.id)) {
    achievements.push(achievement);
    setItem(STORAGE_KEYS.ACHIEVEMENTS, achievements);
  }
}

export function isAchievementUnlocked(id: string): boolean {
  const achievements = getUnlockedAchievements();
  return achievements.some(a => a.id === id);
}

// Leaderboard
export function getLeaderboard(): LeaderboardEntry[] {
  return getItem(STORAGE_KEYS.LEADERBOARD, []);
}

export function addToLeaderboard(entry: LeaderboardEntry): number {
  const leaderboard = getLeaderboard();
  leaderboard.push(entry);
  leaderboard.sort((a, b) => b.score - a.score);
  const trimmed = leaderboard.slice(0, 100); // Keep top 100
  setItem(STORAGE_KEYS.LEADERBOARD, trimmed);
  return trimmed.findIndex(e => e.id === entry.id) + 1;
}

export function getLeaderboardByDifficulty(difficulty: Difficulty): LeaderboardEntry[] {
  const leaderboard = getLeaderboard();
  return leaderboard.filter(e => e.difficulty === difficulty);
}

// Class leaderboard (shared via URL parameter)
export function getClassLeaderboard(): LeaderboardEntry[] {
  return getItem(STORAGE_KEYS.CLASS_LEADERBOARD, []);
}

export function addToClassLeaderboard(entry: LeaderboardEntry): number {
  const leaderboard = getClassLeaderboard();
  leaderboard.push(entry);
  leaderboard.sort((a, b) => b.score - a.score);
  setItem(STORAGE_KEYS.CLASS_LEADERBOARD, leaderboard);
  return leaderboard.findIndex(e => e.id === entry.id) + 1;
}

export function clearClassLeaderboard(): void {
  setItem(STORAGE_KEYS.CLASS_LEADERBOARD, []);
}

// Utility to check if character is unlocked
export function isCharacterUnlocked(unlockRequirement: string): boolean {
  if (unlockRequirement === 'default') return true;

  const stats = getStats();
  const achievements = getUnlockedAchievements();

  switch (unlockRequirement) {
    case 'win_5_games':
      return stats.gamesWon >= 5;
    case 'win_10_games':
      return stats.gamesWon >= 10;
    case 'achievement_risk_taker':
      return achievements.some(a => a.id === 'risk-taker');
    case 'achievement_perfect_health':
      return achievements.some(a => a.id === 'perfect-health');
    default:
      return false;
  }
}

// Generate unique ID for leaderboard entries
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
