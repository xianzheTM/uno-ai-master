import React, { useState } from 'react';
import { Card, Button, Modal, Avatar, LoadingSpinner } from './ui';
import { Card as CardType } from '@/types';
import { createStandardDeck } from '@/utils';

export const UIDemo: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CardType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 创建一些示例卡牌
  const sampleCards = createStandardDeck().slice(0, 8);

  const handleCardClick = (card: CardType) => {
    setSelectedCard(card);
    console.log('选中卡牌:', card);
  };

  const handleLoadingTest = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🎨 UI组件演示
        </h1>
        <p className="text-gray-600">
          展示UNO游戏中使用的所有基础UI组件
        </p>
      </div>

      {/* Card组件演示 */}
      <section className="bg-white rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">🃏 Card 组件</h2>
        
        {/* 不同尺寸的卡牌 */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">不同尺寸</h3>
          <div className="flex items-end gap-4">
            <Card 
              card={sampleCards[0]} 
              size="small" 
              onClick={handleCardClick}
            />
            <Card 
              card={sampleCards[1]} 
              size="medium" 
              onClick={handleCardClick}
            />
            <Card 
              card={sampleCards[2]} 
              size="large" 
              onClick={handleCardClick}
            />
          </div>
        </div>

        {/* 不同状态的卡牌 */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">不同状态</h3>
          <div className="flex gap-4">
            <Card 
              card={sampleCards[3]} 
              onClick={handleCardClick}
            />
            <Card 
              card={sampleCards[4]} 
              isSelected={true}
              onClick={handleCardClick}
            />
            <Card 
              card={sampleCards[5]} 
              isPlayable={false}
              onClick={handleCardClick}
            />
            <Card 
              card={sampleCards[6]} 
              isHidden={true}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            普通 | 选中 | 不可用 | 隐藏
          </p>
        </div>

        {/* 选中的卡牌信息 */}
        {selectedCard && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              选中的卡牌: {selectedCard.color} {selectedCard.type} 
              {selectedCard.value !== undefined && ` ${selectedCard.value}`}
            </p>
          </div>
        )}
      </section>

      {/* Button组件演示 */}
      <section className="bg-white rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">🔘 Button 组件</h2>
        
        {/* 不同变体 */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">不同变体</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">主要按钮</Button>
            <Button variant="secondary">次要按钮</Button>
            <Button variant="success">成功按钮</Button>
            <Button variant="warning">警告按钮</Button>
            <Button variant="danger">危险按钮</Button>
            <Button variant="ghost">幽灵按钮</Button>
          </div>
        </div>

        {/* 不同尺寸 */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">不同尺寸</h3>
          <div className="flex items-center gap-3">
            <Button size="small">小按钮</Button>
            <Button size="medium">中按钮</Button>
            <Button size="large">大按钮</Button>
          </div>
        </div>

        {/* 特殊状态 */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">特殊状态</h3>
          <div className="flex gap-3">
            <Button 
              isLoading={isLoading}
              onClick={handleLoadingTest}
            >
              {isLoading ? '加载中...' : '测试加载'}
            </Button>
            <Button disabled>禁用按钮</Button>
            <Button fullWidth>全宽按钮</Button>
          </div>
        </div>
      </section>

      {/* Avatar组件演示 */}
      <section className="bg-white rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">👤 Avatar 组件</h2>
        
        {/* 不同尺寸 */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">不同尺寸</h3>
          <div className="flex items-center gap-4">
            <Avatar name="小头像" size="small" />
            <Avatar name="中头像" size="medium" />
            <Avatar name="大头像" size="large" />
            <Avatar name="超大头像" size="xl" />
          </div>
        </div>

        {/* 不同状态 */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">不同状态</h3>
          <div className="flex gap-4">
            <Avatar name="玩家1" />
            <Avatar name="玩家2" isActive={true} />
            <Avatar name="当前玩家" isCurrentPlayer={true} />
            <Avatar 
              name="有徽章" 
              showBadge={true} 
              badgeContent="5" 
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            普通 | 在线 | 当前玩家 | 带徽章
          </p>
        </div>
      </section>

      {/* Modal组件演示 */}
      <section className="bg-white rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">📱 Modal 组件</h2>
        
        <Button onClick={() => setIsModalOpen(true)}>
          打开模态框
        </Button>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="示例模态框"
          size="medium"
        >
          <div className="space-y-4">
            <p>这是一个示例模态框的内容。</p>
            <p>你可以在这里放置任何内容，比如表单、确认对话框等。</p>
            <div className="flex gap-3 pt-4">
              <Button 
                variant="primary"
                onClick={() => setIsModalOpen(false)}
              >
                确认
              </Button>
              <Button 
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
              >
                取消
              </Button>
            </div>
          </div>
        </Modal>
      </section>

      {/* LoadingSpinner组件演示 */}
      <section className="bg-white rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">⏳ LoadingSpinner 组件</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-3">不同尺寸</h3>
            <div className="flex justify-center items-center gap-4">
              <LoadingSpinner size="small" />
              <LoadingSpinner size="medium" />
              <LoadingSpinner size="large" />
            </div>
          </div>
          
          <div className="text-center">
            <h3 className="text-lg font-medium mb-3">不同颜色</h3>
            <div className="flex justify-center items-center gap-4">
              <LoadingSpinner color="primary" />
              <LoadingSpinner color="secondary" />
            </div>
          </div>
          
          <div className="text-center">
            <h3 className="text-lg font-medium mb-3">带文本</h3>
            <LoadingSpinner text="加载中..." />
          </div>
        </div>
      </section>

      {/* 组合使用示例 */}
      <section className="bg-white rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">🎯 组合使用示例</h2>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar 
                name="玩家1" 
                isCurrentPlayer={true}
                showBadge={true}
                badgeContent="7"
              />
              <div>
                <h4 className="font-semibold">玩家1</h4>
                <p className="text-sm text-gray-500">7张手牌</p>
              </div>
            </div>
            <Button size="small" variant="primary">
              出牌
            </Button>
          </div>
          
          <div className="flex gap-2">
            {sampleCards.slice(0, 4).map((card, index) => (
              <Card
                key={card.id}
                card={card}
                size="small"
                isSelected={index === 0}
                onClick={handleCardClick}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}; 