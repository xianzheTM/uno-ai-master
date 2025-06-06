import {Card} from '@/game';
import {CardColor} from '@/types';
import {getCurrentRules} from '../config/gameRules';

/**
 * AI决策结果
 */
export interface AIDecision {
  type: 'play' | 'draw' | 'uno' | 'pass';
  cardIndex?: number;
  chosenColor?: CardColor;
  confidence: number; // 0-1之间，表示决策的信心度
  reasoning?: string; // 决策理由（用于调试）
}

/**
 * 游戏状态信息（AI可见的信息）
 */
export interface GameStateInfo {
  // 当前卡牌
  currentCard: Card;
  currentColor: CardColor;
  
  // 玩家信息
  players: {
    id: string;
    name: string;
    handSize: number;
    isAI: boolean;
    hasCalledUno: boolean;
  }[];
  
  // 游戏状态
  direction: number;
  drawPileSize: number;
  discardPileSize: number;
  
  // 历史信息
  recentCards: Card[]; // 最近打出的卡牌
  playedCards: Card[]; // 已经打出的所有卡牌
  
  // 特殊状态
  skipCount: number; // 连续跳过的次数
  drawCount: number; // 累积的摸牌数
}

/**
 * AI策略接口
 */
export abstract class AIStrategy {
  protected difficulty: 'easy' | 'medium' | 'hard';
  protected playerId: string;
  protected gameRules = getCurrentRules();
  
  constructor(difficulty: 'easy' | 'medium' | 'hard', playerId: string) {
    this.difficulty = difficulty;
    this.playerId = playerId;
  }
  
  /**
   * 获取AI难度
   */
  getDifficulty(): 'easy' | 'medium' | 'hard' {
    return this.difficulty;
  }
  
  /**
   * 获取玩家ID
   */
  getPlayerId(): string {
    return this.playerId;
  }
  
  /**
   * 主要决策方法
   * @param hand 当前手牌
   * @param gameState 游戏状态信息
   * @returns AI决策
   */
  abstract makeDecision(hand: Card[], gameState: GameStateInfo): AIDecision;
  
  /**
   * 选择颜色（当打出万能牌时）
   * @param hand 当前手牌
   * @param gameState 游戏状态信息
   * @returns 选择的颜色
   */
  abstract chooseColor(hand: Card[], gameState: GameStateInfo): CardColor;
  
  /**
   * 是否应该叫UNO
   * @param hand 当前手牌
   * @param _gameState 游戏状态信息
   * @returns 是否叫UNO
   */
  shouldCallUno(hand: Card[], _gameState: GameStateInfo): boolean {
    // 如果游戏规则禁用了UNO检查，则不需要叫UNO
    if (!this.gameRules.uno.enableUnoCheck) {
      return false;
    }
    return hand.length === 2; // 默认在还有2张牌时叫UNO
  }
  
  /**
   * 获取可打出的卡牌索引
   * @param hand 手牌
   * @param currentCard 当前卡牌
   * @param currentColor 当前颜色
   * @returns 可打出的卡牌索引数组
   */
  protected getValidCardIndices(hand: Card[], currentCard: Card, currentColor: CardColor): number[] {
    const validIndices: number[] = [];
    
    for (let i = 0; i < hand.length; i++) {
      const card = hand[i];
      
      // 万能牌总是可以打出
      if (card.isWildCard()) {
        validIndices.push(i);
        continue;
      }
      
      // 颜色匹配
      if (card.color === currentColor) {
        validIndices.push(i);
        continue;
      }
      
      // 数字/动作匹配
      if (card.value === currentCard.value) {
        validIndices.push(i);
        continue;
      }
    }
    
    return validIndices;
  }
  
  /**
   * 计算卡牌的战略价值
   * @param card 卡牌
   * @param hand 当前手牌
   * @param _gameState
   * @returns 价值分数（越高越好）
   */
  protected calculateCardValue(card: Card, hand: Card[], _gameState: GameStateInfo): number {
    let value = 0;
    
    // 基础分数
    if (card.isWildCard()) {
      value += 50; // 万能牌价值高
    } else if (card.isActionCard()) {
      value += 20; // 功能牌价值中等
    } else {
      value += 10; // 数字牌价值低
    }
    
    // 颜色匹配奖励
    const colorCount = hand.filter(c => c.color === card.color).length;
    value += colorCount * 5;
    
    // 数字匹配奖励
    const numberCount = hand.filter(c => c.value === card.value).length;
    value += numberCount * 3;
    
    return value;
  }
  
  /**
   * 分析对手威胁程度
   * @param gameState 游戏状态
   * @returns 威胁分数（越高越危险）
   */
  protected analyzeOpponentThreat(gameState: GameStateInfo): number {
    let threat = 0;
    
    for (const player of gameState.players) {
      if (player.id === this.playerId) continue;
      
      // 手牌数量威胁
      if (player.handSize <= 2) {
        threat += 50;
      } else if (player.handSize <= 4) {
        threat += 20;
      }
      
      // UNO状态威胁
      if (player.hasCalledUno) {
        threat += 30;
      }
    }
    
    return threat;
  }
  
  /**
   * 添加决策延迟（模拟思考时间）
   * @param baseDelay 基础延迟时间（毫秒）
   * @param gameSpeed 游戏速度设置
   * @returns Promise
   */
  protected async addThinkingDelay(baseDelay: number = 1000, gameSpeed?: 'slow' | 'normal' | 'fast'): Promise<void> {
    // 根据游戏速度调整基础延迟
    if (gameSpeed) {
      switch (gameSpeed) {
        case 'slow':
          baseDelay = baseDelay * 1.5;
          break;
        case 'normal':
          // 保持原有延迟
          break;
        case 'fast':
          baseDelay = baseDelay * 0.5;
          break;
      }
    }
    
    // 根据难度调整延迟时间
    let delay = baseDelay;
    switch (this.difficulty) {
      case 'easy':
        delay = baseDelay * 0.5; // 简单AI反应快
        break;
      case 'medium':
        delay = baseDelay;
        break;
      case 'hard':
        delay = baseDelay * 1.5; // 困难AI思考时间长
        break;
    }
    
    // 添加随机变化
    delay += Math.random() * 500;
    
    return new Promise(resolve => setTimeout(resolve, delay));
  }
} 