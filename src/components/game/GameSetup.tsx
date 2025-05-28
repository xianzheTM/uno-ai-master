import React, { useState } from 'react';
import { clsx } from 'clsx';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { useGameStore } from '@/stores/gameStore';
import { AIDifficulty } from '@/types';

interface GameSetupProps {
  onStartGame: () => void;
  onCancel?: () => void;
  className?: string;
}

interface PlayerSetup {
  id: string;
  name: string;
  isAI: boolean;
  aiStrategy?: AIDifficulty;
}

/**
 * 游戏设置界面组件
 * 允许用户配置游戏参数和玩家设置
 */
export const GameSetup: React.FC<GameSetupProps> = ({
  onStartGame,
  onCancel,
  className,
}) => {
  const { initializeGame } = useGameStore();

  const [playerCount, setPlayerCount] = useState(4);
  const [players, setPlayers] = useState<PlayerSetup[]>([
    { id: '1', name: '玩家1', isAI: false },
    { id: '2', name: 'AI简单', isAI: true, aiStrategy: AIDifficulty.EASY },
    { id: '3', name: 'AI中等', isAI: true, aiStrategy: AIDifficulty.MEDIUM },
    { id: '4', name: 'AI困难', isAI: true, aiStrategy: AIDifficulty.HARD },
  ]);

  const [gameSettings, setGameSettings] = useState({
    initialHandSize: 7,
    enableUnoCheck: true,
    enableSounds: true,
    gameSpeed: 'normal' as 'slow' | 'normal' | 'fast',
  });

  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // 更新玩家数量
  const handlePlayerCountChange = (count: number) => {
    setPlayerCount(count);
    
    const newPlayers = [...players];
    
    // 如果增加玩家数量，添加新的AI玩家
    while (newPlayers.length < count) {
      const newId = (newPlayers.length + 1).toString();
      newPlayers.push({
        id: newId,
        name: `AI玩家${newPlayers.length + 1}`,
        isAI: true,
        aiStrategy: AIDifficulty.MEDIUM,
      });
    }
    
    // 如果减少玩家数量，移除多余的玩家
    if (newPlayers.length > count) {
      newPlayers.splice(count);
    }
    
    setPlayers(newPlayers);
  };

  // 更新玩家信息
  const handlePlayerUpdate = (index: number, updates: Partial<PlayerSetup>) => {
    const newPlayers = [...players];
    newPlayers[index] = { ...newPlayers[index], ...updates };
    setPlayers(newPlayers);
  };

  // 切换玩家类型（人类/AI）
  const togglePlayerType = (index: number) => {
    const player = players[index];
    const isAI = !player.isAI;
    
    handlePlayerUpdate(index, {
      isAI,
      name: isAI ? `AI${player.name.includes('AI') ? '' : '玩家'}${index + 1}` : `玩家${index + 1}`,
      aiStrategy: isAI ? AIDifficulty.MEDIUM : undefined,
    });
  };

  // 开始游戏
  const handleStartGame = () => {
    // 验证设置
    const humanPlayers = players.filter(p => !p.isAI);
    if (humanPlayers.length === 0) {
      alert('至少需要一个人类玩家！');
      return;
    }

    if (players.some(p => !p.name.trim())) {
      alert('所有玩家都必须有名字！');
      return;
    }

    // 初始化游戏
    initializeGame({
      players: players.map(p => ({
        id: p.id,
        name: p.name,
        isAI: p.isAI,
        aiStrategy: p.aiStrategy,
        hand: [],
        score: 0,
      })),
      settings: gameSettings,
    });

    onStartGame();
  };

  return (
    <div className={clsx('game-setup max-w-4xl mx-auto p-6', className)}>
      <div className="bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          🎮 UNO AI 游戏设置
        </h1>

        {/* 玩家数量选择 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">玩家数量</h2>
          <div className="flex gap-2">
            {[2, 3, 4, 5, 6].map(count => (
              <Button
                key={count}
                onClick={() => handlePlayerCountChange(count)}
                variant={playerCount === count ? 'primary' : 'secondary'}
                className="flex-1"
              >
                {count} 人
              </Button>
            ))}
          </div>
        </div>

        {/* 玩家设置 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">玩家设置</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {players.map((player, index) => (
              <div
                key={player.id}
                className="border rounded-lg p-4 bg-gray-50"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Avatar
                    name={player.name}
                    size="small"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={player.name}
                      onChange={(e) => handlePlayerUpdate(index, { name: e.target.value })}
                      className="w-full px-3 py-1 border rounded text-sm"
                      placeholder="玩家名称"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <Button
                    onClick={() => togglePlayerType(index)}
                    variant={player.isAI ? 'secondary' : 'primary'}
                    size="small"
                    className="flex-1"
                  >
                    {player.isAI ? '🤖 AI' : '👤 人类'}
                  </Button>
                </div>

                {player.isAI && (
                  <select
                    value={player.aiStrategy}
                    onChange={(e) => handlePlayerUpdate(index, { aiStrategy: e.target.value as AIDifficulty })}
                    className="w-full px-2 py-1 border rounded text-sm"
                  >
                    <option value={AIDifficulty.EASY}>简单AI</option>
                    <option value={AIDifficulty.MEDIUM}>中等AI</option>
                    <option value={AIDifficulty.HARD}>困难AI</option>
                  </select>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 基础游戏设置 */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">游戏设置</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                初始手牌数量
              </label>
              <select
                value={gameSettings.initialHandSize}
                onChange={(e) => setGameSettings(prev => ({ ...prev, initialHandSize: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border rounded"
              >
                <option value={5}>5张（快速）</option>
                <option value={7}>7张（标准）</option>
                <option value={10}>10张（长局）</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                游戏速度
              </label>
              <select
                value={gameSettings.gameSpeed}
                onChange={(e) => setGameSettings(prev => ({ ...prev, gameSpeed: e.target.value as any }))}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="slow">慢速</option>
                <option value="normal">正常</option>
                <option value="fast">快速</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={gameSettings.enableUnoCheck}
                  onChange={(e) => setGameSettings(prev => ({ ...prev, enableUnoCheck: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm text-gray-600">启用UNO宣告</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={gameSettings.enableSounds}
                  onChange={(e) => setGameSettings(prev => ({ ...prev, enableSounds: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm text-gray-600">启用音效</span>
              </label>
            </div>
          </div>
        </div>

        {/* 高级设置 */}
        <div className="mb-8">
          <Button
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            variant="ghost"
            className="text-blue-600 hover:text-blue-800"
          >
            {showAdvancedSettings ? '隐藏' : '显示'}高级设置
          </Button>

          {showAdvancedSettings && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">
                <p>• AI思考时间会根据游戏速度自动调整</p>
                <p>• 困难AI会记住已出的牌并进行策略分析</p>
                <p>• UNO宣告检查可以让游戏更有挑战性</p>
              </div>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={handleStartGame}
            variant="primary"
            size="large"
            className="px-8"
          >
            🎮 开始游戏
          </Button>
          
          {onCancel && (
            <Button
              onClick={onCancel}
              variant="secondary"
              size="large"
              className="px-8"
            >
              取消
            </Button>
          )}
        </div>

        {/* 游戏预览 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            将开始 {playerCount} 人游戏，包含 {players.filter(p => !p.isAI).length} 个人类玩家
            和 {players.filter(p => p.isAI).length} 个AI玩家
          </p>
        </div>
      </div>
    </div>
  );
}; 