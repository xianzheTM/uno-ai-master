import { Card } from './Card';
import { CardColor } from '../types';
import { shuffleArray } from '../utils/shuffleUtils';

/**
 * UNO牌堆类
 * 管理卡牌的生成、洗牌、发牌等功能
 */
export class Deck {
  private cards: Card[] = [];

  constructor(cards: Card[] = []) {
    this.cards = [...cards];
  }

  /**
   * 创建标准UNO牌堆
   */
  static createStandardDeck(): Deck {
    const cards: Card[] = [];
    const colors: CardColor[] = ['red', 'yellow', 'green', 'blue'];

    // 数字牌：每种颜色0-9，0只有1张，1-9每张2张
    colors.forEach(color => {
      // 0牌：每种颜色1张
      cards.push(new Card('number', color, 0));
      
      // 1-9牌：每种颜色每个数字2张
      for (let num = 1; num <= 9; num++) {
        cards.push(new Card('number', color, num));
        cards.push(new Card('number', color, num));
      }
    });

    // 功能牌：每种颜色每种功能牌2张
    colors.forEach(color => {
      // 跳过牌
      cards.push(new Card('skip', color));
      cards.push(new Card('skip', color));
      
      // 反转牌
      cards.push(new Card('reverse', color));
      cards.push(new Card('reverse', color));
      
      // +2牌
      cards.push(new Card('draw_two', color));
      cards.push(new Card('draw_two', color));
    });

    // 万能牌：4张
    for (let i = 0; i < 4; i++) {
      cards.push(new Card('wild'));
    }

    // 万能+4牌：4张
    for (let i = 0; i < 4; i++) {
      cards.push(new Card('wild_draw_four'));
    }

    return new Deck(cards);
  }

  /**
   * 洗牌
   */
  shuffle(): void {
    this.cards = shuffleArray(this.cards);
  }

  /**
   * 发一张牌
   */
  drawCard(): Card | null {
    return this.cards.pop() || null;
  }

  /**
   * 发多张牌
   */
  drawCards(count: number): Card[] {
    const drawnCards: Card[] = [];
    for (let i = 0; i < count && this.cards.length > 0; i++) {
      const card = this.drawCard();
      if (card) {
        drawnCards.push(card);
      }
    }
    return drawnCards;
  }

  /**
   * 添加一张牌到牌堆底部
   */
  addCard(card: Card): void {
    this.cards.unshift(card);
  }

  /**
   * 添加多张牌到牌堆底部
   */
  addCards(cards: Card[]): void {
    this.cards.unshift(...cards);
  }

  /**
   * 添加一张牌到牌堆顶部
   */
  addCardToTop(card: Card): void {
    this.cards.push(card);
  }

  /**
   * 获取牌堆中的卡牌数量
   */
  getCount(): number {
    return this.cards.length;
  }

  /**
   * 检查牌堆是否为空
   */
  isEmpty(): boolean {
    return this.cards.length === 0;
  }

  /**
   * 查看牌堆顶部的牌（不移除）
   */
  peek(): Card | null {
    return this.cards[this.cards.length - 1] || null;
  }

  /**
   * 查看牌堆底部的牌（不移除）
   */
  peekBottom(): Card | null {
    return this.cards[0] || null;
  }

  /**
   * 获取所有卡牌的副本
   */
  getAllCards(): Card[] {
    return [...this.cards];
  }

  /**
   * 清空牌堆
   */
  clear(): void {
    this.cards = [];
  }

  /**
   * 重新填充牌堆（从弃牌堆）
   * 保留弃牌堆顶部的牌作为当前牌
   */
  refillFromDiscardPile(discardPile: Card[]): void {
    if (discardPile.length <= 1) {
      return; // 弃牌堆没有足够的牌来重新填充
    }

    // 取除了顶部牌之外的所有牌
    const cardsToRefill = discardPile.slice(0, -1);
    
    // 重置万能牌的颜色
    const resetCards = cardsToRefill.map(card => {
      if (card.isWildCard()) {
        return new Card(card.type, null, card.value);
      }
      return card.clone();
    });

    // 添加到牌堆并洗牌
    this.addCards(resetCards);
    this.shuffle();
  }

  /**
   * 检查牌堆中是否包含指定卡牌
   */
  contains(targetCard: Card): boolean {
    return this.cards.some(card => card.equals(targetCard));
  }

  /**
   * 移除指定的卡牌
   */
  removeCard(targetCard: Card): boolean {
    const index = this.cards.findIndex(card => card.equals(targetCard));
    if (index !== -1) {
      this.cards.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * 获取牌堆的统计信息
   */
  getStatistics(): {
    total: number;
    numberCards: number;
    actionCards: number;
    wildCards: number;
    byColor: Record<string, number>;
  } {
    const stats = {
      total: this.cards.length,
      numberCards: 0,
      actionCards: 0,
      wildCards: 0,
      byColor: {} as Record<string, number>
    };

    this.cards.forEach(card => {
      if (card.isNumberCard()) {
        stats.numberCards++;
      } else if (card.isActionCard()) {
        stats.actionCards++;
      } else if (card.isWildCard()) {
        stats.wildCards++;
      }

      const color = card.color || 'wild';
      stats.byColor[color] = (stats.byColor[color] || 0) + 1;
    });

    return stats;
  }

  /**
   * 创建牌堆的副本
   */
  clone(): Deck {
    const clonedCards = this.cards.map(card => card.clone());
    return new Deck(clonedCards);
  }
} 