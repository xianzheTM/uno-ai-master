import React from 'react';
import { Button } from './Button';

interface HelpProps {
  onClose: () => void;
}

/**
 * 游戏帮助界面组件
 */
export const Help: React.FC<HelpProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">游戏帮助</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="small"
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </Button>
        </div>

        <div className="space-y-6 text-gray-700">
          {/* 游戏目标 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">🎯 游戏目标</h3>
            <p className="text-sm leading-relaxed">
              成为第一个出完所有手牌的玩家即可获胜。当你手中只剩一张牌时，必须喊"UNO"！
            </p>
          </section>

          {/* 基本规则 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">📋 基本规则</h3>
            <ul className="text-sm space-y-2">
              <li>• 每位玩家开始时有7张牌</li>
              <li>• 按顺序轮流出牌</li>
              <li>• 出的牌必须与当前顶牌的颜色或数字相同</li>
              <li>• 如果无法出牌，必须从牌堆抽一张牌</li>
              <li>• 手中剩余1张牌时必须喊"UNO"</li>
            </ul>
          </section>

          {/* 特殊卡牌 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">🃏 特殊卡牌</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-yellow-400 rounded flex items-center justify-center text-xs font-bold">
                    🚫
                  </div>
                  <div>
                    <h4 className="font-medium">跳过卡 (Skip)</h4>
                    <p className="text-gray-600">跳过下一个玩家的回合</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-400 rounded flex items-center justify-center text-xs font-bold">
                    ↻
                  </div>
                  <div>
                    <h4 className="font-medium">反转卡 (Reverse)</h4>
                    <p className="text-gray-600">改变游戏方向</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-red-400 rounded flex items-center justify-center text-xs font-bold text-white">
                    +2
                  </div>
                  <div>
                    <h4 className="font-medium">抽二卡 (+2)</h4>
                    <p className="text-gray-600">下一个玩家抽2张牌并跳过回合</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center text-xs font-bold text-white">
                    🌈
                  </div>
                  <div>
                    <h4 className="font-medium">变色卡 (Wild)</h4>
                    <p className="text-gray-600">可以改变当前颜色</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center text-xs font-bold text-white">
                    +4
                  </div>
                  <div>
                    <h4 className="font-medium">变色+4卡</h4>
                    <p className="text-gray-600">改变颜色且下一个玩家抽4张牌</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 质疑规则 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">⚖️ 质疑规则</h3>
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-medium text-gray-800">质疑UNO违规</h4>
                <p className="text-gray-600">
                  当玩家手牌剩1张但没有喊"UNO"时，其他玩家可以质疑。
                  质疑成功：被质疑者抽2张牌；质疑失败：质疑者抽2张牌。
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">质疑变色+4卡</h4>
                <p className="text-gray-600">
                  当对手出变色+4卡时，如果怀疑其有其他可出的牌，可以质疑。
                  质疑成功：对手抽4张牌；质疑失败：自己抽6张牌。
                </p>
              </div>
            </div>
          </section>

          {/* 操作指南 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">🎮 操作指南</h3>
            <ul className="text-sm space-y-2">
              <li>• 点击手中的卡牌即可出牌</li>
              <li>• 出万能牌后需要选择颜色</li>
              <li>• 无法出牌时点击"摸牌"按钮</li>
              <li>• 手中剩1张牌时点击"UNO"按钮</li>
              <li>• 怀疑对手违规时点击"质疑"按钮</li>
            </ul>
          </section>

          {/* AI难度说明 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">🤖 AI难度说明</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-green-50 p-3 rounded">
                <h4 className="font-medium text-green-800">简单</h4>
                <p className="text-green-600">随机出牌，适合新手练习</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded">
                <h4 className="font-medium text-yellow-800">中等</h4>
                <p className="text-yellow-600">基于规则的智能策略</p>
              </div>
              <div className="bg-red-50 p-3 rounded">
                <h4 className="font-medium text-red-800">困难</h4>
                <p className="text-red-600">高级算法，会记牌和预测</p>
              </div>
            </div>
          </section>

          {/* 小贴士 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">💡 游戏小贴士</h3>
            <ul className="text-sm space-y-2 text-gray-600">
              <li>• 尽量保留万能牌到关键时刻使用</li>
              <li>• 观察其他玩家的出牌规律</li>
              <li>• 适时使用特殊卡牌打断对手节奏</li>
              <li>• 记住要在手中剩1张牌时喊"UNO"</li>
              <li>• 善用质疑功能，但要谨慎判断</li>
            </ul>
          </section>
        </div>

        {/* 关闭按钮 */}
        <div className="mt-8 flex justify-center">
          <Button
            onClick={onClose}
            variant="primary"
            className="px-8"
          >
            我知道了
          </Button>
        </div>
      </div>
    </div>
  );
}; 