// Game constants for Zombie Insurance Simulator

import { Insurance, Scenario, RandomEvent, Character } from '@/types/game';

export const INSURANCE_OPTIONS: Insurance[] = [
  // Home Fortification Tiers
  {
    id: 'home-basic',
    name: "Basic Home Fortification",
    tier: 'Basic',
    cost: 300,
    deductible: 200,
    description: "Basic protection against zombie break-ins",
    coverageDescription: "Covers 50% of damages after deductible",
    uninsuredLoss: { money: 1500, health: 10 },
    coverage: 50,
    category: 'Home Fortification'
  },
  {
    id: 'home-standard',
    name: "Standard Home Fortification",
    tier: 'Standard',
    cost: 500,
    deductible: 150,
    description: "Enhanced protection with reinforced barriers",
    coverageDescription: "Covers 75% of damages after deductible",
    uninsuredLoss: { money: 1500, health: 10 },
    coverage: 75,
    category: 'Home Fortification'
  },
  {
    id: 'home-premium',
    name: "Premium Home Fortification",
    tier: 'Premium',
    cost: 800,
    deductible: 100,
    description: "Military-grade fortification system",
    coverageDescription: "Covers 90% of damages after deductible",
    uninsuredLoss: { money: 1500, health: 10 },
    coverage: 90,
    category: 'Home Fortification'
  },
  // Medical Insurance Tiers
  {
    id: 'medical-basic',
    name: "Basic Zombie Bite Treatment",
    tier: 'Basic',
    cost: 200,
    deductible: 100,
    description: "Basic medical coverage for zombie-related injuries",
    coverageDescription: "Covers 50% of medical costs after deductible",
    uninsuredLoss: { money: 1000, health: 20 },
    coverage: 50,
    category: 'Zombie Bite Treatment'
  },
  {
    id: 'medical-standard',
    name: "Standard Zombie Bite Treatment",
    tier: 'Standard',
    cost: 400,
    deductible: 75,
    description: "Enhanced medical coverage with better treatments",
    coverageDescription: "Covers 75% of medical costs after deductible",
    uninsuredLoss: { money: 1000, health: 20 },
    coverage: 75,
    category: 'Zombie Bite Treatment'
  },
  {
    id: 'medical-premium',
    name: "Premium Zombie Bite Treatment",
    tier: 'Premium',
    cost: 600,
    deductible: 50,
    description: "Top-tier medical coverage with experimental treatments",
    coverageDescription: "Covers 90% of medical costs after deductible",
    uninsuredLoss: { money: 1000, health: 20 },
    coverage: 90,
    category: 'Zombie Bite Treatment'
  },
  // Supply Protection Tiers
  {
    id: 'supply-basic',
    name: "Basic Supply Protection",
    tier: 'Basic',
    cost: 400,
    deductible: 300,
    description: "Basic coverage for supply losses",
    coverageDescription: "Covers 50% of supply losses after deductible",
    uninsuredLoss: { money: 2000, health: 15 },
    coverage: 50,
    category: 'Supply Protection'
  },
  {
    id: 'supply-standard',
    name: "Standard Supply Protection",
    tier: 'Standard',
    cost: 600,
    deductible: 200,
    description: "Enhanced coverage with security systems",
    coverageDescription: "Covers 75% of supply losses after deductible",
    uninsuredLoss: { money: 2000, health: 15 },
    coverage: 75,
    category: 'Supply Protection'
  },
  {
    id: 'supply-premium',
    name: "Premium Supply Protection",
    tier: 'Premium',
    cost: 900,
    deductible: 100,
    description: "Maximum security for your supplies",
    coverageDescription: "Covers 90% of supply losses after deductible",
    uninsuredLoss: { money: 2000, health: 15 },
    coverage: 90,
    category: 'Supply Protection'
  },
  // Evacuation Insurance Tiers
  {
    id: 'evac-basic',
    name: "Basic Evacuation Coverage",
    tier: 'Basic',
    cost: 500,
    deductible: 250,
    description: "Basic evacuation assistance",
    coverageDescription: "Covers 50% of evacuation costs after deductible",
    uninsuredLoss: { money: 2500, health: 25 },
    coverage: 50,
    category: 'Evacuation Coverage'
  },
  {
    id: 'evac-standard',
    name: "Standard Evacuation Coverage",
    tier: 'Standard',
    cost: 800,
    deductible: 175,
    description: "Enhanced evacuation with better transport",
    coverageDescription: "Covers 75% of evacuation costs after deductible",
    uninsuredLoss: { money: 2500, health: 25 },
    coverage: 75,
    category: 'Evacuation Coverage'
  },
  {
    id: 'evac-premium',
    name: "Premium Evacuation Coverage",
    tier: 'Premium',
    cost: 1200,
    deductible: 100,
    description: "VIP evacuation with helicopter transport",
    coverageDescription: "Covers 90% of evacuation costs after deductible",
    uninsuredLoss: { money: 2500, health: 25 },
    coverage: 90,
    category: 'Evacuation Coverage'
  }
];

export const SCENARIOS: Scenario[] = [
  {
    type: "Home Attack",
    description: "A horde of zombies is attempting to break into your safehouse!",
    requiredInsurance: "Home Fortification",
    probability: 0.25
  },
  {
    type: "Injury",
    description: "One of your group members has been bitten during a supply run!",
    requiredInsurance: "Zombie Bite Treatment",
    probability: 0.20
  },
  {
    type: "Supply Loss",
    description: "Your supply cache has been discovered by raiders!",
    requiredInsurance: "Supply Protection",
    probability: 0.25
  },
  {
    type: "Evacuation",
    description: "The safe zone has been compromised! Everyone must evacuate immediately!",
    requiredInsurance: "Evacuation Coverage",
    probability: 0.15
  },
  {
    type: "Safe",
    description: "A quiet day... no incidents reported. Your defenses held strong!",
    requiredInsurance: "",
    probability: 0.15
  }
];

export const RANDOM_EVENTS: RandomEvent[] = [
  // Positive events (40%)
  {
    id: 'govt-bailout',
    name: "Government Bailout",
    description: "The government is providing emergency funds to survivors!",
    type: 'positive',
    effect: { money: 750 },
    emoji: "🏛️"
  },
  {
    id: 'insurance-rebate',
    name: "Insurance Rebate",
    description: "Your insurance company is offering rebates this round!",
    type: 'positive',
    effect: { insuranceDiscount: 25 },
    emoji: "💰"
  },
  {
    id: 'medical-breakthrough',
    name: "Medical Breakthrough",
    description: "Scientists discovered a health-boosting treatment!",
    type: 'positive',
    effect: { health: 10 },
    emoji: "🧬"
  },
  {
    id: 'lucky-find',
    name: "Lucky Find",
    description: "You found valuable supplies while scavenging!",
    type: 'positive',
    effect: { money: 400 },
    emoji: "🎁"
  },
  {
    id: 'insurance-sale',
    name: "Insurance Flash Sale",
    description: "All insurance policies are 30% off this round!",
    type: 'positive',
    effect: { insuranceDiscount: 30 },
    emoji: "🏷️"
  },
  // Negative events (30%)
  {
    id: 'premium-hike',
    name: "Premium Hike",
    description: "Insurance companies raised prices due to increased zombie activity!",
    type: 'negative',
    effect: { insurancePriceIncrease: 20 },
    emoji: "📈"
  },
  {
    id: 'equipment-failure',
    name: "Equipment Failure",
    description: "Some of your equipment broke down and needs repairs.",
    type: 'negative',
    effect: { money: -350 },
    emoji: "🔧"
  },
  {
    id: 'minor-injury',
    name: "Minor Injury",
    description: "Someone in your group got hurt in a minor accident.",
    type: 'negative',
    effect: { health: -5 },
    emoji: "🤕"
  },
  {
    id: 'rat-infestation',
    name: "Rat Infestation",
    description: "Rats got into your food supplies!",
    type: 'negative',
    effect: { money: -200 },
    emoji: "🐀"
  },
  // Neutral/Strategic events (30%)
  {
    id: 'supply-trader',
    name: "Traveling Trader",
    description: "A trader offers to buy or sell supplies. You gain some cash.",
    type: 'neutral',
    effect: { money: 300 },
    emoji: "🧑‍💼"
  },
  {
    id: 'refugee-group',
    name: "Refugee Group",
    description: "Refugees join your group! More hands to work, more mouths to feed.",
    type: 'neutral',
    effect: { money: 200, health: -3 },
    emoji: "👥"
  },
  {
    id: 'weather-clear',
    name: "Clear Weather",
    description: "Perfect weather for supply runs! Extra earnings this round.",
    type: 'neutral',
    effect: { money: 250 },
    emoji: "☀️"
  }
];

export const CHARACTERS: Character[] = [
  {
    id: 'survivor',
    name: "Default Survivor",
    description: "A regular person trying to survive the apocalypse.",
    emoji: "🧑",
    bonus: { type: 'money', value: 0 },
    unlockRequirement: 'default'
  },
  {
    id: 'insurance-agent',
    name: "Insurance Agent",
    description: "Knows the industry inside out. 5% discount on all insurance!",
    emoji: "🧑‍💼",
    bonus: { type: 'insurance_discount', value: 5 },
    unlockRequirement: 'win_5_games'
  },
  {
    id: 'prepper',
    name: "Doomsday Prepper",
    description: "Always prepared for the worst. Start with +$500!",
    emoji: "🎒",
    bonus: { type: 'money', value: 500 },
    unlockRequirement: 'achievement_risk_taker'
  },
  {
    id: 'medic',
    name: "Field Medic",
    description: "Trained in emergency medicine. Start with +10 health!",
    emoji: "👨‍⚕️",
    bonus: { type: 'health', value: 10 },
    unlockRequirement: 'achievement_perfect_health'
  },
  {
    id: 'lucky-lou',
    name: "Lucky Lou",
    description: "Some people are just born lucky. +5% safe round chance!",
    emoji: "🍀",
    bonus: { type: 'safe_round_chance', value: 5 },
    unlockRequirement: 'win_10_games'
  }
];

// Wave scaling for damage (learning period early game)
export const WAVE_DAMAGE_SCALING: Record<number, number> = {
  1: 0.6, 2: 0.6, 3: 0.7, 4: 0.7, 5: 0.8,
  6: 0.85, 7: 0.9, 8: 0.95, 9: 1.0, 10: 1.0,
  11: 1.05, 12: 1.05, 13: 1.1, 14: 1.1, 15: 1.15,
  16: 1.15, 17: 1.2, 18: 1.2, 19: 1.25, 20: 1.25,
  21: 1.3, 22: 1.3, 23: 1.35, 24: 1.35, 25: 1.4
};

// Performance ratings
export const PERFORMANCE_RATINGS = [
  { minScore: 30000, title: "Insurance Master", emoji: "👑" },
  { minScore: 25000, title: "Risk Management Expert", emoji: "🏆" },
  { minScore: 20000, title: "Insurance Professional", emoji: "🥇" },
  { minScore: 15000, title: "Risk Manager", emoji: "🥈" },
  { minScore: 10000, title: "Insurance Apprentice", emoji: "🥉" },
  { minScore: 0, title: "Zombie Bait", emoji: "💀" }
];

// Random event chance per wave
export const RANDOM_EVENT_CHANCE = 0.25;

// ═══════════════════════════
// REDUCE OPTIONS (Feature 1)
// ═══════════════════════════

export interface ReduceOption {
  id: string;
  name: string;
  description: string;
  cost: number;
  damageReduction: number;
  healthReduction: number;
  category: string;
}

export const REDUCE_OPTIONS: ReduceOption[] = [
  { id: 'board-windows', name: 'Board Up Windows', description: 'Reinforce safehouse entrances', cost: 400, damageReduction: 0.35, healthReduction: 0.35, category: 'Home Fortification' },
  { id: 'first-aid', name: 'First Aid Training', description: 'Learn basic wound treatment', cost: 250, damageReduction: 0.30, healthReduction: 0.40, category: 'Zombie Bite Treatment' },
  { id: 'hide-supplies', name: 'Hide Supply Caches', description: 'Spread supplies across locations', cost: 350, damageReduction: 0.35, healthReduction: 0.30, category: 'Supply Protection' },
  { id: 'escape-routes', name: 'Map Escape Routes', description: 'Scout evacuation paths', cost: 450, damageReduction: 0.30, healthReduction: 0.35, category: 'Evacuation Coverage' },
];

// ═══════════════════════════
// REAL WORLD CONNECTIONS (Feature 3)
// ═══════════════════════════

export const REAL_WORLD_CONNECTIONS: Record<string, {
  title: string;
  realWorldType: string;
  example: string;
  funFact: string;
}> = {
  'Home Attack': {
    title: 'Homeowner\'s Insurance',
    realWorldType: 'Homeowner\'s / Renter\'s Insurance',
    example: 'Covers damage from fires, storms, theft, and vandalism to your home.',
    funFact: 'About 95% of homeowners in the US have homeowner\'s insurance!'
  },
  'Injury': {
    title: 'Health Insurance',
    realWorldType: 'Health Insurance',
    example: 'Covers doctor visits, hospital stays, prescriptions, and surgeries.',
    funFact: 'A single ER visit can cost over $2,000 without insurance.'
  },
  'Supply Loss': {
    title: 'Property Insurance',
    realWorldType: 'Property / Business Insurance',
    example: 'Protects businesses from theft, inventory damage, and equipment breakdown.',
    funFact: 'Small businesses without insurance often close after a major loss.'
  },
  'Evacuation': {
    title: 'Auto & Travel Insurance',
    realWorldType: 'Auto / Travel Insurance',
    example: 'Covers car accidents, trip cancellations, and emergency costs while traveling.',
    funFact: 'Auto insurance is legally required in almost every US state.'
  },
  'Safe': {
    title: 'The Cost of Peace of Mind',
    realWorldType: 'All Insurance Types',
    example: 'Not every month brings a disaster, but you still pay premiums. That\'s how insurance pools risk across many people.',
    funFact: 'Insurance companies use premiums from many customers to pay claims for a few.'
  }
};

// ═══════════════════════════
// REFLECTION QUESTIONS (Feature 5)
// ═══════════════════════════

export const REFLECTION_QUESTIONS = [
  { id: 'strategy', question: 'What was your overall risk management strategy?' },
  { id: 'lesson', question: 'Which wave taught you the most about managing risk? Why?' },
  { id: 'realLife', question: 'How would you apply what you learned to real-life insurance decisions?' }
];
