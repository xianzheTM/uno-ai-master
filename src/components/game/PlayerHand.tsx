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
  const displayCards = cards.slice(0, maxDisplayCards);
  const hiddenCount = Math.max(0, cards.length - maxDisplayCards);

  // 布局样式
  const getLayoutStyles = () => {
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
        return {
          container: 'flex gap-2 overflow-x-auto',
          card: () => ({}),
        };
    }
  };

  const layoutStyles = getLayoutStyles();

  // 卡牌尺寸映射
  const cardSizeMap = {
    small: 'small' as const,
    medium: 'medium' as const,
    large: 'medium' as const, // 手牌中的大尺寸使用medium避免过大
  };

  return (
    <div className={clsx('player-hand', className)}>
      {/* 手牌容器 */}
      <div className={clsx(layoutStyles.container, 'min-h-[80px]')}>
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
                size={cardSizeMap[size]}
                isSelected={isSelected}
                isPlayable={isCurrentPlayer ? isPlayable : undefined}
                isHidden={!isVisible}
                onClick={() => handleCardClick(card, index)}
                onDoubleClick={() => handleCardDoubleClick(card, index)}
                className={clsx({
                  'ring-2 ring-blue-400 ring-offset-2': isSelected,
                  'ring-2 ring-green-400 ring-offset-1': isPlayable && !isSelected,
                  'opacity-60': !isCurrentPlayer && isVisible,
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
        <span className="text-sm text-gray-600">
          {cards.length} 张手牌
          {isCurrentPlayer && playableCards && (
            <span className="ml-2 text-green-600">
              ({playableCards.size} 张可出)
            </span>
          )}
        </span>
      </div>

      {/* 操作提示 */}
      {isCurrentPlayer && (
        <div className="mt-1 text-center">
          <span className="text-xs text-gray-500">
            {playableCards && playableCards.size > 0
              ? '点击可出的牌来出牌'
              : '没有可出的牌，点击抽牌'}
          </span>
        </div>
      )}
    </div>
  );
}; 