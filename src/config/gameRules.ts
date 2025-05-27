/**
 * UNO游戏规则配置
 * 定义不同的游戏变体和可配置的规则选项
 */

export interface GameRulesConfig {
  /** 基础游戏设置 */
  basic: {
    /** 初始手牌数量 */
    initialHandSize: number;
    /** 最小玩家数 */
    minPlayers: number;
    /** 最大玩家数 */
    maxPlayers: number;
    /** 标准牌堆大小 */
    deckSize: number;
  };
  
  /** UNO宣告规则 */
  uno: {
    /** 忘记宣告UNO的惩罚抽牌数 */
    penaltyCards: number;
    /** 是否启用UNO宣告检查 */
    enableUnoCheck: boolean;
  };
  
  /** 特殊卡牌规则 */
  specialCards: {
    /** 是否允许+2和+4卡叠加 */
    allowDrawCardStacking: boolean;
    /** 是否允许跳过卡叠加 */
    allowSkipStacking: boolean;
    /** 万能+4卡的使用限制 */
    wildDrawFourRestriction: boolean;
    /** 是否启用质疑系统 */
    enableChallenge: boolean;
  };
  
  /** 质疑规则 */
  challenge: {
    /** 质疑成功时出牌者的惩罚抽牌数 */
    successPenalty: number;
    /** 质疑失败时质疑者的惩罚抽牌数 */
    failurePenalty: number;
  };
  
  /** 计分规则 */
  scoring: {
    /** 是否启用计分系统 */
    enableScoring: boolean;
    /** 数字卡分值（按面值） */
    numberCardPoints: boolean;
    /** 特殊卡分值 */
    specialCardPoints: number;
    /** 万能卡分值 */
    wildCardPoints: number;
  };
  
  /** 游戏变体 */
  variants: {
    /** 快速游戏模式 */
    quickGame: boolean;
    /** 累积抽牌模式 */
    cumulativeDrawing: boolean;
    /** 跳过叠加模式 */
    skipStacking: boolean;
  };
}

/** 标准UNO规则配置 */
export const STANDARD_RULES: GameRulesConfig = {
  basic: {
    initialHandSize: 7,
    minPlayers: 2,
    maxPlayers: 6,
    deckSize: 108,
  },
  uno: {
    penaltyCards: 2,
    enableUnoCheck: true,
  },
  specialCards: {
    allowDrawCardStacking: true,
    allowSkipStacking: false,
    wildDrawFourRestriction: true,
    enableChallenge: true,
  },
  challenge: {
    successPenalty: 4,
    failurePenalty: 6,
  },
  scoring: {
    enableScoring: false,
    numberCardPoints: true,
    specialCardPoints: 20,
    wildCardPoints: 50,
  },
  variants: {
    quickGame: false,
    cumulativeDrawing: true,
    skipStacking: false,
  },
};

/** 快速游戏规则配置 */
export const QUICK_GAME_RULES: GameRulesConfig = {
  ...STANDARD_RULES,
  basic: {
    ...STANDARD_RULES.basic,
    initialHandSize: 5,
  },
  variants: {
    ...STANDARD_RULES.variants,
    quickGame: true,
  },
};

/** 休闲模式规则配置（简化规则） */
export const CASUAL_RULES: GameRulesConfig = {
  ...STANDARD_RULES,
  specialCards: {
    ...STANDARD_RULES.specialCards,
    wildDrawFourRestriction: false,
    enableChallenge: false,
  },
  uno: {
    ...STANDARD_RULES.uno,
    enableUnoCheck: false,
  },
};

/** 竞技模式规则配置（完整规则） */
export const COMPETITIVE_RULES: GameRulesConfig = {
  ...STANDARD_RULES,
  scoring: {
    ...STANDARD_RULES.scoring,
    enableScoring: true,
  },
  variants: {
    ...STANDARD_RULES.variants,
    cumulativeDrawing: true,
    skipStacking: true,
  },
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
  
  if (config.basic.minPlayers < 2 || config.basic.minPlayers > config.basic.maxPlayers) {
    errors.push('最小玩家数必须至少为2，且不能大于最大玩家数');
  }
  
  if (config.basic.maxPlayers > 10) {
    errors.push('最大玩家数不能超过10');
  }
  
  if (config.basic.deckSize !== 108) {
    errors.push('标准UNO牌堆必须是108张');
  }
  
  // 检查惩罚设置
  if (config.uno.penaltyCards < 0) {
    errors.push('UNO惩罚抽牌数不能为负数');
  }
  
  if (config.challenge.successPenalty < 0 || config.challenge.failurePenalty < 0) {
    errors.push('质疑惩罚抽牌数不能为负数');
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