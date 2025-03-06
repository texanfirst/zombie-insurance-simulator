'use client';

import { useState, useEffect } from 'react';

interface Insurance {
  name: string;
  tier: 'Basic' | 'Standard' | 'Premium';
  cost: number;
  deductible: number;
  description: string;
  coverageDescription: string;
  uninsuredLoss: {
    money: number;
    health: number;
  };
  coverage: number; // Percentage of loss covered
}

interface GameState {
  wave: number;
  money: number;
  health: number;
  currentScenario: string;
  feedback: string;
  isGameOver: boolean;
  selectedInsurance: string[];
  decisionHistory: Decision[];
  availableInsurance: Insurance[];
  showingOutcome: boolean;
  showingPreOutcome: boolean;
  currentScenarioType: string;
  preOutcomeStage: 'horde' | 'scenario' | null;
}

interface Decision {
  wave: number;
  scenario: string;
  insurancePurchased: string[];
  moneySpent: number;
  moneyLost: number;
  healthLost: number;
  outcome: string;
}

export default function Home() {
  const INSURANCE_OPTIONS: Insurance[] = [
    // Home Fortification Tiers
    {
      name: "Basic Home Fortification",
      tier: 'Basic',
      cost: 300,
      deductible: 200,
      description: "Basic protection against zombie break-ins",
      coverageDescription: "Covers 50% of damages after deductible",
      uninsuredLoss: { money: 1500, health: 10 },
      coverage: 50
    },
    {
      name: "Standard Home Fortification",
      tier: 'Standard',
      cost: 500,
      deductible: 150,
      description: "Enhanced protection with reinforced barriers",
      coverageDescription: "Covers 75% of damages after deductible",
      uninsuredLoss: { money: 1500, health: 10 },
      coverage: 75
    },
    {
      name: "Premium Home Fortification",
      tier: 'Premium',
      cost: 800,
      deductible: 100,
      description: "Military-grade fortification system",
      coverageDescription: "Covers 90% of damages after deductible",
      uninsuredLoss: { money: 1500, health: 10 },
      coverage: 90
    },
    // Medical Insurance Tiers
    {
      name: "Basic Zombie Bite Treatment",
      tier: 'Basic',
      cost: 200,
      deductible: 100,
      description: "Basic medical coverage for zombie-related injuries",
      coverageDescription: "Covers 50% of medical costs after deductible",
      uninsuredLoss: { money: 1000, health: 20 },
      coverage: 50
    },
    {
      name: "Standard Zombie Bite Treatment",
      tier: 'Standard',
      cost: 400,
      deductible: 75,
      description: "Enhanced medical coverage with better treatments",
      coverageDescription: "Covers 75% of medical costs after deductible",
      uninsuredLoss: { money: 1000, health: 20 },
      coverage: 75
    },
    {
      name: "Premium Zombie Bite Treatment",
      tier: 'Premium',
      cost: 600,
      deductible: 50,
      description: "Top-tier medical coverage with experimental treatments",
      coverageDescription: "Covers 90% of medical costs after deductible",
      uninsuredLoss: { money: 1000, health: 20 },
      coverage: 90
    },
    // Supply Protection Tiers
    {
      name: "Basic Supply Protection",
      tier: 'Basic',
      cost: 400,
      deductible: 300,
      description: "Basic coverage for supply losses",
      coverageDescription: "Covers 50% of supply losses after deductible",
      uninsuredLoss: { money: 2000, health: 15 },
      coverage: 50
    },
    {
      name: "Standard Supply Protection",
      tier: 'Standard',
      cost: 600,
      deductible: 200,
      description: "Enhanced coverage with security systems",
      coverageDescription: "Covers 75% of supply losses after deductible",
      uninsuredLoss: { money: 2000, health: 15 },
      coverage: 75
    },
    {
      name: "Premium Supply Protection",
      tier: 'Premium',
      cost: 900,
      deductible: 100,
      description: "Maximum security for your supplies",
      coverageDescription: "Covers 90% of supply losses after deductible",
      uninsuredLoss: { money: 2000, health: 15 },
      coverage: 90
    },
    // Evacuation Insurance Tiers
    {
      name: "Basic Evacuation Coverage",
      tier: 'Basic',
      cost: 500,
      deductible: 250,
      description: "Basic evacuation assistance",
      coverageDescription: "Covers 50% of evacuation costs after deductible",
      uninsuredLoss: { money: 2500, health: 25 },
      coverage: 50
    },
    {
      name: "Standard Evacuation Coverage",
      tier: 'Standard',
      cost: 800,
      deductible: 175,
      description: "Enhanced evacuation with better transport",
      coverageDescription: "Covers 75% of evacuation costs after deductible",
      uninsuredLoss: { money: 2500, health: 25 },
      coverage: 75
    },
    {
      name: "Premium Evacuation Coverage",
      tier: 'Premium',
      cost: 1200,
      deductible: 100,
      description: "VIP evacuation with helicopter transport",
      coverageDescription: "Covers 90% of evacuation costs after deductible",
      uninsuredLoss: { money: 2500, health: 25 },
      coverage: 90
    }
  ];

  const [gameState, setGameState] = useState<GameState>({
    wave: 1,
    money: 10000,
    health: 100,
    currentScenario: '',
    feedback: '',
    isGameOver: false,
    selectedInsurance: [],
    decisionHistory: [],
    availableInsurance: INSURANCE_OPTIONS,
    showingOutcome: false,
    showingPreOutcome: false,
    currentScenarioType: '',
    preOutcomeStage: null
  });

  const scenarios = [
    {
      type: "Home Attack",
      description: "A horde of zombies is attempting to break into your safehouse!",
      requiredInsurance: "Home Fortification",
      probability: 0.3
    },
    {
      type: "Injury",
      description: "One of your group members has been bitten during a supply run!",
      requiredInsurance: "Zombie Bite Treatment",
      probability: 0.2
    },
    {
      type: "Supply Loss",
      description: "Your supply cache has been discovered by raiders!",
      requiredInsurance: "Supply Raid Protection",
      probability: 0.3
    },
    {
      type: "Evacuation",
      description: "The safe zone has been compromised! Everyone must evacuate immediately!",
      requiredInsurance: "Safe Zone Evacuation",
      probability: 0.2
    }
  ];

  const startGame = () => {
    const firstScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    setGameState({
      wave: 1,
      money: 10000,
      health: 100,
      currentScenario: firstScenario.description,
      feedback: '',
      isGameOver: false,
      selectedInsurance: [],
      decisionHistory: [],
      availableInsurance: INSURANCE_OPTIONS,
      showingOutcome: false,
      showingPreOutcome: false,
      currentScenarioType: firstScenario.type,
      preOutcomeStage: null
    });
  };

  const toggleInsurance = (insuranceName: string) => {
    // Get the base type of insurance (e.g., "Home Fortification" from "Premium Home Fortification")
    const baseType = insuranceName.split(' ').slice(1).join(' ');
    
    setGameState(prev => {
      // If we're removing insurance, just filter it out
      if (prev.selectedInsurance.includes(insuranceName)) {
        return {
          ...prev,
          selectedInsurance: prev.selectedInsurance.filter(name => name !== insuranceName)
        };
      }
      
      // If adding insurance, remove any existing insurance of the same type first
      const filteredInsurance = prev.selectedInsurance.filter(name => 
        !name.split(' ').slice(1).join(' ').includes(baseType)
      );
      
      return {
        ...prev,
        selectedInsurance: [...filteredInsurance, insuranceName]
      };
    });
  };

  const calculateInsuranceCost = (selectedInsurance: string[]) => {
    return selectedInsurance.reduce((total, name) => {
      const insurance = INSURANCE_OPTIONS.find(i => i.name === name);
      return total + (insurance?.cost || 0);
    }, 0);
  };

  const handleNextWave = () => {
    const insuranceCost = calculateInsuranceCost(gameState.selectedInsurance);
    
    const roll = Math.random();
    let cumulativeProbability = 0;
    const scenario = scenarios.find(s => {
      cumulativeProbability += s.probability;
      return roll <= cumulativeProbability;
    }) || scenarios[0];

    const baseEarnings = 1000 + (gameState.wave * 100);

    // Find the best matching insurance for the scenario
    const matchingInsurance = gameState.selectedInsurance
      .map(name => INSURANCE_OPTIONS.find(i => i.name === name))
      .filter(i => i?.name.toLowerCase().includes(scenario.requiredInsurance.toLowerCase()))
      .sort((a, b) => (b?.coverage || 0) - (a?.coverage || 0))[0];

    let moneyLost = insuranceCost;
    let healthLost = 0;
    let outcomeMessage = '';

    if (matchingInsurance) {
      const baseLoss = matchingInsurance.uninsuredLoss.money;
      const coveredLoss = baseLoss * (matchingInsurance.coverage / 100);
      const actualLoss = matchingInsurance.deductible + (baseLoss - coveredLoss);
      moneyLost += actualLoss;
      healthLost = Math.floor(matchingInsurance.uninsuredLoss.health * (1 - matchingInsurance.coverage / 100));
      outcomeMessage = `Protected by ${matchingInsurance.tier} insurance! Paid $${actualLoss} (${matchingInsurance.coverage}% coverage + $${matchingInsurance.deductible} deductible). Earned $${baseEarnings} from survival activities.`;
    } else {
      const requiredInsuranceDetails = INSURANCE_OPTIONS.find(i => 
        i.name.toLowerCase().includes(scenario.requiredInsurance.toLowerCase()) && i.tier === 'Basic'
      );
      moneyLost += requiredInsuranceDetails?.uninsuredLoss.money || 0;
      healthLost = requiredInsuranceDetails?.uninsuredLoss.health || 0;
      outcomeMessage = `No insurance! Lost $${requiredInsuranceDetails?.uninsuredLoss.money} and ${requiredInsuranceDetails?.uninsuredLoss.health} health points. Still earned $${baseEarnings} from survival activities.`;
    }

    const netMoneyChange = baseEarnings - moneyLost;

    const decision: Decision = {
      wave: gameState.wave,
      scenario: scenario.description,
      insurancePurchased: gameState.selectedInsurance,
      moneySpent: insuranceCost,
      moneyLost: moneyLost,
      healthLost: healthLost,
      outcome: outcomeMessage
    };

    const newMoney = gameState.money + netMoneyChange;
    const newHealth = gameState.health - healthLost;

    setGameState(prev => ({
      ...prev,
      wave: prev.wave + 1,
      money: newMoney,
      health: newHealth,
      currentScenario: scenario.description,
      feedback: outcomeMessage,
      isGameOver: prev.wave >= 20 || newHealth <= 0 || newMoney <= 0,
      decisionHistory: [...prev.decisionHistory, decision],
      showingPreOutcome: true,
      showingOutcome: false,
      currentScenarioType: scenario.type,
      preOutcomeStage: 'horde'
    }));
  };

  const continueToOutcome = () => {
    const nextScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    setGameState(prev => ({
      ...prev,
      showingPreOutcome: false,
      showingOutcome: false,
      currentScenario: nextScenario.description,
      currentScenarioType: nextScenario.type,
      selectedInsurance: [],
      preOutcomeStage: null
    }));
  };

  const getFinalScore = () => {
    return gameState.money + (gameState.health * 50); // Reduced health value multiplier to make money more important
  };

  const getPerformanceRating = () => {
    const score = getFinalScore();
    if (score >= 25000) return "Insurance Master";
    if (score >= 20000) return "Risk Management Expert";
    if (score >= 15000) return "Insurance Professional";
    if (score >= 10000) return "Risk Manager";
    return "Insurance Apprentice";
  };

  // Add this new component for cost summary
  const InsuranceCostSummary = ({ selectedInsurance, wave }: { selectedInsurance: string[], wave: number }) => {
    const baseIncome = 1000 + (wave * 100);
    const totalCost = selectedInsurance.reduce((total, name) => {
      const insurance = INSURANCE_OPTIONS.find(i => i.name === name);
      return total + (insurance?.cost || 0);
    }, 0);
    const netIncome = baseIncome - totalCost;

    return (
      <div className="bg-gray-700 p-4 rounded-lg mb-4">
        <h3 className="text-xl font-bold mb-2 text-green-400">Financial Summary</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-300">Base Income:</p>
            <p className="text-green-400 text-lg">+${baseIncome}</p>
          </div>
          <div>
            <p className="text-gray-300">Insurance Costs:</p>
            <p className="text-red-400 text-lg">-${totalCost}</p>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-gray-600">
          <p className="text-gray-300">Net Income per Round:</p>
          <p className={`text-xl font-bold ${netIncome >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${netIncome}
          </p>
        </div>
      </div>
    );
  };

  // Add this new component for the progress bar
  const ProgressBar = ({ progress }: { progress: number }) => (
    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
      <div 
        className="h-full bg-red-500"
        style={{ 
          width: `${progress}%`,
          transition: 'width 0.1s linear'
        }}
      />
    </div>
  );

  // Add this new component for the pre-outcome screen
  const PreOutcomeScreen = ({ scenarioType, hasInsurance }: { scenarioType: string, hasInsurance: boolean }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
      const duration = gameState.preOutcomeStage === 'horde' ? 5000 : 3000;
      const interval = 50;
      const steps = duration / interval;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        setProgress((currentStep / steps) * 100);
        
        if (currentStep >= steps) {
          clearInterval(timer);
          if (gameState.preOutcomeStage === 'horde') {
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

    return (
      <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
        <div className="w-full h-full relative overflow-hidden">
          {/* Dynamic background */}
          <div className={`absolute inset-0 ${
            gameState.preOutcomeStage === 'horde' ? "bg-red-900/20" :
            scenarioType === "Home Attack" ? "bg-red-900/20" :
            scenarioType === "Injury" ? "bg-yellow-900/20" :
            scenarioType === "Supply Loss" ? "bg-purple-900/20" :
            "bg-blue-900/20"
          } animate-pulse`}></div>

          {/* Zombie horde stage */}
          {gameState.preOutcomeStage === 'horde' && (
            <div className="absolute inset-0">
              {/* Zombies */}
              <div className="relative w-full h-full">
                {Array(15).fill(null).map((_, i) => {
                  const row = Math.floor(i / 5);
                  const col = i % 5;
                  const yPos = 25 + (row * 20);
                  const xPos = 100 - (progress * 1.2) + (col * 10);
                  const zombieEmoji = ['🧟‍♂️', '🧟‍♀️', '🧟'][i % 3];
                  return (
                    <div 
                      key={i}
                      className="absolute text-8xl transition-all duration-100 ease-linear"
                      style={{
                        top: `${yPos}%`,
                        left: `${xPos}%`,
                        transform: `translateY(${Math.sin(progress/10 + i) * 10}px)`,
                        zIndex: 15 - i
                      }}
                    >
                      {zombieEmoji}
                    </div>
                  );
                })}
              </div>

              {/* Text overlay */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="text-center">
                  <h2 className="text-6xl font-bold text-red-500 mb-4 text-shadow-lg animate-bounce">
                    ZOMBIE HORDE APPROACHING!
                  </h2>
                </div>
              </div>
            </div>
          )}

          {/* Scenario-specific stage */}
          {gameState.preOutcomeStage === 'scenario' && (
            <div className="absolute inset-0">
              {scenarioType === "Supply Loss" && (
                <div className="relative w-full h-full">
                  {/* Add stolen supplies emoji first so they appear behind the raiders */}
                  {Array(3).fill(null).map((_, i) => (
                    <div 
                      key={i}
                      className="absolute text-6xl transition-all duration-100 ease-linear"
                      style={{
                        top: `${25 + (i * 15)}%`,
                        left: `${95 - (progress * 1.2) + (i * 5)}%`,
                        transform: `translateY(${Math.sin(progress/8 + i) * 10}px)`,
                        zIndex: 9
                      }}
                    >
                      📦
                    </div>
                  ))}
                  {/* Raiders running with correct facing direction */}
                  {Array(6).fill(null).map((_, i) => (
                    <div 
                      key={i}
                      className="absolute text-8xl transition-all duration-100 ease-linear"
                      style={{
                        top: `${20 + (i * 12)}%`,
                        left: `${100 - (progress * 1.2) + (i * 8)}%`,
                        transform: `translateY(${Math.sin(progress/10 + i) * 15}px)`,
                        zIndex: 10
                      }}
                    >
                      {i % 2 === 0 ? '🏃‍♂️' : '🏃‍♀️'}
                    </div>
                  ))}
                </div>
              )}

              {scenarioType === "Evacuation" && (
                <div className="relative w-full h-full">
                  {Array(3).fill(null).map((_, i) => (
                    <div 
                      key={i}
                      className="absolute text-8xl transition-all duration-100 ease-linear"
                      style={{
                        top: `${30 + (i * 20)}%`,
                        left: `${100 - (progress * 1.2)}%`,
                        transform: `translateY(${Math.sin(progress/10 + i) * 10}px)`,
                        zIndex: 10
                      }}
                    >
                      🚁
                    </div>
                  ))}
                  {Array(5).fill(null).map((_, i) => (
                    <div 
                      key={i}
                      className="absolute text-6xl transition-all duration-100 ease-linear"
                      style={{
                        top: `${40 + (i * 10)}%`,
                        left: `${90 - (progress * 1.2) + (i * 5)}%`,
                        transform: `translateY(${Math.sin(progress/8 + i) * 15}px)`,
                        zIndex: 9
                      }}
                    >
                      🏃‍♂️
                    </div>
                  ))}
                </div>
              )}

              {/* Text overlay for scenario stage */}
              <div className="absolute inset-x-0 bottom-1/4 text-center z-20">
                <h2 className="text-6xl font-bold mb-4 animate-bounce text-shadow-lg" style={{
                  color: scenarioType === "Home Attack" ? "#ef4444" :
                         scenarioType === "Injury" ? "#eab308" :
                         scenarioType === "Supply Loss" ? "#a855f7" :
                         "#3b82f6"
                }}>
                  {scenarioType === "Home Attack" ? "DEFENDING YOUR HOME!" :
                   scenarioType === "Injury" ? "TREATING THE WOUNDED!" :
                   scenarioType === "Supply Loss" ? "PROTECTING SUPPLIES!" :
                   "EVACUATING NOW!"}
                </h2>
              </div>
            </div>
          )}

          {/* Progress bar */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-1/2">
            <ProgressBar progress={progress} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 bg-gray-900">
      <div className="z-10 max-w-6xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-5xl font-bold text-center mb-8 text-green-400 animate-pulse">Zombie Apocalypse Insurance Simulator</h1>
        
        {!gameState.currentScenario && !gameState.isGameOver && (
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center transform hover:scale-105 transition-transform duration-300">
            <h2 className="text-3xl mb-4 text-green-300">Welcome to Insurance Training</h2>
            <p className="mb-4 text-gray-300">Learn about insurance by managing risks in a zombie apocalypse! Make strategic decisions about insurance coverage to protect your resources and health.</p>
            <ul className="text-left mb-6 space-y-2 text-gray-300">
              <li className="flex items-center"><span className="text-green-400 mr-2">•</span> Starting money: $10,000</li>
              <li className="flex items-center"><span className="text-green-400 mr-2">•</span> Starting health: 100 points</li>
              <li className="flex items-center"><span className="text-green-400 mr-2">•</span> Each health point = $50 in final scoring</li>
              <li className="flex items-center"><span className="text-green-400 mr-2">•</span> Survive 20 waves of zombie incidents</li>
            </ul>
            <button 
              onClick={startGame}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-green-500/50"
            >
              Start Game
            </button>
          </div>
        )}

        {gameState.currentScenario && !gameState.isGameOver && !gameState.showingOutcome && (
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg animate-fadeIn">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-green-400">Wave {gameState.wave} of 20</h2>
                <div className="flex gap-4">
                  <p className="text-2xl text-green-500">${gameState.money}</p>
                  <p className="text-2xl text-red-500">❤️ {gameState.health}</p>
                </div>
              </div>

              <InsuranceCostSummary selectedInsurance={gameState.selectedInsurance} wave={gameState.wave} />

              <div className="mb-6">
                <h3 className="text-xl font-bold mb-4 text-green-300">Insurance Policies:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {INSURANCE_OPTIONS.map((insurance) => (
                    <div key={insurance.name} 
                         className={`p-4 rounded-lg transform transition-all duration-300 hover:scale-105 ${
                           insurance.tier === 'Premium' ? 'bg-purple-900/50 border-2 border-purple-500' :
                           insurance.tier === 'Standard' ? 'bg-blue-900/50 border-2 border-blue-500' :
                           'bg-gray-700/50 border-2 border-gray-500'
                         }`}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className={`font-bold ${
                          insurance.tier === 'Premium' ? 'text-purple-400' :
                          insurance.tier === 'Standard' ? 'text-blue-400' :
                          'text-gray-300'
                        }`}>{insurance.name}</h4>
                        <span className={`px-2 py-1 rounded text-xs ${
                          insurance.tier === 'Premium' ? 'bg-purple-500' :
                          insurance.tier === 'Standard' ? 'bg-blue-500' :
                          'bg-gray-500'
                        }`}>{insurance.tier}</span>
                      </div>
                      <p className="text-sm text-gray-300 mb-2">{insurance.description}</p>
                      <p className="text-sm text-gray-400 mb-2">{insurance.coverageDescription}</p>
                      <div className="flex justify-between items-center mt-2">
                        <div>
                          <p className="text-green-400">Cost: ${insurance.cost}</p>
                          <p className="text-yellow-400">Deductible: ${insurance.deductible}</p>
                        </div>
                        <button
                          onClick={() => toggleInsurance(insurance.name)}
                          className={`px-4 py-2 rounded-lg transform transition-all duration-300 ${
                            gameState.selectedInsurance.includes(insurance.name)
                              ? 'bg-red-500 hover:bg-red-600 scale-105'
                              : 'bg-green-500 hover:bg-green-600'
                          }`}
                        >
                          {gameState.selectedInsurance.includes(insurance.name) ? 'Remove' : 'Purchase'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <div className="bg-gray-700 p-4 rounded-lg mb-4">
                  <p className="text-xl text-green-400 mb-2">Selected Insurance Cost: ${calculateInsuranceCost(gameState.selectedInsurance)}</p>
                  <button
                    onClick={handleNextWave}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-green-500/50"
                  >
                    Face Next Challenge
                  </button>
                </div>
              </div>
            </div>

            {gameState.feedback && (
              <div className="mt-6 p-6 bg-gray-700 rounded-lg animate-slideIn">
                <h3 className="text-xl font-bold mb-3 text-green-400">Wave Outcome:</h3>
                <p className="text-lg mb-2 text-yellow-300">{gameState.currentScenario}</p>
                <p className="text-gray-300">{gameState.feedback}</p>
              </div>
            )}
          </div>
        )}

        {gameState.showingPreOutcome && !gameState.isGameOver && (
          <PreOutcomeScreen 
            scenarioType={gameState.currentScenarioType}
            hasInsurance={gameState.selectedInsurance.some(insurance => 
              insurance.toLowerCase().includes(scenarios.find(s => s.type === gameState.currentScenarioType)?.requiredInsurance.toLowerCase() || '')
            )}
          />
        )}

        {gameState.showingOutcome && !gameState.isGameOver && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 animate-fadeIn">
            <div className="max-w-4xl w-full bg-gray-800 p-8 rounded-lg shadow-2xl transform animate-slideIn">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-red-500/20 rounded-lg animate-pulse"></div>
                <div className="relative z-10">
                  <div className="mb-8 text-center">
                    <div className="zombie-horde-container overflow-hidden h-32 mb-4">
                      <div className="zombie-horde flex animate-hordeApproach">
                        {Array(5).fill(null).map((_, i) => (
                          <div key={i} className={`text-6xl transform ${i % 2 === 0 ? 'animate-zombieWalk1' : 'animate-zombieWalk2'}`}>
                            {['🧟‍♂️', '🧟‍♀️', '🧟'][i % 3]}
                          </div>
                        ))}
                      </div>
                    </div>
                    <h2 className="text-4xl font-bold mb-4 text-green-400">Wave {gameState.wave - 1} Outcome</h2>
                    <div className="flex justify-center gap-8 mb-6">
                      <div className="text-2xl">
                        <span className="text-green-500">${gameState.money}</span>
                      </div>
                      <div className="text-2xl">
                        <span className="text-red-500">❤️ {gameState.health}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <div className={`text-2xl mb-4 text-center ${
                      gameState.currentScenario.includes("zombies") ? "text-red-400" :
                      gameState.currentScenario.includes("bitten") ? "text-yellow-400" :
                      gameState.currentScenario.includes("raiders") ? "text-purple-400" :
                      "text-blue-400"
                    } animate-bounce`}>
                      {gameState.currentScenario}
                    </div>
                    
                    <div className="flex items-center justify-center mb-6">
                      <div className={`text-6xl mb-4 ${
                        gameState.currentScenario.includes("zombies") ? "text-red-500" :
                        gameState.currentScenario.includes("bitten") ? "text-yellow-500" :
                        gameState.currentScenario.includes("raiders") ? "text-purple-500" :
                        "text-blue-500"
                      }`}>
                        {gameState.currentScenario.includes("zombies") ? "🧟" :
                         gameState.currentScenario.includes("bitten") ? "🩺" :
                         gameState.currentScenario.includes("raiders") ? "🏃" :
                         "🚁"}
                      </div>
                    </div>

                    <div className="bg-gray-700 p-6 rounded-lg">
                      <h3 className="text-xl font-bold mb-4 text-center text-green-400">Insurance Impact</h3>
                      <div className="space-y-4">
                        {gameState.selectedInsurance.length > 0 ? (
                          <div>
                            <p className="text-lg text-center mb-2">Protected by:</p>
                            <div className="flex flex-wrap justify-center gap-2">
                              {gameState.selectedInsurance.map((insurance, index) => (
                                <span key={index} className="px-3 py-1 bg-green-500/20 rounded-full text-green-400">
                                  {insurance}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-lg text-center text-red-400">No Insurance Protection!</p>
                        )}
                        <p className="text-lg text-center text-gray-300">{gameState.feedback}</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <button
                      onClick={continueToOutcome}
                      className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-green-500/50"
                    >
                      Continue to Wave {gameState.wave}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {gameState.isGameOver && (
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg animate-fadeIn">
            <h2 className="text-3xl mb-6 text-center text-green-400">Game Over</h2>
            <div className="mb-8 bg-gray-700 p-6 rounded-lg">
              <h3 className="text-2xl mb-4 text-green-300">Final Results</h3>
              <ul className="space-y-3 text-lg">
                <li className="flex justify-between">
                  <span>Remaining Money:</span>
                  <span className="text-green-400">${gameState.money}</span>
                </li>
                <li className="flex justify-between">
                  <span>Remaining Health:</span>
                  <span className="text-red-400">{gameState.health}</span>
                </li>
                <li className="flex justify-between">
                  <span>Final Score:</span>
                  <span className="text-yellow-400">${getFinalScore()}</span>
                </li>
                <li className="flex justify-between">
                  <span>Rating:</span>
                  <span className="text-purple-400">{getPerformanceRating()}</span>
                </li>
              </ul>
            </div>

            <div className="mb-8">
              <h3 className="text-xl mb-4 text-green-300">Decision History</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {gameState.decisionHistory.map((decision, index) => (
                  <div key={index} className="p-4 rounded-lg bg-gray-700 transform transition-all duration-300 hover:scale-105">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-green-400">Wave {decision.wave}</h4>
                      <span className="text-yellow-400">${decision.moneySpent}</span>
                    </div>
                    <p className="text-sm mb-2 text-gray-300">{decision.scenario}</p>
                    <p className="text-sm text-gray-400">Insurance: {decision.insurancePurchased.join(', ') || 'None'}</p>
                    <p className="text-sm text-gray-400">{decision.outcome}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <button 
                onClick={startGame}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg transform hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-green-500/50"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// Update the styles section
const styles = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { transform: translateY(20px) scale(0.95); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out;
}

.animate-slideIn {
  animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.animate-bounce {
  animation: bounce 2s infinite;
}

@keyframes hordeApproach {
  0% { transform: translateX(100vw) scale(0.5); opacity: 0; }
  20% { transform: translateX(60vw) scale(0.8); opacity: 0.6; }
  80% { transform: translateX(-60vw) scale(1.2); opacity: 1; }
  100% { transform: translateX(-100vw) scale(1.5); opacity: 0; }
}

@keyframes zombieWalk1 {
  0%, 100% { transform: translateY(0) rotate(-5deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

@keyframes zombieWalk2 {
  0%, 100% { transform: translateY(-20px) rotate(5deg); }
  50% { transform: translateY(0) rotate(-5deg); }
}

.zombie-horde {
  animation: hordeApproach 5s linear;
}

.animate-zombieWalk1 {
  animation: zombieWalk1 1s ease-in-out infinite;
}

.animate-zombieWalk2 {
  animation: zombieWalk2 1s ease-in-out infinite;
}

@keyframes dramatic-text {
  0% { transform: scale(0.5); opacity: 0; }
  25% { transform: scale(1.2); opacity: 1; }
  75% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes float-left {
  0% { transform: translateX(0) translateY(0) rotate(0deg); }
  25% { transform: translateX(-20px) translateY(-10px) rotate(-10deg); }
  75% { transform: translateX(20px) translateY(10px) rotate(10deg); }
  100% { transform: translateX(0) translateY(0) rotate(0deg); }
}

@keyframes float-right {
  0% { transform: translateX(0) translateY(0) rotate(0deg); }
  25% { transform: translateX(20px) translateY(-10px) rotate(10deg); }
  75% { transform: translateX(-20px) translateY(10px) rotate(-10deg); }
  100% { transform: translateX(0) translateY(0) rotate(0deg); }
}

@keyframes pulse-rotate {
  0% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.5) rotate(180deg); }
  100% { transform: scale(1) rotate(360deg); }
}

@keyframes zombie-approach {
  0% { 
    transform: translate(100vw, 0) scale(0.5) rotate(0deg);
    opacity: 0;
  }
  50% {
    transform: translate(0, 0) scale(1.2) rotate(-5deg);
    opacity: 1;
  }
  100% { 
    transform: translate(-100vw, 0) scale(0.5) rotate(5deg);
    opacity: 0;
  }
}

@keyframes zombie-bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

@keyframes zombie-sway {
  0% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
  100% { transform: rotate(-5deg); }
}

.zombie-character {
  position: absolute;
  animation: zombie-approach 5s linear, zombie-bob 1s ease-in-out infinite, zombie-sway 2s ease-in-out infinite;
}

@keyframes zombie-attack {
  0% { 
    transform: translateX(100vw) translateY(0) scale(0.5) rotate(0deg);
    opacity: 0;
  }
  20% {
    transform: translateX(50vw) translateY(-30px) scale(0.8) rotate(-10deg);
    opacity: 0.8;
  }
  80% {
    transform: translateX(-50vw) translateY(30px) scale(1.2) rotate(10deg);
    opacity: 1;
  }
  100% { 
    transform: translateX(-100vw) translateY(0) scale(1.5) rotate(20deg);
    opacity: 0;
  }
}

@keyframes raider-run {
  0% { 
    transform: translateX(100vw) translateY(0) scale(0.5) skewX(10deg);
    opacity: 0;
  }
  20% {
    transform: translateX(50vw) translateY(-40px) scale(0.8) skewX(-10deg);
    opacity: 1;
  }
  80% {
    transform: translateX(-50vw) translateY(40px) scale(1.2) skewX(10deg);
    opacity: 1;
  }
  100% { 
    transform: translateX(-100vw) translateY(0) scale(1.5) skewX(-10deg);
    opacity: 0;
  }
}

@keyframes helicopter {
  0% { 
    transform: translate(-50vw, 100vh) rotate(0deg) scale(0.5);
    opacity: 0;
  }
  20% {
    transform: translate(-25vw, 50vh) rotate(45deg) scale(0.8);
    opacity: 1;
  }
  50% {
    transform: translate(0, 0) rotate(180deg) scale(1.2);
    opacity: 1;
  }
  80% {
    transform: translate(25vw, -50vh) rotate(315deg) scale(0.8);
    opacity: 1;
  }
  100% { 
    transform: translate(50vw, -100vh) rotate(360deg) scale(0.5);
    opacity: 0;
  }
}

.animate-float-left {
  animation: float-left 3s ease-in-out infinite;
}

.animate-float-right {
  animation: float-right 3s ease-in-out infinite;
}

.animate-pulse-rotate {
  animation: pulse-rotate 3s ease-in-out infinite;
}

.text-shadow-lg {
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.5),
               0 0 20px rgba(0, 0, 0, 0.5),
               0 0 30px rgba(0, 0, 0, 0.5);
}

.zombie-horde-massive {
  position: absolute;
  width: 100%;
  height: 100%;
  perspective: 2000px;
  transform-style: preserve-3d;
}

.zombie-horde-container {
  position: absolute;
  width: 100%;
  height: 100%;
  perspective: 1000px;
  transform-style: preserve-3d;
}

.medical-emergency {
  display: flex;
  gap: 4rem;
  align-items: center;
  justify-content: center;
  perspective: 1000px;
  transform-style: preserve-3d;
}

.raiders-approach {
  position: absolute;
  width: 100%;
  height: 100%;
  perspective: 1000px;
  transform-style: preserve-3d;
}

.evacuation-scene {
  position: relative;
  width: 100%;
  height: 100%;
  perspective: 1000px;
  transform-style: preserve-3d;
}

.animate-emergency {
  animation: emergency 1s infinite;
  filter: drop-shadow(0 0 10px rgba(255, 0, 0, 0.5));
}

@keyframes zombie {
  0% {
    transform: translateX(120vw) translateY(0) rotate(0deg);
    opacity: 0;
  }
  5% {
    transform: translateX(100vw) translateY(-10px) rotate(-5deg);
    opacity: 1;
  }
  45% {
    transform: translateX(20vw) translateY(10px) rotate(5deg);
    opacity: 1;
  }
  95% {
    transform: translateX(-100vw) translateY(-10px) rotate(-5deg);
    opacity: 1;
  }
  100% {
    transform: translateX(-120vw) translateY(0) rotate(0deg);
    opacity: 0;
  }
}

@keyframes zombieBob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.animate-zombie {
  animation: zombie 8s linear forwards, zombieBob 1s ease-in-out infinite;
  will-change: transform;
}

@keyframes moveZombie {
  0% {
    left: 100%;
    transform: translateY(0) rotate(0deg);
  }
  25% {
    left: 75%;
    transform: translateY(-20px) rotate(-5deg);
  }
  75% {
    left: 25%;
    transform: translateY(20px) rotate(5deg);
  }
  100% {
    left: -20%;
    transform: translateY(0) rotate(0deg);
  }
}

@keyframes moveRaider {
  0% {
    left: 100%;
    transform: translateY(0);
  }
  25% {
    left: 75%;
    transform: translateY(-30px);
  }
  75% {
    left: 25%;
    transform: translateY(30px);
  }
  100% {
    left: -20%;
    transform: translateY(0);
  }
}

@keyframes emergency {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.5;
  }
}

@keyframes zombieWalk {
  0% {
    right: -20%;
    transform: translateY(0) rotate(0deg);
  }
  25% {
    right: 20%;
    transform: translateY(-20px) rotate(-5deg);
  }
  75% {
    right: 60%;
    transform: translateY(20px) rotate(5deg);
  }
  100% {
    right: 120%;
    transform: translateY(0) rotate(0deg);
  }
}

@keyframes zombieAttack {
  0% {
    right: -10%;
    transform: translateY(0) rotate(0deg) scale(1);
  }
  50% {
    transform: translateY(-30px) rotate(-10deg) scale(1.2);
  }
  100% {
    right: 110%;
    transform: translateY(0) rotate(10deg) scale(1);
  }
}
`;

