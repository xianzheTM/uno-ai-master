import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { UtilsDemo } from '../UtilsDemo'
import { CardColor, CardType } from '../../types'

// Mock utils functions
vi.mock('@/utils', () => ({
  createStandardDeck: vi.fn(() => [
    { id: '1', type: CardType.NUMBER, color: CardColor.RED, value: 5 },
    { id: '2', type: CardType.SKIP, color: CardColor.BLUE },
    { id: '3', type: CardType.WILD, color: CardColor.WILD }
  ]),
  shuffleDeck: vi.fn((deck) => [...deck].reverse()),
  getCardDisplayName: vi.fn((card) => `${card.color} ${card.value || card.type}`),
  getCardColorClass: vi.fn((color) => `bg-${color.toLowerCase()}-500`),
  canPlayCard: vi.fn(() => ({ canPlay: true, reason: '' })),
  getCardEffect: vi.fn(() => ({ skipPlayers: 0, drawCards: 0, reverse: false, chooseColor: false }))
}))

describe('UtilsDemo', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('组件渲染', () => {
    it('应该正确渲染组件标题', () => {
      render(<UtilsDemo />)
      
      expect(screen.getByText('工具函数演示')).toBeInTheDocument()
    })

    it('应该渲染所有控制按钮', () => {
      render(<UtilsDemo />)
      
      expect(screen.getByText('生成标准牌堆 (108张)')).toBeInTheDocument()
      expect(screen.getByText('洗牌')).toBeInTheDocument()
      expect(screen.getByText('检查出牌规则')).toBeInTheDocument()
    })

    it('应该渲染颜色示例', () => {
      render(<UtilsDemo />)
      
      expect(screen.getByText('UNO颜色主题')).toBeInTheDocument()
      expect(screen.getByText('RED')).toBeInTheDocument()
      expect(screen.getByText('BLUE')).toBeInTheDocument()
      expect(screen.getByText('GREEN')).toBeInTheDocument()
      expect(screen.getByText('YELLOW')).toBeInTheDocument()
      expect(screen.getByText('WILD')).toBeInTheDocument()
    })
  })

  describe('牌堆生成功能', () => {
    it('应该生成标准牌堆', async () => {
      const { createStandardDeck } = await import('@/utils')
      render(<UtilsDemo />)
      
      const generateButton = screen.getByText('生成标准牌堆 (108张)')
      fireEvent.click(generateButton)
      
      expect(createStandardDeck).toHaveBeenCalled()
    })

    it('生成牌堆后应该显示统计信息', async () => {
      render(<UtilsDemo />)
      
      const generateButton = screen.getByText('生成标准牌堆 (108张)')
      fireEvent.click(generateButton)
      
      await waitFor(() => {
        expect(screen.getByText('牌堆统计')).toBeInTheDocument()
        expect(screen.getByText(/总卡牌数:/)).toBeInTheDocument()
      })
    })

    it('生成牌堆后应该显示当前卡牌', async () => {
      render(<UtilsDemo />)
      
      const generateButton = screen.getByText('生成标准牌堆 (108张)')
      fireEvent.click(generateButton)
      
      await waitFor(() => {
        expect(screen.getByText('当前卡牌')).toBeInTheDocument()
      })
    })
  })

  describe('洗牌功能', () => {
    it('洗牌按钮在没有牌堆时应该被禁用', () => {
      render(<UtilsDemo />)
      
      const shuffleButton = screen.getByText('洗牌')
      expect(shuffleButton).toBeDisabled()
    })

    it('生成牌堆后洗牌按钮应该可用', async () => {
      render(<UtilsDemo />)
      
      const generateButton = screen.getByText('生成标准牌堆 (108张)')
      fireEvent.click(generateButton)
      
      await waitFor(() => {
        const shuffleButton = screen.getByText('洗牌')
        expect(shuffleButton).not.toBeDisabled()
      })
    })

    it('应该调用洗牌函数', async () => {
      const { shuffleDeck } = await import('@/utils')
      render(<UtilsDemo />)
      
      // 先生成牌堆
      const generateButton = screen.getByText('生成标准牌堆 (108张)')
      fireEvent.click(generateButton)
      
      await waitFor(() => {
        const shuffleButton = screen.getByText('洗牌')
        fireEvent.click(shuffleButton)
        expect(shuffleDeck).toHaveBeenCalled()
      })
    })
  })

  describe('出牌规则检查', () => {
    it('检查出牌规则按钮在没有选择卡牌时应该被禁用', () => {
      render(<UtilsDemo />)
      
      const checkButton = screen.getByText('检查出牌规则')
      expect(checkButton).toBeDisabled()
    })

    it('应该显示卡牌选择区域', async () => {
      render(<UtilsDemo />)
      
      const generateButton = screen.getByText('生成标准牌堆 (108张)')
      fireEvent.click(generateButton)
      
      await waitFor(() => {
        expect(screen.getByText('选择卡牌测试出牌规则')).toBeInTheDocument()
        expect(screen.getByText('显示前20张卡牌，点击选择')).toBeInTheDocument()
      })
    })
  })

  describe('卡牌效果显示', () => {
    it('应该显示卡牌效果提示', async () => {
      render(<UtilsDemo />)
      
      const generateButton = screen.getByText('生成标准牌堆 (108张)')
      fireEvent.click(generateButton)
      
      await waitFor(() => {
        expect(screen.getByText('点击查看效果')).toBeInTheDocument()
      })
    })
  })

  describe('响应式设计', () => {
    it('应该有正确的CSS类名', () => {
      render(<UtilsDemo />)
      
      const container = screen.getByText('工具函数演示').closest('div')
      expect(container).toHaveClass('max-w-4xl', 'mx-auto', 'p-6', 'bg-white', 'rounded-lg', 'shadow-lg')
    })

    it('按钮应该有正确的样式类', () => {
      render(<UtilsDemo />)
      
      const generateButton = screen.getByText('生成标准牌堆 (108张)')
      expect(generateButton).toHaveClass('px-4', 'py-2', 'bg-blue-500', 'text-white', 'rounded')
    })
  })

  describe('边界情况', () => {
    it('应该处理空牌堆的情况', () => {
      render(<UtilsDemo />)
      
      // 确保没有统计信息显示
      expect(screen.queryByText('牌堆统计')).not.toBeInTheDocument()
      expect(screen.queryByText('当前卡牌')).not.toBeInTheDocument()
    })

    it('应该处理工具函数返回错误的情况', async () => {
      const { createStandardDeck } = await import('@/utils')
      vi.mocked(createStandardDeck).mockReturnValue([])
      
      render(<UtilsDemo />)
      
      const generateButton = screen.getByText('生成标准牌堆 (108张)')
      fireEvent.click(generateButton)
      
      // 应该不显示统计信息
      expect(screen.queryByText('牌堆统计')).not.toBeInTheDocument()
    })
  })

  describe('用户交互', () => {
    it('应该正确处理按钮点击事件', async () => {
      render(<UtilsDemo />)
      
      const generateButton = screen.getByText('生成标准牌堆 (108张)')
      
      // 模拟多次点击
      fireEvent.click(generateButton)
      fireEvent.click(generateButton)
      
      const { createStandardDeck } = await import('@/utils')
      expect(createStandardDeck).toHaveBeenCalledTimes(2)
    })

    it('应该正确处理卡牌选择', async () => {
      render(<UtilsDemo />)
      
      const generateButton = screen.getByText('生成标准牌堆 (108张)')
      fireEvent.click(generateButton)
      
      await waitFor(() => {
        const cards = screen.getAllByRole('generic').filter(el => 
          el.className.includes('cursor-pointer') && 
          el.className.includes('w-16')
        )
        
        if (cards.length > 0) {
          fireEvent.click(cards[0])
          // 验证选择状态
          expect(cards[0]).toHaveClass('ring-2', 'ring-blue-500', 'scale-105')
        }
      })
    })
  })
}) 