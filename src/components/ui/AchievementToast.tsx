'use client';

import { useEffect, useState } from 'react';
import { getAchievement, getRarityColor, getRarityBgColor } from '@/lib/achievements';

interface AchievementToastProps {
  achievementId: string;
  onClose: () => void;
}

const rarityColors: Record<string, string> = {
  bronze: 'var(--comic-orange)',
  silver: 'var(--text-secondary)',
  gold: 'var(--comic-yellow)',
  platinum: 'var(--comic-purple)'
};

export default function AchievementToast({ achievementId, onClose }: AchievementToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const achievement = getAchievement(achievementId);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50);

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!achievement) return null;

  const rarityEmoji: Record<string, string> = {
    bronze: '🥉',
    silver: '🥈',
    gold: '🥇',
    platinum: '💎'
  };

  const color = rarityColors[achievement.rarity] || 'var(--comic-yellow)';

  return (
    <div
      className={`transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div
        className="p-4 rounded-lg min-w-[300px]"
        style={{
          background: 'var(--panel-dark)',
          border: `3px solid ${color}`,
          boxShadow: `4px 4px 0px #000, 0 0 20px color-mix(in srgb, ${color} 30%, transparent)`
        }}
      >
        <div className="flex items-start gap-3">
          <div className="text-4xl animate-zombie-shamble">
            {rarityEmoji[achievement.rarity]}
          </div>
          <div className="flex-1">
            <div className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>
              Achievement Unlocked!
            </div>
            <h3 className="comic-subtitle text-lg" style={{ color }}>
              {achievement.name}
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              {achievement.description}
            </p>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="hover:opacity-80 transition-opacity"
            style={{ color: 'var(--text-muted)' }}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

// Container for multiple toasts
interface AchievementToastContainerProps {
  achievements: string[];
  onDismiss: (id: string) => void;
}

export function AchievementToastContainer({ achievements, onDismiss }: AchievementToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {achievements.map((id, index) => (
        <div
          key={id}
          style={{ transform: `translateY(${index * 8}px)` }}
        >
          <AchievementToast
            achievementId={id}
            onClose={() => onDismiss(id)}
          />
        </div>
      ))}
    </div>
  );
}
