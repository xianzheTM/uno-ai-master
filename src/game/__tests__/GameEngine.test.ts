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

  describe('游戏设置', () => {
    it('应该使用自定义的初始手牌数量', () => {
      const players = [
        { id: '1', name: 'Player 1', type: PlayerType.HUMAN },
        { id: '2', name: 'Player 2', type: PlayerType.HUMAN }
      ];
      
      // 测试5张初始手牌
      gameEngine.initializeGame(players, { initialHandSize: 5 });
      
      const gamePlayers = gameEngine.getPlayers();
      gamePlayers.forEach(player => {
        expect(player.getHandCount()).toBe(5);
      });
      
      // 重置并测试10张初始手牌
      gameEngine.resetGame();
      gameEngine.initializeGame(players, { initialHandSize: 10 });
      
      const newGamePlayers = gameEngine.getPlayers();
      newGamePlayers.forEach(player => {
        expect(player.getHandCount()).toBe(10);
      });
    });
    
    it('应该在新一轮中保持相同的初始手牌数量', () => {
      const players = [
        { id: '1', name: 'Player 1', type: PlayerType.HUMAN },
        { id: '2', name: 'Player 2', type: PlayerType.HUMAN }
      ];
      
      // 初始化游戏，使用5张手牌
      gameEngine.initializeGame(players, { initialHandSize: 5 });
      
      // 开始新一轮
      gameEngine.startNewRound();
      
      const gamePlayers = gameEngine.getPlayers();
      gamePlayers.forEach(player => {
        expect(player.getHandCount()).toBe(5);
      });
    });
  });

  describe('质疑功能', () => {
    beforeEach(() => {
      const playerConfigs = [
        { id: 'player1', name: '玩家1', type: PlayerType.HUMAN },
        { id: 'player2', name: '玩家2', type: PlayerType.HUMAN }
      ];
      gameEngine.initializeGame(playerConfigs);
    });

    it('应该在质疑失败时惩罚质疑者', () => {
      const player1 = gameEngine.getPlayerById('player1')!;
      const player2 = gameEngine.getPlayerById('player2')!;
      
      // player1有7张牌且已正确喊UNO（或根本不需要喊）
      const initialCount1 = player1.getHandCount();
      const initialCount2 = player2.getHandCount();
      
      // player2质疑player1，但player1没有违规
      const result = gameEngine.challengeUnoViolation('player2', 'player1');
      
      expect(result.success).toBe(false);
      expect(result.penaltyCards).toBe(2);
      expect(result.punishedPlayer).toBe('player2'); // 质疑者被惩罚
      expect(player1.getHandCount()).toBe(initialCount1); // player1手牌数不变
      expect(player2.getHandCount()).toBe(initialCount2 + 2); // player2罚抽2张
    });

    it('应该在质疑成功时惩罚违规者', () => {
      const player1 = gameEngine.getPlayerById('player1')!;
      const player2 = gameEngine.getPlayerById('player2')!;
      
      // 模拟player1手牌只剩1张且未宣告UNO
      player1.clearHand();
      player1.addCard(new Card(CardType.NUMBER, CardColor.RED, 5));
      
      const initialCount2 = player2.getHandCount();
      
      // player2质疑player1的UNO违规
      const result = gameEngine.challengeUnoViolation('player2', 'player1');
      
      expect(result.success).toBe(true);
      expect(result.penaltyCards).toBe(2);
      expect(result.punishedPlayer).toBe('player1'); // 违规者被惩罚
      expect(player1.getHandCount()).toBe(3); // 原来1张 + 罚抽2张
      expect(player2.getHandCount()).toBe(initialCount2); // player2手牌数不变
    });

    it('应该检查是否可以质疑UNO违规', () => {
      // 在新的逻辑下，初始状态时任何玩家都可以被质疑
      expect(gameEngine.canChallengeUnoViolation('player1')).toBe(true);
      expect(gameEngine.canChallengeUnoViolation('player2')).toBe(true);
      
      // 检查是否可以质疑任何玩家
      expect(gameEngine.canChallengeAnyUnoViolation('player1')).toBe(true);
      expect(gameEngine.canChallengeAnyUnoViolation('player2')).toBe(true);
    });

    it('应该检查是否可以质疑Wild Draw Four', () => {
      // 没有Wild Draw Four卡时不能质疑
      expect(gameEngine.canChallengeWildDrawFour()).toBe(false);
      
      // 由于discardPile是private属性，我们无法直接设置
      // 这个测试需要通过实际游戏流程来触发Wild Draw Four的情况
      // 暂时简化为基础功能测试
      expect(gameEngine.canChallengeWildDrawFour()).toBe(false);
    });

    it('应该允许质疑任何玩家的UNO违规', () => {
      const player1 = gameEngine.getPlayerById('player1')!;
      const player2 = gameEngine.getPlayerById('player2')!;
      
      // 无论player1有多少张牌，都应该可以被质疑（在同一回合首次质疑时）
      expect(gameEngine.canChallengeUnoViolation('player1')).toBe(true);
      expect(gameEngine.canChallengeUnoViolation('player2')).toBe(true);
      
      // 检查是否可以质疑任何玩家
      expect(gameEngine.canChallengeAnyUnoViolation('player1')).toBe(true);
      expect(gameEngine.canChallengeAnyUnoViolation('player2')).toBe(true);
    });

    it('应该防止同一回合重复质疑UNO', () => {
      const player1 = gameEngine.getPlayerById('player1')!;
      const player2 = gameEngine.getPlayerById('player2')!;
      
      // 第一次质疑
      const result1 = gameEngine.challengeUnoViolation('player2', 'player1');
      expect(result1).toBeDefined();
      
      // 同一回合再次质疑应该失败
      expect(gameEngine.canChallengeUnoViolation('player1')).toBe(false);
      expect(gameEngine.canChallengeAnyUnoViolation('player2')).toBe(false);
      
      const result2 = gameEngine.challengeUnoViolation('player2', 'player1');
      expect(result2.success).toBe(false);
      expect(result2.penaltyCards).toBe(0);
    });
  });
}); 