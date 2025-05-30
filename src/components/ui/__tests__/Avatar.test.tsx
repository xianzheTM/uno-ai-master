import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Avatar } from '../Avatar';

describe('Avatar', () => {
  describe('基础功能', () => {
    it('应该显示名字的首字母', () => {
      render(<Avatar name="John Doe" />);
      
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('应该显示中文名字的首字母', () => {
      render(<Avatar name="张 三" />);
      
      expect(screen.getByText('张三')).toBeInTheDocument();
    });
  });

  describe('player prop 功能', () => {
    it('应该从player对象中获取name和isAI', () => {
      const player = { name: 'AI玩家', isAI: true };
      render(<Avatar player={player} />);
      
      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('🤖')).toBeInTheDocument();
    });

    it('应该为人类玩家显示正确样式', () => {
      const player = { name: '人类玩家', isAI: false };
      render(<Avatar player={player} />);
      
      expect(screen.getByText('人')).toBeInTheDocument();
      expect(screen.queryByText('🤖')).not.toBeInTheDocument();
    });

    it('player prop应该覆盖单独的name和isAI属性', () => {
      const player = { name: 'Player From Object', isAI: true };
      render(<Avatar player={player} name="Individual Name" isAI={false} />);
      
      // 应该使用player对象的值
      expect(screen.getByText('PF')).toBeInTheDocument();
      expect(screen.getByText('🤖')).toBeInTheDocument();
    });
  });

  describe('AI标识', () => {
    it('应该为AI玩家显示机器人标识', () => {
      render(<Avatar name="AI测试" isAI={true} />);
      
      expect(screen.getByText('🤖')).toBeInTheDocument();
    });

    it('应该为人类玩家隐藏机器人标识', () => {
      render(<Avatar name="人类测试" isAI={false} />);
      
      expect(screen.queryByText('🤖')).not.toBeInTheDocument();
    });

    it('默认情况下应该隐藏机器人标识', () => {
      render(<Avatar name="默认测试" />);
      
      expect(screen.queryByText('🤖')).not.toBeInTheDocument();
    });
  });

  describe('可访问性', () => {
    it('应该有正确的aria-label', () => {
      render(<Avatar name="测试玩家" />);
      
      expect(screen.getByLabelText('测试玩家的头像')).toBeInTheDocument();
    });

    it('应该为AI玩家添加AI标识到aria-label', () => {
      render(<Avatar name="AI玩家" isAI={true} />);
      
      expect(screen.getByLabelText('AI玩家的头像（AI玩家）')).toBeInTheDocument();
    });
  });

  describe('向后兼容性', () => {
    it('应该支持原有的name和isAI属性', () => {
      render(<Avatar name="传统方式" isAI={true} />);
      
      expect(screen.getByText('传')).toBeInTheDocument();
      expect(screen.getByText('🤖')).toBeInTheDocument();
    });

    it('在没有player prop时应该使用默认值', () => {
      render(<Avatar name="默认测试" />);
      
      // 应该显示名字首字母
      expect(screen.getByText('默')).toBeInTheDocument();
      // 默认不是AI
      expect(screen.queryByText('🤖')).not.toBeInTheDocument();
    });
  });
}); 