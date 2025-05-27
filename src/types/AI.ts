// 注意：AIStrategy 和 AIDecision 接口已移至 src/ai/AIStrategy.ts
// 这里保留未来可能需要的高级AI功能类型

// 以下类型为未来的高级AI功能预留，目前未使用
// 如果需要实现高级AI分析功能，可以取消注释

/*
export interface AIThinkingState {
  isThinking: boolean;
  startTime?: Date;
  estimatedDuration?: number;
  phase?: AIThinkingPhase;
}

export enum AIThinkingPhase {
  ANALYZING_HAND = 'analyzing_hand',
  EVALUATING_OPTIONS = 'evaluating_options',
  MAKING_DECISION = 'making_decision',
  FINALIZING = 'finalizing'
}

export interface AIConfig {
  difficulty: AIDifficulty;
  thinkingTimeRange: [number, number];
  enableCardCounting: boolean;
  enableProbabilityCalculation: boolean;
  enableOpponentAnalysis: boolean;
  randomnessFactor: number;
}

export interface CardScore {
  card: Card;
  score: number;
  reasons: string[];
}

export interface GameAnalysis {
  situationAssessment: SituationAssessment;
  opponentThreats: OpponentThreat[];
  recommendedStrategy: GameStrategy;
}

export interface SituationAssessment {
  advantageLevel: number;
  urgency: number;
  primaryThreats: string[];
  opportunities: string[];
}

export interface OpponentThreat {
  playerId: string;
  threatLevel: number;
  remainingCards: number;
  canWinNextTurn: boolean;
}

export enum GameStrategy {
  AGGRESSIVE = 'aggressive',
  DEFENSIVE = 'defensive',
  BALANCED = 'balanced',
  OPPORTUNISTIC = 'opportunistic'
}
*/ 