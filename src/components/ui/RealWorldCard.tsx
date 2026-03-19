'use client';

import { ScenarioType } from '@/types/game';
import { REAL_WORLD_CONNECTIONS } from '@/lib/constants';

interface RealWorldCardProps {
  scenarioType: ScenarioType;
}

export default function RealWorldCard({ scenarioType }: RealWorldCardProps) {
  const connection = REAL_WORLD_CONNECTIONS[scenarioType];
  if (!connection) return null;

  return (
    <div
      className="rounded-lg p-4 mb-6 animate-slide-up delay-2"
      style={{
        background: 'rgba(241,228,179,0.08)',
        border: '2px solid var(--parchment-dark)',
        boxShadow: '0 0 10px rgba(241,228,179,0.05)',
      }}
    >
      <h4 className="comic-subtitle text-sm mb-2" style={{ color: 'var(--parchment)' }}>
        IN REAL LIFE...
      </h4>
      <div className="space-y-2 text-sm">
        <div>
          <span className="font-bold" style={{ color: 'var(--comic-blue)' }}>
            {connection.realWorldType}
          </span>
        </div>
        <p style={{ color: 'var(--text-secondary)' }}>{connection.example}</p>
        <div
          className="p-2 rounded"
          style={{ background: 'rgba(255,209,102,0.08)', border: '1px solid rgba(255,209,102,0.15)' }}
        >
          <span className="text-xs" style={{ color: 'var(--comic-yellow)' }}>
            Fun fact: {connection.funFact}
          </span>
        </div>
      </div>
    </div>
  );
}
