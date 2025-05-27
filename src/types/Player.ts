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

// 以下类型为未来功能预留，目前未使用
// 如果需要实现玩家创建参数和统计功能，可以取消注释

/*
export interface CreatePlayerParams {
  name: string;
  type: PlayerType;
  aiDifficulty?: AIDifficulty;
  avatar?: string;
}

export interface PlayerStats {
  totalGames: number;
  wins: number;
  winRate: number;
  averageScore: number;
  highestScore: number;
}
*/ 