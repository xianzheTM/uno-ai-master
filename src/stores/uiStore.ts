import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Card as CardType } from '@/types';

export interface UIState {
  // 主题设置
  theme: 'light' | 'dark';
  
  // 音效设置
  soundEnabled: boolean;
  musicEnabled: boolean;
  volume: number;
  
  // 动画设置
  animationsEnabled: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
  
  // 界面状态
  currentScreen: 'menu' | 'game' | 'settings' | 'about';
  isFullscreen: boolean;
  showDebugInfo: boolean;
  
  // 游戏界面状态
  showPlayerNames: boolean;
  showCardCount: boolean;
  showGameLog: boolean;
  gameLogMessages: string[];
  
  // 游戏交互状态
  selectedCard: CardType | null;
  showColorPicker: boolean;
  showGameMenu: boolean;
  
  // 模态框状态
  showPauseModal: boolean;
  showSettingsModal: boolean;
  showHelpModal: boolean;
  showQuitConfirmModal: boolean;
  
  // 通知状态
  notifications: Notification[];
  
  // 加载状态
  isLoading: boolean;
  loadingMessage: string;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number;
  timestamp: number;
}

interface UIStore extends UIState {
  // 主题方法
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  
  // 音效方法
  setSoundEnabled: (enabled: boolean) => void;
  setMusicEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
  
  // 动画方法
  setAnimationsEnabled: (enabled: boolean) => void;
  setAnimationSpeed: (speed: 'slow' | 'normal' | 'fast') => void;
  
  // 界面导航方法
  setCurrentScreen: (screen: 'menu' | 'game' | 'settings' | 'about') => void;
  setFullscreen: (fullscreen: boolean) => void;
  toggleFullscreen: () => void;
  setShowDebugInfo: (show: boolean) => void;
  
  // 游戏界面方法
  setShowPlayerNames: (show: boolean) => void;
  setShowCardCount: (show: boolean) => void;
  setShowGameLog: (show: boolean) => void;
  addGameLogMessage: (message: string) => void;
  clearGameLog: () => void;
  
  // 游戏交互方法
  setSelectedCard: (card: CardType | null) => void;
  setShowColorPicker: (show: boolean) => void;
  setShowGameMenu: (show: boolean) => void;
  
  // 模态框方法
  setShowPauseModal: (show: boolean) => void;
  setShowSettingsModal: (show: boolean) => void;
  setShowHelpModal: (show: boolean) => void;
  setShowQuitConfirmModal: (show: boolean) => void;
  closeAllModals: () => void;
  
  // 通知方法
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // 加载状态方法
  setLoading: (loading: boolean, message?: string) => void;
  
  // 重置方法
  resetUI: () => void;
}

const initialState: UIState = {
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
  loadingMessage: '',
};

export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setTheme: (theme) => {
          set({ theme });
          // 应用主题到document
          document.documentElement.setAttribute('data-theme', theme);
        },

        toggleTheme: () => {
          const currentTheme = get().theme;
          const newTheme = currentTheme === 'light' ? 'dark' : 'light';
          get().setTheme(newTheme);
        },

        setSoundEnabled: (enabled) => {
          set({ soundEnabled: enabled });
        },

        setMusicEnabled: (enabled) => {
          set({ musicEnabled: enabled });
        },

        setVolume: (volume) => {
          set({ volume: Math.max(0, Math.min(1, volume)) });
        },

        setAnimationsEnabled: (enabled) => {
          set({ animationsEnabled: enabled });
        },

        setAnimationSpeed: (speed) => {
          set({ animationSpeed: speed });
        },

        setCurrentScreen: (screen) => {
          set({ currentScreen: screen });
        },

        setFullscreen: (fullscreen) => {
          set({ isFullscreen: fullscreen });
          
          if (fullscreen) {
            document.documentElement.requestFullscreen?.();
          } else {
            document.exitFullscreen?.();
          }
        },

        toggleFullscreen: () => {
          const isFullscreen = get().isFullscreen;
          get().setFullscreen(!isFullscreen);
        },

        setShowDebugInfo: (show) => {
          set({ showDebugInfo: show });
        },

        setShowPlayerNames: (show) => {
          set({ showPlayerNames: show });
        },

        setShowCardCount: (show) => {
          set({ showCardCount: show });
        },

        setShowGameLog: (show) => {
          set({ showGameLog: show });
        },

        addGameLogMessage: (message) => {
          const timestamp = new Date().toLocaleTimeString();
          const formattedMessage = `[${timestamp}] ${message}`;
          
          set((state) => ({
            gameLogMessages: [...state.gameLogMessages, formattedMessage].slice(-50), // 保留最近50条消息
          }));
        },

        clearGameLog: () => {
          set({ gameLogMessages: [] });
        },

        setSelectedCard: (card) => {
          set({ selectedCard: card });
        },

        setShowColorPicker: (show) => {
          set({ showColorPicker: show });
        },

        setShowGameMenu: (show) => {
          set({ showGameMenu: show });
        },

        setShowPauseModal: (show) => {
          set({ showPauseModal: show });
        },

        setShowSettingsModal: (show) => {
          set({ showSettingsModal: show });
        },

        setShowHelpModal: (show) => {
          set({ showHelpModal: show });
        },

        setShowQuitConfirmModal: (show) => {
          set({ showQuitConfirmModal: show });
        },

        closeAllModals: () => {
          set({
            showPauseModal: false,
            showSettingsModal: false,
            showHelpModal: false,
            showQuitConfirmModal: false,
          });
        },

        addNotification: (notification) => {
          const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const timestamp = Date.now();
          
          const newNotification: Notification = {
            ...notification,
            id,
            timestamp,
            duration: notification.duration || 5000,
          };
          
          set((state) => ({
            notifications: [...state.notifications, newNotification],
          }));
          
          // 自动移除通知
          if (newNotification.duration && newNotification.duration > 0) {
            setTimeout(() => {
              get().removeNotification(id);
            }, newNotification.duration);
          }
        },

        removeNotification: (id) => {
          set((state) => ({
            notifications: state.notifications.filter(n => n.id !== id),
          }));
        },

        clearNotifications: () => {
          set({ notifications: [] });
        },

        setLoading: (loading, message = '') => {
          set({
            isLoading: loading,
            loadingMessage: message,
          });
        },

        resetUI: () => {
          set(initialState);
        },
      }),
      {
        name: 'uno-ui-store',
        partialize: (state) => ({
          // 只持久化用户偏好设置
          theme: state.theme,
          soundEnabled: state.soundEnabled,
          musicEnabled: state.musicEnabled,
          volume: state.volume,
          animationsEnabled: state.animationsEnabled,
          animationSpeed: state.animationSpeed,
          showPlayerNames: state.showPlayerNames,
          showCardCount: state.showCardCount,
        }),
      }
    )
  )
); 