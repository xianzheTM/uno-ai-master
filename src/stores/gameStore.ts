import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { GameEngine } from '../game/GameEngine';
import { Player } from '../game/Player';
import { AIDifficulty, CardColor, PlayerType } from '../types';

interface GameStore {
  // 游戏引擎实例
  gameEngine: GameEngine | null;
  
  // 基本状态
  isLoading: boolean;
  error: string | null;
  
  // 游戏控制方法
  initializeGame: (playerCount: number, difficulty: AIDifficulty) => void;
  playCard: (playerId: string, cardId: string, chosenColor?: CardColor) => boolean;
  drawCard: (playerId: string) => boolean;
  callUno: (playerId: string) => void;
  resetGame: () => void;
  
  // 游戏状态查询方法
  getCurrentPlayer: () => Player | null;
  getGameState: () => any;
  
  // UI状态方法
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useGameStore = create<GameStore>()(
  devtools(
    persist(
      (set, get) => ({
        gameEngine: null,
        isLoading: false,
        error: null,

        initializeGame: (playerCount: number, difficulty: AIDifficulty) => {
          try {
            set({ isLoading: true, error: null });
            
            const gameEngine = new GameEngine();
            
            // 创建玩家配置
            const playerConfigs = [];
            
            // 添加人类玩家
            playerConfigs.push({
              id: 'human-player',
              name: '玩家',
              type: PlayerType.HUMAN
            });
            
            // 添加AI玩家
            for (let i = 1; i < playerCount; i++) {
              playerConfigs.push({
                id: `ai-player-${i}`,
                name: `AI玩家${i}`,
                type: PlayerType.AI,
                aiDifficulty: difficulty
              });
            }
            
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

        playCard: (playerId: string, cardId: string, chosenColor?: CardColor) => {
          const { gameEngine } = get();
          if (!gameEngine) return false;
          
          try {
            return gameEngine.playCard(playerId, cardId, chosenColor);
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

        getGameState: () => {
          const { gameEngine } = get();
          return gameEngine?.getGameState() || null;
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