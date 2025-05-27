/**
 * 卡牌类型枚举
 */
export enum CardType {
  NUMBER = 'number',
  SKIP = 'skip',
  REVERSE = 'reverse',
  DRAW_TWO = 'draw_two',
  WILD = 'wild',
  WILD_DRAW_FOUR = 'wild_draw_four'
}

/**
 * 卡牌颜色枚举
 */
export enum CardColor {
  RED = 'red',
  BLUE = 'blue',
  GREEN = 'green',
  YELLOW = 'yellow',
  WILD = 'wild'
}

/**
 * 卡牌接口
 */
export interface Card {
  /** 卡牌唯一标识符 */
  id: string;
  /** 卡牌类型 */
  type: CardType;
  /** 卡牌颜色 */
  color: CardColor;
  /** 数字卡的值 (0-9)，仅数字卡有效 */
  value?: number;
}

/**
 * 卡牌创建参数
 */
export interface CreateCardParams {
  type: CardType;
  color: CardColor;
  value?: number;
}

/**
 * 卡牌匹配规则
 */
export interface CardMatchRule {
  /** 是否可以出牌 */
  canPlay: boolean;
  /** 不能出牌的原因 */
  reason?: string;
}

/**
 * 特殊卡牌效果
 */
export interface CardEffect {
  /** 跳过玩家数量 */
  skipPlayers?: number;
  /** 抽牌数量 */
  drawCards?: number;
  /** 是否反转方向 */
  reverse?: boolean;
  /** 是否需要选择颜色 */
  chooseColor?: boolean;
} 