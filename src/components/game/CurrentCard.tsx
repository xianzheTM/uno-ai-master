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
 * 显示当前有效的顶牌及其详细信息
 */
export const CurrentCard: React.FC<CurrentCardProps> = ({
  card,
  effectiveColor,
  isActive = false,
  showDetails = true,
  onCardClick,
  size = 'large',
  className,
}) => {
  // 如果没有卡牌，显示占位符
  if (!card) {
    return (
      <div className={clsx('current-card flex flex-col items-center', className)}>
        <div className="mb-3 text-center">
          <h3 className="text-lg font-semibold text-gray-700">当前卡牌</h3>
        </div>
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
        {showDetails && (
          <div className="mt-4 text-center">
            <div className="bg-gray-100 rounded-lg p-2">
              <span className="text-sm text-gray-500">游戏尚未开始</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 获取卡牌类型的中文名称
  const getCardTypeName = (card: CardType): string => {
    switch (card.type) {
      case 'number':
        return `数字 ${card.value}`;
      case 'skip':
        return '跳过';
      case 'reverse':
        return '反转';
      case 'draw_two':
        return '+2';
      case 'wild':
        return '变色';
      case 'wild_draw_four':
        return '变色+4';
      default:
        return '未知';
    }
  };

  // 获取颜色的中文名称
  const getColorName = (color: CardColor): string => {
    switch (color) {
      case 'red':
        return '红色';
      case 'blue':
        return '蓝色';
      case 'green':
        return '绿色';
      case 'yellow':
        return '黄色';
      case 'wild':
        return '万能';
      default:
        return '未知';
    }
  };

  // 获取卡牌效果描述
  const getCardEffect = (card: CardType): string => {
    switch (card.type) {
      case 'skip':
        return '下一个玩家被跳过';
      case 'reverse':
        return '游戏方向反转';
      case 'draw_two':
        return '下一个玩家抽2张牌';
      case 'wild':
        return '可以选择新的颜色';
      case 'wild_draw_four':
        return '选择新颜色，下一个玩家抽4张牌';
      default:
        return '';
    }
  };

  const currentColor = effectiveColor || card?.color;
  const cardEffect = getCardEffect(card || {} as CardType);

  return (
    <div className={clsx('current-card flex flex-col items-center', className)}>
      {/* 当前卡牌标题 */}
      <div className="mb-3 text-center">
        <h3 className="text-lg font-semibold text-gray-700">当前卡牌</h3>
        {isActive && (
          <div className="flex items-center justify-center gap-2 mt-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-green-600">生效中</span>
          </div>
        )}
      </div>

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
              'animate-pulse': isActive,
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

      {/* 卡牌详细信息 */}
      {showDetails && (
        <div className="mt-4 space-y-2 text-center max-w-xs">
          {/* 卡牌类型 */}
          <div className="bg-gray-100 rounded-lg p-2">
            <span className="text-sm font-medium text-gray-700">
              {getCardTypeName(card || {} as CardType)}
            </span>
          </div>

          {/* 当前有效颜色 */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-gray-600">有效颜色:</span>
            <div className="flex items-center gap-2">
              <div
                className={clsx(
                  'w-5 h-5 rounded-full border-2 border-white shadow-md',
                  {
                    'bg-red-500': currentColor === 'red',
                    'bg-blue-500': currentColor === 'blue',
                    'bg-green-500': currentColor === 'green',
                    'bg-yellow-500': currentColor === 'yellow',
                    'bg-gradient-to-r from-red-500 via-blue-500 via-green-500 to-yellow-500': currentColor === 'wild',
                  }
                )}
              />
              <span className="text-sm font-medium">
                {getColorName(currentColor || 'wild')}
              </span>
            </div>
          </div>

          {/* 卡牌效果 */}
          {cardEffect && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
              <div className="text-xs text-blue-600 font-medium mb-1">效果:</div>
              <div className="text-sm text-blue-800">{cardEffect}</div>
            </div>
          )}

          {/* 万能卡特殊提示 */}
          {card?.type === 'wild' || card?.type === 'wild_draw_four' ? (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-2">
              <div className="text-xs text-purple-600 font-medium mb-1">提示:</div>
              <div className="text-sm text-purple-800">
                {effectiveColor && effectiveColor !== 'wild'
                  ? `已选择 ${getColorName(effectiveColor)}`
                  : '需要选择颜色'}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* 操作提示 */}
      {onCardClick && (
        <div className="mt-3 text-center">
          <span className="text-xs text-gray-500">
            点击查看详情
          </span>
        </div>
      )}
    </div>
  );
}; 