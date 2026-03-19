// Achievement system for Zombie Insurance Simulator

import { Achievement, GameStats, UnlockedAchievement, GameState } from '@/types/game';
import { getStats, saveAchievement, isAchievementUnlocked } from './storage';

export const ACHIEVEMENTS: Achievement[] = [
  // Survival Achievements
  {
    id: 'first-survivor',
    name: 'First Survivor',
    description: 'Complete your first game',
    category: 'survival',
    rarity: 'bronze',
    isSecret: false,
    checkCondition: (stats) => stats.gamesPlayed >= 1
  },
  {
    id: 'iron-will',
    name: 'Iron Will',
    description: 'Win with less than 20 health remaining',
    category: 'survival',
    rarity: 'gold',
    isSecret: false,
    checkCondition: () => false // Checked during game
  },
  {
    id: 'wealthy-survivor',
    name: 'Wealthy Survivor',
    description: 'End a winning game with $20,000 or more',
    category: 'survival',
    rarity: 'silver',
    isSecret: false,
    checkCondition: () => false // Checked during game
  },
  {
    id: 'perfect-health',
    name: 'Perfect Health',
    description: 'Win a game with 100 health or more',
    category: 'survival',
    rarity: 'gold',
    isSecret: false,
    checkCondition: (stats) => stats.perfectHealthWins >= 1
  },
  {
    id: 'untouchable',
    name: 'Untouchable',
    description: 'Win with $15,000+ AND 80+ health',
    category: 'survival',
    rarity: 'platinum',
    isSecret: false,
    checkCondition: () => false // Checked during game
  },

  // Strategy Achievements
  {
    id: 'risk-taker',
    name: 'Risk Taker',
    description: 'Win a game without ever buying insurance',
    category: 'strategy',
    rarity: 'platinum',
    isSecret: false,
    checkCondition: (stats) => stats.noInsuranceWins >= 1
  },
  {
    id: 'full-coverage',
    name: 'Full Coverage',
    description: 'Buy all 4 premium insurances in one round',
    category: 'strategy',
    rarity: 'silver',
    isSecret: false,
    checkCondition: () => false // Checked during game
  },
  {
    id: 'budget-master',
    name: 'Budget Master',
    description: 'Win spending less than $3,000 total on insurance',
    category: 'strategy',
    rarity: 'gold',
    isSecret: false,
    checkCondition: () => false // Checked during game
  },
  {
    id: 'smart-shopper',
    name: 'Smart Shopper',
    description: 'Win using only Basic tier insurance',
    category: 'strategy',
    rarity: 'silver',
    isSecret: false,
    checkCondition: () => false // Checked during game
  },
  {
    id: 'insurance-expert',
    name: 'Insurance Expert',
    description: 'Use every insurance category at least once in a game',
    category: 'strategy',
    rarity: 'bronze',
    isSecret: false,
    checkCondition: () => false // Checked during game
  },

  // Challenge Achievements
  {
    id: 'speed-runner',
    name: 'Speed Runner',
    description: 'Win a game in under 5 minutes',
    category: 'challenge',
    rarity: 'silver',
    isSecret: false,
    checkCondition: () => false // Checked during game
  },
  {
    id: 'hard-mode-hero',
    name: 'Hard Mode Hero',
    description: 'Beat the game on Hard difficulty',
    category: 'challenge',
    rarity: 'gold',
    isSecret: false,
    checkCondition: (stats) => stats.difficultiesBeaten.includes('hard')
  },
  {
    id: 'streak-master',
    name: 'Streak Master',
    description: 'Survive 5 consecutive rounds without taking damage',
    category: 'challenge',
    rarity: 'gold',
    isSecret: false,
    checkCondition: () => false // Checked during game
  },
  {
    id: 'lucky-dog',
    name: 'Lucky Dog',
    description: 'Avoid 3 incidents without matching insurance',
    category: 'challenge',
    rarity: 'silver',
    isSecret: false,
    checkCondition: () => false // Checked during game
  },
  {
    id: 'comeback-kid',
    name: 'Comeback Kid',
    description: 'Win after dropping below $1,000',
    category: 'challenge',
    rarity: 'gold',
    isSecret: false,
    checkCondition: () => false // Checked during game
  },
  {
    id: 'veteran',
    name: 'Veteran',
    description: 'Play 10 games',
    category: 'challenge',
    rarity: 'bronze',
    isSecret: false,
    checkCondition: (stats) => stats.gamesPlayed >= 10
  },
  {
    id: 'dedicated',
    name: 'Dedicated',
    description: 'Play 25 games',
    category: 'challenge',
    rarity: 'silver',
    isSecret: false,
    checkCondition: (stats) => stats.gamesPlayed >= 25
  },
  {
    id: 'winning-streak',
    name: 'Winning Streak',
    description: 'Win 3 games in a row',
    category: 'challenge',
    rarity: 'gold',
    isSecret: false,
    checkCondition: (stats) => stats.longestStreak >= 3
  },

  // Secret Achievements
  {
    id: 'perfect-balance',
    name: '???',
    description: 'Win with exactly $10,000',
    category: 'secret',
    rarity: 'platinum',
    isSecret: true,
    checkCondition: () => false // Checked during game
  },
  {
    id: 'variety-pack',
    name: '???',
    description: 'Never buy the same insurance twice in a game',
    category: 'secret',
    rarity: 'gold',
    isSecret: true,
    checkCondition: () => false // Checked during game
  },
  {
    id: 'clutch-survival',
    name: '???',
    description: 'Win with exactly 1 health remaining',
    category: 'secret',
    rarity: 'platinum',
    isSecret: true,
    checkCondition: () => false // Checked during game
  }
];

// Check and unlock achievements based on current game state
export function checkGameEndAchievements(
  won: boolean,
  money: number,
  health: number,
  totalInsuranceSpent: number,
  gameTime: number,
  difficulty: string,
  lowestMoney: number,
  wavesWithoutDamage: number,
  luckyDodges: number,
  usedInsuranceTypes: Set<string>,
  usedOnlyBasic: boolean,
  fullCoverageRounds: number,
  neverRepeatedInsurance: boolean
): string[] {
  const newAchievements: string[] = [];
  const stats = getStats();

  // First Survivor
  if (!isAchievementUnlocked('first-survivor')) {
    saveAchievement({ id: 'first-survivor', unlockedAt: Date.now(), gameStats: {} });
    newAchievements.push('first-survivor');
  }

  if (won) {
    // Iron Will - win with < 20 health
    if (health < 20 && health > 0 && !isAchievementUnlocked('iron-will')) {
      saveAchievement({ id: 'iron-will', unlockedAt: Date.now(), gameStats: { lowestHealthReached: health } });
      newAchievements.push('iron-will');
    }

    // Wealthy Survivor - win with $20k+
    if (money >= 20000 && !isAchievementUnlocked('wealthy-survivor')) {
      saveAchievement({ id: 'wealthy-survivor', unlockedAt: Date.now(), gameStats: { totalMoneyEarned: money } });
      newAchievements.push('wealthy-survivor');
    }

    // Perfect Health - win with 100+ health
    if (health >= 100 && !isAchievementUnlocked('perfect-health')) {
      saveAchievement({ id: 'perfect-health', unlockedAt: Date.now(), gameStats: { lowestHealthReached: health } });
      newAchievements.push('perfect-health');
    }

    // Untouchable - win with $15k+ AND 80+ health
    if (money >= 15000 && health >= 80 && !isAchievementUnlocked('untouchable')) {
      saveAchievement({ id: 'untouchable', unlockedAt: Date.now(), gameStats: { totalMoneyEarned: money, lowestHealthReached: health } });
      newAchievements.push('untouchable');
    }

    // Risk Taker - win without buying insurance
    if (totalInsuranceSpent === 0 && !isAchievementUnlocked('risk-taker')) {
      saveAchievement({ id: 'risk-taker', unlockedAt: Date.now(), gameStats: {} });
      newAchievements.push('risk-taker');
    }

    // Budget Master - win spending less than $3k on insurance
    if (totalInsuranceSpent < 3000 && !isAchievementUnlocked('budget-master')) {
      saveAchievement({ id: 'budget-master', unlockedAt: Date.now(), gameStats: { totalMoneySpentOnInsurance: totalInsuranceSpent } });
      newAchievements.push('budget-master');
    }

    // Smart Shopper - only basic tier
    if (usedOnlyBasic && totalInsuranceSpent > 0 && !isAchievementUnlocked('smart-shopper')) {
      saveAchievement({ id: 'smart-shopper', unlockedAt: Date.now(), gameStats: {} });
      newAchievements.push('smart-shopper');
    }

    // Speed Runner - win in under 5 minutes
    if (gameTime < 300000 && !isAchievementUnlocked('speed-runner')) {
      saveAchievement({ id: 'speed-runner', unlockedAt: Date.now(), gameStats: { timePlayed: gameTime } });
      newAchievements.push('speed-runner');
    }

    // Hard Mode Hero
    if (difficulty === 'hard' && !isAchievementUnlocked('hard-mode-hero')) {
      saveAchievement({ id: 'hard-mode-hero', unlockedAt: Date.now(), gameStats: {} });
      newAchievements.push('hard-mode-hero');
    }

    // Comeback Kid - dropped below $1k
    if (lowestMoney < 1000 && !isAchievementUnlocked('comeback-kid')) {
      saveAchievement({ id: 'comeback-kid', unlockedAt: Date.now(), gameStats: { lowestMoneyReached: lowestMoney } });
      newAchievements.push('comeback-kid');
    }

    // Perfect Balance - exactly $10k
    if (money === 10000 && !isAchievementUnlocked('perfect-balance')) {
      saveAchievement({ id: 'perfect-balance', unlockedAt: Date.now(), gameStats: { totalMoneyEarned: money } });
      newAchievements.push('perfect-balance');
    }

    // Clutch Survival - exactly 1 health
    if (health === 1 && !isAchievementUnlocked('clutch-survival')) {
      saveAchievement({ id: 'clutch-survival', unlockedAt: Date.now(), gameStats: { lowestHealthReached: health } });
      newAchievements.push('clutch-survival');
    }

    // Variety Pack - never same insurance twice
    if (neverRepeatedInsurance && totalInsuranceSpent > 0 && !isAchievementUnlocked('variety-pack')) {
      saveAchievement({ id: 'variety-pack', unlockedAt: Date.now(), gameStats: {} });
      newAchievements.push('variety-pack');
    }
  }

  // Insurance Expert - used all categories
  if (usedInsuranceTypes.size >= 4 && !isAchievementUnlocked('insurance-expert')) {
    saveAchievement({ id: 'insurance-expert', unlockedAt: Date.now(), gameStats: {} });
    newAchievements.push('insurance-expert');
  }

  // Full Coverage - bought all 4 premium in one round
  if (fullCoverageRounds > 0 && !isAchievementUnlocked('full-coverage')) {
    saveAchievement({ id: 'full-coverage', unlockedAt: Date.now(), gameStats: {} });
    newAchievements.push('full-coverage');
  }

  // Streak Master - 5 rounds without damage
  if (wavesWithoutDamage >= 5 && !isAchievementUnlocked('streak-master')) {
    saveAchievement({ id: 'streak-master', unlockedAt: Date.now(), gameStats: { wavesWithoutDamage } });
    newAchievements.push('streak-master');
  }

  // Lucky Dog - 3 lucky dodges
  if (luckyDodges >= 3 && !isAchievementUnlocked('lucky-dog')) {
    saveAchievement({ id: 'lucky-dog', unlockedAt: Date.now(), gameStats: {} });
    newAchievements.push('lucky-dog');
  }

  // Veteran - 10 games
  if (stats.gamesPlayed >= 9 && !isAchievementUnlocked('veteran')) { // 9 because current game hasn't been counted yet
    saveAchievement({ id: 'veteran', unlockedAt: Date.now(), gameStats: {} });
    newAchievements.push('veteran');
  }

  // Dedicated - 25 games
  if (stats.gamesPlayed >= 24 && !isAchievementUnlocked('dedicated')) {
    saveAchievement({ id: 'dedicated', unlockedAt: Date.now(), gameStats: {} });
    newAchievements.push('dedicated');
  }

  // Winning Streak - 3 in a row
  if (won && stats.currentStreak >= 2 && !isAchievementUnlocked('winning-streak')) {
    saveAchievement({ id: 'winning-streak', unlockedAt: Date.now(), gameStats: {} });
    newAchievements.push('winning-streak');
  }

  return newAchievements;
}

// Get achievement by ID
export function getAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.id === id);
}

// Get achievement display info (handles secret achievements)
export function getAchievementDisplay(id: string, unlocked: boolean): { name: string; description: string } {
  const achievement = getAchievement(id);
  if (!achievement) return { name: 'Unknown', description: 'Unknown achievement' };

  if (achievement.isSecret && !unlocked) {
    return { name: '???', description: 'Secret achievement - keep playing to discover!' };
  }

  return { name: achievement.name, description: achievement.description };
}

// Get rarity color
export function getRarityColor(rarity: Achievement['rarity']): string {
  switch (rarity) {
    case 'bronze': return 'text-amber-600';
    case 'silver': return 'text-gray-300';
    case 'gold': return 'text-yellow-400';
    case 'platinum': return 'text-cyan-300';
  }
}

export function getRarityBgColor(rarity: Achievement['rarity']): string {
  switch (rarity) {
    case 'bronze': return 'bg-amber-600/20 border-amber-600';
    case 'silver': return 'bg-gray-300/20 border-gray-300';
    case 'gold': return 'bg-yellow-400/20 border-yellow-400';
    case 'platinum': return 'bg-cyan-300/20 border-cyan-300';
  }
}
