import React, { useState, useRef, useEffect } from 'react';

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

const SoundDemo: React.FC = () => {
  const [soundConfig, setSoundConfig] = useState<SoundSpriteConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 加载音效配置
  useEffect(() => {
    const loadSoundConfig = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // 使用GitHub raw文件服务，允许跨域访问
        const configUrl = 'https://raw.githubusercontent.com/xianzheTM/uno-ai-master/gh-pages/sounds/mygameaudio.json';
        
        const response = await fetch(configUrl);
        if (!response.ok) {
          throw new Error('无法加载音效配置文件');
        }
        const config: SoundSpriteConfig = await response.json();
        setSoundConfig(config);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载音效失败');
      } finally {
        setIsLoading(false);
      }
    };

    loadSoundConfig();
  }, []);

  // 初始化音频元素
  useEffect(() => {
    if (soundConfig && !audioRef.current) {
      // 使用GitHub raw文件服务，允许跨域访问
      const audioUrl = `https://raw.githubusercontent.com/xianzheTM/uno-ai-master/gh-pages/sounds/${soundConfig.resources[0]}`;
      
      audioRef.current = new Audio(audioUrl);
      audioRef.current.addEventListener('ended', () => {
        setCurrentlyPlaying(null);
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [soundConfig]);

  // 播放音效
  const playSound = (soundName: string) => {
    if (!soundConfig || !audioRef.current) return;

    const sprite = soundConfig.spritemap[soundName];
    if (!sprite) return;

    // 如果当前正在播放同一个音效，则停止
    if (currentlyPlaying === soundName) {
      audioRef.current.pause();
      setCurrentlyPlaying(null);
      return;
    }

    // 停止当前播放的音效
    audioRef.current.pause();
    
    // 设置播放位置
    audioRef.current.currentTime = sprite.start;
    setCurrentlyPlaying(soundName);

    // 播放音效
    audioRef.current.play().catch(err => {
      console.error('播放音效失败:', err);
      setCurrentlyPlaying(null);
    });

    // 设置定时器在指定时间停止播放（如果不循环）
    if (!sprite.loop) {
      const duration = (sprite.end - sprite.start) * 1000;
      setTimeout(() => {
        if (audioRef.current && currentlyPlaying === soundName) {
          audioRef.current.pause();
          setCurrentlyPlaying(null);
        }
      }, duration);
    }
  };

  // 停止所有音效
  const stopAll = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setCurrentlyPlaying(null);
    }
  };

  // 获取音效分类
  const getCategories = (): string[] => {
    if (!soundConfig) return [];
    
    const categories = new Set<string>();
    Object.keys(soundConfig.spritemap).forEach(soundName => {
      const prefix = soundName.split('_')[0];
      categories.add(prefix);
    });
    
    return ['全部', ...Array.from(categories).sort()];
  };

  // 过滤音效列表
  const getFilteredSounds = (): string[] => {
    if (!soundConfig) return [];
    
    let sounds = Object.keys(soundConfig.spritemap);
    
    // 按分类过滤
    if (selectedCategory !== '全部') {
      sounds = sounds.filter(name => name.startsWith(selectedCategory));
    }
    
    // 按搜索词过滤
    if (searchTerm) {
      sounds = sounds.filter(name => 
        name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return sounds.sort();
  };

  // 格式化音效名称
  const formatSoundName = (name: string): string => {
    return name.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
  };

  // 获取音效时长
  const getSoundDuration = (soundName: string): string => {
    if (!soundConfig) return '';
    const sprite = soundConfig.spritemap[soundName];
    if (!sprite) return '';
    const duration = sprite.end - sprite.start;
    return `${duration.toFixed(1)}s`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载音效配置中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-500 mb-4">❌ {error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          重新加载
        </button>
      </div>
    );
  }

  if (!soundConfig) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">无音效配置</p>
      </div>
    );
  }

  const categories = getCategories();
  const filteredSounds = getFilteredSounds();

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">🎵 音效试听</h2>
        <button
          onClick={stopAll}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          🔇 停止播放
        </button>
      </div>

      {/* 控制面板 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* 搜索框 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            搜索音效
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="输入音效名称..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 分类选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            音效分类
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {Object.keys(soundConfig.spritemap).length}
            </div>
            <div className="text-sm text-gray-600">总音效数</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {filteredSounds.length}
            </div>
            <div className="text-sm text-gray-600">当前显示</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {categories.length - 1}
            </div>
            <div className="text-sm text-gray-600">音效分类</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {currentlyPlaying ? '🔊' : '🔇'}
            </div>
            <div className="text-sm text-gray-600">播放状态</div>
          </div>
        </div>
      </div>

      {/* 音效列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSounds.map(soundName => {
          const isPlaying = currentlyPlaying === soundName;
          const sprite = soundConfig.spritemap[soundName];
          
          return (
            <div
              key={soundName}
              className={`p-4 border rounded-lg transition-all duration-200 ${
                isPlaying 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-800 text-sm truncate" title={soundName}>
                  {formatSoundName(soundName)}
                </h3>
                <span className="text-xs text-gray-500">
                  {getSoundDuration(soundName)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-600">
                  {sprite.loop ? '🔄 循环' : '📻 单次'}
                </div>
                <button
                  onClick={() => playSound(soundName)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    isPlaying
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {isPlaying ? '⏹️ 停止' : '▶️ 播放'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSounds.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">没有找到匹配的音效</p>
        </div>
      )}
    </div>
  );
};

export default SoundDemo; 