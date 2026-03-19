// Audio system for Zombie Insurance Simulator
// Uses Web Audio API to generate sounds programmatically - no external files needed!

import { getSettings, saveSettings } from './storage';

export type SoundEffect =
  | 'click'
  | 'purchase'
  | 'cancel'
  | 'achievement'
  | 'zombie-groan'
  | 'horde-approaching'
  | 'injury'
  | 'evacuation-alarm'
  | 'money-gain'
  | 'money-loss'
  | 'game-over'
  | 'victory'
  | 'wave-start'
  | 'safe-round';

class AudioManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = false;
  private volume: number = 0.7;
  private initialized: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const settings = getSettings();
      this.enabled = settings.soundEnabled;
      this.volume = settings.soundVolume;
    }
  }

  // Initialize audio context (must be called after user interaction)
  async init(): Promise<void> {
    if (this.initialized || typeof window === 'undefined') return;

    try {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      this.initialized = true;
      console.log('🔊 Audio initialized successfully, state:', this.audioContext.state);
    } catch (error) {
      console.warn('Failed to initialize audio:', error);
    }
  }

  // Generate a tone
  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    volumeMultiplier: number = 1,
    attack: number = 0.01,
    decay: number = 0.1
  ): void {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

    // ADSR envelope
    const now = this.audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(this.volume * volumeMultiplier, now + attack);
    gainNode.gain.linearRampToValueAtTime(this.volume * volumeMultiplier * 0.7, now + attack + decay);
    gainNode.gain.linearRampToValueAtTime(0, now + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  // Generate noise (for more complex sounds)
  private playNoise(duration: number, volumeMultiplier: number = 1): void {
    if (!this.audioContext) return;

    const bufferSize = this.audioContext.sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;

    const gainNode = this.audioContext.createGain();
    const now = this.audioContext.currentTime;
    gainNode.gain.setValueAtTime(this.volume * volumeMultiplier * 0.3, now);
    gainNode.gain.linearRampToValueAtTime(0, now + duration);

    // Low pass filter for rumble effect
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(500, now);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    noise.start(now);
    noise.stop(now + duration);
  }

  // Play a specific sound effect
  async play(sound: SoundEffect, volumeMultiplier: number = 1): Promise<void> {
    console.log('🔊 play() called:', sound, 'enabled:', this.enabled, 'audioContext:', !!this.audioContext);

    if (!this.enabled || !this.audioContext) {
      console.log('🔇 Sound blocked - enabled:', this.enabled, 'audioContext:', !!this.audioContext);
      return;
    }

    // Resume audio context if suspended
    if (this.audioContext.state === 'suspended') {
      console.log('🔊 Resuming suspended audio context...');
      await this.audioContext.resume();
    }
    console.log('🔊 Playing sound:', sound, 'audioContext.state:', this.audioContext.state);

    switch (sound) {
      case 'click':
        // Short, crisp click
        this.playTone(800, 0.05, 'square', volumeMultiplier * 0.3, 0.001, 0.02);
        break;

      case 'purchase':
        // Cash register sound - ascending tones
        this.playTone(523, 0.1, 'sine', volumeMultiplier * 0.5); // C5
        setTimeout(() => this.playTone(659, 0.1, 'sine', volumeMultiplier * 0.5), 50); // E5
        setTimeout(() => this.playTone(784, 0.15, 'sine', volumeMultiplier * 0.5), 100); // G5
        break;

      case 'cancel':
        // Descending tone
        this.playTone(400, 0.15, 'sine', volumeMultiplier * 0.4, 0.01, 0.05);
        setTimeout(() => this.playTone(300, 0.15, 'sine', volumeMultiplier * 0.3), 80);
        break;

      case 'achievement':
        // Triumphant fanfare
        this.playTone(523, 0.15, 'sine', volumeMultiplier * 0.6); // C5
        setTimeout(() => this.playTone(659, 0.15, 'sine', volumeMultiplier * 0.6), 150); // E5
        setTimeout(() => this.playTone(784, 0.15, 'sine', volumeMultiplier * 0.6), 300); // G5
        setTimeout(() => this.playTone(1047, 0.4, 'sine', volumeMultiplier * 0.7), 450); // C6
        break;

      case 'zombie-groan':
        // Low, eerie groan
        this.playTone(80, 0.5, 'sawtooth', volumeMultiplier * 0.3, 0.1, 0.2);
        this.playTone(85, 0.6, 'sawtooth', volumeMultiplier * 0.2, 0.15, 0.2);
        this.playNoise(0.4, volumeMultiplier * 0.2);
        break;

      case 'horde-approaching':
        // Multiple low rumbles and groans
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            this.playTone(70 + Math.random() * 30, 0.6, 'sawtooth', volumeMultiplier * 0.2);
            this.playNoise(0.3, volumeMultiplier * 0.15);
          }, i * 150);
        }
        break;

      case 'injury':
        // Pain sound - harsh, short
        this.playTone(200, 0.2, 'sawtooth', volumeMultiplier * 0.5, 0.01, 0.1);
        this.playTone(150, 0.3, 'sawtooth', volumeMultiplier * 0.3, 0.05, 0.1);
        break;

      case 'evacuation-alarm':
        // Alarm siren - alternating tones
        for (let i = 0; i < 4; i++) {
          setTimeout(() => this.playTone(800, 0.15, 'square', volumeMultiplier * 0.4), i * 300);
          setTimeout(() => this.playTone(600, 0.15, 'square', volumeMultiplier * 0.4), i * 300 + 150);
        }
        break;

      case 'money-gain':
        // Coin/cha-ching sound
        this.playTone(1200, 0.05, 'sine', volumeMultiplier * 0.4);
        setTimeout(() => this.playTone(1500, 0.1, 'sine', volumeMultiplier * 0.5), 50);
        setTimeout(() => this.playTone(1800, 0.15, 'sine', volumeMultiplier * 0.4), 100);
        break;

      case 'money-loss':
        // Negative sound - descending
        this.playTone(400, 0.2, 'triangle', volumeMultiplier * 0.5);
        setTimeout(() => this.playTone(300, 0.2, 'triangle', volumeMultiplier * 0.4), 150);
        setTimeout(() => this.playTone(200, 0.3, 'triangle', volumeMultiplier * 0.3), 300);
        break;

      case 'game-over':
        // Sad, dramatic ending
        this.playTone(400, 0.3, 'sine', volumeMultiplier * 0.5);
        setTimeout(() => this.playTone(350, 0.3, 'sine', volumeMultiplier * 0.45), 300);
        setTimeout(() => this.playTone(300, 0.3, 'sine', volumeMultiplier * 0.4), 600);
        setTimeout(() => this.playTone(250, 0.5, 'sine', volumeMultiplier * 0.35), 900);
        setTimeout(() => this.playNoise(0.5, volumeMultiplier * 0.2), 1200);
        break;

      case 'victory':
        // Triumphant victory fanfare
        this.playTone(523, 0.2, 'sine', volumeMultiplier * 0.6); // C5
        setTimeout(() => this.playTone(659, 0.2, 'sine', volumeMultiplier * 0.6), 200); // E5
        setTimeout(() => this.playTone(784, 0.2, 'sine', volumeMultiplier * 0.6), 400); // G5
        setTimeout(() => this.playTone(1047, 0.3, 'sine', volumeMultiplier * 0.7), 600); // C6
        setTimeout(() => {
          this.playTone(1047, 0.15, 'sine', volumeMultiplier * 0.5);
          this.playTone(1319, 0.15, 'sine', volumeMultiplier * 0.5);
          this.playTone(1568, 0.15, 'sine', volumeMultiplier * 0.5);
        }, 900);
        setTimeout(() => {
          this.playTone(1047, 0.4, 'sine', volumeMultiplier * 0.6);
          this.playTone(1319, 0.4, 'sine', volumeMultiplier * 0.6);
          this.playTone(1568, 0.4, 'sine', volumeMultiplier * 0.6);
        }, 1100);
        break;

      case 'wave-start':
        // Dramatic wave start
        this.playNoise(0.3, volumeMultiplier * 0.2);
        this.playTone(150, 0.4, 'sawtooth', volumeMultiplier * 0.3, 0.05, 0.2);
        setTimeout(() => this.playTone(200, 0.3, 'sawtooth', volumeMultiplier * 0.4), 200);
        break;

      case 'safe-round':
        // Peaceful, relieved sound
        this.playTone(523, 0.2, 'sine', volumeMultiplier * 0.4); // C5
        setTimeout(() => this.playTone(659, 0.2, 'sine', volumeMultiplier * 0.4), 150); // E5
        setTimeout(() => this.playTone(784, 0.3, 'sine', volumeMultiplier * 0.5), 300); // G5
        break;
    }
  }

  // Enable/disable sounds
  setEnabled(enabled: boolean): void {
    console.log('🔊 setEnabled() called:', enabled, 'was:', this.enabled);
    this.enabled = enabled;
    saveSettings({ soundEnabled: enabled });

    if (enabled && !this.initialized) {
      console.log('🔊 Auto-initializing audio...');
      this.init();
    }
  }

  // Set volume (0-1)
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    saveSettings({ soundVolume: this.volume });
  }

  // Get current state
  isEnabled(): boolean {
    return this.enabled;
  }

  getVolume(): number {
    return this.volume;
  }

  // Toggle sound
  toggle(): boolean {
    this.setEnabled(!this.enabled);
    return this.enabled;
  }
}

// Singleton instance
export const audioManager = new AudioManager();

// Convenience functions
export function playSound(sound: SoundEffect, volumeMultiplier?: number): void {
  audioManager.play(sound, volumeMultiplier);
}

export function initAudio(): Promise<void> {
  return audioManager.init();
}

export function toggleSound(): boolean {
  return audioManager.toggle();
}

export function setSoundEnabled(enabled: boolean): void {
  audioManager.setEnabled(enabled);
}

export function setSoundVolume(volume: number): void {
  audioManager.setVolume(volume);
}

export function isSoundEnabled(): boolean {
  return audioManager.isEnabled();
}
