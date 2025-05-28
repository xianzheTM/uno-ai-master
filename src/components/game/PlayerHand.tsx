import React, { useState } from 'react';
import { clsx } from 'clsx';
import { Card } from '../ui/Card';
import { Card as CardType } from '@/types';

interface PlayerHandProps {
  cards: CardType[];
  isCurrentPlayer?: boolean;
  isVisible?: boolean;
  maxDisplayCards?: number;
  onCardClick?: (card: CardType, index: number) => void;
  onCardPlay?: (card: CardType, index: number) => void;
  selectedCardIndex?: number;
  playableCards?: Set<string>;
  layout?: 'horizontal' | 'fan' | 'stack';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

/**
 * 玩家手牌组件
 * 支持不同的布局模式、卡牌选择和交互
 */
export const PlayerHand: React.FC<PlayerHandProps> = ({
  cards,
  isCurrentPlayer = false,
  isVisible = true,
  maxDisplayCards = 10,
  onCardClick,
  onCardPlay,
  selectedCardIndex,
  playableCards,
  layout = 'horizontal',
  size = 'medium',
  className,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // 处理卡牌点击
  const handleCardClick = (card: CardType, index: number) => {
    if (!isCurrentPlayer) return;
    
    onCardClick?.(card, index);
    
    // 如果是可出的牌且是当前玩家，触发出牌
    if (playableCards?.has(card.id)) {
      onCardPlay?.(card, index);
    }
  };

  // 处理双击出牌
  const handleCardDoubleClick = (card: CardType, index: number) => {
    if (!isCurrentPlayer || !playableCards?.has(card.id)) return;
    onCardPlay?.(card, index);
  };

  // 计算显示的卡牌
  const effectiveMaxDisplay = isCurrentPlayer ? cards.length : maxDisplayCards;
  const displayCards = cards.slice(0, effectiveMaxDisplay);
  const hiddenCount = Math.max(0, cards.length - effectiveMaxDisplay);

  // 布局样式
  const getLayoutStyles = () => {
    const cardCount = displayCards.length;
    
    switch (layout) {
      case 'fan':
        return {
          container: 'relative flex justify-center items-end',
          card: (index: number) => ({
            transform: `rotate(${(index - displayCards.length / 2) * 8}deg) translateY(${Math.abs(index - displayCards.length / 2) * 2}px)`,
            zIndex: hoveredIndex === index ? 50 : displayCards.length - Math.abs(index - displayCards.length / 2),
          }),
        };
      case 'stack':
        return {
          container: 'relative',
          card: (index: number) => ({
            transform: `translateX(${index * 2}px) translateY(${index * -1}px)`,
            zIndex: index,
          }),
        };
      default: // horizontal
        // 根据卡牌数量调整间距，支持更多卡牌
        let gap = 'gap-2';
        if (cardCount > 12) gap = 'gap-0.5';
        else if (cardCount > 10) gap = 'gap-1';
        else if (cardCount > 8) gap = 'gap-1.5';
        
        return {
          container: `flex ${gap} justify-center items-center flex-wrap`,
          card: () => ({}),
        };
    }
  };

  const layoutStyles = getLayoutStyles();

  return (
    <div className={clsx('player-hand w-full', className)}>
      {/* 手牌容器 */}
      <div className={clsx(
        layoutStyles.container, 
        'min-h-[80px]',
        layout === 'horizontal' && 'max-w-full'
      )}>
        {displayCards.map((card, index) => {
          const isSelected = selectedCardIndex === index;
          const isPlayable = playableCards?.has(card.id) ?? false;
          const isHovered = hoveredIndex === index;

          return (
            <div
              key={`${card.id}-${index}`}
              className={clsx(
                'transition-all duration-200',
                layout === 'horizontal' ? 'flex-shrink-0' : 'absolute',
                {
                  'cursor-pointer': isCurrentPlayer,
                  'transform hover:scale-105': isCurrentPlayer && layout === 'horizontal',
                  'hover:-translate-y-2': isCurrentPlayer && layout === 'horizontal',
                }
              )}
              style={layout !== 'horizontal' ? layoutStyles.card(index) : undefined}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <Card
                card={card}
                size={size}
                isSelected={isSelected}
                isPlayable={isCurrentPlayer ? isPlayable : undefined}
                isHidden={!isVisible}
                onClick={() => handleCardClick(card, index)}
                onDoubleClick={() => handleCardDoubleClick(card, index)}
                className={clsx({
                  'ring-2 ring-blue-400 ring-offset-2': isSelected,
                  'ring-2 ring-green-400 ring-offset-1': isPlayable && !isSelected,
                  'transform scale-110': isHovered && layout !== 'horizontal',
                })}
              />
            </div>
          );
        })}

        {/* 隐藏卡牌数量提示 */}
        {hiddenCount > 0 && (
          <div className="flex items-center justify-center ml-2">
            <div className="bg-gray-600 text-white text-xs px-2 py-1 rounded-full">
              +{hiddenCount}
            </div>
          </div>
        )}
      </div>

      {/* 手牌信息 */}
      <div className="mt-2 text-center">
        <span className="text-sm text-gray-700 font-medium">
          {cards.length} 张手牌
          {isCurrentPlayer && playableCards && playableCards.size > 0 && (
            <span className="ml-2 text-green-700 font-semibold">
              ({playableCards.size} 张可出)
            </span>
          )}
        </span>
      </div>
    </div>
  );
}; 