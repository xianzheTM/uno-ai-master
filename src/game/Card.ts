import { Card as CardType, CardColor, CardType as CardTypeEnum } from '../types';

/**
 * UNO卡牌类
 * 实现卡牌的基础功能和匹配逻辑
 */
export class Card implements CardType {
  public readonly id: string;
  public readonly type: CardTypeEnum;
  public readonly color: CardColor;
  public readonly value?: number;

  constructor(type: CardTypeEnum, color: CardColor = CardColor.WILD, value?: number) {
    this.type = type;
    this.color = color;
    this.value = value;
    this.id = this.generateId();
  }

  /**
   * 生成唯一的卡牌ID
   */
  private generateId(): string {
    const typeStr = this.type;
    const colorStr = this.color;
    const valueStr = this.value?.toString() || 'none';
    return `${typeStr}-${colorStr}-${valueStr}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 检查当前卡牌是否可以出在指定卡牌上
   */
  canPlayOn(targetCard: Card): boolean {
    // 万能牌可以出在任何卡牌上
    if (this.type === 'wild' || this.type === 'wild_draw_four') {
      return true;
    }

    // 如果目标卡牌是万能牌，检查当前选择的颜色
    if (targetCard.type === 'wild' || targetCard.type === 'wild_draw_four') {
      return this.color === targetCard.color;
    }

    // 相同颜色可以出
    if (this.color === targetCard.color) {
      return true;
    }

    // 相同数字或类型可以出
    return this.type === targetCard.type && this.value === targetCard.value;


  }

  /**
   * 检查是否为数字牌
   */
  isNumberCard(): boolean {
    return this.type === 'number';
  }

  /**
   * 检查是否为功能牌
   */
  isActionCard(): boolean {
    return ['skip', 'reverse', 'draw_two'].includes(this.type);
  }

  /**
   * 检查是否为万能牌
   */
  isWildCard(): boolean {
    return ['wild', 'wild_draw_four'].includes(this.type);
  }

  /**
   * 获取卡牌的分数值（用于计算得分）
   */
  getPoints(): number {
    switch (this.type) {
      case 'number':
        return this.value ?? 0;
      case 'skip':
      case 'reverse':
      case 'draw_two':
        return 20;
      case 'wild':
      case 'wild_draw_four':
        return 50;
      default:
        return 0;
    }
  }

  /**
   * 获取卡牌的显示名称
   */
  getDisplayName(): string {
    if (this.type === 'number') {
      return `${this.color} ${this.value}`;
    }
    
    const typeNames = {
      skip: '跳过',
      reverse: '反转',
      draw_two: '+2',
      wild: '万能牌',
      wild_draw_four: '万能+4'
    };

    const typeName = typeNames[this.type as keyof typeof typeNames] || this.type;
    return this.color === CardColor.WILD ? typeName : `${this.color} ${typeName}`;
  }

  /**
   * 创建卡牌的副本
   */
  clone(): Card {
    return new Card(this.type, this.color, this.value);
  }

  /**
   * 比较两张卡牌是否相等（不包括ID）
   */
  equals(other: Card): boolean {
    return this.type === other.type && 
           this.color === other.color && 
           this.value === other.value;
  }

  /**
   * 转换为JSON对象
   */
  toJSON(): CardType {
    return {
      id: this.id,
      type: this.type,
      color: this.color,
      value: this.value
    };
  }

  /**
   * 从JSON对象创建Card实例
   */
  static fromJSON(json: CardType): Card {
    const card = new Card(json.type, json.color, json.value);
    // 保持原有ID
    (card as any).id = json.id;
    return card;
  }
} 