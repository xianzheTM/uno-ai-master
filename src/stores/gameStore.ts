import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { GameEngine } from '../game/GameEngine';
import { Player } from '../game/Player';
import { Card as UICard } from '../types/Card';
import { AIDifficulty, CardColor, PlayerType } from '../types';
import { CardAdapter } from '../utils/cardAdapter';
import { useUIStore } from '../stores/uiStore';
import { playGameSound, GameSoundType } from '../utils/soundManager';

// 卡牌描述辅助函数
const getCardDescription = (card: any, chosenColor?: CardColor): string => {
  const colorNames = {
    'red': '红色',
    'yellow': '黄色', 
    'green': '绿色',
    'blue': '蓝色'
  };

  if (card.isWildCard()) {
    if (card.type === 'wild_draw_four') {
      return chosenColor ? `万能+4卡（选择${colorNames[chosenColor as keyof typeof colorNames]}）` : '万能+4卡';
    } else {
      return chosenColor ? `万能卡（选择${colorNames[chosenColor as keyof typeof colorNames]}）` : '万能卡';
    }
  }

  const cardColor = colorNames[card.color as keyof typeof colorNames] || '未知颜色';
  
  switch (card.type) {
    case 'skip':
      return `${cardColor}跳过卡`;
    case 'reverse':
      return `${cardColor}反转卡`;
    case 'draw_two':
      return `${cardColor}+2卡`;
    case 'number':
      return `${cardColor}${card.value}`;
    default:
      return `${cardColor}卡牌`;
  }
};

// 使用GameEngine实际返回的状态类型
interface GameStoreState {
  // 游戏引擎实例
  gameEngine: GameEngine | null;
  
  // 基本状态
  isLoading: boolean;
  error: string | null;
  
  // 游戏状态 - 作为普通状态属性
  gameState: any;
}

interface GameStoreActions {
  // 游戏控制方法
  initializeGame: (config: { players: any[], settings: any }) => void;
  playCard: (playerId: string, card: UICard, chosenColor?: CardColor) => boolean;
  drawCard: (playerId: string) => boolean;
  callUno: (playerId: string) => void;
  nextTurn: () => void;
  resetGame: () => void;
  
  // 质疑功能
  challengeUnoViolation: (challengerId: string, suspectedPlayerId: string) => {
    success: boolean;
    penaltyCards: number;
    punishedPlayer: string;
  };
  challengeWildDrawFour: (challengerId: string) => {
    success: boolean;
    penaltyCards: number;
    punishedPlayer: string;
  };
  canChallengeUnoViolation: (suspectedPlayerId: string) => boolean;
  canChallengeWildDrawFour: () => boolean;
  
  // 游戏状态查询方法
  getCurrentPlayer: () => Player | null;
  getPlayableCards: (playerId: string) => Set<string>;
  canPlayerPlay: (playerId: string) => boolean;
  isValidPlay: (card: UICard, currentCard: UICard) => boolean;
  getGameState: () => any;
  
  // UI状态方法
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  
  // 内部方法
  updateGameState: () => void;
  processAITurn: (playerId: string) => void;
}

interface GameStore extends GameStoreState, GameStoreActions {
  // 游戏设置
  gameSettings?: any; // 保存游戏设置
}

export const useGameStore = create<GameStore>()(
  devtools(
    persist(
      (set, get) => ({
        gameEngine: null,
        isLoading: false,
        error: null,
        gameState: {
          phase: 'setup',
          players: [],
          currentPlayerId: '',
          direction: 1,
          currentCard: null,
          drawStack: 0,
          selectedColor: null,
          winner: null,
          roundNumber: 1,
          turnCount: 0,
          gameStartTime: Date.now(),
          currentPlayerIndex: 0,
          discardPile: [],
          deck: { length: 0 },
          currentColor: null,
        },

        // 更新游戏状态的内部方法
        updateGameState: () => {
          const { gameEngine } = get();
          if (!gameEngine) {
            set({
              gameState: {
                phase: 'setup',
                players: [],
                currentPlayerId: '',
                direction: 1,
                currentCard: null,
                drawStack: 0,
                selectedColor: null,
                winner: null,
                roundNumber: 1,
                turnCount: 0,
                gameStartTime: Date.now(),
                currentPlayerIndex: 0,
                discardPile: [],
                deck: { length: 0 },
                currentColor: null,
              }
            });
            return;
          }
          
          const state = gameEngine.getGameState();
          const currentPlayer = gameEngine.getCurrentPlayer();
          
          set({
            gameState: {
              ...state,
              turnCount: state.turnCount,
              currentPlayerIndex: currentPlayer ? 
                state.players.findIndex((p: any) => p.id === state.currentPlayerId) : 0,
              discardPile: gameEngine.getDiscardPile(),
              deck: { length: gameEngine.getDrawPileCount() },
              currentColor: state.selectedColor,
            }
          });
          
          // 如果当前玩家是AI，自动执行AI决策
          if (currentPlayer && currentPlayer.type === PlayerType.AI && state.phase === 'playing') {
            // 根据游戏速度设置调整AI思考时间
            const gameSettings = get().gameSettings;
            let baseDelay = 2000; // 默认2秒
            
            if (gameSettings?.gameSpeed) {
              switch (gameSettings.gameSpeed) {
                case 'slow':
                  baseDelay = 3000; // 慢速：3秒
                  break;
                case 'normal':
                  baseDelay = 2000; // 正常：2秒
                  break;
                case 'fast':
                  baseDelay = 1000; // 快速：1秒
                  break;
              }
            }
            
            setTimeout(() => {
              get().processAITurn(currentPlayer.id);
            }, baseDelay + Math.random() * 1000); // 加上0-1秒的随机变化
          }
        },

        // 处理AI回合
        processAITurn: (playerId: string) => {
          const { gameEngine } = get();
          if (!gameEngine) return;
          
          const player = gameEngine.getCurrentPlayer();
          if (!player || player.id !== playerId || player.type !== PlayerType.AI) {
            return;
          }
          
          const { addGameLogMessage, addNotification, soundEnabled } = useUIStore.getState();
          
          try {
            // 获取可出的牌
            const playableCards = gameEngine.getPlayableCards(playerId);
            // 获取当前drawStack来确定需要抽多少张牌
            const currentDrawStack = get().gameState.drawStack || 0;
            
            if (playableCards.length > 0) {
              // 随机选择一张可出的牌
              const randomCard = playableCards[Math.floor(Math.random() * playableCards.length)];
              
              // 如果是万能牌，随机选择颜色
              let chosenColor: CardColor | undefined;
              if (randomCard.isWildCard()) {
                const colors = [CardColor.RED, CardColor.YELLOW, CardColor.GREEN, CardColor.BLUE];
                chosenColor = colors[Math.floor(Math.random() * colors.length)];
              }
              
              // 出牌
              const success = gameEngine.playCard(playerId, randomCard.id, chosenColor);
              if (success) {
                // 获取卡牌描述
                const cardDesc = getCardDescription(randomCard, chosenColor);
                
                // 添加游戏日志
                addGameLogMessage(`${player.name} 出了 ${cardDesc}`);
                
                // 添加通知
                addNotification({
                  type: 'info',
                  title: 'AI 出牌',
                  message: `${player.name} 出了 ${cardDesc}`,
                  duration: 5000
                });
                
                // AI出牌音效
                if (soundEnabled) {
                  if (randomCard.isWildCard()) {
                    playGameSound(GameSoundType.CARD_WILD);
                  } else if (randomCard.type === 'skip') {
                    playGameSound(GameSoundType.CARD_SKIP);
                  } else if (randomCard.type === 'reverse') {
                    playGameSound(GameSoundType.CARD_REVERSE);
                  } else if (randomCard.type === 'draw_two' || randomCard.type === 'wild_draw_four') {
                    playGameSound(GameSoundType.CARD_DRAW_TWO);
                  } else {
                    playGameSound(GameSoundType.CARD_PLAY);
                  }
                }
                get().updateGameState();
              } else {
                // 出牌失败，尝试摸牌 - 此时应该抽取drawStack指定的数量
                const drawCount = currentDrawStack > 0 ? currentDrawStack : 1;
                gameEngine.drawCard(playerId);
                
                // 添加游戏日志
                const cardText = drawCount === 1 ? '1 张牌' : `${drawCount} 张牌`;
                const reason = currentDrawStack > 0 ? '被罚抽' : '抽了';
                addGameLogMessage(`${player.name} ${reason} ${cardText}`);
                
                // 添加通知
                addNotification({
                  type: currentDrawStack > 0 ? 'error' : 'warning',
                  title: currentDrawStack > 0 ? 'AI 被罚抽牌' : 'AI 抽牌',
                  message: `${player.name} ${reason} ${cardText}`,
                  duration: 5000
                });
                
                // AI摸牌音效
                if (soundEnabled) {
                  playGameSound(GameSoundType.CARD_DRAW);
                }
                get().updateGameState();
              }
            } else {
              // 没有可出的牌，摸牌 - 此时应该抽取drawStack指定的数量
              const drawCount = currentDrawStack > 0 ? currentDrawStack : 1;
              gameEngine.drawCard(playerId);
              
              // 添加游戏日志
              const cardText = drawCount === 1 ? '1 张牌' : `${drawCount} 张牌`;
              const reason = currentDrawStack > 0 ? '被罚抽' : '没有可出的牌，抽了';
              addGameLogMessage(`${player.name} ${reason} ${cardText}`);
              
              // 添加通知
              addNotification({
                type: currentDrawStack > 0 ? 'error' : 'info',
                title: currentDrawStack > 0 ? 'AI 被罚抽牌' : 'AI 抽牌',
                message: `${player.name} ${reason} ${cardText}`,
                duration: 5000
              });
              
              // AI摸牌音效
              if (soundEnabled) {
                playGameSound(GameSoundType.CARD_DRAW);
              }
              get().updateGameState();
            }
          } catch (error) {
            console.error('AI决策错误:', error);
            // 出错时默认摸牌
            try {
              const currentDrawStack = get().gameState.drawStack || 0;
              const drawCount = currentDrawStack > 0 ? currentDrawStack : 1;
              gameEngine.drawCard(playerId);
              
              // 添加游戏日志
              const cardText = drawCount === 1 ? '1 张牌' : `${drawCount} 张牌`;
              addGameLogMessage(`${player.name} 出现错误，抽了 ${cardText}`);
              
              // 添加通知
              addNotification({
                type: 'error',
                title: 'AI 错误',
                message: `${player.name} 出现错误，抽了 ${cardText}`,
                duration: 5000
              });
              
              // AI摸牌音效
              if (soundEnabled) {
                playGameSound(GameSoundType.CARD_DRAW);
              }
              get().updateGameState();
            } catch (drawError) {
              console.error('AI摸牌错误:', drawError);
            }
          }
        },

        initializeGame: (config: { players: any[], settings: any }) => {
          try {
            set({ isLoading: true, error: null });
            
            const gameEngine = new GameEngine();
            
            // 转换玩家配置格式
            const playerConfigs = config.players.map(p => ({
              id: p.id,
              name: p.name,
              type: p.isAI ? PlayerType.AI : PlayerType.HUMAN,
              aiDifficulty: p.aiStrategy as AIDifficulty
            }));
            
            // 初始化游戏，传递游戏设置
            gameEngine.initializeGame(playerConfigs, {
              initialHandSize: config.settings.initialHandSize
            });
            
            set({
              gameEngine,
              gameSettings: config.settings, // 保存游戏设置
              isLoading: false
            });
            
            // 更新游戏状态
            get().updateGameState();
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : '初始化游戏失败',
              isLoading: false
            });
          }
        },

        playCard: (playerId: string, card: UICard, chosenColor?: CardColor) => {
          const { gameEngine } = get();
          if (!gameEngine) return false;
          
          try {
            const result = gameEngine.playCard(playerId, card.id, chosenColor);
            if (result) {
              get().updateGameState();
            }
            return result;
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : '出牌失败'
            });
            return false;
          }
        },

        drawCard: (playerId: string) => {
          const { gameEngine } = get();
          if (!gameEngine) return false;
          
          try {
            const result = gameEngine.drawCard(playerId);
            if (result) {
              get().updateGameState();
            }
            return result;
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : '摸牌失败'
            });
            return false;
          }
        },

        callUno: (playerId: string) => {
          const { gameEngine } = get();
          if (!gameEngine) return;
          
          try {
            gameEngine.callUno(playerId);
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'UNO调用失败'
            });
          }
        },

        nextTurn: () => {
          const { gameEngine } = get();
          if (!gameEngine) return;
          
          try {
            console.log('nextTurn called - GameEngine handles turn switching automatically');
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : '切换回合失败'
            });
          }
        },

        resetGame: () => {
          set({
            gameEngine: null,
            isLoading: false,
            error: null
          });
        },

        getCurrentPlayer: () => {
          const { gameEngine } = get();
          return gameEngine?.getCurrentPlayer() || null;
        },

        getPlayableCards: (playerId: string) => {
          const { gameEngine } = get();
          if (!gameEngine) return new Set<string>();
          
          try {
            const cards = gameEngine.getPlayableCards(playerId);
            // 转换为组件期望的Set<string>格式
            return new Set(cards.map(card => card.id));
          } catch (error) {
            return new Set<string>();
          }
        },

        canPlayerPlay: (playerId: string) => {
          const { gameEngine } = get();
          if (!gameEngine) return false;
          
          try {
            return gameEngine.canPlayerPlay(playerId);
          } catch (error) {
            return false;
          }
        },

        isValidPlay: (card: UICard, currentCard: UICard) => {
          try {
            return CardAdapter.canUICardPlayOn(card, currentCard);
          } catch (error) {
            return false;
          }
        },

        getGameState: () => {
          const { gameEngine } = get();
          if (!gameEngine) {
            return null;
          }
          return gameEngine.getGameState();
        },

        setError: (error: string | null) => {
          set({ error });
        },

        setLoading: (loading: boolean) => {
          set({ isLoading: loading });
        },

        // 质疑功能
        challengeUnoViolation: (challengerId: string, suspectedPlayerId: string) => {
          const { gameEngine } = get();
          if (!gameEngine) {
            return { success: false, penaltyCards: 0, punishedPlayer: '' };
          }
          
          try {
            const result = gameEngine.challengeUnoViolation(challengerId, suspectedPlayerId);
            // 无论成功还是失败都要更新游戏状态，因为可能有罚牌
            get().updateGameState();
            return result;
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : '质疑UNO失败'
            });
            return { success: false, penaltyCards: 0, punishedPlayer: '' };
          }
        },
        
        challengeWildDrawFour: (challengerId: string) => {
          const { gameEngine } = get();
          if (!gameEngine) {
            return { success: false, penaltyCards: 0, punishedPlayer: '' };
          }
          
          try {
            const result = gameEngine.challengeWildDrawFour(challengerId);
            get().updateGameState();
            return result;
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : '质疑Wild Draw Four失败'
            });
            return { success: false, penaltyCards: 0, punishedPlayer: '' };
          }
        },
        
        canChallengeUnoViolation: (suspectedPlayerId: string) => {
          const { gameEngine } = get();
          if (!gameEngine) return false;
          
          try {
            return gameEngine.canChallengeUnoViolation(suspectedPlayerId);
          } catch (error) {
            return false;
          }
        },
        
        canChallengeWildDrawFour: () => {
          const { gameEngine } = get();
          if (!gameEngine) return false;
          
          try {
            return gameEngine.canChallengeWildDrawFour();
          } catch (error) {
            return false;
          }
        },
      }),
      {
        name: 'uno-game-storage',
        partialize: (state) => ({
          // 持久化游戏设置，但不持久化游戏状态
          gameSettings: state.gameSettings,
        }),
      }
    ),
    {
      name: 'uno-game-store',
    }
  )
); 