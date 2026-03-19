// Core game types for Zombie Insurance Simulator

export type Difficulty = 'easy' | 'medium' | 'hard';
export type RiskStrategy = 'avoid' | 'reduce' | 'transfer' | 'retain';
export type InsuranceTier = 'Basic' | 'Standard' | 'Premium';
export type ScenarioType = 'Home Attack' | 'Injury' | 'Supply Loss' | 'Evacuation' | 'Safe';
export type PreOutcomeStage = 'horde' | 'scenario' | null;

export interface Insurance {
  id: string;
  name: string;
  tier: InsuranceTier;
  cost: number;
  deductible: number;
  description: string;
  coverageDescription: string;
  uninsuredLoss: {
    money: number;
    health: number;
  };
  coverage: number;
  category: string;
  unlockRequirement?: string;
}

export interface Scenario {
  type: ScenarioType;
  description: string;
  requiredInsurance: string;
  probability: number;
}

export interface Decision {
  wave: number;
  scenario: string;
  scenarioType: ScenarioType;
  insurancePurchased: string[];
  moneySpent: number;
  moneyLost: number;
  healthLost: number;
  outcome: string;
  hadInsurance: boolean;
  strategyUsed: RiskStrategy;
  reduceCost: number;
}

export interface RandomEvent {
  id: string;
  name: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral';
  effect: {
    money?: number;
    health?: number;
    insuranceDiscount?: number;
    insurancePriceIncrease?: number;
  };
  emoji: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'survival' | 'strategy' | 'challenge' | 'secret';
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum';
  isSecret: boolean;
  checkCondition: (stats: GameStats) => boolean;
}

export interface UnlockedAchievement {
  id: string;
  unlockedAt: number;
  gameStats: Partial<GameStats>;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  emoji: string;
  bonus: {
    type: 'money' | 'health' | 'insurance_discount' | 'safe_round_chance';
    value: number;
  };
  unlockRequirement: string;
}

export interface DifficultyPreset {
  name: string;
  label: string;
  description: string;
  startMoney: number;
  startHealth: number;
  waveCount: number;
  baseEarningsMultiplier: number;
  damageMultiplier: number;
  insuranceCostMultiplier: number;
  safeRoundChance: number;
}

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  totalMoneyEarned: number;
  totalMoneySpentOnInsurance: number;
  totalDamageAvoided: number;
  totalDamageTaken: number;
  highestScore: number;
  highestWave: number;
  perfectHealthWins: number;
  noInsuranceWins: number;
  currentStreak: number;
  longestStreak: number;
  insuranceTypesUsed: string[];
  difficultiesBeaten: Difficulty[];
  timePlayed: number;
  lowestMoneyReached: number;
  lowestHealthReached: number;
  wavesWithoutDamage: number;
  fullCoverageRounds: number;
}

export interface GameState {
  // Core game state
  wave: number;
  money: number;
  health: number;
  currentScenario: string;
  currentScenarioType: ScenarioType;
  feedback: string;
  isGameOver: boolean;
  isVictory: boolean;
  selectedInsurance: string[];
  decisionHistory: Decision[];

  // UI state
  showingOutcome: boolean;
  showingPreOutcome: boolean;
  preOutcomeStage: PreOutcomeStage;
  showStartScreen: boolean;
  showAchievements: boolean;
  showLeaderboard: boolean;
  showSettings: boolean;

  // Game configuration
  difficulty: Difficulty;
  character: string;
  playerName: string;

  // Random events
  currentRandomEvent: RandomEvent | null;
  insuranceDiscountThisRound: number;
  insurancePriceIncreaseThisRound: number;

  // Tracking for achievements
  gameStartTime: number;
  totalInsuranceSpent: number;
  wavesWithoutDamage: number;
  lowestMoney: number;
  lowestHealth: number;
  usedInsuranceTypes: Set<string>;
  fullCoverageRounds: number;
  luckyDodges: number;

  // Risk management strategy
  selectedStrategy: RiskStrategy;
  reduceOptionSelected: string | null;

  // Educational tracking
  allWaveBreakdowns: Array<{wave: number; breakdown: WaveBreakdown | null; strategy: RiskStrategy}>;
}

export interface WaveBreakdown {
  scenarioType: ScenarioType;
  baseDamageMoney: number;
  baseDamageHealth: number;
  insuranceTier: string | null;
  coveragePercent: number;
  premiumPaid: number;
  deductiblePaid: number;
  insurancePaidAmount: number;
  playerPaidDamage: number;
  totalPlayerCost: number;
  healthTaken: number;
  healthIfUninsured: number;
  moneyIfUninsured: number;
  moneySaved: number;
  healthSaved: number;
  earnings: number;
  isSafe: boolean;
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  score: number;
  money: number;
  health: number;
  wavesCompleted: number;
  difficulty: Difficulty;
  character: string;
  timestamp: number;
  achievementsEarned: string[];
}

export interface GameSettings {
  soundEnabled: boolean;
  soundVolume: number;
  musicEnabled: boolean;
  musicVolume: number;
  lastDifficulty: Difficulty;
  lastCharacter: string;
  playerName: string;
}
