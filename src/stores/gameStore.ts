import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { GameEngine } from '../game/GameEngine';
import { Player } from '../game/Player';
import { Card as UICard } from '../types/Card';
import { AIDifficulty, CardColor, PlayerType } from '../types';
import { CardAdapter } from '../utils/cardAdapter';

// 使用GameEngine实际返回的状态类型
interface GameStoreState {
  // 游戏引擎实例
  gameEngine: GameEngine | null;
  
  // 基本状态
  isLoading: boolean;
  error: string | null;
}

interface GameStoreActions {
  // 游戏控制方法
  initializeGame: (config: { players: any[], settings: any }) => void;
  playCard: (playerId: string, card: UICard, chosenColor?: CardColor) => boolean;
  drawCard: (playerId: string) => boolean;
  callUno: (playerId: string) => void;
  nextTurn: () => void;
  resetGame: () => void;
  
  // 游戏状态查询方法
  getCurrentPlayer: () => Player | null;
  getPlayableCards: (playerId: string) => Set<string>;
  canPlayerPlay: (playerId: string) => boolean;
  isValidPlay: (card: UICard, currentCard: UICard) => boolean;
  getGameState: () => any;
  
  // UI状态方法
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

interface GameStore extends GameStoreState, GameStoreActions {
  // 计算属性 - 直接返回GameEngine的状态
  gameState: any;
}

export const useGameStore = create<GameStore>()(
  devtools(
    persist(
      (set, get) => ({
        gameEngine: null,
        isLoading: false,
        error: null,

        // 计算属性：gameState - 直接返回GameEngine的状态
        get gameState() {
          const { gameEngine } = get();
          if (!gameEngine) {
            return {
              phase: 'setup',
              players: [],
              currentPlayerId: '',
              direction: 1,
              currentCard: null,
              drawStack: 0,
              selectedColor: null,
              winner: null,
              roundNumber: 1,
              gameStartTime: Date.now(),
              currentPlayerIndex: 0,
              discardPile: [],
              deck: { length: 0 },
              currentColor: null,
            };
          }
          const state = gameEngine.getGameState();
          return {
            ...state,
            currentPlayerIndex: gameEngine.getCurrentPlayer() ? 
              state.players.findIndex((p: any) => p.id === state.currentPlayerId) : 0,
            discardPile: [],
            deck: { length: 0 },
            currentColor: state.selectedColor,
          };
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
            
            // 初始化游戏
            gameEngine.initializeGame(playerConfigs);
            
            set({
              gameEngine,
              isLoading: false
            });
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
            return gameEngine.playCard(playerId, card.id, chosenColor);
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
            return gameEngine.drawCard(playerId);
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
      }),
      {
        name: 'uno-game-storage',
        partialize: (state) => ({
          // 只持久化必要的设置，不持久化游戏状态
        }),
      }
    ),
    {
      name: 'uno-game-store',
    }
  )
); 