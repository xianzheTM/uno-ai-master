import { Card as UICard } from '@/types';
import { Card as GameCard } from '@/game/Card';

/**
 * 卡牌适配器工具
 * 用于在UI层Card接口和游戏逻辑层Card类之间进行转换
 */
export class CardAdapter {
  /**
   * 将UI层Card接口转换为游戏逻辑层Card类
   */
  static uiToGame(uiCard: UICard): GameCard {
    return GameCard.fromJSON(uiCard);
  }

  /**
   * 将游戏逻辑层Card类转换为UI层Card接口
   */
  static gameToUI(gameCard: GameCard): UICard {
    return gameCard.toJSON();
  }

  /**
   * 将UI层Card数组转换为游戏逻辑层Card数组
   */
  static uiArrayToGameArray(uiCards: UICard[]): GameCard[] {
    return uiCards.map(card => CardAdapter.uiToGame(card));
  }

  /**
   * 将游戏逻辑层Card数组转换为UI层Card数组
   */
  static gameArrayToUIArray(gameCards: GameCard[]): UICard[] {
    return gameCards.map(card => CardAdapter.gameToUI(card));
  }

  /**
   * 检查UI层卡牌是否可以出在指定卡牌上
   * 这是一个便捷方法，避免在UI层直接调用游戏逻辑
   */
  static canUICardPlayOn(uiCard: UICard, targetUICard: UICard): boolean {
    const gameCard = CardAdapter.uiToGame(uiCard);
    const targetGameCard = CardAdapter.uiToGame(targetUICard);
    return gameCard.canPlayOn(targetGameCard);
  }

  /**
   * 获取UI层卡牌的分数
   */
  static getUICardPoints(uiCard: UICard): number {
    const gameCard = CardAdapter.uiToGame(uiCard);
    return gameCard.getPoints();
  }

  /**
   * 获取UI层卡牌的显示名称
   */
  static getUICardDisplayName(uiCard: UICard): string {
    const gameCard = CardAdapter.uiToGame(uiCard);
    return gameCard.getDisplayName();
  }

  /**
   * 检查UI层卡牌是否为万能卡
   */
  static isUICardWild(uiCard: UICard): boolean {
    return uiCard.type === 'wild' || uiCard.type === 'wild_draw_four';
  }

  /**
   * 检查UI层卡牌是否为数字卡
   */
  static isUICardNumber(uiCard: UICard): boolean {
    return uiCard.type === 'number';
  }

  /**
   * 检查UI层卡牌是否为功能卡
   */
  static isUICardAction(uiCard: UICard): boolean {
    return ['skip', 'reverse', 'draw_two'].includes(uiCard.type);
  }
} 