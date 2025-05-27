import { Card, CardType, CardColor, CardMatchRule, CardEffect } from '@/types'
import { isWildCard } from './cardUtils'

/**
 * 检查卡牌是否可以出牌
 */
export function canPlayCard(cardToPlay: Card, currentCard: Card, chosenColor?: CardColor): CardMatchRule {
  // 万能卡总是可以出
  if (isWildCard(cardToPlay)) {
    return { canPlay: true }
  }
  
  // 获取当前有效颜色（如果之前出了万能卡）
  const effectiveColor = chosenColor || currentCard.color
  
  // 颜色匹配
  if (cardToPlay.color === effectiveColor) {
    return { canPlay: true }
  }
  
  // 数字匹配（仅限数字卡）
  if (
    cardToPlay.type === CardType.NUMBER &&
    currentCard.type === CardType.NUMBER &&
    cardToPlay.value === currentCard.value
  ) {
    return { canPlay: true }
  }
  
  // 特殊卡类型匹配
  if (
    cardToPlay.type === currentCard.type &&
    cardToPlay.type !== CardType.NUMBER
  ) {
    return { canPlay: true }
  }
  
  // 不能出牌
  return {
    canPlay: false,
    reason: '卡牌颜色、数字或类型都不匹配'
  }
}

/**
 * 获取卡牌的特殊效果
 */
export function getCardEffect(card: Card): CardEffect {
  switch (card.type) {
    case CardType.SKIP:
      return { skipPlayers: 1 }
    
    case CardType.REVERSE:
      return { reverse: true }
    
    case CardType.DRAW_TWO:
      return { drawCards: 2, skipPlayers: 1 }
    
    case CardType.WILD:
      return { chooseColor: true }
    
    case CardType.WILD_DRAW_FOUR:
      return { chooseColor: true, drawCards: 4, skipPlayers: 1 }
    
    default:
      return {}
  }
}

/**
 * 检查是否需要宣告UNO
 * 根据规则：当玩家手牌从2张变为1张时需要宣告UNO
 */
export function shouldCallUno(handSizeAfterPlay: number): boolean {
  return handSizeAfterPlay === 1
}

/**
 * 检查UNO宣告是否有效
 * 玩家在手牌剩余1张时必须宣告UNO
 */
export function isValidUnoCall(handSize: number, hasCalledUno: boolean): boolean {
  if (handSize === 1) {
    return !hasCalledUno // 只有在还没宣告的情况下才有效
  }
  return false
}

/**
 * 检查玩家是否忘记宣告UNO（惩罚检查）
 * 当玩家手牌剩余1张但未宣告UNO时，需要惩罚
 */
export function forgotToCallUno(handSize: number, hasCalledUno: boolean): boolean {
  return handSize === 1 && !hasCalledUno
}

/**
 * 获取UNO宣告惩罚的抽牌数
 */
export function getUnoPenaltyCards(): number {
  return 2
}

/**
 * 获取可出的卡牌列表
 */
export function getPlayableCards(hand: Card[], currentCard: Card, chosenColor?: CardColor): Card[] {
  return hand.filter(card => canPlayCard(card, currentCard, chosenColor).canPlay)
}

/**
 * 检查是否有可出的卡牌
 */
export function hasPlayableCards(hand: Card[], currentCard: Card, chosenColor?: CardColor): boolean {
  return getPlayableCards(hand, currentCard, chosenColor).length > 0
}

/**
 * 验证万能+4卡的合法性
 * 根据UNO规则，只有在没有其他可出卡牌时才能出万能+4卡
 */
export function canPlayWildDrawFour(hand: Card[], currentCard: Card, chosenColor?: CardColor): boolean {
  // 获取除了万能+4卡之外的所有卡牌
  const otherCards = hand.filter(card => card.type !== CardType.WILD_DRAW_FOUR)
  
  // 检查是否有其他可出的卡牌
  return !hasPlayableCards(otherCards, currentCard, chosenColor)
}

/**
 * 计算下一个玩家索引
 */
export function getNextPlayerIndex(
  currentIndex: number,
  playerCount: number,
  direction: 1 | -1,
  skipCount: number = 0
): number {
  let nextIndex = currentIndex
  
  // 跳过指定数量的玩家，加上当前玩家本身
  for (let i = 0; i <= skipCount; i++) {
    nextIndex = (nextIndex + direction + playerCount) % playerCount
  }
  
  return nextIndex
}

/**
 * 反转游戏方向
 */
export function reverseDirection(direction: 1 | -1): 1 | -1 {
  return direction === 1 ? -1 : 1
}

/**
 * 检查游戏是否结束
 */
export function isGameOver(playerHands: Card[][]): boolean {
  return playerHands.some(hand => hand.length === 0)
}

/**
 * 获取获胜者索引
 */
export function getWinnerIndex(playerHands: Card[][]): number | null {
  for (let i = 0; i < playerHands.length; i++) {
    if (playerHands[i].length === 0) {
      return i
    }
  }
  return null
}

/**
 * 验证初始手牌分发
 */
export function validateInitialDeal(playerHands: Card[][], deckSize: number, handSize: number): boolean {
  const totalCardsDealt = playerHands.length * handSize
  const expectedDeckSize = 108 - totalCardsDealt - 1 // 标准UNO牌堆108张，减去分发的牌和翻开的第一张
  
  return deckSize === expectedDeckSize
}

/**
 * 检查是否可以质疑万能+4卡
 * 如果上一个玩家非法使用了万能+4卡，当前玩家可以质疑
 */
export function canChallengeWildDrawFour(
  challengerHand: Card[],
  previousPlayerHand: Card[],
  cardBeforeWild: Card,
  chosenColor?: CardColor
): boolean {
  // 检查上一个玩家是否有其他可出的卡牌
  const otherCards = previousPlayerHand.filter(card => card.type !== CardType.WILD_DRAW_FOUR)
  return hasPlayableCards(otherCards, cardBeforeWild, chosenColor)
}

/**
 * 获取有效的颜色选择
 */
export function getValidColors(): CardColor[] {
  return [CardColor.RED, CardColor.BLUE, CardColor.GREEN, CardColor.YELLOW]
}

/**
 * 检查颜色选择是否有效
 */
export function isValidColorChoice(color: CardColor): boolean {
  return getValidColors().includes(color)
}

/**
 * 计算累积抽牌数
 * 当连续出现+2或+4卡时，抽牌数会累积
 */
export function calculateDrawCount(cards: Card[]): number {
  let count = 0
  
  for (const card of cards) {
    if (card.type === CardType.DRAW_TWO) {
      count += 2
    } else if (card.type === CardType.WILD_DRAW_FOUR) {
      count += 4
    } else {
      break // 遇到非抽牌卡就停止累积
    }
  }
  
  return count
}

/**
 * 检查是否可以叠加抽牌卡
 */
export function canStackDrawCard(cardToPlay: Card, currentCard: Card): boolean {
  // +2可以叠加+2
  if (cardToPlay.type === CardType.DRAW_TWO && currentCard.type === CardType.DRAW_TWO) {
    return true
  }
  
  // +4可以叠加+4
  if (cardToPlay.type === CardType.WILD_DRAW_FOUR && currentCard.type === CardType.WILD_DRAW_FOUR) {
    return true
  }
  
  // 某些变体规则允许+2和+4互相叠加，这里暂不实现
  return false
}

/**
 * 处理特殊起始卡的效果
 * 根据规则：如果起始卡是特殊卡，需要特殊处理
 */
export function handleSpecialStartCard(startCard: Card): {
  shouldReshuffle: boolean;
  skipFirstPlayer?: boolean;
  reverseDirection?: boolean;
  drawCards?: number;
} {
  switch (startCard.type) {
    case CardType.SKIP:
      return { shouldReshuffle: false, skipFirstPlayer: true }
    
    case CardType.REVERSE:
      return { shouldReshuffle: false, reverseDirection: true }
    
    case CardType.DRAW_TWO:
      return { shouldReshuffle: false, skipFirstPlayer: true, drawCards: 2 }
    
    case CardType.WILD:
    case CardType.WILD_DRAW_FOUR:
      return { shouldReshuffle: true }
    
    default:
      return { shouldReshuffle: false }
  }
}

/**
 * 检查是否需要重新洗牌抽牌堆
 * 当抽牌堆用完时，将弃牌堆重新洗牌
 */
export function shouldReshuffleDeck(deckSize: number): boolean {
  return deckSize === 0
}

/**
 * 获取质疑万能+4卡的惩罚抽牌数
 */
export function getChallengePenalty(challengeSuccessful: boolean): number {
  if (challengeSuccessful) {
    return 4 // 质疑成功，出牌者抽4张
  } else {
    return 6 // 质疑失败，质疑者抽6张（原本4张+惩罚2张）
  }
}

/**
 * 检查2人游戏中反转卡的特殊效果
 * 在2人游戏中，反转卡相当于跳过卡
 */
export function isReverseAsSkip(playerCount: number): boolean {
  return playerCount === 2
}

/**
 * 验证游戏状态的一致性
 */
export function validateGameState(
  playerHands: Card[][],
  deck: Card[],
  discardPile: Card[]
): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // 检查卡牌总数
  const totalCards = playerHands.flat().length + deck.length + discardPile.length
  if (totalCards !== 108) {
    errors.push(`卡牌总数不正确: ${totalCards}, 应该是108`)
  }
  
  // 检查是否有重复卡牌
  const allCards = [...playerHands.flat(), ...deck, ...discardPile]
  const cardIds = allCards.map(card => card.id)
  const uniqueIds = new Set(cardIds)
  if (cardIds.length !== uniqueIds.size) {
    errors.push('存在重复的卡牌ID')
  }
  
  // 检查弃牌堆是否为空
  if (discardPile.length === 0) {
    errors.push('弃牌堆不能为空')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
} 