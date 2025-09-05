# Humanify 暂停和恢复功能指南

## 概述

Humanify 现在支持暂停和恢复功能，让您可以在处理大型文件时随时暂停，避免因断网、关机或其他意外情况导致的进度丢失。

## 主要功能

### 1. 自动状态保存
- 处理每个文件后自动保存进度
- 网络错误时自动暂停并保存状态
- 支持 Ctrl+C 优雅暂停

### 2. 手动暂停和恢复
- 使用 `--resume` 标志恢复之前的会话
- 使用 `pause` 命令手动暂停正在运行的进程
- 使用 `status` 命令查看当前进度

## 使用方法

### 基本使用

```bash
# 开始处理文件
humanify openai input.js

# 如果中途暂停（Ctrl+C 或网络中断），可以恢复
humanify openai input.js --resume
```

### 查看状态

```bash
# 查看当前处理状态
humanify status

# 查看特定输出目录的状态
humanify status -o my-output-dir
```

### 手动暂停

```bash
# 手动暂停正在运行的进程
humanify pause

# 暂停特定输出目录的进程
humanify pause -o my-output-dir
```

## 支持的场景

### 1. 网络中断恢复
当遇到网络错误时，系统会自动保存状态并暂停：

```bash
# 原始命令
humanify openai large-bundle.js -k your-api-key

# 网络恢复后恢复处理
humanify openai large-bundle.js -k your-api-key --resume
```

### 2. 手动暂停
使用 Ctrl+C 或 pause 命令暂停：

```bash
# 在另一个终端中暂停
humanify pause

# 然后恢复
humanify openai large-bundle.js --resume
```

### 3. 系统重启后恢复
即使重启电脑，只要输出目录还在，就可以恢复：

```bash
# 重启后恢复
humanify openai large-bundle.js --resume
```

## 状态文件

状态信息保存在输出目录中的 `.humanify-state.json` 文件中，包含：

- 当前处理进度
- 已处理的文件列表
- 重命名历史
- 时间戳

**注意：** 不要手动编辑此文件，否则可能导致恢复失败。

## 命令选项

### 所有处理命令都支持：
- `--resume`: 从上次中断的地方继续
- `--pause`: 标记可以暂停（主要用于文档说明）

### 状态管理命令：
- `humanify status [options]`: 查看处理状态
- `humanify pause [options]`: 手动暂停进程

### 选项：
- `-o, --outputDir <dir>`: 指定输出目录（默认：output）

## 示例场景

### 场景1：处理大文件时网络中断

```bash
$ humanify openai huge-bundle.js -k sk-xxx
🚀 Processing 150 files...
Processing file 45/150: output/chunk-abc.js
🌐 Network error detected, saving state for retry...
⏸️  Process paused. Run with --resume to continue.

# 网络恢复后
$ humanify openai huge-bundle.js -k sk-xxx --resume
📂 Resuming from previous session...
📊 Progress: 45/150 files processed
▶️  Resuming processing...
Processing file 46/150: output/chunk-def.js
...
```

### 场景2：主动暂停和恢复

```bash
# 终端1：开始处理
$ humanify openai bundle.js -k sk-xxx
🚀 Processing 100 files...
Processing file 30/100: output/main.js

# 终端2：查看状态并暂停
$ humanify status
📊 Process Status:
📁 Input file: bundle.js
📂 Output directory: output
📈 Progress: 30/100 files processed
⏰ Last updated: 2024-01-15 14:30:25
▶️  Status: RUNNING

$ humanify pause
⏸️  Process has been marked for pausing.
🔄 The running process will pause at the next checkpoint.

# 终端1：进程在下个检查点暂停
⏸️  Pause requested, stopping identifier processing...
🔄 Processing paused. State has been saved.
To resume, run the same command with --resume flag

# 稍后恢复
$ humanify openai bundle.js -k sk-xxx --resume
📂 Resuming from previous session...
📊 Progress: 30/100 files processed
▶️  Resuming processing...
```

## 注意事项

1. **API 密钥**：恢复时仍需提供相同的 API 密钥和配置
2. **输出目录**：确保输出目录路径一致
3. **状态文件**：不要删除或修改 `.humanify-state.json` 文件
4. **模型一致性**：建议使用相同的模型和参数恢复处理
5. **磁盘空间**：确保有足够空间保存状态和输出文件

## 故障排除

### 恢复失败
```bash
⚠️  No previous state found, starting fresh...
```
- 检查输出目录是否正确
- 确认 `.humanify-state.json` 文件存在

### 状态文件损坏
如果状态文件损坏，系统会自动开始新的处理：
```bash
❌ Failed to load state: SyntaxError: Unexpected token
⚠️  Starting fresh due to corrupted state file...
```

### 网络错误处理
系统会自动识别以下网络错误并暂停：
- `ENOTFOUND` (域名解析失败)
- `ECONNREFUSED` (连接被拒绝)
- `fetch failed` (请求失败)

## 版本兼容性

此功能从 v2.3.0 开始支持，与之前版本的状态文件不兼容。如果从旧版本升级，建议重新开始处理。