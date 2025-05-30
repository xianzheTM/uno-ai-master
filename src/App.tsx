import { useState } from 'react'
import { UtilsDemo } from './components/UtilsDemo'
import { UIDemo } from './components/UIDemo'
import { GameDemo } from './components/GameDemo'
import { UnoGame } from './components/UnoGame'

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'utils' | 'ui' | 'game' | 'play'>('home')

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

  if (currentView === 'game') {
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
          <GameDemo />
        </div>
      </div>
    )
  }

  if (currentView === 'play') {
    return <UnoGame />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="text-center max-w-2xl mx-auto px-6">
        {/* 主标题 */}
        <h1 className="text-7xl font-bold text-gray-800 mb-6">
          🎮 UNO AI
        </h1>
        <p className="text-2xl text-gray-600 mb-12">
          与AI机器人对战的经典UNO卡牌游戏
        </p>

        {/* 游戏特色 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white bg-opacity-70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-indigo-200">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">智能AI对手</h3>
            <p className="text-gray-600 text-sm">三种难度的AI策略，提供不同挑战体验</p>
          </div>
          <div className="bg-white bg-opacity-70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-indigo-200">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">经典规则</h3>
            <p className="text-gray-600 text-sm">完整的UNO游戏规则，支持特殊卡牌效果</p>
            </div>
          <div className="bg-white bg-opacity-70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-indigo-200">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">精美界面</h3>
            <p className="text-gray-600 text-sm">现代化设计，流畅的动画和交互体验</p>
          </div>
        </div>

            {/* 主要游戏入口 */}
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-1 shadow-xl">
              <button
                onClick={() => setCurrentView('play')}
              className="w-full px-8 py-6 bg-white text-gray-800 rounded-2xl hover:bg-gray-50 transition-all duration-300 font-bold text-2xl hover:shadow-lg transform hover:scale-105"
              >
                🎮 开始游戏
              </button>
            </div>
            
          {/* 开发者选项 */}
          <details className="bg-white bg-opacity-50 backdrop-blur-sm rounded-xl border border-indigo-200">
            <summary className="px-6 py-4 cursor-pointer font-semibold text-gray-700 hover:bg-indigo-50 rounded-xl transition-colors">
              🔧 开发者选项
            </summary>
            <div className="px-6 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <button
                onClick={() => setCurrentView('utils')}
                  className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm"
              >
                  🎯 工具函数演示
              </button>
              <button
                onClick={() => setCurrentView('ui')}
                  className="px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium text-sm"
              >
                  🎨 UI组件演示
              </button>
              <button
                onClick={() => setCurrentView('game')}
                  className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-sm"
              >
                  🎮 游戏组件演示
              </button>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}

export default App 