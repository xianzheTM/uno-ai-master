import React from 'react';
import { useUIStore } from '@/stores/uiStore';
import { Button } from './Button';
import { soundManager } from '@/utils/soundManager';

interface SettingsProps {
  onClose: () => void;
}

/**
 * 游戏设置界面组件
 */
export const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const {
    theme,
    soundEnabled,
    musicEnabled,
    volume,
    animationsEnabled,
    animationSpeed,
    showPlayerNames,
    showCardCount,
    setTheme,
    toggleTheme,
    setSoundEnabled,
    setMusicEnabled,
    setVolume,
    setAnimationsEnabled,
    setAnimationSpeed,
    setShowPlayerNames,
    setShowCardCount,
  } = useUIStore();

  // 更新音效管理器设置
  React.useEffect(() => {
    soundManager.setEnabled(soundEnabled);
    soundManager.setVolume(volume);
  }, [soundEnabled, volume]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">游戏设置</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="small"
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </Button>
        </div>

        <div className="space-y-6">
          {/* 主题设置 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">外观设置</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-600">主题模式</label>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setTheme('light')}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      theme === 'light'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    浅色
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      theme === 'dark'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    深色
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* 音效设置 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">音效设置</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-600">游戏音效</label>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                    soundEnabled ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                      soundEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-600">背景音乐</label>
                <button
                  onClick={() => setMusicEnabled(!musicEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                    musicEnabled ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                      musicEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-600">音量大小</label>
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-gray-500">🔇</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-xs text-gray-500">🔊</span>
                  <span className="text-xs text-gray-600 w-8">
                    {Math.round(volume * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 动画设置 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">动画设置</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-600">启用动画</label>
                <button
                  onClick={() => setAnimationsEnabled(!animationsEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                    animationsEnabled ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                      animationsEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {animationsEnabled && (
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-600">动画速度</label>
                  <select
                    value={animationSpeed}
                    onChange={(e) => setAnimationSpeed(e.target.value as 'slow' | 'normal' | 'fast')}
                    className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="slow">慢速</option>
                    <option value="normal">正常</option>
                    <option value="fast">快速</option>
                  </select>
                </div>
              )}
            </div>
          </section>

          {/* 游戏界面设置 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">界面设置</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-600">显示玩家姓名</label>
                <button
                  onClick={() => setShowPlayerNames(!showPlayerNames)}
                  className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                    showPlayerNames ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                      showPlayerNames ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-600">显示手牌数量</label>
                <button
                  onClick={() => setShowCardCount(!showCardCount)}
                  className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                    showCardCount ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                      showCardCount ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* 按钮区域 */}
        <div className="mt-8 flex gap-3">
          <Button
            onClick={onClose}
            variant="primary"
            className="flex-1"
          >
            保存设置
          </Button>
          <Button
            onClick={() => {
              // 重置为默认设置
              setTheme('light');
              setSoundEnabled(true);
              setMusicEnabled(true);
              setVolume(0.7);
              setAnimationsEnabled(true);
              setAnimationSpeed('normal');
              setShowPlayerNames(true);
              setShowCardCount(true);
            }}
            variant="ghost"
            className="px-6"
          >
            重置
          </Button>
        </div>
      </div>
    </div>
  );
}; 