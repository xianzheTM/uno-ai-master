import { describe, it, expect } from 'vitest';
import * as AIModule from '../index';
import { AIManager } from '../AIManager';
import { AIStrategy } from '../AIStrategy';
import { EasyAI } from '../EasyAI';
import { MediumAI } from '../MediumAI';
import { HardAI } from '../HardAI';

describe('AI模块导出', () => {
  describe('导出检查', () => {
    it('应该导出AIManager', () => {
      expect(AIModule.AIManager).toBeDefined();
      expect(AIModule.AIManager).toBe(AIManager);
    });

    it('应该导出AIStrategy', () => {
      expect(AIModule.AIStrategy).toBeDefined();
      expect(AIModule.AIStrategy).toBe(AIStrategy);
    });

    it('应该导出EasyAI', () => {
      expect(AIModule.EasyAI).toBeDefined();
      expect(AIModule.EasyAI).toBe(EasyAI);
    });

    it('应该导出MediumAI', () => {
      expect(AIModule.MediumAI).toBeDefined();
      expect(AIModule.MediumAI).toBe(MediumAI);
    });

    it('应该导出HardAI', () => {
      expect(AIModule.HardAI).toBeDefined();
      expect(AIModule.HardAI).toBe(HardAI);
    });
  });

  describe('类型检查', () => {
    it('导出的类应该是构造函数', () => {
      expect(typeof AIModule.AIManager).toBe('function');
      expect(typeof AIModule.AIStrategy).toBe('function');
      expect(typeof AIModule.EasyAI).toBe('function');
      expect(typeof AIModule.MediumAI).toBe('function');
      expect(typeof AIModule.HardAI).toBe('function');
    });

    it('应该能够实例化导出的类', () => {
      expect(() => new AIModule.AIManager()).not.toThrow();
      expect(() => new AIModule.EasyAI('test-player')).not.toThrow();
      expect(() => new AIModule.MediumAI('test-player')).not.toThrow();
      expect(() => new AIModule.HardAI('test-player')).not.toThrow();
    });
  });

  describe('模块完整性', () => {
    it('应该导出所有必要的AI类', () => {
      const expectedExports = ['AIManager', 'AIStrategy', 'EasyAI', 'MediumAI', 'HardAI'];
      
      for (const exportName of expectedExports) {
        expect(AIModule).toHaveProperty(exportName);
      }
    });

    it('不应该有意外的导出', () => {
      const actualExports = Object.keys(AIModule);
      const expectedExports = ['AIManager', 'AIStrategy', 'EasyAI', 'MediumAI', 'HardAI'];
      
      expect(actualExports.sort()).toEqual(expectedExports.sort());
    });
  });
}); 