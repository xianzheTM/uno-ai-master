import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useUIStore } from '../uiStore';

// Mock DOM APIs
const mockDocument = {
  documentElement: {
    setAttribute: vi.fn(),
    requestFullscreen: vi.fn()
  },
  exitFullscreen: vi.fn()
};

// @ts-ignore
global.document = mockDocument;

describe('uiStore', () => {
  beforeEach(() => {
    // 重置store到初始状态
    useUIStore.getState().resetUI();
    vi.clearAllMocks();
  });

  describe('初始状态', () => {
    it('应该有正确的初始状态', () => {
      const state = useUIStore.getState();
      
      expect(state.theme).toBe('light');
      expect(state.soundEnabled).toBe(true);
      expect(state.musicEnabled).toBe(true);
      expect(state.volume).toBe(0.7);
      expect(state.animationsEnabled).toBe(true);
      expect(state.animationSpeed).toBe('normal');
      expect(state.currentScreen).toBe('menu');
      expect(state.isFullscreen).toBe(false);
      expect(state.showDebugInfo).toBe(false);
      expect(state.showPlayerNames).toBe(true);
      expect(state.showCardCount).toBe(true);
      expect(state.showGameLog).toBe(false);
      expect(state.gameLogMessages).toEqual([]);
      expect(state.showPauseModal).toBe(false);
      expect(state.showSettingsModal).toBe(false);
      expect(state.showHelpModal).toBe(false);
      expect(state.showQuitConfirmModal).toBe(false);
      expect(state.notifications).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.loadingMessage).toBe('');
    });
  });

  describe('主题管理', () => {
    it('应该设置主题', () => {
      const { setTheme } = useUIStore.getState();
      
      setTheme('dark');
      
      expect(useUIStore.getState().theme).toBe('dark');
      expect(mockDocument.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    });

    it('应该切换主题', () => {
      const { toggleTheme } = useUIStore.getState();
      
      // 初始是light，切换到dark
      toggleTheme();
      expect(useUIStore.getState().theme).toBe('dark');
      
      // 再次切换回light
      toggleTheme();
      expect(useUIStore.getState().theme).toBe('light');
    });
  });

  describe('音效设置', () => {
    it('应该设置音效开关', () => {
      const { setSoundEnabled } = useUIStore.getState();
      
      setSoundEnabled(false);
      
      expect(useUIStore.getState().soundEnabled).toBe(false);
    });

    it('应该设置音乐开关', () => {
      const { setMusicEnabled } = useUIStore.getState();
      
      setMusicEnabled(false);
      
      expect(useUIStore.getState().musicEnabled).toBe(false);
    });

    it('应该设置音量', () => {
      const { setVolume } = useUIStore.getState();
      
      setVolume(0.5);
      
      expect(useUIStore.getState().volume).toBe(0.5);
    });

    it('应该限制音量范围在0-1之间', () => {
      const { setVolume } = useUIStore.getState();
      
      // 测试超出上限
      setVolume(1.5);
      expect(useUIStore.getState().volume).toBe(1);
      
      // 测试超出下限
      setVolume(-0.5);
      expect(useUIStore.getState().volume).toBe(0);
    });
  });

  describe('动画设置', () => {
    it('应该设置动画开关', () => {
      const { setAnimationsEnabled } = useUIStore.getState();
      
      setAnimationsEnabled(false);
      
      expect(useUIStore.getState().animationsEnabled).toBe(false);
    });

    it('应该设置动画速度', () => {
      const { setAnimationSpeed } = useUIStore.getState();
      
      setAnimationSpeed('fast');
      
      expect(useUIStore.getState().animationSpeed).toBe('fast');
    });
  });

  describe('界面导航', () => {
    it('应该设置当前屏幕', () => {
      const { setCurrentScreen } = useUIStore.getState();
      
      setCurrentScreen('game');
      
      expect(useUIStore.getState().currentScreen).toBe('game');
    });

    it('应该设置全屏状态', () => {
      const { setFullscreen } = useUIStore.getState();
      
      setFullscreen(true);
      
      expect(useUIStore.getState().isFullscreen).toBe(true);
      expect(mockDocument.documentElement.requestFullscreen).toHaveBeenCalled();
    });

    it('应该退出全屏', () => {
      const { setFullscreen } = useUIStore.getState();
      
      // 先设置为全屏
      useUIStore.setState({ isFullscreen: true });
      
      setFullscreen(false);
      
      expect(useUIStore.getState().isFullscreen).toBe(false);
      expect(mockDocument.exitFullscreen).toHaveBeenCalled();
    });

    it('应该切换全屏状态', () => {
      const { toggleFullscreen } = useUIStore.getState();
      
      // 初始为false，切换到true
      toggleFullscreen();
      expect(useUIStore.getState().isFullscreen).toBe(true);
      
      // 再次切换回false
      toggleFullscreen();
      expect(useUIStore.getState().isFullscreen).toBe(false);
    });

    it('应该设置调试信息显示', () => {
      const { setShowDebugInfo } = useUIStore.getState();
      
      setShowDebugInfo(true);
      
      expect(useUIStore.getState().showDebugInfo).toBe(true);
    });
  });

  describe('游戏界面设置', () => {
    it('应该设置玩家名称显示', () => {
      const { setShowPlayerNames } = useUIStore.getState();
      
      setShowPlayerNames(false);
      
      expect(useUIStore.getState().showPlayerNames).toBe(false);
    });

    it('应该设置卡牌数量显示', () => {
      const { setShowCardCount } = useUIStore.getState();
      
      setShowCardCount(false);
      
      expect(useUIStore.getState().showCardCount).toBe(false);
    });

    it('应该设置游戏日志显示', () => {
      const { setShowGameLog } = useUIStore.getState();
      
      setShowGameLog(true);
      
      expect(useUIStore.getState().showGameLog).toBe(true);
    });

    it('应该添加游戏日志消息', () => {
      const { addGameLogMessage } = useUIStore.getState();
      
      addGameLogMessage('测试消息');
      
      const messages = useUIStore.getState().gameLogMessages;
      expect(messages).toHaveLength(1);
      expect(messages[0]).toContain('测试消息');
      expect(messages[0]).toMatch(/^\[\d{1,2}:\d{2}:\d{2}\] 测试消息$/);
    });

    it('应该限制游戏日志消息数量', () => {
      const { addGameLogMessage } = useUIStore.getState();
      
      // 添加超过50条消息
      for (let i = 0; i < 55; i++) {
        addGameLogMessage(`消息 ${i}`);
      }
      
      const messages = useUIStore.getState().gameLogMessages;
      expect(messages).toHaveLength(50);
      expect(messages[0]).toContain('消息 5'); // 最早的5条被删除
      expect(messages[49]).toContain('消息 54');
    });

    it('应该清空游戏日志', () => {
      const { addGameLogMessage, clearGameLog } = useUIStore.getState();
      
      addGameLogMessage('测试消息');
      expect(useUIStore.getState().gameLogMessages).toHaveLength(1);
      
      clearGameLog();
      expect(useUIStore.getState().gameLogMessages).toHaveLength(0);
    });
  });

  describe('模态框管理', () => {
    it('应该设置暂停模态框显示', () => {
      const { setShowPauseModal } = useUIStore.getState();
      
      setShowPauseModal(true);
      
      expect(useUIStore.getState().showPauseModal).toBe(true);
    });

    it('应该设置设置模态框显示', () => {
      const { setShowSettingsModal } = useUIStore.getState();
      
      setShowSettingsModal(true);
      
      expect(useUIStore.getState().showSettingsModal).toBe(true);
    });

    it('应该设置帮助模态框显示', () => {
      const { setShowHelpModal } = useUIStore.getState();
      
      setShowHelpModal(true);
      
      expect(useUIStore.getState().showHelpModal).toBe(true);
    });

    it('应该设置退出确认模态框显示', () => {
      const { setShowQuitConfirmModal } = useUIStore.getState();
      
      setShowQuitConfirmModal(true);
      
      expect(useUIStore.getState().showQuitConfirmModal).toBe(true);
    });

    it('应该关闭所有模态框', () => {
      const { 
        setShowPauseModal, 
        setShowSettingsModal, 
        setShowHelpModal, 
        setShowQuitConfirmModal,
        closeAllModals 
      } = useUIStore.getState();
      
      // 打开所有模态框
      setShowPauseModal(true);
      setShowSettingsModal(true);
      setShowHelpModal(true);
      setShowQuitConfirmModal(true);
      
      // 关闭所有模态框
      closeAllModals();
      
      const state = useUIStore.getState();
      expect(state.showPauseModal).toBe(false);
      expect(state.showSettingsModal).toBe(false);
      expect(state.showHelpModal).toBe(false);
      expect(state.showQuitConfirmModal).toBe(false);
    });
  });

  describe('通知管理', () => {
    it('应该添加通知', () => {
      const { addNotification } = useUIStore.getState();
      
      addNotification({
        type: 'info',
        title: '测试标题',
        message: '测试消息'
      });
      
      const notifications = useUIStore.getState().notifications;
      expect(notifications).toHaveLength(1);
      expect(notifications[0]).toMatchObject({
        type: 'info',
        title: '测试标题',
        message: '测试消息'
      });
      expect(notifications[0].id).toBeDefined();
      expect(notifications[0].timestamp).toBeDefined();
    });

    it('应该移除指定通知', () => {
      const { addNotification, removeNotification } = useUIStore.getState();
      
      addNotification({
        type: 'info',
        title: '测试标题',
        message: '测试消息'
      });
      
      const notificationId = useUIStore.getState().notifications[0].id;
      
      removeNotification(notificationId);
      
      expect(useUIStore.getState().notifications).toHaveLength(0);
    });

    it('应该清空所有通知', () => {
      const { addNotification, clearNotifications } = useUIStore.getState();
      
      addNotification({
        type: 'info',
        title: '测试1',
        message: '消息1'
      });
      
      addNotification({
        type: 'error',
        title: '测试2',
        message: '消息2'
      });
      
      expect(useUIStore.getState().notifications).toHaveLength(2);
      
      clearNotifications();
      
      expect(useUIStore.getState().notifications).toHaveLength(0);
    });

    it('应该为通知生成唯一ID', () => {
      const { addNotification } = useUIStore.getState();
      
      addNotification({
        type: 'info',
        title: '测试1',
        message: '消息1'
      });
      
      addNotification({
        type: 'info',
        title: '测试2',
        message: '消息2'
      });
      
      const notifications = useUIStore.getState().notifications;
      expect(notifications[0].id).not.toBe(notifications[1].id);
    });
  });

  describe('加载状态管理', () => {
    it('应该设置加载状态', () => {
      const { setLoading } = useUIStore.getState();
      
      setLoading(true, '正在加载...');
      
      const state = useUIStore.getState();
      expect(state.isLoading).toBe(true);
      expect(state.loadingMessage).toBe('正在加载...');
    });

    it('应该设置加载状态不带消息', () => {
      const { setLoading } = useUIStore.getState();
      
      setLoading(true);
      
      const state = useUIStore.getState();
      expect(state.isLoading).toBe(true);
      expect(state.loadingMessage).toBe('');
    });

    it('应该清除加载状态', () => {
      const { setLoading } = useUIStore.getState();
      
      // 先设置加载状态
      setLoading(true, '加载中...');
      
      // 清除加载状态
      setLoading(false);
      
      const state = useUIStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.loadingMessage).toBe('');
    });
  });

  describe('重置功能', () => {
    it('应该重置UI状态到初始值', () => {
      const { 
        setTheme, 
        setSoundEnabled, 
        setCurrentScreen, 
        addNotification,
        addGameLogMessage,
        setLoading,
        resetUI 
      } = useUIStore.getState();
      
      // 修改一些状态
      setTheme('dark');
      setSoundEnabled(false);
      setCurrentScreen('game');
      addNotification({
        type: 'info',
        title: '测试',
        message: '测试消息'
      });
      addGameLogMessage('测试日志');
      setLoading(true, '加载中...');
      
      // 重置
      resetUI();
      
      // 验证状态已重置
      const state = useUIStore.getState();
      expect(state.theme).toBe('light');
      expect(state.soundEnabled).toBe(true);
      expect(state.currentScreen).toBe('menu');
      expect(state.notifications).toHaveLength(0);
      expect(state.gameLogMessages).toHaveLength(0);
      expect(state.isLoading).toBe(false);
      expect(state.loadingMessage).toBe('');
    });
  });
}); 