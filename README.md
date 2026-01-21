# 企业级 AI 数字员工 - HR/IT 智能助手

<div align="center">

**魔法星云黑客松参赛项目**

基于魔珐星云3D数字人技术，打造一个面向企业场景的智能数字员工，专注于 HR 政策解答和 IT 故障报修两大核心场景。

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/react-18.x-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.x-3178C6.svg)](https://www.typescriptlang.org/)

</div>

## ✨ 功能特色

### 核心功能
- **🤖 3D 数字人**：魔珐星云专业企业级数字人，支持语音播报和表情同步
- **💬 AI 智能对话**：基于魔搭 Qwen3-VL 多模态大模型，支持文本+图片混合对话
- **📚 自定义知识库**：支持上传企业文档（PDF/DOCX/TXT/MD），自动向量化检索
- **🎫 智能工单系统**：自动识别问题并创建工单，支持状态跟踪
- **🔑 密钥管理**：灵活配置 API 密钥，支持内置测试密钥快速体验

### 业务场景
- **HR 政策解答**：薪资福利、考勤休假、招聘入职、培训发展等政策咨询
- **IT 故障报修**：硬件故障、软件问题、网络问题、账号权限等技术支持

### 交互体验
- **多模态对话**：支持图片上传、截图粘贴、图文混合对话
- **快捷提问**：预设常见问题，一键快速咨询
- **知识库引用**：显示回复参考的企业知识库来源
- **流式响应**：实时显示 AI 回复过程，提升交互体验

## 🛠️ 技术栈

### 前端
- **框架**：React 18 + TypeScript
- **构建工具**：Vite 5.x
- **状态管理**：Zustand
- **样式方案**：TailwindCSS
- **HTTP 客户端**：Fetch API

### 后端
- **运行环境**：Node.js 18.x
- **框架**：Express + TypeScript
- **文件处理**：pdf-parse, mammoth
- **其他**：cors, dotenv, uuid, multer

### AI 服务
- **对话模型**：魔搭社区 Qwen/Qwen3-VL-235B-A22B-Instruct（多模态）
- **嵌入模型**：魔搭社区 Qwen/Qwen3-Embedding-8B（高性能向量化）
- **向量检索**：余弦相似度搜索

### 数字人驱动
- **SDK**：魔珐星云具身驱动 SDK v0.1.0-alpha.72
- **CDN**：https://media.xingyun3d.com/xingyun3d/general/litesdk/xmovAvatar@latest.js

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
# 1. 构建前端
npm run build

# 2. 启动服务器
npm run dev
```

访问 http://localhost:5178

### 环境变量

配置 `.env.server` 文件：

```bash
# 服务器配置
PORT=5178
NODE_ENV=development

# 魔搭AI配置
MODELSCOPE_API_KEY=ms-85ed98e9-1a8e-41e5-8215-ee563559d069
MODELSCOPE_BASE_URL=https://api-inference.modelscope.cn/v1
MODELSCOPE_CHAT_MODEL=Qwen/Qwen3-VL-235B-A22B-Instruct
MODELSCOPE_EMBEDDING_MODEL=Qwen/Qwen3-Embedding-8B

# 文件上传配置
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./public/uploads
```

### 内置测试密钥

项目已内置测试密钥，首次启动可直接使用：

```javascript
// 魔搭 AI
ModelScope API Key: ms-85ed98e9-1a8e-41e5-8215-ee563559d069

// 魔珐星云
App ID: b91e4bdb81ed4567bde3ba242b9bf042
App Secret: 913d8ede47474927a441be29e6b560af
```

## 📁 项目结构

```
enterprise-assistant/
├── src/
│   ├── client/              # 前端代码
│   │   ├── components/      # React 组件
│   │   │   ├── Avatar/      # 数字人组件
│   │   │   ├── Chat/        # 对话组件
│   │   │   ├── Ticket/      # 工单组件
│   │   │   ├── Knowledge/   # 知识库组件
│   │   │   └── Common/      # 通用组件
│   │   ├── store/           # Zustand 状态管理
│   │   ├── services/        # API 服务
│   │   ├── App.tsx          # 主应用
│   │   └── main.tsx         # 入口文件
│   │
│   ├── server/              # 后端代码
│   │   ├── routes/          # API 路由
│   │   ├── services/        # 业务服务
│   │   ├── app.ts           # Express 应用
│   │   └── main.ts          # 入口文件
│   │
│   └── data/                # 预置知识库
│       └── knowledge/       # HR/IT 知识库 JSON
│
├── public/                  # 静态资源
│   └── uploads/             # 用户上传文件
├── dist/public/             # 构建输出
├── index.html               # HTML 入口
├── package.json             # 项目配置
├── vite.config.ts           # Vite 配置
├── tsconfig.json            # TypeScript 配置
├── .env.server              # 环境变量
├── README.md                # 项目说明
└── claude.md                # 开发文档
```

## 🎯 核心功能实现

### 1. 密钥管理
- 首次访问引导配置密钥
- 支持内置测试密钥快速体验
- 密钥安全存储在 localStorage

### 2. 自定义知识库
- 支持 PDF/DOCX/TXT/MD 文件上传
- 自动文本提取和智能分块
- Qwen3-Embedding-8B 向量化
- 余弦相似度语义检索
- 知识库统计和管理

### 3. RAG 增强对话
- 向量检索相关文档
- Top-K 检索策略
- 自动引用知识库来源
- 流式响应实时反馈

### 4. 工单系统
- 自动识别问题创建工单
- 工单分类和优先级
- 工单状态跟踪
- 工单列表和详情

### 5. 数字人驱动
- 语音播报
- 流式说话分段策略
- 状态控制（空闲/思考/倾听）
- 离线模式节省积分

## 📖 API 文档

### POST /api/chat/stream
流式对话接口

### POST /api/upload
上传知识库文件

### GET /api/knowledge
获取知识库列表

### DELETE /api/knowledge/:id
删除知识库文档

### GET/POST /api/tickets
获取/创建工单

## 🔧 开发指南

详细开发文档请参见 [claude.md](./claude.md)

### 修改前端代码
1. 修改代码
2. 运行 `npm run build`
3. 重启服务器
4. 刷新浏览器

### 修改后端代码
1. 修改代码
2. 重启服务器即可

## 🏆 项目亮点

1. **3D 数字人**：专业的企业形象，增强用户信任感
2. **多模态 AI**：支持图文混合对话，更自然的人机交互
3. **自定义知识库**：每个企业都能拥有专属的数字员工
4. **智能工单**：自动识别问题并创建工单，提升服务效率
5. **流式响应**：实时反馈，提升用户体验
6. **知识库引用**：增强回答的可信度和可追溯性

## 📝 更新日志

### v1.0.0 (2025-01-21)
- ✅ 初始版本发布
- ✅ 3D 数字人集成
- ✅ AI 多模态对话
- ✅ 自定义知识库上传
- ✅ HR/IT 场景支持
- ✅ 工单系统
- ✅ 密钥管理
- ✅ 快捷提问

## 📄 License

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

魔法星云黑客松参赛作品
