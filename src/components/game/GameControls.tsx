import React from 'react';
import {clsx} from 'clsx';
import {Button} from '../ui/Button';
import {useGameStore} from '@/stores/gameStore';
import {useUIStore} from '@/stores/uiStore';

interface GameControlsProps {
    onExitGame?: () => void;
    onRestartGame?: () => void;
    showUnoButton?: boolean;
    onUnoCall?: () => void;
    className?: string;
}

/**
 * 游戏控制组件
 * 提供游戏中的各种控制按钮
 */
export const GameControls: React.FC<GameControlsProps> = ({
                                                              showUnoButton = false,
                                                              onUnoCall,
                                                              className,
                                                          }) => {
    const {
        gameState,
        drawCard,
        getCurrentPlayer,
        getPlayableCards,
    } = useGameStore();

    const {
        setShowGameMenu,
        soundEnabled,
        setSoundEnabled,
    } = useUIStore();

    const currentPlayer = getCurrentPlayer();
    const isCurrentPlayerHuman = currentPlayer && !currentPlayer.isAI;
    const playableCards = currentPlayer ? getPlayableCards(currentPlayer.id) : new Set<string>();
    const canDrawCard = isCurrentPlayerHuman && playableCards.size === 0;

    // 处理抽牌
    const handleDrawCard = () => {
        if (!currentPlayer || !canDrawCard) return;
        drawCard(currentPlayer.id);
    };

    // 处理音效切换
    const handleSoundToggle = () => {
        setSoundEnabled(!soundEnabled);
    };

    return (
        <div className={clsx('game-controls flex items-center gap-2', className)}>
            {/* UNO按钮 */}
            {showUnoButton && (
                <Button
                    onClick={onUnoCall}
                    variant="primary"
                    className="bg-red-500 hover:bg-red-600 animate-pulse font-bold"
                >
                    🎯 UNO!
                </Button>
            )}

            {/* 抽牌按钮 */}
            {canDrawCard && (
                <Button
                    onClick={handleDrawCard}
                    variant="primary"
                    className="bg-blue-500 hover:bg-blue-600"
                >
                    🃏 抽牌
                </Button>
            )}

            {/* 游戏状态信息 */}
            <div className="flex items-center gap-4 text-white text-sm">
                <div className="flex items-center gap-1">
                    <span>回合:</span>
                    <span className="font-medium">{gameState.currentPlayerIndex + 1}</span>
                </div>

                <div className="flex items-center gap-1">
                    <span>方向:</span>
                    <span className="text-lg">
            {gameState.direction === 1 ? '→' : '←'}
          </span>
                </div>

                <div className="flex items-center gap-1">
                    <span>牌堆:</span>
                    <span className="font-medium">{gameState.deck.length}</span>
                </div>

                {gameState.drawCount > 0 && (
                    <div className="flex items-center gap-1 text-red-300">
                        <span>累积抽牌:</span>
                        <span className="font-bold">{gameState.drawCount}</span>
                    </div>
                )}
            </div>

            {/* 控制按钮组 */}
            <div className="flex items-center gap-2 ml-auto">
                {/* 音效控制 */}
                <Button
                    onClick={handleSoundToggle}
                    variant="ghost"
                    size="small"
                    className="text-white hover:bg-white hover:bg-opacity-20"
                >
                    {soundEnabled ? '🔊' : '🔇'}
                </Button>

                {/* 游戏菜单 */}
                <Button
                    onClick={() => setShowGameMenu(true)}
                    variant="secondary"
                    size="small"
                >
                    ⚙️ 菜单
                </Button>
            </div>
        </div>
    );
}; 