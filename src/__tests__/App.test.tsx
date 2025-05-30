import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from '../App'

// Mock UtilsDemo component
vi.mock('../components/UtilsDemo', () => ({
  UtilsDemo: () => <div data-testid="utils-demo">UtilsDemo Component</div>
}))

// Mock UIDemo component
vi.mock('../components/UIDemo', () => ({
  UIDemo: () => <div data-testid="ui-demo">�� UI组件演示</div>
}))

// Mock GameDemo component
vi.mock('../components/GameDemo', () => ({
  GameDemo: () => <div data-testid="game-demo">🎮 游戏组件演示</div>
}))

// Mock UnoGame component
vi.mock('../components/UnoGame', () => ({
  UnoGame: () => <div data-testid="uno-game">UNO Game</div>
}))

describe('App', () => {
  describe('主页显示', () => {
    it('应该显示应用标题', () => {
      render(<App />)
      
      expect(screen.getByText('🎮 UNO AI')).toBeInTheDocument()
    })

    it('应该显示应用描述', () => {
      render(<App />)
      
      expect(screen.getByText('与AI机器人对战的经典UNO卡牌游戏')).toBeInTheDocument()
    })

    it('应该显示游戏特色卡片', () => {
      render(<App />)
      
      expect(screen.getByText('智能AI对手')).toBeInTheDocument()
      expect(screen.getByText('经典规则')).toBeInTheDocument()
      expect(screen.getByText('精美界面')).toBeInTheDocument()
      expect(screen.getByText('三种难度的AI策略，提供不同挑战体验')).toBeInTheDocument()
      expect(screen.getByText('完整的UNO游戏规则，支持特殊卡牌效果')).toBeInTheDocument()
      expect(screen.getByText('现代化设计，流畅的动画和交互体验')).toBeInTheDocument()
    })

    it('应该显示开始游戏按钮', () => {
      render(<App />)
      
      expect(screen.getByText('🎮 开始游戏')).toBeInTheDocument()
    })

    it('应该显示开发者选项', () => {
      render(<App />)
      
      expect(screen.getByText('🔧 开发者选项')).toBeInTheDocument()
    })

    it('点击开发者选项应该展开演示按钮', () => {
      render(<App />)
      
      const developerOptions = screen.getByText('🔧 开发者选项')
      fireEvent.click(developerOptions)
      
      expect(screen.getByText('🎯 工具函数演示')).toBeInTheDocument()
      expect(screen.getByText('🎨 UI组件演示')).toBeInTheDocument()
      expect(screen.getByText('🎮 游戏组件演示')).toBeInTheDocument()
    })
  })

  describe('页面切换功能', () => {
    it('点击开始游戏按钮应该切换到游戏界面', () => {
      render(<App />)
      
      const playButton = screen.getByText('🎮 开始游戏')
      fireEvent.click(playButton)
      
      expect(screen.getByTestId('uno-game')).toBeInTheDocument()
      expect(screen.queryByText('🎮 UNO AI')).not.toBeInTheDocument()
    })

    it('点击工具函数演示按钮应该切换到演示页面', () => {
      render(<App />)
      
      // 先展开开发者选项
      const developerOptions = screen.getByText('🔧 开发者选项')
      fireEvent.click(developerOptions)
      
      const demoButton = screen.getByText('🎯 工具函数演示')
      fireEvent.click(demoButton)
      
      expect(screen.getByTestId('utils-demo')).toBeInTheDocument()
      expect(screen.queryByText('🎮 UNO AI')).not.toBeInTheDocument()
    })

    it('点击UI组件演示按钮应该切换到UI演示页面', () => {
      render(<App />)
      
      // 先展开开发者选项
      const developerOptions = screen.getByText('🔧 开发者选项')
      fireEvent.click(developerOptions)
      
      const uiButton = screen.getByText('🎨 UI组件演示')
      fireEvent.click(uiButton)
      
      expect(screen.getByTestId('ui-demo')).toBeInTheDocument()
      expect(screen.queryByText('🎮 UNO AI')).not.toBeInTheDocument()
    })

    it('点击游戏组件演示按钮应该切换到游戏演示页面', () => {
      render(<App />)
      
      // 先展开开发者选项
      const developerOptions = screen.getByText('🔧 开发者选项')
      fireEvent.click(developerOptions)
      
      const gameButton = screen.getByText('🎮 游戏组件演示')
      fireEvent.click(gameButton)
      
      expect(screen.getByTestId('game-demo')).toBeInTheDocument()
      expect(screen.queryByText('🎮 UNO AI')).not.toBeInTheDocument()
    })

    it('演示页面应该显示返回按钮', () => {
      render(<App />)
      
      // 先展开开发者选项
      const developerOptions = screen.getByText('🔧 开发者选项')
      fireEvent.click(developerOptions)
      
      const demoButton = screen.getByText('🎯 工具函数演示')
      fireEvent.click(demoButton)
      
      expect(screen.getByText('← 返回主页')).toBeInTheDocument()
    })

    it('点击返回按钮应该回到主页', () => {
      render(<App />)
      
      // 先展开开发者选项并切换到演示页面
      const developerOptions = screen.getByText('🔧 开发者选项')
      fireEvent.click(developerOptions)
      
      const demoButton = screen.getByText('🎯 工具函数演示')
      fireEvent.click(demoButton)
      
      // 点击返回按钮
      const backButton = screen.getByText('← 返回主页')
      fireEvent.click(backButton)
      
      // 应该回到主页
      expect(screen.getByText('🎮 UNO AI')).toBeInTheDocument()
      expect(screen.queryByTestId('utils-demo')).not.toBeInTheDocument()
    })
  })

  describe('样式和布局', () => {
    it('主页应该有正确的布局类', () => {
      render(<App />)
      
      const mainContainer = screen.getByText('🎮 UNO AI').closest('div')
      expect(mainContainer?.parentElement).toHaveClass('min-h-screen', 'flex', 'items-center', 'justify-center')
    })

    it('演示页面应该有正确的布局类', () => {
      render(<App />)
      
      // 先展开开发者选项
      const developerOptions = screen.getByText('🔧 开发者选项')
      fireEvent.click(developerOptions)
      
      const demoButton = screen.getByText('🎯 工具函数演示')
      fireEvent.click(demoButton)
      
      const demoContainer = screen.getByText('← 返回主页').closest('div')
      expect(demoContainer?.parentElement?.parentElement).toHaveClass('min-h-screen', 'bg-gray-100', 'py-8')
    })

    it('标题应该有正确的样式类', () => {
      render(<App />)
      
      const title = screen.getByText('🎮 UNO AI')
      expect(title).toHaveClass('text-7xl', 'font-bold', 'text-gray-800', 'mb-6')
    })

    it('描述应该有正确的样式类', () => {
      render(<App />)
      
      const description = screen.getByText('与AI机器人对战的经典UNO卡牌游戏')
      expect(description).toHaveClass('text-2xl', 'text-gray-600', 'mb-12')
    })

    it('开始游戏按钮应该有正确的样式类', () => {
      render(<App />)
      
      const playButton = screen.getByText('🎮 开始游戏')
      expect(playButton).toHaveClass('w-full', 'px-8', 'py-6', 'bg-white', 'text-gray-800', 'rounded-2xl', 'hover:bg-gray-50', 'transition-all', 'duration-300', 'font-bold', 'text-2xl', 'hover:shadow-lg', 'transform', 'hover:scale-105')
    })

    it('特色卡片应该有正确的样式类', () => {
      render(<App />)
      
      const featureCard = screen.getByText('智能AI对手').closest('div')
      expect(featureCard).toHaveClass('bg-white', 'bg-opacity-70', 'backdrop-blur-sm', 'rounded-xl', 'p-6', 'shadow-lg', 'border', 'border-indigo-200')
    })

    it('返回按钮应该有正确的样式类', () => {
      render(<App />)
      
      // 先展开开发者选项
      const developerOptions = screen.getByText('🔧 开发者选项')
      fireEvent.click(developerOptions)
      
      const demoButton = screen.getByText('🎯 工具函数演示')
      fireEvent.click(demoButton)
      
      const backButton = screen.getByText('← 返回主页')
      expect(backButton).toHaveClass('px-4', 'py-2', 'bg-gray-500', 'text-white', 'rounded', 'hover:bg-gray-600', 'transition-colors')
    })
  })

  describe('响应式设计', () => {
    it('应该有响应式容器类', () => {
      render(<App />)
      
      // 先展开开发者选项
      const developerOptions = screen.getByText('🔧 开发者选项')
      fireEvent.click(developerOptions)
      
      const demoButton = screen.getByText('🎯 工具函数演示')
      fireEvent.click(demoButton)
      
      const container = screen.getByText('← 返回主页').closest('.container')
      expect(container).toHaveClass('container', 'mx-auto', 'px-4')
    })

    it('特色卡片网格应该是响应式的', () => {
      render(<App />)
      
      const grid = screen.getByText('智能AI对手').closest('div')?.parentElement
      expect(grid).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-3', 'gap-6', 'mb-12')
    })

    it('开发者选项按钮网格应该是响应式的', () => {
      render(<App />)
      
      // 先展开开发者选项
      const developerOptions = screen.getByText('🔧 开发者选项')
      fireEvent.click(developerOptions)
      
      // 查找包含所有三个按钮的网格容器
      const utilsButton = screen.getByText('🎯 工具函数演示')
      const uiButton = screen.getByText('🎨 UI组件演示')
      const gameButton = screen.getByText('🎮 游戏组件演示')
      
      // 找到共同的父容器
      const buttonGrid = utilsButton.parentElement
      expect(buttonGrid).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-3', 'gap-4', 'mt-4')
    })
  })

  describe('可访问性', () => {
    it('按钮应该可以通过键盘访问', () => {
      render(<App />)
      
      const playButton = screen.getByText('🎮 开始游戏')
      expect(playButton.tagName).toBe('BUTTON')
      expect(playButton).toBeVisible()
    })

    it('应该有适当的语义结构', () => {
      render(<App />)
      
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('🎮 UNO AI')
      expect(screen.getByRole('heading', { level: 3, name: '智能AI对手' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 3, name: '经典规则' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 3, name: '精美界面' })).toBeInTheDocument()
    })

    it('开发者选项应该是可折叠的', () => {
      render(<App />)
      
      const details = screen.getByText('🔧 开发者选项').closest('details')
      expect(details).toBeInTheDocument()
      
      const summary = screen.getByText('🔧 开发者选项')
      expect(summary.tagName).toBe('SUMMARY')
    })
  })

  describe('状态管理', () => {
    it('应该正确管理显示状态', () => {
      render(<App />)
      
      // 初始状态应该显示主页
      expect(screen.getByText('🎮 UNO AI')).toBeInTheDocument()
      expect(screen.queryByTestId('utils-demo')).not.toBeInTheDocument()
      
      // 切换到演示页面
      const developerOptions = screen.getByText('🔧 开发者选项')
      fireEvent.click(developerOptions)
      
      const demoButton = screen.getByText('🎯 工具函数演示')
      fireEvent.click(demoButton)
      
      expect(screen.queryByText('🎮 UNO AI')).not.toBeInTheDocument()
      expect(screen.getByTestId('utils-demo')).toBeInTheDocument()
      
      // 切换回主页
      const backButton = screen.getByText('← 返回主页')
      fireEvent.click(backButton)
      
      expect(screen.getByText('🎮 UNO AI')).toBeInTheDocument()
      expect(screen.queryByTestId('utils-demo')).not.toBeInTheDocument()
    })

    it('应该支持多次页面切换', () => {
      render(<App />)
      
      // 多次切换
      for (let i = 0; i < 3; i++) {
        // 展开开发者选项
        const developerOptions = screen.getByText('🔧 开发者选项')
        fireEvent.click(developerOptions)
        
        const demoButton = screen.getByText('🎯 工具函数演示')
        fireEvent.click(demoButton)
        expect(screen.getByTestId('utils-demo')).toBeInTheDocument()
        
        const backButton = screen.getByText('← 返回主页')
        fireEvent.click(backButton)
        expect(screen.getByText('🎮 UNO AI')).toBeInTheDocument()
      }
    })
  })
}) 