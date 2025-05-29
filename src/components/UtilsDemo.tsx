import React, { useState } from 'react'
import { 
  createStandardDeck, 
  shuffleDeck, 
  getCardDisplayName, 
  getCardColorClass,
  canPlayCard,
  getCardEffect
} from '@/utils'
import { Card, CardColor } from '@/types'

export const UtilsDemo: React.FC = () => {
  const [deck, setDeck] = useState<Card[]>([])
  const [currentCard, setCurrentCard] = useState<Card | null>(null)
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)

  const generateDeck = () => {
    const newDeck = createStandardDeck()
    setDeck(newDeck)
    setCurrentCard(newDeck[0])
  }

  const shuffleCurrentDeck = () => {
    if (deck.length > 0) {
      const shuffled = shuffleDeck(deck)
      setDeck(shuffled)
      setCurrentCard(shuffled[0])
    }
  }

  const checkPlayability = () => {
    if (selectedCard && currentCard) {
      const result = canPlayCard(selectedCard, currentCard)
      alert(`${result.canPlay ? '可以出牌' : '不能出牌'}${result.reason ? ': ' + result.reason : ''}`)
    }
  }

  const showCardEffect = (card: Card) => {
    const effect = getCardEffect(card)
    const effects = []
    if (effect.skipPlayers) effects.push(`跳过${effect.skipPlayers}个玩家`)
    if (effect.drawCards) effects.push(`抽${effect.drawCards}张牌`)
    if (effect.reverse) effects.push('反转方向')
    if (effect.chooseColor) effects.push('选择颜色')
    
    if (effects.length > 0) {
      alert(`卡牌效果: ${effects.join(', ')}`)
    } else {
      alert('无特殊效果')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">工具函数演示</h2>
      
      {/* 控制按钮 */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={generateDeck}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          生成标准牌堆 (108张)
        </button>
        <button
          onClick={shuffleCurrentDeck}
          disabled={deck.length === 0}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:bg-gray-300"
        >
          洗牌
        </button>
        <button
          onClick={checkPlayability}
          disabled={!selectedCard || !currentCard}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors disabled:bg-gray-300"
        >
          检查出牌规则
        </button>
      </div>

      {/* 统计信息 */}
      {deck.length > 0 && (
        <div className="mb-6 p-4 bg-gray-100 rounded">
          <h3 className="text-lg font-semibold mb-2">牌堆统计</h3>
          <p>总卡牌数: {deck.length}</p>
          <p>数字卡: {deck.filter(card => card.type === 'number').length}</p>
          <p>特殊卡: {deck.filter(card => card.type !== 'number' && card.type !== 'wild' && card.type !== 'wild_draw_four').length}</p>
          <p>万能卡: {deck.filter(card => card.type === 'wild' || card.type === 'wild_draw_four').length}</p>
        </div>
      )}

      {/* 当前卡牌 */}
      {currentCard && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">当前卡牌</h3>
          <div 
            className={`inline-block w-20 h-28 rounded-lg border-2 border-gray-300 flex items-center justify-center text-white font-bold cursor-pointer ${getCardColorClass(currentCard.color)}`}
            onClick={() => showCardEffect(currentCard)}
          >
            {getCardDisplayName(currentCard)}
          </div>
          <p className="text-sm text-gray-600 mt-2">点击查看效果</p>
        </div>
      )}

      {/* 选择卡牌进行测试 */}
      {deck.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">选择卡牌测试出牌规则</h3>
          <div className="grid grid-cols-10 gap-2 max-h-40 overflow-y-auto">
            {deck.slice(0, 20).map((card, _index) => (
              <div
                key={card.id}
                className={`w-16 h-22 rounded border-2 flex items-center justify-center text-xs font-bold cursor-pointer transition-all ${
                  selectedCard?.id === card.id 
                    ? 'ring-2 ring-blue-500 scale-105' 
                    : 'hover:scale-105'
                } ${getCardColorClass(card.color)}`}
                onClick={() => setSelectedCard(card)}
              >
                {getCardDisplayName(card)}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-2">显示前20张卡牌，点击选择</p>
          {selectedCard && (
            <p className="text-sm text-blue-600 mt-2">
              已选择: {getCardDisplayName(selectedCard)} ({selectedCard.color})
            </p>
          )}
        </div>
      )}

      {/* 颜色示例 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">UNO颜色主题</h3>
        <div className="flex gap-4">
          {[CardColor.RED, CardColor.BLUE, CardColor.GREEN, CardColor.YELLOW, CardColor.WILD].map(color => (
            <div
              key={color}
              className={`w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold ${getCardColorClass(color)}`}
            >
              {color.toUpperCase()}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 