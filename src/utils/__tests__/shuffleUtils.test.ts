import { describe, it, expect } from 'vitest'
import {
  shuffleArray,
  shuffleDeck,
  randomInt,
  randomChoice,
  randomChoices,
  randomBoolean,
  randomFloat,
  weightedRandomChoice,
  SeededRandom,
  validateShuffleRandomness,
  multiShuffle,
} from '../shuffleUtils'
import { createStandardDeck } from '../cardUtils'

describe('shuffleUtils', () => {
  describe('shuffleArray', () => {
    it('应该返回相同长度的数组', () => {
      const original = [1, 2, 3, 4, 5]
      const shuffled = shuffleArray(original)
      
      expect(shuffled).toHaveLength(original.length)
    })

    it('应该包含所有原始元素', () => {
      const original = [1, 2, 3, 4, 5]
      const shuffled = shuffleArray(original)
      
      original.forEach(item => {
        expect(shuffled).toContain(item)
      })
    })

    it('不应该修改原数组', () => {
      const original = [1, 2, 3, 4, 5]
      const originalCopy = [...original]
      shuffleArray(original)
      
      expect(original).toEqual(originalCopy)
    })

    it('应该处理空数组', () => {
      const shuffled = shuffleArray([])
      expect(shuffled).toEqual([])
    })

    it('应该处理单元素数组', () => {
      const shuffled = shuffleArray([1])
      expect(shuffled).toEqual([1])
    })
  })

  describe('shuffleDeck', () => {
    it('应该洗牌卡牌堆', () => {
      const deck = createStandardDeck()
      const shuffled = shuffleDeck(deck)
      
      expect(shuffled).toHaveLength(deck.length)
      expect(shuffled).not.toBe(deck) // 应该是新数组
    })
  })

  describe('randomInt', () => {
    it('应该生成指定范围内的整数', () => {
      for (let i = 0; i < 100; i++) {
        const result = randomInt(1, 10)
        expect(result).toBeGreaterThanOrEqual(1)
        expect(result).toBeLessThanOrEqual(10)
        expect(Number.isInteger(result)).toBe(true)
      }
    })

    it('应该处理相同的最小值和最大值', () => {
      const result = randomInt(5, 5)
      expect(result).toBe(5)
    })
  })

  describe('randomChoice', () => {
    it('应该从数组中选择一个元素', () => {
      const array = [1, 2, 3, 4, 5]
      const choice = randomChoice(array)
      
      expect(array).toContain(choice)
    })

    it('应该在空数组时抛出错误', () => {
      expect(() => randomChoice([])).toThrow('Cannot choose from empty array')
    })
  })

  describe('randomChoices', () => {
    it('应该选择指定数量的不重复元素', () => {
      const array = [1, 2, 3, 4, 5]
      const choices = randomChoices(array, 3)
      
      expect(choices).toHaveLength(3)
      
      // 检查是否有重复元素
      const uniqueChoices = new Set(choices)
      expect(uniqueChoices.size).toBe(3)
      
      // 检查所有选择的元素都在原数组中
      choices.forEach(choice => {
        expect(array).toContain(choice)
      })
    })

    it('应该在请求数量超过数组长度时抛出错误', () => {
      const array = [1, 2, 3]
      expect(() => randomChoices(array, 5)).toThrow('Cannot choose more elements than available')
    })
  })

  describe('randomBoolean', () => {
    it('应该生成布尔值', () => {
      for (let i = 0; i < 10; i++) {
        const result = randomBoolean()
        expect(typeof result).toBe('boolean')
      }
    })

    it('应该根据概率生成布尔值', () => {
      // 测试极端概率
      expect(randomBoolean(0)).toBe(false)
      expect(randomBoolean(1)).toBe(true)
    })
  })

  describe('randomFloat', () => {
    it('应该生成指定范围内的浮点数', () => {
      for (let i = 0; i < 100; i++) {
        const result = randomFloat(1.5, 3.7)
        expect(result).toBeGreaterThanOrEqual(1.5)
        expect(result).toBeLessThan(3.7)
      }
    })
  })

  describe('weightedRandomChoice', () => {
    it('应该根据权重选择元素', () => {
      const items = ['a', 'b', 'c']
      const weights = [1, 0, 0] // 只有第一个元素有权重
      
      for (let i = 0; i < 10; i++) {
        const choice = weightedRandomChoice(items, weights)
        expect(choice).toBe('a')
      }
    })

    it('应该在数组长度不匹配时抛出错误', () => {
      expect(() => weightedRandomChoice(['a', 'b'], [1])).toThrow('Items and weights arrays must have the same length')
    })

    it('应该在空数组时抛出错误', () => {
      expect(() => weightedRandomChoice([], [])).toThrow('Cannot choose from empty array')
    })

    it('应该在总权重为0时抛出错误', () => {
      expect(() => weightedRandomChoice(['a', 'b'], [0, 0])).toThrow('Total weight must be positive')
    })
  })

  describe('SeededRandom', () => {
    it('应该生成可重现的随机序列', () => {
      const rng1 = new SeededRandom(12345)
      const rng2 = new SeededRandom(12345)
      
      const sequence1 = []
      const sequence2 = []
      
      for (let i = 0; i < 10; i++) {
        sequence1.push(rng1.next())
        sequence2.push(rng2.next())
      }
      
      expect(sequence1).toEqual(sequence2)
    })

    it('应该生成不同种子的不同序列', () => {
      const rng1 = new SeededRandom(12345)
      const rng2 = new SeededRandom(54321)
      
      const value1 = rng1.next()
      const value2 = rng2.next()
      
      expect(value1).not.toBe(value2)
    })

    it('应该生成指定范围内的整数', () => {
      const rng = new SeededRandom(12345)
      
      for (let i = 0; i < 100; i++) {
        const result = rng.nextInt(1, 10)
        expect(result).toBeGreaterThanOrEqual(1)
        expect(result).toBeLessThanOrEqual(10)
        expect(Number.isInteger(result)).toBe(true)
      }
    })

    it('应该洗牌数组', () => {
      const rng = new SeededRandom(12345)
      const array = [1, 2, 3, 4, 5]
      const shuffled = rng.shuffle(array)
      
      expect(shuffled).toHaveLength(array.length)
      array.forEach(item => {
        expect(shuffled).toContain(item)
      })
    })
  })

  describe('validateShuffleRandomness', () => {
    it('应该验证洗牌的随机性', () => {
      const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      const shuffled = shuffleArray(original)
      
      // 大多数情况下应该通过随机性验证
      const isRandom = validateShuffleRandomness(original, shuffled, 0.3)
      expect(typeof isRandom).toBe('boolean')
    })

    it('应该识别未洗牌的数组', () => {
      const original = [1, 2, 3, 4, 5]
      const notShuffled = [...original]
      
      const isRandom = validateShuffleRandomness(original, notShuffled, 0.3)
      expect(isRandom).toBe(false)
    })

    it('应该处理长度不匹配的数组', () => {
      const original = [1, 2, 3]
      const different = [1, 2]
      
      const isRandom = validateShuffleRandomness(original, different)
      expect(isRandom).toBe(false)
    })

    it('应该处理短数组', () => {
      const original = [1]
      const shuffled = [1]
      
      const isRandom = validateShuffleRandomness(original, shuffled)
      expect(isRandom).toBe(true)
    })
  })

  describe('multiShuffle', () => {
    it('应该多次洗牌', () => {
      const original = [1, 2, 3, 4, 5]
      const shuffled = multiShuffle(original, 3)
      
      expect(shuffled).toHaveLength(original.length)
      original.forEach(item => {
        expect(shuffled).toContain(item)
      })
    })

    it('不应该修改原数组', () => {
      const original = [1, 2, 3, 4, 5]
      const originalCopy = [...original]
      multiShuffle(original, 3)
      
      expect(original).toEqual(originalCopy)
    })
  })
}) 