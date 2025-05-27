import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from '../gameStore';
import { GameEngine } from '../../game/GameEngine';
import { AIDifficulty, PlayerType } from '../../types';

// Mock localStorage for persist middleware
const mockStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};

// @ts-ignore
global.localStorage = mockStorage;

// Mock GameEngine
vi.mock('../../game/GameEngine');

describe('gameStore', () => {
  beforeEach(() => {
    // 重置store状态
    useGameStore.setState({
      gameEngine: null,
      isLoading: false,
      error: null
    });
    
    // 清除所有mock
    vi.clearAllMocks();
  });

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      const state = useGameStore.getState();
      
      expect(state.gameEngine).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('initializeGame', () => {
    it('应该成功初始化游戏', () => {
      const mockGameEngine = {
        initializeGame: vi.fn()
      };
      
      // Mock GameEngine constructor
      vi.mocked(GameEngine).mockImplementation(() => mockGameEngine as any);
      
      const { initializeGame } = useGameStore.getState();
      
      initializeGame(4, AIDifficulty.MEDIUM);
      
      const state = useGameStore.getState();
      
      expect(state.gameEngine).toBe(mockGameEngine);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(mockGameEngine.initializeGame).toHaveBeenCalledWith([
        {
          id: 'human-player',
          name: '玩家',
          type: PlayerType.HUMAN
        },
        {
          id: 'ai-player-1',
          name: 'AI玩家1',
          type: PlayerType.AI,
          aiDifficulty: AIDifficulty.MEDIUM
        },
        {
          id: 'ai-player-2',
          name: 'AI玩家2',
          type: PlayerType.AI,
          aiDifficulty: AIDifficulty.MEDIUM
        },
        {
          id: 'ai-player-3',
          name: 'AI玩家3',
          type: PlayerType.AI,
          aiDifficulty: AIDifficulty.MEDIUM
        }
      ]);
    });

    it('应该处理初始化错误', () => {
      // Mock GameEngine constructor to throw error
      vi.mocked(GameEngine).mockImplementation(() => {
        throw new Error('初始化失败');
      });
      
      const { initializeGame } = useGameStore.getState();
      
      initializeGame(4, AIDifficulty.MEDIUM);
      
      const state = useGameStore.getState();
      
      expect(state.gameEngine).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('初始化失败');
    });

    it('应该创建正确数量的玩家', () => {
      const mockGameEngine = {
        initializeGame: vi.fn()
      };
      
      vi.mocked(GameEngine).mockImplementation(() => mockGameEngine as any);
      
      const { initializeGame } = useGameStore.getState();
      
      // 测试2个玩家
      initializeGame(2, AIDifficulty.EASY);
      
      expect(mockGameEngine.initializeGame).toHaveBeenCalledWith([
        {
          id: 'human-player',
          name: '玩家',
          type: PlayerType.HUMAN
        },
        {
          id: 'ai-player-1',
          name: 'AI玩家1',
          type: PlayerType.AI,
          aiDifficulty: AIDifficulty.EASY
        }
      ]);
    });
  });

  describe('playCard', () => {
    it('应该成功出牌', () => {
      const mockGameEngine = {
        playCard: vi.fn().mockReturnValue(true)
      };
      
      useGameStore.setState({ gameEngine: mockGameEngine as any });
      
      const { playCard } = useGameStore.getState();
      const result = playCard('player1', 'card1');
      
      expect(result).toBe(true);
      expect(mockGameEngine.playCard).toHaveBeenCalledWith('player1', 'card1', undefined);
    });

    it('应该处理出牌错误', () => {
      const mockGameEngine = {
        playCard: vi.fn().mockImplementation(() => {
          throw new Error('出牌失败');
        })
      };
      
      useGameStore.setState({ gameEngine: mockGameEngine as any });
      
      const { playCard } = useGameStore.getState();
      const result = playCard('player1', 'card1');
      
      expect(result).toBe(false);
      expect(useGameStore.getState().error).toBe('出牌失败');
    });

    it('应该在没有游戏引擎时返回false', () => {
      useGameStore.setState({ gameEngine: null });
      
      const { playCard } = useGameStore.getState();
      const result = playCard('player1', 'card1');
      
      expect(result).toBe(false);
    });
  });

  describe('drawCard', () => {
    it('应该成功抽牌', () => {
      const mockGameEngine = {
        drawCard: vi.fn().mockReturnValue(true)
      };
      
      useGameStore.setState({ gameEngine: mockGameEngine as any });
      
      const { drawCard } = useGameStore.getState();
      const result = drawCard('player1');
      
      expect(result).toBe(true);
      expect(mockGameEngine.drawCard).toHaveBeenCalledWith('player1');
    });

    it('应该处理抽牌错误', () => {
      const mockGameEngine = {
        drawCard: vi.fn().mockImplementation(() => {
          throw new Error('摸牌失败');
        })
      };
      
      useGameStore.setState({ gameEngine: mockGameEngine as any });
      
      const { drawCard } = useGameStore.getState();
      const result = drawCard('player1');
      
      expect(result).toBe(false);
      expect(useGameStore.getState().error).toBe('摸牌失败');
    });
  });

  describe('callUno', () => {
    it('应该成功调用UNO', () => {
      const mockGameEngine = {
        callUno: vi.fn()
      };
      
      useGameStore.setState({ gameEngine: mockGameEngine as any });
      
      const { callUno } = useGameStore.getState();
      callUno('player1');
      
      expect(mockGameEngine.callUno).toHaveBeenCalledWith('player1');
    });

    it('应该处理UNO调用错误', () => {
      const mockGameEngine = {
        callUno: vi.fn().mockImplementation(() => {
          throw new Error('UNO调用失败');
        })
      };
      
      useGameStore.setState({ gameEngine: mockGameEngine as any });
      
      const { callUno } = useGameStore.getState();
      callUno('player1');
      
      expect(useGameStore.getState().error).toBe('UNO调用失败');
    });
  });

  describe('getCurrentPlayer', () => {
    it('应该返回当前玩家', () => {
      const mockPlayer = { id: 'player1', name: '玩家1' };
      const mockGameEngine = {
        getCurrentPlayer: vi.fn().mockReturnValue(mockPlayer)
      };
      
      useGameStore.setState({ gameEngine: mockGameEngine as any });
      
      const { getCurrentPlayer } = useGameStore.getState();
      const result = getCurrentPlayer();
      
      expect(result).toBe(mockPlayer);
      expect(mockGameEngine.getCurrentPlayer).toHaveBeenCalled();
    });

    it('应该在没有游戏引擎时返回null', () => {
      useGameStore.setState({ gameEngine: null });
      
      const { getCurrentPlayer } = useGameStore.getState();
      const result = getCurrentPlayer();
      
      expect(result).toBeNull();
    });
  });

  describe('getGameState', () => {
    it('应该返回游戏状态', () => {
      const mockGameState = { phase: 'playing', players: [] };
      const mockGameEngine = {
        getGameState: vi.fn().mockReturnValue(mockGameState)
      };
      
      useGameStore.setState({ gameEngine: mockGameEngine as any });
      
      const { getGameState } = useGameStore.getState();
      const result = getGameState();
      
      expect(result).toBe(mockGameState);
      expect(mockGameEngine.getGameState).toHaveBeenCalled();
    });

    it('应该在没有游戏引擎时返回null', () => {
      useGameStore.setState({ gameEngine: null });
      
      const { getGameState } = useGameStore.getState();
      const result = getGameState();
      
      expect(result).toBeNull();
    });
  });

  describe('resetGame', () => {
    it('应该重置游戏状态', () => {
      useGameStore.setState({
        gameEngine: {} as any,
        isLoading: true,
        error: '某个错误'
      });
      
      const { resetGame } = useGameStore.getState();
      resetGame();
      
      const state = useGameStore.getState();
      
      expect(state.gameEngine).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('错误和加载状态管理', () => {
    it('应该设置错误状态', () => {
      const { setError } = useGameStore.getState();
      
      setError('测试错误');
      
      expect(useGameStore.getState().error).toBe('测试错误');
    });

    it('应该清除错误状态', () => {
      useGameStore.setState({ error: '某个错误' });
      
      const { setError } = useGameStore.getState();
      setError(null);
      
      expect(useGameStore.getState().error).toBeNull();
    });

    it('应该设置加载状态', () => {
      const { setLoading } = useGameStore.getState();
      
      setLoading(true);
      
      expect(useGameStore.getState().isLoading).toBe(true);
    });
  });
}); 