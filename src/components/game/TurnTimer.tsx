import React, { useState, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { playGameSound, GameSoundType } from '@/utils/soundManager';

interface TurnTimerProps {
  isActive: boolean;
  timeLimit: number; // 时间限制（秒）
  onTimeout: () => void; // 超时回调
  soundEnabled?: boolean;
  className?: string;
}

/**
 * 回合倒计时组件
 * 显示当前玩家的剩余时间，并在超时时触发回调
 */
export const TurnTimer: React.FC<TurnTimerProps> = ({
  isActive,
  timeLimit,
  onTimeout,
  soundEnabled = true,
  className,
}) => {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isWarning, setIsWarning] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const hasPlayedWarning = useRef(false);
  const hasPlayedUrgent = useRef(false);
  const hasTriggeredTimeout = useRef(false);
  const onTimeoutRef = useRef(onTimeout);

  // 更新onTimeout引用
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  // 重置计时器
  const resetTimer = () => {
    setTimeLeft(timeLimit);
    setIsWarning(false);
    hasPlayedWarning.current = false;
    hasPlayedUrgent.current = false;
    hasTriggeredTimeout.current = false;
    
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // 启动计时器
  const startTimer = () => {
    resetTimer();
    
    intervalRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        
        // 播放警告音效
        if (soundEnabled) {
          if (newTime === 10 && !hasPlayedWarning.current) {
            playGameSound(GameSoundType.CLOCK_BELL);
            hasPlayedWarning.current = true;
          } else if (newTime === 5 && !hasPlayedUrgent.current) {
            playGameSound(GameSoundType.BUTTON_NEGATIVE);
            hasPlayedUrgent.current = true;
          }
        }
        
        // 设置警告状态
        if (newTime <= 10) {
          setIsWarning(true);
        }
        
        // 检查超时
        if (newTime <= 0 && !hasTriggeredTimeout.current) {
          hasTriggeredTimeout.current = true;
          // 立即清理计时器
          if (intervalRef.current) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          // 使用setTimeout确保回调在下一个事件循环中执行，避免状态冲突
          setTimeout(() => {
            onTimeoutRef.current();
          }, 0);
          return 0;
        }
        
        return newTime;
      });
    }, 1000);
  };

  // 当isActive状态变化时，启动或停止计时器
  useEffect(() => {
    if (isActive) {
      startTimer();
    } else {
      resetTimer();
    }
    
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLimit]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);

  if (!isActive) {
    return null;
  }

  // 计算显示的时间格式
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeDisplay = minutes > 0 
    ? `${minutes}:${seconds.toString().padStart(2, '0')}`
    : seconds.toString();

  // 根据剩余时间确定样式
  const getTimerStyle = () => {
    if (timeLeft <= 5) {
      return 'bg-red-500 text-white animate-pulse border-red-600';
    } else if (timeLeft <= 10) {
      return 'bg-orange-500 text-white border-orange-600';
    } else if (timeLeft <= 20) {
      return 'bg-yellow-500 text-gray-900 border-yellow-600';
    } else {
      return 'bg-green-500 text-white border-green-600';
    }
  };

  return (
    <div className={clsx('turn-timer', className)}>
      <div className={clsx(
        'inline-flex items-center justify-center',
        'px-4 py-2 rounded-lg border-2 shadow-md',
        'font-bold text-lg min-w-[80px]',
        'transition-all duration-200',
        getTimerStyle(),
        {
          'animate-bounce': timeLeft <= 5,
          'scale-110': timeLeft <= 10,
        }
      )}>
        <div className="flex items-center gap-2">
          <span className="text-xl">⏰</span>
          <span className="font-mono">{timeDisplay}</span>
        </div>
      </div>
      
      {/* 警告提示 */}
      {isWarning && (
        <div className="mt-2 text-center">
          <div className={clsx(
            'text-sm font-medium',
            timeLeft <= 5 ? 'text-red-600 animate-pulse' : 'text-orange-600'
          )}>
            {timeLeft <= 5 ? '⚠️ 即将超时！' : '⚠️ 请尽快出牌'}
          </div>
        </div>
      )}
    </div>
  );
}; 