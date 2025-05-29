import { describe, it, expect, vi } from 'vitest';
import { useGameStore, useUIStore } from '../index';
import type { UIState, Notification } from '../index';

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

// Mock DOM APIs for UI store
const mockDocument = {
  documentElement: {
    setAttribute: vi.fn(),
    requestFullscreen: vi.fn()
  },
  exitFullscreen: vi.fn()
};

// @ts-ignore
global.document = mockDocument;

describe('stores/index', () => {
  describe('导出功能', () => {
    it('应该导出useGameStore', () => {
      expect(useGameStore).toBeDefined();
      expect(typeof useGameStore).toBe('function');
    });

    it('应该导出useUIStore', () => {
      expect(useUIStore).toBeDefined();
      expect(typeof useUIStore).toBe('function');
    });

    it('应该导出UIState类型', () => {
      // 类型测试 - 确保UIState类型可用
      const testUIState: UIState = {
        theme: 'light',
        soundEnabled: true,
        musicEnabled: true,
        volume: 0.7,
        animationsEnabled: true,
        animationSpeed: 'normal',
        currentScreen: 'menu',
        isFullscreen: false,
        showDebugInfo: false,
        showPlayerNames: true,
        showCardCount: true,
        showGameLog: false,
        gameLogMessages: [],
        selectedCard: null,
        showColorPicker: false,
        showGameMenu: false,
        showPauseModal: false,
        showSettingsModal: false,
        showHelpModal: false,
        showQuitConfirmModal: false,
        notifications: [],
        isLoading: false,
        loadingMessage: ''
      };

      expect(testUIState).toBeDefined();
    });

    it('应该导出Notification类型', () => {
      // 类型测试 - 确保Notification类型可用
      const testNotification: Notification = {
        id: 'test-id',
        type: 'info',
        title: '测试标题',
        message: '测试消息',
        timestamp: Date.now()
      };

      expect(testNotification).toBeDefined();
    });
  });

  describe('store实例功能', () => {
    it('useGameStore应该返回有效的store', () => {
      const gameStore = useGameStore.getState();
      
      expect(gameStore).toBeDefined();
      expect(gameStore.gameEngine).toBeDefined();
      expect(gameStore.isLoading).toBeDefined();
      expect(gameStore.error).toBeDefined();
      expect(typeof gameStore.initializeGame).toBe('function');
      expect(typeof gameStore.playCard).toBe('function');
      expect(typeof gameStore.drawCard).toBe('function');
      expect(typeof gameStore.callUno).toBe('function');
      expect(typeof gameStore.resetGame).toBe('function');
      expect(typeof gameStore.getCurrentPlayer).toBe('function');
      expect(typeof gameStore.getGameState).toBe('function');
      expect(typeof gameStore.setError).toBe('function');
      expect(typeof gameStore.setLoading).toBe('function');
    });

    it('useUIStore应该返回有效的store', () => {
      const uiStore = useUIStore.getState();
      
      expect(uiStore).toBeDefined();
      expect(uiStore.theme).toBeDefined();
      expect(uiStore.soundEnabled).toBeDefined();
      expect(uiStore.currentScreen).toBeDefined();
      expect(typeof uiStore.setTheme).toBe('function');
      expect(typeof uiStore.toggleTheme).toBe('function');
      expect(typeof uiStore.setSoundEnabled).toBe('function');
      expect(typeof uiStore.setCurrentScreen).toBe('function');
      expect(typeof uiStore.addNotification).toBe('function');
      expect(typeof uiStore.resetUI).toBe('function');
    });
  });

  describe('store集成', () => {
    it('两个store应该独立工作', () => {
      const gameStore = useGameStore.getState();
      const uiStore = useUIStore.getState();
      
      // 修改游戏store
      gameStore.setError('游戏错误');
      gameStore.setLoading(true);
      
      // 修改UI store
      uiStore.setTheme('dark');
      uiStore.setSoundEnabled(false);
      
      // 验证修改互不影响
      expect(useGameStore.getState().error).toBe('游戏错误');
      expect(useGameStore.getState().isLoading).toBe(true);
      expect(useUIStore.getState().theme).toBe('dark');
      expect(useUIStore.getState().soundEnabled).toBe(false);
      
      // 重置一个store不应该影响另一个
      gameStore.resetGame();
      
      expect(useGameStore.getState().error).toBeNull();
      expect(useGameStore.getState().isLoading).toBe(false);
      expect(useUIStore.getState().theme).toBe('dark'); // UI store不受影响
      expect(useUIStore.getState().soundEnabled).toBe(false); // UI store不受影响
    });
  });
}); 