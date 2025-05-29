import { describe, it, expect, beforeEach } from 'vitest';
import { AIManager } from '../AIManager';
import { EasyAI } from '../EasyAI';
import { MediumAI } from '../MediumAI';
import { HardAI } from '../HardAI';
import { Card } from '../../game/Card';
import { Player } from '../../game/Player';
import { AIDifficulty, CardColor, CardType, PlayerType } from '../../types';
import { GameStateInfo } from '../AIStrategy';

describe('AIManager', () => {
  let aiManager: AIManager;
  let gameState: GameStateInfo;

  beforeEach(() => {
    aiManager = new AIManager();
    
    gameState = {
      currentCard: new Card(CardType.NUMBER, CardColor.RED, 5),
      currentColor: CardColor.RED,
      players: [
        { id: 'player1', name: 'Player 1', handSize: 5, isAI: false, hasCalledUno: false },
        { id: 'ai-player', name: 'AI Player', handSize: 3, isAI: true, hasCalledUno: false }
      ],
      direction: 1,
      drawPileSize: 50,
      discardPileSize: 10,
      recentCards: [],
      playedCards: [],
      skipCount: 0,
      drawCount: 0
    };
  });

  describe('AI创建和管理', () => {
    it('应该创建Easy AI', () => {
      const ai = aiManager.createAI('easy-player', AIDifficulty.EASY);
      expect(ai).toBeInstanceOf(EasyAI);
      expect(ai.getDifficulty()).toBe('easy');
      expect(ai.getPlayerId()).toBe('easy-player');
    });

    it('应该创建Medium AI', () => {
      const ai = aiManager.createAI('medium-player', AIDifficulty.MEDIUM);
      expect(ai).toBeInstanceOf(MediumAI);
      expect(ai.getDifficulty()).toBe('medium');
      expect(ai.getPlayerId()).toBe('medium-player');
    });

    it('应该创建Hard AI', () => {
      const ai = aiManager.createAI('hard-player', AIDifficulty.HARD);
      expect(ai).toBeInstanceOf(HardAI);
      expect(ai.getDifficulty()).toBe('hard');
      expect(ai.getPlayerId()).toBe('hard-player');
    });

    it('应该默认创建Medium AI', () => {
      const ai = aiManager.createAI('default-player', 'invalid' as AIDifficulty);
      expect(ai).toBeInstanceOf(MediumAI);
    });

    it('应该存储创建的AI实例', () => {
      const ai = aiManager.createAI('test-player', AIDifficulty.EASY);
      const retrievedAI = aiManager.getAI('test-player');
      expect(retrievedAI).toBe(ai);
    });

    it('应该为不存在的玩家返回null', () => {
      const ai = aiManager.getAI('non-existent-player');
      expect(ai).toBeNull();
    });

    it('应该移除AI实例', () => {
      aiManager.createAI('test-player', AIDifficulty.EASY);
      expect(aiManager.getAI('test-player')).not.toBeNull();
      
      aiManager.removeAI('test-player');
      expect(aiManager.getAI('test-player')).toBeNull();
    });
  });

  describe('AI决策', () => {
    beforeEach(() => {
      aiManager.createAI('ai-player', AIDifficulty.EASY);
    });

    it('应该让AI做出决策', async () => {
      const hand = [new Card(CardType.NUMBER, CardColor.RED, 1)];
      const decision = await aiManager.makeDecision('ai-player', hand, gameState);
      
      expect(decision).toBeDefined();
      expect(decision!.type).toMatch(/^(play|draw|uno)$/);
      expect(decision!.confidence).toBeGreaterThanOrEqual(0);
      expect(decision!.confidence).toBeLessThanOrEqual(1);
    });

    it('应该为不存在的AI返回null', async () => {
      const hand = [new Card(CardType.NUMBER, CardColor.RED, 1)];
      const decision = await aiManager.makeDecision('non-existent', hand, gameState);
      
      expect(decision).toBeNull();
    });

    it('应该在AI出错时返回默认决策', async () => {
      // 创建一个会出错的AI
      const ai = aiManager.createAI('error-player', AIDifficulty.EASY);
      // 模拟AI方法出错
      ai.makeDecision = () => { throw new Error('Test error'); };
      
      const hand = [new Card(CardType.NUMBER, CardColor.RED, 1)];
      const decision = await aiManager.makeDecision('error-player', hand, gameState);
      
      expect(decision).toBeDefined();
      expect(decision!.type).toBe('draw');
      expect(decision!.confidence).toBe(0);
      expect(decision!.reasoning).toBe('AI决策出错，默认摸牌');
    });

    it('应该记录决策历史', async () => {
      const hand = [new Card(CardType.NUMBER, CardColor.RED, 1)];
      
      await aiManager.makeDecision('ai-player', hand, gameState);
      await aiManager.makeDecision('ai-player', hand, gameState);
      
      const history = aiManager.getDecisionHistory('ai-player');
      expect(history).toHaveLength(2);
      expect(history[0]).toHaveProperty('timestamp');
    });

    it('应该限制决策历史长度', async () => {
      const hand = [new Card(CardType.NUMBER, CardColor.RED, 1)];
      
      // 创建超过100个决策，跳过思考延迟以加快测试速度
      for (let i = 0; i < 105; i++) {
        await aiManager.makeDecision('ai-player', hand, gameState, true);
      }
      
      const history = aiManager.getDecisionHistory('ai-player');
      expect(history).toHaveLength(100);
    });
  });

  describe('颜色选择', () => {
    beforeEach(() => {
      aiManager.createAI('ai-player', AIDifficulty.EASY);
    });

    it('应该让AI选择颜色', () => {
      const hand = [new Card(CardType.WILD)];
      const color = aiManager.chooseColor('ai-player', hand, gameState);
      
      expect(color).toBeDefined();
      expect([CardColor.RED, CardColor.YELLOW, CardColor.GREEN, CardColor.BLUE]).toContain(color);
    });

    it('应该为不存在的AI返回null', () => {
      const hand = [new Card(CardType.WILD)];
      const color = aiManager.chooseColor('non-existent', hand, gameState);
      
      expect(color).toBeNull();
    });

    it('应该在AI出错时返回null', () => {
      const ai = aiManager.createAI('error-player', AIDifficulty.EASY);
      ai.chooseColor = () => { throw new Error('Test error'); };
      
      const hand = [new Card(CardType.WILD)];
      const color = aiManager.chooseColor('error-player', hand, gameState);
      
      expect(color).toBeNull();
    });
  });

  describe('UNO检查', () => {
    beforeEach(() => {
      aiManager.createAI('ai-player', AIDifficulty.EASY);
    });

    it('应该检查AI是否应该叫UNO', () => {
      const hand = [
        new Card(CardType.NUMBER, CardColor.RED, 1),
        new Card(CardType.NUMBER, CardColor.BLUE, 2)
      ];
      
      const shouldCallUno = aiManager.shouldCallUno('ai-player', hand, gameState);
      expect(typeof shouldCallUno).toBe('boolean');
    });

    it('应该为不存在的AI返回false', () => {
      const hand = [new Card(CardType.NUMBER, CardColor.RED, 1)];
      const shouldCallUno = aiManager.shouldCallUno('non-existent', hand, gameState);
      
      expect(shouldCallUno).toBe(false);
    });

    it('应该在AI出错时返回false', () => {
      const ai = aiManager.createAI('error-player', AIDifficulty.EASY);
      ai.shouldCallUno = () => { throw new Error('Test error'); };
      
      const hand = [new Card(CardType.NUMBER, CardColor.RED, 1)];
      const shouldCallUno = aiManager.shouldCallUno('error-player', hand, gameState);
      
      expect(shouldCallUno).toBe(false);
    });
  });

  describe('统计信息', () => {
    beforeEach(() => {
      aiManager.createAI('ai-stats-player', AIDifficulty.MEDIUM); // 使用不同的玩家ID避免冲突
    });

    it('应该返回AI统计信息', async () => {
      const hand = [new Card(CardType.NUMBER, CardColor.RED, 1)];
      
      // 生成一些决策历史
      await aiManager.makeDecision('ai-stats-player', hand, gameState);
      await aiManager.makeDecision('ai-stats-player', hand, gameState);
      
      const stats = aiManager.getAIStats('ai-stats-player');
      
      expect(stats).toBeDefined();
      expect(stats!.totalDecisions).toBe(2);
      expect(stats!.averageConfidence).toBeGreaterThanOrEqual(0);
      expect(stats!.averageConfidence).toBeLessThanOrEqual(1);
      expect(stats!.decisionTypes).toBeDefined();
      expect(stats!.difficulty).toBe('medium');
    });

    it('应该为没有历史的AI返回null', () => {
      const stats = aiManager.getAIStats('ai-stats-player');
      expect(stats).toBeNull();
    });

    it('应该为不存在的AI返回null', () => {
      const stats = aiManager.getAIStats('non-existent');
      expect(stats).toBeNull();
    });

    it('应该正确统计决策类型', async () => {
      const hand = [new Card(CardType.NUMBER, CardColor.BLUE, 1)]; // 无法出牌
      
      // 生成多个摸牌决策
      await aiManager.makeDecision('ai-stats-player', hand, gameState);
      await aiManager.makeDecision('ai-stats-player', hand, gameState);
      
      const stats = aiManager.getAIStats('ai-stats-player');
      expect(stats!.decisionTypes.draw).toBe(2);
    });
  });

  describe('批量操作', () => {
    it('应该为多个玩家创建AI', () => {
      const players = [
        new Player('player1', 'Player 1', PlayerType.HUMAN),
        new Player('ai1', 'AI 1', PlayerType.AI),
        new Player('ai2', 'AI 2', PlayerType.AI)
      ];
      
      aiManager.createAIsForPlayers(players, AIDifficulty.MEDIUM);
      
      expect(aiManager.getAI('player1')).toBeNull(); // 人类玩家不应该有AI
      expect(aiManager.getAI('ai1')).not.toBeNull();
      expect(aiManager.getAI('ai2')).not.toBeNull();
    });

    it('应该检查是否有AI玩家', () => {
      expect(aiManager.hasAIPlayers()).toBe(false);
      
      aiManager.createAI('ai-player', AIDifficulty.EASY);
      expect(aiManager.hasAIPlayers()).toBe(true);
    });

    it('应该返回正确的AI数量', () => {
      expect(aiManager.getAICount()).toBe(0);
      
      aiManager.createAI('ai1', AIDifficulty.EASY);
      aiManager.createAI('ai2', AIDifficulty.MEDIUM);
      
      expect(aiManager.getAICount()).toBe(2);
    });

    it('应该获取所有AI实例', () => {
      aiManager.createAI('ai1', AIDifficulty.EASY);
      aiManager.createAI('ai2', AIDifficulty.HARD);
      
      const allAIs = aiManager.getAllAIs();
      expect(allAIs.size).toBe(2);
      expect(allAIs.has('ai1')).toBe(true);
      expect(allAIs.has('ai2')).toBe(true);
    });

    it('应该重置所有AI', () => {
      aiManager.createAI('ai1', AIDifficulty.EASY);
      aiManager.createAI('ai2', AIDifficulty.MEDIUM);
      
      expect(aiManager.getAICount()).toBe(2);
      
      aiManager.resetAll();
      
      expect(aiManager.getAICount()).toBe(0);
      expect(aiManager.hasAIPlayers()).toBe(false);
    });
  });

  describe('错误处理', () => {
    it('应该处理无效的难度级别', () => {
      const ai = aiManager.createAI('test-player', 'invalid' as AIDifficulty);
      expect(ai).toBeInstanceOf(MediumAI); // 应该默认为Medium
    });

    it('应该处理重复创建AI', () => {
      const ai2 = aiManager.createAI('test-player', AIDifficulty.HARD);
      
      // 第二次创建应该覆盖第一次
      expect(aiManager.getAI('test-player')).toBe(ai2);
      expect(ai2).toBeInstanceOf(HardAI);
    });

    it('应该处理移除不存在的AI', () => {
      expect(() => {
        aiManager.removeAI('non-existent');
      }).not.toThrow();
    });
  });
}); 