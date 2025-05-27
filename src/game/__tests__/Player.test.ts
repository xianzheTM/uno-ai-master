import { describe, it, expect, beforeEach } from 'vitest'
import { Player } from '../Player'
import { Card } from '../Card'
import { PlayerType, AIDifficulty, PlayerStatus, CardColor, CardType } from '../../types'

describe('Player', () => {
  let player: Player
  let aiPlayer: Player

  beforeEach(() => {
    player = new Player('player1', 'Alice', PlayerType.HUMAN)
    aiPlayer = new Player('ai1', 'AI Bot', PlayerType.AI, AIDifficulty.MEDIUM)
  })

  describe('构造函数', () => {
    it('应该创建人类玩家', () => {
      expect(player.id).toBe('player1')
      expect(player.name).toBe('Alice')
      expect(player.type).toBe(PlayerType.HUMAN)
      expect(player.isAI).toBe(false)
      expect(player.aiDifficulty).toBeUndefined()
      expect(player.hand).toEqual([])
      expect(player.hasCalledUno).toBe(false)
      expect(player.score).toBe(0)
      expect(player.status).toBe(PlayerStatus.WAITING)
    })

    it('应该创建AI玩家', () => {
      expect(aiPlayer.id).toBe('ai1')
      expect(aiPlayer.name).toBe('AI Bot')
      expect(aiPlayer.type).toBe(PlayerType.AI)
      expect(aiPlayer.isAI).toBe(true)
      expect(aiPlayer.aiDifficulty).toBe(AIDifficulty.MEDIUM)
    })
  })

  describe('手牌管理', () => {
    it('addCard应该添加单张卡牌', () => {
      const card = new Card(CardType.NUMBER, CardColor.RED, 5)
      player.addCard(card)
      
      expect(player.hand).toHaveLength(1)
      expect(player.hand[0]).toBe(card)
      expect(player.hasCalledUno).toBe(false)
    })

    it('addCards应该添加多张卡牌', () => {
      const cards = [
        new Card(CardType.NUMBER, CardColor.RED, 5),
        new Card(CardType.SKIP, CardColor.BLUE),
        new Card(CardType.WILD)
      ]
      player.addCards(cards)
      
      expect(player.hand).toHaveLength(3)
      expect(player.hand).toEqual(cards)
    })

    it('添加卡牌应该重置UNO状态', () => {
      player.hasCalledUno = true
      const card = new Card(CardType.NUMBER, CardColor.RED, 5)
      player.addCard(card)
      
      expect(player.hasCalledUno).toBe(false)
    })

    it('clearHand应该清空手牌并重置UNO状态', () => {
      const cards = [
        new Card(CardType.NUMBER, CardColor.RED, 5),
        new Card(CardType.SKIP, CardColor.BLUE)
      ]
      player.addCards(cards)
      player.hasCalledUno = true
      
      player.clearHand()
      
      expect(player.hand).toHaveLength(0)
      expect(player.hasCalledUno).toBe(false)
    })
  })

  describe('出牌功能', () => {
    beforeEach(() => {
      const cards = [
        new Card(CardType.NUMBER, CardColor.RED, 5),
        new Card(CardType.SKIP, CardColor.BLUE),
        new Card(CardType.WILD)
      ]
      player.addCards(cards)
    })

    it('playCard应该成功出牌', () => {
      const cardId = player.hand[0].id
      const playedCard = player.playCard(cardId)
      
      expect(playedCard).toBeDefined()
      expect(playedCard!.id).toBe(cardId)
      expect(player.hand).toHaveLength(2)
    })

    it('playCard应该在出牌后自动调用UNO（剩余1张牌）', () => {
      // 先出两张牌，剩下1张
      player.playCard(player.hand[0].id)
      player.playCard(player.hand[0].id)
      
      expect(player.hand).toHaveLength(1)
      expect(player.hasCalledUno).toBe(true)
    })

    it('playCard应该在卡牌不存在时返回null', () => {
      const result = player.playCard('non-existent-id')
      
      expect(result).toBeNull()
      expect(player.hand).toHaveLength(3)
    })

    it('canPlayCard应该正确检查是否可以出牌', () => {
      const currentCard = new Card(CardType.NUMBER, CardColor.RED, 7)
      const redCard = player.hand.find(c => c.color === CardColor.RED)!
      const wildCard = player.hand.find(c => c.isWildCard())!
      const blueCard = player.hand.find(c => c.color === CardColor.BLUE)!
      
      expect(player.canPlayCard(redCard.id, currentCard)).toBe(true)
      expect(player.canPlayCard(wildCard.id, currentCard)).toBe(true)
      expect(player.canPlayCard(blueCard.id, currentCard)).toBe(false)
    })

    it('canPlayCard应该在卡牌不存在时返回false', () => {
      const currentCard = new Card(CardType.NUMBER, CardColor.RED, 7)
      
      expect(player.canPlayCard('non-existent-id', currentCard)).toBe(false)
    })
  })

  describe('可出牌检查', () => {
    beforeEach(() => {
      const cards = [
        new Card(CardType.NUMBER, CardColor.RED, 5),
        new Card(CardType.NUMBER, CardColor.BLUE, 7),
        new Card(CardType.SKIP, CardColor.GREEN),
        new Card(CardType.WILD)
      ]
      player.addCards(cards)
    })

    it('getPlayableCards应该返回可出的牌', () => {
      const currentCard = new Card(CardType.NUMBER, CardColor.RED, 3)
      const playableCards = player.getPlayableCards(currentCard)
      
      expect(playableCards).toHaveLength(2) // 红5和万能牌
      expect(playableCards.some(c => c.color === CardColor.RED)).toBe(true)
      expect(playableCards.some(c => c.isWildCard())).toBe(true)
    })

    it('hasPlayableCard应该正确检查是否有可出的牌', () => {
      const redCard = new Card(CardType.NUMBER, CardColor.RED, 3)
      const yellowCard = new Card(CardType.NUMBER, CardColor.YELLOW, 8)
      
      expect(player.hasPlayableCard(redCard)).toBe(true)
      expect(player.hasPlayableCard(yellowCard)).toBe(true) // 万能牌可以出
    })

    it('hasPlayableCard应该在没有可出牌时返回false', () => {
      // 移除万能牌
      player.hand = player.hand.filter(c => !c.isWildCard())
      const yellowCard = new Card(CardType.NUMBER, CardColor.YELLOW, 8)
      
      expect(player.hasPlayableCard(yellowCard)).toBe(false)
    })
  })

  describe('UNO功能', () => {
    it('callUno应该设置UNO状态', () => {
      player.callUno()
      expect(player.hasCalledUno).toBe(true)
    })

    it('resetUnoCall应该重置UNO状态', () => {
      player.hasCalledUno = true
      player.resetUnoCall()
      expect(player.hasCalledUno).toBe(false)
    })

    it('shouldCallUno应该在剩余1张牌且未调用UNO时返回true', () => {
      const card = new Card(CardType.NUMBER, CardColor.RED, 5)
      player.addCard(card)
      
      expect(player.shouldCallUno()).toBe(true)
    })

    it('shouldCallUno应该在已调用UNO时返回false', () => {
      const card = new Card(CardType.NUMBER, CardColor.RED, 5)
      player.addCard(card)
      player.callUno()
      
      expect(player.shouldCallUno()).toBe(false)
    })

    it('shouldCallUno应该在手牌不是1张时返回false', () => {
      const cards = [
        new Card(CardType.NUMBER, CardColor.RED, 5),
        new Card(CardType.SKIP, CardColor.BLUE)
      ]
      player.addCards(cards)
      
      expect(player.shouldCallUno()).toBe(false)
    })

    it('hasUnoViolation应该正确检查UNO违规', () => {
      const card = new Card(CardType.NUMBER, CardColor.RED, 5)
      player.addCard(card)
      
      expect(player.hasUnoViolation()).toBe(true)
      
      player.callUno()
      expect(player.hasUnoViolation()).toBe(false)
    })
  })

  describe('游戏状态', () => {
    it('getHandCount应该返回手牌数量', () => {
      expect(player.getHandCount()).toBe(0)
      
      const cards = [
        new Card(CardType.NUMBER, CardColor.RED, 5),
        new Card(CardType.SKIP, CardColor.BLUE)
      ]
      player.addCards(cards)
      
      expect(player.getHandCount()).toBe(2)
    })

    it('hasWon应该在手牌为空时返回true', () => {
      expect(player.hasWon()).toBe(true)
      
      const card = new Card(CardType.NUMBER, CardColor.RED, 5)
      player.addCard(card)
      
      expect(player.hasWon()).toBe(false)
    })

    it('isHuman应该正确识别人类玩家', () => {
      expect(player.isHuman()).toBe(true)
      expect(aiPlayer.isHuman()).toBe(false)
    })
  })

  describe('分数管理', () => {
    beforeEach(() => {
      const cards = [
        new Card(CardType.NUMBER, CardColor.RED, 5),
        new Card(CardType.SKIP, CardColor.BLUE),
        new Card(CardType.WILD)
      ]
      player.addCards(cards)
    })

    it('calculateHandScore应该正确计算手牌总分', () => {
      const expectedScore = 5 + 20 + 50 // 数字5 + 跳过20 + 万能50
      expect(player.calculateHandScore()).toBe(expectedScore)
    })

    it('addScore应该增加分数', () => {
      player.addScore(100)
      expect(player.score).toBe(100)
      
      player.addScore(50)
      expect(player.score).toBe(150)
    })

    it('resetScore应该重置分数', () => {
      player.score = 100
      player.resetScore()
      expect(player.score).toBe(0)
    })
  })

  describe('手牌分析', () => {
    beforeEach(() => {
      const cards = [
        new Card(CardType.NUMBER, CardColor.RED, 5),
        new Card(CardType.NUMBER, CardColor.RED, 7),
        new Card(CardType.SKIP, CardColor.BLUE),
        new Card(CardType.REVERSE, CardColor.GREEN),
        new Card(CardType.WILD),
        new Card(CardType.WILD_DRAW_FOUR)
      ]
      player.addCards(cards)
    })

    it('getHandCopy应该返回手牌的副本', () => {
      const handCopy = player.getHandCopy()
      
      expect(handCopy).toHaveLength(player.hand.length)
      expect(handCopy).not.toBe(player.hand) // 不是同一个数组
      
      // 检查每张卡都是副本
      handCopy.forEach((card, index) => {
        expect(card).not.toBe(player.hand[index])
        expect(card.equals(player.hand[index])).toBe(true)
      })
    })

    it('getHandByColor应该按颜色分组手牌', () => {
      const grouped = player.getHandByColor()
      
      expect(grouped.red).toHaveLength(2)
      expect(grouped.blue).toHaveLength(1)
      expect(grouped.green).toHaveLength(1)
      expect(grouped.yellow).toHaveLength(0)
      expect(grouped.wild).toHaveLength(2)
    })

    it('getHandByType应该按类型分组手牌', () => {
      const grouped = player.getHandByType()
      
      expect(grouped.number).toHaveLength(2)
      expect(grouped.skip).toHaveLength(1)
      expect(grouped.reverse).toHaveLength(1)
      expect(grouped.wild).toHaveLength(1)
      expect(grouped.wild_draw_four).toHaveLength(1)
    })

    it('getHandStatistics应该返回正确的统计信息', () => {
      const stats = player.getHandStatistics()
      
      expect(stats.total).toBe(6)
      expect(stats.numberCards).toBe(2)
      expect(stats.actionCards).toBe(2)
      expect(stats.wildCards).toBe(2)
      expect(stats.byColor.red).toBe(2)
      expect(stats.byColor.blue).toBe(1)
      expect(stats.byColor.green).toBe(1)
      expect(stats.byColor.wild).toBe(2)
      expect(stats.totalPoints).toBe(5 + 7 + 20 + 20 + 50 + 50) // 152
    })

    it('hasColor应该正确检查是否有指定颜色的牌', () => {
      expect(player.hasColor('red')).toBe(true)
      expect(player.hasColor('blue')).toBe(true)
      expect(player.hasColor('yellow')).toBe(false)
    })

    it('hasWildCard应该正确检查是否有万能牌', () => {
      expect(player.hasWildCard()).toBe(true)
      
      // 移除万能牌
      player.hand = player.hand.filter(c => !c.isWildCard())
      expect(player.hasWildCard()).toBe(false)
    })

    it('getWildCards应该返回所有万能牌', () => {
      const wildCards = player.getWildCards()
      
      expect(wildCards).toHaveLength(2)
      expect(wildCards.every(c => c.isWildCard())).toBe(true)
    })
  })

  describe('克隆和序列化', () => {
    beforeEach(() => {
      const cards = [
        new Card(CardType.NUMBER, CardColor.RED, 5),
        new Card(CardType.WILD)
      ]
      player.addCards(cards)
      player.score = 100
      player.hasCalledUno = true
    })

    it('clone应该创建玩家的完整副本', () => {
      const cloned = player.clone()
      
      expect(cloned.id).toBe(player.id)
      expect(cloned.name).toBe(player.name)
      expect(cloned.type).toBe(player.type)
      expect(cloned.score).toBe(player.score)
      expect(cloned.hasCalledUno).toBe(player.hasCalledUno)
      expect(cloned.hand).toHaveLength(player.hand.length)
      expect(cloned.hand).not.toBe(player.hand) // 不是同一个数组
    })

    it('toJSON应该返回正确的JSON对象', () => {
      const json = player.toJSON()
      
      expect(json.id).toBe(player.id)
      expect(json.name).toBe(player.name)
      expect(json.type).toBe(player.type)
      expect(json.score).toBe(player.score)
      expect(json.hasCalledUno).toBe(player.hasCalledUno)
      expect(json.hand).toHaveLength(player.hand.length)
    })

    it('fromJSON应该正确创建Player实例', () => {
      const json = player.toJSON()
      const restored = Player.fromJSON(json)
      
      expect(restored.id).toBe(player.id)
      expect(restored.name).toBe(player.name)
      expect(restored.type).toBe(player.type)
      expect(restored.score).toBe(player.score)
      expect(restored.hasCalledUno).toBe(player.hasCalledUno)
      expect(restored.hand).toHaveLength(player.hand.length)
    })

    it('JSON序列化和反序列化应该保持一致', () => {
      const json = player.toJSON()
      const restored = Player.fromJSON(json)
      
      expect(restored.toJSON()).toEqual(json)
    })
  })

  describe('边界情况', () => {
    it('应该处理空手牌的情况', () => {
      expect(player.getHandCount()).toBe(0)
      expect(player.hasWon()).toBe(true)
      expect(player.calculateHandScore()).toBe(0)
      expect(player.getPlayableCards(new Card(CardType.NUMBER, CardColor.RED, 5))).toHaveLength(0)
      expect(player.hasPlayableCard(new Card(CardType.NUMBER, CardColor.RED, 5))).toBe(false)
    })

    it('应该处理只有万能牌的情况', () => {
      const wildCard = new Card(CardType.WILD)
      player.addCard(wildCard)
      
      const currentCard = new Card(CardType.NUMBER, CardColor.RED, 5)
      expect(player.hasPlayableCard(currentCard)).toBe(true)
      expect(player.getPlayableCards(currentCard)).toHaveLength(1)
    })

    it('应该处理大量手牌的情况', () => {
      const cards = Array.from({ length: 20 }, (_, i) => 
        new Card(CardType.NUMBER, CardColor.RED, i % 10)
      )
      player.addCards(cards)
      
      expect(player.getHandCount()).toBe(20)
      expect(player.hasWon()).toBe(false)
      expect(player.calculateHandScore()).toBeGreaterThan(0)
    })
  })
}) 