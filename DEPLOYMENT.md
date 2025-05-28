# GitHub Pages 部署指南

本文档详细说明如何将UNO AI游戏部署到GitHub Pages。

## 自动部署（推荐）

项目已配置GitHub Actions自动部署，当代码推送到`main`分支时会自动触发部署。

### 设置步骤

1. **推送代码到GitHub仓库**
   ```bash
   git add .
   git commit -m "配置GitHub Pages部署"
   git push origin main
   ```

2. **启用GitHub Pages**
   - 进入GitHub仓库页面
   - 点击 `Settings` 标签
   - 在左侧菜单中找到 `Pages`
   - 在 `Source` 部分选择 `GitHub Actions`
   - 保存设置

3. **等待部署完成**
   - 查看 `Actions` 标签页面的部署进度
   - 部署成功后，网站将在 `https://yourusername.github.io/uno-ai-master/` 可访问

### 部署流程

GitHub Actions会自动执行以下步骤：
1. 检出代码
2. 设置Node.js环境
3. 安装依赖
4. 运行类型检查
5. 运行代码检查
6. 运行测试
7. 构建项目
8. 部署到GitHub Pages

## 手动部署

如果需要手动部署，可以使用以下命令：

### 前提条件

1. 安装gh-pages包：
   ```bash
   npm install --save-dev gh-pages
   ```

2. 确保已配置Git用户信息：
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

### 部署命令

```bash
# 构建并部署
npm run deploy
```

这个命令会：
1. 构建生产版本
2. 将构建结果推送到`gh-pages`分支
3. GitHub Pages会自动从该分支部署网站

## 配置说明

### Vite配置

`vite.config.ts`中的重要配置：

```typescript
export default defineConfig({
  // GitHub Pages部署时需要设置base路径
  base: process.env.NODE_ENV === 'production' ? '/uno-ai-master/' : '/',
  build: {
    outDir: 'dist',
    sourcemap: true,
    assetsDir: 'assets',
  },
})
```

### Package.json配置

重要的字段：
- `homepage`: 设置为GitHub Pages的URL
- `repository.url`: 指向正确的GitHub仓库
- 部署脚本：`build:gh-pages`和`deploy`

## 故障排除

### 常见问题

1. **404错误**
   - 检查`base`路径配置是否正确
   - 确认仓库名称与配置一致

2. **资源加载失败**
   - 检查`assetsDir`配置
   - 确认所有资源路径都是相对路径

3. **部署失败**
   - 检查GitHub Actions日志
   - 确认所有测试都通过
   - 检查代码是否有语法错误

### 调试步骤

1. **本地测试生产构建**
   ```bash
   npm run build:gh-pages
   npm run preview
   ```

2. **检查构建输出**
   ```bash
   ls -la dist/
   ```

3. **查看GitHub Actions日志**
   - 进入仓库的Actions页面
   - 点击失败的工作流查看详细日志

## 更新部署

### 自动更新
每次推送到`main`分支都会触发自动部署。

### 手动更新
```bash
git add .
git commit -m "更新内容"
git push origin main
```

或者使用手动部署：
```bash
npm run deploy
```

## 环境变量

如果项目需要环境变量，可以在GitHub仓库的Settings > Secrets and variables > Actions中添加。

## 自定义域名（可选）

如果要使用自定义域名：

1. 在`public`目录下创建`CNAME`文件
2. 文件内容为你的域名，如：`yourdomain.com`
3. 在域名提供商处配置DNS记录

## 监控和分析

部署后可以：
- 使用GitHub Pages的内置分析
- 集成Google Analytics
- 监控网站性能和错误

---

**注意**: 请将文档中的`yourusername`替换为你的实际GitHub用户名。 