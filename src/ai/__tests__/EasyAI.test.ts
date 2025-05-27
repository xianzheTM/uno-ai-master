import { describe, it, expect, beforeEach } from 'vitest';
import { EasyAI } from '../EasyAI';
import { Card } from '../../game/Card';
import { CardColor, CardType } from '../../types';
import { GameStateInfo } from '../AIStrategy';

describe('EasyAI', () => {
  let easyAI: EasyAI;
  let gameState: GameStateInfo;

  beforeEach(() => {
    easyAI = new EasyAI('easy-player');
    
    gameState = {
      currentCard: new Card(CardType.NUMBER, CardColor.RED, 5),
      currentColor: CardColor.RED,
      players: [
        { id: 'easy-player', name: 'Easy Player', handSize: 5, isAI: true, hasCalledUno: false },
        { id: 'opponent1', name: 'Opponent 1', handSize: 3, isAI: false, hasCalledUno: false }
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
    it('应该设置为easy难度', () => {
      expect(easyAI.getDifficulty()).toBe('easy');
    });

    it('应该设置正确的玩家ID', () => {
      expect(easyAI.getPlayerId()).toBe('easy-player');
    });
  });

  describe('makeDecision', () => {
    it('应该在需要UNO时返回UNO决策', () => {
      const hand = [
        new Card(CardType.NUMBER, CardColor.RED, 1),
        new Card(CardType.NUMBER, CardColor.BLUE, 2)
      ];

      const decision = easyAI.makeDecision(hand, gameState);
      expect(decision.type).toBe('uno');
      expect(decision.confidence).toBe(1.0);
    });

    it('应该在没有可出牌时选择摸牌', () => {
      const hand = [
        new Card(CardType.NUMBER, CardColor.BLUE, 1),
        new Card(CardType.NUMBER, CardColor.GREEN, 2),
        new Card(CardType.NUMBER, CardColor.YELLOW, 3)
      ];

      const decision = easyAI.makeDecision(hand, gameState);
      expect(decision.type).toBe('draw');
      expect(decision.confidence).toBe(1.0);
      expect(decision.reasoning).toBe('没有可打出的卡牌');
    });

    it('应该在有可出牌时选择出牌', () => {
      const hand = [
        new Card(CardType.NUMBER, CardColor.RED, 1),    // 可出
        new Card(CardType.NUMBER, CardColor.BLUE, 2),   // 不可出
        new Card(CardType.NUMBER, CardColor.RED, 3)     // 可出
      ];

      const decision = easyAI.makeDecision(hand, gameState);
      expect(decision.type).toBe('play');
      expect(decision.cardIndex).toBeTypeOf('number');
      expect([0, 2]).toContain(decision.cardIndex); // 应该选择可出的牌之一
      expect(decision.confidence).toBe(0.6);
    });

    it('应该为万能牌选择颜色', () => {
      const hand = [
        new Card(CardType.WILD),
        new Card(CardType.NUMBER, CardColor.BLUE, 2),
        new Card(CardType.NUMBER, CardColor.GREEN, 3)
      ];

      const decision = easyAI.makeDecision(hand, gameState);
      expect(decision.type).toBe('play');
      expect(decision.chosenColor).toBeDefined();
      expect(Object.values(CardColor)).toContain(decision.chosenColor);
    });
  });

  describe('chooseColor', () => {
    it('应该选择手牌中数量最多的颜色', () => {
      const hand = [
        new Card(CardType.NUMBER, CardColor.RED, 1),
        new Card(CardType.NUMBER, CardColor.RED, 2),
        new Card(CardType.NUMBER, CardColor.RED, 3),
        new Card(CardType.NUMBER, CardColor.BLUE, 4),
        new Card(CardType.WILD)
      ];

      const chosenColor = easyAI.chooseColor(hand, gameState);
      expect(chosenColor).toBe(CardColor.RED);
    });

    it('应该忽略万能牌在颜色统计中', () => {
      const hand = [
        new Card(CardType.NUMBER, CardColor.BLUE, 1),
        new Card(CardType.NUMBER, CardColor.BLUE, 2),
        new Card(CardType.WILD),
        new Card(CardType.WILD_DRAW_FOUR)
      ];

      const chosenColor = easyAI.chooseColor(hand, gameState);
      expect(chosenColor).toBe(CardColor.BLUE);
    });

    it('应该在没有非万能牌时随机选择颜色', () => {
      const hand = [
        new Card(CardType.WILD),
        new Card(CardType.WILD_DRAW_FOUR)
      ];

      const chosenColor = easyAI.chooseColor(hand, gameState);
      expect([CardColor.RED, CardColor.YELLOW, CardColor.GREEN, CardColor.BLUE]).toContain(chosenColor);
    });

    it('应该在颜色数量相同时选择有效颜色', () => {
      const hand = [
        new Card(CardType.NUMBER, CardColor.RED, 1),
        new Card(CardType.NUMBER, CardColor.BLUE, 2)
      ];

      const chosenColor = easyAI.chooseColor(hand, gameState);
      expect([CardColor.RED, CardColor.BLUE]).toContain(chosenColor);
    });
  });

  describe('shouldCallUno', () => {
    it('应该在手牌剩余2张时返回true', () => {
      const hand = [
        new Card(CardType.NUMBER, CardColor.RED, 1),
        new Card(CardType.NUMBER, CardColor.BLUE, 2)
      ];

      expect(easyAI.shouldCallUno(hand, gameState)).toBe(true);
    });

    it('应该在手牌不是2张时返回false', () => {
      const hand = [
        new Card(CardType.NUMBER, CardColor.RED, 1)
      ];

      expect(easyAI.shouldCallUno(hand, gameState)).toBe(false);

      const hand2 = [
        new Card(CardType.NUMBER, CardColor.RED, 1),
        new Card(CardType.NUMBER, CardColor.BLUE, 2),
        new Card(CardType.NUMBER, CardColor.GREEN, 3)
      ];

      expect(easyAI.shouldCallUno(hand2, gameState)).toBe(false);
    });
  });

  describe('决策一致性', () => {
    it('应该在相同情况下做出一致的决策类型', () => {
      const hand = [
        new Card(CardType.NUMBER, CardColor.RED, 1),
        new Card(CardType.NUMBER, CardColor.BLUE, 2),
        new Card(CardType.NUMBER, CardColor.GREEN, 3)
      ];

      // 多次决策应该都是出牌类型（因为有可出的红牌）
      for (let i = 0; i < 5; i++) {
        const decision = easyAI.makeDecision([...hand], gameState);
        expect(decision.type).toBe('play');
      }
    });

    it('应该在没有可出牌时一致选择摸牌', () => {
      const hand = [
        new Card(CardType.NUMBER, CardColor.BLUE, 1),
        new Card(CardType.NUMBER, CardColor.GREEN, 2),
        new Card(CardType.NUMBER, CardColor.YELLOW, 3)
      ];

      for (let i = 0; i < 5; i++) {
        const decision = easyAI.makeDecision([...hand], gameState);
        expect(decision.type).toBe('draw');
      }
    });
  });
}); 