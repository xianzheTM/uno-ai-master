import React from 'react';
import { Card as CardType, CardColor, CardType as CardTypeEnum } from '@/types';
import { getCardDisplayName } from '@/utils';
import { clsx } from 'clsx';

interface CardProps {
  card: CardType;
  isSelected?: boolean;
  isPlayable?: boolean;
  isHidden?: boolean;
  size?: 'small' | 'medium' | 'large';
  onClick?: (card: CardType) => void;
  onDoubleClick?: (card: CardType) => void;
  className?: string;
  disabled?: boolean;
}

/**
 * UNO卡牌UI组件
 * 接收卡牌数据对象，渲染为可交互的视觉元素
 * 与 src/game/Card.ts 的关系：
 * - game/Card.ts: 游戏逻辑层的卡牌类，包含业务逻辑
 * - ui/Card.tsx: 视觉层的卡牌组件，负责渲染和交互
 */
export const Card: React.FC<CardProps> = ({
  card,
  isSelected = false,
  isPlayable = true,
  isHidden = false,
  size = 'medium',
  onClick,
  onDoubleClick,
  className,
  disabled = false,
}) => {
  // 尺寸配置
  const sizeClasses = {
    small: 'w-12 h-16 text-xs',
    medium: 'w-16 h-22 text-sm',
    large: 'w-20 h-28 text-base',
  };

  // 颜色配置
  const getColorClasses = (color: CardColor) => {
    if (isHidden) return 'bg-blue-900 border-blue-700';
    
    switch (color) {
      case CardColor.RED:
        return 'bg-red-500 border-red-600 text-white';
      case CardColor.BLUE:
        return 'bg-blue-500 border-blue-600 text-white';
      case CardColor.GREEN:
        return 'bg-green-500 border-green-600 text-white';
      case CardColor.YELLOW:
        return 'bg-yellow-400 border-yellow-500 text-black';
      case CardColor.WILD:
        return 'bg-gradient-to-br from-red-500 via-blue-500 via-green-500 to-yellow-400 border-gray-600 text-white';
      default:
        return 'bg-gray-500 border-gray-600 text-white';
    }
  };

  // 获取卡牌内容
  const getCardContent = () => {
    if (isHidden) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-2xl">🎮</div>
          <div className="text-xs">UNO</div>
        </div>
      );
    }

    const displayName = getCardDisplayName(card);
    
    // 特殊卡牌图标
    const getCardIcon = () => {
      switch (card.type) {
        case CardTypeEnum.SKIP:
          return '🚫';
        case CardTypeEnum.REVERSE:
          return '🔄';
        case CardTypeEnum.DRAW_TWO:
          return '+2';
        case CardTypeEnum.WILD:
          return '🌈';
        case CardTypeEnum.WILD_DRAW_FOUR:
          return '+4';
        default:
          return displayName;
      }
    };

    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className={clsx(
          'font-bold',
          size === 'small' ? 'text-xs' : size === 'medium' ? 'text-sm' : 'text-lg'
        )}>
          {getCardIcon()}
        </div>
        {card.type === CardTypeEnum.NUMBER && (
          <div className={clsx(
            'text-xs opacity-75',
            size === 'small' && 'hidden'
          )}>
            {card.color}
          </div>
        )}
      </div>
    );
  };

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick(card);
    }
  };

  const handleDoubleClick = () => {
    if (!disabled && onDoubleClick) {
      onDoubleClick(card);
    }
  };

  return (
    <div
      className={clsx(
        // 基础样式
        'rounded-lg border-2 flex items-center justify-center font-bold cursor-pointer transition-all duration-200',
        // 尺寸
        sizeClasses[size],
        // 颜色
        getColorClasses(card.color),
        // 状态样式
        {
          'ring-2 ring-blue-400 ring-offset-2 scale-105': isSelected,
          'opacity-50 cursor-not-allowed': !isPlayable || disabled,
          'hover:scale-105 hover:shadow-lg': isPlayable && !disabled && onClick,
          'shadow-md': !isSelected,
          'shadow-lg': isSelected,
        },
        className
      )}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={`${getCardDisplayName(card)} ${card.color} card`}
      aria-pressed={isSelected}
      aria-disabled={disabled || !isPlayable}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {getCardContent()}
    </div>
  );
}; 