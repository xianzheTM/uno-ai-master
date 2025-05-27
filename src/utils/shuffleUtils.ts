import { Card } from '@/types'

/**
 * Fisher-Yates洗牌算法
 * 这是一个高效且公平的洗牌算法
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array] // 创建副本，避免修改原数组
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  
  return shuffled
}

/**
 * 洗牌卡牌堆
 */
export function shuffleDeck(deck: Card[]): Card[] {
  return shuffleArray(deck)
}

/**
 * 生成指定范围内的随机整数
 * @param min 最小值（包含）
 * @param max 最大值（包含）
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * 从数组中随机选择一个元素
 */
export function randomChoice<T>(array: T[]): T {
  if (array.length === 0) {
    throw new Error('Cannot choose from empty array')
  }
  const index = randomInt(0, array.length - 1)
  return array[index]
}

/**
 * 从数组中随机选择多个元素（不重复）
 */
export function randomChoices<T>(array: T[], count: number): T[] {
  if (count > array.length) {
    throw new Error('Cannot choose more elements than available')
  }
  
  const shuffled = shuffleArray(array)
  return shuffled.slice(0, count)
}

/**
 * 生成随机布尔值
 * @param probability 为true的概率（0-1）
 */
export function randomBoolean(probability: number = 0.5): boolean {
  return Math.random() < probability
}

/**
 * 生成随机浮点数
 * @param min 最小值
 * @param max 最大值
 */
export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

/**
 * 按权重随机选择
 * @param items 选项数组
 * @param weights 对应的权重数组
 */
export function weightedRandomChoice<T>(items: T[], weights: number[]): T {
  if (items.length !== weights.length) {
    throw new Error('Items and weights arrays must have the same length')
  }
  
  if (items.length === 0) {
    throw new Error('Cannot choose from empty array')
  }
  
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
  if (totalWeight <= 0) {
    throw new Error('Total weight must be positive')
  }
  
  let random = Math.random() * totalWeight
  
  for (let i = 0; i < items.length; i++) {
    random -= weights[i]
    if (random <= 0) {
      return items[i]
    }
  }
  
  // 防止浮点数精度问题，返回最后一个元素
  return items[items.length - 1]
}

/**
 * 创建种子随机数生成器（用于可重现的随机序列）
 */
export class SeededRandom {
  private seed: number

  constructor(seed: number) {
    this.seed = seed
  }

  /**
   * 生成下一个随机数（0-1）
   */
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280
    return this.seed / 233280
  }

  /**
   * 生成指定范围内的随机整数
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min
  }

  /**
   * 洗牌数组（使用种子随机数）
   */
  shuffle<T>(array: T[]): T[] {
    const shuffled = [...array]
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i)
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    
    return shuffled
  }
}

/**
 * 验证洗牌结果的随机性（用于测试）
 */
export function validateShuffleRandomness<T>(
  original: T[],
  shuffled: T[],
  threshold: number = 0.3
): boolean {
  if (original.length !== shuffled.length) {
    return false
  }
  
  if (original.length < 2) {
    return true
  }
  
  // 计算位置变化的比例
  let changedPositions = 0
  for (let i = 0; i < original.length; i++) {
    if (original[i] !== shuffled[i]) {
      changedPositions++
    }
  }
  
  const changeRatio = changedPositions / original.length
  return changeRatio >= threshold
}

/**
 * 多次洗牌以增加随机性
 */
export function multiShuffle<T>(array: T[], times: number = 3): T[] {
  let result = [...array]
  
  for (let i = 0; i < times; i++) {
    result = shuffleArray(result)
  }
  
  return result
} 