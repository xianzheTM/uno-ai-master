import React from 'react';
import {clsx} from 'clsx';
import {Avatar} from '../ui/Avatar';
import {Player} from '@/types';

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
 * 显示玩家头像、姓名等信息
 * 注意：为了保持游戏公平性，不应显示其他玩家的手牌数量和UNO状态
 */
export const PlayerInfo: React.FC<PlayerInfoProps> = ({
                                                          player,
                                                          isActive = false,
                                                          isCurrentPlayer = false,
                                                          showScore = false,
                                                          showHandCount = false,
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

    const currentSizeClasses = sizeClasses[size];

    return (
        <div
            className={clsx(
                'player-info flex items-center gap-3 transition-all duration-200',
                currentSizeClasses.container,
                {
                    'bg-blue-500 bg-opacity-20 border-2 border-blue-400 rounded-lg': isActive && !isCurrentPlayer,
                    'bg-green-500 bg-opacity-20 border-2 border-green-400 rounded-lg': isCurrentPlayer && !isActive,
                    'bg-yellow-500 bg-opacity-20 border-2 border-yellow-400 rounded-lg': isCurrentPlayer && isActive,
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
            <div className="flex-1 text-left min-w-0">
                {/* 玩家姓名 */}
                <div className={clsx(
                    'font-medium text-gray-800 truncate',
                    currentSizeClasses.name
                )}>
                    {player.name}
                    {player.isAI && (
                        <span className="ml-1 text-xs opacity-75">(AI)</span>
                    )}
                </div>

                {/* 手牌数量 - 只在明确要求且是当前玩家时显示 */}
                {showHandCount && isCurrentPlayer && (
                    <div className={clsx(
                        'text-gray-700 opacity-90',
                        currentSizeClasses.text
                    )}>
                        {player.hand.length} 张牌
                    </div>
                )}

                {/* 状态指示 */}
                {isCurrentPlayer && isActive && (
                    <div className={clsx(
                        'text-green-600 font-medium',
                        currentSizeClasses.text
                    )}>
                        {player.isAI ? 'AI思考中...' : '你的回合'}
                    </div>
                )}

                {!isCurrentPlayer && !player.isAI && (
                    <div className={clsx(
                        'text-gray-500',
                        currentSizeClasses.text
                    )}>
                        等待回合
                    </div>
                )}

                {isActive && !isCurrentPlayer && player.isAI && (
                    <div className={clsx(
                        'text-blue-600',
                        currentSizeClasses.text
                    )}>
                        AI思考中...
                    </div>
                )}

                {/* 分数 */}
                {showScore && (
                    <div className={clsx(
                        'text-yellow-600',
                        currentSizeClasses.text
                    )}>
                        分数: {player.score}
                    </div>
                )}

                {/* UNO状态 - 只显示当前玩家的状态 */}
                {isCurrentPlayer && player.hand.length === 1 && (
                    <div className={clsx(
                        'text-red-600 font-bold animate-pulse',
                        currentSizeClasses.text
                    )}>
                        UNO!
                    </div>
                )}

                {/* 即将获胜警告 - 只显示当前玩家的状态 */}
                {isCurrentPlayer && player.hand.length === 2 && (
                    <div className={clsx(
                        'text-orange-600 font-medium',
                        currentSizeClasses.text
                    )}>
                        ⚠️ 危险
                    </div>
                )}
            </div>
        </div>
    );
}; 