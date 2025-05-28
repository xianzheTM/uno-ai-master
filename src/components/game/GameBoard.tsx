import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { PlayerHand } from './PlayerHand';
import { DiscardPile } from './DiscardPile';
import { CurrentCard } from './CurrentCard';
import { ColorPicker } from './ColorPicker';
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
    if (!isCurrentPlayerHuman) return;
    
    setSelectedCard(card);
    setSelectedCardIndex(index);
  };

  // 处理出牌
  const handleCardPlay = (card: CardType, index: number) => {
    if (!isCurrentPlayerHuman || !currentPlayer) return;
    
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
    if (!isCurrentPlayerHuman || !currentPlayer) return;
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

  // 获取其他玩家信息
  const getOtherPlayers = () => {
    if (!currentPlayer) return gameState.players;
    return gameState.players.filter((p: any) => p.id !== currentPlayer.id);
  };

  // 获取玩家位置样式
  const getPlayerPositionStyle = (playerIndex: number, totalPlayers: number) => {
    const angle = (360 / totalPlayers) * playerIndex;
    const radius = 200;
    const x = Math.cos((angle - 90) * Math.PI / 180) * radius;
    const y = Math.sin((angle - 90) * Math.PI / 180) * radius;
    
    return {
      transform: `translate(${x}px, ${y}px)`,
    };
  };

  if (gameState.phase === 'finished') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-green-100">
        <div className="text-center bg-white rounded-lg p-8 shadow-xl">
          <h1 className="text-4xl font-bold text-green-600 mb-4">🎉 游戏结束！</h1>
          <p className="text-xl mb-6">
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

  return (
    <div className={clsx('game-board relative min-h-screen bg-green-800 overflow-hidden', className)}>
      {/* 游戏背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-700 to-green-900" />
      
      {/* 游戏头部 */}
      <div className="relative z-10 flex justify-between items-center p-4 bg-black bg-opacity-20">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-white">🎮 UNO AI</h1>
          <div className="text-white">
            <span>回合: {gameState.currentPlayerIndex + 1}</span>
            <span className="ml-4">方向: {gameState.direction === 1 ? '→' : '←'}</span>
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

      {/* 游戏区域 */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-8">
        {/* 其他玩家 */}
        <div className="absolute inset-0">
          {getOtherPlayers().map((player: any, index: number) => (
            <div
              key={player.id}
              className="absolute"
              style={getPlayerPositionStyle(index, getOtherPlayers().length)}
            >
              <div className="flex flex-col items-center">
                <Avatar
                  name={player.name}
                  isActive={gameState.currentPlayerIndex === gameState.players.findIndex((p: any) => p.id === player.id)}
                  size="medium"
                />
                <div className="mt-2 text-center">
                  <div className="text-white font-medium">{player.name}</div>
                  <div className="text-green-200 text-sm">{player.hand.length} 张牌</div>
                </div>
                <div className="mt-2">
                  <PlayerHand
                    cards={player.hand}
                    isCurrentPlayer={false}
                    isVisible={false}
                    layout="fan"
                    size="small"
                    maxDisplayCards={5}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 中央游戏区域 */}
        <div className="flex items-center gap-8">
          {/* 弃牌堆 */}
          <DiscardPile
            cards={gameState.discardPile}
            currentCard={gameState.currentCard}
            size="large"
          />

          {/* 当前卡牌信息 */}
          <CurrentCard
            card={gameState.currentCard}
            effectiveColor={gameState.currentColor}
            isActive={true}
            size="large"
          />

          {/* 抽牌堆 */}
          <div className="flex flex-col items-center">
            <h3 className="text-white font-medium mb-2">抽牌堆</h3>
            <Button
              onClick={handleDrawCard}
              disabled={!isCurrentPlayerHuman || playableCards.size > 0}
              className="w-24 h-36 bg-blue-600 hover:bg-blue-700 border-2 border-white rounded-lg flex items-center justify-center"
            >
              <div className="text-center text-white">
                <div className="text-2xl mb-1">🃏</div>
                <div className="text-xs">{gameState.deck.length}</div>
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* 当前玩家手牌区域 */}
      {currentPlayer && (
        <div className="relative z-10 bg-black bg-opacity-30 p-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Avatar
                  name={currentPlayer.name}
                  isActive={true}
                  size="small"
                />
                <div className="text-white">
                  <div className="font-medium">{currentPlayer.name}</div>
                  <div className="text-sm text-green-200">
                    {isCurrentPlayerHuman ? '你的回合' : 'AI思考中...'}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                {playableCards.size === 0 && isCurrentPlayerHuman && (
                  <Button onClick={handleDrawCard}>
                    抽牌
                  </Button>
                )}
                {!isCurrentPlayerHuman && (
                  <Button onClick={handleSkipTurn} variant="secondary">
                    跳过
                  </Button>
                )}
              </div>
            </div>
            
            <PlayerHand
              cards={currentPlayer.hand}
              isCurrentPlayer={!!isCurrentPlayerHuman}
              selectedCardIndex={selectedCardIndex}
              playableCards={playableCards}
              onCardClick={handleCardClick}
              onCardPlay={handleCardPlay}
              layout="horizontal"
              size="medium"
            />
          </div>
        </div>
      )}

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