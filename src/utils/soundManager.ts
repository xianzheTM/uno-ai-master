/**
 * 音效管理器
 * 支持音乐精灵格式，管理游戏中的所有音效播放
 */

interface SoundSprite {
  start: number;
  end: number;
  loop: boolean;
}

interface SoundSpriteMap {
  [key: string]: SoundSprite;
}

interface SoundSpriteConfig {
  resources: string[];
  spritemap: SoundSpriteMap;
}

// 游戏音效类型枚举
export enum GameSoundType {
  // 卡牌相关音效
  CARD_DRAW = 'SFX_Card_Draw_Comm', 
  CARD_SELECT = 'SFX_Card_Select',
  CARD_PLAY = 'SFX_Card_Deal_Comm', // 普通出牌音效
  
  // 特殊卡牌音效
  CARD_SKIP = 'SFX_Card_Effect_Stop',
  CARD_REVERSE = 'SFX_Card_Effect_UTurn',
  CARD_DRAW_TWO = 'SFX_Card_Effect_Punish_Player',
  CARD_WILD = 'SFX_Card_Effect_ZeroSeven_Switch',
  
  // UI相关音效
  BUTTON_CLICK = 'SFX_UI_Button_Click',
  BUTTON_BACK = 'SFX_UI_Button_Back',
  BUTTON_NEGATIVE = 'SFX_UI_Button_Negative',
  GAME_START = 'SFX_UI_GameStart_C_full_01',
  
  // 游戏事件音效
  UNO_CALL = 'VOC_UNO_01_M',
  VICTORY = 'SFX_UI_Victory',
  ACHIEVEMENT = 'SFX_UI_Achievement',
  
  // 时间相关
  CLOCK_BELL = 'SFX_UI_Clock_Bell',
  
  // 背景音乐
  GAME_MUSIC = 'MUS_Gameplay_B_Loop_Play',
}

class SoundManager {
  private soundConfig: SoundSpriteConfig | null = null;
  private audio: HTMLAudioElement | null = null;
  private musicAudio: HTMLAudioElement | null = null; // 专门用于音乐的音频元素
  private volume: number = 0.7;
  private soundEnabled: boolean = true;
  private musicEnabled: boolean = true;
  private currentMusic: GameSoundType | null = null;
  private currentlyPlaying: GameSoundType | null = null;
  private timeouts: Map<GameSoundType, number> = new Map();

  constructor() {
    this.initializeSounds();
  }

  /**
   * 初始化音效配置
   */
  private async initializeSounds(): Promise<void> {
    try {
      // 使用相对路径，避免域名重定向问题
      const configUrl = './sounds/mygameaudio.json';
      
      const response = await fetch(configUrl);
      if (!response.ok) {
        throw new Error('无法加载音效配置文件');
      }
      
      const config: SoundSpriteConfig = await response.json();
      this.soundConfig = config;
      
      // 初始化音频元素
      if (config.resources.length > 0) {
        const audioUrl = `./sounds/${config.resources[0]}`;
        
        // 音效播放器
        this.audio = new Audio(audioUrl);
        this.audio.volume = this.volume;
        this.audio.preload = 'auto';
        
        // 音乐播放器
        this.musicAudio = new Audio(audioUrl);
        this.musicAudio.volume = this.volume;
        this.musicAudio.preload = 'auto';
        
        this.audio.addEventListener('error', (e) => {
          console.warn('音效文件加载失败:', e);
        });
        
        this.musicAudio.addEventListener('error', (e) => {
          console.warn('音乐文件加载失败:', e);
        });
      }
    } catch (error) {
      console.warn('音效初始化失败:', error);
    }
  }

  /**
   * 播放指定的游戏音效
   */
  play(soundType: GameSoundType): void {
    if (!this.soundEnabled || !this.soundConfig || !this.audio) return;

    // 添加调试日志，特别关注CARD_DRAW_TWO音效
    if (soundType === GameSoundType.CARD_DRAW_TWO) {
      console.log('🎵 播放 CARD_DRAW_TWO 音效 (惩罚玩家音效)');
      console.trace('调用堆栈:');
    }

    const sprite = this.soundConfig.spritemap[soundType];
    if (!sprite) {
      console.warn(`音效不存在: ${soundType}`);
      return;
    }

    // 如果是音乐类型，使用专门的音乐播放器
    if (this.isMusic(soundType)) {
      this.playMusicInternal(soundType, sprite);
      return;
    }

    // 如果当前正在播放相同音效，不重复播放
    if (this.currentlyPlaying === soundType) return;

    // 清除之前的定时器
    this.clearTimeout(soundType);

    try {
      // 设置播放位置
      this.audio.currentTime = sprite.start;
      this.currentlyPlaying = soundType;

      // 播放音效
      this.audio.play().catch(error => {
        console.warn(`音效播放失败: ${soundType}`, error);
        this.currentlyPlaying = null;
      });

      // 如果不是循环音效，设置定时器在指定时间停止播放
      if (!sprite.loop) {
        const duration = (sprite.end - sprite.start) * 1000;
        const timeout = window.setTimeout(() => {
          if (this.currentlyPlaying === soundType && this.audio) {
            this.audio.pause();
            this.currentlyPlaying = null;
          }
        }, duration);
        
        this.timeouts.set(soundType, timeout);
      }
    } catch (error) {
      console.warn(`音效播放异常: ${soundType}`, error);
      this.currentlyPlaying = null;
    }
  }

  /**
   * 内部音乐播放方法
   */
  private playMusicInternal(musicType: GameSoundType, sprite: SoundSprite): void {
    if (!this.musicAudio) return;

    try {
      // 设置播放位置
      this.musicAudio.currentTime = sprite.start;
      this.currentMusic = musicType;

      // 播放音乐
      this.musicAudio.play().catch(error => {
        console.warn(`音乐播放失败: ${musicType}`, error);
        this.currentMusic = null;
      });

      // 如果是循环音乐，设置循环播放
      if (sprite.loop) {
        this.musicAudio.loop = false; // 不使用HTML5的loop，手动控制
        
        // 使用ontimeupdate事件来手动循环
        const handleTimeUpdate = () => {
          if (this.musicAudio && this.currentMusic === musicType && this.musicAudio.currentTime >= sprite.end) {
            this.musicAudio.currentTime = sprite.start;
          }
        };
        
        this.musicAudio.addEventListener('timeupdate', handleTimeUpdate);
        
        // 存储事件处理器引用以便后续移除
        (this.musicAudio as any)._loopHandler = handleTimeUpdate;
      } else {
        // 非循环音乐，设置结束时停止
        const duration = (sprite.end - sprite.start) * 1000;
        const timeout = window.setTimeout(() => {
          if (this.currentMusic === musicType && this.musicAudio) {
            this.musicAudio.pause();
            this.currentMusic = null;
          }
        }, duration);
        
        this.timeouts.set(musicType, timeout);
      }
    } catch (error) {
      console.warn(`音乐播放异常: ${musicType}`, error);
      this.currentMusic = null;
    }
  }

  /**
   * 播放背景音乐
   */
  playMusic(musicType: GameSoundType): void {
    if (!this.musicEnabled || !this.isMusic(musicType)) return;
    
    if (this.currentMusic === musicType) return;
    
    // 先停止当前音乐
    if (this.currentMusic) {
      this.stopMusic();
    }
    
    if (!this.soundConfig) return;

    const sprite = this.soundConfig.spritemap[musicType];
    if (!sprite) {
      console.warn(`音乐不存在: ${musicType}`);
      return;
    }

    this.playMusicInternal(musicType, sprite);
  }

  /**
   * 停止当前播放的音效
   */
  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.currentlyPlaying = null;
    }
    
    // 清除所有定时器
    this.timeouts.forEach(timeout => window.clearTimeout(timeout));
    this.timeouts.clear();
  }

  /**
   * 停止背景音乐
   */
  stopMusic(): void {
    if (this.musicAudio && this.currentMusic) {
      this.musicAudio.pause();
      this.musicAudio.loop = false;
      
      // 移除循环事件监听器
      if ((this.musicAudio as any)._loopHandler) {
        this.musicAudio.removeEventListener('timeupdate', (this.musicAudio as any)._loopHandler);
        (this.musicAudio as any)._loopHandler = null;
      }
      
      // 清除音乐相关的定时器
      if (this.timeouts.has(this.currentMusic)) {
        window.clearTimeout(this.timeouts.get(this.currentMusic)!);
        this.timeouts.delete(this.currentMusic);
      }
      
      this.currentMusic = null;
    }
  }

  /**
   * 设置音量
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.audio) {
      this.audio.volume = this.volume;
    }
    if (this.musicAudio) {
      this.musicAudio.volume = this.volume;
    }
  }

  /**
   * 启用/禁用音效
   */
  setEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  /**
   * 启用/禁用背景音乐
   */
  setMusicEnabled(enabled: boolean): void {
    this.musicEnabled = enabled;
    if (!enabled) {
      this.stopMusic();
    }
  }

  /**
   * 获取当前音效状态
   */
  getStatus() {
    return {
      soundEnabled: this.soundEnabled,
      musicEnabled: this.musicEnabled,
      volume: this.volume,
      currentlyPlaying: this.currentlyPlaying,
      currentMusic: this.currentMusic,
      configLoaded: !!this.soundConfig,
    };
  }

  /**
   * 预加载音效配置
   */
  async preload(): Promise<void> {
    if (!this.soundConfig) {
      await this.initializeSounds();
    }
    
    if (this.audio && this.audio.readyState < 2) {
      return new Promise((resolve) => {
        const onCanPlay = () => {
          if (this.audio) {
            this.audio.removeEventListener('canplay', onCanPlay);
          }
          resolve();
        };
        if (this.audio) {
          this.audio.addEventListener('canplay', onCanPlay);
          this.audio.load();
        }
      });
    }
  }

  /**
   * 判断是否为背景音乐
   */
  private isMusic(soundType: GameSoundType): boolean {
    return [
      GameSoundType.GAME_MUSIC,
    ].includes(soundType);
  }

  /**
   * 清除指定音效的定时器
   */
  private clearTimeout(soundType: GameSoundType): void {
    const timeout = this.timeouts.get(soundType);
    if (timeout) {
      window.clearTimeout(timeout);
      this.timeouts.delete(soundType);
    }
  }
}

// 创建单例实例
export const soundManager = new SoundManager();

// 导出便捷方法
export const playGameSound = (soundType: GameSoundType) => soundManager.play(soundType);
export const playGameMusic = (musicType: GameSoundType) => soundManager.playMusic(musicType);
export const stopGameSound = () => soundManager.stop();
export const stopGameMusic = () => soundManager.stopMusic();
export const setGameSoundVolume = (volume: number) => soundManager.setVolume(volume);
export const setGameSoundEnabled = (enabled: boolean) => soundManager.setEnabled(enabled);
export const setGameMusicEnabled = (enabled: boolean) => soundManager.setMusicEnabled(enabled); 