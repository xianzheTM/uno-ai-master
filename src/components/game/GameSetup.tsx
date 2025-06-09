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

// AI名字生成器
const generateAIName = (difficulty: AIDifficulty, index: number): string => {
  const difficultyNames = {
    [AIDifficulty.EASY]: '简单',
    [AIDifficulty.MEDIUM]: '中等',
    [AIDifficulty.HARD]: '困难'
  };
  
  const difficultyName = difficultyNames[difficulty];
  const aiNumber = index + 1;
  return `${difficultyName}AI${aiNumber}`;
};

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

  // 默认设置：一个人类玩家和两个简单AI（最少3个玩家）
  const [players, setPlayers] = useState<PlayerSetup[]>([
    { id: '1', name: '玩家1', isAI: false },
    { id: '2', name: generateAIName(AIDifficulty.EASY, 0), isAI: true, aiStrategy: AIDifficulty.EASY },
    { id: '3', name: generateAIName(AIDifficulty.EASY, 1), isAI: true, aiStrategy: AIDifficulty.EASY },
  ]);

  const [gameSettings, setGameSettings] = useState({
    initialHandSize: 7,
    enableUnoCheck: true,
    enableSounds: true,
    gameSpeed: 'normal' as 'slow' | 'normal' | 'fast',
    turnTimeLimit: 30, // 回合时间限制（秒）
    enableTurnTimer: true, // 是否启用回合计时器
  });

  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // 添加玩家
  const addPlayer = () => {
    if (players.length >= 6) return;
    
    const newId = (players.length + 1).toString();
    const aiCount = players.filter(p => p.isAI).length;
    
    const newPlayer: PlayerSetup = {
      id: newId,
      name: generateAIName(AIDifficulty.EASY, aiCount),
      isAI: true,
      aiStrategy: AIDifficulty.EASY,
    };
    
    setPlayers([...players, newPlayer]);
  };

  // 移除玩家
  const removePlayer = (index: number) => {
    if (players.length <= 3) return;
    
    const newPlayers = players.filter((_, i) => i !== index);
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
    
    // 如果要切换为人类玩家，先检查是否已有人类玩家
    if (!isAI && players.some((p, i) => !p.isAI && i !== index)) {
      alert('只能有一个人类玩家！');
      return;
    }
    
    let newName = player.name;
    if (isAI) {
      // 切换为AI时，生成AI名字
      const aiCount = players.filter(p => p.isAI).length;
      newName = generateAIName(AIDifficulty.EASY, aiCount);
    } else {
      // 切换为人类时，生成人类名字
      newName = '玩家1';
    }
    
    handlePlayerUpdate(index, {
      isAI,
      name: newName,
      aiStrategy: isAI ? AIDifficulty.EASY : undefined,
    });
  };

  // 更新AI难度
  const updateAIDifficulty = (index: number, difficulty: AIDifficulty) => {
    const aiCount = players.filter((p, i) => p.isAI && i <= index).length - 1;
    const newName = generateAIName(difficulty, aiCount);
    
    handlePlayerUpdate(index, {
      aiStrategy: difficulty,
      name: newName,
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

    // 确保AI玩家有正确的策略设置
    const validatedPlayers = players.map(p => ({
      id: p.id,
      name: p.name,
      isAI: p.isAI,
      aiStrategy: p.isAI ? (p.aiStrategy || AIDifficulty.EASY) : undefined,
      hand: [],
      score: 0,
    }));

    // 初始化游戏
    initializeGame({
      players: validatedPlayers,
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

        {/* 玩家设置 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-700">玩家设置</h2>
            <Button
              onClick={addPlayer}
              disabled={players.length >= 6}
              variant="primary"
              size="small"
              className="px-4"
            >
              ➕ 添加玩家
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {players.map((player, index) => (
              <div
                key={player.id}
                className="border rounded-lg p-4 bg-gray-50 relative"
              >
                {/* 移除按钮 */}
                {players.length > 3 && (
                  <button
                    onClick={() => removePlayer(index)}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors"
                    title="移除玩家"
                  >
                    ×
                  </button>
                )}

                <div className="flex items-center gap-3 mb-3">
                  <Avatar
                    player={player}
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
                    onChange={(e) => updateAIDifficulty(index, e.target.value as AIDifficulty)}
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

          {/* 玩家数量提示 */}
          <div className="mt-4 text-center text-sm text-gray-500">
            当前 {players.length} 人游戏（3-6人）｜ 
            {players.filter(p => !p.isAI).length} 个人类玩家，
            {players.filter(p => p.isAI).length} 个AI玩家
          </div>
        </div>

        {/* 基础游戏设置 */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">游戏设置</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                回合时间限制
              </label>
              <select
                value={gameSettings.turnTimeLimit}
                onChange={(e) => setGameSettings(prev => ({ ...prev, turnTimeLimit: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border rounded"
                disabled={!gameSettings.enableTurnTimer}
              >
                <option value={15}>15秒</option>
                <option value={30}>30秒</option>
                <option value={45}>45秒</option>
                <option value={60}>60秒</option>
                <option value={120}>2分钟</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={gameSettings.enableTurnTimer}
                  onChange={(e) => setGameSettings(prev => ({ ...prev, enableTurnTimer: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm text-gray-600">启用回合倒计时</span>
              </label>
              
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

        {/* AI策略说明 */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3 text-gray-700">AI策略说明</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-medium text-blue-800 mb-1">🟢 简单AI</div>
                <div className="text-blue-600">随机策略，偶尔出错，适合新手</div>
              </div>
              <div>
                <div className="font-medium text-blue-800 mb-1">🟡 中等AI</div>
                <div className="text-blue-600">基础策略，会考虑颜色和数字匹配</div>
              </div>
              <div>
                <div className="font-medium text-blue-800 mb-1">🔴 困难AI</div>
                <div className="text-blue-600">高级策略，记忆已出牌，预测对手</div>
              </div>
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
              <div className="text-sm text-gray-600 space-y-1">
                <p>• AI思考时间会根据游戏速度和难度自动调整</p>
                <p>• 困难AI会记住已出的牌并进行策略分析</p>
                <p>• UNO宣告检查可以让游戏更有挑战性</p>
                <p>• AI名字会根据难度自动生成，但可以手动修改</p>
                <p>• 回合倒计时只对人类玩家生效，超时将自动抽牌</p>
                <p>• 倒计时在最后10秒和5秒时会播放警告音效</p>
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
      </div>
    </div>
  );
}; 