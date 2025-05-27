import { Card, CardColor } from './Card'
import { Player } from './Player'

/**
 * 游戏阶段枚举
 */
export enum GamePhase {
  SETUP = 'setup',
  PLAYING = 'playing',
  PAUSED = 'paused',
  FINISHED = 'finished'
}

/**
 * 游戏方向枚举
 */
export enum GameDirection {
  CLOCKWISE = 1,
  COUNTERCLOCKWISE = -1
}

/**
 * 游戏状态接口
 */
export interface GameState {
  /** 游戏ID */
  gameId: string;
  /** 所有玩家 */
  players: Player[];
  /** 当前玩家索引 */
  currentPlayerIndex: number;
  /** 游戏方向 */
  direction: GameDirection;
  /** 牌堆 */
  deck: Card[];
  /** 弃牌堆 */
  discardPile: Card[];
  /** 当前顶牌 */
  currentCard: Card;
  /** 游戏阶段 */
  gamePhase: GamePhase;
  /** 获胜者 */
  winner?: Player;
  /** 累积抽牌数（用于+2和+4叠加） */
  drawCount: number;
  /** 当前选择的颜色（万能牌后） */
  chosenColor?: CardColor;
  /** 游戏开始时间 */
  startTime: Date;
  /** 游戏结束时间 */
  endTime?: Date;
  /** 回合数 */
  turnCount: number;
}

/**
 * 游戏设置接口
 */
export interface GameSettings {
  /** 玩家数量 */
  playerCount: number;
  /** AI玩家数量 */
  aiPlayerCount: number;
  /** 初始手牌数量 */
  initialHandSize: number;
  /** 是否启用音效 */
  soundEnabled: boolean;
  /** 是否启用动画 */
  animationEnabled: boolean;
  /** AI思考时间（毫秒） */
  aiThinkingTime: number;
  /** 是否启用UNO规则检查 */
  unoRuleEnabled: boolean;
}

/**
 * 游戏动作类型
 */
export enum GameActionType {
  PLAY_CARD = 'play_card',
  DRAW_CARD = 'draw_card',
  CALL_UNO = 'call_uno',
  CHOOSE_COLOR = 'choose_color',
  PASS_TURN = 'pass_turn',
  START_GAME = 'start_game',
  END_GAME = 'end_game',
  PAUSE_GAME = 'pause_game',
  RESUME_GAME = 'resume_game'
}

/**
 * 游戏动作接口
 */
export interface GameAction {
  /** 动作类型 */
  type: GameActionType;
  /** 执行动作的玩家ID */
  playerId: string;
  /** 相关卡牌 */
  card?: Card;
  /** 选择的颜色 */
  chosenColor?: CardColor;
  /** 动作时间戳 */
  timestamp: Date;
}

/**
 * 游戏历史记录
 */
export interface GameHistory {
  /** 游戏ID */
  gameId: string;
  /** 所有动作记录 */
  actions: GameAction[];
  /** 最终结果 */
  result: GameResult;
}

/**
 * 游戏结果接口
 */
export interface GameResult {
  /** 获胜者 */
  winner: Player;
  /** 最终分数 */
  finalScores: Record<string, number>;
  /** 游戏时长（毫秒） */
  duration: number;
  /** 总回合数 */
  totalTurns: number;
} 