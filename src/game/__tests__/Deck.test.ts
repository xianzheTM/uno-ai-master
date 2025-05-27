import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Deck } from '../Deck'
import { Card } from '../Card'
import { CardColor, CardType } from '../../types'

// Mock shuffleUtils
vi.mock('../../utils/shuffleUtils', () => ({
  shuffleArray: vi.fn((arr) => [...arr].reverse()) // 简单的反转作为洗牌
}))

describe('Deck', () => {
  let deck: Deck

  beforeEach(() => {
    deck = new Deck()
  })

  describe('构造函数', () => {
    it('应该创建空牌堆', () => {
      expect(deck.getCount()).toBe(0)
      expect(deck.isEmpty()).toBe(true)
    })

    it('应该使用提供的卡牌创建牌堆', () => {
      const cards = [
        new Card(CardType.NUMBER, CardColor.RED, 5),
        new Card(CardType.SKIP, CardColor.BLUE)
      ]
      const deckWithCards = new Deck(cards)
      
      expect(deckWithCards.getCount()).toBe(2)
      expect(deckWithCards.isEmpty()).toBe(false)
    })
  })

  describe('createStandardDeck', () => {
    it('应该创建标准108张UNO牌堆', () => {
      const standardDeck = Deck.createStandardDeck()
      
      expect(standardDeck.getCount()).toBe(108)
      expect(standardDeck.isEmpty()).toBe(false)
    })

    it('标准牌堆应该包含正确数量的各类卡牌', () => {
      const standardDeck = Deck.createStandardDeck()
      const allCards = standardDeck.getAllCards()
      
      // 数字卡：每种颜色19张（0卡1张，1-9卡各2张）
      const numberCards = allCards.filter(c => c.isNumberCard())
      expect(numberCards).toHaveLength(76)
      
      // 功能卡：每种颜色6张（跳过、反转、+2各2张）
      const actionCards = allCards.filter(c => c.isActionCard())
      expect(actionCards).toHaveLength(24)
      
      // 万能卡：8张（万能4张，万能+4卡4张）
      const wildCards = allCards.filter(c => c.isWildCard())
      expect(wildCards).toHaveLength(8)
    })

    it('标准牌堆应该包含正确的0卡数量', () => {
      const standardDeck = Deck.createStandardDeck()
      const allCards = standardDeck.getAllCards()
      
      const zeroCards = allCards.filter(c => c.value === 0)
      expect(zeroCards).toHaveLength(4) // 每种颜色1张
    })

    it('标准牌堆应该包含正确的1-9卡数量', () => {
      const standardDeck = Deck.createStandardDeck()
      const allCards = standardDeck.getAllCards()
      
      for (let num = 1; num <= 9; num++) {
        const numCards = allCards.filter(c => c.value === num)
        expect(numCards).toHaveLength(8) // 每种颜色2张，共8张
      }
    })

    it('标准牌堆应该包含正确的功能卡数量', () => {
      const standardDeck = Deck.createStandardDeck()
      const allCards = standardDeck.getAllCards()
      
      const skipCards = allCards.filter(c => c.type === CardType.SKIP)
      const reverseCards = allCards.filter(c => c.type === CardType.REVERSE)
      const drawTwoCards = allCards.filter(c => c.type === CardType.DRAW_TWO)
      
      expect(skipCards).toHaveLength(8) // 每种颜色2张
      expect(reverseCards).toHaveLength(8)
      expect(drawTwoCards).toHaveLength(8)
    })

    it('标准牌堆应该包含正确的万能卡数量', () => {
      const standardDeck = Deck.createStandardDeck()
      const allCards = standardDeck.getAllCards()
      
      const wildCards = allCards.filter(c => c.type === CardType.WILD)
      const wildDrawFourCards = allCards.filter(c => c.type === CardType.WILD_DRAW_FOUR)
      
      expect(wildCards).toHaveLength(4)
      expect(wildDrawFourCards).toHaveLength(4)
    })
  })

  describe('基本操作', () => {
    beforeEach(() => {
      const cards = [
        new Card(CardType.NUMBER, CardColor.RED, 5),
        new Card(CardType.SKIP, CardColor.BLUE),
        new Card(CardType.WILD)
      ]
      deck = new Deck(cards)
    })

    it('getCount应该返回正确的卡牌数量', () => {
      expect(deck.getCount()).toBe(3)
    })

    it('isEmpty应该正确检查牌堆是否为空', () => {
      expect(deck.isEmpty()).toBe(false)
      
      const emptyDeck = new Deck()
      expect(emptyDeck.isEmpty()).toBe(true)
    })

    it('clear应该清空牌堆', () => {
      deck.clear()
      
      expect(deck.getCount()).toBe(0)
      expect(deck.isEmpty()).toBe(true)
    })

    it('getAllCards应该返回所有卡牌的副本', () => {
      const allCards = deck.getAllCards()
      
      expect(allCards).toHaveLength(3)
      expect(allCards).not.toBe(deck['cards']) // 不是同一个数组
    })
  })

  describe('发牌功能', () => {
    beforeEach(() => {
      const cards = [
        new Card(CardType.NUMBER, CardColor.RED, 5),
        new Card(CardType.SKIP, CardColor.BLUE),
        new Card(CardType.WILD)
      ]
      deck = new Deck(cards)
    })

    it('drawCard应该从顶部发一张牌', () => {
      const drawnCard = deck.drawCard()
      
      expect(drawnCard).toBeDefined()
      expect(drawnCard!.type).toBe(CardType.WILD) // 最后添加的卡在顶部
      expect(deck.getCount()).toBe(2)
    })

    it('drawCard应该在牌堆为空时返回null', () => {
      deck.clear()
      const drawnCard = deck.drawCard()
      
      expect(drawnCard).toBeNull()
    })

    it('drawCards应该发指定数量的牌', () => {
      const drawnCards = deck.drawCards(2)
      
      expect(drawnCards).toHaveLength(2)
      expect(deck.getCount()).toBe(1)
    })

    it('drawCards应该在牌不够时发所有剩余的牌', () => {
      const drawnCards = deck.drawCards(5)
      
      expect(drawnCards).toHaveLength(3) // 只有3张牌
      expect(deck.getCount()).toBe(0)
      expect(deck.isEmpty()).toBe(true)
    })

    it('drawCards应该在牌堆为空时返回空数组', () => {
      deck.clear()
      const drawnCards = deck.drawCards(3)
      
      expect(drawnCards).toHaveLength(0)
    })
  })

  describe('添加卡牌', () => {
    beforeEach(() => {
      const cards = [
        new Card(CardType.NUMBER, CardColor.RED, 5),
        new Card(CardType.SKIP, CardColor.BLUE)
      ]
      deck = new Deck(cards)
    })

    it('addCard应该添加卡牌到底部', () => {
      const newCard = new Card(CardType.WILD)
      deck.addCard(newCard)
      
      expect(deck.getCount()).toBe(3)
      
      // 验证卡牌在底部
      const bottomCard = deck.peekBottom()
      expect(bottomCard!.type).toBe(CardType.WILD)
    })

    it('addCards应该添加多张卡牌到底部', () => {
      const newCards = [
        new Card(CardType.WILD),
        new Card(CardType.REVERSE, CardColor.GREEN)
      ]
      deck.addCards(newCards)
      
      expect(deck.getCount()).toBe(4)
    })

    it('addCardToTop应该添加卡牌到顶部', () => {
      const newCard = new Card(CardType.WILD)
      deck.addCardToTop(newCard)
      
      expect(deck.getCount()).toBe(3)
      
      // 验证卡牌在顶部
      const topCard = deck.peek()
      expect(topCard!.type).toBe(CardType.WILD)
    })
  })

  describe('查看卡牌', () => {
    beforeEach(() => {
      const cards = [
        new Card(CardType.NUMBER, CardColor.RED, 5),
        new Card(CardType.SKIP, CardColor.BLUE),
        new Card(CardType.WILD)
      ]
      deck = new Deck(cards)
    })

    it('peek应该返回顶部卡牌但不移除', () => {
      const topCard = deck.peek()
      
      expect(topCard).toBeDefined()
      expect(topCard!.type).toBe(CardType.WILD)
      expect(deck.getCount()).toBe(3) // 数量不变
    })

    it('peek应该在牌堆为空时返回null', () => {
      deck.clear()
      const topCard = deck.peek()
      
      expect(topCard).toBeNull()
    })

    it('peekBottom应该返回底部卡牌但不移除', () => {
      const bottomCard = deck.peekBottom()
      
      expect(bottomCard).toBeDefined()
      expect(bottomCard!.type).toBe(CardType.NUMBER)
      expect(bottomCard!.value).toBe(5)
      expect(deck.getCount()).toBe(3) // 数量不变
    })

    it('peekBottom应该在牌堆为空时返回null', () => {
      deck.clear()
      const bottomCard = deck.peekBottom()
      
      expect(bottomCard).toBeNull()
    })
  })

  describe('洗牌功能', () => {
    it('shuffle应该调用shuffleArray', async () => {
      const { shuffleArray } = await import('../../utils/shuffleUtils')
      const cards = [
        new Card(CardType.NUMBER, CardColor.RED, 5),
        new Card(CardType.SKIP, CardColor.BLUE),
        new Card(CardType.WILD)
      ]
      deck = new Deck(cards)
      
      deck.shuffle()
      
      expect(shuffleArray).toHaveBeenCalledWith(cards)
    })
  })

  describe('牌堆重新填充', () => {
    it('refillFromDiscardPile应该从弃牌堆重新填充', () => {
      const discardPile = [
        new Card(CardType.NUMBER, CardColor.RED, 5),
        new Card(CardType.SKIP, CardColor.BLUE),
        new Card(CardType.WILD, CardColor.RED), // 万能牌选择了红色
        new Card(CardType.NUMBER, CardColor.GREEN, 7) // 顶部卡牌
      ]
      
      deck.refillFromDiscardPile(discardPile)
      
      expect(deck.getCount()).toBe(3) // 除了顶部卡牌的其他3张
    })

    it('refillFromDiscardPile应该重置万能卡的颜色', () => {
      const discardPile = [
        new Card(CardType.WILD, CardColor.RED), // 万能卡选择了红色
        new Card(CardType.NUMBER, CardColor.GREEN, 7) // 顶部卡牌
      ]
      
      deck.refillFromDiscardPile(discardPile)
      
      const allCards = deck.getAllCards()
      const wildCard = allCards.find(c => c.isWildCard())
      expect(wildCard!.color).toBe(CardColor.WILD) // 应该重置为WILD
    })

    it('refillFromDiscardPile应该在弃牌堆不足时不做任何操作', () => {
      const discardPile = [
        new Card(CardType.NUMBER, CardColor.GREEN, 7) // 只有1张牌
      ]
      
      deck.refillFromDiscardPile(discardPile)
      
      expect(deck.getCount()).toBe(0) // 没有添加任何牌
    })

    it('refillFromDiscardPile应该在空弃牌堆时不做任何操作', () => {
      const discardPile: Card[] = []
      
      deck.refillFromDiscardPile(discardPile)
      
      expect(deck.getCount()).toBe(0)
    })
  })

  describe('卡牌查找和移除', () => {
    beforeEach(() => {
      const cards = [
        new Card(CardType.NUMBER, CardColor.RED, 5),
        new Card(CardType.SKIP, CardColor.BLUE),
        new Card(CardType.WILD)
      ]
      deck = new Deck(cards)
    })

    it('contains应该正确检查是否包含指定卡牌', () => {
      const targetCard = new Card(CardType.NUMBER, CardColor.RED, 5)
      const nonExistentCard = new Card(CardType.NUMBER, CardColor.YELLOW, 8)
      
      expect(deck.contains(targetCard)).toBe(true)
      expect(deck.contains(nonExistentCard)).toBe(false)
    })

    it('removeCard应该成功移除指定卡牌', () => {
      const targetCard = new Card(CardType.NUMBER, CardColor.RED, 5)
      const result = deck.removeCard(targetCard)
      
      expect(result).toBe(true)
      expect(deck.getCount()).toBe(2)
      expect(deck.contains(targetCard)).toBe(false)
    })

    it('removeCard应该在卡牌不存在时返回false', () => {
      const nonExistentCard = new Card(CardType.NUMBER, CardColor.YELLOW, 8)
      const result = deck.removeCard(nonExistentCard)
      
      expect(result).toBe(false)
      expect(deck.getCount()).toBe(3) // 数量不变
    })
  })

  describe('统计信息', () => {
    beforeEach(() => {
      const cards = [
        new Card(CardType.NUMBER, CardColor.RED, 5),
        new Card(CardType.NUMBER, CardColor.BLUE, 7),
        new Card(CardType.SKIP, CardColor.GREEN),
        new Card(CardType.REVERSE, CardColor.YELLOW),
        new Card(CardType.WILD),
        new Card(CardType.WILD_DRAW_FOUR)
      ]
      deck = new Deck(cards)
    })

    it('getStatistics应该返回正确的统计信息', () => {
      const stats = deck.getStatistics()
      
      expect(stats.total).toBe(6)
      expect(stats.numberCards).toBe(2)
      expect(stats.actionCards).toBe(2)
      expect(stats.wildCards).toBe(2)
      expect(stats.byColor.red).toBe(1)
      expect(stats.byColor.blue).toBe(1)
      expect(stats.byColor.green).toBe(1)
      expect(stats.byColor.yellow).toBe(1)
      expect(stats.byColor.wild).toBe(2)
    })

    it('getStatistics应该处理空牌堆', () => {
      deck.clear()
      const stats = deck.getStatistics()
      
      expect(stats.total).toBe(0)
      expect(stats.numberCards).toBe(0)
      expect(stats.actionCards).toBe(0)
      expect(stats.wildCards).toBe(0)
      expect(Object.keys(stats.byColor)).toHaveLength(0)
    })
  })

  describe('克隆', () => {
    beforeEach(() => {
      const cards = [
        new Card(CardType.NUMBER, CardColor.RED, 5),
        new Card(CardType.SKIP, CardColor.BLUE),
        new Card(CardType.WILD)
      ]
      deck = new Deck(cards)
    })

    it('clone应该创建牌堆的完整副本', () => {
      const cloned = deck.clone()
      
      expect(cloned.getCount()).toBe(deck.getCount())
      expect(cloned).not.toBe(deck) // 不是同一个对象
      
      // 验证卡牌是副本
      const originalCards = deck.getAllCards()
      const clonedCards = cloned.getAllCards()
      
      clonedCards.forEach((card, index) => {
        expect(card.equals(originalCards[index])).toBe(true)
        expect(card).not.toBe(originalCards[index]) // 不是同一个对象
      })
    })

    it('克隆的牌堆应该独立操作', () => {
      const cloned = deck.clone()
      
      // 从原牌堆发牌
      deck.drawCard()
      
      // 克隆的牌堆不应该受影响
      expect(deck.getCount()).toBe(2)
      expect(cloned.getCount()).toBe(3)
    })
  })

  describe('边界情况', () => {
    it('应该处理大量卡牌', () => {
      const cards = Array.from({ length: 1000 }, (_, i) => 
        new Card(CardType.NUMBER, CardColor.RED, i % 10)
      )
      const largeDeck = new Deck(cards)
      
      expect(largeDeck.getCount()).toBe(1000)
      expect(largeDeck.isEmpty()).toBe(false)
      
      // 发一半的牌
      const drawnCards = largeDeck.drawCards(500)
      expect(drawnCards).toHaveLength(500)
      expect(largeDeck.getCount()).toBe(500)
    })

    it('应该处理连续的发牌和添加操作', () => {
      const cards = [
        new Card(CardType.NUMBER, CardColor.RED, 5),
        new Card(CardType.SKIP, CardColor.BLUE)
      ]
      deck = new Deck(cards)
      
      // 发一张牌
      const drawnCard = deck.drawCard()
      expect(deck.getCount()).toBe(1)
      
      // 添加回去
      deck.addCard(drawnCard!)
      expect(deck.getCount()).toBe(2)
      
      // 再次发牌
      const secondDrawn = deck.drawCard()
      expect(deck.getCount()).toBe(1)
      expect(secondDrawn).toBeDefined()
    })

    it('应该处理重复的卡牌', () => {
      const card1 = new Card(CardType.NUMBER, CardColor.RED, 5)
      const card2 = new Card(CardType.NUMBER, CardColor.RED, 5) // 相同属性但不同实例
      
      deck.addCard(card1)
      deck.addCard(card2)
      
      expect(deck.getCount()).toBe(2)
      expect(deck.contains(card1)).toBe(true)
      expect(deck.contains(card2)).toBe(true)
    })
  })
}) 