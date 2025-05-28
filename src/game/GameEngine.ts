import {
  AIDifficulty,
  CardColor,
  GameDirection,
  GamePhase,
  PlayerType
} from '../types';
import { Card } from './Card';
import { Deck } from './Deck';
import { Player } from './Player';

/**
 * 游戏引擎内部状态接口
 */
interface InternalGameState {
  phase: GamePhase;
  currentPlayerId: string;
  direction: GameDirection;
  currentCard: any;
  drawStack: number;
  selectedColor: CardColor | null;
  players: any[];
  winner: any;
  roundNumber: number;
  gameStartTime: number;
}

/**
 * UNO游戏引擎
 * 管理游戏的完整流程和规则
 */
export class GameEngine {
  private gameState: InternalGameState;
  private deck: Deck;
  private discardPile: Card[] = [];
  private players: Player[] = [];
  private currentPlayerIndex: number = 0;
  private direction: GameDirection = GameDirection.CLOCKWISE;
  private drawStack: number = 0; // 累积的抽牌数量
  private selectedColor: CardColor | null = null; // 万能牌选择的颜色

  constructor() {
    this.gameState = {
      phase: GamePhase.SETUP,
      currentPlayerId: '',
      direction: GameDirection.CLOCKWISE,
      currentCard: null,
      drawStack: 0,
      selectedColor: null,
      players: [],
      winner: null,
      roundNumber: 1,
      gameStartTime: Date.now()
    };
    this.deck = new Deck();
  }

  /**
   * 初始化游戏
   */
  initializeGame(playerConfigs: Array<{
    id: string;
    name: string;
    type: PlayerType;
    aiDifficulty?: AIDifficulty;
  }>): void {
    if (playerConfigs.length < 2 || playerConfigs.length > 6) {
      throw new Error('游戏需要2-6个玩家');
    }

    // 创建玩家
    this.players = playerConfigs.map(config => 
      new Player(config.id, config.name, config.type, config.aiDifficulty)
    );

    // 创建并洗牌
    this.deck = Deck.createStandardDeck();
    console.log('初始牌堆数量:', this.deck.getCount()); // 应该是108张
    this.deck.shuffle();

    // 发牌（每人7张）
    for (let i = 0; i < 7; i++) {
      this.players.forEach(player => {
        const card = this.deck.drawCard();
        if (card) {
          player.addCard(card);
        }
      });
    }
    console.log('发牌后牌堆数量:', this.deck.getCount()); // 应该是108 - (4*7) = 80张

    // 翻开第一张牌作为起始牌
    this.startFirstCard();
    console.log('翻开第一张牌后牌堆数量:', this.deck.getCount()); // 应该是79张

    // 设置游戏状态
    this.gameState.phase = GamePhase.PLAYING;
    this.gameState.players = this.players.map(p => p.toJSON());
    this.currentPlayerIndex = 0;
    this.gameState.currentPlayerId = this.players[0].id;
    this.gameState.direction = this.direction;
    this.gameState.drawStack = this.drawStack;
    this.gameState.selectedColor = this.selectedColor;
    
    // 更新游戏状态，确保currentCard被正确设置
    this.updateGameState();
  }

  /**
   * 处理第一张牌
   */
  private startFirstCard(): void {
    let firstCard = this.deck.drawCard();
    
    // 如果第一张是万能牌，重新抽取
    while (firstCard && firstCard.isWildCard()) {
      this.deck.addCardToTop(firstCard);
      this.deck.shuffle();
      firstCard = this.deck.drawCard();
    }

    if (firstCard) {
      this.discardPile.push(firstCard);
      this.gameState.currentCard = firstCard.toJSON();
      
      // 处理第一张牌的特殊效果
      this.handleFirstCardEffect(firstCard);
    }
  }

  /**
   * 处理第一张牌的特殊效果
   */
  private handleFirstCardEffect(card: Card): void {
    switch (card.type) {
      case 'skip':
        this.nextPlayer();
        break;
      case 'reverse':
        if (this.players.length === 2) {
          this.nextPlayer();
        } else {
          this.reverseDirection();
        }
        break;
      case 'draw_two':
        this.drawStack = 2;
        break;
    }
  }

  /**
   * 玩家出牌
   */
  playCard(playerId: string, cardId: string, selectedColor?: CardColor): boolean {
    if (this.gameState.phase !== GamePhase.PLAYING) {
      return false;
    }

    const player = this.getPlayerById(playerId);
    if (!player || player.id !== this.gameState.currentPlayerId) {
      return false;
    }

    const currentCard = this.getCurrentCard();
    if (!currentCard) {
      return false;
    }

    // 检查是否可以出牌
    if (!player.canPlayCard(cardId, currentCard)) {
      return false;
    }

    // 如果有抽牌堆叠，只能出+2或+4牌
    if (this.drawStack > 0) {
      const card = player.hand.find(c => c.id === cardId);
      if (!card || (card.type !== 'draw_two' && card.type !== 'wild_draw_four')) {
        return false;
      }
    }

    // 出牌
    const playedCard = player.playCard(cardId);
    if (!playedCard) {
      return false;
    }

    // 处理万能牌颜色选择
    if (playedCard.isWildCard()) {
      if (!selectedColor) {
        return false; // 万能牌必须选择颜色
      }
      // 创建带颜色的万能牌副本
      const coloredCard = new Card(playedCard.type, selectedColor, playedCard.value);
      this.discardPile.push(coloredCard);
      this.gameState.currentCard = coloredCard.toJSON();
      this.selectedColor = selectedColor;
      this.gameState.selectedColor = selectedColor;
    } else {
      this.discardPile.push(playedCard);
      this.gameState.currentCard = playedCard.toJSON();
      this.selectedColor = null;
      this.gameState.selectedColor = null;
    }

    // 处理特殊卡牌效果
    this.handleCardEffect(playedCard);

    // 检查胜利条件
    if (player.hasWon()) {
      this.endGame(player);
      return true;
    }

    // 检查UNO违规
    if (player.hasUnoViolation()) {
      this.handleUnoViolation(player);
    }

    // 更新游戏状态
    this.updateGameState();

    // 下一个玩家
    if (this.gameState.phase === GamePhase.PLAYING) {
      this.nextPlayer();
    }

    return true;
  }

  /**
   * 处理卡牌效果
   */
  private handleCardEffect(card: Card): void {
    switch (card.type) {
      case 'skip':
        this.nextPlayer(); // 跳过下一个玩家
        break;
      case 'reverse':
        if (this.players.length === 2) {
          this.nextPlayer(); // 两人游戏时反转等于跳过
        } else {
          this.reverseDirection();
        }
        break;
      case 'draw_two':
        this.drawStack += 2;
        break;
      case 'wild_draw_four':
        this.drawStack += 4;
        break;
    }
  }

  /**
   * 玩家抽牌
   */
  drawCard(playerId: string): boolean {
    if (this.gameState.phase !== GamePhase.PLAYING) {
      return false;
    }

    const player = this.getPlayerById(playerId);
    if (!player || player.id !== this.gameState.currentPlayerId) {
      return false;
    }

    // 处理抽牌堆叠
    const drawCount = this.drawStack > 0 ? this.drawStack : 1;
    
    // 检查牌堆是否足够
    if (this.deck.getCount() < drawCount) {
      this.refillDeck();
    }

    // 抽牌
    const drawnCards = this.deck.drawCards(drawCount);
    player.addCards(drawnCards);

    // 重置抽牌堆叠
    this.drawStack = 0;
    this.gameState.drawStack = 0;

    // 更新游戏状态
    this.updateGameState();

    // 下一个玩家
    this.nextPlayer();

    return true;
  }

  /**
   * 重新填充牌堆
   */
  private refillDeck(): void {
    if (this.discardPile.length <= 1) {
      return; // 没有足够的牌来重新填充
    }

    this.deck.refillFromDiscardPile(this.discardPile);
    
    // 保留弃牌堆顶部的牌
    const topCard = this.discardPile[this.discardPile.length - 1];
    this.discardPile = [topCard];
  }

  /**
   * 下一个玩家
   */
  private nextPlayer(): void {
    if (this.direction === GameDirection.CLOCKWISE) {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    } else {
      this.currentPlayerIndex = (this.currentPlayerIndex - 1 + this.players.length) % this.players.length;
    }
    
    this.gameState.currentPlayerId = this.players[this.currentPlayerIndex].id;
  }

  /**
   * 反转方向
   */
  private reverseDirection(): void {
    this.direction = this.direction === GameDirection.CLOCKWISE ? GameDirection.COUNTERCLOCKWISE : GameDirection.CLOCKWISE;
    this.gameState.direction = this.direction;
  }

  /**
   * 处理UNO违规
   */
  private handleUnoViolation(player: Player): void {
    // UNO违规罚抽2张牌
    const penaltyCards = this.deck.drawCards(2);
    player.addCards(penaltyCards);
  }

  /**
   * 玩家调用UNO
   */
  callUno(playerId: string): boolean {
    const player = this.getPlayerById(playerId);
    if (!player || player.getHandCount() !== 1) {
      return false;
    }

    player.callUno();
    this.updateGameState();
    return true;
  }

  /**
   * 结束游戏
   */
  private endGame(winner: Player): void {
    this.gameState.phase = GamePhase.FINISHED;
    this.gameState.winner = winner.toJSON();
    
    // 计算分数
    this.calculateScores(winner);
    this.updateGameState();
  }

  /**
   * 计算分数
   */
  private calculateScores(winner: Player): void {
    let totalPoints = 0;
    
    this.players.forEach(player => {
      if (player.id !== winner.id) {
        const handScore = player.calculateHandScore();
        totalPoints += handScore;
      }
    });

    winner.addScore(totalPoints);
  }

  /**
   * 获取当前卡牌
   */
  private getCurrentCard(): Card | null {
    if (this.discardPile.length === 0) {
      return null;
    }
    return this.discardPile[this.discardPile.length - 1];
  }

  /**
   * 根据ID获取玩家
   */
  private getPlayerById(playerId: string): Player | null {
    return this.players.find(p => p.id === playerId) || null;
  }

  /**
   * 更新游戏状态
   */
  private updateGameState(): void {
    this.gameState.players = this.players.map(p => p.toJSON());
    this.gameState.drawStack = this.drawStack;
    this.gameState.selectedColor = this.selectedColor;
    
    // 更新当前卡牌
    const currentCard = this.getCurrentCard();
    this.gameState.currentCard = currentCard ? currentCard.toJSON() : null;
  }

  /**
   * 获取游戏状态
   */
  getGameState(): InternalGameState {
    return { ...this.gameState };
  }

  /**
   * 获取当前玩家
   */
  getCurrentPlayer(): Player | null {
    return this.players[this.currentPlayerIndex] || null;
  }

  /**
   * 获取抽牌堆数量
   */
  getDrawPileCount(): number {
    return this.deck.getCount();
  }

  /**
   * 获取弃牌堆
   */
  getDiscardPile(): Card[] {
    return [...this.discardPile];
  }

  /**
   * 获取当前卡牌（公共方法）
   */
  getCurrentCardPublic(): Card | null {
    return this.getCurrentCard();
  }

  /**
   * 检查玩家是否可以出牌
   */
  canPlayerPlay(playerId: string): boolean {
    if (this.gameState.phase !== GamePhase.PLAYING) {
      return false;
    }

    const player = this.getPlayerById(playerId);
    if (!player || player.id !== this.gameState.currentPlayerId) {
      return false;
    }

    const currentCard = this.getCurrentCard();
    if (!currentCard) {
      return false;
    }

    // 如果有抽牌堆叠，检查是否有对应的牌
    if (this.drawStack > 0) {
      return player.hand.some(card => 
        card.type === 'draw_two' || card.type === 'wild_draw_four'
      );
    }

    return player.hasPlayableCard(currentCard);
  }

  /**
   * 获取玩家可出的牌
   */
  getPlayableCards(playerId: string): Card[] {
    const player = this.getPlayerById(playerId);
    const currentCard = this.getCurrentCard();
    
    if (!player || !currentCard) {
      return [];
    }

    // 如果有抽牌堆叠，只能出+2或+4牌
    if (this.drawStack > 0) {
      return player.hand.filter(card => 
        card.type === 'draw_two' || card.type === 'wild_draw_four'
      );
    }

    return player.getPlayableCards(currentCard);
  }

  /**
   * 重置游戏
   */
  resetGame(): void {
    this.players.forEach(player => {
      player.clearHand();
      player.resetScore();
    });
    
    this.deck = new Deck();
    this.discardPile = [];
    this.currentPlayerIndex = 0;
    this.direction = GameDirection.CLOCKWISE;
    this.drawStack = 0;
    this.selectedColor = null;
    
    this.gameState = {
      phase: GamePhase.SETUP,
      currentPlayerId: '',
      direction: GameDirection.CLOCKWISE,
      currentCard: null,
      drawStack: 0,
      selectedColor: null,
      players: [],
      winner: null,
      roundNumber: 1,
      gameStartTime: Date.now()
    };
  }

  /**
   * 开始新一轮
   */
  startNewRound(): void {
    // 清空手牌
    this.players.forEach(player => player.clearHand());
    
    // 重新创建牌堆
    this.deck = Deck.createStandardDeck();
    this.deck.shuffle();
    this.discardPile = [];
    
    // 重新发牌
    for (let i = 0; i < 7; i++) {
      this.players.forEach(player => {
        const card = this.deck.drawCard();
        if (card) {
          player.addCard(card);
        }
      });
    }

    // 翻开第一张牌
    this.startFirstCard();

    // 重置游戏状态
    this.drawStack = 0;
    this.selectedColor = null;
    this.gameState.phase = GamePhase.PLAYING;
    this.gameState.roundNumber++;
    this.gameState.winner = null;
    this.gameState.drawStack = 0;
    this.gameState.selectedColor = null;
    
    this.updateGameState();
  }
} 