'use client';

import { useState } from 'react';
import { Difficulty } from '@/types/game';
import {
  getTopScores,
  getTopScoresByDifficulty,
  getClassTopScores,
  formatScore,
  formatTimestamp,
  resetClassLeaderboard
} from '@/lib/leaderboard';

interface LeaderboardModalProps {
  onClose: () => void;
  isClassMode: boolean;
  currentPlayerName?: string;
}

export default function LeaderboardModal({ onClose, isClassMode, currentPlayerName }: LeaderboardModalProps) {
  const [filter, setFilter] = useState<'all' | Difficulty>('all');
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const entries = isClassMode
    ? getClassTopScores(50)
    : filter === 'all'
      ? getTopScores(50)
      : getTopScoresByDifficulty(filter, 50);

  const handleClearLeaderboard = () => {
    resetClassLeaderboard();
    setShowConfirmClear(false);
  };

  const difficultyColors: Record<string, string> = {
    easy: 'var(--comic-green)',
    medium: 'var(--comic-yellow)',
    hard: 'var(--comic-red)'
  };

  return (
    <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
      <div className="comic-panel rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-comic-entrance">
        {/* Header */}
        <div className="p-6" style={{ borderBottom: '2px solid var(--panel-light)' }}>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="comic-subtitle text-2xl" style={{ color: 'var(--comic-green)' }}>
                {isClassMode ? 'CLASS LEADERBOARD' : 'HIGH SCORES'}
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-2xl hover:opacity-80 transition-opacity"
              style={{ color: 'var(--text-muted)' }}
            >
              ✕
            </button>
          </div>

          {/* Filter tabs */}
          {!isClassMode && (
            <div className="flex gap-2 mt-4">
              {(['all', 'easy', 'medium', 'hard'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="px-4 py-2 rounded-lg text-sm transition-all comic-subtitle"
                  style={{
                    background: filter === f ? 'var(--comic-green)' : 'var(--panel-mid)',
                    color: filter === f ? '#000' : 'var(--text-secondary)',
                    border: `2px solid ${filter === f ? 'var(--comic-green)' : 'var(--panel-light)'}`,
                    boxShadow: filter === f ? 'var(--shadow-comic-sm)' : 'none'
                  }}
                >
                  {f === 'all' ? 'ALL' : f.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {entries.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">🏆</div>
              <p className="comic-subtitle text-lg" style={{ color: 'var(--text-secondary)' }}>No scores yet!</p>
              <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Be the first to make the leaderboard!</p>
            </div>
          ) : (
            <table className="w-full">
              <thead style={{ background: 'var(--panel-mid)' }} className="sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Rank
                  </th>
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Player
                  </th>
                  <th className="px-4 py-3 text-right text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Score
                  </th>
                  <th className="px-4 py-3 text-center text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Diff
                  </th>
                  <th className="px-4 py-3 text-right text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    When
                  </th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => {
                  const rank = index + 1;
                  const isCurrentPlayer = entry.playerName === currentPlayerName;

                  return (
                    <tr
                      key={entry.id}
                      className="transition-colors"
                      style={{
                        background: isCurrentPlayer ? 'rgba(6,214,160,0.08)' : undefined,
                        borderBottom: '1px solid var(--panel-light)'
                      }}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className="comic-subtitle"
                          style={{
                            color: rank === 1 ? 'var(--comic-yellow)' :
                                   rank === 2 ? 'var(--text-secondary)' :
                                   rank === 3 ? 'var(--comic-orange)' :
                                   'var(--text-muted)'
                          }}
                        >
                          {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div
                          className="font-medium"
                          style={{ color: isCurrentPlayer ? 'var(--comic-green)' : 'var(--parchment)' }}
                        >
                          {entry.playerName}
                          {isCurrentPlayer && <span className="ml-2 text-xs" style={{ color: 'var(--comic-green)' }}>(You)</span>}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          Wave {entry.wavesCompleted} &bull; ${entry.money} &bull; HP {entry.health}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold stat-money">
                          {formatScore(entry.score)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className="tier-badge"
                          style={{
                            color: difficultyColors[entry.difficulty],
                            border: `1px solid ${difficultyColors[entry.difficulty]}`,
                            background: `color-mix(in srgb, ${difficultyColors[entry.difficulty]} 10%, transparent)`
                          }}
                        >
                          {entry.difficulty.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm" style={{ color: 'var(--text-muted)' }}>
                        {formatTimestamp(entry.timestamp)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 flex gap-2" style={{ borderTop: '2px solid var(--panel-light)', background: 'var(--panel-dark)' }}>
          {isClassMode && (
            <>
              {showConfirmClear ? (
                <>
                  <button
                    onClick={handleClearLeaderboard}
                    className="btn-comic btn-comic-red flex-1 py-3 px-6 rounded-lg text-sm"
                  >
                    CONFIRM CLEAR
                  </button>
                  <button
                    onClick={() => setShowConfirmClear(false)}
                    className="btn-comic btn-comic-ghost flex-1 py-3 px-6 rounded-lg text-sm"
                  >
                    CANCEL
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowConfirmClear(true)}
                  className="btn-comic py-3 px-6 rounded-lg text-sm"
                  style={{
                    background: 'rgba(230,57,70,0.15)',
                    color: 'var(--comic-red)',
                    border: '2px solid rgba(230,57,70,0.4)'
                  }}
                >
                  CLEAR BOARD
                </button>
              )}
            </>
          )}
          <button
            onClick={onClose}
            className="btn-comic btn-comic-green flex-1 py-3 px-6 rounded-lg text-lg"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
