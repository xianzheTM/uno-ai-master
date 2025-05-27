import { Card, CardType, CardColor, CreateCardParams } from '@/types'

/**
 * 生成唯一的卡牌ID
 */
export function generateCardId(): string {
  return `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 创建单张卡牌
 */
export function createCard(params: CreateCardParams): Card {
  return {
    id: generateCardId(),
    type: params.type,
    color: params.color,
    value: params.value,
  }
}

/**
 * 创建标准UNO卡牌堆
 */
export function createStandardDeck(): Card[] {
  const deck: Card[] = []
  
  // 普通颜色（红、蓝、绿、黄）
  const colors = [CardColor.RED, CardColor.BLUE, CardColor.GREEN, CardColor.YELLOW]
  
  colors.forEach(color => {
    // 数字卡 0-9
    for (let value = 0; value <= 9; value++) {
      // 0只有一张，1-9每种颜色有两张
      const count = value === 0 ? 1 : 2
      for (let i = 0; i < count; i++) {
        deck.push(createCard({
          type: CardType.NUMBER,
          color,
          value
        }))
      }
    }
    
    // 特殊卡牌，每种颜色各两张
    const specialCards = [CardType.SKIP, CardType.REVERSE, CardType.DRAW_TWO]
    specialCards.forEach(type => {
      for (let i = 0; i < 2; i++) {
        deck.push(createCard({
          type,
          color
        }))
      }
    })
  })
  
  // 万能卡，各4张
  for (let i = 0; i < 4; i++) {
    deck.push(createCard({
      type: CardType.WILD,
      color: CardColor.WILD
    }))
    
    deck.push(createCard({
      type: CardType.WILD_DRAW_FOUR,
      color: CardColor.WILD
    }))
  }
  
  return deck
}

/**
 * 获取卡牌的显示名称
 */
export function getCardDisplayName(card: Card): string {
  if (card.type === CardType.NUMBER && card.value !== undefined) {
    return `${card.value}`
  }
  
  switch (card.type) {
    case CardType.SKIP:
      return '跳过'
    case CardType.REVERSE:
      return '反转'
    case CardType.DRAW_TWO:
      return '+2'
    case CardType.WILD:
      return '变色'
    case CardType.WILD_DRAW_FOUR:
      return '变色+4'
    default:
      return '未知'
  }
}

/**
 * 获取卡牌的颜色显示名称
 */
export function getCardColorDisplayName(color: CardColor): string {
  switch (color) {
    case CardColor.RED:
      return '红色'
    case CardColor.BLUE:
      return '蓝色'
    case CardColor.GREEN:
      return '绿色'
    case CardColor.YELLOW:
      return '黄色'
    case CardColor.WILD:
      return '万能'
    default:
      return '未知'
  }
}

/**
 * 获取卡牌的CSS颜色类名
 */
export function getCardColorClass(color: CardColor): string {
  switch (color) {
    case CardColor.RED:
      return 'bg-uno-red text-white'
    case CardColor.BLUE:
      return 'bg-uno-blue text-white'
    case CardColor.GREEN:
      return 'bg-uno-green text-white'
    case CardColor.YELLOW:
      return 'bg-uno-yellow text-black'
    case CardColor.WILD:
      return 'bg-uno-wild text-white'
    default:
      return 'bg-gray-500 text-white'
  }
}

/**
 * 检查卡牌是否为特殊卡牌
 */
export function isSpecialCard(card: Card): boolean {
  return card.type !== CardType.NUMBER
}

/**
 * 检查卡牌是否为万能卡
 */
export function isWildCard(card: Card): boolean {
  return card.type === CardType.WILD || card.type === CardType.WILD_DRAW_FOUR
}

/**
 * 检查卡牌是否为抽牌卡
 */
export function isDrawCard(card: Card): boolean {
  return card.type === CardType.DRAW_TWO || card.type === CardType.WILD_DRAW_FOUR
}

/**
 * 获取卡牌的分数值（用于计算最终得分）
 */
export function getCardScore(card: Card): number {
  if (card.type === CardType.NUMBER && card.value !== undefined) {
    return card.value
  }
  
  switch (card.type) {
    case CardType.SKIP:
    case CardType.REVERSE:
    case CardType.DRAW_TWO:
      return 20
    case CardType.WILD:
    case CardType.WILD_DRAW_FOUR:
      return 50
    default:
      return 0
  }
}

/**
 * 计算手牌总分
 */
export function calculateHandScore(hand: Card[]): number {
  return hand.reduce((total, card) => total + getCardScore(card), 0)
}

/**
 * 按颜色分组卡牌
 */
export function groupCardsByColor(cards: Card[]): Record<CardColor, Card[]> {
  const groups: Record<CardColor, Card[]> = {
    [CardColor.RED]: [],
    [CardColor.BLUE]: [],
    [CardColor.GREEN]: [],
    [CardColor.YELLOW]: [],
    [CardColor.WILD]: [],
  }
  
  cards.forEach(card => {
    groups[card.color].push(card)
  })
  
  return groups
}

/**
 * 按类型分组卡牌
 */
export function groupCardsByType(cards: Card[]): Record<CardType, Card[]> {
  const groups: Record<CardType, Card[]> = {
    [CardType.NUMBER]: [],
    [CardType.SKIP]: [],
    [CardType.REVERSE]: [],
    [CardType.DRAW_TWO]: [],
    [CardType.WILD]: [],
    [CardType.WILD_DRAW_FOUR]: [],
  }
  
  cards.forEach(card => {
    groups[card.type].push(card)
  })
  
  return groups
} 