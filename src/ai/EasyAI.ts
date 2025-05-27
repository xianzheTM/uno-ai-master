import { AIStrategy, AIDecision, GameStateInfo } from './AIStrategy';
import { Card } from '../game/Card';
import { CardColor } from '../types/Card';

/**
 * 简单AI策略
 * 特点：
 * - 随机选择可打出的卡牌
 * - 简单的颜色选择逻辑
 * - 基础的UNO判断
 * - 不考虑复杂的战略
 */
export class EasyAI extends AIStrategy {
  constructor(playerId: string) {
    super('easy', playerId);
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
      // 没有可打出的卡牌，选择摸牌
      return {
        type: 'draw',
        confidence: 1.0,
        reasoning: '没有可打出的卡牌',
      };
    }

    // 随机选择一张可打出的卡牌
    const randomIndex = Math.floor(Math.random() * validIndices.length);
    const cardIndex = validIndices[randomIndex];
    const selectedCard = hand[cardIndex];

    let chosenColor: CardColor | undefined;
    if (selectedCard.isWild()) {
      chosenColor = this.chooseColor(hand, gameState);
    }

    return {
      type: 'play',
      cardIndex,
      chosenColor,
      confidence: 0.6, // 简单AI信心度较低
      reasoning: `随机选择卡牌: ${selectedCard.toString()}`,
    };
  }

  /**
   * 选择颜色（万能牌）
   */
  chooseColor(hand: Card[], gameState: GameStateInfo): CardColor {
    // 统计手牌中各颜色的数量
    const colorCounts: Record<CardColor, number> = {
      [CardColor.RED]: 0,
      [CardColor.YELLOW]: 0,
      [CardColor.GREEN]: 0,
      [CardColor.BLUE]: 0,
    };

    // 只统计非万能牌的颜色
    for (const card of hand) {
      if (!card.isWild()) {
        const color = card.getColor();
        if (color !== CardColor.WILD) {
          colorCounts[color]++;
        }
      }
    }

    // 找到数量最多的颜色
    let maxCount = 0;
    let bestColor = CardColor.RED;

    for (const [color, count] of Object.entries(colorCounts)) {
      if (count > maxCount) {
        maxCount = count;
        bestColor = color as CardColor;
      }
    }

    // 如果所有颜色数量相同，随机选择
    if (maxCount === 0) {
      const colors = [CardColor.RED, CardColor.YELLOW, CardColor.GREEN, CardColor.BLUE];
      bestColor = colors[Math.floor(Math.random() * colors.length)];
    }

    return bestColor;
  }

  /**
   * 是否应该叫UNO
   */
  shouldCallUno(hand: Card[], gameState: GameStateInfo): boolean {
    // 简单AI在手牌剩余2张时叫UNO
    return hand.length === 2;
  }
} 