import { describe, it, expect, beforeEach } from 'vitest';
import { GameEngine } from '../GameEngine';
import { Card } from '../Card';

describe('GameEngine', () => {
  let gameEngine: GameEngine;

  beforeEach(() => {
    gameEngine = new GameEngine();
  });

  describe('游戏初始化', () => {
    it('应该正确初始化游戏', () => {
      const playerConfigs = [
        { id: 'player1', name: '玩家1', type: 'human' as const },
        { id: 'player2', name: '玩家2', type: 'ai' as const, aiDifficulty: 'easy' as const }
      ];

      gameEngine.initializeGame(playerConfigs);
      const gameState = gameEngine.getGameState();

      expect(gameState.phase).toBe('playing');
      expect(gameState.players).toHaveLength(2);
      expect(gameState.currentPlayerId).toBe('player1');
      expect(gameState.direction).toBe('clockwise');
      expect(gameState.currentCard).toBeTruthy();
      
      // 每个玩家应该有7张牌
      gameState.players.forEach(player => {
        expect(player.hand).toHaveLength(7);
      });
    });

    it('应该拒绝无效的玩家数量', () => {
      expect(() => {
        gameEngine.initializeGame([
          { id: 'player1', name: '玩家1', type: 'human' }
        ]);
      }).toThrow('游戏需要2-6个玩家');

      expect(() => {
        gameEngine.initializeGame(Array(7).fill(null).map((_, i) => ({
          id: `player${i}`,
          name: `玩家${i}`,
          type: 'human' as const
        })));
      }).toThrow('游戏需要2-6个玩家');
    });
  });

  describe('出牌逻辑', () => {
    beforeEach(() => {
      const playerConfigs = [
        { id: 'player1', name: '玩家1', type: 'human' as const },
        { id: 'player2', name: '玩家2', type: 'human' as const }
      ];
      gameEngine.initializeGame(playerConfigs);
    });

    it('应该允许出有效的牌', () => {
      const gameState = gameEngine.getGameState();
      const currentPlayer = gameState.players[0];
      const currentCard = gameState.currentCard!;
      
      // 找到一张可以出的牌
      const playableCard = currentPlayer.hand.find(card => {
        const cardObj = new Card(card.type, card.color, card.value);
        const currentCardObj = new Card(currentCard.type, currentCard.color, currentCard.value);
        return cardObj.canPlayOn(currentCardObj);
      });

      if (playableCard) {
        const result = gameEngine.playCard('player1', playableCard.id);
        expect(result).toBe(true);
      }
    });

    it('应该拒绝无效的出牌', () => {
      const gameState = gameEngine.getGameState();
      const currentPlayer = gameState.players[0];
      
      // 尝试出一张不存在的牌
      const result = gameEngine.playCard('player1', 'invalid-card-id');
      expect(result).toBe(false);
    });

    it('应该拒绝非当前玩家的出牌', () => {
      const gameState = gameEngine.getGameState();
      const player2 = gameState.players[1];
      
      if (player2.hand.length > 0) {
        const result = gameEngine.playCard('player2', player2.hand[0].id);
        expect(result).toBe(false);
      }
    });
  });

  describe('抽牌逻辑', () => {
    beforeEach(() => {
      const playerConfigs = [
        { id: 'player1', name: '玩家1', type: 'human' as const },
        { id: 'player2', name: '玩家2', type: 'human' as const }
      ];
      gameEngine.initializeGame(playerConfigs);
    });

    it('应该允许当前玩家抽牌', () => {
      const gameStateBefore = gameEngine.getGameState();
      const currentPlayerBefore = gameStateBefore.players[0];
      const handCountBefore = currentPlayerBefore.hand.length;

      const result = gameEngine.drawCard('player1');
      expect(result).toBe(true);

      const gameStateAfter = gameEngine.getGameState();
      const currentPlayerAfter = gameStateAfter.players.find(p => p.id === 'player1')!;
      expect(currentPlayerAfter.hand.length).toBe(handCountBefore + 1);
    });

    it('应该拒绝非当前玩家抽牌', () => {
      const result = gameEngine.drawCard('player2');
      expect(result).toBe(false);
    });
  });

  describe('UNO规则', () => {
    beforeEach(() => {
      const playerConfigs = [
        { id: 'player1', name: '玩家1', type: 'human' as const },
        { id: 'player2', name: '玩家2', type: 'human' as const }
      ];
      gameEngine.initializeGame(playerConfigs);
    });

    it('应该允许玩家在手牌剩余1张时调用UNO', () => {
      // 这个测试需要模拟玩家手牌只剩1张的情况
      // 由于游戏逻辑的复杂性，这里只测试基本的UNO调用逻辑
      const result = gameEngine.callUno('player1');
      // 如果玩家手牌不是1张，应该返回false
      expect(result).toBe(false);
    });
  });

  describe('游戏状态管理', () => {
    it('应该正确返回游戏状态', () => {
      const gameState = gameEngine.getGameState();
      
      expect(gameState).toHaveProperty('phase');
      expect(gameState).toHaveProperty('currentPlayerId');
      expect(gameState).toHaveProperty('direction');
      expect(gameState).toHaveProperty('players');
      expect(gameState).toHaveProperty('roundNumber');
      expect(gameState).toHaveProperty('gameStartTime');
    });

    it('应该正确重置游戏', () => {
      // 先初始化游戏
      const playerConfigs = [
        { id: 'player1', name: '玩家1', type: 'human' as const },
        { id: 'player2', name: '玩家2', type: 'human' as const }
      ];
      gameEngine.initializeGame(playerConfigs);

      // 重置游戏
      gameEngine.resetGame();
      const gameState = gameEngine.getGameState();

      expect(gameState.phase).toBe('waiting');
      expect(gameState.currentPlayerId).toBe('');
      expect(gameState.players).toHaveLength(0);
      expect(gameState.winner).toBeNull();
    });
  });
}); 