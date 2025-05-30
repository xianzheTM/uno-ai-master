/**
 * 音效管理器
 * 管理游戏中的所有音效播放
 */

export enum SoundType {
  CARD_PLAY = 'card-play',
  CARD_DRAW = 'card-draw',
  UNO_CALL = 'uno-call',
  GAME_WIN = 'game-win',
  SPECIAL_CARD = 'special-card',
  CHALLENGE = 'challenge',
  BUTTON_CLICK = 'button-click',
}

class SoundManager {
  private sounds: Map<SoundType, HTMLAudioElement[]> = new Map();
  private volume: number = 0.7;
  private enabled: boolean = true;

  constructor() {
    this.initializeSounds();
  }

  /**
   * 初始化音效文件
   */
  private initializeSounds(): void {
    // 创建音效文件路径映射
    const soundFiles: Record<SoundType, string> = {
      [SoundType.CARD_PLAY]: '/sounds/card-play.mp3',
      [SoundType.CARD_DRAW]: '/sounds/card-draw.mp3',
      [SoundType.UNO_CALL]: '/sounds/uno-call.mp3',
      [SoundType.GAME_WIN]: '/sounds/game-win.mp3',
      [SoundType.SPECIAL_CARD]: '/sounds/special-card.mp3',
      [SoundType.CHALLENGE]: '/sounds/challenge.mp3',
      [SoundType.BUTTON_CLICK]: '/sounds/button-click.mp3',
    };

    // 为每种音效创建音频实例池（支持同时播放多个相同音效）
    Object.entries(soundFiles).forEach(([soundType, filePath]) => {
      const audioPool: HTMLAudioElement[] = [];
      
      // 创建3个音频实例以支持重叠播放
      for (let i = 0; i < 3; i++) {
        const audio = new Audio(filePath);
        audio.volume = this.volume;
        audio.preload = 'auto';
        
        // 音频加载错误处理
        audio.addEventListener('error', () => {
          console.warn(`音效文件加载失败: ${filePath}`);
        });
        
        audioPool.push(audio);
      }
      
      this.sounds.set(soundType as SoundType, audioPool);
    });
  }

  /**
   * 播放音效
   */
  play(soundType: SoundType): void {
    if (!this.enabled) return;

    const audioPool = this.sounds.get(soundType);
    if (!audioPool) return;

    // 找到一个可用的音频实例（未在播放中的）
    const availableAudio = audioPool.find(audio => 
      audio.paused || audio.ended || audio.currentTime === 0
    );

    if (availableAudio) {
      availableAudio.currentTime = 0;
      availableAudio.volume = this.volume;
      
      // 播放音效，忽略可能的播放失败
      availableAudio.play().catch(error => {
        console.warn(`音效播放失败: ${soundType}`, error);
      });
    }
  }

  /**
   * 设置音量
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    
    // 更新所有音频实例的音量
    this.sounds.forEach(audioPool => {
      audioPool.forEach(audio => {
        audio.volume = this.volume;
      });
    });
  }

  /**
   * 启用/禁用音效
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    
    // 如果禁用音效，停止所有正在播放的音效
    if (!enabled) {
      this.stopAll();
    }
  }

  /**
   * 停止所有音效
   */
  stopAll(): void {
    this.sounds.forEach(audioPool => {
      audioPool.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
    });
  }

  /**
   * 预加载所有音效
   */
  preload(): Promise<void[]> {
    const loadPromises: Promise<void>[] = [];

    this.sounds.forEach(audioPool => {
      audioPool.forEach(audio => {
        const promise = new Promise<void>((resolve) => {
          if (audio.readyState >= 2) {
            resolve();
          } else {
            const onCanPlay = () => {
              audio.removeEventListener('canplay', onCanPlay);
              resolve();
            };
            audio.addEventListener('canplay', onCanPlay);
            audio.load();
          }
        });
        loadPromises.push(promise);
      });
    });

    return Promise.all(loadPromises);
  }
}

// 创建单例实例
export const soundManager = new SoundManager();

// 导出便捷方法
export const playSound = (soundType: SoundType) => soundManager.play(soundType);
export const setSoundVolume = (volume: number) => soundManager.setVolume(volume);
export const setSoundEnabled = (enabled: boolean) => soundManager.setEnabled(enabled); 