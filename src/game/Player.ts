import { Card } from './Card';
import { Player as PlayerType, PlayerType as PlayerTypeEnum, AIDifficulty, PlayerStatus } from '../types';

/**
 * UNO玩家类
 * 管理玩家的手牌、状态和游戏行为
 */
export class Player implements PlayerType {
  public readonly id: string;
  public readonly name: string;
  public readonly type: PlayerTypeEnum;
  public readonly aiDifficulty?: AIDifficulty;
  public hand: Card[] = [];
  public hasCalledUno: boolean = false;
  public score: number = 0;
  public readonly isAI: boolean;
  public status: PlayerStatus = PlayerStatus.WAITING;

  constructor(
    id: string,
    name: string,
    type: PlayerTypeEnum,
    aiDifficulty?: AIDifficulty
  ) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.aiDifficulty = aiDifficulty;
    this.isAI = type === PlayerTypeEnum.AI;
  }

  /**
   * 添加卡牌到手牌
   */
  addCard(card: Card): void {
    this.hand.push(card);
    this.resetUnoCall(); // 拿牌后重置UNO状态
  }

  /**
   * 添加多张卡牌到手牌
   */
  addCards(cards: Card[]): void {
    this.hand.push(...cards);
    this.resetUnoCall(); // 拿牌后重置UNO状态
  }

  /**
   * 出牌
   */
  playCard(cardId: string): Card | null {
    const cardIndex = this.hand.findIndex(card => card.id === cardId);
    if (cardIndex === -1) {
      return null;
    }

    const card = this.hand.splice(cardIndex, 1)[0];
    
    // 如果手牌只剩1张，自动调用UNO
    if (this.hand.length === 1) {
      this.callUno();
    }

    return card;
  }

  /**
   * 检查是否可以出指定的牌
   */
  canPlayCard(cardId: string, currentCard: Card): boolean {
    const card = this.hand.find(c => c.id === cardId);
    if (!card) {
      return false;
    }
    return card.canPlayOn(currentCard);
  }

  /**
   * 获取可以出的牌
   */
  getPlayableCards(currentCard: Card): Card[] {
    return this.hand.filter(card => card.canPlayOn(currentCard));
  }

  /**
   * 检查是否有可以出的牌
   */
  hasPlayableCard(currentCard: Card): boolean {
    return this.getPlayableCards(currentCard).length > 0;
  }

  /**
   * 调用UNO
   */
  callUno(): void {
    this.hasCalledUno = true;
  }

  /**
   * 重置UNO调用状态
   */
  resetUnoCall(): void {
    this.hasCalledUno = false;
  }

  /**
   * 检查是否需要调用UNO（手牌剩余1张且未调用）
   */
  shouldCallUno(): boolean {
    return this.hand.length === 1 && !this.hasCalledUno;
  }

  /**
   * 检查是否违反了UNO规则（手牌剩余1张但未调用UNO）
   */
  hasUnoViolation(): boolean {
    return this.hand.length === 1 && !this.hasCalledUno;
  }

  /**
   * 获取手牌数量
   */
  getHandCount(): number {
    return this.hand.length;
  }

  /**
   * 检查是否已经获胜（手牌为空）
   */
  hasWon(): boolean {
    return this.hand.length === 0;
  }

  /**
   * 计算手牌总分
   */
  calculateHandScore(): number {
    return this.hand.reduce((total, card) => total + card.getPoints(), 0);
  }

  /**
   * 添加分数
   */
  addScore(points: number): void {
    this.score += points;
  }

  /**
   * 重置分数
   */
  resetScore(): void {
    this.score = 0;
  }

  /**
   * 清空手牌
   */
  clearHand(): void {
    this.hand = [];
    this.resetUnoCall();
  }

  /**
   * 检查是否为人类玩家
   */
  isHuman(): boolean {
    return this.type === PlayerTypeEnum.HUMAN;
  }

  /**
   * 获取手牌的副本
   */
  getHandCopy(): Card[] {
    return this.hand.map(card => card.clone());
  }

  /**
   * 按颜色分组手牌
   */
  getHandByColor(): Record<string, Card[]> {
    const grouped: Record<string, Card[]> = {
      red: [],
      yellow: [],
      green: [],
      blue: [],
      wild: []
    };

    this.hand.forEach(card => {
      const color = card.color || 'wild';
      grouped[color].push(card);
    });

    return grouped;
  }

  /**
   * 按类型分组手牌
   */
  getHandByType(): Record<string, Card[]> {
    const grouped: Record<string, Card[]> = {
      number: [],
      skip: [],
      reverse: [],
      draw_two: [],
      wild: [],
      wild_draw_four: []
    };

    this.hand.forEach(card => {
      grouped[card.type].push(card);
    });

    return grouped;
  }

  /**
   * 获取手牌统计信息
   */
  getHandStatistics(): {
    total: number;
    numberCards: number;
    actionCards: number;
    wildCards: number;
    byColor: Record<string, number>;
    totalPoints: number;
  } {
    const stats = {
      total: this.hand.length,
      numberCards: 0,
      actionCards: 0,
      wildCards: 0,
      byColor: {} as Record<string, number>,
      totalPoints: 0
    };

    this.hand.forEach(card => {
      if (card.isNumberCard()) {
        stats.numberCards++;
      } else if (card.isActionCard()) {
        stats.actionCards++;
      } else if (card.isWildCard()) {
        stats.wildCards++;
      }

      const color = card.color || 'wild';
      stats.byColor[color] = (stats.byColor[color] || 0) + 1;
      stats.totalPoints += card.getPoints();
    });

    return stats;
  }

  /**
   * 检查手牌中是否有指定颜色的牌
   */
  hasColor(color: string): boolean {
    return this.hand.some(card => card.color === color);
  }

  /**
   * 检查手牌中是否有万能牌
   */
  hasWildCard(): boolean {
    return this.hand.some(card => card.isWildCard());
  }

  /**
   * 获取手牌中的万能牌
   */
  getWildCards(): Card[] {
    return this.hand.filter(card => card.isWildCard());
  }

  /**
   * 创建玩家的副本（不包括手牌）
   */
  clone(): Player {
    const clonedPlayer = new Player(this.id, this.name, this.type, this.aiDifficulty);
    clonedPlayer.score = this.score;
    clonedPlayer.hasCalledUno = this.hasCalledUno;
    clonedPlayer.hand = this.hand.map(card => card.clone());
    return clonedPlayer;
  }

  /**
   * 转换为JSON对象
   */
  toJSON(): PlayerType {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      aiDifficulty: this.aiDifficulty,
      hand: this.hand.map(card => card.toJSON()),
      hasCalledUno: this.hasCalledUno,
      score: this.score,
      isAI: this.isAI,
      status: this.status
    };
  }

  /**
   * 从JSON对象创建Player实例
   */
  static fromJSON(json: PlayerType): Player {
    const player = new Player(json.id, json.name, json.type, json.aiDifficulty);
    player.hand = json.hand.map(cardData => Card.fromJSON(cardData));
    player.hasCalledUno = json.hasCalledUno;
    player.score = json.score;
    return player;
  }
} 