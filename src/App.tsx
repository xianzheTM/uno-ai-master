import React, { useState } from 'react'
import { UtilsDemo } from './components/UtilsDemo'
import { UIDemo } from './components/UIDemo'

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'utils' | 'ui'>('home')

  if (currentView === 'utils') {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6 text-center">
            <button
              onClick={() => setCurrentView('home')}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              ← 返回主页
            </button>
          </div>
          <UtilsDemo />
        </div>
      </div>
    )
  }

  if (currentView === 'ui') {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6 text-center">
            <button
              onClick={() => setCurrentView('home')}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              ← 返回主页
            </button>
          </div>
          <UIDemo />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">
          🎮 UNO AI
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          与AI机器人对战的经典UNO卡牌游戏
        </p>
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              项目进展更新！
            </h2>
            <div className="text-left space-y-2">
              <p className="text-green-600">✅ Vite + React + TypeScript</p>
              <p className="text-green-600">✅ Tailwind CSS</p>
              <p className="text-green-600">✅ 项目结构搭建</p>
              <p className="text-green-600">✅ 基础配置文件</p>
              <p className="text-green-600">✅ 核心类型定义</p>
              <p className="text-green-600">✅ 基础工具函数</p>
              <p className="text-green-600">✅ 游戏核心逻辑</p>
              <p className="text-green-600">✅ AI系统</p>
              <p className="text-green-600">✅ 状态管理</p>
              <p className="text-green-600">✅ 基础UI组件</p>
              <p className="text-blue-600">📝 Card.ts - 卡牌类型</p>
              <p className="text-blue-600">📝 Player.ts - 玩家类型</p>
              <p className="text-blue-600">📝 GameState.ts - 游戏状态</p>
              <p className="text-blue-600">📝 AI.ts - AI策略类型</p>
              <p className="text-blue-600">📝 cardUtils.ts - 卡牌工具</p>
              <p className="text-blue-600">📝 shuffleUtils.ts - 洗牌算法</p>
              <p className="text-blue-600">📝 gameRules.ts - 游戏规则</p>
              <p className="text-purple-600">🧪 466个单元测试全部通过</p>
              <p className="text-orange-600">🎨 UI组件: Card, Button, Modal, Avatar, LoadingSpinner</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setCurrentView('utils')}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
              >
                🎯 查看工具函数演示
              </button>
              <button
                onClick={() => setCurrentView('ui')}
                className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-semibold"
              >
                🎨 查看UI组件演示
              </button>
            </div>
            <p className="text-gray-500">
              第四阶段 Day 1-2 完成！基础UI组件已就绪，接下来实现游戏界面组件...
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App 