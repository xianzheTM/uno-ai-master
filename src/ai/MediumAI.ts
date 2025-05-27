import { AIStrategy, AIDecision, GameStateInfo } from './AIStrategy';
import { Card } from '@/game';
import { CardColor, CardType } from '@/types';

/**
 * 中等AI策略
 * 特点：
 * - 考虑卡牌价值和战略意义
 * - 优先使用功能牌
 * - 智能的颜色选择
 * - 考虑对手威胁
 * - 更好的UNO时机判断
 */
export class MediumAI extends AIStrategy {
  constructor(playerId: string) {
    super('medium', playerId);
  }

  /**
   * 做出决策
   */
  makeDecision(hand: Card[], gameState: GameStateInfo): AIDecision {
    // 检查是否需要叫UNO
    if (this.shouldCallUno(hand, gameState)) {
      return {
        type: 'uno',
        confidence: 1.0,
        reasoning: '手牌数量少，需要叫UNO',
      };
    }

    // 获取可打出的卡牌
    const validIndices = this.getValidCardIndices(hand, gameState.currentCard, gameState.currentColor);

    if (validIndices.length === 0) {
      return {
        type: 'draw',
        confidence: 1.0,
        reasoning: '没有可打出的卡牌',
      };
    }

    // 分析对手威胁
    const threatLevel = this.analyzeOpponentThreat(gameState);

    // 评估每张可打出的卡牌
    const cardEvaluations = validIndices.map(index => {
      const card = hand[index];
      const value = this.evaluateCard(card, hand, gameState, threatLevel);
      return { index, card, value };
    });

    // 按价值排序
    cardEvaluations.sort((a, b) => b.value - a.value);

    // 选择价值最高的卡牌
    const bestCard = cardEvaluations[0];
    let chosenColor: CardColor | undefined;

    if (bestCard.card.isWildCard()) {
      chosenColor = this.chooseColor(hand, gameState);
    }

    return {
      type: 'play',
      cardIndex: bestCard.index,
      chosenColor,
      confidence: 0.8,
      reasoning: `选择价值最高的卡牌: ${bestCard.card.toString()}, 价值: ${bestCard.value}`,
    };
  }

  /**
   * 评估卡牌价值
   */
  private evaluateCard(card: Card, hand: Card[], gameState: GameStateInfo, threatLevel: number): number {
    let value = this.calculateCardValue(card, hand, gameState);

    // 功能牌额外加分
    if (card.isActionCard()) {
      value += this.evaluateActionCard(card, gameState, threatLevel);
    }

    // 万能牌额外加分
    if (card.isWildCard()) {
      value += this.evaluateWildCard(card, hand, gameState, threatLevel);
    }

    // 如果手牌很少，优先打出高分卡牌
    if (hand.length <= 3) {
      const cardPoints = this.getCardPoints(card);
      value += cardPoints * 2;
    }

    // 如果对手威胁很高，优先使用攻击性卡牌
    if (threatLevel > 50) {
      if (card.type === CardType.SKIP || 
          card.type === CardType.REVERSE || 
          card.type === CardType.DRAW_TWO ||
          card.type === CardType.WILD_DRAW_FOUR) {
        value += 30;
      }
    }

    return value;
  }

  /**
   * 评估功能牌价值
   */
  private evaluateActionCard(card: Card, gameState: GameStateInfo, threatLevel: number): number {
    let value = 0;
    const cardType = card.type;

    switch (cardType) {
      case CardType.SKIP:
        // 跳过下一个玩家，在对手威胁高时很有用
        value += threatLevel > 30 ? 25 : 15;
        break;

      case CardType.REVERSE:
        // 改变方向，可以打乱对手节奏
        value += 20;
        // 如果只有3个玩家，REVERSE等同于SKIP
        if (gameState.players.length === 3) {
          value += threatLevel > 30 ? 25 : 15;
        }
        break;

      case CardType.DRAW_TWO:
        // 让下一个玩家摸2张牌
        value += threatLevel > 40 ? 35 : 25;
        break;
    }

    return value;
  }

  /**
   * 评估万能牌价值
   */
  private evaluateWildCard(card: Card, hand: Card[], _gameState: GameStateInfo, threatLevel: number): number {
    let value = 0;
    const cardType = card.type;

    switch (cardType) {
      case CardType.WILD:
        // 普通万能牌，可以改变颜色
        value += 40;
        break;

      case CardType.WILD_DRAW_FOUR:
        // 最强的攻击牌
        value += threatLevel > 30 ? 60 : 45;
        break;
    }

    // 如果手牌中某种颜色很少，万能牌更有价值
    const colorCounts = this.getColorCounts(hand);
    const minColorCount = Math.min(...Object.values(colorCounts));
    if (minColorCount === 0) {
      value += 20;
    }

    return value;
  }

  /**
   * 获取卡牌分数
   */
  private getCardPoints(card: Card): number {
    if (card.type === CardType.NUMBER) {
      return this.gameRules.scoring.numberCardPoints ? (card.value ?? 0) : 0;
    }

    switch (card.type) {
      case CardType.SKIP:
      case CardType.REVERSE:
      case CardType.DRAW_TWO:
        return this.gameRules.scoring.specialCardPoints;
      case CardType.WILD:
      case CardType.WILD_DRAW_FOUR:
        return this.gameRules.scoring.wildCardPoints;
      default:
        return 0;
    }
  }

  /**
   * 选择颜色（万能牌）
   */
  chooseColor(hand: Card[], _gameState: GameStateInfo): CardColor {
    const colorCounts = this.getColorCounts(hand);

    // 策略1: 选择手牌中数量最多的颜色
    let maxCount = 0;
    let bestColor = CardColor.RED;

    for (const [color, count] of Object.entries(colorCounts)) {
      if (count > maxCount) {
        maxCount = count;
        bestColor = color as CardColor;
      }
    }

    // 策略2: 如果数量相同，考虑功能牌
    if (maxCount > 0) {
      const colorsWithMaxCount = Object.entries(colorCounts)
        .filter(([, count]) => count === maxCount)
        .map(([color]) => color as CardColor);

      if (colorsWithMaxCount.length > 1) {
        // 优先选择有功能牌的颜色
        for (const color of colorsWithMaxCount) {
          const hasActionCard = hand.some(card => 
            card.color === color && card.isActionCard()
          );
          if (hasActionCard) {
            bestColor = color;
            break;
          }
        }
      }
    }

    // 策略3: 如果没有任何颜色的牌，随机选择
    if (maxCount === 0) {
      const colors = [CardColor.RED, CardColor.YELLOW, CardColor.GREEN, CardColor.BLUE];
      bestColor = colors[Math.floor(Math.random() * colors.length)];
    }

    return bestColor;
  }

  /**
   * 获取各颜色卡牌数量
   */
  private getColorCounts(hand: Card[]): Partial<Record<CardColor, number>> {
    const colorCounts: Partial<Record<CardColor, number>> = {
      [CardColor.RED]: 0,
      [CardColor.YELLOW]: 0,
      [CardColor.GREEN]: 0,
      [CardColor.BLUE]: 0,
    };

    for (const card of hand) {
      if (!card.isWildCard()) {
        const color = card.color;
        if (color !== CardColor.WILD) {
          colorCounts[color] = (colorCounts[color] || 0) + 1;
        }
      }
    }

    return colorCounts;
  }

  /**
   * 是否应该叫UNO
   */
  shouldCallUno(hand: Card[], gameState: GameStateInfo): boolean {
    // 中等AI在手牌剩余2张时叫UNO
    // 但会考虑当前是否能出牌
    if (hand.length !== 2) {
      return false;
    }

    // 检查是否有可打出的牌
    const validIndices = this.getValidCardIndices(hand, gameState.currentCard, gameState.currentColor);
    return validIndices.length > 0;
  }
} 