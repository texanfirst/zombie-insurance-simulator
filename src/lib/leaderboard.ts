// Leaderboard system for Zombie Insurance Simulator

import { LeaderboardEntry, Difficulty } from '@/types/game';
import {
  getLeaderboard,
  addToLeaderboard,
  getLeaderboardByDifficulty,
  getClassLeaderboard,
  addToClassLeaderboard,
  clearClassLeaderboard,
  generateId
} from './storage';

export interface LeaderboardResult {
  entry: LeaderboardEntry;
  rank: number;
  isNewHighScore: boolean;
  isTopTen: boolean;
}

// Create a new leaderboard entry
export function createLeaderboardEntry(
  playerName: string,
  score: number,
  money: number,
  health: number,
  wavesCompleted: number,
  difficulty: Difficulty,
  character: string,
  achievementsEarned: string[]
): LeaderboardEntry {
  return {
    id: generateId(),
    playerName: playerName || 'Anonymous',
    score,
    money,
    health,
    wavesCompleted,
    difficulty,
    character,
    timestamp: Date.now(),
    achievementsEarned
  };
}

// Submit score to personal leaderboard
export function submitScore(entry: LeaderboardEntry): LeaderboardResult {
  const existingLeaderboard = getLeaderboard();
  const previousHighScore = existingLeaderboard.length > 0 ? existingLeaderboard[0].score : 0;

  const rank = addToLeaderboard(entry);

  return {
    entry,
    rank,
    isNewHighScore: entry.score > previousHighScore,
    isTopTen: rank <= 10
  };
}

// Submit score to class leaderboard
export function submitClassScore(entry: LeaderboardEntry): LeaderboardResult {
  const existingLeaderboard = getClassLeaderboard();
  const previousHighScore = existingLeaderboard.length > 0 ? existingLeaderboard[0].score : 0;

  const rank = addToClassLeaderboard(entry);

  return {
    entry,
    rank,
    isNewHighScore: entry.score > previousHighScore,
    isTopTen: rank <= 10
  };
}

// Get top scores
export function getTopScores(count: number = 10): LeaderboardEntry[] {
  return getLeaderboard().slice(0, count);
}

// Get top scores by difficulty
export function getTopScoresByDifficulty(difficulty: Difficulty, count: number = 10): LeaderboardEntry[] {
  return getLeaderboardByDifficulty(difficulty).slice(0, count);
}

// Get class top scores
export function getClassTopScores(count: number = 50): LeaderboardEntry[] {
  return getClassLeaderboard().slice(0, count);
}

// Clear class leaderboard (teacher function)
export function resetClassLeaderboard(): void {
  clearClassLeaderboard();
}

// Format score for display
export function formatScore(score: number): string {
  return score.toLocaleString();
}

// Format timestamp for display
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

// Get player's best score
export function getPersonalBest(): LeaderboardEntry | null {
  const leaderboard = getLeaderboard();
  return leaderboard.length > 0 ? leaderboard[0] : null;
}

// Get player's rank for a given score
export function getRankForScore(score: number): number {
  const leaderboard = getLeaderboard();
  let rank = 1;
  for (const entry of leaderboard) {
    if (score > entry.score) break;
    rank++;
  }
  return rank;
}

// Calculate score
export function calculateFinalScore(money: number, health: number): number {
  return money + (health * 50);
}

// Get performance message based on rank
export function getPerformanceMessage(rank: number, totalEntries: number): string {
  if (rank === 1) return "NEW HIGH SCORE!";
  if (rank <= 3) return "Top 3 finish!";
  if (rank <= 10) return "Top 10!";
  if (totalEntries > 10 && rank <= totalEntries * 0.25) return "Top 25%!";
  if (totalEntries > 20 && rank <= totalEntries * 0.5) return "Top half!";
  return "Keep practicing!";
}
