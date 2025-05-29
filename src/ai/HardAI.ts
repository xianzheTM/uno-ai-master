import { AIStrategy, AIDecision, GameStateInfo } from './AIStrategy';
import { Card } from '../game/Card';
import { CardColor, CardType } from '../types';

/**
 * 困难AI策略
 * 特点：
 * - 记牌功能，跟踪已打出的卡牌
 * - 概率计算，预测对手手牌
 * - 深度战术思考
 * - 最优化的颜色选择
 * - 高级的UNO时机判断
 * - 考虑多步棋的策略
 */
export class HardAI extends AIStrategy {
  private cardMemory: Map<string, number> = new Map(); // 记录已打出的卡牌
  private opponentBehaviorHistory: Map<string, any[]> = new Map(); // 对手行为历史

  constructor(playerId: string) {
    super('hard', playerId);
    this.initializeCardMemory();
  }

  /**
   * 初始化卡牌记忆
   */
  private initializeCardMemory(): void {
    // 初始化标准UNO牌组的卡牌数量
    const colors = [CardColor.RED, CardColor.YELLOW, CardColor.GREEN, CardColor.BLUE];
    
    // 数字牌 0-9
    for (const color of colors) {
      this.cardMemory.set(`${color}-0`, 1); // 0只有1张
      for (let i = 1; i <= 9; i++) {
        this.cardMemory.set(`${color}-${i}`, 2); // 1-9各有2张
      }
    }

    // 功能牌
    for (const color of colors) {
      this.cardMemory.set(`${color}-SKIP`, 2);
      this.cardMemory.set(`${color}-REVERSE`, 2);
      this.cardMemory.set(`${color}-DRAW_TWO`, 2);
    }

    // 万能牌
    this.cardMemory.set('WILD-WILD', 4);
    this.cardMemory.set('WILD-WILD_DRAW_FOUR', 4);
  }

  /**
   * 更新卡牌记忆
   */
  private updateCardMemory(playedCards: Card[]): void {
    for (const card of playedCards) {
      const key = `${card.color}-${card.value}`;
      const currentCount = this.cardMemory.get(key) || 0;
      if (currentCount > 0) {
        this.cardMemory.set(key, currentCount - 1);
      }
    }
  }

  /**
   * 更新对手行为历史
   */
  private updateOpponentBehavior(gameState: GameStateInfo): void {
    for (const player of gameState.players) {
      if (player.id !== this.playerId) {
        const history = this.opponentBehaviorHistory.get(player.id) || [];
        
        // 记录对手当前状态
        const behaviorRecord = {
          handSize: player.handSize,
          hasCalledUno: player.hasCalledUno,
          timestamp: Date.now()
        };
        
        history.push(behaviorRecord);
        
        // 只保留最近20条记录
        if (history.length > 20) {
          history.splice(0, history.length - 20);
        }
        
        this.opponentBehaviorHistory.set(player.id, history);
      }
    }
  }

  /**
   * 做出决策
   */
  makeDecision(hand: Card[], gameState: GameStateInfo): AIDecision {
    // 更新卡牌记忆
    this.updateCardMemory(gameState.playedCards);
    
    // 更新对手行为历史
    this.updateOpponentBehavior(gameState);

    // 检查是否需要叫UNO
    if (this.shouldCallUno(hand, gameState)) {
      return {
        type: 'uno',
        confidence: 1.0,
        reasoning: '手牌数量少，需要叫UNO',
      };
    }

    // 获取可打出的卡牌
    const validIndices = this.getValidCardIndices(hand, gameState.currentCard, gameState.currentColor);

    if (validIndices.length === 0) {
      return {
        type: 'draw',
        confidence: 1.0,
        reasoning: '没有可打出的卡牌',
      };
    }

    // 深度分析和决策
    const bestMove = this.findBestMove(hand, gameState, validIndices);

    return bestMove;
  }

  /**
   * 寻找最佳移动
   */
  private findBestMove(hand: Card[], gameState: GameStateInfo, validIndices: number[]): AIDecision {
    const threatLevel = this.analyzeOpponentThreat(gameState);
    const gamePhase = this.analyzeGamePhase(gameState);

    // 评估每个可能的移动
    const moveEvaluations = validIndices.map(index => {
      const card = hand[index];
      const score = this.evaluateMove(card, index, hand, gameState, threatLevel, gamePhase);
      return { index, card, score };
    });

    // 按分数排序
    moveEvaluations.sort((a, b) => b.score - a.score);

    // 选择最佳移动
    const bestMove = moveEvaluations[0];
    let chosenColor: CardColor | undefined;

    if (bestMove.card.isWildCard()) {
      chosenColor = this.chooseOptimalColor(hand, gameState);
    }

    return {
      type: 'play',
      cardIndex: bestMove.index,
      chosenColor,
      confidence: 0.95,
      reasoning: `深度分析选择: ${bestMove.card.toString()}, 分数: ${bestMove.score.toFixed(2)}`,
    };
  }

  /**
   * 评估移动
   */
  private evaluateMove(
    card: Card, 
    cardIndex: number, 
    hand: Card[], 
    gameState: GameStateInfo, 
    threatLevel: number, 
    gamePhase: 'early' | 'middle' | 'late'
  ): number {
    let score = 0;

    // 基础卡牌价值
    score += this.calculateAdvancedCardValue(card, hand, gameState);

    // 战术价值（包含对手行为分析）
    score += this.calculateTacticalValue(card, gameState, threatLevel);

    // 游戏阶段调整
    score += this.calculatePhaseAdjustment(card, hand, gamePhase);

    // 概率分析
    score += this.calculateProbabilityBonus(card, gameState);

    // 连击潜力
    score += this.calculateComboValue(card, cardIndex, hand, gameState);

    // 防御价值
    score += this.calculateDefensiveValue(card, gameState, threatLevel);

    return score;
  }

  /**
   * 计算高级卡牌价值
   */
  private calculateAdvancedCardValue(card: Card, hand: Card[], gameState: GameStateInfo): number {
    let value = this.calculateCardValue(card, hand, gameState);

    // 稀有度加成
    const rarity = this.calculateCardRarity(card);
    value += rarity * 10;

    // 手牌协同性
    const synergy = this.calculateHandSynergy(card, hand);
    value += synergy;

    return value;
  }

  /**
   * 计算卡牌稀有度
   */
  private calculateCardRarity(card: Card): number {
    const key = `${card.color}-${card.value}`;
    const remaining = this.cardMemory.get(key) || 0;
    const total = this.getTotalCardCount(card);
    
    if (total === 0) return 0;
    
    // 剩余比例越低，稀有度越高
    return 1 - (remaining / total);
  }

  /**
   * 获取卡牌总数
   */
  private getTotalCardCount(card: Card): number {
    const value = card.value;
    
    if (value === 0) return 1;
    if (typeof value === 'number' && value >= 1 && value <= 9) return 2;
    if (card.type === CardType.SKIP || card.type === CardType.REVERSE || card.type === CardType.DRAW_TWO) return 2;
    if (card.type === CardType.WILD || card.type === CardType.WILD_DRAW_FOUR) return 4;
    
    return 0;
  }

  /**
   * 计算手牌协同性
   */
  private calculateHandSynergy(card: Card, hand: Card[]): number {
    let synergy = 0;
    const cardColor = card.color;
    const cardValue = card.value;
      
    // 颜色协同
    const sameColorCards = hand.filter(c => c.color === cardColor).length;
    synergy += sameColorCards * 3;

    // 数值协同
    const sameValueCards = hand.filter(c => c.value === cardValue).length;
    synergy += sameValueCards * 2;

    // 连续数字协同
    if (typeof cardValue === 'number') {
      const hasNext = hand.some(c => c.value === cardValue + 1);
      const hasPrev = hand.some(c => c.value === cardValue - 1);
      if (hasNext || hasPrev) synergy += 5;
    }

    return synergy;
  }

  /**
   * 计算战术价值
   */
  private calculateTacticalValue(card: Card, gameState: GameStateInfo, threatLevel: number): number {
    let value = 0;

    // 攻击性卡牌在高威胁时更有价值
    if (threatLevel > 50) {
      switch (card.type) {
        case CardType.SKIP:
          value += 40;
          break;
        case CardType.REVERSE:
          value += gameState.players.length === 3 ? 40 : 30;
          break;
        case CardType.DRAW_TWO:
          value += 50;
          break;
        case CardType.WILD_DRAW_FOUR:
          value += 70;
          break;
      }
    }

    // 防御性考虑
    if (threatLevel < 30) {
      // 低威胁时保留强力卡牌
      if (card.type === CardType.WILD_DRAW_FOUR) {
        value -= 20;
      }
    }

    return value;
  }

  /**
   * 计算游戏阶段调整
   */
  private calculatePhaseAdjustment(card: Card, hand: Card[], gamePhase: 'early' | 'middle' | 'late'): number {
    let adjustment = 0;
    const cardValue = card.value;

    switch (gamePhase) {
      case 'early':
        // 早期游戏，优先出数字牌
        if (typeof cardValue === 'number') {
          adjustment += 10;
        }
        break;

      case 'middle':
        // 中期游戏，平衡策略
        if (card.isActionCard()) {
          adjustment += 15;
        }
        break;

      case 'late':
        // 后期游戏，优先高分卡牌
        const points = this.getCardPoints(card);
        adjustment += points;
        
        // 如果手牌很少，优先万能牌
        if (hand.length <= 3 && card.isWildCard()) {
          adjustment += 30;
        }
        break;
    }

    return adjustment;
  }

  /**
   * 计算概率奖励
   */
  private calculateProbabilityBonus(card: Card, gameState: GameStateInfo): number {
    // 基于对手可能的手牌计算概率奖励
    let bonus = 0;

    // 如果选择的颜色对手不太可能有，给予奖励
    if (!card.isWildCard()) {
      const colorProbability = this.estimateOpponentColorProbability(card.color, gameState);
      bonus += (1 - colorProbability) * 20;
    }

    return bonus;
  }

  /**
   * 估算对手拥有某颜色卡牌的概率
   */
  private estimateOpponentColorProbability(color: CardColor, gameState: GameStateInfo): number {
    // 基于已打出的卡牌和剩余卡牌计算概率
    const totalColorCards = this.getTotalColorCards(color);
    const playedColorCards = gameState.playedCards.filter(c => c.color === color).length;
    const remainingColorCards = totalColorCards - playedColorCards;
    const totalRemainingCards = gameState.drawPileSize;

    if (totalRemainingCards === 0) return 0;

    return remainingColorCards / totalRemainingCards;
  }

  /**
   * 获取某颜色的总卡牌数
   */
  private getTotalColorCards(color: CardColor): number {
    if (color === CardColor.WILD) return 8; // 4张WILD + 4张WILD_DRAW_FOUR
    return 25; // 每种颜色25张牌
  }

  /**
   * 计算连击价值
   */
  private calculateComboValue(card: Card, cardIndex: number, hand: Card[], gameState: GameStateInfo): number {
    // 检查打出这张牌后是否能形成连击
    let comboValue = 0;

    // 模拟打出这张牌后的手牌状态
    const remainingHand = [...hand];
    remainingHand.splice(cardIndex, 1);

    // 检查剩余手牌中是否有可以连续打出的牌
    const newCurrentCard = card;
    const newCurrentColor = card.isWildCard() ? this.chooseOptimalColor(remainingHand, gameState) : card.color;

    const nextValidIndices = this.getValidCardIndices(remainingHand, newCurrentCard, newCurrentColor);
    
    if (nextValidIndices.length > 0) {
      comboValue += 15; // 基础连击奖励
      
      // 如果能连续打出多张牌，额外奖励
      if (nextValidIndices.length > 1) {
        comboValue += 10;
      }
    }

    return comboValue;
  }

  /**
   * 计算防御价值
   */
  private calculateDefensiveValue(card: Card, _gameState: GameStateInfo, threatLevel: number): number {
    let defensiveValue = 0;

    // 如果对手威胁很高，优先考虑防御
    if (threatLevel > 70) {
      // 跳过和反转可以打断对手节奏
      if (card.type === CardType.SKIP || card.type === CardType.REVERSE) {
        defensiveValue += 25;
      }
      
      // 摸牌牌可以增加对手负担
      if (card.type === CardType.DRAW_TWO || card.type === CardType.WILD_DRAW_FOUR) {
        defensiveValue += 35;
      }
    }

    return defensiveValue;
  }

  /**
   * 分析游戏阶段
   */
  private analyzeGamePhase(gameState: GameStateInfo): 'early' | 'middle' | 'late' {
    const totalCards = gameState.players.reduce((sum, player) => sum + player.handSize, 0);
    const averageCards = totalCards / gameState.players.length;

    if (averageCards > 5) return 'early';
    if (averageCards > 3) return 'middle';
    return 'late';
  }

  /**
   * 选择最优颜色
   */
  chooseOptimalColor(hand: Card[], gameState: GameStateInfo): CardColor {
    const colors = [CardColor.RED, CardColor.YELLOW, CardColor.GREEN, CardColor.BLUE];
    const colorScores: Record<string, number> = {
      [CardColor.RED]: 0,
      [CardColor.YELLOW]: 0,
      [CardColor.GREEN]: 0,
      [CardColor.BLUE]: 0,
    };

    for (const color of colors) {
      // 手牌中该颜色的数量
      const handColorCount = hand.filter(c => c.color === color).length;
      colorScores[color] += handColorCount * 10;

      // 该颜色功能牌的数量
      const actionCardCount = hand.filter(c => c.color === color && c.isActionCard()).length;
      colorScores[color] += actionCardCount * 15;

      // 对手不太可能有该颜色的概率
      const opponentProbability = this.estimateOpponentColorProbability(color, gameState);
      colorScores[color] += (1 - opponentProbability) * 20;

      // 该颜色剩余卡牌的稀有度
      const rarity = this.calculateColorRarity(color);
      colorScores[color] += rarity * 5;
    }

    // 选择分数最高的颜色
    let bestColor = CardColor.RED;
    let bestScore = colorScores[CardColor.RED];

    for (const [color, score] of Object.entries(colorScores)) {
      if (score > bestScore) {
        bestScore = score;
        bestColor = color as CardColor;
      }
    }

    return bestColor;
  }

  /**
   * 计算颜色稀有度
   */
  private calculateColorRarity(color: CardColor): number {
    let totalRemaining = 0;
    let totalOriginal = 0;

    // 统计该颜色所有卡牌的剩余数量
    for (const [key, remaining] of this.cardMemory.entries()) {
      if (key.startsWith(color)) {
        totalRemaining += remaining;
        totalOriginal += this.getCardCountFromKey(key);
      }
    }

    if (totalOriginal === 0) return 0;
    return 1 - (totalRemaining / totalOriginal);
  }

  /**
   * 从key直接获取卡牌数量
   */
  private getCardCountFromKey(key: string): number {
    const [_color, value] = key.split('-');
    
    if (value === '0') return 1;
    if (!isNaN(Number(value)) && Number(value) >= 1 && Number(value) <= 9) return 2;
    if (['SKIP', 'REVERSE', 'DRAW_TWO'].includes(value)) return 2;
    if (['WILD', 'WILD_DRAW_FOUR'].includes(value)) return 4;
    
    return 0;
  }

  /**
   * 获取卡牌分数
   */
  private getCardPoints(card: Card): number {
    if (typeof card.value === 'number') {
      return this.gameRules.scoring.numberCardPoints ? card.value : 0;
    }

    switch (card.type) {
      case CardType.SKIP:
      case CardType.REVERSE:
      case CardType.DRAW_TWO:
        return this.gameRules.scoring.specialCardPoints;
      case CardType.WILD:
      case CardType.WILD_DRAW_FOUR:
        return this.gameRules.scoring.wildCardPoints;
      default:
        return 0;
    }
  }

  /**
   * 选择颜色（万能牌）
   */
  chooseColor(hand: Card[], gameState: GameStateInfo): CardColor {
    return this.chooseOptimalColor(hand, gameState);
  }

  /**
   * 分析对手威胁程度（重写基类方法）
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
      
      // 基于行为历史的威胁分析
      const behaviorThreat = this.analyzeBehaviorThreat(player.id, player.handSize);
      threat += behaviorThreat;
    }
    
    return threat;
  }

  /**
   * 基于行为历史分析威胁
   */
  private analyzeBehaviorThreat(playerId: string, _currentHandSize: number): number {
    const history = this.opponentBehaviorHistory.get(playerId);
    if (!history || history.length < 3) return 0;
    
    let threat = 0;
    
    // 分析手牌减少速度
    const recentHistory = history.slice(-5);
    const handSizeChanges = [];
    for (let i = 1; i < recentHistory.length; i++) {
      const change = recentHistory[i-1].handSize - recentHistory[i].handSize;
      handSizeChanges.push(change);
    }
    
    // 如果对手连续出牌，威胁增加
    const consecutivePlays = handSizeChanges.filter(change => change > 0).length;
    if (consecutivePlays >= 2) {
      threat += 25;
    }
    
    // 如果对手手牌减少很快，威胁增加
    const averageReduction = handSizeChanges.reduce((sum, change) => sum + Math.max(0, change), 0) / handSizeChanges.length;
    if (averageReduction > 0.5) {
      threat += 15;
    }
    
    return threat;
  }

  /**
   * 是否应该叫UNO
   */
  shouldCallUno(hand: Card[], gameState: GameStateInfo): boolean {
    if (hand.length !== 2) {
      return false;
    }

    // 检查是否有可打出的牌
    const validIndices = this.getValidCardIndices(hand, gameState.currentCard, gameState.currentColor);
    
    if (validIndices.length === 0) {
      return false;
    }

    // 简化逻辑：只要手牌剩2张且有可出牌就叫UNO
    // 高级AI可以在makeDecision中进行更复杂的策略判断
    return true;
  }
} 