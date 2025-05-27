import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import App from '../App'

// Mock UtilsDemo component
vi.mock('../components/UtilsDemo', () => ({
  UtilsDemo: () => <div data-testid="utils-demo">UtilsDemo Component</div>
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

    it('应该显示项目初始化完成信息', () => {
      render(<App />)
      
      expect(screen.getByText('项目初始化完成！')).toBeInTheDocument()
    })

    it('应该显示所有完成的功能项', () => {
      render(<App />)
      
      expect(screen.getByText('✅ Vite + React + TypeScript')).toBeInTheDocument()
      expect(screen.getByText('✅ Tailwind CSS')).toBeInTheDocument()
      expect(screen.getByText('✅ 项目结构搭建')).toBeInTheDocument()
      expect(screen.getByText('✅ 基础配置文件')).toBeInTheDocument()
      expect(screen.getByText('✅ 核心类型定义')).toBeInTheDocument()
      expect(screen.getByText('✅ 基础工具函数')).toBeInTheDocument()
    })

    it('应该显示核心文件信息', () => {
      render(<App />)
      
      expect(screen.getByText('📝 Card.ts - 卡牌类型')).toBeInTheDocument()
      expect(screen.getByText('📝 Player.ts - 玩家类型')).toBeInTheDocument()
      expect(screen.getByText('📝 GameState.ts - 游戏状态')).toBeInTheDocument()
      expect(screen.getByText('📝 AI.ts - AI策略类型')).toBeInTheDocument()
      expect(screen.getByText('📝 cardUtils.ts - 卡牌工具')).toBeInTheDocument()
      expect(screen.getByText('📝 shuffleUtils.ts - 洗牌算法')).toBeInTheDocument()
      expect(screen.getByText('📝 gameRules.ts - 游戏规则')).toBeInTheDocument()
    })

    it('应该显示测试信息', () => {
      render(<App />)
      
      expect(screen.getByText(/🧪.*单元测试全部通过/)).toBeInTheDocument()
    })

    it('应该显示查看演示按钮', () => {
      render(<App />)
      
      expect(screen.getByText('🎯 查看工具函数演示')).toBeInTheDocument()
    })

    it('应该显示阶段完成信息', () => {
      render(<App />)
      
      expect(screen.getByText(/第一阶段.*完成！基础工具函数和测试已就绪/)).toBeInTheDocument()
    })
  })

  describe('页面切换功能', () => {
    it('点击演示按钮应该切换到演示页面', () => {
      render(<App />)
      
      const demoButton = screen.getByText('🎯 查看工具函数演示')
      fireEvent.click(demoButton)
      
      expect(screen.getByTestId('utils-demo')).toBeInTheDocument()
      expect(screen.queryByText('🎮 UNO AI')).not.toBeInTheDocument()
    })

    it('演示页面应该显示返回按钮', () => {
      render(<App />)
      
      const demoButton = screen.getByText('🎯 查看工具函数演示')
      fireEvent.click(demoButton)
      
      expect(screen.getByText('← 返回主页')).toBeInTheDocument()
    })

    it('点击返回按钮应该回到主页', () => {
      render(<App />)
      
      // 先切换到演示页面
      const demoButton = screen.getByText('🎯 查看工具函数演示')
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
      
      const demoButton = screen.getByText('🎯 查看工具函数演示')
      fireEvent.click(demoButton)
      
      const demoContainer = screen.getByText('← 返回主页').closest('div')
      expect(demoContainer?.parentElement?.parentElement).toHaveClass('min-h-screen', 'bg-gray-100', 'py-8')
    })

    it('标题应该有正确的样式类', () => {
      render(<App />)
      
      const title = screen.getByText('🎮 UNO AI')
      expect(title).toHaveClass('text-6xl', 'font-bold', 'text-gray-800', 'mb-4')
    })

    it('描述应该有正确的样式类', () => {
      render(<App />)
      
      const description = screen.getByText('与AI机器人对战的经典UNO卡牌游戏')
      expect(description).toHaveClass('text-xl', 'text-gray-600', 'mb-8')
    })

    it('演示按钮应该有正确的样式类', () => {
      render(<App />)
      
      const demoButton = screen.getByText('🎯 查看工具函数演示')
      expect(demoButton).toHaveClass('px-6', 'py-3', 'bg-blue-500', 'text-white', 'rounded-lg', 'hover:bg-blue-600', 'transition-colors', 'font-semibold')
    })

    it('返回按钮应该有正确的样式类', () => {
      render(<App />)
      
      const demoButton = screen.getByText('🎯 查看工具函数演示')
      fireEvent.click(demoButton)
      
      const backButton = screen.getByText('← 返回主页')
      expect(backButton).toHaveClass('px-4', 'py-2', 'bg-gray-500', 'text-white', 'rounded', 'hover:bg-gray-600', 'transition-colors')
    })
  })

  describe('响应式设计', () => {
    it('应该有响应式容器类', () => {
      render(<App />)
      
      const demoButton = screen.getByText('🎯 查看工具函数演示')
      fireEvent.click(demoButton)
      
      const container = screen.getByText('← 返回主页').closest('.container')
      expect(container).toHaveClass('container', 'mx-auto', 'px-4')
    })

    it('信息卡片应该有正确的样式', () => {
      render(<App />)
      
      const infoCard = screen.getByText('项目初始化完成！').closest('div')
      expect(infoCard).toHaveClass('bg-white', 'rounded-lg', 'p-6', 'shadow-lg')
    })
  })

  describe('状态管理', () => {
    it('应该正确管理显示状态', () => {
      render(<App />)
      
      // 初始状态应该显示主页
      expect(screen.getByText('🎮 UNO AI')).toBeInTheDocument()
      expect(screen.queryByTestId('utils-demo')).not.toBeInTheDocument()
      
      // 切换到演示页面
      const demoButton = screen.getByText('🎯 查看工具函数演示')
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
        const demoButton = screen.getByText('🎯 查看工具函数演示')
        fireEvent.click(demoButton)
        expect(screen.getByTestId('utils-demo')).toBeInTheDocument()
        
        const backButton = screen.getByText('← 返回主页')
        fireEvent.click(backButton)
        expect(screen.getByText('🎮 UNO AI')).toBeInTheDocument()
      }
    })
  })

  describe('可访问性', () => {
    it('按钮应该可以通过键盘访问', () => {
      render(<App />)
      
      const demoButton = screen.getByText('🎯 查看工具函数演示')
      expect(demoButton).toBeVisible()
      expect(demoButton.tagName).toBe('BUTTON')
    })

    it('返回按钮应该可以通过键盘访问', () => {
      render(<App />)
      
      const demoButton = screen.getByText('🎯 查看工具函数演示')
      fireEvent.click(demoButton)
      
      const backButton = screen.getByText('← 返回主页')
      expect(backButton).toBeVisible()
      expect(backButton.tagName).toBe('BUTTON')
    })
  })
}) 