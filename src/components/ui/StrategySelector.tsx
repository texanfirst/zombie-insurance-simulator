'use client';

import { RiskStrategy } from '@/types/game';
import { REDUCE_OPTIONS, ReduceOption } from '@/lib/constants';
import { DifficultyPreset } from '@/types/game';

interface StrategySelectorProps {
  selected: RiskStrategy;
  onChange: (strategy: RiskStrategy) => void;
  reduceOptions: string[];
  onReduceToggle: (id: string) => void;
  difficultyPreset: DifficultyPreset;
}

const strategies: Array<{
  id: RiskStrategy;
  icon: string;
  label: string;
  description: string;
  color: string;
  bg: string;
  borderColor: string;
}> = [
  {
    id: 'avoid',
    icon: '\u{1F6E1}\u{FE0F}',
    label: 'AVOID',
    description: 'Skip this wave. No income, no risk.',
    color: 'var(--text-secondary)',
    bg: 'rgba(107,101,144,0.15)',
    borderColor: 'var(--text-muted)',
  },
  {
    id: 'reduce',
    icon: '\u{1F527}',
    label: 'REDUCE',
    description: 'Spend money to lower damage before it hits.',
    color: 'var(--comic-blue)',
    bg: 'rgba(76,201,240,0.1)',
    borderColor: 'var(--comic-blue)',
  },
  {
    id: 'transfer',
    icon: '\u{1F4CB}',
    label: 'TRANSFER',
    description: 'Buy insurance to cover damages.',
    color: 'var(--comic-green)',
    bg: 'rgba(6,214,160,0.1)',
    borderColor: 'var(--comic-green)',
  },
  {
    id: 'retain',
    icon: '\u{1F3B2}',
    label: 'RETAIN',
    description: 'Accept the risk. Save money and hope for the best.',
    color: 'var(--comic-yellow)',
    bg: 'rgba(255,209,102,0.1)',
    borderColor: 'var(--comic-yellow)',
  },
];

export default function StrategySelector({
  selected,
  onChange,
  reduceOptions,
  onReduceToggle,
  difficultyPreset,
}: StrategySelectorProps) {
  return (
    <div className="comic-panel-inner rounded-lg p-4 mb-5">
      <h3 className="comic-subtitle text-lg mb-3" style={{ color: 'var(--parchment)' }}>
        Risk Management Strategy
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
        {strategies.map((s) => {
          const isSelected = selected === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onChange(s.id)}
              className="p-3 rounded-lg text-left transition-all"
              style={{
                background: isSelected ? s.bg : 'var(--panel-dark)',
                border: `2px solid ${isSelected ? s.borderColor : 'var(--panel-light)'}`,
                boxShadow: isSelected ? `0 0 12px ${s.borderColor}30` : 'none',
              }}
            >
              <div className="text-lg mb-1">{s.icon}</div>
              <div
                className="comic-subtitle text-sm"
                style={{ color: isSelected ? s.color : 'var(--text-secondary)' }}
              >
                {s.label}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {s.description}
              </div>
            </button>
          );
        })}
      </div>

      {/* Strategy-specific messages */}
      {selected === 'avoid' && (
        <div
          className="p-3 rounded text-sm animate-slide-up"
          style={{
            background: 'rgba(107,101,144,0.1)',
            border: '1px solid var(--text-muted)',
          }}
        >
          <span style={{ color: 'var(--text-secondary)' }}>
            You will sit out this wave: no income earned, but no damage taken.
          </span>
        </div>
      )}

      {selected === 'reduce' && (
        <div className="space-y-2 animate-slide-up">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Select preparations to reduce damage (pick one):
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {REDUCE_OPTIONS.map((opt: ReduceOption) => {
              const isActive = reduceOptions.includes(opt.id);
              const scaledCost = Math.round(opt.cost * difficultyPreset.insuranceCostMultiplier);
              return (
                <button
                  key={opt.id}
                  onClick={() => onReduceToggle(opt.id)}
                  className="p-3 rounded text-left transition-all"
                  style={{
                    background: isActive ? 'rgba(76,201,240,0.1)' : 'var(--panel-dark)',
                    border: `2px solid ${isActive ? 'var(--comic-blue)' : 'var(--panel-light)'}`,
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div
                        className="font-bold text-sm"
                        style={{ color: isActive ? 'var(--comic-blue)' : 'var(--parchment)' }}
                      >
                        {opt.name}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {opt.description}
                      </div>
                      <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        Category: {opt.category}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="stat-money text-sm font-bold">${scaledCost}</div>
                      <div className="text-xs" style={{ color: 'var(--comic-blue)' }}>
                        -{Math.round(opt.damageReduction * 100)}% dmg
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {selected === 'retain' && (
        <div
          className="p-3 rounded text-sm animate-slide-up"
          style={{
            background: 'rgba(255,209,102,0.1)',
            border: '1px solid var(--comic-yellow)',
          }}
        >
          <span style={{ color: 'var(--comic-yellow)' }}>
            Going unprotected. If disaster strikes, you pay full price.
          </span>
        </div>
      )}
    </div>
  );
}
