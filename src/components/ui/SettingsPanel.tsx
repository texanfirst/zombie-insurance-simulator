'use client';

import { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '@/lib/storage';
import { setSoundEnabled, setSoundVolume, isSoundEnabled, initAudio, playSound } from '@/lib/audio';

interface SettingsPanelProps {
  onClose: () => void;
}

export default function SettingsPanel({ onClose }: SettingsPanelProps) {
  const [settings, setSettings] = useState(getSettings());
  const [soundOn, setSoundOn] = useState(false);

  useEffect(() => {
    setSoundOn(isSoundEnabled());
  }, []);

  const handleSoundToggle = async () => {
    const newValue = !soundOn;

    if (newValue) {
      await initAudio();
      setSoundEnabled(true);
      setSoundOn(true);
      setSettings(prev => ({ ...prev, soundEnabled: true }));
      setTimeout(() => playSound('achievement'), 100);
    } else {
      setSoundEnabled(false);
      setSoundOn(false);
      setSettings(prev => ({ ...prev, soundEnabled: false }));
    }
  };

  const handleVolumeChange = (value: number) => {
    setSoundVolume(value);
    setSettings(prev => ({ ...prev, soundVolume: value }));
  };

  const handleNameChange = (name: string) => {
    setSettings(prev => ({ ...prev, playerName: name }));
    saveSettings({ playerName: name });
  };

  return (
    <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4">
      <div className="comic-panel rounded-lg max-w-md w-full animate-comic-entrance">
        {/* Header */}
        <div className="p-6 flex justify-between items-center" style={{ borderBottom: '2px solid var(--panel-light)' }}>
          <h2 className="comic-subtitle text-2xl" style={{ color: 'var(--comic-green)' }}>Settings</h2>
          <button
            onClick={onClose}
            className="text-2xl hover:opacity-80 transition-opacity"
            style={{ color: 'var(--text-muted)' }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Sound Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Sound Effects
              </label>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Enable game sounds
              </p>
            </div>
            <button
              onClick={handleSoundToggle}
              className="relative w-14 h-8 rounded-full transition-all"
              style={{
                background: soundOn ? 'var(--comic-green)' : 'var(--panel-light)',
                border: `2px solid ${soundOn ? 'var(--comic-green)' : 'var(--panel-light)'}`,
                boxShadow: soundOn ? 'var(--shadow-glow-green)' : 'none'
              }}
            >
              <span
                className="absolute top-0.5 w-6 h-6 rounded-full transition-transform"
                style={{
                  background: soundOn ? '#000' : 'var(--text-muted)',
                  left: soundOn ? '24px' : '2px'
                }}
              />
            </button>
          </div>

          {/* Volume Slider */}
          {soundOn && (
            <div className="animate-slide-up">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Volume: {Math.round(settings.soundVolume * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.soundVolume * 100}
                onChange={(e) => handleVolumeChange(Number(e.target.value) / 100)}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, var(--comic-green) ${settings.soundVolume * 100}%, var(--panel-light) ${settings.soundVolume * 100}%)`,
                  accentColor: 'var(--comic-green)'
                }}
              />
              <button
                onClick={() => playSound('purchase')}
                className="btn-comic btn-comic-ghost w-full mt-3 py-2 px-4 rounded-lg text-sm"
              >
                TEST SOUND
              </button>
            </div>
          )}

          {/* Sound Status Info */}
          <div className="comic-panel-inner rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-2xl">{soundOn ? '🔊' : '🔇'}</span>
              <div>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Sound is {soundOn ? 'ON' : 'OFF'}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {soundOn
                    ? 'Click sounds will play during the game'
                    : 'Sound is off by default for classroom use'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4" style={{ borderTop: '2px solid var(--panel-light)' }}>
          <button
            onClick={onClose}
            className="btn-comic btn-comic-green w-full py-3 px-6 rounded-lg text-lg"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
}
