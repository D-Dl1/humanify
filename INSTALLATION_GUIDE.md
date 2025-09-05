# HumanifyJS 暂停版本 - 安装使用指南

## 🚀 安装方法

### 方法1：本地安装（推荐）

```bash
# 1. 克隆或下载这个项目到本地
git clone <your-repo-url> humanify-pause
cd humanify-pause

# 2. 安装依赖
npm install

# 3. 构建项目
npm run build

# 4. 全局安装（这样就可以在任何地方使用 humanify 命令）
npm install -g .
```

### 方法2：直接使用（不安装）

```bash
# 在项目目录下直接使用
cd /path/to/humanify-pause
node dist/index.mjs openai input.js --baseURL "https://api.deepseek.com/v1" --apiKey "your-key"
```

### 方法3：创建别名（推荐给开发者）

```bash
# 添加到你的 ~/.bashrc 或 ~/.zshrc
echo 'alias humanify-pause="node /path/to/humanify-pause/dist/index.mjs"' >> ~/.bashrc
source ~/.bashrc

# 使用
humanify-pause openai input.js --baseURL "https://api.deepseek.com/v1" --apiKey "your-key"
```

## ✅ 验证安装

```bash
# 检查是否安装成功
humanify --version
# 应该显示: 2.2.2

# 查看帮助
humanify --help
# 应该看到包含 pause 和 status 命令的帮助信息

# 测试新功能
humanify status
# 应该显示: 📊 No saved state found.
```

## 🔧 使用方法

### DeepSeek API 使用示例

```bash
# 基本使用
humanify openai input.js \
  --baseURL "https://api.deepseek.com/v1" \
  --apiKey "sk-your-deepseek-api-key" \
  --model "deepseek-coder"

# 带输出目录
humanify openai large-bundle.js \
  --baseURL "https://api.deepseek.com/v1" \
  --apiKey "sk-your-deepseek-api-key" \
  --model "deepseek-coder" \
  --outputDir "my-output"

# 详细输出
humanify openai input.js \
  --baseURL "https://api.deepseek.com/v1" \
  --apiKey "sk-your-deepseek-api-key" \
  --model "deepseek-coder" \
  --verbose
```

### 暂停和恢复功能

```bash
# 1. 开始处理（可随时 Ctrl+C 暂停）
humanify openai large-file.js \
  --baseURL "https://api.deepseek.com/v1" \
  --apiKey "sk-your-key" \
  --model "deepseek-coder"

# 2. 查看状态
humanify status

# 3. 恢复处理
humanify openai large-file.js \
  --baseURL "https://api.deepseek.com/v1" \
  --apiKey "sk-your-key" \
  --model "deepseek-coder" \
  --resume

# 4. 手动暂停（在另一个终端）
humanify pause
```

## 🌍 环境变量配置

为了方便使用，建议设置环境变量：

```bash
# 添加到 ~/.bashrc 或 ~/.zshrc
export OPENAI_BASE_URL="https://api.deepseek.com/v1"
export OPENAI_API_KEY="sk-your-deepseek-api-key"

# 重新加载配置
source ~/.bashrc

# 现在可以简化命令
humanify openai input.js --model "deepseek-coder"
```

## 📁 项目结构说明

```
humanify-pause/
├── src/                    # 源代码
├── dist/                   # 构建输出
│   └── index.mjs          # 主执行文件
├── package.json           # 项目配置
├── PAUSE_RESUME_GUIDE.md  # 暂停功能详细指南
├── DEEPSEEK_USAGE.md      # DeepSeek API 使用说明
└── INSTALLATION_GUIDE.md  # 本安装指南
```

## 🛠️ 开发和调试

如果您想修改代码或调试：

```bash
# 开发模式运行（不需要构建）
npm run start -- openai input.js --baseURL "https://api.deepseek.com/v1" --apiKey "your-key"

# 修改代码后重新构建
npm run build

# 运行测试
npm test
```

## 📦 打包分发

如果您想分发给其他人：

```bash
# 1. 构建项目
npm run build

# 2. 打包整个项目
tar -czf humanify-pause.tar.gz dist/ package.json *.md

# 3. 其他人解压后可以直接使用
tar -xzf humanify-pause.tar.gz
cd humanify-pause
npm install -g .
```

## 🔄 从原版迁移

如果您之前使用过原版 humanifyjs：

```bash
# 1. 卸载原版（可选）
npm uninstall -g humanifyjs

# 2. 安装暂停版本
cd /path/to/humanify-pause
npm install -g .

# 3. 现在 humanify 命令使用的是暂停版本
humanify --help  # 应该看到 pause 和 status 命令
```

## ❓ 常见问题

### Q: 安装后提示 "command not found"
A: 检查 npm 全局 bin 目录是否在 PATH 中：
```bash
npm config get prefix
# 确保 <prefix>/bin 在您的 PATH 中
```

### Q: 权限错误
A: 使用 sudo 安装或配置 npm 全局目录：
```bash
sudo npm install -g .
# 或者配置 npm 使用用户目录
npm config set prefix ~/.npm-global
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
```

### Q: 如何更新到新版本
A: 重新构建和安装：
```bash
cd /path/to/humanify-pause
git pull  # 如果有更新
npm run build
npm install -g .
```

### Q: 如何卸载
A: 使用 npm 卸载：
```bash
npm uninstall -g humanifyjs
```

## 🎯 快速开始示例

创建一个测试文件并尝试：

```bash
# 1. 创建测试文件
echo "function a(b,c){var d=b+c;return d*2}" > test.js

# 2. 使用 DeepSeek 处理
humanify openai test.js \
  --baseURL "https://api.deepseek.com/v1" \
  --apiKey "sk-your-key" \
  --model "deepseek-coder"

# 3. 查看结果
cat output/test.js
```

现在您就可以享受带暂停功能的 HumanifyJS 了！🎉