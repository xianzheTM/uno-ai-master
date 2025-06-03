import React, { useState, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { PlayerHand } from './PlayerHand';
import { CurrentCard } from './CurrentCard';
import { ColorPicker } from './ColorPicker';
import { PlayerInfo } from './PlayerInfo';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { NotificationContainer } from '../ui/NotificationContainer';
import { useGameStore } from '@/stores/gameStore';
import { useUIStore } from '@/stores/uiStore';
import { Card as CardType, CardColor, Player } from '@/types';
import { CardAdapter } from '@/utils/cardAdapter';
import { playGameSound, playGameMusic, stopGameMusic, GameSoundType } from '@/utils/soundManager';

interface GameBoardProps {
  onExitGame?: () => void;
  className?: string;
}

/**
 * 游戏主界面组件
 * 集成所有游戏组件，提供完整的游戏体验
 */
export const GameBoard: React.FC<GameBoardProps> = ({
  onExitGame,
  className,
}) => {
  const {
    gameState,
    playCard,
    drawCard,
    callUno,
    getCurrentPlayer,
    getPlayableCards,
    challengeUnoViolation,
    challengeWildDrawFour,
    canChallengeUnoViolation,
    canChallengeWildDrawFour,
  } = useGameStore();

  const {
    selectedCard,
    setSelectedCard,
    showColorPicker,
    setShowColorPicker,
    showGameMenu,
    setShowGameMenu,
    soundEnabled,
    addNotification,
  } = useUIStore();

  const [selectedCardIndex, setSelectedCardIndex] = useState<number | undefined>(undefined);
  const [showUnoButton, setShowUnoButton] = useState(false);
  const [showChallengeButtons, setShowChallengeButtons] = useState(false);
  const [challengeResult, setChallengeResult] = useState<string | null>(null);

  // 用于跟踪游戏状态变化和播放音效
  const prevGameStateRef = useRef(gameState);
  const musicPlayedRef = useRef(false);

  const currentPlayer = getCurrentPlayer();
  const isCurrentPlayerHuman = currentPlayer && !currentPlayer.isAI;
  const playableCards = currentPlayer ? getPlayableCards(currentPlayer.id) : new Set<string>();

  // 播放背景音乐
  useEffect(() => {
    if (soundEnabled && gameState.phase === 'playing' && !musicPlayedRef.current) {
      playGameMusic(GameSoundType.GAME_MUSIC);
      musicPlayedRef.current = true;
    }
  }, [soundEnabled, gameState.phase]);

  // 监听游戏状态变化，播放相应音效
  useEffect(() => {
    const prevState = prevGameStateRef.current;
    
    if (!soundEnabled) return;

    // 游戏开始音效（只在第一次进入playing阶段时播放）
    if (prevState.phase !== 'playing' && gameState.phase === 'playing') {
      playGameSound(GameSoundType.GAME_START);
    }

    // 游戏结束音效
    if (prevState.phase !== 'finished' && gameState.phase === 'finished') {
      // 停止背景音乐
      stopGameMusic();
      if (gameState.winner) {
        playGameSound(GameSoundType.VICTORY);
      }
    }

    // 当前玩家变化时的音效（只在轮到人类玩家时播放）
    if (prevState.currentPlayerIndex !== gameState.currentPlayerIndex) {
      const newCurrentPlayer = gameState.players[gameState.currentPlayerIndex];
      if (newCurrentPlayer && !newCurrentPlayer.isAI) {
        playGameSound(GameSoundType.CLOCK_BELL);
      }
    }

    prevGameStateRef.current = gameState;
  }, [gameState.phase, gameState.currentPlayerIndex, gameState.winner, soundEnabled]);

  // 组件卸载时停止音乐
  useEffect(() => {
    return () => {
      stopGameMusic();
    };
  }, []);

  // 键盘快捷键监听
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'm') {
        const { setSoundEnabled } = useUIStore.getState();
        setSoundEnabled(!soundEnabled);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [soundEnabled]);

  // 检查是否需要显示UNO按钮
  useEffect(() => {
    if (currentPlayer && !currentPlayer.isAI) {
      const handCount = currentPlayer.hand.length;
      // 手牌剩余2张（预防性宣告）或手牌剩余1张且未宣告（补救性宣告）时显示UNO按钮
      if (handCount === 2 || (handCount === 1 && !currentPlayer.hasCalledUno)) {
        setShowUnoButton(true);
      } else {
        setShowUnoButton(false);
      }
    } else {
      setShowUnoButton(false);
    }
  }, [currentPlayer]);

  // 检查是否需要显示质疑按钮
  useEffect(() => {
    if (!currentPlayer || currentPlayer.isAI) {
      setShowChallengeButtons(false);
      return;
    }

    // 检查是否可以质疑UNO违规或Wild Draw Four
    const canChallengeUno = gameState.players.some((player: Player) => 
      player.id !== currentPlayer.id && canChallengeUnoViolation(player.id)
    );
    const canChallengeWild = canChallengeWildDrawFour();
    
    setShowChallengeButtons(canChallengeUno || canChallengeWild);
  }, [gameState, currentPlayer, canChallengeUnoViolation, canChallengeWildDrawFour]);

  // 为其他玩家创建安全的手牌表示（只包含数量，不包含实际卡牌）
  const createSecureHandForOtherPlayer = (handSize: number): CardType[] => {
    return Array(handSize).fill(null).map((_, index) => ({
      id: `hidden-${index}`,
      type: 'number' as any,
      color: 'red' as any,
      value: '0' as any,
      cardValue: 0,
      canPlayOn: () => false,
      toJSON: () => ({ type: 'number' as any, color: 'red' as any, value: '0' as any })
    }));
  };

  // 处理卡牌点击
  const handleCardClick = (card: CardType, index: number) => {
    if (!currentPlayer || currentPlayer.isAI || !isCurrentPlayerHuman) return;
    
    if (soundEnabled) {
      playGameSound(GameSoundType.CARD_SELECT);
    }
    
    setSelectedCard(card);
    setSelectedCardIndex(index);
  };

  // 处理出牌
  const handleCardPlay = (card: CardType, index: number) => {
    if (!currentPlayer || currentPlayer.isAI || !isCurrentPlayerHuman) return;
    
    // 使用CardAdapter检查出牌合法性
    if (gameState.currentCard && !CardAdapter.canUICardPlayOn(card, gameState.currentCard)) {
      // 播放错误音效
      if (soundEnabled) {
        playGameSound(GameSoundType.BUTTON_NEGATIVE);
      }
      console.warn('无效出牌:', card);
      return;
    }

    // 播放出牌音效
    if (soundEnabled) {
      if (CardAdapter.isUICardWild(card)) {
        playGameSound(GameSoundType.CARD_WILD);
      } else if (card.type === 'skip') {
        playGameSound(GameSoundType.CARD_SKIP);
      } else if (card.type === 'reverse') {
        playGameSound(GameSoundType.CARD_REVERSE);
      } else if (card.type === 'draw_two' || card.type === 'wild_draw_four') {
        playGameSound(GameSoundType.CARD_DRAW_TWO);
      } else {
        playGameSound(GameSoundType.CARD_PLAY);
      }
    }

    // 如果是万能卡，显示颜色选择器
    if (CardAdapter.isUICardWild(card)) {
      setSelectedCard(card);
      setSelectedCardIndex(index);
      setShowColorPicker(true);
      return;
    }

    // 直接出牌 - 传递Card对象
    const success = playCard(currentPlayer.id, card);
    if (success) {
      setSelectedCard(null);
      setSelectedCardIndex(undefined);
    } else {
      // 出牌失败的处理
      if (soundEnabled) {
        playGameSound(GameSoundType.BUTTON_NEGATIVE);
      }
      console.warn('出牌失败:', card);
      
      // 添加出牌失败通知
      addNotification({
        type: 'error',
        title: '出牌失败',
        message: '该卡牌无法在当前情况下出牌',
        duration: 3000
      });
    }
  };

  // 处理颜色选择
  const handleColorSelect = (color: CardColor) => {
    if (!selectedCard || !currentPlayer) return;
    
    if (soundEnabled) {
      playGameSound(GameSoundType.BUTTON_CLICK);
    }
    
    // 传递Card对象和选择的颜色
    const success = playCard(currentPlayer.id, selectedCard, color);
    if (success) {
      setShowColorPicker(false);
      setSelectedCard(null);
      setSelectedCardIndex(undefined);
    } else {
      // 万能卡出牌失败的处理
      if (soundEnabled) {
        playGameSound(GameSoundType.BUTTON_NEGATIVE);
      }
      console.warn('万能卡出牌失败:', selectedCard);
      
      // 添加出牌失败通知
      addNotification({
        type: 'error',
        title: '出牌失败',
        message: '万能卡无法在当前情况下出牌',
        duration: 3000
      });
      
      // 保持颜色选择器打开，让用户重新选择
    }
  };

  // 处理抽牌
  const handleDrawCard = () => {
    if (!currentPlayer || currentPlayer.isAI || !isCurrentPlayerHuman) return;
    
    if (soundEnabled) {
      playGameSound(GameSoundType.CARD_DRAW);
    }
    
    drawCard(currentPlayer.id);
  };

  // 处理UNO宣告
  const handleUnoCall = () => {
    if (!currentPlayer) return;
    
    if (soundEnabled) {
      playGameSound(GameSoundType.UNO_CALL);
    }
    
    callUno(currentPlayer.id);
    setShowUnoButton(false);
  };

  // 处理质疑UNO违规
  const handleChallengeUno = (suspectedPlayerId: string) => {
    if (!currentPlayer) return;
    
    const result = challengeUnoViolation(currentPlayer.id, suspectedPlayerId);
    if (result.success) {
      setChallengeResult(`质疑成功！玩家 ${suspectedPlayerId} 罚抽 ${result.penaltyCards} 张牌`);
      if (soundEnabled) {
        playGameSound(GameSoundType.ACHIEVEMENT);
      }
    } else {
      setChallengeResult('质疑失败！该玩家没有违规');
      if (soundEnabled) {
        playGameSound(GameSoundType.BUTTON_NEGATIVE);
      }
    }
    
    // 3秒后清除结果提示
    setTimeout(() => setChallengeResult(null), 3000);
    setShowChallengeButtons(false);
  };

  // 处理质疑Wild Draw Four
  const handleChallengeWildDrawFour = () => {
    if (!currentPlayer) return;
    
    const result = challengeWildDrawFour(currentPlayer.id);
    if (result.success) {
      setChallengeResult(`质疑成功！出牌者有其他可出的牌，罚抽 ${result.penaltyCards} 张牌`);
      if (soundEnabled) {
        playGameSound(GameSoundType.ACHIEVEMENT);
      }
    } else {
      setChallengeResult(`质疑失败！出牌者合法使用万能+4卡，你罚抽 ${result.penaltyCards} 张牌`);
      if (soundEnabled) {
        playGameSound(GameSoundType.BUTTON_NEGATIVE);
      }
    }
    
    // 3秒后清除结果提示
    setTimeout(() => setChallengeResult(null), 3000);
    setShowChallengeButtons(false);
  };

  // 按钮点击音效 - 只用于普通按钮
  const handleButtonClick = () => {
    if (soundEnabled) {
      playGameSound(GameSoundType.BUTTON_CLICK);
    }
  };

  // 获取玩家布局位置
  const getPlayerLayout = () => {
    const players = gameState.players;
    
    // 玩家位置保持固定，不重新排列
    return players.map((player: Player, index: number) => ({
      ...player,
      originalIndex: index,
      layoutPosition: index,
    }));
  };

  // 获取玩家位置样式
  const getPlayerPositionClass = (player: Player & { originalIndex: number; layoutPosition: number }, totalPlayers: number) => {
    // 人类玩家始终在底部
    if (!player.isAI) {
      return 'bottom-player';
    }
    
    // AI玩家按顺序分配到其他位置
    const aiPlayers = gameState.players.filter((p: Player) => p.isAI);
    const aiIndex = aiPlayers.findIndex((p: Player) => p.id === player.id);
    
    switch (totalPlayers) {
      case 2:
        return 'top-player';
      case 3:
        return aiIndex === 0 ? 'left-player' : 'right-player';
      case 4:
        if (aiIndex === 0) return 'left-player';
        if (aiIndex === 1) return 'top-player';
        if (aiIndex === 2) return 'right-player';
        return '';
      case 5:
        if (aiIndex === 0) return 'left-player';
        if (aiIndex === 1) return 'top-left-player';
        if (aiIndex === 2) return 'top-right-player';
        if (aiIndex === 3) return 'right-player';
        return '';
      case 6:
        if (aiIndex === 0) return 'left-player';
        if (aiIndex === 1) return 'top-left-player';
        if (aiIndex === 2) return 'top-player';
        if (aiIndex === 3) return 'top-right-player';
        if (aiIndex === 4) return 'right-player';
        return '';
      default:
        return '';
    }
  };

  // 设置全局通知函数，供GameEngine使用
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).gameNotification = (notification: any) => {
        // 添加通知
        addNotification(notification);
        
        // 根据通知类型播放音效
        if (soundEnabled) {
          if (notification.title === 'UNO违规') {
            playGameSound(GameSoundType.BUTTON_NEGATIVE);
          }
        }
      };
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).gameNotification;
      }
    };
  }, [addNotification, soundEnabled]);

  if (gameState.phase === 'finished') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center bg-white rounded-lg p-8 shadow-xl border border-gray-200">
          <h1 className="text-4xl font-bold text-indigo-600 mb-4">🎉 游戏结束！</h1>
          <p className="text-xl mb-6 text-gray-700">
            获胜者：{gameState.winner?.name}
          </p>
          <div className="space-x-4">
            <Button onClick={() => window.location.reload()}>
              重新开始
            </Button>
            <Button variant="secondary" onClick={onExitGame}>
              退出游戏
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const playerLayout = getPlayerLayout();

  return (
    <div className={clsx('game-board relative min-h-screen bg-slate-100 overflow-hidden', className)}>
      {/* 游戏背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />
      
      {/* 游戏头部 */}
      <div className="relative z-10 flex justify-between items-center p-4 bg-white bg-opacity-90 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-bold text-gray-800">🎮 UNO AI</h1>
          
          {/* 回合信息 */}
          <div className="flex items-center gap-4">
            <div className="text-center bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-3 rounded-xl border-2 border-gray-300 shadow-md">
              <div className="text-xs text-gray-600 uppercase tracking-wide font-semibold mb-1">回合</div>
              <div className="text-xl font-bold text-gray-800 bg-white px-2 py-1 rounded-md shadow-sm">
                {gameState.turnCount}
              </div>
            </div>
            
            {/* 游戏方向指示器 */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-3 rounded-xl border-2 border-blue-300 shadow-md hover:shadow-lg transition-all duration-200">
              <div className="text-center">
                <div className="text-xs text-blue-600 uppercase tracking-wide font-semibold mb-1">游戏方向</div>
                <div className="flex items-center gap-3">
                  <span className="text-base font-bold text-blue-900 bg-white px-2 py-1 rounded-md shadow-sm">
                    {gameState.direction === 1 ? '顺时针' : '逆时针'}
                  </span>
                  <div className={`text-3xl filter drop-shadow-md transition-all duration-500 ${
                    gameState.direction === 1 ? 'animate-spin-slow' : 'animate-spin-slow-reverse'
                  }`}>
                    {gameState.direction === 1 ? '🔃' : '🔄'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {showUnoButton && (
            <Button
              variant="primary"
              onClick={handleUnoCall}
              className="bg-red-500 hover:bg-red-600 animate-pulse"
            >
              UNO!
            </Button>
          )}
          
          {/* 音效状态指示器 */}
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <span className={soundEnabled ? 'text-green-600' : 'text-red-600'}>
              {soundEnabled ? '🔊' : '🔇'}
            </span>
            <span className="text-xs hidden sm:inline">按 M 切换</span>
          </div>
          
          {/* 质疑按钮 */}
          {showChallengeButtons && (
            <div className="flex items-center gap-2">
              {/* 质疑UNO违规 */}
              {gameState.players.some((player: Player) => 
                player.id !== currentPlayer?.id && canChallengeUnoViolation(player.id)
              ) && (
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-700">质疑UNO:</span>
                  {gameState.players
                    .filter((player: Player) => 
                      player.id !== currentPlayer?.id && canChallengeUnoViolation(player.id)
                    )
                    .map((player: Player) => (
                      <Button
                        key={player.id}
                        variant="secondary"
                        size="small"
                        onClick={() => handleChallengeUno(player.id)}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        {player.name}
                      </Button>
                    ))
                  }
                </div>
              )}
              
              {/* 质疑Wild Draw Four */}
              {canChallengeWildDrawFour() && (
                <Button
                  variant="secondary"
                  onClick={handleChallengeWildDrawFour}
                  className="bg-purple-500 hover:bg-purple-600 text-white"
                >
                  质疑万能+4
                </Button>
              )}
            </div>
          )}
          
          <Button
            variant="secondary"
            onClick={() => {
              handleButtonClick();
              setShowGameMenu(true);
            }}
          >
            菜单
          </Button>
        </div>
      </div>

      {/* 主游戏区域 */}
      <div className="relative z-10 flex-1 game-table">
        {/* 质疑结果提示 */}
        {challengeResult && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg border-2 border-blue-600 animate-bounce">
              <div className="text-center font-bold">
                {challengeResult}
              </div>
            </div>
          </div>
        )}
        
        {/* 玩家位置 */}
        {playerLayout.map((player: Player & { originalIndex: number; layoutPosition: number }) => {
          const positionClass = getPlayerPositionClass(player, playerLayout.length);
          const isCurrentTurn = player.originalIndex === gameState.currentPlayerIndex;
          const isHumanPlayer = !player.isAI;
          
          return (
            <div
              key={player.id}
              className={clsx('player-position', positionClass)}
            >
              {isHumanPlayer ? (
                // 人类玩家 - 左右布局：玩家信息在左，手牌在右
                <div className="bottom-player-area">
                  <div className="flex items-start gap-4 w-full">
                    {/* 玩家信息 */}
                    <div className="flex-shrink-0">
                      <PlayerInfo
                        player={player}
                        isActive={isCurrentTurn}
                        isCurrentPlayer={isCurrentTurn}
                        size="medium"
                      />
                    </div>
                    
                    {/* 手牌区域 */}
                    <div className="flex-1">
                      <PlayerHand
                        cards={player.hand}
                        isCurrentPlayer={isCurrentTurn && !player.isAI}
                        selectedCardIndex={isCurrentTurn ? selectedCardIndex : undefined}
                        playableCards={isCurrentTurn ? playableCards : new Set()}
                        onCardClick={isCurrentTurn ? handleCardClick : undefined}
                        onCardPlay={isCurrentTurn ? handleCardPlay : undefined}
                        layout="horizontal"
                        size="medium"
                      />
                    </div>
                    
                    {/* 操作按钮 */}
                    <div className="flex-shrink-0 flex items-start">
                      {playableCards.size === 0 && isCurrentTurn && !player.isAI && (
                        <Button onClick={handleDrawCard}>
                          抽牌
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // AI玩家 - 显示简化信息
                <div className="other-player-area">
                  <div className="flex items-center gap-3">
                    <PlayerInfo
                      player={player}
                      isActive={isCurrentTurn}
                      isCurrentPlayer={false}
                      size="small"
                    />
                    
                    <div className="flex-shrink-0">
                      <PlayerHand
                        cards={createSecureHandForOtherPlayer(player.hand.length)}
                        isCurrentPlayer={false}
                        isVisible={false}
                        layout="fan"
                        size="small"
                        maxDisplayCards={Math.min(player.hand.length, 5)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* 中央游戏区域 */}
        <div className="central-game-area">
          <div className="flex items-center justify-center gap-8">
            {/* 当前卡牌 */}
            <CurrentCard
              card={gameState.currentCard}
              effectiveColor={gameState.currentColor}
              isActive={true}
              size="medium"
            />

            {/* 抽牌堆 */}
            <div className="flex flex-col items-center">
              <h3 className="text-gray-700 font-medium mb-2 text-sm">抽牌堆</h3>
              <Button
                onClick={handleDrawCard}
                disabled={!isCurrentPlayerHuman || playableCards.size > 0}
                className="w-24 h-32 bg-blue-600 hover:bg-blue-700 border-2 border-white rounded-lg flex items-center justify-center"
              >
                <div className="text-center text-white">
                  <div className="text-2xl mb-2">🃏</div>
                  <div className="text-sm font-medium">{gameState.deck.length}</div>
                  <div className="text-xs opacity-75">张牌</div>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 颜色选择器 */}
      <ColorPicker
        isOpen={showColorPicker}
        onColorSelect={handleColorSelect}
        onCancel={() => {
          if (soundEnabled) playGameSound(GameSoundType.BUTTON_BACK);
          setShowColorPicker(false);
          setSelectedCard(null);
          setSelectedCardIndex(undefined);
        }}
        title="选择新颜色"
        description="请为万能卡选择新的颜色"
      />

      {/* 游戏菜单 */}
      <Modal
        isOpen={showGameMenu}
        onClose={() => setShowGameMenu(false)}
        title="游戏菜单"
      >
        <div className="space-y-4">
          <Button
            onClick={() => {
              handleButtonClick();
              setShowGameMenu(false);
              // 重新开始游戏逻辑
            }}
            className="w-full"
          >
            重新开始
          </Button>
          <Button
            onClick={() => {
              if (soundEnabled) playGameSound(GameSoundType.BUTTON_BACK);
              stopGameMusic();
              setShowGameMenu(false);
              onExitGame?.();
            }}
            variant="secondary"
            className="w-full"
          >
            退出游戏
          </Button>
          <Button
            onClick={() => {
              handleButtonClick();
              setShowGameMenu(false);
            }}
            variant="secondary"
            className="w-full"
          >
            继续游戏
          </Button>
        </div>
      </Modal>
      
      {/* 通知容器 */}
      <NotificationContainer />
    </div>
  );
}; 