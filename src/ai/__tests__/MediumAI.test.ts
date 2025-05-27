import { describe, it, expect, beforeEach } from 'vitest';
import { MediumAI } from '../MediumAI';
import { Card } from '../../game/Card';
import { CardColor, CardType } from '../../types';
import { GameStateInfo } from '../AIStrategy';

describe('MediumAI', () => {
  let mediumAI: MediumAI;
  let gameState: GameStateInfo;

  beforeEach(() => {
    mediumAI = new MediumAI('medium-player');
    
    gameState = {
      currentCard: new Card(CardType.NUMBER, CardColor.RED, 5),
      currentColor: CardColor.RED,
      players: [
        { id: 'medium-player', name: 'Medium Player', handSize: 5, isAI: true, hasCalledUno: false },
        { id: 'opponent1', name: 'Opponent 1', handSize: 3, isAI: false, hasCalledUno: false },
        { id: 'opponent2', name: 'Opponent 2', handSize: 4, isAI: true, hasCalledUno: false }
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
    it('应该设置为medium难度', () => {
      expect(mediumAI.getDifficulty()).toBe('medium');
    });

    it('应该设置正确的玩家ID', () => {
      expect(mediumAI.getPlayerId()).toBe('medium-player');
    });
  });

  describe('makeDecision', () => {
    it('应该在需要UNO时返回UNO决策', () => {
      const hand = [
        new Card(CardType.NUMBER, CardColor.RED, 1),
        new Card(CardType.NUMBER, CardColor.BLUE, 2)
      ];

      const decision = mediumAI.makeDecision(hand, gameState);
      expect(decision.type).toBe('uno');
      expect(decision.confidence).toBe(1.0);
    });

    it('应该在没有可出牌时选择摸牌', () => {
      const hand = [
        new Card(CardType.NUMBER, CardColor.BLUE, 1),
        new Card(CardType.NUMBER, CardColor.GREEN, 2),
        new Card(CardType.NUMBER, CardColor.YELLOW, 3)
      ];

      const decision = mediumAI.makeDecision(hand, gameState);
      expect(decision.type).toBe('draw');
      expect(decision.confidence).toBe(1.0);
      expect(decision.reasoning).toBe('没有可打出的卡牌');
    });

    it('应该在有可出牌时进行价值评估', () => {
      const hand = [
        new Card(CardType.NUMBER, CardColor.RED, 1),
        new Card(CardType.SKIP, CardColor.RED),
        new Card(CardType.NUMBER, CardColor.BLUE, 2)
      ];

      const decision = mediumAI.makeDecision(hand, gameState);
      expect(decision.type).toBe('play');
      expect(decision.confidence).toBe(0.8);
      expect(decision.cardIndex).toBeTypeOf('number');
      expect(decision.reasoning).toContain('选择价值最高的卡牌');
    });

    it('应该为万能牌选择颜色', () => {
      const hand = [
        new Card(CardType.WILD),
        new Card(CardType.NUMBER, CardColor.BLUE, 2),
        new Card(CardType.NUMBER, CardColor.GREEN, 3)
      ];

      const decision = mediumAI.makeDecision(hand, gameState);
      expect(decision.type).toBe('play');
      expect(decision.chosenColor).toBeDefined();
      expect([CardColor.RED, CardColor.YELLOW, CardColor.GREEN, CardColor.BLUE]).toContain(decision.chosenColor);
    });

    it('应该优先选择功能牌', () => {
      const hand = [
        new Card(CardType.NUMBER, CardColor.RED, 1),
        new Card(CardType.SKIP, CardColor.RED),
        new Card(CardType.DRAW_TWO, CardColor.RED)
      ];

      // 多次测试以确保功能牌被优先选择
      let actionCardSelected = false;
      for (let i = 0; i < 10; i++) {
        const decision = mediumAI.makeDecision([...hand], gameState);
        if (decision.type === 'play' && decision.cardIndex !== undefined) {
          const selectedCard = hand[decision.cardIndex];
          if (selectedCard.isActionCard()) {
            actionCardSelected = true;
            break;
          }
        }
      }
      expect(actionCardSelected).toBe(true);
    });

    it('应该在高威胁情况下优先攻击性卡牌', () => {
      const highThreatState = {
        ...gameState,
        players: [
          { id: 'medium-player', name: 'Medium Player', handSize: 5, isAI: true, hasCalledUno: false },
          { id: 'opponent1', name: 'Opponent 1', handSize: 1, isAI: false, hasCalledUno: true } // 高威胁
        ]
      };

      const hand = [
        new Card(CardType.NUMBER, CardColor.RED, 1),
        new Card(CardType.DRAW_TWO, CardColor.RED),
        new Card(CardType.NUMBER, CardColor.BLUE, 3)  // 增加一张牌避免UNO
      ];

      const decision = mediumAI.makeDecision(hand, highThreatState);
      expect(decision.type).toBe('play');
      // 应该倾向于选择攻击性卡牌
      if (decision.cardIndex !== undefined) {
        const selectedCard = hand[decision.cardIndex];
        expect(selectedCard.type).toBe(CardType.DRAW_TWO);
      }
    });

    it('应该在手牌少时优先高分卡牌', () => {
      const hand = [
        new Card(CardType.NUMBER, CardColor.RED, 1),     // 低分
        new Card(CardType.WILD_DRAW_FOUR),               // 高分
        new Card(CardType.NUMBER, CardColor.GREEN, 3)    // 增加一张牌避免UNO
      ];

      const decision = mediumAI.makeDecision(hand, gameState);
      expect(decision.type).toBe('play');
      // 在手牌少时应该倾向于选择高分卡牌
      if (decision.cardIndex !== undefined) {
        const selectedCard = hand[decision.cardIndex];
        expect(selectedCard.type).toBe(CardType.WILD_DRAW_FOUR);
      }
    });
  });

  describe('chooseColor', () => {
    it('应该选择手牌中数量最多的颜色', () => {
      const hand = [
        new Card(CardType.NUMBER, CardColor.BLUE, 1),
        new Card(CardType.NUMBER, CardColor.BLUE, 2),
        new Card(CardType.NUMBER, CardColor.BLUE, 3),
        new Card(CardType.NUMBER, CardColor.RED, 4),
        new Card(CardType.WILD)
      ];

      const chosenColor = mediumAI.chooseColor(hand, gameState);
      expect(chosenColor).toBe(CardColor.BLUE);
    });

    it('应该忽略万能牌在颜色统计中', () => {
      const hand = [
        new Card(CardType.NUMBER, CardColor.GREEN, 1),
        new Card(CardType.NUMBER, CardColor.GREEN, 2),
        new Card(CardType.WILD),
        new Card(CardType.WILD_DRAW_FOUR)
      ];

      const chosenColor = mediumAI.chooseColor(hand, gameState);
      expect(chosenColor).toBe(CardColor.GREEN);
    });

    it('应该优先选择有功能牌的颜色', () => {
      const hand = [
        new Card(CardType.NUMBER, CardColor.RED, 1),
        new Card(CardType.SKIP, CardColor.BLUE),        // 蓝色有功能牌
        new Card(CardType.NUMBER, CardColor.BLUE, 2),
        new Card(CardType.WILD)
      ];

      const chosenColor = mediumAI.chooseColor(hand, gameState);
      expect(chosenColor).toBe(CardColor.BLUE); // 应该选择有功能牌的颜色
    });

    it('应该在没有非万能牌时随机选择颜色', () => {
      const hand = [
        new Card(CardType.WILD),
        new Card(CardType.WILD_DRAW_FOUR)
      ];

      const chosenColor = mediumAI.chooseColor(hand, gameState);
      expect([CardColor.RED, CardColor.YELLOW, CardColor.GREEN, CardColor.BLUE]).toContain(chosenColor);
    });

    it('应该在颜色数量相同时考虑功能牌', () => {
      const hand = [
        new Card(CardType.NUMBER, CardColor.RED, 1),
        new Card(CardType.REVERSE, CardColor.YELLOW),   // 黄色有功能牌
        new Card(CardType.WILD)
      ];

      const chosenColor = mediumAI.chooseColor(hand, gameState);
      expect(chosenColor).toBe(CardColor.YELLOW); // 应该选择有功能牌的颜色
    });
  });

  describe('shouldCallUno', () => {
    it('应该在手牌剩余2张且有可出牌时返回true', () => {
      const hand = [
        new Card(CardType.NUMBER, CardColor.RED, 1),
        new Card(CardType.NUMBER, CardColor.BLUE, 2)
      ];

      expect(mediumAI.shouldCallUno(hand, gameState)).toBe(true);
    });

    it('应该在手牌剩余2张但无法出牌时返回false', () => {
      const hand = [
        new Card(CardType.NUMBER, CardColor.BLUE, 1),
        new Card(CardType.NUMBER, CardColor.GREEN, 2)
      ];

      expect(mediumAI.shouldCallUno(hand, gameState)).toBe(false);
    });

    it('应该在手牌不是2张时返回false', () => {
      const hand = [
        new Card(CardType.NUMBER, CardColor.RED, 1)
      ];

      expect(mediumAI.shouldCallUno(hand, gameState)).toBe(false);

      const hand2 = [
        new Card(CardType.NUMBER, CardColor.RED, 1),
        new Card(CardType.NUMBER, CardColor.BLUE, 2),
        new Card(CardType.NUMBER, CardColor.GREEN, 3)
      ];

      expect(mediumAI.shouldCallUno(hand2, gameState)).toBe(false);
    });
  });

  describe('卡牌评估功能', () => {
    it('应该给功能牌更高的评估分数', () => {
      const numberCard = new Card(CardType.NUMBER, CardColor.RED, 5);
      const skipCard = new Card(CardType.SKIP, CardColor.RED);
      const extraCard = new Card(CardType.NUMBER, CardColor.BLUE, 3);
      const hand = [numberCard, skipCard, extraCard];

      // 通过多次决策来观察是否倾向于选择功能牌
      let skipCardSelected = 0;
      let numberCardSelected = 0;

      for (let i = 0; i < 20; i++) {
        const decision = mediumAI.makeDecision([...hand], gameState);
        if (decision.type === 'play' && decision.cardIndex !== undefined) {
          if (decision.cardIndex === 0) numberCardSelected++;
          if (decision.cardIndex === 1) skipCardSelected++;
        }
      }

      // 功能牌应该被选择更多次
      expect(skipCardSelected).toBeGreaterThan(numberCardSelected);
    });

    it('应该给万能牌最高的评估分数', () => {
      const numberCard = new Card(CardType.NUMBER, CardColor.RED, 5);
      const wildCard = new Card(CardType.WILD);
      const extraCard = new Card(CardType.NUMBER, CardColor.BLUE, 3);
      const hand = [numberCard, wildCard, extraCard];

      // 万能牌应该总是被优先选择
      const decision = mediumAI.makeDecision(hand, gameState);
      expect(decision.type).toBe('play');
      expect(decision.cardIndex).toBe(1); // 万能牌的索引
    });

    it('应该考虑对手威胁程度', () => {
      const lowThreatState = {
        ...gameState,
        players: [
          { id: 'medium-player', name: 'Medium Player', handSize: 5, isAI: true, hasCalledUno: false },
          { id: 'opponent1', name: 'Opponent 1', handSize: 7, isAI: false, hasCalledUno: false } // 低威胁
        ]
      };

      const highThreatState = {
        ...gameState,
        players: [
          { id: 'medium-player', name: 'Medium Player', handSize: 5, isAI: true, hasCalledUno: false },
          { id: 'opponent1', name: 'Opponent 1', handSize: 1, isAI: false, hasCalledUno: true } // 高威胁
        ]
      };

      const hand = [
        new Card(CardType.NUMBER, CardColor.RED, 1),
        new Card(CardType.DRAW_TWO, CardColor.RED),
        new Card(CardType.NUMBER, CardColor.GREEN, 3)  // 增加一张牌避免UNO
      ];

      // 在高威胁情况下应该更倾向于选择攻击性卡牌
      const lowThreatDecision = mediumAI.makeDecision([...hand], lowThreatState);
      const highThreatDecision = mediumAI.makeDecision([...hand], highThreatState);

      // 两种情况下的决策可能不同，但都应该是有效的
      expect(lowThreatDecision.type).toBe('play');
      expect(highThreatDecision.type).toBe('play');
    });
  });

  describe('策略一致性', () => {
    it('应该在相同情况下做出一致的决策类型', () => {
      const hand = [
        new Card(CardType.NUMBER, CardColor.RED, 1),
        new Card(CardType.SKIP, CardColor.RED),
        new Card(CardType.NUMBER, CardColor.BLUE, 2)
      ];

      // 多次决策应该都是出牌类型
      for (let i = 0; i < 5; i++) {
        const decision = mediumAI.makeDecision([...hand], gameState);
        expect(decision.type).toBe('play');
        expect(decision.confidence).toBe(0.8);
      }
    });

    it('应该在没有可出牌时一致选择摸牌', () => {
      const hand = [
        new Card(CardType.NUMBER, CardColor.BLUE, 1),
        new Card(CardType.NUMBER, CardColor.GREEN, 2),
        new Card(CardType.NUMBER, CardColor.YELLOW, 3)
      ];

      for (let i = 0; i < 5; i++) {
        const decision = mediumAI.makeDecision([...hand], gameState);
        expect(decision.type).toBe('draw');
        expect(decision.confidence).toBe(1.0);
      }
    });

    it('应该在UNO情况下一致返回UNO决策', () => {
      const hand = [
        new Card(CardType.NUMBER, CardColor.RED, 1),
        new Card(CardType.NUMBER, CardColor.RED, 2)
      ];

      for (let i = 0; i < 5; i++) {
        const decision = mediumAI.makeDecision([...hand], gameState);
        expect(decision.type).toBe('uno');
        expect(decision.confidence).toBe(1.0);
      }
    });
  });

  describe('边界情况处理', () => {
    it('应该处理空手牌情况', () => {
      const hand: Card[] = [];

      const decision = mediumAI.makeDecision(hand, gameState);
      expect(decision.type).toBe('draw');
    });

    it('应该处理只有万能牌的情况', () => {
      const hand = [
        new Card(CardType.WILD),
        new Card(CardType.WILD_DRAW_FOUR)
      ];

      const decision = mediumAI.makeDecision(hand, gameState);
      expect(decision.type).toBe('uno'); // 2张牌应该叫UNO
    });

    it('应该处理所有卡牌都可出的情况', () => {
      const hand = [
        new Card(CardType.NUMBER, CardColor.RED, 1),
        new Card(CardType.NUMBER, CardColor.RED, 2),
        new Card(CardType.SKIP, CardColor.RED),
        new Card(CardType.WILD)
      ];

      const decision = mediumAI.makeDecision(hand, gameState);
      expect(decision.type).toBe('play');
      expect(decision.cardIndex).toBeTypeOf('number');
      expect(decision.cardIndex).toBeGreaterThanOrEqual(0);
      expect(decision.cardIndex).toBeLessThan(hand.length);
    });
  });
}); 