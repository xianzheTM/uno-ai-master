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

// 以下类型为未来功能预留，目前未使用
// 如果需要实现游戏设置、历史记录等功能，可以取消注释

/*
export interface GameSettings {
  playerCount: number;
  aiPlayerCount: number;
  initialHandSize: number;
  soundEnabled: boolean;
  animationEnabled: boolean;
  aiThinkingTime: number;
  unoRuleEnabled: boolean;
}

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

export interface GameAction {
  type: GameActionType;
  playerId: string;
  card?: Card;
  chosenColor?: CardColor;
  timestamp: Date;
}

export interface GameHistory {
  gameId: string;
  actions: GameAction[];
  result: GameResult;
}

export interface GameResult {
  winner: Player;
  finalScores: Record<string, number>;
  duration: number;
  totalTurns: number;
}
*/ 