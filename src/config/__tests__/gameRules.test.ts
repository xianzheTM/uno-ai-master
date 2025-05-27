import { describe, it, expect } from 'vitest'
import {
  STANDARD_RULES,
  QUICK_GAME_RULES,
  CASUAL_RULES,
  COMPETITIVE_RULES,
  getCurrentRules,
  validateRulesConfig,
  GAME_CONSTANTS,
  type GameRulesConfig,
} from '../gameRules'

describe('游戏规则配置', () => {
  describe('STANDARD_RULES', () => {
    it('应该有正确的基础设置', () => {
      expect(STANDARD_RULES.basic.initialHandSize).toBe(7)
      expect(STANDARD_RULES.basic.minPlayers).toBe(2)
      expect(STANDARD_RULES.basic.maxPlayers).toBe(6)
      expect(STANDARD_RULES.basic.deckSize).toBe(108)
    })

    it('应该启用UNO宣告检查', () => {
      expect(STANDARD_RULES.uno.enableUnoCheck).toBe(true)
      expect(STANDARD_RULES.uno.penaltyCards).toBe(2)
    })

    it('应该有正确的特殊卡设置', () => {
      expect(STANDARD_RULES.specialCards.allowDrawCardStacking).toBe(true)
      expect(STANDARD_RULES.specialCards.wildDrawFourRestriction).toBe(true)
      expect(STANDARD_RULES.specialCards.enableChallenge).toBe(true)
    })

    it('应该有正确的质疑设置', () => {
      expect(STANDARD_RULES.challenge.successPenalty).toBe(4)
      expect(STANDARD_RULES.challenge.failurePenalty).toBe(6)
    })
  })

  describe('QUICK_GAME_RULES', () => {
    it('应该有较少的初始手牌', () => {
      expect(QUICK_GAME_RULES.basic.initialHandSize).toBe(5)
    })

    it('应该启用快速游戏模式', () => {
      expect(QUICK_GAME_RULES.variants.quickGame).toBe(true)
    })

    it('应该继承标准规则的其他设置', () => {
      expect(QUICK_GAME_RULES.uno.enableUnoCheck).toBe(STANDARD_RULES.uno.enableUnoCheck)
      expect(QUICK_GAME_RULES.specialCards.enableChallenge).toBe(STANDARD_RULES.specialCards.enableChallenge)
    })
  })

  describe('CASUAL_RULES', () => {
    it('应该禁用万能+4卡限制', () => {
      expect(CASUAL_RULES.specialCards.wildDrawFourRestriction).toBe(false)
    })

    it('应该禁用质疑系统', () => {
      expect(CASUAL_RULES.specialCards.enableChallenge).toBe(false)
    })

    it('应该禁用UNO宣告检查', () => {
      expect(CASUAL_RULES.uno.enableUnoCheck).toBe(false)
    })
  })

  describe('COMPETITIVE_RULES', () => {
    it('应该启用计分系统', () => {
      expect(COMPETITIVE_RULES.scoring.enableScoring).toBe(true)
    })

    it('应该启用所有变体规则', () => {
      expect(COMPETITIVE_RULES.variants.cumulativeDrawing).toBe(true)
      expect(COMPETITIVE_RULES.variants.skipStacking).toBe(true)
    })

    it('应该有正确的计分设置', () => {
      expect(COMPETITIVE_RULES.scoring.numberCardPoints).toBe(true)
      expect(COMPETITIVE_RULES.scoring.specialCardPoints).toBe(20)
      expect(COMPETITIVE_RULES.scoring.wildCardPoints).toBe(50)
    })
  })

  describe('getCurrentRules', () => {
    it('应该返回标准规则', () => {
      const rules = getCurrentRules()
      expect(rules).toEqual(STANDARD_RULES)
    })
  })

  describe('validateRulesConfig', () => {
    it('应该验证有效的规则配置', () => {
      const result = validateRulesConfig(STANDARD_RULES)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该检测无效的初始手牌数', () => {
      const invalidConfig: GameRulesConfig = {
        ...STANDARD_RULES,
        basic: {
          ...STANDARD_RULES.basic,
          initialHandSize: 0,
        },
      }

      const result = validateRulesConfig(invalidConfig)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('初始手牌数量必须在1-10之间')
    })

    it('应该检测无效的玩家数设置', () => {
      const invalidConfig: GameRulesConfig = {
        ...STANDARD_RULES,
        basic: {
          ...STANDARD_RULES.basic,
          minPlayers: 1,
        },
      }

      const result = validateRulesConfig(invalidConfig)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('最小玩家数必须至少为2，且不能大于最大玩家数')
    })

    it('应该检测过大的最大玩家数', () => {
      const invalidConfig: GameRulesConfig = {
        ...STANDARD_RULES,
        basic: {
          ...STANDARD_RULES.basic,
          maxPlayers: 15,
        },
      }

      const result = validateRulesConfig(invalidConfig)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('最大玩家数不能超过10')
    })

    it('应该检测错误的牌堆大小', () => {
      const invalidConfig: GameRulesConfig = {
        ...STANDARD_RULES,
        basic: {
          ...STANDARD_RULES.basic,
          deckSize: 100,
        },
      }

      const result = validateRulesConfig(invalidConfig)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('标准UNO牌堆必须是108张')
    })

    it('应该检测负数惩罚设置', () => {
      const invalidConfig: GameRulesConfig = {
        ...STANDARD_RULES,
        uno: {
          ...STANDARD_RULES.uno,
          penaltyCards: -1,
        },
      }

      const result = validateRulesConfig(invalidConfig)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('UNO惩罚抽牌数不能为负数')
    })

    it('应该检测负数质疑惩罚', () => {
      const invalidConfig: GameRulesConfig = {
        ...STANDARD_RULES,
        challenge: {
          successPenalty: -1,
          failurePenalty: -1,
        },
      }

      const result = validateRulesConfig(invalidConfig)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('质疑惩罚抽牌数不能为负数')
    })

    it('应该检测负数计分设置', () => {
      const invalidConfig: GameRulesConfig = {
        ...STANDARD_RULES,
        scoring: {
          ...STANDARD_RULES.scoring,
          specialCardPoints: -10,
          wildCardPoints: -20,
        },
      }

      const result = validateRulesConfig(invalidConfig)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('卡牌分值不能为负数')
    })

    it('应该检测多个错误', () => {
      const invalidConfig: GameRulesConfig = {
        ...STANDARD_RULES,
        basic: {
          ...STANDARD_RULES.basic,
          initialHandSize: 0,
          minPlayers: 1,
        },
        uno: {
          ...STANDARD_RULES.uno,
          penaltyCards: -1,
        },
      }

      const result = validateRulesConfig(invalidConfig)
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1)
    })
  })

  describe('GAME_CONSTANTS', () => {
    it('应该有正确的常量值', () => {
      expect(GAME_CONSTANTS.STANDARD_DECK_SIZE).toBe(108)
      expect(GAME_CONSTANTS.NUMBER_CARDS_PER_COLOR).toBe(19)
      expect(GAME_CONSTANTS.SPECIAL_CARDS_PER_COLOR).toBe(6)
      expect(GAME_CONSTANTS.WILD_CARDS_TOTAL).toBe(8)
      expect(GAME_CONSTANTS.DEFAULT_HAND_SIZE).toBe(7)
      expect(GAME_CONSTANTS.DEFAULT_UNO_PENALTY).toBe(2)
      expect(GAME_CONSTANTS.DEFAULT_CHALLENGE_PENALTY).toBe(6)
    })

    it('常量应该是只读的', () => {
      // 验证常量对象被冻结，不可修改
      expect(Object.isFrozen(GAME_CONSTANTS)).toBe(true)
      
      // 验证尝试修改属性会抛出错误
      const originalValue = GAME_CONSTANTS.STANDARD_DECK_SIZE
      
      // 尝试修改冻结对象的属性应该抛出错误
      expect(() => {
        // @ts-expect-error - 测试常量的只读性
        GAME_CONSTANTS.STANDARD_DECK_SIZE = 100
      }).toThrow()
      
      // 值应该保持不变
      expect(GAME_CONSTANTS.STANDARD_DECK_SIZE).toBe(originalValue)
    })
  })
}) 