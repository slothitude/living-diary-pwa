/**
 * Sound Effect Service
 * Plays UI sounds from the audio pack
 */

type SoundType =
  | 'click'
  | 'hover'
  | 'send'
  | 'receive'
  | 'notification'
  | 'error'
  | 'success'
  | 'open'
  | 'close'
  | 'switch'
  | 'select'
  | 'toggle'
  | 'scroll'
  | 'battle'
  | 'hit'
  | 'defeat'
  | 'skill'
  | 'quest'
  | 'levelup'
  | 'confirmation';

class SoundService {
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private enabled: boolean = true;
  private volume: number = 0.3; // 30% volume by default

  constructor() {
    this.preloadSounds();
  }

  /**
   * Preload all audio files for instant playback
   */
  private preloadSounds() {
    const soundMap: Record<SoundType, string[]> = {
      click: ['click_001.ogg', 'click_002.ogg', 'click_003.ogg', 'click_004.ogg', 'click_005.ogg'],
      hover: ['pluck_001.ogg', 'pluck_002.ogg'],
      send: ['whoosh_001.ogg'], // Using custom sound or fallback
      receive: ['bong_001.ogg'],
      notification: ['tick_001.ogg', 'tick_002.ogg'],
      error: ['error_001.ogg', 'error_002.ogg'],
      success: ['confirmation_001.ogg', 'confirmation_002.ogg'],
      open: ['open_001.ogg', 'open_002.ogg', 'open_003.ogg', 'open_004.ogg'],
      close: ['close_001.ogg', 'close_002.ogg', 'close_003.ogg', 'close_004.ogg'],
      switch: ['switch_001.ogg', 'switch_002.ogg', 'switch_003.ogg'],
      select: ['select_001.ogg', 'select_002.ogg', 'select_003.ogg', 'select_004.ogg'],
      toggle: ['toggle_001.ogg', 'toggle_002.ogg'],
      scroll: ['scroll_001.ogg', 'scroll_002.ogg'],
      battle: ['glass_001.ogg', 'glass_002.ogg'],
      hit: ['glass_003.ogg', 'glass_004.ogg'], // Hit sounds
      defeat: ['error_001.ogg'], // Defeat sound (reusing error sound)
      skill: ['glass_003.ogg', 'glass_004.ogg'],
      quest: ['confirmation_003.ogg'],
      levelup: ['maximize_001.ogg', 'maximize_005.ogg'],
      confirmation: ['confirmation_004.ogg'],
    };

    // Preload random sounds for each type
    Object.entries(soundMap).forEach(([type, files]) => {
      const randomFile = files[Math.floor(Math.random() * files.length)];
      const audio = new Audio(`/audio/${randomFile}`);
      audio.volume = this.volume;
      audio.preload = 'auto';
      this.audioCache.set(type, audio);
    });
  }

  /**
   * Play a sound effect
   */
  play(type: SoundType) {
    if (!this.enabled) return;

    try {
      const audio = this.audioCache.get(type);
      if (audio) {
        // Reset audio to start if already playing
        audio.currentTime = 0;
        audio.play().catch(err => {
          console.log('Sound play failed:', err);
        });
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }

  /**
   * Enable or disable sounds
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.audioCache.forEach(audio => {
      audio.volume = this.volume;
    });
  }

  /**
   * Check if sounds are enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Get current volume
   */
  getVolume(): number {
    return this.volume;
  }
}

export const soundService = new SoundService();
