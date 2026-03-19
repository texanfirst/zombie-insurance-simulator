'use client';

import { Decision, RiskStrategy, WaveBreakdown } from '@/types/game';

interface ReportCardProps {
  decisions: Decision[];
  allWaveBreakdowns: Array<{ wave: number; breakdown: WaveBreakdown | null; strategy: RiskStrategy }>;
  totalInsuranceSpent: number;
  money: number;
  health: number;
}

export default function ReportCard({
  decisions,
  allWaveBreakdowns,
  totalInsuranceSpent,
}: ReportCardProps) {
  // Calculate total saved by insurance
  let totalSavedByInsurance = 0;
  let insurancePayoffCount = 0;
  let insuranceBoughtCount = 0;
  let bestWave = { wave: 0, saved: -Infinity };
  let worstWave = { wave: 0, cost: -Infinity };

  for (const entry of allWaveBreakdowns) {
    const b = entry.breakdown;
    if (!b) continue;

    if (entry.strategy === 'transfer' && b.insuranceTier) {
      insuranceBoughtCount++;
      if (b.moneySaved > 0) {
        totalSavedByInsurance += b.moneySaved;
        insurancePayoffCount++;
      }
      if (b.moneySaved > bestWave.saved) {
        bestWave = { wave: entry.wave, saved: b.moneySaved };
      }
    }

    if (entry.strategy === 'retain' && !b.isSafe && b.baseDamageMoney > 0) {
      if (b.baseDamageMoney > worstWave.cost) {
        worstWave = { wave: entry.wave, cost: b.baseDamageMoney };
      }
    }

    // Also check uninsured transfer waves
    if (entry.strategy === 'transfer' && !b.insuranceTier && !b.isSafe && b.baseDamageMoney > 0) {
      if (b.baseDamageMoney > worstWave.cost) {
        worstWave = { wave: entry.wave, cost: b.baseDamageMoney };
      }
    }
  }

  const netValue = totalSavedByInsurance - totalInsuranceSpent;

  // Strategy breakdown
  const strategyCount: Record<RiskStrategy, number> = { avoid: 0, reduce: 0, transfer: 0, retain: 0 };
  for (const entry of allWaveBreakdowns) {
    strategyCount[entry.strategy]++;
  }
  const totalWaves = allWaveBreakdowns.length;

  // Letter grade
  let grade: string;
  if (netValue > 3000) grade = 'A';
  else if (netValue > 1000) grade = 'B';
  else if (netValue > -500) grade = 'C';
  else if (netValue > -2000) grade = 'D';
  else grade = 'F';

  const gradeColor = grade === 'A' ? 'var(--comic-green)' :
    grade === 'B' ? 'var(--comic-blue)' :
    grade === 'C' ? 'var(--comic-yellow)' :
    grade === 'D' ? 'var(--comic-orange)' :
    'var(--comic-red)';

  return (
    <div
      className="comic-panel-inner rounded-lg p-5 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="comic-subtitle text-lg" style={{ color: 'var(--comic-yellow)' }}>
          INSURANCE REPORT CARD
        </h3>
        <div
          className="comic-title text-4xl"
          style={{ color: gradeColor }}
        >
          {grade}
        </div>
      </div>

      {/* Financial summary */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded" style={{ background: 'var(--panel-dark)', border: '1px solid var(--panel-light)' }}>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Spent on Insurance</div>
          <div className="comic-subtitle text-lg stat-health">${totalInsuranceSpent.toLocaleString()}</div>
        </div>
        <div className="p-3 rounded" style={{ background: 'var(--panel-dark)', border: '1px solid var(--panel-light)' }}>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Saved by Insurance</div>
          <div className="comic-subtitle text-lg stat-money">${totalSavedByInsurance.toLocaleString()}</div>
        </div>
      </div>

      {/* Net value */}
      <div
        className="p-3 rounded mb-4 text-center"
        style={{
          background: netValue >= 0 ? 'rgba(6,214,160,0.1)' : 'rgba(230,57,70,0.1)',
          border: `1px solid ${netValue >= 0 ? 'rgba(6,214,160,0.25)' : 'rgba(230,57,70,0.25)'}`,
        }}
      >
        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Net Value of Insurance</div>
        <div
          className="comic-subtitle text-xl"
          style={{ color: netValue >= 0 ? 'var(--comic-green)' : 'var(--comic-red)' }}
        >
          {netValue >= 0 ? '+' : ''}${netValue.toLocaleString()}
        </div>
      </div>

      {/* Best / Worst */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {bestWave.wave > 0 && (
          <div className="p-2 rounded text-sm" style={{ background: 'rgba(6,214,160,0.05)', border: '1px solid rgba(6,214,160,0.15)' }}>
            <div className="text-xs" style={{ color: 'var(--comic-green)' }}>Best Decision</div>
            <div style={{ color: 'var(--text-secondary)' }}>Wave {bestWave.wave}: saved ${bestWave.saved}</div>
          </div>
        )}
        {worstWave.wave > 0 && (
          <div className="p-2 rounded text-sm" style={{ background: 'rgba(230,57,70,0.05)', border: '1px solid rgba(230,57,70,0.15)' }}>
            <div className="text-xs" style={{ color: 'var(--comic-red)' }}>Costliest Uninsured Hit</div>
            <div style={{ color: 'var(--text-secondary)' }}>Wave {worstWave.wave}: lost ${worstWave.cost}</div>
          </div>
        )}
      </div>

      {/* Strategy breakdown */}
      <div className="mb-4">
        <div className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Strategy Breakdown</div>
        <div className="space-y-1">
          {(Object.entries(strategyCount) as Array<[RiskStrategy, number]>)
            .filter(([, count]) => count > 0)
            .map(([strategy, count]) => {
              const pct = totalWaves > 0 ? Math.round((count / totalWaves) * 100) : 0;
              const color = strategy === 'avoid' ? 'var(--text-secondary)' :
                strategy === 'reduce' ? 'var(--comic-blue)' :
                strategy === 'transfer' ? 'var(--comic-green)' :
                'var(--comic-yellow)';
              return (
                <div key={strategy} className="flex items-center gap-2">
                  <div className="w-16 text-xs uppercase comic-subtitle" style={{ color }}>{strategy}</div>
                  <div className="flex-1 h-3 rounded overflow-hidden" style={{ background: 'var(--panel-dark)' }}>
                    <div className="h-full rounded" style={{ width: `${pct}%`, background: color, opacity: 0.6 }} />
                  </div>
                  <div className="w-12 text-xs text-right" style={{ color: 'var(--text-muted)' }}>{count} ({pct}%)</div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Insurance efficiency */}
      {insuranceBoughtCount > 0 && (
        <div className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
          Insurance paid off <strong style={{ color: 'var(--comic-green)' }}>{insurancePayoffCount}</strong> out of{' '}
          <strong>{insuranceBoughtCount}</strong> times you bought it.
        </div>
      )}
    </div>
  );
}
