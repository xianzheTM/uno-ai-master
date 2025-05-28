import React, { useState } from 'react';
import { clsx } from 'clsx';
import { Button } from '../ui/Button';
import { CardColor } from '@/types';

interface ColorPickerProps {
  isOpen: boolean;
  onColorSelect: (color: CardColor) => void;
  onCancel?: () => void;
  selectedColor?: CardColor;
  title?: string;
  description?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

/**
 * 颜色选择器组件
 * 用于万能卡的颜色选择
 */
export const ColorPicker: React.FC<ColorPickerProps> = ({
  isOpen,
  onColorSelect,
  onCancel,
  selectedColor,
  title = '选择颜色',
  description = '请选择万能卡的新颜色',
  size = 'medium',
  className,
}) => {
  const [hoveredColor, setHoveredColor] = useState<CardColor | null>(null);

  // 可选择的颜色
  const colors: Array<{
    value: CardColor;
    name: string;
    bgClass: string;
    hoverClass: string;
    textClass: string;
  }> = [
    {
      value: CardColor.RED,
      name: '红色',
      bgClass: 'bg-red-500',
      hoverClass: 'hover:bg-red-600',
      textClass: 'text-red-700',
    },
    {
      value: CardColor.BLUE,
      name: '蓝色',
      bgClass: 'bg-blue-500',
      hoverClass: 'hover:bg-blue-600',
      textClass: 'text-blue-700',
    },
    {
      value: CardColor.GREEN,
      name: '绿色',
      bgClass: 'bg-green-500',
      hoverClass: 'hover:bg-green-600',
      textClass: 'text-green-700',
    },
    {
      value: CardColor.YELLOW,
      name: '黄色',
      bgClass: 'bg-yellow-500',
      hoverClass: 'hover:bg-yellow-600',
      textClass: 'text-yellow-700',
    },
  ];

  // 尺寸配置
  const sizeConfig = {
    small: {
      colorButton: 'w-12 h-12',
      container: 'p-4',
      title: 'text-lg',
      description: 'text-sm',
    },
    medium: {
      colorButton: 'w-16 h-16',
      container: 'p-6',
      title: 'text-xl',
      description: 'text-base',
    },
    large: {
      colorButton: 'w-20 h-20',
      container: 'p-8',
      title: 'text-2xl',
      description: 'text-lg',
    },
  };

  const config = sizeConfig[size];

  // 处理颜色选择
  const handleColorSelect = (color: CardColor) => {
    onColorSelect(color);
  };

  // 处理键盘导航
  const handleKeyDown = (event: React.KeyboardEvent, color: CardColor) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleColorSelect(color);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* 颜色选择器内容 */}
      <div
        className={clsx(
          'relative bg-white rounded-lg shadow-xl max-w-md w-full transform transition-all',
          config.container,
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="color-picker-title"
        aria-describedby="color-picker-description"
      >
        {/* 标题 */}
        <div className="text-center mb-6">
          <h2
            id="color-picker-title"
            className={clsx('font-bold text-gray-800 mb-2', config.title)}
          >
            {title}
          </h2>
          <p
            id="color-picker-description"
            className={clsx('text-gray-600', config.description)}
          >
            {description}
          </p>
        </div>

        {/* 颜色选项 */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {colors.map((color) => {
            const isSelected = selectedColor === color.value;
            const isHovered = hoveredColor === color.value;

            return (
              <button
                key={color.value}
                className={clsx(
                  'relative rounded-lg border-4 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-50',
                  config.colorButton,
                  color.bgClass,
                  color.hoverClass,
                  {
                    'border-white ring-4 ring-gray-400 ring-opacity-50': isSelected,
                    'border-gray-300': !isSelected,
                    'transform scale-110': isHovered,
                    'shadow-lg': isSelected || isHovered,
                  }
                )}
                onClick={() => handleColorSelect(color.value)}
                onKeyDown={(e) => handleKeyDown(e, color.value)}
                onMouseEnter={() => setHoveredColor(color.value)}
                onMouseLeave={() => setHoveredColor(null)}
                aria-label={`选择${color.name}`}
              >
                {/* 选中指示器 */}
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-gray-800"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3 pt-4">
          {selectedColor && (
            <Button
              variant="primary"
              onClick={() => handleColorSelect(selectedColor)}
              className="flex-1"
            >
              确认选择
            </Button>
          )}
          {onCancel && (
            <Button
              variant="secondary"
              onClick={onCancel}
              className={selectedColor ? 'flex-shrink-0' : 'flex-1'}
            >
              取消
            </Button>
          )}
        </div>

        {/* 快捷键提示 */}
        <div className="mt-4 text-center">
          <span className="text-xs text-gray-500">
            点击颜色选择，按 ESC 取消
          </span>
        </div>
      </div>
    </div>
  );
}; 