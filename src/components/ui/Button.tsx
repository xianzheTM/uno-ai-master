import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

/**
 * 通用按钮组件
 * 支持多种样式变体、尺寸和状态
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  className,
  disabled,
  ...props
}) => {
  // 变体样式
  const variantClasses = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500 hover:border-blue-600',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white border-gray-500 hover:border-gray-600',
    success: 'bg-green-500 hover:bg-green-600 text-white border-green-500 hover:border-green-600',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500 hover:border-yellow-600',
    danger: 'bg-red-500 hover:bg-red-600 text-white border-red-500 hover:border-red-600',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border-gray-300 hover:border-gray-400',
  };

  // 尺寸样式
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
  };

  // 加载动画组件
  const LoadingSpinner = () => (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  const isDisabled = disabled || isLoading;

  return (
    <button
      className={clsx(
        // 基础样式
        'inline-flex items-center justify-center font-medium rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
        // 变体样式
        variantClasses[variant],
        // 尺寸样式
        sizeClasses[size],
        // 状态样式
        {
          'opacity-50 cursor-not-allowed': isDisabled,
          'w-full': fullWidth,
          'hover:scale-105 active:scale-95': !isDisabled,
        },
        className
      )}
      disabled={isDisabled}
      {...props}
    >
      {/* 左侧图标或加载动画 */}
      {isLoading ? (
        <LoadingSpinner />
      ) : leftIcon ? (
        <span className={clsx('flex items-center', children && 'mr-2')}>
          {leftIcon}
        </span>
      ) : null}

      {/* 按钮文本 */}
      {children && (
        <span className={clsx(isLoading && 'ml-2')}>
          {children}
        </span>
      )}

      {/* 右侧图标 */}
      {rightIcon && !isLoading && (
        <span className={clsx('flex items-center', children && 'ml-2')}>
          {rightIcon}
        </span>
      )}
    </button>
  );
}; 