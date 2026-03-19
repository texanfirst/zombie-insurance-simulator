'use client';

import { RandomEvent } from '@/types/game';

interface RandomEventBannerProps {
  event: RandomEvent;
  effectMessage: string;
}

export default function RandomEventBanner({ event, effectMessage }: RandomEventBannerProps) {
  const typeConfig = {
    positive: { color: 'var(--comic-green)', label: 'BONUS', borderColor: 'rgba(6,214,160,0.4)', bgColor: 'rgba(6,214,160,0.08)' },
    negative: { color: 'var(--comic-red)', label: 'PENALTY', borderColor: 'rgba(230,57,70,0.4)', bgColor: 'rgba(230,57,70,0.08)' },
    neutral: { color: 'var(--comic-blue)', label: 'EVENT', borderColor: 'rgba(76,201,240,0.4)', bgColor: 'rgba(76,201,240,0.08)' }
  };

  const config = typeConfig[event.type];

  return (
    <div
      className="p-4 rounded-lg mb-5 animate-slide-up"
      style={{
        background: config.bgColor,
        border: `2px solid ${config.borderColor}`,
        boxShadow: `0 0 15px ${config.bgColor}`
      }}
    >
      <div className="flex items-center gap-3">
        <div className="text-4xl">{event.emoji}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="comic-subtitle text-base" style={{ color: config.color }}>
              {event.name}
            </h3>
            <span
              className="tier-badge"
              style={{
                background: config.bgColor,
                color: config.color,
                border: `1px solid ${config.borderColor}`
              }}
            >
              {config.label}
            </span>
          </div>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{event.description}</p>
          <p className="text-sm font-bold mt-2" style={{ color: config.color }}>
            {effectMessage}
          </p>
        </div>
      </div>
    </div>
  );
}
