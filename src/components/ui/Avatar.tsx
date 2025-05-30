import React from 'react';
import { clsx } from 'clsx';

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'small' | 'medium' | 'large' | 'xl';
  isActive?: boolean;
  isCurrentPlayer?: boolean;
  isAI?: boolean;
  player?: { isAI: boolean; name: string }; // 支持直接传入Player对象
  showBadge?: boolean;
  badgeContent?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

/**
 * 头像组件
 * 支持图片头像、文字头像、状态指示和徽章
 */
export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name: propName = '',
  size = 'medium',
  isActive = false,
  isCurrentPlayer = false,
  isAI: propIsAI,
  player,
  showBadge = false,
  badgeContent,
  onClick,
  className,
}) => {
  // 智能获取name和isAI属性
  const name = player?.name || propName;
  const isAI = player?.isAI ?? propIsAI ?? false;

  // 尺寸配置
  const sizeClasses = {
    small: 'w-8 h-8 text-xs',
    medium: 'w-12 h-12 text-sm',
    large: 'w-16 h-16 text-base',
    xl: 'w-20 h-20 text-lg',
  };

  // 徽章尺寸配置
  const badgeSizeClasses = {
    small: 'w-3 h-3 text-xs',
    medium: 'w-4 h-4 text-xs',
    large: 'w-5 h-5 text-sm',
    xl: 'w-6 h-6 text-sm',
  };

  // 获取姓名首字母
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // 生成背景颜色（基于姓名和类型）
  const getBackgroundColor = (name: string, isAI: boolean): string => {
    const humanColors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
    ];

    const aiColors = [
      'bg-gray-600',
      'bg-slate-600',
      'bg-zinc-600',
      'bg-stone-600',
    ];
    
    const colors = isAI ? aiColors : humanColors;
    
    const hash = name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  const avatarContent = src ? (
    <img
      src={src}
      alt={alt || name}
      className="w-full h-full object-cover"
      onError={(e) => {
        // 图片加载失败时隐藏图片，显示文字头像
        (e.target as HTMLImageElement).style.display = 'none';
      }}
    />
  ) : (
    <span className="font-semibold text-white">
      {getInitials(name)}
    </span>
  );

  return (
    <div className="relative inline-block">
      <div
        className={clsx(
          // 基础样式
          'rounded-full flex items-center justify-center overflow-hidden transition-all duration-200',
          // 尺寸
          sizeClasses[size],
          // 背景颜色（仅文字头像）
          !src && getBackgroundColor(name, isAI),
          // AI特殊样式
          {
            'border-2 border-dashed border-gray-400': isAI && !isCurrentPlayer,
          },
          // 状态样式
          {
            'ring-2 ring-green-400 ring-offset-2': isActive,
            'ring-2 ring-blue-400 ring-offset-2 scale-110': isCurrentPlayer,
            'cursor-pointer hover:scale-105': onClick,
            'shadow-md': !isCurrentPlayer,
            'shadow-lg': isCurrentPlayer,
          },
          className
        )}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={name ? `${name}的头像${isAI ? '（AI玩家）' : ''}` : '用户头像'}
        onKeyDown={(e) => {
          if (onClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick();
          }
        }}
      >
        {avatarContent}
      </div>

      {/* AI标识 */}
      {isAI && (
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-500 border-2 border-white rounded-full flex items-center justify-center">
          <span className="text-xs text-white font-bold">🤖</span>
        </div>
      )}

      {/* 在线状态指示器 */}
      {isActive && !isAI && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
      )}

      {/* 当前玩家指示器 */}
      {isCurrentPlayer && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 border-2 border-white rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
        </div>
      )}

      {/* 自定义徽章 */}
      {showBadge && badgeContent && !isAI && (
        <div
          className={clsx(
            'absolute -top-1 -right-1 bg-red-500 text-white rounded-full flex items-center justify-center font-bold border-2 border-white',
            badgeSizeClasses[size]
          )}
        >
          {badgeContent}
        </div>
      )}
    </div>
  );
}; 