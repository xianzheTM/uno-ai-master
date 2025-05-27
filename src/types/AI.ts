import { Card, CardColor } from './Card'
import { GameState } from './GameState'
import { AIDifficulty } from './Player'

/**
 * AI策略接口
 */
export interface AIStrategy {
  /** 策略名称 */
  name: string;
  /** 难度等级 */
  difficulty: AIDifficulty;
  
  /**
   * 选择要出的牌
   * @param hand 手牌
   * @param currentCard 当前顶牌
   * @param gameState 游戏状态
   * @returns 选择的卡牌，null表示抽牌
   */
  selectCard(hand: Card[], currentCard: Card, gameState: GameState): Card | null;
  
  /**
   * 选择颜色（万能牌后）
   * @param availableColors 可选颜色
   * @param hand 当前手牌
   * @param gameState 游戏状态
   * @returns 选择的颜色
   */
  selectColor(availableColors: CardColor[], hand: Card[], gameState: GameState): CardColor;
  
  /**
   * 是否应该宣告UNO
   * @param hand 当前手牌
   * @param gameState 游戏状态
   * @returns 是否宣告UNO
   */
  shouldCallUno(hand: Card[], gameState: GameState): boolean;
}

/**
 * AI决策结果
 */
export interface AIDecision {
  /** 决策类型 */
  type: AIDecisionType;
  /** 选择的卡牌 */
  card?: Card;
  /** 选择的颜色 */
  color?: CardColor;
  /** 是否宣告UNO */
  callUno?: boolean;
  /** 决策置信度 (0-1) */
  confidence: number;
  /** 决策原因 */
  reason: string;
}

/**
 * AI决策类型
 */
export enum AIDecisionType {
  PLAY_CARD = 'play_card',
  DRAW_CARD = 'draw_card',
  CHOOSE_COLOR = 'choose_color',
  CALL_UNO = 'call_uno'
}

/**
 * AI思考状态
 */
export interface AIThinkingState {
  /** 是否正在思考 */
  isThinking: boolean;
  /** 思考开始时间 */
  startTime?: Date;
  /** 预计思考时长（毫秒） */
  estimatedDuration?: number;
  /** 当前思考阶段 */
  phase?: AIThinkingPhase;
}

/**
 * AI思考阶段
 */
export enum AIThinkingPhase {
  ANALYZING_HAND = 'analyzing_hand',
  EVALUATING_OPTIONS = 'evaluating_options',
  MAKING_DECISION = 'making_decision',
  FINALIZING = 'finalizing'
}

/**
 * AI配置
 */
export interface AIConfig {
  /** 难度等级 */
  difficulty: AIDifficulty;
  /** 思考时间范围（毫秒） */
  thinkingTimeRange: [number, number];
  /** 是否启用记牌功能 */
  enableCardCounting: boolean;
  /** 是否启用概率计算 */
  enableProbabilityCalculation: boolean;
  /** 是否启用对手行为分析 */
  enableOpponentAnalysis: boolean;
  /** 随机性因子 (0-1) */
  randomnessFactor: number;
}

/**
 * 卡牌评分
 */
export interface CardScore {
  /** 卡牌 */
  card: Card;
  /** 评分 (0-100) */
  score: number;
  /** 评分原因 */
  reasons: string[];
}

/**
 * 游戏状态分析
 */
export interface GameAnalysis {
  /** 当前局势评估 */
  situationAssessment: SituationAssessment;
  /** 对手威胁等级 */
  opponentThreats: OpponentThreat[];
  /** 推荐策略 */
  recommendedStrategy: GameStrategy;
}

/**
 * 局势评估
 */
export interface SituationAssessment {
  /** 优势等级 (-1到1，-1最劣势，1最优势) */
  advantageLevel: number;
  /** 紧急程度 (0-1) */
  urgency: number;
  /** 主要威胁 */
  primaryThreats: string[];
  /** 机会 */
  opportunities: string[];
}

/**
 * 对手威胁
 */
export interface OpponentThreat {
  /** 玩家ID */
  playerId: string;
  /** 威胁等级 (0-1) */
  threatLevel: number;
  /** 剩余手牌数 */
  remainingCards: number;
  /** 是否可能获胜 */
  canWinNextTurn: boolean;
}

/**
 * 游戏策略
 */
export enum GameStrategy {
  AGGRESSIVE = 'aggressive',      // 激进策略
  DEFENSIVE = 'defensive',        // 防守策略
  BALANCED = 'balanced',          // 平衡策略
  OPPORTUNISTIC = 'opportunistic' // 机会主义策略
} 