#!/bin/bash

# HumanifyJS 暂停版本 - 一键安装脚本

set -e

echo "🚀 开始安装 HumanifyJS 暂停版本..."

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 需要安装 Node.js (>=20)"
    echo "请访问 https://nodejs.org 下载安装"
    exit 1
fi

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 需要安装 npm"
    exit 1
fi

echo "✅ Node.js 和 npm 检查通过"

# 安装依赖
echo "📦 安装依赖..."
npm install

# 构建项目
echo "🔨 构建项目..."
npm run build

# 检查构建结果
if [ ! -f "dist/index.mjs" ]; then
    echo "❌ 构建失败: dist/index.mjs 不存在"
    exit 1
fi

echo "✅ 构建完成"

# 全局安装
echo "🌍 全局安装..."
npm install -g .

# 验证安装
echo "🔍 验证安装..."
if command -v humanify &> /dev/null; then
    echo "✅ 安装成功!"
    echo ""
    echo "🎉 HumanifyJS 暂停版本已安装完成!"
    echo ""
    echo "📋 快速开始:"
    echo "  humanify --help                    # 查看帮助"
    echo "  humanify status                    # 查看状态"
    echo ""
    echo "🔧 DeepSeek API 使用示例:"
    echo "  humanify openai input.js \\"
    echo "    --baseURL \"https://api.deepseek.com/v1\" \\"
    echo "    --apiKey \"sk-your-key\" \\"
    echo "    --model \"deepseek-coder\""
    echo ""
    echo "📖 详细文档:"
    echo "  - INSTALLATION_GUIDE.md  # 安装指南"
    echo "  - PAUSE_RESUME_GUIDE.md  # 暂停功能指南"
    echo "  - DEEPSEEK_USAGE.md      # DeepSeek API 使用说明"
    echo ""
    humanify --version
else
    echo "⚠️  安装可能有问题，请检查 PATH 配置"
    echo "尝试运行: npm config get prefix"
    echo "确保 <prefix>/bin 在您的 PATH 中"
fi