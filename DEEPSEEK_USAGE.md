# 使用 DeepSeek API 的说明

## DeepSeek API 兼容性

HumanifyJS 完全支持 DeepSeek API，因为它使用 OpenAI 兼容的接口。

## 使用方法

### 1. 基本使用

```bash
# 使用 DeepSeek API
humanify openai input.js \
  --baseURL "https://api.deepseek.com/v1" \
  --apiKey "your-deepseek-api-key" \
  --model "deepseek-coder"
```

### 2. 环境变量方式

```bash
# 设置环境变量
export OPENAI_BASE_URL="https://api.deepseek.com/v1"
export OPENAI_API_KEY="your-deepseek-api-key"

# 直接使用
humanify openai input.js --model "deepseek-coder"
```

### 3. 带暂停恢复功能

```bash
# 开始处理
humanify openai large-bundle.js \
  --baseURL "https://api.deepseek.com/v1" \
  --apiKey "your-deepseek-api-key" \
  --model "deepseek-coder"

# 如果中途暂停，恢复时使用相同参数
humanify openai large-bundle.js \
  --baseURL "https://api.deepseek.com/v1" \
  --apiKey "your-deepseek-api-key" \
  --model "deepseek-coder" \
  --resume
```

## 推荐的 DeepSeek 模型

- `deepseek-coder`: 专门用于代码理解和生成
- `deepseek-chat`: 通用对话模型

## 暂停功能确认

### ✅ 暂停时机确认

暂停检查发生在以下时机：
1. **每个文件处理前** - 在显示进度条之前检查暂停请求
2. **每个标识符重命名前** - 在调用 API 之前检查暂停请求
3. **网络错误时** - 自动检测 API 错误并暂停

### ✅ 进度显示时的暂停

当您看到进度显示时：
```
📁 Processing file: 45/150 (30%) - chunk-abc123.js
🔄 Processing: 65% - Renamed: handleClick
```

此时暂停机制仍然有效，因为：
- 进度显示是在处理完成后更新的
- 下一次处理前会检查暂停请求
- Ctrl+C 信号处理器随时响应

### 测试暂停功能

您可以通过以下方式测试：

1. **Ctrl+C 暂停**：
   ```bash
   humanify openai test.js --baseURL "https://api.deepseek.com/v1" --apiKey "your-key"
   # 按 Ctrl+C，应该看到优雅暂停消息
   ```

2. **手动暂停**：
   ```bash
   # 终端1：启动处理
   humanify openai test.js --baseURL "https://api.deepseek.com/v1" --apiKey "your-key"
   
   # 终端2：手动暂停
   humanify pause
   ```

3. **网络错误暂停**：
   ```bash
   # 使用错误的 baseURL 测试
   humanify openai test.js --baseURL "https://api.wrong-url.com/v1" --apiKey "your-key"
   # 应该自动检测网络错误并暂停
   ```

## 注意事项

1. **API 密钥**：DeepSeek API 密钥格式通常以 `sk-` 开头
2. **模型名称**：确保使用 DeepSeek 支持的模型名称
3. **速率限制**：注意 DeepSeek API 的速率限制
4. **恢复时参数**：恢复时必须使用相同的 baseURL、apiKey 和 model 参数

## 示例完整命令

```bash
# 处理大文件，支持暂停恢复
humanify openai large-minified-bundle.js \
  --baseURL "https://api.deepseek.com/v1" \
  --apiKey "sk-your-deepseek-key" \
  --model "deepseek-coder" \
  --outputDir "unminified-output" \
  --verbose

# 如果需要恢复
humanify openai large-minified-bundle.js \
  --baseURL "https://api.deepseek.com/v1" \
  --apiKey "sk-your-deepseek-key" \
  --model "deepseek-coder" \
  --outputDir "unminified-output" \
  --resume \
  --verbose
```