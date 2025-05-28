import React from 'react';
import { clsx } from 'clsx';
import { Card } from '../ui/Card';
import { Card as CardType } from '@/types';

interface DiscardPileProps {
  cards: CardType[];
  currentCard?: CardType;
  showPileCount?: boolean;
  maxVisibleCards?: number;
  onPileClick?: () => void;
  isAnimating?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

/**
 * 弃牌堆组件
 * 显示弃牌堆和当前顶牌，支持动画效果
 */
export const DiscardPile: React.FC<DiscardPileProps> = ({
  cards,
  currentCard,
  showPileCount = true,
  maxVisibleCards = 3,
  onPileClick,
  isAnimating = false,
  size = 'large',
  className,
}) => {
  // 获取要显示的卡牌（最近的几张）
  const visibleCards = cards.slice(-maxVisibleCards);
  const topCard = currentCard || cards[cards.length - 1];

  // 处理弃牌堆点击
  const handlePileClick = () => {
    if (onPileClick) {
      onPileClick();
    }
  };

  return (
    <div className={clsx('discard-pile flex flex-col items-center', className)}>
      {/* 弃牌堆标题 */}
      <div className="mb-2 text-center">
        <h3 className="text-lg font-semibold text-gray-700">弃牌堆</h3>
        {showPileCount && (
          <p className="text-sm text-gray-500">{cards.length} 张卡牌</p>
        )}
      </div>

      {/* 弃牌堆视觉区域 */}
      <div className="relative">
        {/* 背景卡牌堆叠效果 */}
        <div className="relative">
          {visibleCards.map((card, index) => {
            const isTopCard = index === visibleCards.length - 1;
            const offset = index * 2;
            
            return (
              <div
                key={`pile-${card.id}-${index}`}
                className={clsx(
                  'absolute transition-all duration-300',
                  {
                    'cursor-pointer hover:scale-105': onPileClick && isTopCard,
                  }
                )}
                style={{
                  transform: `translateX(${offset}px) translateY(${-offset}px)`,
                  zIndex: index,
                }}
                onClick={isTopCard ? handlePileClick : undefined}
              >
                <Card
                  card={card}
                  size={size}
                  isHidden={!isTopCard}
                  className={clsx({
                    'opacity-60': !isTopCard,
                    'shadow-lg': isTopCard,
                    'animate-pulse': isAnimating && isTopCard,
                  })}
                />
              </div>
            );
          })}

          {/* 当前顶牌（如果与堆顶不同） */}
          {topCard && (
            <div
              className={clsx(
                'relative transition-all duration-500',
                {
                  'cursor-pointer hover:scale-105': onPileClick,
                  'animate-bounce': isAnimating,
                }
              )}
              style={{
                zIndex: maxVisibleCards,
              }}
              onClick={handlePileClick}
            >
              <Card
                card={topCard}
                size={size}
                className={clsx(
                  'shadow-xl ring-2 ring-gray-300',
                  {
                    'ring-blue-400 ring-4': isAnimating,
                  }
                )}
              />
            </div>
          )}
        </div>

        {/* 空弃牌堆占位符 */}
        {cards.length === 0 && (
          <div
            className={clsx(
              'border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50',
              {
                'w-16 h-24': size === 'small',
                'w-20 h-28': size === 'medium',
                'w-24 h-36': size === 'large',
              },
              {
                'cursor-pointer hover:border-gray-400 hover:bg-gray-100': onPileClick,
              }
            )}
            onClick={handlePileClick}
          >
            <div className="text-center">
              <div className="text-gray-400 text-2xl mb-1">🃏</div>
              <div className="text-xs text-gray-500">弃牌堆</div>
            </div>
          </div>
        )}
      </div>

      {/* 弃牌堆操作提示 */}
      {onPileClick && topCard && (
        <div className="mt-2 text-center">
          <span className="text-xs text-gray-500">
            点击查看弃牌堆
          </span>
        </div>
      )}

      {/* 当前有效颜色指示器 */}
      {topCard && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-sm text-gray-600">当前颜色:</span>
          <div
            className={clsx(
              'w-6 h-6 rounded-full border-2 border-white shadow-md',
              {
                'bg-red-500': topCard.color === 'red',
                'bg-blue-500': topCard.color === 'blue',
                'bg-green-500': topCard.color === 'green',
                'bg-yellow-500': topCard.color === 'yellow',
                'bg-gradient-to-r from-red-500 via-blue-500 via-green-500 to-yellow-500': topCard.color === 'wild',
              }
            )}
          />
        </div>
      )}
    </div>
  );
}; 