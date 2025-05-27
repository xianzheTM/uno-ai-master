import { AIStrategy, AIDecision, GameStateInfo } from './AIStrategy';
import { EasyAI } from './EasyAI';
import { MediumAI } from './MediumAI';
import { HardAI } from './HardAI';
import { Card } from '../game/Card';
import { Player } from '../game/Player';
import { GameDifficulty } from '../types/GameState';

/**
 * AI管理器
 * 负责创建、管理和协调AI实例
 */
export class AIManager {
  private aiInstances: Map<string, AIStrategy> = new Map();
  private decisionHistory: Map<string, AIDecision[]> = new Map();

  /**
   * 创建AI实例
   * @param playerId 玩家ID
   * @param difficulty 难度级别
   * @returns AI策略实例
   */
  createAI(playerId: string, difficulty: GameDifficulty): AIStrategy {
    let aiInstance: AIStrategy;

    switch (difficulty) {
      case GameDifficulty.EASY:
        aiInstance = new EasyAI(playerId);
        break;
      case GameDifficulty.MEDIUM:
        aiInstance = new MediumAI(playerId);
        break;
      case GameDifficulty.HARD:
        aiInstance = new HardAI(playerId);
        break;
      default:
        aiInstance = new MediumAI(playerId);
    }

    this.aiInstances.set(playerId, aiInstance);
    this.decisionHistory.set(playerId, []);

    return aiInstance;
  }

  /**
   * 获取AI实例
   * @param playerId 玩家ID
   * @returns AI策略实例
   */
  getAI(playerId: string): AIStrategy | null {
    return this.aiInstances.get(playerId) || null;
  }

  /**
   * 移除AI实例
   * @param playerId 玩家ID
   */
  removeAI(playerId: string): void {
    this.aiInstances.delete(playerId);
    this.decisionHistory.delete(playerId);
  }

  /**
   * 让AI做出决策
   * @param playerId 玩家ID
   * @param hand 手牌
   * @param gameState 游戏状态
   * @returns AI决策
   */
  async makeDecision(playerId: string, hand: Card[], gameState: GameStateInfo): Promise<AIDecision | null> {
    const ai = this.getAI(playerId);
    if (!ai) {
      console.warn(`AI not found for player: ${playerId}`);
      return null;
    }

    try {
      // 添加思考延迟
      await ai['addThinkingDelay']();

      // 做出决策
      const decision = ai.makeDecision(hand, gameState);

      // 记录决策历史
      this.recordDecision(playerId, decision);

      return decision;
    } catch (error) {
      console.error(`AI decision error for player ${playerId}:`, error);
      return {
        type: 'draw',
        confidence: 0,
        reasoning: 'AI决策出错，默认摸牌',
      };
    }
  }

  /**
   * 让AI选择颜色
   * @param playerId 玩家ID
   * @param hand 手牌
   * @param gameState 游戏状态
   * @returns 选择的颜色
   */
  chooseColor(playerId: string, hand: Card[], gameState: GameStateInfo) {
    const ai = this.getAI(playerId);
    if (!ai) {
      console.warn(`AI not found for player: ${playerId}`);
      return null;
    }

    try {
      return ai.chooseColor(hand, gameState);
    } catch (error) {
      console.error(`AI color choice error for player ${playerId}:`, error);
      return null;
    }
  }

  /**
   * 检查AI是否应该叫UNO
   * @param playerId 玩家ID
   * @param hand 手牌
   * @param gameState 游戏状态
   * @returns 是否应该叫UNO
   */
  shouldCallUno(playerId: string, hand: Card[], gameState: GameStateInfo): boolean {
    const ai = this.getAI(playerId);
    if (!ai) {
      return false;
    }

    try {
      return ai.shouldCallUno(hand, gameState);
    } catch (error) {
      console.error(`AI UNO check error for player ${playerId}:`, error);
      return false;
    }
  }

  /**
   * 记录AI决策
   * @param playerId 玩家ID
   * @param decision 决策
   */
  private recordDecision(playerId: string, decision: AIDecision): void {
    const history = this.decisionHistory.get(playerId) || [];
    history.push({
      ...decision,
      timestamp: Date.now(),
    } as any);

    // 只保留最近100个决策
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }

    this.decisionHistory.set(playerId, history);
  }

  /**
   * 获取AI决策历史
   * @param playerId 玩家ID
   * @returns 决策历史
   */
  getDecisionHistory(playerId: string): AIDecision[] {
    return this.decisionHistory.get(playerId) || [];
  }

  /**
   * 获取AI统计信息
   * @param playerId 玩家ID
   * @returns 统计信息
   */
  getAIStats(playerId: string): {
    totalDecisions: number;
    averageConfidence: number;
    decisionTypes: Record<string, number>;
    difficulty: string;
  } | null {
    const ai = this.getAI(playerId);
    const history = this.getDecisionHistory(playerId);

    if (!ai || history.length === 0) {
      return null;
    }

    const totalDecisions = history.length;
    const averageConfidence = history.reduce((sum, d) => sum + d.confidence, 0) / totalDecisions;
    
    const decisionTypes: Record<string, number> = {};
    for (const decision of history) {
      decisionTypes[decision.type] = (decisionTypes[decision.type] || 0) + 1;
    }

    return {
      totalDecisions,
      averageConfidence,
      decisionTypes,
      difficulty: ai.getDifficulty(),
    };
  }

  /**
   * 重置所有AI
   */
  resetAll(): void {
    this.aiInstances.clear();
    this.decisionHistory.clear();
  }

  /**
   * 获取所有AI实例
   * @returns AI实例映射
   */
  getAllAIs(): Map<string, AIStrategy> {
    return new Map(this.aiInstances);
  }

  /**
   * 批量创建AI
   * @param players 玩家列表
   * @param difficulty 难度级别
   */
  createAIsForPlayers(players: Player[], difficulty: GameDifficulty): void {
    for (const player of players) {
      if (player.isAI()) {
        this.createAI(player.getId(), difficulty);
      }
    }
  }

  /**
   * 检查是否有AI玩家
   * @returns 是否存在AI玩家
   */
  hasAIPlayers(): boolean {
    return this.aiInstances.size > 0;
  }

  /**
   * 获取AI数量
   * @returns AI数量
   */
  getAICount(): number {
    return this.aiInstances.size;
  }
} 