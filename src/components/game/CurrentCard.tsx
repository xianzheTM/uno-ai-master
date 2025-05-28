import React from 'react';
import { clsx } from 'clsx';
import { Card } from '../ui/Card';
import { Card as CardType, CardColor } from '@/types';

interface CurrentCardProps {
  card: CardType | null;
  effectiveColor?: CardColor;
  isActive?: boolean;
  showDetails?: boolean;
  onCardClick?: () => void;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

/**
 * 当前顶牌组件
 * 显示当前有效的顶牌
 */
export const CurrentCard: React.FC<CurrentCardProps> = ({
  card,
  effectiveColor,
  isActive = false,
  showDetails = false,
  onCardClick,
  size = 'large',
  className,
}) => {
  // 如果没有卡牌，显示占位符
  if (!card) {
    return (
      <div className={clsx('current-card flex flex-col items-center', className)}>
        <div className="relative">
          <div className={clsx(
            'rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center',
            {
              'w-16 h-24': size === 'small',
              'w-20 h-32': size === 'medium',
              'w-24 h-36': size === 'large',
            }
          )}>
            <div className="text-center text-gray-400">
              <div className="text-2xl mb-1">🃏</div>
              <div className="text-xs">等待中</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('current-card flex flex-col items-center', className)}>
      {/* 卡牌显示区域 */}
      <div className="relative">
        <Card
          card={card || {} as CardType}
          size={size}
          onClick={onCardClick}
          className={clsx(
            'shadow-xl transition-all duration-300',
            {
              'ring-4 ring-blue-400 ring-opacity-50': isActive,
              'cursor-pointer hover:scale-105': onCardClick,
            }
          )}
        />

        {/* 活跃状态指示器 */}
        {isActive && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full animate-ping" />
          </div>
        )}
      </div>
    </div>
  );
}; 