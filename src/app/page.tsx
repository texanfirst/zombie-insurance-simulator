'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Decision, Difficulty, ScenarioType, RandomEvent, RiskStrategy, WaveBreakdown } from '@/types/game';
import { INSURANCE_OPTIONS, SCENARIOS, CHARACTERS, WAVE_DAMAGE_SCALING, PERFORMANCE_RATINGS, REDUCE_OPTIONS, REFLECTION_QUESTIONS } from '@/lib/constants';
import { DIFFICULTY_PRESETS, getDifficultyColor, getDifficultyBgColor } from '@/lib/difficulty';
import { getSettings, saveSettings, getStats, updateStatsAfterGame, isCharacterUnlocked, getUnlockedAchievements } from '@/lib/storage';
import { checkGameEndAchievements, ACHIEVEMENTS } from '@/lib/achievements';
import { rollForRandomEvent, applyRandomEvent } from '@/lib/randomEvents';
import { playSound, initAudio, isSoundEnabled } from '@/lib/audio';
import { createLeaderboardEntry, submitScore, submitClassScore, calculateFinalScore, formatScore, getPerformanceMessage, getTopScores } from '@/lib/leaderboard';

import { AchievementToastContainer } from '@/components/ui/AchievementToast';
import AchievementGallery from '@/components/ui/AchievementGallery';
import LeaderboardModal from '@/components/ui/LeaderboardModal';
import SettingsPanel from '@/components/ui/SettingsPanel';
import DifficultySelector from '@/components/ui/DifficultySelector';
import RandomEventBanner from '@/components/ui/RandomEventBanner';
import InstructionsModal from '@/components/ui/InstructionsModal';
import StrategySelector from '@/components/ui/StrategySelector';
import ThreatForecastComponent from '@/components/ui/ThreatForecast';
import RealWorldCard from '@/components/ui/RealWorldCard';
import ReportCard from '@/components/ui/ReportCard';
import { generateThreatForecast, ThreatForecast } from '@/lib/threatForecast';

export default function Home() {
  // Check for class mode via URL parameter
  const [isClassMode, setIsClassMode] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setIsClassMode(params.get('class') === 'true');
    }
  }, []);

  // Initialize state with consistent defaults (to avoid hydration mismatch)
  const [gameState, setGameState] = useState<GameState>({
    wave: 0,
    money: 10000,
    health: 100,
    currentScenario: '',
    currentScenarioType: 'Safe',
    feedback: '',
    isGameOver: false,
    isVictory: false,
    selectedInsurance: [],
    decisionHistory: [],
    showingOutcome: false,
    showingPreOutcome: false,
    preOutcomeStage: null,
    showStartScreen: true,
    showAchievements: false,
    showLeaderboard: false,
    showSettings: false,
    difficulty: 'medium',
    character: 'survivor',
    playerName: '',
    currentRandomEvent: null,
    insuranceDiscountThisRound: 0,
    insurancePriceIncreaseThisRound: 0,
    gameStartTime: 0,
    totalInsuranceSpent: 0,
    wavesWithoutDamage: 0,
    lowestMoney: 10000,
    lowestHealth: 100,
    usedInsuranceTypes: new Set(),
    fullCoverageRounds: 0,
    luckyDodges: 0,
    selectedStrategy: 'transfer' as RiskStrategy,
    reduceOptionSelected: null,
    allWaveBreakdowns: [],
  });

  // Load saved settings after mount (to avoid hydration mismatch)
  useEffect(() => {
    const settings = getSettings();
    setGameState(prev => ({
      ...prev,
      difficulty: settings.lastDifficulty,
      character: settings.lastCharacter,
      playerName: settings.playerName
    }));
  }, []);

  // Achievement toasts
  const [achievementToasts, setAchievementToasts] = useState<string[]>([]);

  // Leaderboard result after game
  const [leaderboardRank, setLeaderboardRank] = useState<number | null>(null);

  // Random event effect message
  const [eventEffectMessage, setEventEffectMessage] = useState('');

  // Wave breakdown for outcome screen
  const [waveBreakdown, setWaveBreakdown] = useState<WaveBreakdown | null>(null);

  // Instructions modal
  const [showInstructions, setShowInstructions] = useState(false);

  // Expanded insurance card info
  const [expandedInsuranceId, setExpandedInsuranceId] = useState<string | null>(null);

  // Threat forecast
  const [threatForecast, setThreatForecast] = useState<ThreatForecast | null>(null);

  // Reflection answers (Feature 5)
  const [reflectionAnswers, setReflectionAnswers] = useState<Record<string, string>>({});

  // Ref for game over screen capture
  const gameOverRef = useRef<HTMLDivElement>(null);

  // Save results as PNG
  const saveResultsAsPng = async () => {
    if (!gameOverRef.current) return;

    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(gameOverRef.current, {
        backgroundColor: '#0a0a0a',
        pixelRatio: 2,
        style: {
          transform: 'none',
          animation: 'none',
        }
      });

      const link = document.createElement('a');
      const date = new Date().toISOString().slice(0, 10);
      link.download = `zombie-insurance-results-${date}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to save screenshot:', err);
    }
  };

  // Show instructions on first visit
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSeenInstructions = localStorage.getItem('zis-seen-instructions');
      if (!hasSeenInstructions) {
        setShowInstructions(true);
        localStorage.setItem('zis-seen-instructions', 'true');
      }
    }
  }, []);

  // Initialize audio on first interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      initAudio();
      document.removeEventListener('click', handleFirstInteraction);
    };
    document.addEventListener('click', handleFirstInteraction);
    return () => document.removeEventListener('click', handleFirstInteraction);
  }, []);

  // Get difficulty preset
  const difficultyPreset = DIFFICULTY_PRESETS[gameState.difficulty];

  // Calculate insurance cost with modifiers
  const calculateInsuranceCost = useCallback((selectedInsurance: string[]) => {
    const characterBonus = CHARACTERS.find(c => c.id === gameState.character);
    const characterDiscount = characterBonus?.bonus.type === 'insurance_discount' ? characterBonus.bonus.value : 0;

    return selectedInsurance.reduce((total, name) => {
      const insurance = INSURANCE_OPTIONS.find(i => i.name === name);
      if (!insurance) return total;

      let cost = insurance.cost * difficultyPreset.insuranceCostMultiplier;
      cost *= (1 - gameState.insuranceDiscountThisRound / 100);
      cost *= (1 + gameState.insurancePriceIncreaseThisRound / 100);
      cost *= (1 - characterDiscount / 100);

      return total + Math.round(cost);
    }, 0);
  }, [gameState.character, gameState.insuranceDiscountThisRound, gameState.insurancePriceIncreaseThisRound, difficultyPreset.insuranceCostMultiplier]);

  // Start game
  const startGame = () => {
    playSound('click');

    const preset = DIFFICULTY_PRESETS[gameState.difficulty];
    const character = CHARACTERS.find(c => c.id === gameState.character);

    let startMoney = preset.startMoney;
    let startHealth = preset.startHealth;

    // Apply character bonuses
    if (character) {
      if (character.bonus.type === 'money') startMoney += character.bonus.value;
      if (character.bonus.type === 'health') startHealth += character.bonus.value;
    }

    // Roll for first random event
    const randomEvent = rollForRandomEvent(1);
    let eventMessage = '';

    if (randomEvent) {
      const result = applyRandomEvent(randomEvent, { money: startMoney, health: startHealth });
      startMoney = result.money;
      startHealth = result.health;
      eventMessage = result.message;
      setEventEffectMessage(eventMessage);
    }

    // Save settings
    saveSettings({
      lastDifficulty: gameState.difficulty,
      lastCharacter: gameState.character,
      playerName: gameState.playerName
    });

    setGameState(prev => ({
      ...prev,
      wave: 1,
      money: startMoney,
      health: startHealth,
      currentScenario: '',
      currentScenarioType: 'Safe',
      feedback: '',
      isGameOver: false,
      isVictory: false,
      selectedInsurance: [],
      decisionHistory: [],
      showingOutcome: false,
      showingPreOutcome: false,
      preOutcomeStage: null,
      showStartScreen: false,
      currentRandomEvent: randomEvent,
      insuranceDiscountThisRound: randomEvent?.effect.insuranceDiscount || 0,
      insurancePriceIncreaseThisRound: randomEvent?.effect.insurancePriceIncrease || 0,
      gameStartTime: Date.now(),
      totalInsuranceSpent: 0,
      wavesWithoutDamage: 0,
      lowestMoney: startMoney,
      lowestHealth: startHealth,
      usedInsuranceTypes: new Set(),
      fullCoverageRounds: 0,
      luckyDodges: 0,
      selectedStrategy: 'transfer',
      reduceOptionSelected: null,
      allWaveBreakdowns: [],
    }));

    setLeaderboardRank(null);
    setReflectionAnswers({});
    setThreatForecast(generateThreatForecast(1, gameState.difficulty));
  };

  // Toggle insurance selection
  const toggleInsurance = (insuranceName: string) => {
    playSound('click');

    const baseType = insuranceName.split(' ').slice(1).join(' ');

    setGameState(prev => {
      if (prev.selectedInsurance.includes(insuranceName)) {
        playSound('cancel');
        return {
          ...prev,
          selectedInsurance: prev.selectedInsurance.filter(name => name !== insuranceName)
        };
      }

      playSound('purchase');
      const filteredInsurance = prev.selectedInsurance.filter(name =>
        !name.split(' ').slice(1).join(' ').includes(baseType)
      );

      return {
        ...prev,
        selectedInsurance: [...filteredInsurance, insuranceName]
      };
    });
  };

  // Handle next wave
  const handleNextWave = () => {
    playSound('wave-start');

    const strategy = gameState.selectedStrategy;

    // ── AVOID STRATEGY ──
    if (strategy === 'avoid') {
      const avoidBreakdown: WaveBreakdown = {
        scenarioType: 'Safe', baseDamageMoney: 0, baseDamageHealth: 0,
        insuranceTier: null, coveragePercent: 0, premiumPaid: 0, deductiblePaid: 0,
        insurancePaidAmount: 0, playerPaidDamage: 0, totalPlayerCost: 0,
        healthTaken: 0, healthIfUninsured: 0, moneyIfUninsured: 0,
        moneySaved: 0, healthSaved: 0, earnings: 0, isSafe: true
      };
      setWaveBreakdown(avoidBreakdown);

      const decision: Decision = {
        wave: gameState.wave,
        scenario: 'Avoided this wave - no income, no damage.',
        scenarioType: 'Safe',
        insurancePurchased: [],
        moneySpent: 0,
        moneyLost: 0,
        healthLost: 0,
        outcome: 'You played it safe. No income earned, but no damage taken.',
        hadInsurance: false,
        strategyUsed: 'avoid',
        reduceCost: 0,
      };

      const isGameOver = gameState.wave >= difficultyPreset.waveCount;
      const isVictory = isGameOver && gameState.health > 0 && gameState.money > 0;

      setGameState(prev => ({
        ...prev,
        wave: prev.wave + 1,
        currentScenario: 'Avoided this wave - no income, no damage.',
        currentScenarioType: 'Safe',
        feedback: 'You played it safe. No income earned, but no damage taken.',
        isGameOver,
        isVictory,
        decisionHistory: [...prev.decisionHistory, decision],
        showingPreOutcome: false,
        showingOutcome: true,
        preOutcomeStage: null,
        allWaveBreakdowns: [...prev.allWaveBreakdowns, { wave: prev.wave, breakdown: avoidBreakdown, strategy: 'avoid' }],
      }));
      return;
    }

    // ── REDUCE STRATEGY ──
    const reduceOption = strategy === 'reduce' && gameState.reduceOptionSelected
      ? REDUCE_OPTIONS.find(r => r.id === gameState.reduceOptionSelected)
      : null;
    const reduceCost = reduceOption ? Math.round(reduceOption.cost * difficultyPreset.insuranceCostMultiplier) : 0;

    const insuranceCost = strategy === 'transfer' ? calculateInsuranceCost(gameState.selectedInsurance) : 0;

    // Check for full coverage
    const hasPremiumHome = gameState.selectedInsurance.some(i => i.includes('Premium Home'));
    const hasPremiumMedical = gameState.selectedInsurance.some(i => i.includes('Premium Zombie Bite'));
    const hasPremiumSupply = gameState.selectedInsurance.some(i => i.includes('Premium Supply'));
    const hasPremiumEvac = gameState.selectedInsurance.some(i => i.includes('Premium Evacuation'));
    const hasFullCoverage = strategy === 'transfer' && hasPremiumHome && hasPremiumMedical && hasPremiumSupply && hasPremiumEvac;

    // Track insurance types used
    const newUsedTypes = new Set(gameState.usedInsuranceTypes);
    if (strategy === 'transfer') {
      gameState.selectedInsurance.forEach(name => {
        const insurance = INSURANCE_OPTIONS.find(i => i.name === name);
        if (insurance) newUsedTypes.add(insurance.category);
      });
    }

    // Roll for scenario with character bonus
    const characterBonus = CHARACTERS.find(c => c.id === gameState.character);
    const safeRoundBonus = characterBonus?.bonus.type === 'safe_round_chance' ? characterBonus.bonus.value / 100 : 0;
    const adjustedSafeChance = difficultyPreset.safeRoundChance + safeRoundBonus;

    let scenario: typeof SCENARIOS[0];
    const safeRoll = Math.random();

    if (safeRoll < adjustedSafeChance) {
      scenario = SCENARIOS.find(s => s.type === 'Safe')!;
    } else {
      const nonSafeScenarios = SCENARIOS.filter(s => s.type !== 'Safe');
      const totalProb = nonSafeScenarios.reduce((sum, s) => sum + s.probability, 0);
      let roll = Math.random() * totalProb;
      let cumulative = 0;

      scenario = nonSafeScenarios[0];
      for (const s of nonSafeScenarios) {
        cumulative += s.probability;
        if (roll <= cumulative) {
          scenario = s;
          break;
        }
      }
    }

    // Calculate base earnings
    const baseEarnings = Math.round((1000 + (gameState.wave * 100)) * difficultyPreset.baseEarningsMultiplier);

    // Find matching insurance (only for transfer strategy)
    const matchingInsurance = strategy === 'transfer'
      ? gameState.selectedInsurance
          .map(name => INSURANCE_OPTIONS.find(i => i.name === name))
          .filter(i => i && scenario.requiredInsurance && i.category.toLowerCase().includes(scenario.requiredInsurance.toLowerCase()))
          .sort((a, b) => (b?.coverage || 0) - (a?.coverage || 0))[0]
      : undefined;

    let moneyLost = insuranceCost + reduceCost;
    let healthLost = 0;
    let outcomeMessage = '';
    let hadInsurance = false;
    let luckyDodge = false;

    // Get wave damage scaling
    const waveScale = WAVE_DAMAGE_SCALING[gameState.wave] || 1;

    // Base uninsured details for breakdown
    const baseInsuranceDetails = INSURANCE_OPTIONS.find(i =>
      scenario.requiredInsurance && i.category.toLowerCase().includes(scenario.requiredInsurance.toLowerCase()) && i.tier === 'Basic'
    );
    const uninsuredMoneyBase = baseInsuranceDetails ? Math.round(baseInsuranceDetails.uninsuredLoss.money * difficultyPreset.damageMultiplier * waveScale) : 0;
    const uninsuredHealthBase = baseInsuranceDetails ? Math.round(baseInsuranceDetails.uninsuredLoss.health * difficultyPreset.damageMultiplier * waveScale) : 0;

    let currentBreakdown: WaveBreakdown;

    if (scenario.type === 'Safe') {
      playSound('safe-round');
      outcomeMessage = `A peaceful day! You earned $${baseEarnings} from scavenging.`;
      currentBreakdown = {
        scenarioType: 'Safe', baseDamageMoney: 0, baseDamageHealth: 0,
        insuranceTier: null, coveragePercent: 0, premiumPaid: 0, deductiblePaid: 0,
        insurancePaidAmount: 0, playerPaidDamage: 0, totalPlayerCost: insuranceCost + reduceCost,
        healthTaken: 0, healthIfUninsured: 0, moneyIfUninsured: 0,
        moneySaved: 0, healthSaved: 0, earnings: baseEarnings, isSafe: true
      };
      setWaveBreakdown(currentBreakdown);
    } else if (strategy === 'reduce' && reduceOption) {
      // REDUCE strategy: apply damage reduction if matching category
      if (baseInsuranceDetails) {
        const rawMoneyLoss = Math.round(baseInsuranceDetails.uninsuredLoss.money * difficultyPreset.damageMultiplier * waveScale);
        const rawHealthLoss = Math.round(baseInsuranceDetails.uninsuredLoss.health * difficultyPreset.damageMultiplier * waveScale);

        // Check if the reduce option's category matches the scenario
        const categoryMatches = scenario.requiredInsurance && reduceOption.category.toLowerCase().includes(scenario.requiredInsurance.toLowerCase());
        const dmgReduction = categoryMatches ? reduceOption.damageReduction : 0;
        const hpReduction = categoryMatches ? reduceOption.healthReduction : 0;

        const reducedMoneyLoss = Math.round(rawMoneyLoss * (1 - dmgReduction));
        const reducedHealthLoss = Math.round(rawHealthLoss * (1 - hpReduction));

        moneyLost += reducedMoneyLoss;
        healthLost = reducedHealthLoss;

        if (categoryMatches) {
          outcomeMessage = `${reduceOption.name} reduced damage! Lost $${reducedMoneyLoss} and ${reducedHealthLoss} HP (reduced from $${rawMoneyLoss} / ${rawHealthLoss} HP). Earned $${baseEarnings}.`;
        } else {
          outcomeMessage = `${reduceOption.name} didn't help against this threat. Lost $${reducedMoneyLoss} and ${reducedHealthLoss} HP. Earned $${baseEarnings}.`;
        }

        currentBreakdown = {
          scenarioType: scenario.type,
          baseDamageMoney: rawMoneyLoss,
          baseDamageHealth: rawHealthLoss,
          insuranceTier: null,
          coveragePercent: categoryMatches ? Math.round(dmgReduction * 100) : 0,
          premiumPaid: reduceCost,
          deductiblePaid: 0,
          insurancePaidAmount: categoryMatches ? rawMoneyLoss - reducedMoneyLoss : 0,
          playerPaidDamage: reducedMoneyLoss,
          totalPlayerCost: reduceCost + reducedMoneyLoss,
          healthTaken: reducedHealthLoss,
          healthIfUninsured: rawHealthLoss,
          moneyIfUninsured: rawMoneyLoss,
          moneySaved: categoryMatches ? rawMoneyLoss - reducedMoneyLoss : 0,
          healthSaved: categoryMatches ? rawHealthLoss - reducedHealthLoss : 0,
          earnings: baseEarnings,
          isSafe: false
        };
        setWaveBreakdown(currentBreakdown);
        playSound(categoryMatches ? 'money-gain' : 'money-loss');
      } else {
        luckyDodge = true;
        outcomeMessage = `Lucky! The threat passed without major damage. Earned $${baseEarnings}.`;
        currentBreakdown = {
          scenarioType: scenario.type, baseDamageMoney: 0, baseDamageHealth: 0,
          insuranceTier: null, coveragePercent: 0, premiumPaid: reduceCost, deductiblePaid: 0,
          insurancePaidAmount: 0, playerPaidDamage: 0, totalPlayerCost: reduceCost,
          healthTaken: 0, healthIfUninsured: 0, moneyIfUninsured: 0,
          moneySaved: 0, healthSaved: 0, earnings: baseEarnings, isSafe: false
        };
        setWaveBreakdown(currentBreakdown);
        playSound('safe-round');
      }
    } else if (strategy === 'transfer' && matchingInsurance) {
      hadInsurance = true;
      const baseLoss = Math.round(matchingInsurance.uninsuredLoss.money * difficultyPreset.damageMultiplier * waveScale);
      const coveredLoss = baseLoss * (matchingInsurance.coverage / 100);
      const actualLoss = matchingInsurance.deductible + (baseLoss - coveredLoss);
      moneyLost += Math.round(actualLoss);
      healthLost = Math.round(matchingInsurance.uninsuredLoss.health * (1 - matchingInsurance.coverage / 100) * difficultyPreset.damageMultiplier * waveScale);
      outcomeMessage = `Protected by ${matchingInsurance.tier} insurance! Paid $${Math.round(actualLoss)} (${matchingInsurance.coverage}% coverage). Earned $${baseEarnings}.`;

      const deductiblePaid = matchingInsurance.deductible;
      const playerPaidDamage = Math.round(baseLoss - coveredLoss);
      const insurancePaidAmount = Math.round(coveredLoss);
      currentBreakdown = {
        scenarioType: scenario.type,
        baseDamageMoney: baseLoss,
        baseDamageHealth: Math.round(matchingInsurance.uninsuredLoss.health * difficultyPreset.damageMultiplier * waveScale),
        insuranceTier: matchingInsurance.tier,
        coveragePercent: matchingInsurance.coverage,
        premiumPaid: insuranceCost,
        deductiblePaid,
        insurancePaidAmount,
        playerPaidDamage,
        totalPlayerCost: insuranceCost + Math.round(actualLoss),
        healthTaken: healthLost,
        healthIfUninsured: uninsuredHealthBase,
        moneyIfUninsured: uninsuredMoneyBase,
        moneySaved: uninsuredMoneyBase - Math.round(actualLoss),
        healthSaved: uninsuredHealthBase - healthLost,
        earnings: baseEarnings,
        isSafe: false
      };
      setWaveBreakdown(currentBreakdown);

      if (healthLost > 0) {
        playSound('injury');
      } else {
        playSound('money-gain');
      }
    } else {
      // RETAIN strategy or TRANSFER with no matching insurance
      if (baseInsuranceDetails) {
        const uninsuredMoneyLoss = Math.round(baseInsuranceDetails.uninsuredLoss.money * difficultyPreset.damageMultiplier * waveScale);
        const uninsuredHealthLoss = Math.round(baseInsuranceDetails.uninsuredLoss.health * difficultyPreset.damageMultiplier * waveScale);
        moneyLost += uninsuredMoneyLoss;
        healthLost = uninsuredHealthLoss;
        outcomeMessage = `No insurance! Lost $${uninsuredMoneyLoss} and ${uninsuredHealthLoss} health. Earned $${baseEarnings}.`;

        const premiumOption = INSURANCE_OPTIONS.find(i =>
          scenario.requiredInsurance && i.category.toLowerCase().includes(scenario.requiredInsurance.toLowerCase()) && i.tier === 'Premium'
        );
        const premiumBaseLoss = premiumOption ? Math.round(premiumOption.uninsuredLoss.money * difficultyPreset.damageMultiplier * waveScale) : 0;
        const premiumCovered = premiumOption ? premiumBaseLoss * (premiumOption.coverage / 100) : 0;
        const premiumActualLoss = premiumOption ? premiumOption.deductible + (premiumBaseLoss - premiumCovered) : 0;
        const premiumHealthLost = premiumOption ? Math.round(premiumOption.uninsuredLoss.health * (1 - premiumOption.coverage / 100) * difficultyPreset.damageMultiplier * waveScale) : 0;

        currentBreakdown = {
          scenarioType: scenario.type,
          baseDamageMoney: uninsuredMoneyLoss,
          baseDamageHealth: uninsuredHealthLoss,
          insuranceTier: null,
          coveragePercent: 0,
          premiumPaid: insuranceCost,
          deductiblePaid: 0,
          insurancePaidAmount: 0,
          playerPaidDamage: uninsuredMoneyLoss,
          totalPlayerCost: insuranceCost + uninsuredMoneyLoss,
          healthTaken: uninsuredHealthLoss,
          healthIfUninsured: uninsuredHealthLoss,
          moneyIfUninsured: uninsuredMoneyLoss,
          moneySaved: -(premiumOption ? (uninsuredMoneyLoss - Math.round(premiumActualLoss)) : 0),
          healthSaved: -(premiumOption ? (uninsuredHealthLoss - premiumHealthLost) : 0),
          earnings: baseEarnings,
          isSafe: false
        };
        setWaveBreakdown(currentBreakdown);

        playSound('money-loss');
      } else {
        luckyDodge = true;
        outcomeMessage = `Lucky! The threat passed without major damage. Earned $${baseEarnings}.`;
        currentBreakdown = {
          scenarioType: scenario.type, baseDamageMoney: 0, baseDamageHealth: 0,
          insuranceTier: null, coveragePercent: 0, premiumPaid: insuranceCost, deductiblePaid: 0,
          insurancePaidAmount: 0, playerPaidDamage: 0, totalPlayerCost: insuranceCost,
          healthTaken: 0, healthIfUninsured: 0, moneyIfUninsured: 0,
          moneySaved: 0, healthSaved: 0, earnings: baseEarnings, isSafe: false
        };
        setWaveBreakdown(currentBreakdown);
        playSound('safe-round');
      }
    }

    const netMoneyChange = baseEarnings - moneyLost;
    const newMoney = gameState.money + netMoneyChange;
    const newHealth = Math.max(0, gameState.health - healthLost);

    // Track lowest values for achievements
    const newLowestMoney = Math.min(gameState.lowestMoney, newMoney);
    const newLowestHealth = Math.min(gameState.lowestHealth, newHealth);

    // Track waves without damage
    const newWavesWithoutDamage = healthLost === 0 ? gameState.wavesWithoutDamage + 1 : 0;

    const decision: Decision = {
      wave: gameState.wave,
      scenario: scenario.description,
      scenarioType: scenario.type,
      insurancePurchased: strategy === 'transfer' ? gameState.selectedInsurance : [],
      moneySpent: insuranceCost + reduceCost,
      moneyLost: moneyLost,
      healthLost: healthLost,
      outcome: outcomeMessage,
      hadInsurance,
      strategyUsed: strategy,
      reduceCost,
    };

    // Check game over conditions
    const isGameOver = gameState.wave >= difficultyPreset.waveCount || newHealth <= 0 || newMoney <= 0;
    const isVictory = gameState.wave >= difficultyPreset.waveCount && newHealth > 0 && newMoney > 0;

    setGameState(prev => ({
      ...prev,
      wave: prev.wave + 1,
      money: newMoney,
      health: newHealth,
      currentScenario: scenario.description,
      currentScenarioType: scenario.type,
      feedback: outcomeMessage,
      isGameOver,
      isVictory,
      decisionHistory: [...prev.decisionHistory, decision],
      showingPreOutcome: true,
      showingOutcome: false,
      preOutcomeStage: 'horde',
      totalInsuranceSpent: prev.totalInsuranceSpent + insuranceCost,
      wavesWithoutDamage: newWavesWithoutDamage,
      lowestMoney: newLowestMoney,
      lowestHealth: newLowestHealth,
      usedInsuranceTypes: newUsedTypes,
      fullCoverageRounds: hasFullCoverage ? prev.fullCoverageRounds + 1 : prev.fullCoverageRounds,
      luckyDodges: luckyDodge ? prev.luckyDodges + 1 : prev.luckyDodges,
      allWaveBreakdowns: [...prev.allWaveBreakdowns, { wave: prev.wave, breakdown: currentBreakdown!, strategy }],
    }));
  };

  // Continue to next wave (after outcome)
  const continueToNextWave = () => {
    playSound('click');

    // Roll for random event
    const randomEvent = rollForRandomEvent(gameState.wave);
    let eventMessage = '';
    let newMoney = gameState.money;
    let newHealth = gameState.health;
    let insuranceDiscount = 0;
    let insurancePriceIncrease = 0;

    if (randomEvent) {
      const result = applyRandomEvent(randomEvent, { money: newMoney, health: newHealth });
      newMoney = result.money;
      newHealth = result.health;
      insuranceDiscount = result.insuranceDiscount;
      insurancePriceIncrease = result.insurancePriceIncrease;
      eventMessage = result.message;
      setEventEffectMessage(eventMessage);
    }

    setGameState(prev => ({
      ...prev,
      money: newMoney,
      health: newHealth,
      showingPreOutcome: false,
      showingOutcome: false,
      selectedInsurance: [],
      preOutcomeStage: null,
      currentRandomEvent: randomEvent,
      insuranceDiscountThisRound: insuranceDiscount,
      insurancePriceIncreaseThisRound: insurancePriceIncrease,
      selectedStrategy: 'transfer',
      reduceOptionSelected: null,
    }));

    setThreatForecast(generateThreatForecast(gameState.wave, gameState.difficulty));
  };

  // Handle game over
  useEffect(() => {
    if (gameState.isGameOver && !gameState.showStartScreen) {
      const score = calculateFinalScore(gameState.money, gameState.health);
      const gameTime = Date.now() - gameState.gameStartTime;

      // Check if only basic tier was used
      const usedOnlyBasic = gameState.decisionHistory.every(d =>
        d.insurancePurchased.every(i => i.includes('Basic') || i === '')
      );

      // Check if never repeated insurance
      const allInsurances: string[] = [];
      let neverRepeated = true;
      for (const decision of gameState.decisionHistory) {
        for (const ins of decision.insurancePurchased) {
          if (allInsurances.includes(ins)) {
            neverRepeated = false;
            break;
          }
          allInsurances.push(ins);
        }
        if (!neverRepeated) break;
      }

      // Check achievements
      const newAchievements = checkGameEndAchievements(
        gameState.isVictory,
        gameState.money,
        gameState.health,
        gameState.totalInsuranceSpent,
        gameTime,
        gameState.difficulty,
        gameState.lowestMoney,
        gameState.wavesWithoutDamage,
        gameState.luckyDodges,
        gameState.usedInsuranceTypes,
        usedOnlyBasic,
        gameState.fullCoverageRounds,
        neverRepeated
      );

      // Show achievement toasts
      if (newAchievements.length > 0) {
        playSound('achievement');
        setAchievementToasts(newAchievements);
      }

      // Update stats
      updateStatsAfterGame(
        gameState.isVictory,
        score,
        gameState.wave - 1,
        gameState.money,
        gameState.health,
        gameState.totalInsuranceSpent,
        0,
        gameState.decisionHistory.reduce((sum, d) => sum + d.healthLost, 0),
        gameTime,
        Array.from(gameState.usedInsuranceTypes),
        gameState.difficulty,
        gameState.lowestMoney,
        gameState.lowestHealth,
        gameState.wavesWithoutDamage,
        gameState.fullCoverageRounds
      );

      // Submit to leaderboard
      const entry = createLeaderboardEntry(
        gameState.playerName || 'Anonymous',
        score,
        gameState.money,
        gameState.health,
        gameState.wave - 1,
        gameState.difficulty,
        gameState.character,
        newAchievements
      );

      const result = isClassMode ? submitClassScore(entry) : submitScore(entry);
      setLeaderboardRank(result.rank);

      if (gameState.isVictory) {
        playSound('victory');
      } else {
        playSound('game-over');
      }
    }
  }, [gameState.isGameOver]);

  // Dismiss achievement toast
  const dismissAchievement = (id: string) => {
    setAchievementToasts(prev => prev.filter(a => a !== id));
  };

  // Get final score
  const getFinalScore = () => calculateFinalScore(gameState.money, gameState.health);

  // Get performance rating
  const getPerformanceRating = () => {
    const score = getFinalScore();
    for (const rating of PERFORMANCE_RATINGS) {
      if (score >= rating.minScore) {
        return rating;
      }
    }
    return PERFORMANCE_RATINGS[PERFORMANCE_RATINGS.length - 1];
  };

  // Get stats for display
  const stats = typeof window !== 'undefined' ? getStats() : null;
  const unlockedAchievements = typeof window !== 'undefined' ? getUnlockedAchievements() : [];

  // Scenario type to icon mapping
  const scenarioIcon = (type: ScenarioType) => {
    switch (type) {
      case 'Home Attack': return '🏠';
      case 'Injury': return '🩺';
      case 'Supply Loss': return '📦';
      case 'Evacuation': return '🚁';
      case 'Safe': return '☀️';
    }
  };

  const scenarioColor = (type: ScenarioType) => {
    switch (type) {
      case 'Home Attack': return 'var(--comic-red)';
      case 'Injury': return 'var(--comic-yellow)';
      case 'Supply Loss': return 'var(--comic-purple)';
      case 'Evacuation': return 'var(--comic-blue)';
      case 'Safe': return 'var(--comic-green)';
    }
  };

  // Pre-outcome animation component
  const PreOutcomeScreen = () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
      const duration = gameState.preOutcomeStage === 'horde' ? 3000 : 2000;
      const interval = 50;
      const steps = duration / interval;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        setProgress((currentStep / steps) * 100);

        if (currentStep >= steps) {
          clearInterval(timer);
          if (gameState.preOutcomeStage === 'horde') {
            if (gameState.currentScenarioType !== 'Safe') {
              playSound('horde-approaching');
            }
            setGameState(prev => ({
              ...prev,
              preOutcomeStage: 'scenario'
            }));
            setProgress(0);
          } else {
            setGameState(prev => ({
              ...prev,
              showingPreOutcome: false,
              showingOutcome: true,
              preOutcomeStage: null
            }));
          }
        }
      }, interval);

      return () => clearInterval(timer);
    }, [gameState.preOutcomeStage]);

    const scenarioType = gameState.currentScenarioType;
    const isSafe = scenarioType === 'Safe';

    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 scan-lines" style={{ background: 'rgba(10,10,10,0.97)' }}>
        <div className="w-full h-full relative overflow-hidden halftone-bg">
          {/* Atmospheric background */}
          <div
            className="absolute inset-0 animate-pulse"
            style={{
              opacity: 0.15,
              background: isSafe
                ? 'radial-gradient(ellipse at center, var(--comic-green) 0%, transparent 70%)'
                : `radial-gradient(ellipse at center, ${scenarioColor(scenarioType)} 0%, transparent 70%)`
            }}
          />

          {/* Horde stage */}
          {gameState.preOutcomeStage === 'horde' && !isSafe && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full">
                {Array(10).fill(null).map((_, i) => {
                  const row = Math.floor(i / 5);
                  const col = i % 5;
                  const yPos = 30 + (row * 25);
                  const xPos = 100 - (progress * 1.2) + (col * 12);
                  const zombieEmoji = ['🧟‍♂️', '🧟‍♀️', '🧟'][i % 3];
                  return (
                    <div
                      key={i}
                      className="absolute text-6xl md:text-8xl transition-all duration-100 animate-zombie-shamble"
                      style={{
                        top: `${yPos}%`,
                        left: `${xPos}%`,
                        transform: `translateY(${Math.sin(progress / 10 + i) * 10}px)`,
                        zIndex: 15 - i,
                        animationDelay: `${i * 0.1}s`
                      }}
                    >
                      {zombieEmoji}
                    </div>
                  );
                })}
              </div>
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <h2
                  className="impact-text text-center"
                  style={{ color: 'var(--comic-red)' }}
                >
                  ZOMBIE HORDE<br />APPROACHING!
                </h2>
              </div>
            </div>
          )}

          {/* Safe round */}
          {gameState.preOutcomeStage === 'horde' && isSafe && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center animate-comic-entrance">
                <div className="text-8xl mb-6" style={{ filter: 'drop-shadow(0 0 20px rgba(6,214,160,0.5))' }}>☀️</div>
                <h2
                  className="impact-text"
                  style={{ color: 'var(--comic-green)' }}
                >
                  ALL CLEAR!
                </h2>
              </div>
            </div>
          )}

          {/* Scenario stage */}
          {gameState.preOutcomeStage === 'scenario' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center animate-comic-entrance">
                <div className="text-8xl mb-6" style={{ filter: `drop-shadow(0 0 20px ${scenarioColor(scenarioType)}50)` }}>
                  {scenarioType === "Home Attack" ? "🏠💥" :
                   scenarioType === "Injury" ? "🩺🧟" :
                   scenarioType === "Supply Loss" ? "📦🏃" :
                   scenarioType === "Evacuation" ? "🚁🏃‍♂️" :
                   "✨"}
                </div>
                <h2
                  className="impact-text"
                  style={{ color: scenarioColor(scenarioType) }}
                >
                  {scenarioType === "Home Attack" ? "DEFENDING\nYOUR HOME!" :
                   scenarioType === "Injury" ? "TREATING THE\nWOUNDED!" :
                   scenarioType === "Supply Loss" ? "RAIDERS\nATTACKING!" :
                   scenarioType === "Evacuation" ? "EVACUATING\nNOW!" :
                   "PEACEFUL DAY!"}
                </h2>
              </div>
            </div>
          )}

          {/* Progress bar */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-1/2">
            <div className="progress-bar-track">
              <div
                className={`progress-bar-fill ${!isSafe ? 'progress-bar-fill-red' : ''}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Calculate cost summary
  const baseIncome = 1000 + (gameState.wave * 100);
  const totalCost = calculateInsuranceCost(gameState.selectedInsurance);
  const netIncome = Math.round(baseIncome * difficultyPreset.baseEarningsMultiplier) - totalCost;

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 halftone-bg" style={{ background: 'var(--ink-black)' }}>
      {/* Achievement toasts */}
      <AchievementToastContainer
        achievements={achievementToasts}
        onDismiss={dismissAchievement}
      />

      {/* Modals */}
      {gameState.showAchievements && (
        <AchievementGallery onClose={() => setGameState(prev => ({ ...prev, showAchievements: false }))} />
      )}
      {gameState.showLeaderboard && (
        <LeaderboardModal
          onClose={() => setGameState(prev => ({ ...prev, showLeaderboard: false }))}
          isClassMode={isClassMode}
          currentPlayerName={gameState.playerName}
        />
      )}
      {gameState.showSettings && (
        <SettingsPanel onClose={() => setGameState(prev => ({ ...prev, showSettings: false }))} />
      )}
      {showInstructions && (
        <InstructionsModal onClose={() => setShowInstructions(false)} />
      )}

      <div className="z-10 max-w-6xl w-full relative">
        {/* Title */}
        <div className="text-center mb-8 animate-slide-up">
          <h1
            className="comic-title text-5xl md:text-7xl comic-title-glow-green mb-2"
            style={{ color: 'var(--comic-green)' }}
          >
            Zombie Apocalypse
          </h1>
          <h2
            className="comic-subtitle text-2xl md:text-4xl"
            style={{ color: 'var(--parchment)' }}
          >
            Insurance Simulator
          </h2>
          <div
            className="mt-3 inline-block px-4 py-1 rounded-sm text-xs uppercase tracking-widest"
            style={{
              background: 'rgba(230,57,70,0.15)',
              border: '1px solid var(--comic-red)',
              color: 'var(--comic-red)',
              fontFamily: 'var(--font-bitter)'
            }}
          >
            Survive. Insure. Prevail.
          </div>
        </div>

        {/* Class Mode Badge */}
        {isClassMode && (
          <div className="text-center mb-6">
            <span
              className="comic-subtitle text-sm px-5 py-2 rounded-sm inline-block animate-pulse-green"
              style={{
                background: 'rgba(155,93,229,0.15)',
                border: '2px solid var(--comic-purple)',
                color: 'var(--comic-purple)'
              }}
            >
              CLASS MODE ACTIVE
            </span>
          </div>
        )}

        {/* ════════════ START SCREEN ════════════ */}
        {gameState.showStartScreen && (
          <div className="comic-panel rounded-lg p-6 md:p-8 animate-comic-entrance">
            <div className="relative z-10">
              <h2
                className="comic-subtitle text-3xl md:text-4xl mb-2 text-center"
                style={{ color: 'var(--comic-green)' }}
              >
                Welcome to Insurance Training
              </h2>
              <p className="mb-8 text-center" style={{ color: 'var(--text-secondary)' }}>
                Learn about insurance by managing risks in a zombie apocalypse!
              </p>

              {/* Stats summary */}
              {stats && stats.gamesPlayed > 0 && (
                <div className="comic-panel-inner rounded-lg p-5 mb-8 animate-slide-up delay-1">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="comic-subtitle text-3xl stat-money">{stats.gamesPlayed}</div>
                      <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Games Played</div>
                    </div>
                    <div>
                      <div className="comic-subtitle text-3xl stat-wave">{stats.gamesWon}</div>
                      <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Wins</div>
                    </div>
                    <div>
                      <div className="comic-subtitle text-3xl" style={{ color: 'var(--comic-blue)' }}>{formatScore(stats.highestScore)}</div>
                      <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>High Score</div>
                    </div>
                    <div>
                      <div className="comic-subtitle text-3xl" style={{ color: 'var(--comic-purple)' }}>{unlockedAchievements.length}/{ACHIEVEMENTS.length}</div>
                      <div className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Achievements</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Difficulty selector */}
              <div className="mb-6 animate-slide-up delay-3">
                <DifficultySelector
                  selected={gameState.difficulty}
                  onChange={(d) => setGameState(prev => ({ ...prev, difficulty: d }))}
                />
              </div>

              {/* Character selector */}
              <div className="mb-8 animate-slide-up delay-4">
                <label className="block text-sm font-medium mb-3 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Select Character
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {CHARACTERS.map(char => {
                    const unlocked = isCharacterUnlocked(char.unlockRequirement);
                    const isSelected = gameState.character === char.id;

                    return (
                      <button
                        key={char.id}
                        onClick={() => unlocked && setGameState(prev => ({ ...prev, character: char.id }))}
                        disabled={!unlocked}
                        className={`p-3 rounded-lg transition-all text-left ${
                          !unlocked ? 'opacity-40 cursor-not-allowed' :
                          isSelected ? 'insurance-card-selected' :
                          'hover:border-opacity-80'
                        }`}
                        style={{
                          background: isSelected ? 'rgba(6,214,160,0.1)' : 'var(--panel-mid)',
                          border: `2px solid ${isSelected ? 'var(--comic-green)' : 'var(--panel-light)'}`,
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{unlocked ? char.emoji : '🔒'}</span>
                          <div>
                            <div
                              className="font-bold text-sm"
                              style={{ color: isSelected ? 'var(--comic-green)' : 'var(--parchment)' }}
                            >
                              {unlocked ? char.name : '???'}
                            </div>
                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              {unlocked ? char.description : 'Locked'}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-3 animate-slide-up delay-5">
                <button
                  onClick={startGame}
                  className="btn-comic btn-comic-green w-full py-4 px-6 rounded-lg text-2xl"
                >
                  START GAME
                </button>

                <div className="grid grid-cols-4 gap-3">
                  <button
                    onClick={() => setShowInstructions(true)}
                    className="btn-comic py-3 px-4 rounded-lg text-sm"
                    style={{
                      background: 'rgba(255,209,102,0.15)',
                      color: 'var(--comic-yellow)',
                      border: '2px solid var(--comic-yellow)',
                      boxShadow: '2px 2px 0px #000'
                    }}
                  >
                    HOW TO PLAY
                  </button>
                  <button
                    onClick={() => setGameState(prev => ({ ...prev, showLeaderboard: true }))}
                    className="btn-comic btn-comic-ghost py-3 px-4 rounded-lg text-sm"
                  >
                    SCORES
                  </button>
                  <button
                    onClick={() => setGameState(prev => ({ ...prev, showAchievements: true }))}
                    className="btn-comic btn-comic-ghost py-3 px-4 rounded-lg text-sm"
                  >
                    BADGES
                  </button>
                  <button
                    onClick={() => setGameState(prev => ({ ...prev, showSettings: true }))}
                    className="btn-comic btn-comic-ghost py-3 px-4 rounded-lg text-sm"
                  >
                    SETTINGS
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════ GAME SCREEN ════════════ */}
        {!gameState.showStartScreen && !gameState.isGameOver && !gameState.showingOutcome && !gameState.showingPreOutcome && (
          <div className="comic-panel rounded-lg p-4 md:p-8 animate-comic-entrance">
            <div className="relative z-10">
              {/* Header */}
              <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                <div className="flex items-center gap-3">
                  <h2
                    className="comic-subtitle text-2xl md:text-3xl stat-wave"
                  >
                    Wave {gameState.wave} of {difficultyPreset.waveCount}
                  </h2>
                  <span
                    className="tier-badge"
                    style={{
                      background: gameState.difficulty === 'easy' ? 'rgba(6,214,160,0.15)' :
                                  gameState.difficulty === 'medium' ? 'rgba(255,209,102,0.15)' :
                                  'rgba(230,57,70,0.15)',
                      color: gameState.difficulty === 'easy' ? 'var(--comic-green)' :
                             gameState.difficulty === 'medium' ? 'var(--comic-yellow)' :
                             'var(--comic-red)',
                      border: `1px solid ${gameState.difficulty === 'easy' ? 'var(--comic-green)' :
                                           gameState.difficulty === 'medium' ? 'var(--comic-yellow)' :
                                           'var(--comic-red)'}`
                    }}
                  >
                    {difficultyPreset.label}
                  </span>
                </div>
                <div className="flex gap-4 items-center">
                  <span className="comic-subtitle text-xl md:text-2xl stat-money">${gameState.money.toLocaleString()}</span>
                  <span className="comic-subtitle text-xl md:text-2xl stat-health">HP {gameState.health}</span>
                  <button
                    onClick={() => setShowInstructions(true)}
                    className="w-8 h-8 rounded-full flex items-center justify-center comic-subtitle text-sm transition-all hover:scale-110"
                    style={{
                      background: 'rgba(255,209,102,0.15)',
                      color: 'var(--comic-yellow)',
                      border: '2px solid var(--comic-yellow)',
                    }}
                    title="How to play"
                  >
                    ?
                  </button>
                </div>
              </div>

              {/* Wave progress bar */}
              <div className="mb-5">
                <div className="progress-bar-track">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${(gameState.wave / difficultyPreset.waveCount) * 100}%` }}
                  />
                </div>
              </div>

              {/* Random Event Banner */}
              {gameState.currentRandomEvent && (
                <RandomEventBanner
                  event={gameState.currentRandomEvent}
                  effectMessage={eventEffectMessage}
                />
              )}

              {/* Threat Forecast (Feature 2) */}
              {threatForecast && gameState.selectedStrategy !== 'avoid' && (
                <ThreatForecastComponent forecast={threatForecast} />
              )}

              {/* Strategy Selector (Feature 1) */}
              <StrategySelector
                selected={gameState.selectedStrategy}
                onChange={(s) => setGameState(prev => ({ ...prev, selectedStrategy: s, selectedInsurance: s !== 'transfer' ? [] : prev.selectedInsurance, reduceOptionSelected: s !== 'reduce' ? null : prev.reduceOptionSelected }))}
                reduceOptions={gameState.reduceOptionSelected ? [gameState.reduceOptionSelected] : []}
                onReduceToggle={(id) => setGameState(prev => ({ ...prev, reduceOptionSelected: prev.reduceOptionSelected === id ? null : id }))}
                difficultyPreset={difficultyPreset}
              />

              {/* Financial Summary - hidden when avoid */}
              {gameState.selectedStrategy !== 'avoid' && (
              <div className="comic-panel-inner rounded-lg p-4 mb-5">
                <h3 className="comic-subtitle text-lg mb-3" style={{ color: 'var(--comic-green)' }}>Financial Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Base Income:</p>
                    <p className="comic-subtitle text-xl stat-money">+${Math.round(baseIncome * difficultyPreset.baseEarningsMultiplier)}</p>
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {gameState.selectedStrategy === 'transfer' ? 'Insurance Costs:' :
                       gameState.selectedStrategy === 'reduce' ? 'Reduction Costs:' :
                       'Costs:'}
                    </p>
                    <p className="comic-subtitle text-xl stat-health">
                      -${gameState.selectedStrategy === 'reduce' && gameState.reduceOptionSelected
                        ? Math.round((REDUCE_OPTIONS.find(r => r.id === gameState.reduceOptionSelected)?.cost || 0) * difficultyPreset.insuranceCostMultiplier)
                        : totalCost}
                    </p>
                  </div>
                </div>
                {gameState.selectedStrategy === 'transfer' && (gameState.insuranceDiscountThisRound > 0 || gameState.insurancePriceIncreaseThisRound > 0) && (
                  <div className="mt-2 text-sm">
                    {gameState.insuranceDiscountThisRound > 0 && (
                      <span style={{ color: 'var(--comic-green)' }}>({gameState.insuranceDiscountThisRound}% discount active) </span>
                    )}
                    {gameState.insurancePriceIncreaseThisRound > 0 && (
                      <span style={{ color: 'var(--comic-red)' }}>(+{gameState.insurancePriceIncreaseThisRound}% price increase) </span>
                    )}
                  </div>
                )}
                <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--panel-light)' }}>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Net Income:</p>
                  <p className={`comic-subtitle text-2xl ${
                    (() => {
                      const cost = gameState.selectedStrategy === 'reduce' && gameState.reduceOptionSelected
                        ? Math.round((REDUCE_OPTIONS.find(r => r.id === gameState.reduceOptionSelected)?.cost || 0) * difficultyPreset.insuranceCostMultiplier)
                        : totalCost;
                      return (Math.round(baseIncome * difficultyPreset.baseEarningsMultiplier) - cost) >= 0 ? 'stat-money' : 'stat-health';
                    })()
                  }`}>
                    ${(() => {
                      const cost = gameState.selectedStrategy === 'reduce' && gameState.reduceOptionSelected
                        ? Math.round((REDUCE_OPTIONS.find(r => r.id === gameState.reduceOptionSelected)?.cost || 0) * difficultyPreset.insuranceCostMultiplier)
                        : totalCost;
                      return Math.round(baseIncome * difficultyPreset.baseEarningsMultiplier) - cost;
                    })()}
                  </p>
                </div>
              </div>
              )}

              {/* Avoid strategy message */}
              {gameState.selectedStrategy === 'avoid' && (
                <div className="comic-panel-inner rounded-lg p-4 mb-5 text-center">
                  <p className="comic-subtitle text-lg" style={{ color: 'var(--text-secondary)' }}>
                    Sitting this wave out...
                  </p>
                </div>
              )}

              {/* Insurance Selection - only show for transfer strategy */}
              {gameState.selectedStrategy === 'transfer' && (
              <div className="mb-6">
                <h3 className="comic-subtitle text-xl mb-4" style={{ color: 'var(--parchment)' }}>Insurance Policies</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {INSURANCE_OPTIONS.map((insurance) => {
                    const isSelected = gameState.selectedInsurance.includes(insurance.name);
                    let displayCost = insurance.cost * difficultyPreset.insuranceCostMultiplier;
                    displayCost *= (1 - gameState.insuranceDiscountThisRound / 100);
                    displayCost *= (1 + gameState.insurancePriceIncreaseThisRound / 100);

                    const characterBonus = CHARACTERS.find(c => c.id === gameState.character);
                    if (characterBonus?.bonus.type === 'insurance_discount') {
                      displayCost *= (1 - characterBonus.bonus.value / 100);
                    }
                    displayCost = Math.round(displayCost);

                    const tierClass = insurance.tier === 'Premium' ? 'insurance-card-premium' :
                                     insurance.tier === 'Standard' ? 'insurance-card-standard' :
                                     'insurance-card-basic';

                    const isExpanded = expandedInsuranceId === insurance.id;

                    // Calculate what-if numbers for tooltip
                    const wScale = WAVE_DAMAGE_SCALING[gameState.wave] || 1;
                    const fullDamage = Math.round(insurance.uninsuredLoss.money * difficultyPreset.damageMultiplier * wScale);
                    const fullHealthDmg = Math.round(insurance.uninsuredLoss.health * difficultyPreset.damageMultiplier * wScale);
                    const coveredAmount = Math.round(fullDamage * (insurance.coverage / 100));
                    const uncoveredAmount = fullDamage - coveredAmount;
                    const totalWithInsurance = displayCost + insurance.deductible + uncoveredAmount;
                    const moneySaved = fullDamage - (insurance.deductible + uncoveredAmount);
                    const healthSaved = fullHealthDmg - Math.round(fullHealthDmg * (1 - insurance.coverage / 100));

                    // Scenario name for this insurance category
                    const scenarioName = insurance.category.includes('Home') ? 'Home Attack' :
                                         insurance.category.includes('Bite') ? 'Zombie Bite Injury' :
                                         insurance.category.includes('Supply') ? 'Supply Raid' :
                                         'Emergency Evacuation';

                    return (
                      <div
                        key={insurance.id}
                        className={`insurance-card ${tierClass} ${isSelected ? 'insurance-card-selected' : ''} p-4 rounded-lg`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4
                            className="font-bold text-sm"
                            style={{
                              color: insurance.tier === 'Premium' ? 'var(--comic-purple)' :
                                     insurance.tier === 'Standard' ? 'var(--comic-blue)' :
                                     'var(--text-secondary)'
                            }}
                          >
                            {insurance.name}
                          </h4>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedInsuranceId(isExpanded ? null : insurance.id);
                              }}
                              className="w-5 h-5 rounded-full flex items-center justify-center text-xs transition-all"
                              style={{
                                background: isExpanded ? 'var(--comic-yellow)' : 'rgba(255,209,102,0.15)',
                                color: isExpanded ? '#000' : 'var(--comic-yellow)',
                                border: '1px solid var(--comic-yellow)',
                                fontSize: '10px',
                                fontWeight: 'bold'
                              }}
                              title="See what this policy saves you"
                            >
                              i
                            </button>
                            <span className={`tier-badge ${
                              insurance.tier === 'Premium' ? 'tier-premium' :
                              insurance.tier === 'Standard' ? 'tier-standard' :
                              'tier-basic'
                            }`}>
                              {insurance.tier}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>{insurance.coverageDescription}</p>

                        {/* Expandable info section */}
                        {isExpanded && (
                          <div
                            className="mb-3 p-3 rounded text-xs space-y-2 animate-slide-up"
                            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--panel-light)' }}
                          >
                            <div className="comic-subtitle text-xs" style={{ color: 'var(--comic-yellow)' }}>
                              PROTECTS AGAINST: {scenarioName}
                            </div>

                            {/* Without insurance */}
                            <div className="p-2 rounded" style={{ background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.15)' }}>
                              <div className="font-bold mb-1" style={{ color: 'var(--comic-red)' }}>Without insurance:</div>
                              <div style={{ color: 'var(--text-secondary)' }}>
                                You pay: <strong style={{ color: 'var(--comic-red)' }}>${fullDamage}</strong> + lose <strong style={{ color: 'var(--comic-red)' }}>{fullHealthDmg} HP</strong>
                              </div>
                            </div>

                            {/* With this insurance */}
                            <div className="p-2 rounded" style={{ background: 'rgba(6,214,160,0.08)', border: '1px solid rgba(6,214,160,0.15)' }}>
                              <div className="font-bold mb-1" style={{ color: 'var(--comic-green)' }}>With this policy:</div>
                              <div className="space-y-1" style={{ color: 'var(--text-secondary)' }}>
                                <div className="flex justify-between">
                                  <span>Premium (per wave):</span>
                                  <span>${displayCost}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Your deductible:</span>
                                  <span>${insurance.deductible}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Insurance pays ({insurance.coverage}%):</span>
                                  <span style={{ color: 'var(--comic-green)' }}>${coveredAmount}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>You pay ({100 - insurance.coverage}%):</span>
                                  <span>${uncoveredAmount}</span>
                                </div>
                                <div className="flex justify-between pt-1 mt-1 font-bold" style={{ borderTop: '1px solid var(--panel-light)' }}>
                                  <span>Total if hit:</span>
                                  <span>${totalWithInsurance}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>HP damage:</span>
                                  <span>{fullHealthDmg - healthSaved} HP (instead of {fullHealthDmg})</span>
                                </div>
                              </div>
                            </div>

                            {/* Savings */}
                            <div className="text-center p-2 rounded" style={{ background: 'rgba(6,214,160,0.15)' }}>
                              <span style={{ color: 'var(--comic-green)' }}>
                                <strong>Saves you: ${moneySaved} and {healthSaved} HP</strong> if disaster strikes
                              </span>
                            </div>

                            <div style={{ color: 'var(--text-muted)' }}>
                              * Damage varies by wave (early waves hit lighter)
                            </div>
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          <div className="text-sm">
                            <span className="stat-money font-bold">${displayCost}</span>
                            {displayCost !== Math.round(insurance.cost * difficultyPreset.insuranceCostMultiplier) && (
                              <span className="line-through ml-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                                ${Math.round(insurance.cost * difficultyPreset.insuranceCostMultiplier)}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => toggleInsurance(insurance.name)}
                            className={`btn-comic px-4 py-1.5 rounded text-sm ${
                              isSelected ? 'btn-comic-red' : 'btn-comic-green'
                            }`}
                          >
                            {isSelected ? 'DROP' : 'BUY'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              )}

              {/* Retain strategy message */}
              {gameState.selectedStrategy === 'retain' && (
                <div className="mb-6">
                  <div
                    className="comic-panel-inner rounded-lg p-4 text-center"
                    style={{ borderColor: 'var(--comic-yellow)' }}
                  >
                    <p className="comic-subtitle text-lg" style={{ color: 'var(--comic-yellow)' }}>
                      Going unprotected this wave
                    </p>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                      No insurance, no reduction. Full risk, full reward.
                    </p>
                  </div>
                </div>
              )}

              {/* Face Next Challenge Button */}
              <div className="comic-panel-inner rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  {gameState.selectedStrategy === 'transfer' && (
                    <>
                      <p className="comic-subtitle text-lg stat-money">
                        Selected: ${totalCost} total
                      </p>
                      {gameState.selectedInsurance.length === 0 && (
                        <span
                          className="text-xs px-2 py-1 rounded animate-pulse"
                          style={{
                            background: 'rgba(230,57,70,0.15)',
                            color: 'var(--comic-red)',
                            border: '1px solid var(--comic-red)'
                          }}
                        >
                          NO COVERAGE!
                        </span>
                      )}
                    </>
                  )}
                  {gameState.selectedStrategy === 'reduce' && (
                    <p className="comic-subtitle text-lg" style={{ color: 'var(--comic-blue)' }}>
                      {gameState.reduceOptionSelected
                        ? `Reduce: $${Math.round((REDUCE_OPTIONS.find(r => r.id === gameState.reduceOptionSelected)?.cost || 0) * difficultyPreset.insuranceCostMultiplier)}`
                        : 'No reduction selected'}
                    </p>
                  )}
                  {gameState.selectedStrategy === 'avoid' && (
                    <p className="comic-subtitle text-lg" style={{ color: 'var(--text-secondary)' }}>
                      Avoiding this wave
                    </p>
                  )}
                  {gameState.selectedStrategy === 'retain' && (
                    <p className="comic-subtitle text-lg" style={{ color: 'var(--comic-yellow)' }}>
                      Retaining all risk
                    </p>
                  )}
                </div>
                <button
                  onClick={handleNextWave}
                  className="btn-comic btn-comic-green w-full py-3 px-6 rounded-lg text-xl"
                >
                  {gameState.selectedStrategy === 'avoid' ? 'SKIP THIS WAVE' : 'FACE NEXT CHALLENGE'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ════════════ PRE-OUTCOME ANIMATION ════════════ */}
        {gameState.showingPreOutcome && !gameState.isGameOver && <PreOutcomeScreen />}

        {/* ════════════ OUTCOME SCREEN ════════════ */}
        {gameState.showingOutcome && !gameState.isGameOver && (
          <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="max-w-2xl w-full comic-panel rounded-lg p-6 md:p-8 animate-comic-entrance my-4">
              <div className="relative z-10">
                <div className="text-center mb-6">
                  <div
                    className="text-6xl mb-4"
                    style={{ filter: `drop-shadow(0 0 15px ${scenarioColor(gameState.currentScenarioType)}50)` }}
                  >
                    {scenarioIcon(gameState.currentScenarioType)}
                  </div>
                  <h2 className="comic-subtitle text-2xl mb-3" style={{ color: 'var(--comic-green)' }}>
                    Wave {gameState.wave - 1} Complete
                  </h2>
                  <div className="flex justify-center gap-6 text-xl">
                    <span className="comic-subtitle stat-money">${gameState.money.toLocaleString()}</span>
                    <span className="comic-subtitle stat-health">HP {gameState.health}</span>
                  </div>
                </div>

                {/* Speech bubble for the outcome */}
                <div className="speech-bubble mb-6">
                  <p
                    className="font-bold mb-1"
                    style={{ color: scenarioColor(gameState.currentScenarioType) }}
                  >
                    {gameState.currentScenario}
                  </p>
                  <p style={{ color: '#444' }}>{gameState.feedback}</p>
                </div>

                {/* ── INSURANCE MATH BREAKDOWN ── */}
                {waveBreakdown && !waveBreakdown.isSafe && waveBreakdown.baseDamageMoney > 0 && (
                  <div
                    className="mb-6 rounded-lg p-4 space-y-3 animate-slide-up delay-1"
                    style={{ background: 'var(--panel-mid)', border: '2px solid var(--panel-light)' }}
                  >
                    <h3 className="comic-subtitle text-sm" style={{ color: 'var(--comic-yellow)' }}>
                      INSURANCE BREAKDOWN
                    </h3>

                    {waveBreakdown.insuranceTier ? (
                      <>
                        {/* Had insurance */}
                        <div className="space-y-1 text-sm">
                          {/* Total damage */}
                          <div className="flex justify-between py-1">
                            <span style={{ color: 'var(--text-muted)' }}>Total damage this wave:</span>
                            <span style={{ color: 'var(--comic-red)' }}>${waveBreakdown.baseDamageMoney}</span>
                          </div>

                          {/* Insurance covered */}
                          <div className="flex justify-between py-1">
                            <span style={{ color: 'var(--text-muted)' }}>Insurance covered ({waveBreakdown.coveragePercent}%):</span>
                            <span style={{ color: 'var(--comic-green)' }}>-${waveBreakdown.insurancePaidAmount}</span>
                          </div>

                          {/* Deductible */}
                          <div className="flex justify-between py-1">
                            <span style={{ color: 'var(--text-muted)' }}>Your deductible:</span>
                            <span style={{ color: 'var(--text-secondary)' }}>${waveBreakdown.deductiblePaid}</span>
                          </div>

                          {/* Uncovered portion */}
                          <div className="flex justify-between py-1">
                            <span style={{ color: 'var(--text-muted)' }}>Your share ({100 - waveBreakdown.coveragePercent}% uncovered):</span>
                            <span style={{ color: 'var(--text-secondary)' }}>${waveBreakdown.playerPaidDamage}</span>
                          </div>

                          {/* Premium */}
                          <div className="flex justify-between py-1">
                            <span style={{ color: 'var(--text-muted)' }}>Insurance premiums paid:</span>
                            <span style={{ color: 'var(--text-secondary)' }}>${waveBreakdown.premiumPaid}</span>
                          </div>

                          {/* Divider */}
                          <div style={{ borderTop: '1px solid var(--panel-light)' }} className="pt-2 mt-1">
                            <div className="flex justify-between font-bold">
                              <span style={{ color: 'var(--parchment)' }}>Your total cost:</span>
                              <span style={{ color: 'var(--comic-yellow)' }}>${waveBreakdown.totalPlayerCost}</span>
                            </div>
                          </div>

                          {/* HP breakdown */}
                          <div className="flex justify-between py-1">
                            <span style={{ color: 'var(--text-muted)' }}>HP damage:</span>
                            <span>
                              <span style={{ color: 'var(--comic-red)' }}>{waveBreakdown.healthTaken} HP</span>
                              <span style={{ color: 'var(--text-muted)' }}> (instead of {waveBreakdown.healthIfUninsured} HP)</span>
                            </span>
                          </div>
                        </div>

                        {/* Savings banner */}
                        <div
                          className="p-3 rounded text-center text-sm font-bold"
                          style={{ background: 'rgba(6,214,160,0.12)', border: '1px solid rgba(6,214,160,0.25)' }}
                        >
                          <span style={{ color: 'var(--comic-green)' }}>
                            Insurance saved you ${waveBreakdown.moneySaved} and {waveBreakdown.healthSaved} HP!
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* No insurance */}
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between py-1">
                            <span style={{ color: 'var(--text-muted)' }}>Total damage:</span>
                            <span style={{ color: 'var(--comic-red)' }}>${waveBreakdown.baseDamageMoney}</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span style={{ color: 'var(--text-muted)' }}>Insurance coverage:</span>
                            <span style={{ color: 'var(--comic-red)' }}>NONE</span>
                          </div>
                          <div className="flex justify-between py-1 font-bold" style={{ borderTop: '1px solid var(--panel-light)' }}>
                            <span style={{ color: 'var(--parchment)' }}>You paid everything:</span>
                            <span style={{ color: 'var(--comic-red)' }}>${waveBreakdown.baseDamageMoney} + {waveBreakdown.baseDamageHealth} HP</span>
                          </div>
                        </div>

                        {/* What could have been */}
                        {waveBreakdown.moneySaved !== 0 && (
                          <div
                            className="p-3 rounded text-center text-sm"
                            style={{ background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.2)' }}
                          >
                            <span style={{ color: 'var(--comic-red)' }}>
                              Premium insurance would have saved you <strong>${Math.abs(waveBreakdown.moneySaved)}</strong> and <strong>{Math.abs(waveBreakdown.healthSaved)} HP</strong>
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Safe day earnings */}
                {waveBreakdown && waveBreakdown.isSafe && (
                  <div
                    className="mb-6 p-3 rounded text-center text-sm animate-slide-up delay-1"
                    style={{ background: 'rgba(6,214,160,0.08)', border: '1px solid rgba(6,214,160,0.2)' }}
                  >
                    <span style={{ color: 'var(--comic-green)' }}>
                      No damage today! You earned <strong>${waveBreakdown.earnings}</strong> from scavenging.
                      {waveBreakdown.premiumPaid > 0 && (
                        <> (Insurance premiums cost ${waveBreakdown.premiumPaid})</>
                      )}
                    </span>
                  </div>
                )}

                {gameState.selectedInsurance.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Insurance purchased this wave:</p>
                    <div className="flex flex-wrap gap-2">
                      {gameState.selectedInsurance.map((ins, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded text-sm font-medium"
                          style={{
                            background: 'rgba(6,214,160,0.15)',
                            color: 'var(--comic-green)',
                            border: '1px solid rgba(6,214,160,0.3)'
                          }}
                        >
                          {ins}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Real World Connection Card (Feature 3) */}
                <RealWorldCard scenarioType={gameState.currentScenarioType} />

                <button
                  onClick={continueToNextWave}
                  className="btn-comic btn-comic-green w-full py-3 px-6 rounded-lg text-lg"
                >
                  CONTINUE TO WAVE {gameState.wave}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ════════════ GAME OVER SCREEN ════════════ */}
        {gameState.isGameOver && (
          <div ref={gameOverRef} className="comic-panel rounded-lg p-6 md:p-8 animate-comic-entrance">
            <div className="relative z-10">
              <div className="text-center mb-8">
                <div
                  className="text-7xl mb-4"
                  style={{ filter: `drop-shadow(0 0 20px ${gameState.isVictory ? 'rgba(6,214,160,0.5)' : 'rgba(230,57,70,0.5)'})` }}
                >
                  {gameState.isVictory ? '🏆' : '💀'}
                </div>
                <h2
                  className={`comic-title text-5xl md:text-6xl mb-3 ${gameState.isVictory ? 'comic-title-glow-green' : 'comic-title-glow-red'}`}
                  style={{ color: gameState.isVictory ? 'var(--comic-green)' : 'var(--comic-red)' }}
                >
                  {gameState.isVictory ? 'VICTORY!' : 'GAME OVER'}
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {gameState.isVictory
                    ? 'You survived the zombie apocalypse!'
                    : gameState.health <= 0
                      ? 'You were overwhelmed by the zombies...'
                      : 'You ran out of money...'}
                </p>
              </div>

              {/* Final Stats */}
              <div className="comic-panel-inner rounded-lg p-6 mb-6">
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="text-center">
                    <div className="comic-title text-4xl stat-money">
                      {formatScore(getFinalScore())}
                    </div>
                    <div className="text-xs uppercase tracking-wider mt-1" style={{ color: 'var(--text-muted)' }}>Final Score</div>
                  </div>
                  <div className="text-center">
                    <div className="comic-title text-3xl stat-wave">
                      {getPerformanceRating().emoji} {getPerformanceRating().title}
                    </div>
                    <div className="text-xs uppercase tracking-wider mt-1" style={{ color: 'var(--text-muted)' }}>Rating</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center pt-4" style={{ borderTop: '1px solid var(--panel-light)' }}>
                  <div>
                    <div className="comic-subtitle text-xl stat-money">${gameState.money.toLocaleString()}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Money</div>
                  </div>
                  <div>
                    <div className="comic-subtitle text-xl stat-health">{gameState.health}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Health</div>
                  </div>
                  <div>
                    <div className="comic-subtitle text-xl" style={{ color: 'var(--comic-blue)' }}>{gameState.wave - 1}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Waves</div>
                  </div>
                </div>

                {leaderboardRank && (
                  <div className="mt-4 pt-4 text-center" style={{ borderTop: '1px solid var(--panel-light)' }}>
                    <div className={`comic-subtitle text-xl ${leaderboardRank <= 3 ? 'stat-wave' : ''}`} style={{ color: leaderboardRank <= 3 ? undefined : 'var(--text-secondary)' }}>
                      {getPerformanceMessage(leaderboardRank, getTopScores().length)}
                      {leaderboardRank <= 10 && ` (#${leaderboardRank})`}
                    </div>
                  </div>
                )}
              </div>

              {/* Report Card (Feature 4) */}
              <ReportCard
                decisions={gameState.decisionHistory}
                allWaveBreakdowns={gameState.allWaveBreakdowns}
                totalInsuranceSpent={gameState.totalInsuranceSpent}
                money={gameState.money}
                health={gameState.health}
              />

              {/* Decision History */}
              <div className="mb-6">
                <h3 className="comic-subtitle text-lg mb-3" style={{ color: 'var(--parchment)' }}>Decision History</h3>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {gameState.decisionHistory.map((decision, i) => (
                    <div
                      key={i}
                      className="p-3 rounded text-sm"
                      style={{ background: 'var(--panel-mid)', border: '1px solid var(--panel-light)' }}
                    >
                      <div className="flex justify-between">
                        <span className="font-bold" style={{ color: 'var(--parchment)' }}>Wave {decision.wave}</span>
                        <span style={{ color: decision.hadInsurance ? 'var(--comic-green)' : 'var(--comic-red)' }}>
                          {decision.hadInsurance ? 'INSURED' : 'UNINSURED'}
                        </span>
                      </div>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{decision.outcome}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reflection Questions (Feature 5) */}
              <div className="comic-panel-inner rounded-lg p-5 mb-6">
                <h3 className="comic-subtitle text-lg mb-3" style={{ color: 'var(--comic-yellow)' }}>
                  REFLECTION
                </h3>
                <div className="space-y-4">
                  {REFLECTION_QUESTIONS.map((q) => (
                    <div key={q.id}>
                      <label
                        className="block text-sm mb-1 font-medium"
                        style={{ color: 'var(--parchment)' }}
                      >
                        {q.question}
                      </label>
                      <textarea
                        className="w-full p-3 rounded text-sm"
                        rows={3}
                        style={{
                          background: 'var(--panel-mid)',
                          color: 'var(--parchment)',
                          border: '2px solid var(--panel-light)',
                          fontFamily: 'var(--font-bitter, Bitter, serif)',
                          resize: 'vertical',
                        }}
                        placeholder="Type your answer..."
                        value={reflectionAnswers[q.id] || ''}
                        onChange={(e) => setReflectionAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Save Results as PNG */}
                <button
                  onClick={saveResultsAsPng}
                  className="btn-comic w-full py-4 px-6 rounded-lg text-xl"
                  style={{
                    background: 'var(--comic-yellow)',
                    color: '#000',
                    border: '3px solid #000',
                    boxShadow: 'var(--shadow-comic)',
                  }}
                >
                  SAVE MY RESULTS
                </button>
                <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                  Downloads a screenshot of your results to turn in
                </p>

                <button
                  onClick={() => setGameState(prev => ({ ...prev, showStartScreen: true, isGameOver: false }))}
                  className="btn-comic btn-comic-green w-full py-3 px-6 rounded-lg text-lg"
                >
                  PLAY AGAIN
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setGameState(prev => ({ ...prev, showLeaderboard: true }))}
                    className="btn-comic btn-comic-ghost py-3 px-4 rounded-lg text-sm"
                  >
                    LEADERBOARD
                  </button>
                  <button
                    onClick={() => setGameState(prev => ({ ...prev, showAchievements: true }))}
                    className="btn-comic btn-comic-ghost py-3 px-4 rounded-lg text-sm"
                  >
                    ACHIEVEMENTS
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
