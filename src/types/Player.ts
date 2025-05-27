import { Card } from './Card'

/**
 * 玩家类型枚举
 */
export enum PlayerType {
  HUMAN = 'human',
  AI = 'ai'
}

/**
 * AI难度等级
 */
export enum AIDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

/**
 * 玩家接口
 */
export interface Player {
  /** 玩家唯一标识符 */
  id: string;
  /** 玩家名称 */
  name: string;
  /** 玩家类型 */
  type: PlayerType;
  /** 手牌 */
  hand: Card[];
  /** 是否为AI */
  isAI: boolean;
  /** AI难度（仅AI玩家有效） */
  aiDifficulty?: AIDifficulty;
  /** 头像URL */
  avatar?: string;
  /** 当前分数 */
  score: number;
  /** 是否已宣告UNO */
  hasCalledUno: boolean;
  /** 玩家状态 */
  status: PlayerStatus;
}

/**
 * 玩家状态枚举
 */
export enum PlayerStatus {
  WAITING = 'waiting',
  PLAYING = 'playing',
  THINKING = 'thinking',
  FINISHED = 'finished'
}

/**
 * 创建玩家参数
 */
export interface CreatePlayerParams {
  name: string;
  type: PlayerType;
  aiDifficulty?: AIDifficulty;
  avatar?: string;
}

/**
 * 玩家统计信息
 */
export interface PlayerStats {
  /** 总游戏次数 */
  totalGames: number;
  /** 胜利次数 */
  wins: number;
  /** 胜率 */
  winRate: number;
  /** 平均分数 */
  averageScore: number;
  /** 最高分 */
  highestScore: number;
} 