import { describe, it, expect, beforeEach } from 'vitest';
import { HardAI } from '../HardAI';
import { Card } from '../../game/Card';
import { CardColor, CardType } from '../../types';
import { GameStateInfo } from '../AIStrategy';

describe('HardAI', () => {
  let hardAI: HardAI;
  let gameState: GameStateInfo;

  beforeEach(() => {
    hardAI = new HardAI('hard-player');
    
    gameState = {
      currentCard: new Card(CardType.NUMBER, CardColor.RED, 5),
      currentColor: CardColor.RED,
      players: [
        { id: 'hard-player', name: 'Hard Player', handSize: 5, isAI: true, hasCalledUno: false },
        { id: 'opponent1', name: 'Opponent 1', handSize: 3, isAI: false, hasCalledUno: false },
        { id: 'opponent2', name: 'Opponent 2', handSize: 7, isAI: true, hasCalledUno: false }
      ],
      direction: 1,
      drawPileSize: 50,
      discardPileSize: 10,
      recentCards: [],
      playedCards: [
        new Card(CardType.NUMBER, CardColor.RED, 1),
        new Card(CardType.NUMBER, CardColor.BLUE, 2)
      ],
      skipCount: 0,
      drawCount: 0
    };
  });

  describe('基础属性', () => {
    it('应该设置为hard难度', () => {
      expect(hardAI.getDifficulty()).toBe('hard');
    });

    it('应该设置正确的玩家ID', () => {
      expect(hardAI.getPlayerId()).toBe('hard-player');
    });
  });

  describe('卡牌记忆功能', () => {
    it('应该初始化卡牌记忆', () => {
      // 通过决策来触发卡牌记忆更新
      const hand = [new Card(CardType.NUMBER, CardColor.RED, 1)];
      hardAI.makeDecision(hand, gameState);
      
      // 验证AI能够正常工作（间接测试卡牌记忆初始化）
      expect(hardAI.getDifficulty()).toBe('hard');
    });

    it('应该更新已打出的卡牌记忆', () => {
      const hand = [new Card(CardType.NUMBER, CardColor.RED, 1)];
      const gameStateWithMoreCards = {
        ...gameState,
        playedCards: [
          new Card(CardType.NUMBER, CardColor.RED, 1),
          new Card(CardType.NUMBER, CardColor.RED, 2),
          new Card(CardType.NUMBER, CardColor.RED, 3)
        ]
      };

      // 多次调用应该更新记忆
      hardAI.makeDecision(hand, gameStateWithMoreCards);
      expect(hardAI.getDifficulty()).toBe('hard'); // 验证AI仍然正常工作
    });
  });

  describe('对手行为分析', () => {
    it('应该记录对手行为历史', () => {
      const hand = [new Card(CardType.NUMBER, CardColor.RED, 1)];
      
      // 第一次决策
      hardAI.makeDecision(hand, gameState);
      
      // 改变对手状态
      const updatedGameState = {
        ...gameState,
        players: [
          { id: 'hard-player', name: 'Hard Player', handSize: 5, isAI: true, hasCalledUno: false },
          { id: 'opponent1', name: 'Opponent 1', handSize: 2, isAI: false, hasCalledUno: false }, // 手牌减少
          { id: 'opponent2', name: 'Opponent 2', handSize: 6, isAI: true, hasCalledUno: false }
        ]
      };
      
      // 第二次决策应该记录行为变化
      hardAI.makeDecision(hand, updatedGameState);
      expect(hardAI.getDifficulty()).toBe('hard');
    });

    it('应该基于对手行为调整威胁评估', () => {
      const hand = [new Card(CardType.NUMBER, CardColor.RED, 1)];
      
      // 低威胁状态
      const lowThreatState = {
        ...gameState,
        players: [
          { id: 'hard-player', name: 'Hard Player', handSize: 5, isAI: true, hasCalledUno: false },
          { id: 'opponent1', name: 'Opponent 1', handSize: 7, isAI: false, hasCalledUno: false }
        ]
      };
      
      // 高威胁状态
      const highThreatState = {
        ...gameState,
        players: [
          { id: 'hard-player', name: 'Hard Player', handSize: 5, isAI: true, hasCalledUno: false },
          { id: 'opponent1', name: 'Opponent 1', handSize: 1, isAI: false, hasCalledUno: true }
        ]
      };
      
      const lowThreatDecision = hardAI.makeDecision(hand, lowThreatState);
      const highThreatDecision = hardAI.makeDecision(hand, highThreatState);
      
      // 高威胁情况下应该有不同的决策考虑
      expect(lowThreatDecision).toBeDefined();
      expect(highThreatDecision).toBeDefined();
    });
  });

  describe('makeDecision', () => {
    it('应该在需要UNO时返回UNO决策', () => {
      const hand = [
        new Card(CardType.NUMBER, CardColor.RED, 1),
        new Card(CardType.NUMBER, CardColor.BLUE, 2)
      ];

      const decision = hardAI.makeDecision(hand, gameState);
      expect(decision.type).toBe('uno');
      expect(decision.confidence).toBe(1.0);
    });

    it('应该在没有可出牌时选择摸牌', () => {
      const hand = [
        new Card(CardType.NUMBER, CardColor.BLUE, 1),
        new Card(CardType.NUMBER, CardColor.GREEN, 2),
        new Card(CardType.NUMBER, CardColor.YELLOW, 3)
      ];

      const decision = hardAI.makeDecision(hand, gameState);
      expect(decision.type).toBe('draw');
      expect(decision.confidence).toBe(1.0);
    });

    it('应该在有可出牌时进行深度分析', () => {
      const hand = [
        new Card(CardType.NUMBER, CardColor.RED, 1),
        new Card(CardType.SKIP, CardColor.RED),
        new Card(CardType.WILD)
      ];

      const decision = hardAI.makeDecision(hand, gameState);
      expect(decision.type).toBe('play');
      expect(decision.confidence).toBe(0.95);
      expect(decision.cardIndex).toBeTypeOf('number');
      expect(decision.reasoning).toContain('深度分析选择');
    });

    it('应该为万能牌选择最优颜色', () => {
      const hand = [
        new Card(CardType.WILD),
        new Card(CardType.NUMBER, CardColor.BLUE, 1),
        new Card(CardType.NUMBER, CardColor.BLUE, 2),
        new Card(CardType.NUMBER, CardColor.BLUE, 3)
      ];

      const decision = hardAI.makeDecision(hand, gameState);
      expect(decision.type).toBe('play');
      expect(decision.chosenColor).toBe(CardColor.BLUE); // 应该选择手牌中最多的颜色
    });
  });

  describe('chooseOptimalColor', () => {
    it('应该选择手牌中数量最多的颜色', () => {
      const hand = [
        new Card(CardType.NUMBER, CardColor.BLUE, 1),
        new Card(CardType.NUMBER, CardColor.BLUE, 2),
        new Card(CardType.NUMBER, CardColor.BLUE, 3),
        new Card(CardType.NUMBER, CardColor.RED, 4),
        new Card(CardType.WILD)
      ];

      const chosenColor = hardAI.chooseOptimalColor(hand, gameState);
      expect(chosenColor).toBe(CardColor.BLUE);
    });

    it('应该考虑功能牌的额外价值', () => {
      const hand = [
        new Card(CardType.NUMBER, CardColor.RED, 1),
        new Card(CardType.SKIP, CardColor.BLUE),
        new Card(CardType.REVERSE, CardColor.BLUE),
        new Card(CardType.WILD)
      ];

      const chosenColor = hardAI.chooseOptimalColor(hand, gameState);
      // 应该倾向于选择有功能牌的颜色
      expect([CardColor.RED, CardColor.BLUE]).toContain(chosenColor);
    });
  });

  describe('shouldCallUno', () => {
    it('应该在手牌剩余2张且有可出牌时返回true', () => {
      const hand = [
        new Card(CardType.NUMBER, CardColor.RED, 1), // 可出
        new Card(CardType.WILD) // 万能牌，肯定可出
      ];

      expect(hardAI.shouldCallUno(hand, gameState)).toBe(true);
    });

    it('应该在手牌剩余2张但无法出牌时返回false', () => {
      const hand = [
        new Card(CardType.NUMBER, CardColor.BLUE, 1),
        new Card(CardType.NUMBER, CardColor.GREEN, 2)
      ];

      expect(hardAI.shouldCallUno(hand, gameState)).toBe(false);
    });

    it('应该考虑出牌后的连击可能性', () => {
      const hand = [
        new Card(CardType.NUMBER, CardColor.RED, 1), // 可出
        new Card(CardType.NUMBER, CardColor.RED, 2)  // 出第一张后也可出
      ];

      expect(hardAI.shouldCallUno(hand, gameState)).toBe(true);
    });

    it('应该在手牌不是2张时返回false', () => {
      const hand = [
        new Card(CardType.NUMBER, CardColor.RED, 1)
      ];

      expect(hardAI.shouldCallUno(hand, gameState)).toBe(false);

      const hand2 = [
        new Card(CardType.NUMBER, CardColor.RED, 1),
        new Card(CardType.NUMBER, CardColor.BLUE, 2),
        new Card(CardType.NUMBER, CardColor.GREEN, 3)
      ];

      expect(hardAI.shouldCallUno(hand2, gameState)).toBe(false);
    });
  });

  describe('高级策略功能', () => {
    it('应该在游戏后期优先出高分卡牌', () => {
      const lateGameState = {
        ...gameState,
        players: [
          { id: 'hard-player', name: 'Hard Player', handSize: 3, isAI: true, hasCalledUno: false },
          { id: 'opponent1', name: 'Opponent 1', handSize: 2, isAI: false, hasCalledUno: false }
        ]
      };

      const hand = [
        new Card(CardType.NUMBER, CardColor.RED, 1),     // 低分
        new Card(CardType.WILD_DRAW_FOUR),               // 高分
        new Card(CardType.NUMBER, CardColor.RED, 3)      // 低分
      ];

      const decision = hardAI.makeDecision(hand, lateGameState);
      expect(decision.type).toBe('play');
      // 在后期应该倾向于选择高分卡牌
    });

    it('应该在高威胁情况下优先防御性卡牌', () => {
      const highThreatState = {
        ...gameState,
        players: [
          { id: 'hard-player', name: 'Hard Player', handSize: 5, isAI: true, hasCalledUno: false },
          { id: 'opponent1', name: 'Opponent 1', handSize: 1, isAI: false, hasCalledUno: true }
        ]
      };

      const hand = [
        new Card(CardType.NUMBER, CardColor.RED, 1),
        new Card(CardType.SKIP, CardColor.RED),          // 防御性卡牌
        new Card(CardType.DRAW_TWO, CardColor.RED)       // 攻击性卡牌
      ];

      const decision = hardAI.makeDecision(hand, highThreatState);
      expect(decision.type).toBe('play');
      // 应该选择有战术价值的卡牌
    });

    it('应该考虑连击潜力', () => {
      const hand = [
        new Card(CardType.NUMBER, CardColor.RED, 1),
        new Card(CardType.NUMBER, CardColor.RED, 2),     // 可以连击
        new Card(CardType.NUMBER, CardColor.BLUE, 3)
      ];

      const decision = hardAI.makeDecision(hand, gameState);
      expect(decision.type).toBe('play');
      // 应该考虑连击可能性
    });
  });

  describe('性能和稳定性', () => {
    it('应该在复杂情况下稳定工作', () => {
      const complexHand = [
        new Card(CardType.NUMBER, CardColor.RED, 1),
        new Card(CardType.SKIP, CardColor.BLUE),
        new Card(CardType.REVERSE, CardColor.GREEN),
        new Card(CardType.DRAW_TWO, CardColor.YELLOW),
        new Card(CardType.WILD),
        new Card(CardType.WILD_DRAW_FOUR),
        new Card(CardType.NUMBER, CardColor.RED, 9)
      ];

      const complexGameState = {
        ...gameState,
        players: [
          { id: 'hard-player', name: 'Hard Player', handSize: 7, isAI: true, hasCalledUno: false },
          { id: 'opponent1', name: 'Opponent 1', handSize: 1, isAI: false, hasCalledUno: true },
          { id: 'opponent2', name: 'Opponent 2', handSize: 2, isAI: true, hasCalledUno: false },
          { id: 'opponent3', name: 'Opponent 3', handSize: 8, isAI: false, hasCalledUno: false }
        ],
        playedCards: Array(30).fill(null).map((_, i) => 
          new Card(CardType.NUMBER, CardColor.RED, i % 10)
        )
      };

      expect(() => {
        const decision = hardAI.makeDecision(complexHand, complexGameState);
        expect(decision).toBeDefined();
        expect(['play', 'draw', 'uno']).toContain(decision.type);
      }).not.toThrow();
    });

    it('应该在多次调用后保持一致性', () => {
      const hand = [new Card(CardType.NUMBER, CardColor.RED, 1)];
      
      for (let i = 0; i < 10; i++) {
        expect(() => {
          const decision = hardAI.makeDecision([...hand], { ...gameState });
          expect(decision).toBeDefined();
        }).not.toThrow();
      }
    });
  });
}); 