import React, { useState } from 'react';
import { PlayerHand, DiscardPile, CurrentCard, ColorPicker } from './game';
import { Button } from './ui';
import { Card as CardType, CardColor } from '@/types';
import { createStandardDeck } from '@/utils';

export const GameDemo: React.FC = () => {
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | undefined>(undefined);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<CardColor>(CardColor.RED);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  // 创建示例数据
  const allCards = createStandardDeck();
  const playerCards = allCards.slice(0, 7);
  const discardCards = allCards.slice(50, 55);
  const currentCard = allCards[currentCardIndex];

  // 创建可出牌的集合（示例：前3张牌可出）
  const playableCards = new Set(playerCards.slice(0, 3).map(card => card.id));

  // 处理卡牌点击
  const handleCardClick = (card: CardType, index: number) => {
    setSelectedCardIndex(index);
    console.log('选中卡牌:', card, '索引:', index);
  };

  // 处理出牌
  const handleCardPlay = (card: CardType, index: number) => {
    console.log('出牌:', card, '索引:', index);
    // 如果是万能卡，打开颜色选择器
    if (card.type === 'wild' || card.type === 'wild_draw_four') {
      setIsColorPickerOpen(true);
    }
  };

  // 处理颜色选择
  const handleColorSelect = (color: CardColor) => {
    setSelectedColor(color);
    setIsColorPickerOpen(false);
    console.log('选择颜色:', color);
  };

  // 切换当前卡牌
  const handleNextCard = () => {
    setCurrentCardIndex((prev) => (prev + 1) % allCards.length);
  };

  return (
    <div data-testid="game-demo" className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🎮 游戏组件演示
        </h1>
        <p className="text-gray-600">
          展示UNO游戏中使用的所有游戏组件
        </p>
      </div>

      {/* PlayerHand组件演示 */}
      <section className="bg-white rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">🃏 PlayerHand 组件</h2>
        
        {/* 不同布局模式 */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-3">水平布局（当前玩家）</h3>
            <PlayerHand
              cards={playerCards}
              isCurrentPlayer={true}
              selectedCardIndex={selectedCardIndex}
              playableCards={playableCards}
              layout="horizontal"
              onCardClick={handleCardClick}
              onCardPlay={handleCardPlay}
            />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">扇形布局（其他玩家）</h3>
            <PlayerHand
              cards={playerCards.slice(0, 5)}
              isCurrentPlayer={false}
              layout="fan"
              size="small"
            />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">堆叠布局（隐藏手牌）</h3>
            <PlayerHand
              cards={playerCards}
              isCurrentPlayer={false}
              isVisible={false}
              layout="stack"
              size="small"
            />
          </div>
        </div>
      </section>

      {/* DiscardPile组件演示 */}
      <section className="bg-white rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">🗂️ DiscardPile 组件</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-3">有卡牌的弃牌堆</h3>
            <DiscardPile
              cards={discardCards}
              currentCard={currentCard}
              onPileClick={() => console.log('点击弃牌堆')}
            />
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-3">空弃牌堆</h3>
            <DiscardPile
              cards={[]}
              onPileClick={() => console.log('点击空弃牌堆')}
            />
          </div>
        </div>
      </section>

      {/* CurrentCard组件演示 */}
      <section className="bg-white rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">🎯 CurrentCard 组件</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-3">当前卡牌（详细模式）</h3>
            <CurrentCard
              card={currentCard}
              effectiveColor={selectedColor}
              isActive={true}
              onCardClick={() => console.log('点击当前卡牌')}
            />
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-3">简化模式</h3>
            <CurrentCard
              card={currentCard}
              showDetails={false}
              size="medium"
            />
          </div>
        </div>

        <div className="mt-4 text-center">
          <Button onClick={handleNextCard}>
            切换到下一张卡牌
          </Button>
        </div>
      </section>

      {/* ColorPicker组件演示 */}
      <section className="bg-white rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">🎨 ColorPicker 组件</h2>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="primary"
              onClick={() => setIsColorPickerOpen(true)}
            >
              打开颜色选择器
            </Button>
            <div className="flex items-center gap-2">
              <span>当前选择的颜色:</span>
              <div
                className={`w-6 h-6 rounded-full border-2 border-white shadow-md ${
                  selectedColor === 'red' ? 'bg-red-500' :
                  selectedColor === 'blue' ? 'bg-blue-500' :
                  selectedColor === 'green' ? 'bg-green-500' :
                  selectedColor === 'yellow' ? 'bg-yellow-500' :
                  'bg-gray-500'
                }`}
              />
              <span className="font-medium">
                {selectedColor === 'red' ? '红色' :
                 selectedColor === 'blue' ? '蓝色' :
                 selectedColor === 'green' ? '绿色' :
                 selectedColor === 'yellow' ? '黄色' : '未知'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 游戏场景模拟 */}
      <section className="bg-white rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">🎲 游戏场景模拟</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：其他玩家手牌 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">其他玩家</h3>
            <PlayerHand
              cards={allCards.slice(20, 25)}
              isCurrentPlayer={false}
              layout="fan"
              size="small"
            />
            <PlayerHand
              cards={allCards.slice(30, 37)}
              isCurrentPlayer={false}
              isVisible={false}
              layout="stack"
              size="small"
            />
          </div>

          {/* 中间：游戏区域 */}
          <div className="flex flex-col items-center space-y-4">
            <CurrentCard
              card={currentCard}
              effectiveColor={selectedColor}
              isActive={true}
              size="medium"
            />
            <DiscardPile
              cards={discardCards}
              currentCard={currentCard}
              size="medium"
            />
          </div>

          {/* 右侧：当前玩家手牌 */}
          <div>
            <h3 className="text-lg font-medium mb-4">你的手牌</h3>
            <PlayerHand
              cards={playerCards}
              isCurrentPlayer={true}
              selectedCardIndex={selectedCardIndex}
              playableCards={playableCards}
              layout="horizontal"
              onCardClick={handleCardClick}
              onCardPlay={handleCardPlay}
            />
          </div>
        </div>
      </section>

      {/* 颜色选择器 */}
      <ColorPicker
        isOpen={isColorPickerOpen}
        selectedColor={selectedColor}
        onColorSelect={handleColorSelect}
        onCancel={() => setIsColorPickerOpen(false)}
      />
    </div>
  );
}; 