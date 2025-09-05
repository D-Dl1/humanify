# 🚀 HumanifyJS 暂停版本 - 快速开始

> 支持暂停恢复的 JavaScript 反混淆工具，完美支持 DeepSeek API

## ⚡ 一键安装

```bash
# 1. 下载项目
git clone <your-repo> humanify-pause
cd humanify-pause

# 2. 运行安装脚本
./install.sh

# 3. 开始使用
humanify --help
```

## 🎯 立即使用 DeepSeek

```bash
# 设置环境变量（推荐）
export OPENAI_BASE_URL="https://api.deepseek.com/v1"
export OPENAI_API_KEY="sk-your-deepseek-api-key"

# 处理文件
humanify openai input.js --model "deepseek-coder"

# 如果中途暂停，可以恢复
humanify openai input.js --model "deepseek-coder" --resume
```

## 🔄 新功能亮点

- ✅ **自动暂停**: 网络中断时自动保存进度
- ✅ **手动暂停**: Ctrl+C 或 `humanify pause` 命令
- ✅ **智能恢复**: `--resume` 从中断处继续
- ✅ **进度显示**: 详细的处理进度和当前任务
- ✅ **状态查看**: `humanify status` 查看当前状态
- ✅ **DeepSeek 支持**: 完美兼容 DeepSeek API

## 📖 详细文档

- [📋 完整安装指南](./INSTALLATION_GUIDE.md)
- [⏸️ 暂停功能详解](./PAUSE_RESUME_GUIDE.md)
- [🤖 DeepSeek API 使用](./DEEPSEEK_USAGE.md)

## 🆚 与原版对比

| 功能 | 原版 | 暂停版本 |
|------|------|----------|
| 基本反混淆 | ✅ | ✅ |
| 网络中断处理 | ❌ 重新开始 | ✅ 自动暂停保存 |
| 手动暂停 | ❌ | ✅ Ctrl+C 优雅暂停 |
| 恢复处理 | ❌ | ✅ --resume 继续 |
| 进度显示 | 基础 | ✅ 详细进度 + 当前任务 |
| 状态管理 | ❌ | ✅ 状态查看和管理 |
| DeepSeek API | ✅ | ✅ 完美支持 |

永远不用担心处理大文件时前功尽弃！🎉