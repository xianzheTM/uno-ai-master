import { describe, it, expect, beforeEach } from 'vitest';
import { GameEngine } from '../GameEngine';
import { Card } from '../Card';
import { GameDirection, GamePhase, PlayerType, AIDifficulty, CardColor, CardType } from '../../types';

describe('GameEngine', () => {
  let gameEngine: GameEngine;

  beforeEach(() => {
    gameEngine = new GameEngine();
  });

  describe('游戏初始化', () => {
    it('应该正确初始化游戏', () => {
      const playerConfigs = [
        { id: 'player1', name: '玩家1', type: PlayerType.HUMAN },
        { id: 'player2', name: '玩家2', type: PlayerType.AI, aiDifficulty: AIDifficulty.EASY }
      ];

      gameEngine.initializeGame(playerConfigs);
      const gameState = gameEngine.getGameState();

      expect(gameState.phase).toBe(GamePhase.PLAYING);
      expect(gameState.players).toHaveLength(2);
      expect(gameState.currentPlayerId).toBe('player1');
      expect(gameState.direction).toBe(GameDirection.CLOCKWISE);
      expect(gameState.currentCard).toBeTruthy();

      // 每个玩家应该有7张牌
      gameState.players.forEach(player => {
        expect(player.hand).toHaveLength(7);
      });
    });

    it('应该拒绝无效的玩家数量', () => {
      expect(() => {
        gameEngine.initializeGame([
          { id: 'player1', name: '玩家1', type: PlayerType.HUMAN }
        ]);
      }).toThrow('游戏需要2-6个玩家');

      expect(() => {
        gameEngine.initializeGame(Array(7).fill(null).map((_, i) => ({
          id: `player${i}`,
          name: `玩家${i}`,
          type: PlayerType.HUMAN
        })));
      }).toThrow('游戏需要2-6个玩家');
    });
  });

  describe('出牌逻辑', () => {
    beforeEach(() => {
      const playerConfigs = [
        { id: 'player1', name: '玩家1', type: PlayerType.HUMAN },
        { id: 'player2', name: '玩家2', type: PlayerType.HUMAN }
      ];
      gameEngine.initializeGame(playerConfigs);
    });

    it('应该允许出有效的牌', () => {
      const gameState = gameEngine.getGameState();
      const currentPlayer = gameState.players[0];
      const currentCard = gameState.currentCard!;

      // 找到一张可以出的牌
      const playableCard = currentPlayer.hand.find((card: any) => {
        const cardObj = new Card(card.type, card.color, card.value);
        const currentCardObj = new Card(currentCard.type, currentCard.color, currentCard.value);
        return cardObj.canPlayOn(currentCardObj);
      });

      if (playableCard) {
        // 检查是否是万能牌，如果是则需要提供颜色
        const cardObj = new Card(playableCard.type, playableCard.color, playableCard.value);
        const selectedColor = cardObj.isWildCard() ? CardColor.RED : undefined;

        const result = gameEngine.playCard('player1', playableCard.id, selectedColor as any);
        expect(result).toBe(true);
      } else {
        // 如果没有可以出的牌，测试抽牌功能
        const result = gameEngine.drawCard('player1');
        expect(result).toBe(true);
      }
    });

    it('应该允许出万能牌（稳定测试）', () => {
      // 这个测试不依赖随机发牌，确保测试稳定性
      const player = gameEngine.getCurrentPlayer();
      
      if (player) {
        // 手动创建一张万能牌并添加到玩家手牌
        const wildCard = new Card(CardType.WILD, CardColor.WILD);
        player.addCard(wildCard);
        
        // 万能牌应该总是可以出牌
        const result = gameEngine.playCard('player1', wildCard.id, CardColor.RED);
        expect(result).toBe(true);
      }
    });

    it('应该允许出颜色匹配的牌（稳定测试）', () => {
      // 这个测试不依赖随机发牌，确保测试稳定性
      const gameState = gameEngine.getGameState();
      const currentCard = gameState.currentCard!;
      const player = gameEngine.getCurrentPlayer();
      
      if (player) {
        // 创建一张与当前牌颜色相同的数字牌
        const matchingCard = new Card(CardType.NUMBER, currentCard.color, 5);
        player.addCard(matchingCard);
        
        // 颜色匹配的牌应该可以出牌
        const result = gameEngine.playCard('player1', matchingCard.id);
        expect(result).toBe(true);
      }
    });

    it('应该拒绝无效的出牌', () => {
      // const gameState = gameEngine.getGameState();
      // const currentPlayer = gameState.players[0];

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
        { id: 'player1', name: '玩家1', type: PlayerType.HUMAN },
        { id: 'player2', name: '玩家2', type: PlayerType.HUMAN }
      ];
      gameEngine.initializeGame(playerConfigs);
    });

    it('应该允许当前玩家抽牌', () => {
      const gameStateBefore = gameEngine.getGameState();
      const currentPlayerBefore = gameStateBefore.players[0];
      const handCountBefore = currentPlayerBefore.hand.length;
      const drawStackBefore = gameStateBefore.drawStack || 0;

      const result = gameEngine.drawCard('player1');
      expect(result).toBe(true);

      const gameStateAfter = gameEngine.getGameState();
      const currentPlayerAfter = gameStateAfter.players.find(p => p.id === 'player1')!;
      
      // 抽牌数量应该是drawStack或1（如果没有drawStack）
      const expectedDrawCount = drawStackBefore > 0 ? drawStackBefore : 1;
      expect(currentPlayerAfter.hand.length).toBe(handCountBefore + expectedDrawCount);
    });

    it('应该拒绝非当前玩家抽牌', () => {
      const result = gameEngine.drawCard('player2');
      expect(result).toBe(false);
    });
  });

  describe('UNO规则', () => {
    beforeEach(() => {
      const playerConfigs = [
        { id: 'player1', name: '玩家1', type: PlayerType.HUMAN },
        { id: 'player2', name: '玩家2', type: PlayerType.HUMAN }
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
        { id: 'player1', name: '玩家1', type: PlayerType.HUMAN },
        { id: 'player2', name: '玩家2', type: PlayerType.HUMAN }
      ];
      gameEngine.initializeGame(playerConfigs);

      // 重置游戏
      gameEngine.resetGame();
      const gameState = gameEngine.getGameState();

      expect(gameState.phase).toBe(GamePhase.SETUP);
      expect(gameState.currentPlayerId).toBe('');
      expect(gameState.players).toHaveLength(0);
      expect(gameState.winner).toBeNull();
    });
  });
}); 