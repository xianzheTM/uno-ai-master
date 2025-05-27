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
    })

    it('应该启用UNO宣告检查', () => {
      expect(STANDARD_RULES.uno.enableUnoCheck).toBe(true)
    })

    it('应该有正确的计分设置', () => {
      expect(STANDARD_RULES.scoring.numberCardPoints).toBe(true)
      expect(STANDARD_RULES.scoring.specialCardPoints).toBe(20)
      expect(STANDARD_RULES.scoring.wildCardPoints).toBe(50)
    })
  })

  describe('QUICK_GAME_RULES', () => {
    it('应该有较少的初始手牌', () => {
      expect(QUICK_GAME_RULES.basic.initialHandSize).toBe(5)
    })

    it('应该继承标准规则的其他设置', () => {
      expect(QUICK_GAME_RULES.uno.enableUnoCheck).toBe(STANDARD_RULES.uno.enableUnoCheck)
      expect(QUICK_GAME_RULES.scoring.numberCardPoints).toBe(STANDARD_RULES.scoring.numberCardPoints)
      expect(QUICK_GAME_RULES.scoring.specialCardPoints).toBe(STANDARD_RULES.scoring.specialCardPoints)
      expect(QUICK_GAME_RULES.scoring.wildCardPoints).toBe(STANDARD_RULES.scoring.wildCardPoints)
    })
  })

  describe('CASUAL_RULES', () => {
    it('应该禁用UNO宣告检查', () => {
      expect(CASUAL_RULES.uno.enableUnoCheck).toBe(false)
    })

    it('应该继承标准规则的其他设置', () => {
      expect(CASUAL_RULES.basic.initialHandSize).toBe(STANDARD_RULES.basic.initialHandSize)
      expect(CASUAL_RULES.scoring.numberCardPoints).toBe(STANDARD_RULES.scoring.numberCardPoints)
      expect(CASUAL_RULES.scoring.specialCardPoints).toBe(STANDARD_RULES.scoring.specialCardPoints)
      expect(CASUAL_RULES.scoring.wildCardPoints).toBe(STANDARD_RULES.scoring.wildCardPoints)
    })
  })

  describe('COMPETITIVE_RULES', () => {
    it('应该与标准规则完全相同', () => {
      expect(COMPETITIVE_RULES).toEqual(STANDARD_RULES)
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

    it('应该检测无效的初始手牌数（过小）', () => {
      const invalidConfig: GameRulesConfig = {
        ...STANDARD_RULES,
        basic: {
          initialHandSize: 0,
        },
      }

      const result = validateRulesConfig(invalidConfig)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('初始手牌数量必须在1-10之间')
    })

    it('应该检测无效的初始手牌数（过大）', () => {
      const invalidConfig: GameRulesConfig = {
        ...STANDARD_RULES,
        basic: {
          initialHandSize: 15,
        },
      }

      const result = validateRulesConfig(invalidConfig)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('初始手牌数量必须在1-10之间')
    })

    it('应该检测负数特殊卡分值', () => {
      const invalidConfig: GameRulesConfig = {
        ...STANDARD_RULES,
        scoring: {
          ...STANDARD_RULES.scoring,
          specialCardPoints: -10,
        },
      }

      const result = validateRulesConfig(invalidConfig)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('卡牌分值不能为负数')
    })

    it('应该检测负数万能卡分值', () => {
      const invalidConfig: GameRulesConfig = {
        ...STANDARD_RULES,
        scoring: {
          ...STANDARD_RULES.scoring,
          wildCardPoints: -20,
        },
      }

      const result = validateRulesConfig(invalidConfig)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('卡牌分值不能为负数')
    })

    it('应该检测多个错误', () => {
      const invalidConfig: GameRulesConfig = {
        basic: {
          initialHandSize: 0,
        },
        uno: {
          enableUnoCheck: true,
        },
        scoring: {
          numberCardPoints: true,
          specialCardPoints: -10,
          wildCardPoints: -20,
        },
      }

      const result = validateRulesConfig(invalidConfig)
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1)
      expect(result.errors).toContain('初始手牌数量必须在1-10之间')
      expect(result.errors).toContain('卡牌分值不能为负数')
    })

    it('应该接受边界值', () => {
      const validConfig: GameRulesConfig = {
        basic: {
          initialHandSize: 1,
        },
        uno: {
          enableUnoCheck: false,
        },
        scoring: {
          numberCardPoints: false,
          specialCardPoints: 0,
          wildCardPoints: 0,
        },
      }

      const result = validateRulesConfig(validConfig)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('应该接受最大边界值', () => {
      const validConfig: GameRulesConfig = {
        basic: {
          initialHandSize: 10,
        },
        uno: {
          enableUnoCheck: true,
        },
        scoring: {
          numberCardPoints: true,
          specialCardPoints: 100,
          wildCardPoints: 100,
        },
      }

      const result = validateRulesConfig(validConfig)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
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
    })

    it('常量值应该符合逻辑', () => {
      // 验证牌堆大小的逻辑正确性
      const expectedDeckSize = 
        GAME_CONSTANTS.NUMBER_CARDS_PER_COLOR * 4 + // 4种颜色的数字牌
        GAME_CONSTANTS.SPECIAL_CARDS_PER_COLOR * 4 + // 4种颜色的特殊牌
        GAME_CONSTANTS.WILD_CARDS_TOTAL // 万能牌

      expect(GAME_CONSTANTS.STANDARD_DECK_SIZE).toBe(expectedDeckSize)
    })
  })

  describe('配置类型检查', () => {
    it('所有预设规则应该符合GameRulesConfig接口', () => {
      const configs = [STANDARD_RULES, QUICK_GAME_RULES, CASUAL_RULES, COMPETITIVE_RULES]
      
      for (const config of configs) {
        expect(config).toHaveProperty('basic')
        expect(config).toHaveProperty('uno')
        expect(config).toHaveProperty('scoring')
        
        expect(config.basic).toHaveProperty('initialHandSize')
        expect(config.uno).toHaveProperty('enableUnoCheck')
        expect(config.scoring).toHaveProperty('numberCardPoints')
        expect(config.scoring).toHaveProperty('specialCardPoints')
        expect(config.scoring).toHaveProperty('wildCardPoints')
        
        expect(typeof config.basic.initialHandSize).toBe('number')
        expect(typeof config.uno.enableUnoCheck).toBe('boolean')
        expect(typeof config.scoring.numberCardPoints).toBe('boolean')
        expect(typeof config.scoring.specialCardPoints).toBe('number')
        expect(typeof config.scoring.wildCardPoints).toBe('number')
      }
    })
  })
}) 