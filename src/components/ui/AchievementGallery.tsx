'use client';

import { ACHIEVEMENTS, getAchievementDisplay } from '@/lib/achievements';
import { getUnlockedAchievements } from '@/lib/storage';

interface AchievementGalleryProps {
  onClose: () => void;
}

const rarityConfig: Record<string, { color: string; borderColor: string; bgColor: string }> = {
  bronze: { color: 'var(--comic-orange)', borderColor: 'rgba(247,127,0,0.4)', bgColor: 'rgba(247,127,0,0.08)' },
  silver: { color: 'var(--text-secondary)', borderColor: 'rgba(168,160,192,0.4)', bgColor: 'rgba(168,160,192,0.08)' },
  gold: { color: 'var(--comic-yellow)', borderColor: 'rgba(255,209,102,0.4)', bgColor: 'rgba(255,209,102,0.08)' },
  platinum: { color: 'var(--comic-purple)', borderColor: 'rgba(155,93,229,0.4)', bgColor: 'rgba(155,93,229,0.08)' }
};

export default function AchievementGallery({ onClose }: AchievementGalleryProps) {
  const unlockedAchievements = getUnlockedAchievements();
  const unlockedIds = new Set(unlockedAchievements.map(a => a.id));

  const categories = [
    { id: 'survival', name: 'Survival', emoji: '🏠' },
    { id: 'strategy', name: 'Strategy', emoji: '🧠' },
    { id: 'challenge', name: 'Challenge', emoji: '🎯' },
    { id: 'secret', name: 'Secret', emoji: '❓' }
  ];

  const rarityEmoji: Record<string, string> = {
    bronze: '🥉',
    silver: '🥈',
    gold: '🥇',
    platinum: '💎'
  };

  return (
    <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
      <div
        className="comic-panel rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-comic-entrance"
      >
        {/* Header */}
        <div className="p-6 flex justify-between items-center" style={{ borderBottom: '2px solid var(--panel-light)' }}>
          <div>
            <h2 className="comic-subtitle text-2xl" style={{ color: 'var(--comic-green)' }}>Achievements</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {unlockedAchievements.length} / {ACHIEVEMENTS.length} unlocked
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

        {/* Progress bar */}
        <div className="px-6 py-3" style={{ background: 'var(--panel-mid)' }}>
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{ width: `${(unlockedAchievements.length / ACHIEVEMENTS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {categories.map(category => {
            const categoryAchievements = ACHIEVEMENTS.filter(a => a.category === category.id);
            const unlockedCount = categoryAchievements.filter(a => unlockedIds.has(a.id)).length;

            return (
              <div key={category.id} className="mb-8 last:mb-0">
                <h3 className="comic-subtitle text-lg mb-4 flex items-center gap-2" style={{ color: 'var(--parchment)' }}>
                  <span>{category.emoji}</span>
                  <span>{category.name}</span>
                  <span className="text-sm font-normal" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-bitter)' }}>
                    ({unlockedCount}/{categoryAchievements.length})
                  </span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categoryAchievements.map(achievement => {
                    const isUnlocked = unlockedIds.has(achievement.id);
                    const display = getAchievementDisplay(achievement.id, isUnlocked);
                    const config = rarityConfig[achievement.rarity];

                    return (
                      <div
                        key={achievement.id}
                        className="p-4 rounded-lg transition-all"
                        style={{
                          background: isUnlocked ? config.bgColor : 'rgba(35,35,58,0.5)',
                          border: `2px solid ${isUnlocked ? config.borderColor : 'var(--panel-light)'}`,
                          opacity: isUnlocked ? 1 : 0.5
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`text-2xl ${isUnlocked ? '' : 'grayscale'}`}>
                            {rarityEmoji[achievement.rarity]}
                          </div>
                          <div className="flex-1">
                            <h4
                              className="font-bold"
                              style={{ color: isUnlocked ? config.color : 'var(--text-muted)' }}
                            >
                              {display.name}
                            </h4>
                            <p
                              className="text-sm mt-1"
                              style={{ color: isUnlocked ? 'var(--text-secondary)' : 'var(--text-muted)' }}
                            >
                              {display.description}
                            </p>
                          </div>
                          {isUnlocked && (
                            <div style={{ color: 'var(--comic-green)' }}>✓</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4" style={{ borderTop: '2px solid var(--panel-light)', background: 'var(--panel-dark)' }}>
          <button
            onClick={onClose}
            className="btn-comic btn-comic-green w-full py-3 px-6 rounded-lg text-lg"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
