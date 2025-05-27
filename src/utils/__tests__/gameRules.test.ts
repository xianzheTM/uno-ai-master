import { describe, it, expect } from 'vitest'
import {
  canPlayCard,
  getCardEffect,
  shouldCallUno,
  isValidUnoCall,
  forgotToCallUno,
  getPlayableCards,
  hasPlayableCards,
  canPlayWildDrawFour,
  getNextPlayerIndex,
  reverseDirection,
  isGameOver,
  getWinnerIndex,
  validateInitialDeal,
  canChallengeWildDrawFour,
  getValidColors,
  isValidColorChoice,
  calculateDrawCount,
  canStackDrawCard,
  validateGameState,
  handleSpecialStartCard,
  getUnoPenaltyCards,
  shouldReshuffleDeck,
  getChallengePenalty,
  isReverseAsSkip,
} from '../gameRules'
import { createCard } from '../cardUtils'
import { CardType, CardColor } from '@/types'

describe('gameRules', () => {
  describe('canPlayCard', () => {
    it('应该允许万能卡总是可以出', () => {
      const wildCard = createCard({ type: CardType.WILD, color: CardColor.WILD })
      const currentCard = createCard({ type: CardType.NUMBER, color: CardColor.RED, value: 5 })
      
      const result = canPlayCard(wildCard, currentCard)
      expect(result.canPlay).toBe(true)
    })

    it('应该允许颜色匹配的卡牌', () => {
      const cardToPlay = createCard({ type: CardType.NUMBER, color: CardColor.RED, value: 3 })
      const currentCard = createCard({ type: CardType.NUMBER, color: CardColor.RED, value: 5 })
      
      const result = canPlayCard(cardToPlay, currentCard)
      expect(result.canPlay).toBe(true)
    })

    it('应该允许数字匹配的卡牌', () => {
      const cardToPlay = createCard({ type: CardType.NUMBER, color: CardColor.BLUE, value: 5 })
      const currentCard = createCard({ type: CardType.NUMBER, color: CardColor.RED, value: 5 })
      
      const result = canPlayCard(cardToPlay, currentCard)
      expect(result.canPlay).toBe(true)
    })

    it('应该允许特殊卡类型匹配', () => {
      const cardToPlay = createCard({ type: CardType.SKIP, color: CardColor.BLUE })
      const currentCard = createCard({ type: CardType.SKIP, color: CardColor.RED })
      
      const result = canPlayCard(cardToPlay, currentCard)
      expect(result.canPlay).toBe(true)
    })

    it('应该拒绝不匹配的卡牌', () => {
      const cardToPlay = createCard({ type: CardType.NUMBER, color: CardColor.BLUE, value: 3 })
      const currentCard = createCard({ type: CardType.NUMBER, color: CardColor.RED, value: 5 })
      
      const result = canPlayCard(cardToPlay, currentCard)
      expect(result.canPlay).toBe(false)
      expect(result.reason).toBeDefined()
    })

    it('应该考虑选择的颜色', () => {
      const cardToPlay = createCard({ type: CardType.NUMBER, color: CardColor.BLUE, value: 3 })
      const currentCard = createCard({ type: CardType.WILD, color: CardColor.WILD })
      
      const result = canPlayCard(cardToPlay, currentCard, CardColor.BLUE)
      expect(result.canPlay).toBe(true)
    })
  })

  describe('getCardEffect', () => {
    it('应该返回跳过卡的效果', () => {
      const card = createCard({ type: CardType.SKIP, color: CardColor.RED })
      const effect = getCardEffect(card)
      
      expect(effect.skipPlayers).toBe(1)
    })

    it('应该返回反转卡的效果', () => {
      const card = createCard({ type: CardType.REVERSE, color: CardColor.BLUE })
      const effect = getCardEffect(card)
      
      expect(effect.reverse).toBe(true)
    })

    it('应该返回+2卡的效果', () => {
      const card = createCard({ type: CardType.DRAW_TWO, color: CardColor.GREEN })
      const effect = getCardEffect(card)
      
      expect(effect.drawCards).toBe(2)
      expect(effect.skipPlayers).toBe(1)
    })

    it('应该返回万能卡的效果', () => {
      const card = createCard({ type: CardType.WILD, color: CardColor.WILD })
      const effect = getCardEffect(card)
      
      expect(effect.chooseColor).toBe(true)
    })

    it('应该返回万能+4卡的效果', () => {
      const card = createCard({ type: CardType.WILD_DRAW_FOUR, color: CardColor.WILD })
      const effect = getCardEffect(card)
      
      expect(effect.chooseColor).toBe(true)
      expect(effect.drawCards).toBe(4)
      expect(effect.skipPlayers).toBe(1)
    })

    it('应该返回数字卡的空效果', () => {
      const card = createCard({ type: CardType.NUMBER, color: CardColor.RED, value: 5 })
      const effect = getCardEffect(card)
      
      expect(Object.keys(effect)).toHaveLength(0)
    })
  })

  describe('shouldCallUno', () => {
    it('应该在手牌剩余1张时需要宣告UNO', () => {
      expect(shouldCallUno(1)).toBe(true)
    })

    it('应该在手牌多于1张时不需要宣告UNO', () => {
      expect(shouldCallUno(2)).toBe(false)
      expect(shouldCallUno(5)).toBe(false)
    })
  })

  describe('isValidUnoCall', () => {
    it('应该在手牌剩余1张且未宣告时有效', () => {
      expect(isValidUnoCall(1, false)).toBe(true)
    })

    it('应该在手牌剩余1张但已宣告时无效', () => {
      expect(isValidUnoCall(1, true)).toBe(false)
    })

    it('应该在手牌多于1张时无效', () => {
      expect(isValidUnoCall(2, false)).toBe(false)
    })
  })

  describe('forgotToCallUno', () => {
    it('应该检测忘记宣告UNO', () => {
      expect(forgotToCallUno(1, false)).toBe(true)
    })

    it('应该在已宣告时返回false', () => {
      expect(forgotToCallUno(1, true)).toBe(false)
    })

    it('应该在手牌多于1张时返回false', () => {
      expect(forgotToCallUno(2, false)).toBe(false)
    })
  })

  describe('getPlayableCards', () => {
    it('应该返回可出的卡牌列表', () => {
      const hand = [
        createCard({ type: CardType.NUMBER, color: CardColor.RED, value: 3 }),
        createCard({ type: CardType.NUMBER, color: CardColor.BLUE, value: 5 }),
        createCard({ type: CardType.SKIP, color: CardColor.GREEN }),
        createCard({ type: CardType.WILD, color: CardColor.WILD }),
      ]
      const currentCard = createCard({ type: CardType.NUMBER, color: CardColor.RED, value: 7 })
      
      const playableCards = getPlayableCards(hand, currentCard)
      
      // 红色3和万能卡应该可以出
      expect(playableCards).toHaveLength(2)
      expect(playableCards[0].color).toBe(CardColor.RED)
      expect(playableCards[1].type).toBe(CardType.WILD)
    })
  })

  describe('hasPlayableCards', () => {
    it('应该检测是否有可出的卡牌', () => {
      const hand = [
        createCard({ type: CardType.NUMBER, color: CardColor.RED, value: 3 }),
        createCard({ type: CardType.NUMBER, color: CardColor.BLUE, value: 5 }),
      ]
      const currentCard = createCard({ type: CardType.NUMBER, color: CardColor.RED, value: 7 })
      
      expect(hasPlayableCards(hand, currentCard)).toBe(true)
    })

    it('应该检测没有可出的卡牌', () => {
      const hand = [
        createCard({ type: CardType.NUMBER, color: CardColor.BLUE, value: 3 }),
        createCard({ type: CardType.NUMBER, color: CardColor.GREEN, value: 5 }),
      ]
      const currentCard = createCard({ type: CardType.NUMBER, color: CardColor.RED, value: 7 })
      
      expect(hasPlayableCards(hand, currentCard)).toBe(false)
    })
  })

  describe('canPlayWildDrawFour', () => {
    it('应该在没有其他可出卡牌时允许万能+4', () => {
      const hand = [
        createCard({ type: CardType.NUMBER, color: CardColor.BLUE, value: 3 }),
        createCard({ type: CardType.WILD_DRAW_FOUR, color: CardColor.WILD }),
      ]
      const currentCard = createCard({ type: CardType.NUMBER, color: CardColor.RED, value: 7 })
      
      expect(canPlayWildDrawFour(hand, currentCard)).toBe(true)
    })

    it('应该在有其他可出卡牌时禁止万能+4', () => {
      const hand = [
        createCard({ type: CardType.NUMBER, color: CardColor.RED, value: 3 }),
        createCard({ type: CardType.WILD_DRAW_FOUR, color: CardColor.WILD }),
      ]
      const currentCard = createCard({ type: CardType.NUMBER, color: CardColor.RED, value: 7 })
      
      expect(canPlayWildDrawFour(hand, currentCard)).toBe(false)
    })
  })

  describe('getNextPlayerIndex', () => {
    it('应该计算下一个玩家索引（顺时针）', () => {
      expect(getNextPlayerIndex(0, 4, 1)).toBe(1)
      expect(getNextPlayerIndex(3, 4, 1)).toBe(0) // 循环
    })

    it('应该计算下一个玩家索引（逆时针）', () => {
      expect(getNextPlayerIndex(1, 4, -1)).toBe(0)
      expect(getNextPlayerIndex(0, 4, -1)).toBe(3) // 循环
    })

    it('应该跳过指定数量的玩家', () => {
      expect(getNextPlayerIndex(0, 4, 1, 1)).toBe(2) // 跳过1个玩家
      expect(getNextPlayerIndex(0, 4, 1, 2)).toBe(3) // 跳过2个玩家
    })
  })

  describe('reverseDirection', () => {
    it('应该反转游戏方向', () => {
      expect(reverseDirection(1)).toBe(-1)
      expect(reverseDirection(-1)).toBe(1)
    })
  })

  describe('isGameOver', () => {
    it('应该检测游戏结束', () => {
      const playerHands = [
        [], // 玩家0手牌为空
        [createCard({ type: CardType.NUMBER, color: CardColor.RED, value: 3 })],
        [createCard({ type: CardType.NUMBER, color: CardColor.BLUE, value: 5 })],
      ]
      
      expect(isGameOver(playerHands)).toBe(true)
    })

    it('应该检测游戏未结束', () => {
      const playerHands = [
        [createCard({ type: CardType.NUMBER, color: CardColor.RED, value: 1 })],
        [createCard({ type: CardType.NUMBER, color: CardColor.RED, value: 3 })],
        [createCard({ type: CardType.NUMBER, color: CardColor.BLUE, value: 5 })],
      ]
      
      expect(isGameOver(playerHands)).toBe(false)
    })
  })

  describe('getWinnerIndex', () => {
    it('应该返回获胜者索引', () => {
      const playerHands = [
        [createCard({ type: CardType.NUMBER, color: CardColor.RED, value: 1 })],
        [], // 玩家1获胜
        [createCard({ type: CardType.NUMBER, color: CardColor.BLUE, value: 5 })],
      ]
      
      expect(getWinnerIndex(playerHands)).toBe(1)
    })

    it('应该在没有获胜者时返回null', () => {
      const playerHands = [
        [createCard({ type: CardType.NUMBER, color: CardColor.RED, value: 1 })],
        [createCard({ type: CardType.NUMBER, color: CardColor.RED, value: 3 })],
        [createCard({ type: CardType.NUMBER, color: CardColor.BLUE, value: 5 })],
      ]
      
      expect(getWinnerIndex(playerHands)).toBeNull()
    })
  })

  describe('validateInitialDeal', () => {
    it('应该验证正确的初始分发', () => {
      const playerCount = 4
      const handSize = 7
      const deckSize = 108 - (playerCount * handSize) - 1 // 标准计算
      
      const playerHands = Array(playerCount).fill(null).map(() => 
        Array(handSize).fill(null).map(() => 
          createCard({ type: CardType.NUMBER, color: CardColor.RED, value: 1 })
        )
      )
      
      expect(validateInitialDeal(playerHands, deckSize, handSize)).toBe(true)
    })

    it('应该检测错误的初始分发', () => {
      const playerCount = 4
      const handSize = 7
      const wrongDeckSize = 50 // 错误的牌堆大小
      
      const playerHands = Array(playerCount).fill(null).map(() => 
        Array(handSize).fill(null).map(() => 
          createCard({ type: CardType.NUMBER, color: CardColor.RED, value: 1 })
        )
      )
      
      expect(validateInitialDeal(playerHands, wrongDeckSize, handSize)).toBe(false)
    })
  })

  describe('getValidColors', () => {
    it('应该返回有效的颜色列表', () => {
      const colors = getValidColors()
      
      expect(colors).toContain(CardColor.RED)
      expect(colors).toContain(CardColor.BLUE)
      expect(colors).toContain(CardColor.GREEN)
      expect(colors).toContain(CardColor.YELLOW)
      expect(colors).not.toContain(CardColor.WILD)
    })
  })

  describe('isValidColorChoice', () => {
    it('应该验证有效的颜色选择', () => {
      expect(isValidColorChoice(CardColor.RED)).toBe(true)
      expect(isValidColorChoice(CardColor.BLUE)).toBe(true)
      expect(isValidColorChoice(CardColor.GREEN)).toBe(true)
      expect(isValidColorChoice(CardColor.YELLOW)).toBe(true)
    })

    it('应该拒绝无效的颜色选择', () => {
      expect(isValidColorChoice(CardColor.WILD)).toBe(false)
    })
  })

  describe('calculateDrawCount', () => {
    it('应该计算累积抽牌数', () => {
      const cards = [
        createCard({ type: CardType.DRAW_TWO, color: CardColor.RED }),
        createCard({ type: CardType.DRAW_TWO, color: CardColor.BLUE }),
        createCard({ type: CardType.WILD_DRAW_FOUR, color: CardColor.WILD }),
      ]
      
      expect(calculateDrawCount(cards)).toBe(8) // 2 + 2 + 4
    })

    it('应该在遇到非抽牌卡时停止累积', () => {
      const cards = [
        createCard({ type: CardType.DRAW_TWO, color: CardColor.RED }),
        createCard({ type: CardType.NUMBER, color: CardColor.BLUE, value: 5 }),
        createCard({ type: CardType.DRAW_TWO, color: CardColor.GREEN }),
      ]
      
      expect(calculateDrawCount(cards)).toBe(2) // 只计算第一张+2卡
    })
  })

  describe('canStackDrawCard', () => {
    it('应该允许+2卡叠加+2卡', () => {
      const cardToPlay = createCard({ type: CardType.DRAW_TWO, color: CardColor.RED })
      const currentCard = createCard({ type: CardType.DRAW_TWO, color: CardColor.BLUE })
      
      expect(canStackDrawCard(cardToPlay, currentCard)).toBe(true)
    })

    it('应该允许+4卡叠加+4卡', () => {
      const cardToPlay = createCard({ type: CardType.WILD_DRAW_FOUR, color: CardColor.WILD })
      const currentCard = createCard({ type: CardType.WILD_DRAW_FOUR, color: CardColor.WILD })
      
      expect(canStackDrawCard(cardToPlay, currentCard)).toBe(true)
    })

    it('应该禁止不同类型的抽牌卡叠加', () => {
      const cardToPlay = createCard({ type: CardType.DRAW_TWO, color: CardColor.RED })
      const currentCard = createCard({ type: CardType.WILD_DRAW_FOUR, color: CardColor.WILD })
      
      expect(canStackDrawCard(cardToPlay, currentCard)).toBe(false)
    })
  })

  describe('validateGameState', () => {
    it('应该验证正确的游戏状态', () => {
      const playerHands = [
        [createCard({ type: CardType.NUMBER, color: CardColor.RED, value: 1 })],
        [createCard({ type: CardType.NUMBER, color: CardColor.BLUE, value: 2 })],
      ]
      const deck = Array(105).fill(null).map(() => 
        createCard({ type: CardType.NUMBER, color: CardColor.GREEN, value: 3 })
      )
      const discardPile = [createCard({ type: CardType.NUMBER, color: CardColor.YELLOW, value: 4 })]
      
      const result = validateGameState(playerHands, deck, discardPile)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该检测卡牌总数错误', () => {
      const playerHands = [
        [createCard({ type: CardType.NUMBER, color: CardColor.RED, value: 1 })],
      ]
      const deck = [createCard({ type: CardType.NUMBER, color: CardColor.GREEN, value: 3 })]
      const discardPile = [createCard({ type: CardType.NUMBER, color: CardColor.YELLOW, value: 4 })]
      
      const result = validateGameState(playerHands, deck, discardPile)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('卡牌总数不正确: 3, 应该是108')
    })

    it('应该检测空弃牌堆', () => {
      const playerHands = [[]]
      const deck = Array(108).fill(null).map(() => 
        createCard({ type: CardType.NUMBER, color: CardColor.GREEN, value: 3 })
      )
      const discardPile: any[] = []
      
      const result = validateGameState(playerHands, deck, discardPile)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('弃牌堆不能为空')
    })
  })

  describe('handleSpecialStartCard', () => {
    it('应该处理跳过卡起始', () => {
      const skipCard = createCard({ type: CardType.SKIP, color: CardColor.RED })
      const result = handleSpecialStartCard(skipCard)
      
      expect(result.shouldReshuffle).toBe(false)
      expect(result.skipFirstPlayer).toBe(true)
    })
    
    it('应该处理反转卡起始', () => {
      const reverseCard = createCard({ type: CardType.REVERSE, color: CardColor.BLUE })
      const result = handleSpecialStartCard(reverseCard)
      
      expect(result.shouldReshuffle).toBe(false)
      expect(result.reverseDirection).toBe(true)
    })
    
    it('应该处理+2卡起始', () => {
      const drawTwoCard = createCard({ type: CardType.DRAW_TWO, color: CardColor.GREEN })
      const result = handleSpecialStartCard(drawTwoCard)
      
      expect(result.shouldReshuffle).toBe(false)
      expect(result.skipFirstPlayer).toBe(true)
      expect(result.drawCards).toBe(2)
    })
    
    it('应该处理万能卡起始', () => {
      const wildCard = createCard({ type: CardType.WILD, color: CardColor.WILD })
      const result = handleSpecialStartCard(wildCard)
      
      expect(result.shouldReshuffle).toBe(true)
    })
    
    it('应该处理万能+4卡起始', () => {
      const wildDrawFourCard = createCard({ type: CardType.WILD_DRAW_FOUR, color: CardColor.WILD })
      const result = handleSpecialStartCard(wildDrawFourCard)
      
      expect(result.shouldReshuffle).toBe(true)
    })
    
    it('应该处理数字卡起始', () => {
      const numberCard = createCard({ type: CardType.NUMBER, color: CardColor.RED, value: 5 })
      const result = handleSpecialStartCard(numberCard)
      
      expect(result.shouldReshuffle).toBe(false)
      expect(result.skipFirstPlayer).toBeUndefined()
      expect(result.reverseDirection).toBeUndefined()
      expect(result.drawCards).toBeUndefined()
    })
  })

  describe('getUnoPenaltyCards', () => {
    it('应该返回正确的UNO惩罚抽牌数', () => {
      expect(getUnoPenaltyCards()).toBe(2)
    })
  })

  describe('shouldReshuffleDeck', () => {
    it('应该在抽牌堆为空时返回true', () => {
      expect(shouldReshuffleDeck(0)).toBe(true)
    })
    
    it('应该在抽牌堆不为空时返回false', () => {
      expect(shouldReshuffleDeck(10)).toBe(false)
      expect(shouldReshuffleDeck(1)).toBe(false)
    })
  })

  describe('getChallengePenalty', () => {
    it('应该返回质疑成功的惩罚', () => {
      expect(getChallengePenalty(true)).toBe(4)
    })
    
    it('应该返回质疑失败的惩罚', () => {
      expect(getChallengePenalty(false)).toBe(6)
    })
  })

  describe('isReverseAsSkip', () => {
    it('应该在2人游戏中返回true', () => {
      expect(isReverseAsSkip(2)).toBe(true)
    })
    
    it('应该在多人游戏中返回false', () => {
      expect(isReverseAsSkip(3)).toBe(false)
      expect(isReverseAsSkip(4)).toBe(false)
      expect(isReverseAsSkip(6)).toBe(false)
    })
  })
}) 