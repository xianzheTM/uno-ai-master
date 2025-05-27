import { describe, it, expect } from 'vitest'
import {
  createCard,
  createStandardDeck,
  getCardDisplayName,
  getCardColorDisplayName,
  getCardColorClass,
  isSpecialCard,
  isWildCard,
  isDrawCard,
  getCardScore,
  calculateHandScore,
  groupCardsByColor,
  groupCardsByType,
} from '../cardUtils'
import { CardType, CardColor } from '@/types'

describe('cardUtils', () => {
  describe('createCard', () => {
    it('应该创建数字卡', () => {
      const card = createCard({
        type: CardType.NUMBER,
        color: CardColor.RED,
        value: 5
      })
      
      expect(card.type).toBe(CardType.NUMBER)
      expect(card.color).toBe(CardColor.RED)
      expect(card.value).toBe(5)
      expect(card.id).toBeDefined()
    })

    it('应该创建特殊卡', () => {
      const card = createCard({
        type: CardType.SKIP,
        color: CardColor.BLUE
      })
      
      expect(card.type).toBe(CardType.SKIP)
      expect(card.color).toBe(CardColor.BLUE)
      expect(card.value).toBeUndefined()
    })
  })

  describe('createStandardDeck', () => {
    it('应该创建标准108张UNO卡牌', () => {
      const deck = createStandardDeck()
      expect(deck).toHaveLength(108)
    })

    it('应该包含正确数量的数字卡', () => {
      const deck = createStandardDeck()
      const numberCards = deck.filter(card => card.type === CardType.NUMBER)
      
      // 每种颜色：0卡1张，1-9卡各2张 = 1 + 9*2 = 19张
      // 4种颜色 = 76张数字卡
      expect(numberCards).toHaveLength(76)
    })

    it('应该包含正确数量的特殊卡', () => {
      const deck = createStandardDeck()
      
      const skipCards = deck.filter(card => card.type === CardType.SKIP)
      const reverseCards = deck.filter(card => card.type === CardType.REVERSE)
      const drawTwoCards = deck.filter(card => card.type === CardType.DRAW_TWO)
      
      // 每种特殊卡每种颜色2张，4种颜色 = 8张
      expect(skipCards).toHaveLength(8)
      expect(reverseCards).toHaveLength(8)
      expect(drawTwoCards).toHaveLength(8)
    })

    it('应该包含正确数量的万能卡', () => {
      const deck = createStandardDeck()
      
      const wildCards = deck.filter(card => card.type === CardType.WILD)
      const wildDrawFourCards = deck.filter(card => card.type === CardType.WILD_DRAW_FOUR)
      
      expect(wildCards).toHaveLength(4)
      expect(wildDrawFourCards).toHaveLength(4)
    })
  })

  describe('getCardDisplayName', () => {
    it('应该返回数字卡的正确显示名称', () => {
      const card = createCard({
        type: CardType.NUMBER,
        color: CardColor.RED,
        value: 7
      })
      
      expect(getCardDisplayName(card)).toBe('7')
    })

    it('应该返回特殊卡的正确显示名称', () => {
      expect(getCardDisplayName(createCard({
        type: CardType.SKIP,
        color: CardColor.RED
      }))).toBe('跳过')

      expect(getCardDisplayName(createCard({
        type: CardType.REVERSE,
        color: CardColor.BLUE
      }))).toBe('反转')

      expect(getCardDisplayName(createCard({
        type: CardType.DRAW_TWO,
        color: CardColor.GREEN
      }))).toBe('+2')

      expect(getCardDisplayName(createCard({
        type: CardType.WILD,
        color: CardColor.WILD
      }))).toBe('变色')

      expect(getCardDisplayName(createCard({
        type: CardType.WILD_DRAW_FOUR,
        color: CardColor.WILD
      }))).toBe('变色+4')
    })
  })

  describe('getCardColorDisplayName', () => {
    it('应该返回正确的颜色显示名称', () => {
      expect(getCardColorDisplayName(CardColor.RED)).toBe('红色')
      expect(getCardColorDisplayName(CardColor.BLUE)).toBe('蓝色')
      expect(getCardColorDisplayName(CardColor.GREEN)).toBe('绿色')
      expect(getCardColorDisplayName(CardColor.YELLOW)).toBe('黄色')
      expect(getCardColorDisplayName(CardColor.WILD)).toBe('万能')
    })
  })

  describe('getCardColorClass', () => {
    it('应该返回正确的CSS类名', () => {
      expect(getCardColorClass(CardColor.RED)).toBe('bg-uno-red text-white')
      expect(getCardColorClass(CardColor.BLUE)).toBe('bg-uno-blue text-white')
      expect(getCardColorClass(CardColor.GREEN)).toBe('bg-uno-green text-white')
      expect(getCardColorClass(CardColor.YELLOW)).toBe('bg-uno-yellow text-black')
      expect(getCardColorClass(CardColor.WILD)).toBe('bg-uno-wild text-white')
    })
  })

  describe('isSpecialCard', () => {
    it('应该正确识别特殊卡', () => {
      const numberCard = createCard({
        type: CardType.NUMBER,
        color: CardColor.RED,
        value: 5
      })
      
      const skipCard = createCard({
        type: CardType.SKIP,
        color: CardColor.BLUE
      })
      
      expect(isSpecialCard(numberCard)).toBe(false)
      expect(isSpecialCard(skipCard)).toBe(true)
    })
  })

  describe('isWildCard', () => {
    it('应该正确识别万能卡', () => {
      const numberCard = createCard({
        type: CardType.NUMBER,
        color: CardColor.RED,
        value: 5
      })
      
      const wildCard = createCard({
        type: CardType.WILD,
        color: CardColor.WILD
      })
      
      const wildDrawFourCard = createCard({
        type: CardType.WILD_DRAW_FOUR,
        color: CardColor.WILD
      })
      
      expect(isWildCard(numberCard)).toBe(false)
      expect(isWildCard(wildCard)).toBe(true)
      expect(isWildCard(wildDrawFourCard)).toBe(true)
    })
  })

  describe('isDrawCard', () => {
    it('应该正确识别抽牌卡', () => {
      const numberCard = createCard({
        type: CardType.NUMBER,
        color: CardColor.RED,
        value: 5
      })
      
      const drawTwoCard = createCard({
        type: CardType.DRAW_TWO,
        color: CardColor.BLUE
      })
      
      const wildDrawFourCard = createCard({
        type: CardType.WILD_DRAW_FOUR,
        color: CardColor.WILD
      })
      
      expect(isDrawCard(numberCard)).toBe(false)
      expect(isDrawCard(drawTwoCard)).toBe(true)
      expect(isDrawCard(wildDrawFourCard)).toBe(true)
    })
  })

  describe('getCardScore', () => {
    it('应该返回数字卡的正确分数', () => {
      const card = createCard({
        type: CardType.NUMBER,
        color: CardColor.RED,
        value: 7
      })
      
      expect(getCardScore(card)).toBe(7)
    })

    it('应该返回特殊卡的正确分数', () => {
      expect(getCardScore(createCard({
        type: CardType.SKIP,
        color: CardColor.RED
      }))).toBe(20)

      expect(getCardScore(createCard({
        type: CardType.WILD,
        color: CardColor.WILD
      }))).toBe(50)

      expect(getCardScore(createCard({
        type: CardType.WILD_DRAW_FOUR,
        color: CardColor.WILD
      }))).toBe(50)
    })
  })

  describe('calculateHandScore', () => {
    it('应该正确计算手牌总分', () => {
      const hand = [
        createCard({ type: CardType.NUMBER, color: CardColor.RED, value: 5 }),
        createCard({ type: CardType.NUMBER, color: CardColor.BLUE, value: 3 }),
        createCard({ type: CardType.SKIP, color: CardColor.GREEN }),
        createCard({ type: CardType.WILD, color: CardColor.WILD }),
      ]
      
      // 5 + 3 + 20 + 50 = 78
      expect(calculateHandScore(hand)).toBe(78)
    })
  })

  describe('groupCardsByColor', () => {
    it('应该正确按颜色分组卡牌', () => {
      const cards = [
        createCard({ type: CardType.NUMBER, color: CardColor.RED, value: 5 }),
        createCard({ type: CardType.NUMBER, color: CardColor.BLUE, value: 3 }),
        createCard({ type: CardType.SKIP, color: CardColor.RED }),
        createCard({ type: CardType.WILD, color: CardColor.WILD }),
      ]
      
      const groups = groupCardsByColor(cards)
      
      expect(groups[CardColor.RED]).toHaveLength(2)
      expect(groups[CardColor.BLUE]).toHaveLength(1)
      expect(groups[CardColor.GREEN]).toHaveLength(0)
      expect(groups[CardColor.YELLOW]).toHaveLength(0)
      expect(groups[CardColor.WILD]).toHaveLength(1)
    })
  })

  describe('groupCardsByType', () => {
    it('应该正确按类型分组卡牌', () => {
      const cards = [
        createCard({ type: CardType.NUMBER, color: CardColor.RED, value: 5 }),
        createCard({ type: CardType.NUMBER, color: CardColor.BLUE, value: 3 }),
        createCard({ type: CardType.SKIP, color: CardColor.RED }),
        createCard({ type: CardType.WILD, color: CardColor.WILD }),
      ]
      
      const groups = groupCardsByType(cards)
      
      expect(groups[CardType.NUMBER]).toHaveLength(2)
      expect(groups[CardType.SKIP]).toHaveLength(1)
      expect(groups[CardType.REVERSE]).toHaveLength(0)
      expect(groups[CardType.DRAW_TWO]).toHaveLength(0)
      expect(groups[CardType.WILD]).toHaveLength(1)
      expect(groups[CardType.WILD_DRAW_FOUR]).toHaveLength(0)
    })
  })
}) 