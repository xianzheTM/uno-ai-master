# UNO AI 卡牌游戏

一款基于浏览器的UNO卡牌游戏，支持玩家与AI机器人对战，可自定义对局人数（2-6人）。

## 功能特性

- 🎮 **经典UNO游戏规则** - 完整实现UNO卡牌游戏规则
- 🤖 **智能AI对手** - 三种难度等级的AI机器人
- 👥 **多人游戏** - 支持2-6人对战（玩家+AI）
- 🎨 **精美界面** - 现代化UI设计，流畅动画效果
- 📱 **响应式设计** - 完美支持桌面和移动设备
- 🔊 **音效系统** - 丰富的游戏音效和背景音乐
- ⚡ **高性能** - 基于React 18和Vite构建

## 技术栈

- **前端框架**: React 18 + TypeScript
- **状态管理**: Zustand
- **样式**: Tailwind CSS + Framer Motion
- **构建工具**: Vite
- **开发工具**: ESLint + Prettier + Vitest

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0 或 yarn >= 1.22.0

### 安装依赖

```bash
# 使用npm
npm install

# 或使用yarn
yarn install
```

### 开发模式

```bash
# 启动开发服务器
npm run dev

# 或使用yarn
yarn dev
```

访问 `http://localhost:5173` 开始游戏。

### 构建生产版本

```bash
# 构建项目
npm run build

# 预览构建结果
npm run preview
```

## 游戏规则

### 基础规则

1. 每位玩家开始时有7张牌
2. 玩家轮流出牌，出的牌必须与当前顶牌颜色或数字相同
3. 特殊卡牌有特殊效果
4. 当玩家剩余1张牌时必须喊"UNO"
5. 最先出完所有牌的玩家获胜

### 特殊卡牌

- **跳过卡 (Skip)** - 跳过下一个玩家的回合
- **反转卡 (Reverse)** - 改变游戏方向
- **+2卡 (Draw Two)** - 下一个玩家抽2张牌并跳过回合
- **变色卡 (Wild)** - 可以改变当前颜色
- **变色+4卡 (Wild Draw Four)** - 改变颜色且下一个玩家抽4张牌

## AI难度等级

- **简单** - 随机出牌策略，适合新手
- **中等** - 基于规则的智能策略
- **困难** - 高级算法，具有记牌和预测能力

## 项目结构

```
src/
├── components/         # React组件
│   ├── ui/            # 基础UI组件
│   ├── game/          # 游戏相关组件
│   └── layout/        # 布局组件
├── hooks/             # 自定义Hooks
├── stores/            # Zustand状态管理
├── types/             # TypeScript类型定义
├── utils/             # 工具函数
├── constants/         # 常量定义
├── ai/                # AI逻辑
├── game/              # 游戏核心逻辑
└── App.tsx           # 应用入口
```

## 开发指南

### 代码规范

项目使用ESLint和Prettier进行代码规范化：

```bash
# 检查代码规范
npm run lint

# 自动修复代码格式
npm run lint:fix

# 格式化代码
npm run format
```

### 测试

```bash
# 运行测试
npm run test

# 运行测试并生成覆盖率报告
npm run test:coverage
```

### 类型检查

```bash
# TypeScript类型检查
npm run type-check
```

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 更新日志

### v1.0.0 (开发中)

- ✅ 基础游戏框架
- ✅ 卡牌系统实现
- ✅ AI对手系统
- ✅ 游戏规则引擎
- 🚧 UI界面开发
- 🚧 动画效果
- 🚧 音效系统

## 技术支持

如果你在使用过程中遇到问题，请：

1. 查看 [技术方案.md](技术方案.md) 了解详细设计
2. 在 Issues 中搜索相关问题
3. 创建新的 Issue 描述问题

---

**享受游戏！** 🎉 