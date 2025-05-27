import { describe, it, expect } from 'vitest'
import { Card } from '../Card'
import { CardColor, CardType } from '../../types'

describe('Card', () => {
  describe('构造函数', () => {
    it('应该创建数字卡', () => {
      const card = new Card(CardType.NUMBER, CardColor.RED, 5)
      
      expect(card.type).toBe(CardType.NUMBER)
      expect(card.color).toBe(CardColor.RED)
      expect(card.value).toBe(5)
      expect(card.id).toBeDefined()
      expect(card.id).toMatch(/^number-red-5-[a-z0-9]+$/)
    })

    it('应该创建功能卡', () => {
      const card = new Card(CardType.SKIP, CardColor.BLUE)
      
      expect(card.type).toBe(CardType.SKIP)
      expect(card.color).toBe(CardColor.BLUE)
      expect(card.value).toBeUndefined()
      expect(card.id).toMatch(/^skip-blue-none-[a-z0-9]+$/)
    })

    it('应该创建万能卡', () => {
      const card = new Card(CardType.WILD)
      
      expect(card.type).toBe(CardType.WILD)
      expect(card.color).toBe(CardColor.WILD)
      expect(card.value).toBeUndefined()
    })

    it('应该为每张卡生成唯一ID', () => {
      const card1 = new Card(CardType.NUMBER, CardColor.RED, 5)
      const card2 = new Card(CardType.NUMBER, CardColor.RED, 5)
      
      expect(card1.id).not.toBe(card2.id)
    })
  })

  describe('canPlayOn', () => {
    it('万能卡应该可以出在任何卡上', () => {
      const wildCard = new Card(CardType.WILD)
      const wildDrawFour = new Card(CardType.WILD_DRAW_FOUR)
      const targetCard = new Card(CardType.NUMBER, CardColor.RED, 5)
      
      expect(wildCard.canPlayOn(targetCard)).toBe(true)
      expect(wildDrawFour.canPlayOn(targetCard)).toBe(true)
    })

    it('相同颜色的卡应该可以出', () => {
      const card1 = new Card(CardType.NUMBER, CardColor.RED, 5)
      const card2 = new Card(CardType.SKIP, CardColor.RED)
      
      expect(card1.canPlayOn(card2)).toBe(true)
      expect(card2.canPlayOn(card1)).toBe(true)
    })

    it('相同数字的卡应该可以出', () => {
      const card1 = new Card(CardType.NUMBER, CardColor.RED, 5)
      const card2 = new Card(CardType.NUMBER, CardColor.BLUE, 5)
      
      expect(card1.canPlayOn(card2)).toBe(true)
      expect(card2.canPlayOn(card1)).toBe(true)
    })

    it('相同类型的功能卡应该可以出', () => {
      const card1 = new Card(CardType.SKIP, CardColor.RED)
      const card2 = new Card(CardType.SKIP, CardColor.BLUE)
      
      expect(card1.canPlayOn(card2)).toBe(true)
      expect(card2.canPlayOn(card1)).toBe(true)
    })

    it('不同颜色不同数字的卡不应该可以出', () => {
      const card1 = new Card(CardType.NUMBER, CardColor.RED, 5)
      const card2 = new Card(CardType.NUMBER, CardColor.BLUE, 7)
      
      expect(card1.canPlayOn(card2)).toBe(false)
      expect(card2.canPlayOn(card1)).toBe(false)
    })

    it('应该可以出在万能卡上（根据当前颜色）', () => {
      const wildCard = new Card(CardType.WILD, CardColor.RED) // 万能卡选择了红色
      const redCard = new Card(CardType.NUMBER, CardColor.RED, 5)
      const blueCard = new Card(CardType.NUMBER, CardColor.BLUE, 5)
      
      expect(redCard.canPlayOn(wildCard)).toBe(true)
      expect(blueCard.canPlayOn(wildCard)).toBe(false)
    })
  })

  describe('卡牌类型检查', () => {
    it('isNumberCard应该正确识别数字卡', () => {
      const numberCard = new Card(CardType.NUMBER, CardColor.RED, 5)
      const skipCard = new Card(CardType.SKIP, CardColor.RED)
      const wildCard = new Card(CardType.WILD)
      
      expect(numberCard.isNumberCard()).toBe(true)
      expect(skipCard.isNumberCard()).toBe(false)
      expect(wildCard.isNumberCard()).toBe(false)
    })

    it('isActionCard应该正确识别功能卡', () => {
      const skipCard = new Card(CardType.SKIP, CardColor.RED)
      const reverseCard = new Card(CardType.REVERSE, CardColor.BLUE)
      const drawTwoCard = new Card(CardType.DRAW_TWO, CardColor.GREEN)
      const numberCard = new Card(CardType.NUMBER, CardColor.RED, 5)
      const wildCard = new Card(CardType.WILD)
      
      expect(skipCard.isActionCard()).toBe(true)
      expect(reverseCard.isActionCard()).toBe(true)
      expect(drawTwoCard.isActionCard()).toBe(true)
      expect(numberCard.isActionCard()).toBe(false)
      expect(wildCard.isActionCard()).toBe(false)
    })

    it('isWildCard应该正确识别万能卡', () => {
      const wildCard = new Card(CardType.WILD)
      const wildDrawFourCard = new Card(CardType.WILD_DRAW_FOUR)
      const numberCard = new Card(CardType.NUMBER, CardColor.RED, 5)
      const skipCard = new Card(CardType.SKIP, CardColor.RED)
      
      expect(wildCard.isWildCard()).toBe(true)
      expect(wildDrawFourCard.isWildCard()).toBe(true)
      expect(numberCard.isWildCard()).toBe(false)
      expect(skipCard.isWildCard()).toBe(false)
    })
  })

  describe('getPoints', () => {
    it('数字卡应该返回对应的数字分值', () => {
      const card0 = new Card(CardType.NUMBER, CardColor.RED, 0)
      const card5 = new Card(CardType.NUMBER, CardColor.BLUE, 5)
      const card9 = new Card(CardType.NUMBER, CardColor.GREEN, 9)
      
      expect(card0.getPoints()).toBe(0)
      expect(card5.getPoints()).toBe(5)
      expect(card9.getPoints()).toBe(9)
    })

    it('功能卡应该返回20分', () => {
      const skipCard = new Card(CardType.SKIP, CardColor.RED)
      const reverseCard = new Card(CardType.REVERSE, CardColor.BLUE)
      const drawTwoCard = new Card(CardType.DRAW_TWO, CardColor.GREEN)
      
      expect(skipCard.getPoints()).toBe(20)
      expect(reverseCard.getPoints()).toBe(20)
      expect(drawTwoCard.getPoints()).toBe(20)
    })

    it('万能卡应该返回50分', () => {
      const wildCard = new Card(CardType.WILD)
      const wildDrawFourCard = new Card(CardType.WILD_DRAW_FOUR)
      
      expect(wildCard.getPoints()).toBe(50)
      expect(wildDrawFourCard.getPoints()).toBe(50)
    })

    it('没有值的数字卡应该返回0分', () => {
      const card = new Card(CardType.NUMBER, CardColor.RED)
      expect(card.getPoints()).toBe(0)
    })
  })

  describe('getDisplayName', () => {
    it('数字卡应该显示颜色和数字', () => {
      const card = new Card(CardType.NUMBER, CardColor.RED, 5)
      expect(card.getDisplayName()).toBe('red 5')
    })

    it('功能卡应该显示颜色和功能名称', () => {
      const skipCard = new Card(CardType.SKIP, CardColor.BLUE)
      const reverseCard = new Card(CardType.REVERSE, CardColor.GREEN)
      const drawTwoCard = new Card(CardType.DRAW_TWO, CardColor.YELLOW)
      
      expect(skipCard.getDisplayName()).toBe('blue 跳过')
      expect(reverseCard.getDisplayName()).toBe('green 反转')
      expect(drawTwoCard.getDisplayName()).toBe('yellow +2')
    })

    it('万能卡应该只显示功能名称', () => {
      const wildCard = new Card(CardType.WILD)
      const wildDrawFourCard = new Card(CardType.WILD_DRAW_FOUR)
      
      expect(wildCard.getDisplayName()).toBe('万能牌')
      expect(wildDrawFourCard.getDisplayName()).toBe('万能+4')
    })
  })

  describe('clone', () => {
    it('应该创建卡牌的完整副本', () => {
      const original = new Card(CardType.NUMBER, CardColor.RED, 5)
      const cloned = original.clone()
      
      expect(cloned.type).toBe(original.type)
      expect(cloned.color).toBe(original.color)
      expect(cloned.value).toBe(original.value)
      expect(cloned.id).not.toBe(original.id) // ID应该不同
    })

    it('应该正确克隆万能卡', () => {
      const original = new Card(CardType.WILD, CardColor.RED) // 万能卡选择了红色
      const cloned = original.clone()
      
      expect(cloned.type).toBe(original.type)
      expect(cloned.color).toBe(original.color)
      expect(cloned.value).toBe(original.value)
    })
  })

  describe('equals', () => {
    it('相同属性的卡牌应该相等', () => {
      const card1 = new Card(CardType.NUMBER, CardColor.RED, 5)
      const card2 = new Card(CardType.NUMBER, CardColor.RED, 5)
      
      expect(card1.equals(card2)).toBe(true)
      expect(card2.equals(card1)).toBe(true)
    })

    it('不同属性的卡牌应该不相等', () => {
      const card1 = new Card(CardType.NUMBER, CardColor.RED, 5)
      const card2 = new Card(CardType.NUMBER, CardColor.BLUE, 5)
      const card3 = new Card(CardType.NUMBER, CardColor.RED, 7)
      const card4 = new Card(CardType.SKIP, CardColor.RED)
      
      expect(card1.equals(card2)).toBe(false)
      expect(card1.equals(card3)).toBe(false)
      expect(card1.equals(card4)).toBe(false)
    })

    it('ID不同但其他属性相同的卡牌应该相等', () => {
      const card1 = new Card(CardType.NUMBER, CardColor.RED, 5)
      const card2 = new Card(CardType.NUMBER, CardColor.RED, 5)
      
      expect(card1.id).not.toBe(card2.id)
      expect(card1.equals(card2)).toBe(true)
    })
  })

  describe('JSON序列化', () => {
    it('toJSON应该返回正确的JSON对象', () => {
      const card = new Card(CardType.NUMBER, CardColor.RED, 5)
      const json = card.toJSON()
      
      expect(json).toEqual({
        id: card.id,
        type: CardType.NUMBER,
        color: CardColor.RED,
        value: 5
      })
    })

    it('fromJSON应该正确创建Card实例', () => {
      const json = {
        id: 'test-id',
        type: CardType.SKIP,
        color: CardColor.BLUE,
        value: undefined
      }
      
      const card = Card.fromJSON(json)
      
      expect(card.id).toBe('test-id')
      expect(card.type).toBe(CardType.SKIP)
      expect(card.color).toBe(CardColor.BLUE)
      expect(card.value).toBeUndefined()
    })

    it('JSON序列化和反序列化应该保持一致', () => {
      const original = new Card(CardType.WILD_DRAW_FOUR, CardColor.GREEN)
      const json = original.toJSON()
      const restored = Card.fromJSON(json)
      
      expect(restored.id).toBe(original.id)
      expect(restored.type).toBe(original.type)
      expect(restored.color).toBe(original.color)
      expect(restored.value).toBe(original.value)
    })
  })

  describe('边界情况', () => {
    it('应该处理0值的数字卡', () => {
      const card = new Card(CardType.NUMBER, CardColor.RED, 0)
      
      expect(card.value).toBe(0)
      expect(card.getPoints()).toBe(0)
      expect(card.getDisplayName()).toBe('red 0')
    })

    it('应该处理没有值的数字卡', () => {
      const card = new Card(CardType.NUMBER, CardColor.RED)
      
      expect(card.value).toBeUndefined()
      expect(card.getPoints()).toBe(0)
      expect(card.getDisplayName()).toBe('red undefined')
    })

    it('应该处理未知卡牌类型的显示名称', () => {
      // 创建一个具有未知类型的卡牌（通过类型断言）
      const card = new Card('unknown' as CardType, CardColor.RED)
      
      expect(card.getDisplayName()).toBe('red unknown')
    })
  })
}) 