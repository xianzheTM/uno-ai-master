import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameSetup } from '../GameSetup';

// Mock useGameStore
const mockInitializeGame = vi.fn();
vi.mock('@/stores/gameStore', () => ({
  useGameStore: () => ({
    initializeGame: mockInitializeGame,
  }),
}));

describe('GameSetup', () => {
  const mockOnStartGame = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('默认设置', () => {
    it('应该默认有一个人类玩家和两个简单AI', () => {
      render(<GameSetup onStartGame={mockOnStartGame} />);
      
      // 检查是否有三个玩家
      const playerInputs = screen.getAllByPlaceholderText('玩家名称');
      expect(playerInputs).toHaveLength(3);
      
      // 检查第一个玩家是人类
      expect(playerInputs[0]).toHaveValue('玩家1');
      const firstPlayerButton = screen.getByText('👤 人类');
      expect(firstPlayerButton).toBeInTheDocument();
      
      // 检查第二和第三个玩家是AI
      const secondPlayerButton = screen.getAllByText('🤖 AI');
      expect(secondPlayerButton).toHaveLength(2);
      
      // 检查AI难度
      const aiSelects = screen.getAllByDisplayValue('简单AI');
      expect(aiSelects).toHaveLength(2);
    });

    it('应该显示正确的玩家数量统计', () => {
      render(<GameSetup onStartGame={mockOnStartGame} />);
      
      expect(screen.getByText(/当前 3 人游戏/)).toBeInTheDocument();
      expect(screen.getByText(/1 个人类玩家/)).toBeInTheDocument();
      expect(screen.getByText(/2 个AI玩家/)).toBeInTheDocument();
    });
  });

  describe('添加玩家功能', () => {
    it('应该能够添加新玩家', () => {
      render(<GameSetup onStartGame={mockOnStartGame} />);
      
      const addButton = screen.getByText('➕ 添加玩家');
      fireEvent.click(addButton);
      
      // 应该有4个玩家了
      const playerInputs = screen.getAllByPlaceholderText('玩家名称');
      expect(playerInputs).toHaveLength(4);
      
      // 新玩家应该是AI
      expect(screen.getByText(/当前 4 人游戏/)).toBeInTheDocument();
      expect(screen.getByText(/3 个AI玩家/)).toBeInTheDocument();
    });

    it('应该在达到6个玩家时禁用添加按钮', () => {
      render(<GameSetup onStartGame={mockOnStartGame} />);
      
      const addButton = screen.getByRole('button', { name: /添加玩家/ });
      
      // 添加3个玩家（总共6个）
      for (let i = 0; i < 3; i++) {
        fireEvent.click(addButton);
      }
      
      expect(addButton).toBeDisabled();
      expect(screen.getByText(/当前 6 人游戏/)).toBeInTheDocument();
    });

    it('应该自动生成AI名字', () => {
      render(<GameSetup onStartGame={mockOnStartGame} />);
      
      const addButton = screen.getByRole('button', { name: /添加玩家/ });
      fireEvent.click(addButton);
      
      const playerInputs = screen.getAllByPlaceholderText('玩家名称');
      // 新的AI名字生成逻辑：第三个AI（index=2）会是 '简单AI3'
      expect(playerInputs[3]).toHaveValue('简单AI3');
    });
  });

  describe('移除玩家功能', () => {
    it('应该能够移除玩家', () => {
      render(<GameSetup onStartGame={mockOnStartGame} />);
      
      // 先添加一个玩家
      const addButton = screen.getByText('➕ 添加玩家');
      fireEvent.click(addButton);
      
      // 应该有4个玩家
      expect(screen.getAllByPlaceholderText('玩家名称')).toHaveLength(4);
      
      // 移除一个玩家
      const removeButtons = screen.getAllByTitle('移除玩家');
      fireEvent.click(removeButtons[0]);
      
      // 应该回到3个玩家
      expect(screen.getAllByPlaceholderText('玩家名称')).toHaveLength(3);
    });

    it('应该在只有3个玩家时隐藏移除按钮', () => {
      render(<GameSetup onStartGame={mockOnStartGame} />);
      
      // 默认3个玩家，不应该有移除按钮
      expect(screen.queryByTitle('移除玩家')).not.toBeInTheDocument();
    });
  });

  describe('玩家类型切换', () => {
    it('不应该允许有多个人类玩家', () => {
      render(<GameSetup onStartGame={mockOnStartGame} />);
      
      // Mock alert
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      
      // 尝试将AI玩家切换为人类
      const aiButton = screen.getAllByText('🤖 AI')[0];
      fireEvent.click(aiButton);
      
      // 应该显示警告
      expect(alertSpy).toHaveBeenCalledWith('只能有一个人类玩家！');
      
      // 确保玩家类型没有改变
      expect(screen.getByText(/1 个人类玩家/)).toBeInTheDocument();
      expect(screen.getByText(/2 个AI玩家/)).toBeInTheDocument();
      
      alertSpy.mockRestore();
    });

    it('切换为人类时应该设置名字为玩家1', () => {
      render(<GameSetup onStartGame={mockOnStartGame} />);
      
      // 先将人类玩家切换为AI
      const humanButton = screen.getByText('👤 人类');
      fireEvent.click(humanButton);
      
      // 再将第一个AI切换回人类
      const aiButton = screen.getAllByText('🤖 AI')[0];
      fireEvent.click(aiButton);
      
      const playerInput = screen.getAllByPlaceholderText('玩家名称')[0];
      expect(playerInput).toHaveValue('玩家1');
    });

    it('切换为AI时应该自动生成AI名字', () => {
      render(<GameSetup onStartGame={mockOnStartGame} />);
      
      const firstPlayerButton = screen.getByText('👤 人类');
      fireEvent.click(firstPlayerButton);
      
      const firstPlayerInput = screen.getAllByPlaceholderText('玩家名称')[0];
      // 根据新的AI名字生成逻辑，第一个玩家切换为AI时会是'简单AI3'（因为已经有两个AI了）
      expect(firstPlayerInput).toHaveValue('简单AI3');
    });

    it('切换为人类时应该生成人类名字', () => {
      render(<GameSetup onStartGame={mockOnStartGame} />);
      
      // 先将人类玩家切换为AI
      const humanButton = screen.getByText('👤 人类');
      fireEvent.click(humanButton);
      
      // 现在将第二个AI玩家切换为人类
      const secondPlayerButton = screen.getAllByText('🤖 AI')[1]; // 选择第二个AI按钮
      fireEvent.click(secondPlayerButton);
      
      const secondPlayerInput = screen.getAllByPlaceholderText('玩家名称')[1];
      expect(secondPlayerInput).toHaveValue('玩家1');
    });
  });

  describe('AI难度修改', () => {
    it('应该能够修改AI难度', () => {
      render(<GameSetup onStartGame={mockOnStartGame} />);
      
      const aiSelects = screen.getAllByDisplayValue('简单AI');
      fireEvent.change(aiSelects[0], { target: { value: 'medium' } });
      
      expect(aiSelects[0]).toHaveValue('medium');
    });

    it('修改AI难度时应该更新AI名字', () => {
      render(<GameSetup onStartGame={mockOnStartGame} />);
      
      const aiSelects = screen.getAllByDisplayValue('简单AI');
      fireEvent.change(aiSelects[1], { target: { value: 'hard' } });
      
      const secondPlayerInput = screen.getAllByPlaceholderText('玩家名称')[2]; // 第三个玩家（index=2）
      expect(secondPlayerInput).toHaveValue('困难AI2');
    });
  });

  describe('游戏启动验证', () => {
    it('应该验证至少有一个人类玩家', () => {
      render(<GameSetup onStartGame={mockOnStartGame} />);
      
      // 将所有玩家都设置为AI
      const humanButton = screen.getByText('👤 人类');
      fireEvent.click(humanButton);
      
      // 尝试开始游戏
      const startButton = screen.getByText('🎮 开始游戏');
      
      // Mock alert
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      
      fireEvent.click(startButton);
      
      expect(alertSpy).toHaveBeenCalledWith('至少需要一个人类玩家！');
      expect(mockOnStartGame).not.toHaveBeenCalled();
      
      alertSpy.mockRestore();
    });

    it('应该正确初始化游戏', () => {
      render(<GameSetup onStartGame={mockOnStartGame} />);
      
      // 开始游戏
      const startButton = screen.getByText('🎮 开始游戏');
      fireEvent.click(startButton);
      
      expect(mockInitializeGame).toHaveBeenCalledWith({
        players: expect.arrayContaining([
          expect.objectContaining({
            id: '1',
            name: '玩家1',
            isAI: false,
            aiStrategy: undefined,
          }),
          expect.objectContaining({
            id: '2',
            isAI: true,
            aiStrategy: 'easy',
          }),
          expect.objectContaining({
            id: '3',
            isAI: true,
            aiStrategy: 'easy',
          }),
        ]),
        settings: expect.objectContaining({
          initialHandSize: 7,
          enableUnoCheck: true,
          enableSounds: true,
          gameSpeed: 'normal',
        }),
      });
      
      expect(mockOnStartGame).toHaveBeenCalled();
    });
  });

  describe('AI策略说明', () => {
    it('应该显示AI策略说明', () => {
      render(<GameSetup onStartGame={mockOnStartGame} />);
      
      expect(screen.getByText('AI策略说明')).toBeInTheDocument();
      expect(screen.getByText('🟢 简单AI')).toBeInTheDocument();
      expect(screen.getByText('🟡 中等AI')).toBeInTheDocument();
      expect(screen.getByText('🔴 困难AI')).toBeInTheDocument();
      expect(screen.getByText('随机策略，偶尔出错，适合新手')).toBeInTheDocument();
    });
  });

  describe('高级设置', () => {
    it('应该能够切换高级设置显示', () => {
      render(<GameSetup onStartGame={mockOnStartGame} />);
      
      const toggleButton = screen.getByText('显示高级设置');
      fireEvent.click(toggleButton);
      
      expect(screen.getByText('隐藏高级设置')).toBeInTheDocument();
      expect(screen.getByText(/AI思考时间会根据游戏速度和难度自动调整/)).toBeInTheDocument();
    });
  });

  describe('取消功能', () => {
    it('应该调用取消回调', () => {
      render(<GameSetup onStartGame={mockOnStartGame} onCancel={mockOnCancel} />);
      
      const cancelButton = screen.getByText('取消');
      fireEvent.click(cancelButton);
      
      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('没有取消回调时不显示取消按钮', () => {
      render(<GameSetup onStartGame={mockOnStartGame} />);
      
      expect(screen.queryByText('取消')).not.toBeInTheDocument();
    });
  });

  describe('游戏设置功能', () => {
    it('应该能设置游戏速度', () => {
      render(<GameSetup onStartGame={mockOnStartGame} />);
      
      // 使用更可靠的选择器来找到游戏速度的select元素
      const speedSelects = screen.getAllByRole('combobox');
      const speedSelect = speedSelects.find((select) => 
        select.parentElement?.querySelector('label')?.textContent === '游戏速度'
      );
      
      expect(speedSelect).toBeDefined();
      
      // 测试设置为快速
      fireEvent.change(speedSelect!, { target: { value: 'fast' } });
      expect(speedSelect).toHaveValue('fast');
      
      // 测试设置为慢速
      fireEvent.change(speedSelect!, { target: { value: 'slow' } });
      expect(speedSelect).toHaveValue('slow');
    });

    it('应该在开始游戏时传递速度设置', () => {
      render(<GameSetup onStartGame={mockOnStartGame} />);
      
      // 找到游戏速度的select元素
      const speedSelects = screen.getAllByRole('combobox');
      const speedSelect = speedSelects.find((select) => 
        select.parentElement?.querySelector('label')?.textContent === '游戏速度'
      );
      
      // 设置游戏速度为快速
      fireEvent.change(speedSelect!, { target: { value: 'fast' } });
      
      // 开始游戏
      const startButton = screen.getByText('🎮 开始游戏');
      fireEvent.click(startButton);
      
      // 验证initializeGame被调用时包含了gameSpeed设置
      expect(mockInitializeGame).toHaveBeenCalledWith(
        expect.objectContaining({
          settings: expect.objectContaining({
            gameSpeed: 'fast'
          })
        })
      );
    });
  });
}); 