/**
 * UNO游戏规则配置
 * 简化版本，只包含AI实际使用的配置
 */

export interface GameRulesConfig {
  /** 基础游戏设置 */
  basic: {
    /** 初始手牌数量 */
    initialHandSize: number;
  };
  
  /** UNO宣告规则 */
  uno: {
    /** 是否启用UNO宣告检查 */
    enableUnoCheck: boolean;
  };
  
  /** 计分规则 */
  scoring: {
    /** 数字卡分值（按面值） */
    numberCardPoints: boolean;
    /** 特殊卡分值 */
    specialCardPoints: number;
    /** 万能卡分值 */
    wildCardPoints: number;
  };
}

/** 标准UNO规则配置 */
export const STANDARD_RULES: GameRulesConfig = {
  basic: {
    initialHandSize: 7,
  },
  uno: {
    enableUnoCheck: true,
  },
  scoring: {
    numberCardPoints: true,
    specialCardPoints: 20,
    wildCardPoints: 50,
  },
};

/** 快速游戏规则配置 */
export const QUICK_GAME_RULES: GameRulesConfig = {
  ...STANDARD_RULES,
  basic: {
    initialHandSize: 5,
  },
};

/** 休闲模式规则配置（简化规则） */
export const CASUAL_RULES: GameRulesConfig = {
  ...STANDARD_RULES,
  uno: {
    enableUnoCheck: false,
  },
};

/** 竞技模式规则配置（完整规则） */
export const COMPETITIVE_RULES: GameRulesConfig = {
  ...STANDARD_RULES,
};

/** 获取当前游戏规则配置 */
export function getCurrentRules(): GameRulesConfig {
  // 默认使用标准规则，后续可以从用户设置中读取
  return STANDARD_RULES;
}

/** 验证游戏规则配置的有效性 */
export function validateRulesConfig(config: GameRulesConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // 检查基础设置
  if (config.basic.initialHandSize < 1 || config.basic.initialHandSize > 10) {
    errors.push('初始手牌数量必须在1-10之间');
  }
  
  // 检查计分设置
  if (config.scoring.specialCardPoints < 0 || config.scoring.wildCardPoints < 0) {
    errors.push('卡牌分值不能为负数');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/** 游戏规则常量 */
export const GAME_CONSTANTS = Object.freeze({
  /** 标准UNO牌堆大小 */
  STANDARD_DECK_SIZE: 108,
  /** 每种颜色的数字卡数量 */
  NUMBER_CARDS_PER_COLOR: 19,
  /** 每种颜色的特殊卡数量 */
  SPECIAL_CARDS_PER_COLOR: 6,
  /** 万能卡总数 */
  WILD_CARDS_TOTAL: 8,
  /** 默认初始手牌数 */
  DEFAULT_HAND_SIZE: 7,
  /** 默认UNO惩罚抽牌数 */
  DEFAULT_UNO_PENALTY: 2,
  /** 默认质疑失败惩罚 */
  DEFAULT_CHALLENGE_PENALTY: 6,
} as const); 