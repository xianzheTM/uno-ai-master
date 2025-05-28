import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { PlayerHand } from './PlayerHand';
import { CurrentCard } from './CurrentCard';
import { ColorPicker } from './ColorPicker';
import { PlayerInfo } from './PlayerInfo';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Avatar } from '../ui/Avatar';
import { useGameStore } from '@/stores/gameStore';
import { useUIStore } from '@/stores/uiStore';
import { Card as CardType, CardColor } from '@/types';
import { CardAdapter } from '@/utils/cardAdapter';

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
    nextTurn,
    getCurrentPlayer,
    getPlayableCards,
  } = useGameStore();

  const {
    selectedCard,
    setSelectedCard,
    showColorPicker,
    setShowColorPicker,
    showGameMenu,
    setShowGameMenu,
  } = useUIStore();

  const [selectedCardIndex, setSelectedCardIndex] = useState<number | undefined>(undefined);
  const [showUnoButton, setShowUnoButton] = useState(false);

  const currentPlayer = getCurrentPlayer();
  const isCurrentPlayerHuman = currentPlayer && !currentPlayer.isAI;
  const playableCards = currentPlayer ? getPlayableCards(currentPlayer.id) : new Set<string>();

  // 检查是否需要显示UNO按钮
  useEffect(() => {
    if (currentPlayer && !currentPlayer.isAI && currentPlayer.hand.length === 2) {
      setShowUnoButton(true);
    } else {
      setShowUnoButton(false);
    }
  }, [currentPlayer]);

  // 处理卡牌点击
  const handleCardClick = (card: CardType, index: number) => {
    if (!currentPlayer || currentPlayer.isAI || !isCurrentPlayerHuman) return;
    
    setSelectedCard(card);
    setSelectedCardIndex(index);
  };

  // 处理出牌
  const handleCardPlay = (card: CardType, index: number) => {
    if (!currentPlayer || currentPlayer.isAI || !isCurrentPlayerHuman) return;
    
    // 使用CardAdapter检查出牌合法性
    if (gameState.currentCard && !CardAdapter.canUICardPlayOn(card, gameState.currentCard)) {
      // 显示错误提示
      console.warn('无效出牌:', card);
      return;
    }

    // 如果是万能卡，显示颜色选择器
    if (CardAdapter.isUICardWild(card)) {
      setSelectedCard(card);
      setSelectedCardIndex(index);
      setShowColorPicker(true);
      return;
    }

    // 直接出牌 - 传递Card对象
    playCard(currentPlayer.id, card);
    setSelectedCard(null);
    setSelectedCardIndex(undefined);
  };

  // 处理颜色选择
  const handleColorSelect = (color: CardColor) => {
    if (!selectedCard || !currentPlayer) return;
    
    // 传递Card对象和选择的颜色
    playCard(currentPlayer.id, selectedCard, color);
    setShowColorPicker(false);
    setSelectedCard(null);
    setSelectedCardIndex(undefined);
  };

  // 处理抽牌
  const handleDrawCard = () => {
    if (!currentPlayer || currentPlayer.isAI || !isCurrentPlayerHuman) return;
    drawCard(currentPlayer.id);
  };

  // 处理UNO宣告
  const handleUnoCall = () => {
    if (!currentPlayer) return;
    callUno(currentPlayer.id);
    setShowUnoButton(false);
  };

  // 处理跳过回合
  const handleSkipTurn = () => {
    nextTurn();
  };

  // 获取玩家布局位置
  const getPlayerLayout = () => {
    const players = gameState.players;
    
    // 玩家位置保持固定，不重新排列
    return players.map((player, index) => ({
      ...player,
      originalIndex: index,
      layoutPosition: index,
    }));
  };

  // 获取玩家位置样式
  const getPlayerPositionClass = (player: any, totalPlayers: number) => {
    // 人类玩家始终在底部
    if (!player.isAI) {
      return 'bottom-player';
    }
    
    // AI玩家按顺序分配到其他位置
    const aiPlayers = gameState.players.filter(p => p.isAI);
    const aiIndex = aiPlayers.findIndex(p => p.id === player.id);
    
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
                    {gameState.direction === 1 ? '🔄' : '🔃'}
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
          <Button
            variant="secondary"
            onClick={() => setShowGameMenu(true)}
          >
            菜单
          </Button>
        </div>
      </div>

      {/* 主游戏区域 */}
      <div className="relative z-10 flex-1 game-table">
        {/* 玩家位置 */}
        {playerLayout.map((player, index) => {
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
                        cards={player.hand}
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
              setShowGameMenu(false);
              // 重新开始游戏逻辑
            }}
            className="w-full"
          >
            重新开始
          </Button>
          <Button
            onClick={() => {
              setShowGameMenu(false);
              onExitGame?.();
            }}
            variant="secondary"
            className="w-full"
          >
            退出游戏
          </Button>
          <Button
            onClick={() => setShowGameMenu(false)}
            variant="secondary"
            className="w-full"
          >
            继续游戏
          </Button>
        </div>
      </Modal>
    </div>
  );
}; 