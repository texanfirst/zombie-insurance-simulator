'use client';

import { ThreatForecast as ThreatForecastType, ThreatLevel } from '@/lib/threatForecast';

interface ThreatForecastProps {
  forecast: ThreatForecastType;
}

const threatColor = (level: ThreatLevel): string => {
  switch (level) {
    case 'LOW': return 'var(--comic-green)';
    case 'MEDIUM': return 'var(--comic-yellow)';
    case 'HIGH': return 'var(--comic-orange)';
    case 'EXTREME': return 'var(--comic-red)';
  }
};

const threatBg = (level: ThreatLevel): string => {
  switch (level) {
    case 'LOW': return 'rgba(6,214,160,0.15)';
    case 'MEDIUM': return 'rgba(255,209,102,0.15)';
    case 'HIGH': return 'rgba(247,127,0,0.15)';
    case 'EXTREME': return 'rgba(230,57,70,0.15)';
  }
};

export default function ThreatForecast({ forecast }: ThreatForecastProps) {
  const categories: Array<{ icon: string; label: string; level: ThreatLevel }> = [
    { icon: '\u{1F3E0}', label: 'Home', level: forecast.homeAttack },
    { icon: '\u{1FA7A}', label: 'Medical', level: forecast.injury },
    { icon: '\u{1F4E6}', label: 'Supply', level: forecast.supplyLoss },
    { icon: '\u{1F681}', label: 'Evacuation', level: forecast.evacuation },
  ];

  return (
    <div
      className="comic-panel comic-panel-yellow rounded-lg p-4 mb-5 animate-slide-up"
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="comic-subtitle text-sm" style={{ color: 'var(--comic-yellow)' }}>
            ZOMBIE INTELLIGENCE REPORT
          </h3>
          <span
            className="tier-badge"
            style={{
              background: threatBg(forecast.overallDanger),
              color: threatColor(forecast.overallDanger),
              border: `1px solid ${threatColor(forecast.overallDanger)}`,
            }}
          >
            DANGER: {forecast.overallDanger}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {categories.map((cat) => (
            <div
              key={cat.label}
              className="text-center p-2 rounded"
              style={{ background: 'var(--panel-mid)', border: '1px solid var(--panel-light)' }}
            >
              <div className="text-lg mb-1">{cat.icon}</div>
              <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{cat.label}</div>
              <span
                className="tier-badge text-xs"
                style={{
                  background: threatBg(cat.level),
                  color: threatColor(cat.level),
                  border: `1px solid ${threatColor(cat.level)}`,
                }}
              >
                {cat.level}
              </span>
            </div>
          ))}
        </div>

        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
          Intel reports are estimates. Plan accordingly.
        </p>
      </div>
    </div>
  );
}
