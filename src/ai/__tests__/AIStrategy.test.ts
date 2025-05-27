import { describe, it, expect, beforeEach } from 'vitest';
import { AIStrategy, AIDecision, GameStateInfo } from '../AIStrategy';
import { Card } from '../../game/Card';
import { CardColor, CardType } from '../../types';

// 创建一个测试用的具体AI策略类
class TestAI extends AIStrategy {
  constructor(playerId: string) {
    super('medium', playerId);
  }

  makeDecision(): AIDecision {
    return {
      type: 'draw',
      confidence: 0.5,
      reasoning: 'Test decision'
    };
  }

  chooseColor(): CardColor {
    return CardColor.RED;
  }
}

describe('AIStrategy', () => {
  let testAI: TestAI;
  let gameState: GameStateInfo;

  beforeEach(() => {
    testAI = new TestAI('test-player');
    
    gameState = {
      currentCard: new Card(CardType.NUMBER, CardColor.RED, 5),
      currentColor: CardColor.RED,
      players: [
        { id: 'test-player', name: 'Test Player', handSize: 5, isAI: true, hasCalledUno: false },
        { id: 'opponent1', name: 'Opponent 1', handSize: 3, isAI: false, hasCalledUno: false },
        { id: 'opponent2', name: 'Opponent 2', handSize: 7, isAI: true, hasCalledUno: false }
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

  describe('基础属性', () => {
    it('应该正确设置难度和玩家ID', () => {
      expect(testAI.getDifficulty()).toBe('medium');
      expect(testAI.getPlayerId()).toBe('test-player');
    });
  });

  describe('shouldCallUno', () => {
    it('应该在手牌剩余2张时返回true', () => {
      const hand = [
        new Card(CardType.NUMBER, CardColor.RED, 1),
        new Card(CardType.NUMBER, CardColor.BLUE, 2)
      ];
      
      expect(testAI.shouldCallUno(hand, gameState)).toBe(true);
    });

    it('应该在手牌不是2张时返回false', () => {
      const hand = [
        new Card(CardType.NUMBER, CardColor.RED, 1),
        new Card(CardType.NUMBER, CardColor.BLUE, 2),
        new Card(CardType.NUMBER, CardColor.GREEN, 3)
      ];
      
      expect(testAI.shouldCallUno(hand, gameState)).toBe(false);
    });
  });

  describe('getValidCardIndices', () => {
    it('应该找到颜色匹配的卡牌', () => {
      const hand = [
        new Card(CardType.NUMBER, CardColor.RED, 1),    // 匹配颜色
        new Card(CardType.NUMBER, CardColor.BLUE, 2),   // 不匹配
        new Card(CardType.NUMBER, CardColor.RED, 3)     // 匹配颜色
      ];
      
      const validIndices = testAI['getValidCardIndices'](hand, gameState.currentCard, gameState.currentColor);
      expect(validIndices).toEqual([0, 2]);
    });

    it('应该找到数字匹配的卡牌', () => {
      const hand = [
        new Card(CardType.NUMBER, CardColor.BLUE, 5),   // 匹配数字
        new Card(CardType.NUMBER, CardColor.GREEN, 2),  // 不匹配
        new Card(CardType.NUMBER, CardColor.YELLOW, 5)  // 匹配数字
      ];
      
      const validIndices = testAI['getValidCardIndices'](hand, gameState.currentCard, gameState.currentColor);
      expect(validIndices).toEqual([0, 2]);
    });

    it('应该识别万能牌总是可出', () => {
      const hand = [
        new Card(CardType.NUMBER, CardColor.BLUE, 1),   // 不匹配
        new Card(CardType.WILD),                        // 万能牌
        new Card(CardType.WILD_DRAW_FOUR)               // 万能+4
      ];
      
      const validIndices = testAI['getValidCardIndices'](hand, gameState.currentCard, gameState.currentColor);
      expect(validIndices).toEqual([1, 2]);
    });

    it('应该在没有可出牌时返回空数组', () => {
      const hand = [
        new Card(CardType.NUMBER, CardColor.BLUE, 1),
        new Card(CardType.NUMBER, CardColor.GREEN, 2),
        new Card(CardType.NUMBER, CardColor.YELLOW, 3)
      ];
      
      const validIndices = testAI['getValidCardIndices'](hand, gameState.currentCard, gameState.currentColor);
      expect(validIndices).toEqual([]);
    });
  });

  describe('calculateCardValue', () => {
    it('应该给万能牌更高的价值', () => {
      const hand = [new Card(CardType.WILD)];
      const wildCard = new Card(CardType.WILD);
      const numberCard = new Card(CardType.NUMBER, CardColor.RED, 5);
      
      const wildValue = testAI['calculateCardValue'](wildCard, hand, gameState);
      const numberValue = testAI['calculateCardValue'](numberCard, hand, gameState);
      
      expect(wildValue).toBeGreaterThan(numberValue);
    });

    it('应该给功能牌中等价值', () => {
      const hand = [new Card(CardType.SKIP, CardColor.RED)];
      const actionCard = new Card(CardType.SKIP, CardColor.RED);
      const numberCard = new Card(CardType.NUMBER, CardColor.RED, 5);
      
      const actionValue = testAI['calculateCardValue'](actionCard, hand, gameState);
      const numberValue = testAI['calculateCardValue'](numberCard, hand, gameState);
      
      expect(actionValue).toBeGreaterThan(numberValue);
    });

    it('应该考虑颜色匹配奖励', () => {
      const hand = [
        new Card(CardType.NUMBER, CardColor.RED, 1),
        new Card(CardType.NUMBER, CardColor.RED, 2),
        new Card(CardType.NUMBER, CardColor.RED, 3)
      ];
      const redCard = new Card(CardType.NUMBER, CardColor.RED, 4);
      const blueCard = new Card(CardType.NUMBER, CardColor.BLUE, 4);
      
      const redValue = testAI['calculateCardValue'](redCard, hand, gameState);
      const blueValue = testAI['calculateCardValue'](blueCard, hand, gameState);
      
      expect(redValue).toBeGreaterThan(blueValue);
    });
  });

  describe('analyzeOpponentThreat', () => {
    it('应该识别低手牌数量的威胁', () => {
      const lowThreatState = {
        ...gameState,
        players: [
          { id: 'test-player', name: 'Test Player', handSize: 5, isAI: true, hasCalledUno: false },
          { id: 'opponent1', name: 'Opponent 1', handSize: 7, isAI: false, hasCalledUno: false }
        ]
      };
      
      const highThreatState = {
        ...gameState,
        players: [
          { id: 'test-player', name: 'Test Player', handSize: 5, isAI: true, hasCalledUno: false },
          { id: 'opponent1', name: 'Opponent 1', handSize: 1, isAI: false, hasCalledUno: false }
        ]
      };
      
      const lowThreat = testAI['analyzeOpponentThreat'](lowThreatState);
      const highThreat = testAI['analyzeOpponentThreat'](highThreatState);
      
      expect(highThreat).toBeGreaterThan(lowThreat);
    });

    it('应该识别UNO状态的威胁', () => {
      const normalState = {
        ...gameState,
        players: [
          { id: 'test-player', name: 'Test Player', handSize: 5, isAI: true, hasCalledUno: false },
          { id: 'opponent1', name: 'Opponent 1', handSize: 2, isAI: false, hasCalledUno: false }
        ]
      };
      
      const unoState = {
        ...gameState,
        players: [
          { id: 'test-player', name: 'Test Player', handSize: 5, isAI: true, hasCalledUno: false },
          { id: 'opponent1', name: 'Opponent 1', handSize: 2, isAI: false, hasCalledUno: true }
        ]
      };
      
      const normalThreat = testAI['analyzeOpponentThreat'](normalState);
      const unoThreat = testAI['analyzeOpponentThreat'](unoState);
      
      expect(unoThreat).toBeGreaterThan(normalThreat);
    });
  });

  describe('addThinkingDelay', () => {
    it('应该返回Promise', async () => {
      const delayPromise = testAI['addThinkingDelay'](100);
      expect(delayPromise).toBeInstanceOf(Promise);
      await delayPromise;
    });

    it('应该在指定时间后resolve', async () => {
      const startTime = Date.now();
      await testAI['addThinkingDelay'](100);
      const endTime = Date.now();
      
      // 允许一些时间误差
      expect(endTime - startTime).toBeGreaterThanOrEqual(50);
    });
  });

  describe('游戏规则集成', () => {
    it('应该使用游戏规则配置', () => {
      // 验证AI策略确实加载了游戏规则
      expect(testAI['gameRules']).toBeDefined();
      expect(testAI['gameRules'].basic.initialHandSize).toBe(7); // 标准规则
      expect(testAI['gameRules'].uno.enableUnoCheck).toBe(true);
      expect(testAI['gameRules'].scoring.specialCardPoints).toBe(20);
      expect(testAI['gameRules'].scoring.wildCardPoints).toBe(50);
    });

    it('应该根据UNO规则配置决定是否叫UNO', () => {
      const hand = [
        new Card(CardType.NUMBER, CardColor.RED, 1),
        new Card(CardType.NUMBER, CardColor.BLUE, 2)
      ];

      // 正常情况下应该叫UNO
      expect(testAI.shouldCallUno(hand, gameState)).toBe(true);

      // 模拟禁用UNO检查的规则
      const originalRules = testAI['gameRules'];
      testAI['gameRules'] = {
        ...originalRules,
        uno: {
          ...originalRules.uno,
          enableUnoCheck: false
        }
      };

      // 禁用UNO检查时不应该叫UNO
      expect(testAI.shouldCallUno(hand, gameState)).toBe(false);

      // 恢复原始规则
      testAI['gameRules'] = originalRules;
    });
  });
}); 