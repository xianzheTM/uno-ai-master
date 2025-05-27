import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { GameEngine } from '../game/GameEngine';
import { Player } from '../game/Player';
import { Card } from '../game/Card';
import { GameState, GamePhase, GameDifficulty } from '../types/GameState';

interface GameStore extends GameState {
  // 游戏引擎实例
  gameEngine: GameEngine | null;
  
  // 游戏控制方法
  initializeGame: (playerCount: number, difficulty: GameDifficulty) => void;
  startGame: () => void;
  playCard: (playerId: string, cardIndex: number, chosenColor?: string) => boolean;
  drawCard: (playerId: string) => boolean;
  callUno: (playerId: string) => void;
  endTurn: () => void;
  resetGame: () => void;
  
  // 游戏状态查询方法
  getCurrentPlayer: () => Player | null;
  getPlayerById: (playerId: string) => Player | null;
  canPlayCard: (playerId: string, cardIndex: number) => boolean;
  getValidCards: (playerId: string) => number[];
  
  // UI状态方法
  setSelectedCard: (cardIndex: number | null) => void;
  setShowColorPicker: (show: boolean) => void;
  setShowUnoButton: (show: boolean) => void;
}

const initialState: GameState = {
  players: [],
  currentPlayerIndex: 0,
  direction: 1,
  currentCard: null,
  currentColor: null,
  drawPileCount: 0,
  discardPile: [],
  phase: GamePhase.SETUP,
  winner: null,
  gameSettings: {
    playerCount: 4,
    difficulty: GameDifficulty.MEDIUM,
    enableSounds: true,
    enableAnimations: true,
  },
  uiState: {
    selectedCardIndex: null,
    showColorPicker: false,
    showUnoButton: false,
    isLoading: false,
    error: null,
  },
};

export const useGameStore = create<GameStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        gameEngine: null,

        initializeGame: (playerCount: number, difficulty: GameDifficulty) => {
          const gameEngine = new GameEngine();
          
          // 创建玩家
          const players: Player[] = [];
          
          // 添加人类玩家
          players.push(new Player('human-player', '玩家', false));
          
          // 添加AI玩家
          for (let i = 1; i < playerCount; i++) {
            players.push(new Player(`ai-player-${i}`, `AI玩家${i}`, true));
          }
          
          // 初始化游戏
          gameEngine.initializeGame(players);
          
          set({
            gameEngine,
            players: gameEngine.getPlayers(),
            currentPlayerIndex: gameEngine.getCurrentPlayerIndex(),
            direction: gameEngine.getDirection(),
            currentCard: gameEngine.getCurrentCard(),
            currentColor: gameEngine.getCurrentColor(),
            drawPileCount: gameEngine.getDrawPileCount(),
            discardPile: gameEngine.getDiscardPile(),
            phase: GamePhase.READY,
            gameSettings: {
              ...get().gameSettings,
              playerCount,
              difficulty,
            },
            uiState: {
              ...initialState.uiState,
            },
          });
        },

        startGame: () => {
          const { gameEngine } = get();
          if (!gameEngine) return;
          
          gameEngine.startGame();
          
          set({
            players: gameEngine.getPlayers(),
            currentPlayerIndex: gameEngine.getCurrentPlayerIndex(),
            currentCard: gameEngine.getCurrentCard(),
            currentColor: gameEngine.getCurrentColor(),
            drawPileCount: gameEngine.getDrawPileCount(),
            discardPile: gameEngine.getDiscardPile(),
            phase: GamePhase.PLAYING,
          });
        },

        playCard: (playerId: string, cardIndex: number, chosenColor?: string) => {
          const { gameEngine } = get();
          if (!gameEngine) return false;
          
          try {
            const success = gameEngine.playCard(playerId, cardIndex, chosenColor);
            
            if (success) {
              const winner = gameEngine.getWinner();
              
              set({
                players: gameEngine.getPlayers(),
                currentPlayerIndex: gameEngine.getCurrentPlayerIndex(),
                direction: gameEngine.getDirection(),
                currentCard: gameEngine.getCurrentCard(),
                currentColor: gameEngine.getCurrentColor(),
                drawPileCount: gameEngine.getDrawPileCount(),
                discardPile: gameEngine.getDiscardPile(),
                winner,
                phase: winner ? GamePhase.FINISHED : GamePhase.PLAYING,
                uiState: {
                  ...get().uiState,
                  selectedCardIndex: null,
                  showColorPicker: false,
                },
              });
            }
            
            return success;
          } catch (error) {
            set({
              uiState: {
                ...get().uiState,
                error: error instanceof Error ? error.message : '出牌失败',
              },
            });
            return false;
          }
        },

        drawCard: (playerId: string) => {
          const { gameEngine } = get();
          if (!gameEngine) return false;
          
          try {
            const success = gameEngine.drawCard(playerId);
            
            if (success) {
              set({
                players: gameEngine.getPlayers(),
                drawPileCount: gameEngine.getDrawPileCount(),
              });
            }
            
            return success;
          } catch (error) {
            set({
              uiState: {
                ...get().uiState,
                error: error instanceof Error ? error.message : '摸牌失败',
              },
            });
            return false;
          }
        },

        callUno: (playerId: string) => {
          const { gameEngine } = get();
          if (!gameEngine) return;
          
          gameEngine.callUno(playerId);
          
          set({
            players: gameEngine.getPlayers(),
            uiState: {
              ...get().uiState,
              showUnoButton: false,
            },
          });
        },

        endTurn: () => {
          const { gameEngine } = get();
          if (!gameEngine) return;
          
          gameEngine.endTurn();
          
          set({
            currentPlayerIndex: gameEngine.getCurrentPlayerIndex(),
            direction: gameEngine.getDirection(),
          });
        },

        resetGame: () => {
          set({
            ...initialState,
            gameEngine: null,
          });
        },

        getCurrentPlayer: () => {
          const { gameEngine } = get();
          return gameEngine?.getCurrentPlayer() || null;
        },

        getPlayerById: (playerId: string) => {
          const { players } = get();
          return players.find(player => player.getId() === playerId) || null;
        },

        canPlayCard: (playerId: string, cardIndex: number) => {
          const { gameEngine } = get();
          return gameEngine?.canPlayCard(playerId, cardIndex) || false;
        },

        getValidCards: (playerId: string) => {
          const { gameEngine } = get();
          return gameEngine?.getValidCards(playerId) || [];
        },

        setSelectedCard: (cardIndex: number | null) => {
          set({
            uiState: {
              ...get().uiState,
              selectedCardIndex: cardIndex,
            },
          });
        },

        setShowColorPicker: (show: boolean) => {
          set({
            uiState: {
              ...get().uiState,
              showColorPicker: show,
            },
          });
        },

        setShowUnoButton: (show: boolean) => {
          set({
            uiState: {
              ...get().uiState,
              showUnoButton: show,
            },
          });
        },
      }),
      {
        name: 'uno-game-storage',
        partialize: (state) => ({
          gameSettings: state.gameSettings,
        }),
      }
    ),
    {
      name: 'uno-game-store',
    }
  )
); 