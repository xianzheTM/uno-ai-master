import React from 'react';
import { clsx } from 'clsx';
import { Avatar } from '../ui/Avatar';
import { Player } from '@/types';

interface PlayerInfoProps {
  player: Player;
  isActive?: boolean;
  isCurrentPlayer?: boolean;
  showScore?: boolean;
  showHandCount?: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

/**
 * 玩家信息组件
 * 显示玩家头像、姓名、手牌数量等信息
 */
export const PlayerInfo: React.FC<PlayerInfoProps> = ({
  player,
  isActive = false,
  isCurrentPlayer = false,
  showScore = false,
  showHandCount = true,
  position = 'bottom',
  size = 'medium',
  className,
}) => {
  const sizeClasses = {
    small: {
      container: 'p-2',
      text: 'text-xs',
      name: 'text-sm',
      avatar: 'small' as const,
    },
    medium: {
      container: 'p-3',
      text: 'text-sm',
      name: 'text-base',
      avatar: 'medium' as const,
    },
    large: {
      container: 'p-4',
      text: 'text-base',
      name: 'text-lg',
      avatar: 'large' as const,
    },
  };

  const positionClasses = {
    top: 'flex-col',
    bottom: 'flex-col',
    left: 'flex-row items-center',
    right: 'flex-row-reverse items-center',
  };

  const currentSizeClasses = sizeClasses[size];
  const currentPositionClasses = positionClasses[position];

  return (
    <div
      className={clsx(
        'player-info flex gap-2 transition-all duration-200',
        currentSizeClasses.container,
        currentPositionClasses,
        {
          'bg-blue-500 bg-opacity-20 border-2 border-blue-400 rounded-lg': isActive,
          'bg-green-500 bg-opacity-20 border-2 border-green-400 rounded-lg': isCurrentPlayer,
          'bg-white bg-opacity-10 rounded-lg': !isActive && !isCurrentPlayer,
        },
        className
      )}
    >
      {/* 玩家头像 */}
      <div className="flex-shrink-0">
        <Avatar
          name={player.name}
          isActive={isActive}
          size={currentSizeClasses.avatar}
        />
      </div>

      {/* 玩家信息 */}
      <div className={clsx(
        'flex-1 text-center',
        position === 'left' || position === 'right' ? 'text-left ml-2' : ''
      )}>
        {/* 玩家姓名 */}
        <div className={clsx(
          'font-medium text-white truncate',
          currentSizeClasses.name
        )}>
          {player.name}
          {player.isAI && (
            <span className="ml-1 text-xs opacity-75">(AI)</span>
          )}
        </div>

        {/* 状态指示 */}
        {isCurrentPlayer && (
          <div className={clsx(
            'text-green-300 font-medium',
            currentSizeClasses.text
          )}>
            {player.isAI ? 'AI思考中...' : '你的回合'}
          </div>
        )}

        {isActive && !isCurrentPlayer && (
          <div className={clsx(
            'text-blue-300',
            currentSizeClasses.text
          )}>
            等待中...
          </div>
        )}

        {/* 手牌数量 */}
        {showHandCount && (
          <div className={clsx(
            'text-white opacity-90',
            currentSizeClasses.text
          )}>
            {player.hand.length} 张牌
          </div>
        )}

        {/* 分数 */}
        {showScore && (
          <div className={clsx(
            'text-yellow-300',
            currentSizeClasses.text
          )}>
            分数: {player.score}
          </div>
        )}

        {/* UNO状态 */}
        {player.hand.length === 1 && (
          <div className={clsx(
            'text-red-400 font-bold animate-pulse',
            currentSizeClasses.text
          )}>
            UNO!
          </div>
        )}

        {/* 即将获胜警告 */}
        {player.hand.length === 2 && (
          <div className={clsx(
            'text-orange-400 font-medium',
            currentSizeClasses.text
          )}>
            ⚠️ 危险
          </div>
        )}
      </div>

      {/* 特殊状态指示器 */}
      <div className="flex flex-col gap-1">
        {/* 活跃玩家指示器 */}
        {isActive && (
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
        )}

        {/* 当前玩家指示器 */}
        {isCurrentPlayer && (
          <div className="w-2 h-2 bg-green-400 rounded-full" />
        )}

        {/* AI思考指示器 */}
        {isCurrentPlayer && player.isAI && (
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>
    </div>
  );
}; 