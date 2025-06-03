import React, { useState, useEffect } from 'react';
import { GameSetup } from './game/GameSetup';
import { GameBoard } from './game/GameBoard';
import { useGameStore } from '@/stores/gameStore';
import { useUIStore } from '@/stores/uiStore';
import { playGameMusic, stopGameMusic, GameSoundType } from '@/utils/soundManager';

type GamePhase = 'setup' | 'playing' | 'finished';

// 错误边界组件
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('GameBoard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="text-center bg-white rounded-lg p-8 shadow-xl max-w-md">
            <h1 className="text-2xl font-bold text-red-600 mb-4">🚨 游戏出错了</h1>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || '未知错误'}
            </p>
            <pre className="text-xs text-gray-500 bg-gray-100 p-2 rounded overflow-auto max-h-32">
              {this.state.error?.stack}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              重新加载
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * UNO游戏主应用组件
 * 管理游戏的整个生命周期
 */
export const UnoGame: React.FC = () => {
  const [gamePhase, setGamePhase] = useState<GamePhase>('setup');
  
  const { gameState, resetGame } = useGameStore();
  const { resetUI, musicEnabled } = useUIStore();

  // 播放菜单音乐
  useEffect(() => {
    if (musicEnabled && gamePhase === 'setup') {
      playGameMusic(GameSoundType.MENU_MUSIC);
    }
  }, [musicEnabled, gamePhase]);

  // 监听游戏状态变化
  useEffect(() => {
    if (gameState.phase === 'setup') {
      setGamePhase('setup');
    } else if (gameState.phase === 'playing') {
      setGamePhase('playing');
      // 切换到游戏中时停止菜单音乐
      stopGameMusic();
    } else if (gameState.phase === 'finished') {
      setGamePhase('finished');
    }
  }, [gameState.phase]);

  // 开始游戏
  const handleStartGame = () => {
    setGamePhase('playing');
  };

  // 退出游戏
  const handleExitGame = () => {
    resetGame();
    resetUI();
    setGamePhase('setup');
    
    // 重新播放菜单音乐
    if (musicEnabled) {
      playGameMusic(GameSoundType.MENU_MUSIC);
    }
  };

  // 根据游戏阶段渲染不同的界面
  switch (gamePhase) {
    case 'setup':
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
          <GameSetup
            onStartGame={handleStartGame}
            onCancel={() => {
              // 可以添加返回主菜单的逻辑
            }}
          />
        </div>
      );

    case 'playing':
    case 'finished':
      return (
        <ErrorBoundary>
          <GameBoard
            onExitGame={handleExitGame}
          />
        </ErrorBoundary>
      );

    default:
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              游戏加载中...
            </h1>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        </div>
      );
  }
}; 