'use client';

import { Difficulty } from '@/types/game';
import { DIFFICULTY_PRESETS } from '@/lib/difficulty';

interface DifficultySelectorProps {
  selected: Difficulty;
  onChange: (difficulty: Difficulty) => void;
}

export default function DifficultySelector({ selected, onChange }: DifficultySelectorProps) {
  const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];

  const difficultyConfig = {
    easy: { color: 'var(--comic-green)', bgAlpha: '0.1', label: 'EASY' },
    medium: { color: 'var(--comic-yellow)', bgAlpha: '0.1', label: 'MEDIUM' },
    hard: { color: 'var(--comic-red)', bgAlpha: '0.1', label: 'HARD' }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
        Select Difficulty
      </label>
      <div className="grid grid-cols-3 gap-3">
        {difficulties.map(difficulty => {
          const preset = DIFFICULTY_PRESETS[difficulty];
          const config = difficultyConfig[difficulty];
          const isSelected = selected === difficulty;

          return (
            <button
              key={difficulty}
              onClick={() => onChange(difficulty)}
              className="p-4 rounded-lg transition-all text-center"
              style={{
                background: isSelected ? `color-mix(in srgb, ${config.color} 15%, var(--panel-dark))` : 'var(--panel-mid)',
                border: `2px solid ${isSelected ? config.color : 'var(--panel-light)'}`,
                boxShadow: isSelected ? `0 0 15px color-mix(in srgb, ${config.color} 20%, transparent)` : 'none'
              }}
            >
              <div
                className="comic-subtitle text-2xl mb-1"
                style={{ color: isSelected ? config.color : 'var(--parchment)' }}
              >
                {config.label}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {preset.waveCount} waves
              </div>
            </button>
          );
        })}
      </div>

      {/* Details for selected difficulty */}
      <div className="comic-panel-inner rounded-lg p-4 mt-4">
        <h4
          className="comic-subtitle text-lg mb-2"
          style={{ color: difficultyConfig[selected].color }}
        >
          {DIFFICULTY_PRESETS[selected].label} Mode
        </h4>
        <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
          {DIFFICULTY_PRESETS[selected].description}
        </p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>Starting $:</span>
            <span className="stat-money font-bold">${DIFFICULTY_PRESETS[selected].startMoney.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>Health:</span>
            <span className="stat-health font-bold">{DIFFICULTY_PRESETS[selected].startHealth}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>Waves:</span>
            <span style={{ color: 'var(--comic-blue)' }} className="font-bold">{DIFFICULTY_PRESETS[selected].waveCount}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>Safe Round:</span>
            <span className="stat-wave font-bold">{Math.round(DIFFICULTY_PRESETS[selected].safeRoundChance * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
