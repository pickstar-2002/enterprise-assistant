# 城市展厅智能讲解员 - 开发文档

## 文档信息

| 项目 | 内容 |
|------|------|
| 项目名称 | 城市展厅智能讲解员 |
| 赛道 | 大屏交互与智能讲解赛道 |
| 方向 | 城市展厅讲解：生动讲述城市历史与未来规划 |
| 文档版本 | v1.3 |
| 创建日期 | 2025-12-31 |
| 更新日期 | 2026-01-04 |

---

## 目录

1. [项目简介](#项目简介)
2. [核心功能](#核心功能)
3. [技术栈](#技术栈)
4. [技术架构](#技术架构)
5. [目录结构](#目录结构)
6. [开发环境配置](#开发环境配置)
7. [核心模块设计](#核心模块设计)
8. [魔搭AI模型连接实现](#魔搭ai模型连接实现)
9. [数字人流式说话与富文本输出](#数字人流式说话与富文本输出)
10. [知识库管理](#知识库管理)
11. [向量检索系统](#向量检索系统)
12. [大屏交互设计](#大屏交互设计)
13. [Widget展示功能](#widget展示功能)
14. [密钥管理](#密钥管理)
15. [错误处理机制](#错误处理机制)
16. [性能优化建议](#性能优化建议)
17. [API接口文档](#api接口文档)
18. [部署说明](#部署说明)
19. [快速开始](#快速开始)

---

## 项目简介

### 项目描述

基于魔珐星云具身驱动SDK构建的城市展厅智能讲解系统，通过3D数字人向参观者生动讲述城市的历史文化、发展成就和未来规划。支持用户自定义上传知识库，自动向量化处理，实现精准的RAG检索回答。适用于城市规划馆、博物馆、展览中心等场景。

### 应用场景

| 场景 | 说明 |
|------|------|
| 城市规划馆 | 展示城市发展历程和未来规划 |
| 博物馆 | 介绍馆藏文物和历史背景 |
| 旅游景点 | 提供景点讲解和旅游指引 |
| 企业展厅 | 展示企业发展和产品介绍 |
| 政务大厅 | 政策解读和办事指南 |

### 技术亮点

- 魔珐星云3D数字人驱动
- 魔搭社区AI大模型接入（Qwen3-VL多模态模型）
- RAG知识库增强检索
- 用户自定义知识库上传
- 自动向量化转换（Qwen3-Embedding-8B）
- 图片理解和对话支持
- 流式对话响应
- 大屏交互界面设计

---

## 核心功能

### 1. 数字人控制

| 功能 | 说明 |
|------|------|
| 连接/断开 | 手动控制数字人的连接与断开 |
| 状态管理 | 实时显示数字人状态（在线/离线/待机等） |
| 动作控制 | 支持指定KA动作进行讲解 |
| 音量控制 | 可调节数字人说话音量 |

### 2. 智能讲解

| 功能 | 说明 |
|------|------|
| 自由对话 | 参观者可自由提问，AI智能回答 |
| 主题讲解 | 预设城市历史/规划等主题讲解 |
| 流式响应 | AI回答实时流式输出，数字人同步讲解 |
| 多轮对话 | 支持上下文理解的多轮对话 |
| 图片问答 | 支持上传图片进行问答（多模态） |

### 3. 知识库管理

| 功能 | 说明 |
|------|------|
| 文件上传 | 支持TXT、MD、PDF、JSON格式 |
| 自动解析 | 自动提取文本内容 |
| 向量化转换 | 使用Qwen3-Embedding-8B自动转换 |
| 知识库预览 | 查看已上传的知识库内容 |
| 删除管理 | 支持删除单个或全部知识库 |

### 4. 向量检索

| 功能 | 说明 |
|------|------|
| 语义检索 | 基于向量相似度的语义匹配 |
| Top-K召回 | 返回最相关的K个知识片段 |
| 上下文增强 | 将检索结果融入Prompt |
| 相似度评分 | 显示每个匹配片段的相似度 |

### 5. 大屏展示

| 功能 | 说明 |
|------|------|
| 讲解内容展示 | 实时显示当前讲解文字 |
| 图片/视频展示 | 支持Widget展示相关图片和视频 |
| 字幕同步 | 数字人说话时同步显示字幕 |
| 交互面板 | 提供快捷提问和主题选择按钮 |

### 6. 密钥管理

| 功能 | 说明 |
|------|------|
| 本地存储 | 密钥存储在localStorage中 |
| 测试密钥 | 提供内置测试密钥供快速体验 |
| 手动输入 | 支持用户手动输入自己的密钥 |
| 安全提示 | 密钥仅在本地使用，不会上传服务器 |

---

## 技术栈

### 前端技术栈

```yaml
框架: React 18.x + TypeScript
构建工具: Vite 6.x
状态管理: Zustand
样式方案: TailwindCSS
HTTP客户端: Axios
文件上传: FormData API
本地存储: localStorage
其他:
  - react-dropzone: 拖拽上传
  - react-use: React Hooks 工具库
```

### 后端技术栈

```yaml
运行环境: Node.js 18.x
框架: Express + TypeScript
AI服务: 魔搭社区 (ModelScope OpenAI兼容API)
嵌入模型: Qwen/Qwen3-Embedding-8B
对话模型: Qwen/Qwen3-VL-235B-A22B-Instruct
向量存储: 内存向量存储 (支持扩展到专业向量数据库)
文件解析:
  - pdf-parse: PDF文件解析
  - marked: Markdown解析
其他:
  - cors: 跨域处理
  - multer: 文件上传
  - dotenv: 环境变量
  - uuid: 唯一标识符
```

### 具身驱动SDK

```yaml
SDK名称: 魔珐星云具身驱动SDK
版本: 0.1.0-alpha.72 (最新版本)
接入方式: JavaScript CDN
Gateway: https://nebula-agent.xingyun3d.com/user/v1/ttsa/session
```

---

## 技术架构

### 系统架构图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              客户端层 (Browser)                         │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │  React UI    │  │  星云SDK层   │  │  密钥管理    │  │ 知识库上传 │  │
│  │              │  │              │  │              │  │           │  │
│  │ - 大屏界面   │◄─┤ - 3D数字人   │◄─┤ - localStorage│  │- 文件选择 │  │
│  │ - 语音输入   │  │ - 语音合成   │  │ - 测试密钥   │  │- 拖拽上传 │  │
│  │ - Widget展示 │  │ - 动作控制   │  │ - 手动输入   │  │- 进度显示 │  │
│  │ - 图片上传   │  │              │  │              │  │- 预览管理 │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └───────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
         ┌──────────────────┐ ┌──────────────┐ ┌──────────────┐
         │   文件上传API    │ │  对话API     │ │  密钥验证    │
         │   /knowledge     │ │  /chat       │ │  /api        │
         └────────┬─────────┘ └──────┬───────┘ └──────────────┘
                  │                  │
                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              服务端层 (Node.js)                         │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │  API服务     │  │  AI服务      │  │  向量服务    │  │ 文件服务  │  │
│  │  (Express)   │  │  (ModelScope)│  │  (RAG)       │  │           │  │
│  │              │  │              │  │              │  │           │  │
│  │ - /chat      │─►│ - Qwen3-VL   │◄─│ - Embedding  │◄─│ - 文件解析 │  │
│  │ - /knowledge │  │ - Qwen3-Emb  │  │ - 向量存储   │  │- 文本提取 │  │
│  │ - /upload    │  │ - 流式响应   │  │ - 相似度计算 │  │- 格式转换 │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └───────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
                         ┌──────────────────────┐
                         │   向量知识库存储      │
                         │                      │
                         │ - 文本向量           │
                         │ - 元数据             │
                         │ - 索引               │
                         └──────────────────────┘
```

### RAG检索流程图

```
用户提问
    │
    ▼
┌─────────────────┐
│  向量化查询     │
│  (Qwen3-Embed)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────┐
│  向量相似度计算 │────►│ Top-K召回    │
│  (余弦相似度)   │     │ 取前5个片段   │
└────────┬────────┘     └──────────────┘
         │
         ▼
┌─────────────────┐
│  上下文构建     │
│  拼接Prompt     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────┐
│  LLM生成回答    │────►│ 数字人讲解   │
│  (Qwen3-VL)     │     │ 流式输出     │
└─────────────────┘     └──────────────┘
```

---

## 目录结构

```
city-exhibition-guide/
├── src/                         # 源代码目录
│   ├── client/                  # 前端代码 (React + TypeScript)
│   │   ├── components/
│   │   │   ├── Avatar/
│   │   │   │   ├── AvatarController.ts      # SDK控制器
│   │   │   │   └── AvatarContainer.tsx      # 数字人容器
│   │   │   ├── Chat/
│   │   │   │   ├── ChatInput.tsx            # 输入框组件
│   │   │   │   ├── MessageList.tsx          # 消息列表组件
│   │   │   │   └── ImageUpload.tsx          # 图片上传组件
│   │   │   ├── Settings/
│   │   │   │   ├── ApiKeyPanel.tsx          # 密钥配置面板
│   │   │   │   └── TestKeyProvider.tsx      # 测试密钥说明
│   │   │   ├── Exhibition/
│   │   │   │   ├── ThemeSelector.tsx        # 主题选择器
│   │   │   │   └── ContentDisplay.tsx       # 内容展示组件
│   │   │   ├── Widget/
│   │   │   │   ├── ImageWidget.tsx          # 图片Widget组件
│   │   │   │   └── VideoWidget.tsx          # 视频Widget组件
│   │   │   └── Knowledge/
│   │   │       ├── KnowledgeUploader.tsx    # 知识库上传组件
│   │   │       ├── FileDropzone.tsx         # 拖拽上传区域
│   │   │       └── KnowledgeList.tsx        # 知识库列表
│   │   ├── store/
│   │   │   ├── chatStore.ts                 # 对话状态管理
│   │   │   ├── avatarStore.ts               # 数字人状态管理
│   │   │   └── knowledgeStore.ts            # 知识库状态管理
│   │   ├── services/
│   │   │   ├── chatService.ts               # 前端API服务
│   │   │   ├── storageService.ts            # localStorage服务
│   │   │   └── uploadService.ts             # 文件上传服务
│   │   ├── types/
│   │   │   └── index.ts                     # 类型定义
│   │   ├── App.tsx                          # 主应用组件
│   │   └── main.tsx                         # 入口文件
│   │
│   ├── server/                 # 后端代码 (Node.js + TypeScript)
│   │   ├── routes/
│   │   │   ├── chat.routes.ts                # 对话路由
│   │   │   ├── themes.routes.ts             # 主题讲解路由
│   │   │   ├── knowledge.routes.ts          # 知识库管理路由
│   │   │   └── upload.routes.ts             # 文件上传路由
│   │   ├── services/
│   │   │   ├── chatService.ts                # 对话处理服务
│   │   │   ├── modelscopeService.ts          # 魔搭AI服务
│   │   │   ├── embeddingService.ts          # 向量化服务
│   │   │   ├── vectorStoreService.ts         # 向量存储服务
│   │   │   ├── fileParserService.ts         # 文件解析服务
│   │   │   └── ragService.ts                 # RAG检索服务
│   │   ├── middleware/
│   │   │   ├── error.middleware.ts           # 错误处理
│   │   │   └── upload.middleware.ts         # 文件上传中间件
│   │   └── app.ts                            # Express应用入口
│   │
│   └── shared/                 # 共享代码
│       └── types/               # 共享类型定义
│
├── uploads/                     # 上传文件存储目录
│   └── knowledge/               # 知识库文件
│
├── data/                        # 内置城市知识库数据
│   └── knowledge/
│       ├── city-history.json               # 城市历史
│       ├── future-planning.json             # 未来规划
│       ├── cultural-attractions.json        # 文化景点
│       └── urban-development.json           # 城市发展
│
├── public/                      # 静态资源
├── package.json                 # 项目配置
├── vite.config.ts              # Vite配置
├── tsconfig.json               # TypeScript配置 (前端)
├── tsconfig.server.json        # TypeScript配置 (后端)
├── tailwind.config.js          # TailwindCSS配置
├── postcss.config.js           # PostCSS配置
└── README.md                    # 项目说明
```

---

## 开发环境配置

### 完整依赖配置

**package.json**
```json
{
  "name": "city-exhibition-guide",
  "version": "1.0.0",
  "description": "城市展厅智能讲解员 - 魔法星云黑客松2025参赛作品",
  "type": "module",
  "scripts": {
    "dev": "concurrently \"npm run dev:client\" \"npm run dev:server\"",
    "dev:client": "vite",
    "dev:server": "tsx watch src/server/app.ts",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "start": "node dist/server/app.js"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "axios": "^1.7.9",
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "express": "^4.21.2",
    "openai": "^4.77.3",
    "pdf-parse": "^1.1.1",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-dropzone": "^14.3.5",
    "marked": "^15.0.4",
    "uuid": "^11.0.3",
    "zustand": "^5.0.2",
    "react-use": "^17.5.1"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^5.0.0",
    "@types/node": "^22.10.5",
    "@types/pdf-parse": "^1.1.4",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@types/uuid": "^10.0.0",
    "autoprefixer": "^10.4.20",
    "concurrently": "^9.1.2",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "tsx": "^4.19.2",
    "typescript": "^5.7.2",
    "vite": "^6.0.7"
  }
}
```

### 前端环境配置

**vite.config.ts**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
```

### 后端环境配置

**.env.server**
```bash
# 服务器配置
PORT=3001
NODE_ENV=development

# 魔搭AI配置 (使用OpenAI兼容API)
MODELSCOPE_API_KEY=
MODELSCOPE_BASE_URL=https://api-inference.modelscope.cn/v1
MODELSCOPE_EMBEDDING_MODEL=Qwen/Qwen3-Embedding-8B
MODELSCOPE_CHAT_MODEL=Qwen/Qwen3-VL-235B-A22B-Instruct

# 文件上传配置
UPLOAD_DIR=./uploads/knowledge
MAX_FILE_SIZE=10485760
ALLOWED_EXTENSIONS=.txt,.md,.pdf,.json

# 向量检索配置
TOP_K_RESULTS=5
SIMILARITY_THRESHOLD=0.6

# 内置测试密钥 (用于演示)
TEST_MODELSCOPE_KEY=ms-de3c153b-5a19-41d1-bd3e-257a7eef7922
TEST_AVATAR_APP_ID=test_app_id
TEST_AVATAR_SECRET=test_app_secret
```

---

## 核心模块设计

### 1. 魔搭AI服务（ModelScope OpenAI兼容）

**modelscopeService.ts**
```typescript
import OpenAI from 'openai';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

export class ModelScopeService {
  private client: OpenAI;
  private embeddingModel: string;
  private chatModel: string;

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://api-inference.modelscope.cn/v1'
    });
    this.embeddingModel = 'Qwen/Qwen3-Embedding-8B';
    this.chatModel = 'Qwen/Qwen3-VL-235B-A22B-Instruct';
  }

  /**
   * 生成文本向量
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.client.embeddings.create({
        model: this.embeddingModel,
        input: text,
        encoding_format: 'float'
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Embedding Error:', error);
      throw new Error('向量化失败');
    }
  }

  /**
   * 批量生成向量
   */
  async generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];

    for (const text of texts) {
      const embedding = await this.generateEmbedding(text);
      embeddings.push(embedding);
    }

    return embeddings;
  }

  /**
   * 普通对话
   */
  async chat(messages: ChatMessage[]): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.chatModel,
        messages: messages as any,
        stream: false
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      console.error('Chat Error:', error);
      throw new Error('对话生成失败');
    }
  }

  /**
   * 流式对话
   */
  async *chatStream(messages: ChatMessage[]): AsyncGenerator<string> {
    try {
      const stream = await this.client.chat.completions.create({
        model: this.chatModel,
        messages: messages as any,
        stream: true
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }
    } catch (error) {
      console.error('Stream Error:', error);
      throw new Error('流式对话失败');
    }
  }

  /**
   * 图片理解对话
   */
  async chatWithImage(imageUrl: string, question: string): Promise<string> {
    const messages: ChatMessage[] = [{
      role: 'user',
      content: [
        { type: 'text', text: question },
        { type: 'image_url', image_url: { url: imageUrl } }
      ]
    }];

    return await this.chat(messages);
  }
}

export default ModelScopeService;
```

### 2. 向量存储服务

**vectorStoreService.ts**
```typescript
import { v4 as uuidv4 } from 'uuid';

export interface VectorDocument {
  id: string;
  content: string;
  embedding: number[];
  metadata: {
    filename: string;
    uploadTime: number;
    chunkIndex: number;
    [key: string]: any;
  };
}

export class VectorStoreService {
  private documents: Map<string, VectorDocument> = new Map();

  /**
   * 添加文档
   */
  addDocument(content: string, embedding: number[], metadata: any): string {
    const doc: VectorDocument = {
      id: uuidv4(),
      content,
      embedding,
      metadata: {
        ...metadata,
        uploadTime: Date.now()
      }
    };

    this.documents.set(doc.id, doc);
    return doc.id;
  }

  /**
   * 批量添加文档
   */
  addDocumentsBatch(items: Array<{ content: string; embedding: number[]; metadata: any }>): string[] {
    return items.map(item => this.addDocument(item.content, item.embedding, item.metadata));
  }

  /**
   * 计算余弦相似度
   */
  private cosineSimilarity(vec1: number[], vec2: number[]): number {
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  /**
   * 向量检索
   */
  search(queryEmbedding: number[], topK: number = 5, threshold: number = 0.6): Array<{
    doc: VectorDocument;
    score: number;
  }> {
    const results: Array<{ doc: VectorDocument; score: number }> = [];

    for (const doc of this.documents.values()) {
      const score = this.cosineSimilarity(queryEmbedding, doc.embedding);

      if (score >= threshold) {
        results.push({ doc, score });
      }
    }

    // 按相似度降序排序
    results.sort((a, b) => b.score - a.score);

    // 返回Top-K
    return results.slice(0, topK);
  }

  /**
   * 获取所有文档
   */
  getAllDocuments(): VectorDocument[] {
    return Array.from(this.documents.values());
  }

  /**
   * 删除文档
   */
  deleteDocument(id: string): boolean {
    return this.documents.delete(id);
  }

  /**
   * 清空所有文档
   */
  clearAll(): void {
    this.documents.clear();
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      totalDocuments: this.documents.size,
      filenames: [...new Set(Array.from(this.documents.values()).map(d => d.metadata.filename))]
    };
  }
}

export default new VectorStoreService();
```

### 3. RAG检索服务

**ragService.ts**
```typescript
import ModelScopeService from './modelscopeService';
import vectorStoreService from './vectorStoreService';

export interface RetrievalResult {
  content: string;
  score: number;
  metadata: any;
}

export class RAGService {
  private modelScopeService: ModelScopeService | null = null;

  setModelScopeService(service: ModelScopeService) {
    this.modelScopeService = service;
  }

  /**
   * 检索相关文档
   */
  async retrieveDocuments(
    query: string,
    topK: number = 5,
    threshold: number = 0.6
  ): Promise<RetrievalResult[]> {
    if (!this.modelScopeService) {
      throw new Error('ModelScope service not initialized');
    }

    // 1. 将查询向量化
    const queryEmbedding = await this.modelScopeService.generateEmbedding(query);

    // 2. 向量检索
    const searchResults = vectorStoreService.search(queryEmbedding, topK, threshold);

    // 3. 格式化结果
    return searchResults.map(result => ({
      content: result.doc.content,
      score: result.score,
      metadata: result.doc.metadata
    }));
  }

  /**
   * 构建增强上下文
   */
  async buildRAGContext(query: string): Promise<string> {
    const docs = await this.retrieveDocuments(query, 5, 0.5);

    if (docs.length === 0) {
      return '';
    }

    let context = '参考知识库内容：\n\n';
    docs.forEach((doc, index) => {
      context += `[${index + 1}] ${doc.content}\n`;
      context += `(相似度: ${(doc.score * 100).toFixed(1)}% | 来源: ${doc.metadata.filename})\n\n`;
    });

    return context;
  }

  /**
   * 添加文档到知识库
   */
  async addDocumentsToKnowledge(
    items: Array<{ content: string; metadata: any }>,
    apiKey: string
  ): Promise<void> {
    if (!this.modelScopeService) {
      this.modelScopeService = new ModelScopeService(apiKey);
    }

    // 批量生成向量
    const texts = items.map(item => item.content);
    const embeddings = await this.modelScopeService.generateEmbeddingsBatch(texts);

    // 添加到向量存储
    const docs = items.map((item, index) => ({
      content: item.content,
      embedding: embeddings[index],
      metadata: item.metadata
    }));

    vectorStoreService.addDocumentsBatch(docs);
  }

  /**
   * 获取知识库统计
   */
  getKnowledgeStats() {
    return vectorStoreService.getStats();
  }

  /**
   * 清空知识库
   */
  clearKnowledge() {
    vectorStoreService.clearAll();
  }
}

export default new RAGService();
```

### 4. 文件解析服务

**fileParserService.ts**
```typescript
import fs from 'fs';
import pdf from 'pdf-parse';
import { marked } from 'marked';

export interface ParsedContent {
  text: string;
  chunks: string[];
  metadata: {
    filename: string;
    fileType: string;
    chunkCount: number;
  };
}

export class FileParserService {
  /**
   * 解析文件
   */
  async parseFile(filePath: string, filename: string): Promise<ParsedContent> {
    const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
    let text = '';

    switch (ext) {
      case '.txt':
        text = await this.parseTxt(filePath);
        break;
      case '.md':
        text = await this.parseMarkdown(filePath);
        break;
      case '.pdf':
        text = await this.parsePdf(filePath);
        break;
      case '.json':
        text = await this.parseJson(filePath);
        break;
      default:
        throw new Error(`不支持的文件格式: ${ext}`);
    }

    // 分块处理
    const chunks = this.chunkText(text, 500);

    return {
      text,
      chunks,
      metadata: {
        filename,
        fileType: ext,
        chunkCount: chunks.length
      }
    };
  }

  /**
   * 解析TXT文件
   */
  private async parseTxt(filePath: string): Promise<string> {
    return fs.promises.readFile(filePath, 'utf-8');
  }

  /**
   * 解析Markdown文件
   */
  private async parseMarkdown(filePath: string): Promise<string> {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    // Markdown转纯文本
    return content;
  }

  /**
   * 解析PDF文件
   */
  private async parsePdf(filePath: string): Promise<string> {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  }

  /**
   * 解析JSON文件
   */
  private async parseJson(filePath: string): Promise<string> {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const jsonData = JSON.parse(content);
    return JSON.stringify(jsonData, null, 2);
  }

  /**
   * 文本分块（按段落和长度）
   */
  private chunkText(text: string, maxChunkSize: number): string[] {
    // 按段落分割
    const paragraphs = text.split(/\n\n+/);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const paragraph of paragraphs) {
      if ((currentChunk + paragraph).length > maxChunkSize && currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = paragraph;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }
}

export default new FileParserService();
```

---

## 魔搭AI模型连接实现

### 概述

项目使用魔搭社区（ModelScope）的两个AI模型：
- **Qwen3-Embedding-8B**：用于文本向量化（RAG检索）
- **Qwen3-VL-235B-A22B-Instruct**：用于对话生成（多模态支持）

通过OpenAI兼容API接入，使用`openai` npm包进行连接。

### 核心服务封装

**文件位置**: `src/server/services/modelscopeService.ts`

```typescript
import OpenAI from 'openai';
import type { ChatMessage } from '../../shared/types/index.js';

export interface ChatStreamOptions {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
}

export class ModelScopeService {
  private client: OpenAI;
  private embeddingModel: string;
  private chatModel: string;

  constructor(apiKey: string) {
    // 使用 OpenAI 兼容 API 连接魔搭社区
    this.client = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://api-inference.modelscope.cn/v1'
    });
    this.embeddingModel = 'Qwen/Qwen3-Embedding-8B';
    this.chatModel = 'Qwen/Qwen3-VL-235B-A22B-Instruct';
  }

  /**
   * 生成文本向量（使用 Qwen3-Embedding-8B）
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.client.embeddings.create({
        model: this.embeddingModel,
        input: text,
        encoding_format: 'float'
      });

      return Array.from(response.data[0].embedding);
    } catch (error: any) {
      console.error('[ModelScope] Embedding Error:', error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error.message || '向量化失败');
      }
      throw error;
    }
  }

  /**
   * 批量生成向量
   */
  async generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];
    for (const text of texts) {
      const embedding = await this.generateEmbedding(text);
      embeddings.push(embedding);
    }
    return embeddings;
  }

  /**
   * 普通对话（使用 Qwen3-VL-235B-A22B-Instruct）
   */
  async chat(messages: ChatMessage[]): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.chatModel,
        messages: messages as any,
        stream: false
      });

      return response.choices[0].message.content || '';
    } catch (error) {
      console.error('[ModelScope] Chat Error:', error);
      throw new Error('对话生成失败');
    }
  }

  /**
   * 流式对话
   */
  async *chatStream(messages: ChatMessage[]): AsyncGenerator<string> {
    try {
      const stream = await this.client.chat.completions.create({
        model: this.chatModel,
        messages: messages as any,
        stream: true
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }
    } catch (error) {
      console.error('[ModelScope] Stream Error:', error);
      throw new Error('流式对话失败');
    }
  }

  /**
   * 图片理解对话（多模态）
   */
  async chatWithImage(imageUrl: string, question: string): Promise<string> {
    const messages: ChatMessage[] = [{
      role: 'user',
      content: [
        { type: 'text', text: question },
        { type: 'image_url', image_url: { url: imageUrl } }
      ]
    }];

    return await this.chat(messages);
  }
}

export default ModelScopeService;
```

### RAG检索服务集成

**文件位置**: `src/server/services/ragService.ts`

```typescript
import ModelScopeService from './modelscopeService.js';
import vectorStoreService from './vectorStoreService.js';
import type { VectorSearchResult } from '../../shared/types/index.js';

export class RAGService {
  private modelScopeService: ModelScopeService | null = null;

  setModelScopeService(service: ModelScopeService) {
    this.modelScopeService = service;
  }

  /**
   * 检索相关文档
   */
  async retrieveDocuments(
    query: string,
    topK: number = 5,
    threshold: number = 0.6
  ): Promise<VectorSearchResult[]> {
    if (!this.modelScopeService) {
      throw new Error('ModelScope service not initialized');
    }

    // 1. 将查询向量化
    const queryEmbedding = await this.modelScopeService.generateEmbedding(query);

    // 2. 向量检索
    return vectorStoreService.search(queryEmbedding, topK, threshold);
  }

  /**
   * 添加文档到知识库
   */
  async addDocumentsToKnowledge(
    items: Array<{ content: string; metadata: any }>,
    apiKey: string
  ): Promise<void> {
    if (!this.modelScopeService) {
      this.modelScopeService = new ModelScopeService(apiKey);
    }

    // 批量生成向量
    const texts = items.map(item => item.content);
    const embeddings = await this.modelScopeService.generateEmbeddingsBatch(texts);

    // 添加到向量存储
    const docs = items.map((item, index) => ({
      content: item.content,
      embedding: embeddings[index],
      metadata: item.metadata
    }));

    vectorStoreService.addDocumentsBatch(docs);
  }

  /**
   * 删除指定文件的知识
   */
  deleteKnowledge(filename: string): number {
    return vectorStoreService.deleteByFilename(filename);
  }
}

export default new RAGService();
```

### 对话服务整合

**文件位置**: `src/server/services/chatService.ts`

```typescript
import type { ChatMessage } from '../../shared/types/index.js';
import type { VectorSearchResult } from '../../shared/types/index.js';
import ragService from './ragService.js';
import ModelScopeService from './modelscopeService.js';

export interface ChatRequest {
  message: string;
  conversationHistory?: Array<{ role: string; content: string | any[] }>;
  modelscopeApiKey: string;
  enableRAG?: boolean;
}

export class ChatService {
  private systemPrompt = `你是一个专业的城市展厅讲解员，名为"城市讲解员"。

你的职责：
1. 向参观者生动讲解城市的历史文化、发展成就和未来规划
2. 根据提供的知识库内容回答问题
3. 保持专业、友好、热情的态度
4. 回答要简洁明了，富有感染力

重要原则：
- 优先使用提供的知识库内容回答
- 如果知识库中没有相关信息，可以基于通用知识回答
- 不确定的情况下明确说明
- 保持讲解的连贯性和吸引力

请用生动有趣的语言进行讲解，让参观者留下深刻印象。`;

  /**
   * 流式处理对话（带RAG）
   */
  async *processChatStream(request: ChatRequest): AsyncGenerator<string | VectorSearchResult[]> {
    const { message, conversationHistory = [], modelscopeApiKey, enableRAG = true } = request;

    // 初始化AI服务
    const aiService = new ModelScopeService(modelscopeApiKey);
    ragService.setModelScopeService(aiService);

    // 1. 如果启用RAG，检索相关知识
    let sources: VectorSearchResult[] = [];
    if (enableRAG) {
      console.log('[ChatService] 开始RAG检索，问题:', message);
      sources = await ragService.retrieveDocuments(message, 5, 0.5);
      console.log('[ChatService] 检索到知识库引用数量:', sources.length);
    }

    // 2. 构建消息列表
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: this.systemPrompt }
    ];

    // 3. 如果有检索结果，添加到上下文
    if (sources.length > 0) {
      let ragContext = '\n\n参考知识库内容：\n\n';
      sources.forEach((doc, index) => {
        ragContext += `[${index + 1}] ${doc.content}\n`;
        ragContext += `(相似度: ${(doc.score * 100).toFixed(1)}% | 来源: ${doc.metadata.filename})\n\n`;
      });
      messages[0].content += ragContext;
    }

    // 4. 添加对话历史
    messages.push(...conversationHistory as any);

    // 5. 添加当前问题
    messages.push({ role: 'user', content: message });

    // 6. 先返回知识库引用
    if (sources.length > 0) {
      yield sources;
    }

    // 7. 流式生成回复
    const stream = aiService.chatStream(messages);

    for await (const chunk of stream) {
      yield chunk;
    }
  }

  /**
   * 图片理解对话
   */
  async chatWithImage(imageUrl: string, question: string, apiKey: string): Promise<string> {
    const aiService = new ModelScopeService(apiKey);
    return await aiService.chatWithImage(imageUrl, question);
  }
}

export default new ChatService();
```

### 两个模型的协作流程

```
用户提问
    │
    ▼
┌─────────────────────────────────────────┐
│  Qwen3-Embedding-8B                     │
│  (将问题向量化)                          │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  向量相似度检索                          │
│  (从知识库召回相关片段)                  │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Qwen3-VL-235B-A22B-Instruct           │
│  (基于检索结果生成回答)                  │
└─────────────────────────────────────────┘
```

### 关键配置

| 配置项 | 值 |
|-------|-----|
| Base URL | `https://api-inference.modelscope.cn/v1` |
| Embedding模型 | `Qwen/Qwen3-Embedding-8B` |
| Chat模型 | `Qwen/Qwen3-VL-235B-A22B-Instruct` |
| SDK | `openai` (兼容库) |

---

## 数字人流式说话与富文本输出

### 概述

本项目实现了**数字人实时说话**与**AI富文本流式输出**的并行处理，确保：
1. AI回答逐字流式显示，带有打字机效果
2. 数字人实时同步讲解，智能分段说话
3. 富文本格式支持（粗体等）

### 整体架构流程

```
用户输入 → 后端AI流式生成 → 前端SSE接收 → [UI渲染 + 数字人说话并行]
```

### 1. 数字人流式说话控制器

**文件位置**: `src/client/components/Avatar/AvatarController.ts`

```typescript
export type AvatarState =
  | 'offline'
  | 'online'
  | 'idle'
  | 'interactive_idle'
  | 'listen'
  | 'think'
  | 'speak';

export interface SpeakOptions {
  text: string;
  isStart?: boolean;
  isEnd?: boolean;
}

export class AvatarController {
  private sdk: any = null;
  private config: AvatarConfig;
  private isOnline: boolean = false;

  /**
   * 流式说话 - 实时逐段说话
   * @param text 文本片段
   * @param isStart 是否开始标记
   * @param isEnd 是否结束标记
   */
  speakStream(text: string, isStart: boolean = false, isEnd: boolean = false): void {
    if (!this.checkOnline()) return;
    // 调用SDK的speak方法
    this.sdk?.speak(text, isStart, isEnd);
  }

  /**
   * 结束流式说话
   */
  endStream(): void {
    if (!this.checkOnline()) return;
    // 发送空内容标记结束
    this.speak({ text: '', isStart: false, isEnd: true });
  }

  /**
   * 检查SDK是否在线
   */
  private checkOnline(): boolean {
    if (!this.sdk) {
      console.error('[Avatar] SDK not initialized');
      return false;
    }
    if (!this.isOnline) {
      console.warn('[Avatar] SDK is not online yet, ignoring command');
      return false;
    }
    return true;
  }
}

export default AvatarController;
```

### 2. 前端SSE流式请求服务

**文件位置**: `src/client/services/chatService.ts`

```typescript
import axios from 'axios';

const API_BASE = '/api';

export interface ChatRequest {
  message: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  modelscopeApiKey: string;
  enableRAG?: boolean;
}

/**
 * 流式发送对话消息（SSE）
 */
export async function sendMessageStream(
  request: ChatRequest,
  onChunk: (chunk: string) => void,      // 每收到一个文本块触发
  onComplete: (sources?: any[]) => void,  // 完成时触发
  onError: (error: string) => void        // 错误时触发
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法读取响应流');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let sources: any[] = [];

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        onComplete(sources.length > 0 ? sources : undefined);
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim() && line.startsWith('data: ')) {
          const data = line.slice(6);
          try {
            const parsed = JSON.parse(data);

            if (parsed.type === 'content') {
              onChunk(parsed.data);
            } else if (parsed.type === 'sources') {
              sources = parsed.data;
            } else if (parsed.type === 'end') {
              onComplete(sources.length > 0 ? sources : undefined);
              return;
            } else if (parsed.type === 'error') {
              onError(parsed.data);
              return;
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }
  } catch (error: any) {
    onError(error.message || '流式请求失败');
  }
}

export default {
  sendMessageStream,
  chatWithImage
};
```

### 3. 聊天状态管理（Zustand）

**文件位置**: `src/client/store/chatStore.ts`

```typescript
import { create } from 'zustand';
import type { Message } from '../types/index.js';

interface ChatState {
  messages: Message[];        // 历史消息
  currentResponse: string;    // 当前流式响应（累积）
  currentSources: any[];      // 当前知识库引用
  isProcessing: boolean;

  appendCurrentResponse: (text: string) => void;  // 追加文本块
  setCurrentResponse: (response: string) => void; // 设置响应
  setCurrentSources: (sources: any[]) => void;
  addMessage: (message: Message) => void;
  setProcessing: (processing: boolean) => void;
  clearMessages: () => void;
  getConversationHistory: () => Array<{ role: string; content: string }>;
}

export const useChatStore = create<ChatState>()((set, get) => ({
  messages: [],
  isProcessing: false,
  currentResponse: '',
  currentSources: [],

  // 追加流式文本块
  appendCurrentResponse: (text) =>
    set((state) => ({
      currentResponse: state.currentResponse + text
    })),

  setCurrentResponse: (response) =>
    set({ currentResponse: response }),

  setCurrentSources: (sources) =>
    set({ currentSources: sources }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message]
    })),

  setProcessing: (processing) =>
    set({ isProcessing: processing }),

  clearMessages: () =>
    set({ messages: [], currentResponse: '', currentSources: [] }),

  getConversationHistory: () => {
    return get().messages.map(m => ({
      role: m.role,
      content: m.content
    }));
  }
}));
```

### 4. 富文本消息展示组件

**文件位置**: `src/client/components/Chat/MessageList.tsx`

```typescript
import React from 'react';
import type { Message } from '../../store/chatStore';
import { KnowledgeSources } from './KnowledgeSources';

interface MessageListProps {
  messages: Message[];
  currentResponse: string;
  isProcessing: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentResponse,
  isProcessing
}) => {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentResponse]);

  /**
   * 富文本格式化 - 支持**粗体**等标记
   */
  const formatContent = (content: string) => {
    return content
      .split('\n')
      .map((line, i) => {
        // 将 **文本** 转换为 <strong>标签
        line = line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        return (
          <p key={i} dangerouslySetInnerHTML={{ __html: line || '&nbsp;' }} />
        );
      });
  };

  return (
    <div className="h-full p-6 space-y-4 custom-scrollbar overflow-y-auto">
      {/* 历史消息 */}
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div className={`flex flex-col max-w-[85%]`}>
            <div className={`flex items-end space-x-4`}>
              {/* 头像 */}
              {message.role === 'assistant' ? (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-400 flex-shrink-0 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  🤖
                </div>
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex-shrink-0 flex items-center justify-center text-white text-xl border border-white/30">
                  👤
                </div>
              )}

              {/* 消息气泡 */}
              <div className={`px-6 py-4 message-bubble ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-3xl rounded-br-lg shadow-lg'
                  : 'bg-white/10 backdrop-blur-sm text-white rounded-3xl rounded-bl-lg border border-white/20'
              }`}>
                <div className="text-lg leading-relaxed whitespace-pre-wrap">
                  {formatContent(message.content)}
                </div>
              </div>
            </div>

            {/* 知识库引用 */}
            {message.sources && message.sources.length > 0 && (
              <KnowledgeSources sources={message.sources} />
            )}
          </div>
        </div>
      ))}

      {/* 当前流式响应 + 打字机光标动画 */}
      {currentResponse && (
        <div className="flex justify-start">
          <div className="flex space-x-4 max-w-[80%]">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-400 flex-shrink-0 flex items-center justify-center text-white text-xl font-bold shadow-lg">
              🤖
            </div>
            <div className="px-6 py-4 bg-white/10 backdrop-blur-sm text-white rounded-3xl rounded-bl-lg border border-white/20">
              <div className="text-lg leading-relaxed whitespace-pre-wrap">
                {formatContent(currentResponse)}
                {/* 闪烁光标 */}
                <span className="inline-block w-1 h-5 bg-cyan-400 animate-pulse ml-1 align-middle" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 加载动画 */}
      {isProcessing && !currentResponse && (
        <div className="flex justify-start">
          <div className="flex space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-400 flex-shrink-0 flex items-center justify-center text-white text-xl font-bold shadow-lg">
              🤖
            </div>
            <div className="px-6 py-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
```

### 5. 核心整合逻辑：UI + 数字人并行

**文件位置**: `src/client/App.tsx`（关键部分）

```typescript
import React, { useState } from 'react';
import { useChatStore } from './store/chatStore';
import type { AvatarController } from './components/Avatar/AvatarController';
import chatService from './services/chatService';
import storageService from './services/storageService';

function App() {
  const controllerRef = React.useRef<AvatarController | null>(null);

  const {
    messages,
    addMessage,
    setProcessing,
    currentResponse,
    setCurrentResponse,
    appendCurrentResponse,
    setCurrentSources,
    getConversationHistory,
    isProcessing
  } = useChatStore();

  /**
   * 发送消息 - 核心整合逻辑
   */
  const handleSendMessage = async (text: string) => {
    console.log('[App] handleSendMessage 被调用:', text);

    // 1. 添加用户消息
    addMessage({
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now()
    });

    setProcessing(true);
    setCurrentResponse('');
    setCurrentSources([]);

    const history = getConversationHistory();
    const apiKey = storageService.getModelScopeKey();

    // 流式说话状态追踪
    let isFirstChunk = true;       // 标记是否第一段
    let speakingBuffer = '';        // 数字人说话缓冲区

    try {
      await chatService.sendMessageStream(
        {
          message: text,
          conversationHistory: history,
          modelscopeApiKey: apiKey
        },

        // ==================== onChunk: 每收到文本块 ====================
        (chunk: string) => {
          console.log('[App] 收到流式内容:', chunk);

          // 1. 更新UI显示
          appendCurrentResponse(chunk);

          // 2. 数字人说话 - 智能分段策略
          if (controllerRef.current) {
            speakingBuffer += chunk;

            // 分段条件：
            // - 累积长度 >= 10 字符
            // - 或遇到标点符号
            if (speakingBuffer.length >= 10 || /[。！？，、；：.!?,:;]/.test(chunk)) {
              controllerRef.current.speakStream(
                speakingBuffer,      // 文本片段
                isFirstChunk,        // 首段标记
                false                // 非结束
              );
              speakingBuffer = '';
              isFirstChunk = false;
            }
          }
        },

        // ==================== onComplete: 流式完成 ====================
        (sources?: any[]) => {
          console.log('[App] 流式对话完成');

          // 转换知识库引用格式
          const transformedSources = sources?.map((item: any) => ({
            content: item.content,
            score: item.score,
            filename: item.metadata?.filename || item.filename
          }));

          // 发送剩余内容给数字人
          if (controllerRef.current && speakingBuffer) {
            controllerRef.current.speakStream(speakingBuffer, isFirstChunk, true);
            speakingBuffer = '';
          } else if (controllerRef.current) {
            controllerRef.current.endStream();
          }

          // 保存到历史消息
          const finalResponse = useChatStore.getState().currentResponse;
          addMessage({
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: finalResponse,
            timestamp: Date.now(),
            sources: transformedSources
          });

          setCurrentResponse('');
          setCurrentSources([]);
          setProcessing(false);
        },

        // ==================== onError: 错误处理 ====================
        (error: string) => {
          console.error('[App] 流式对话错误:', error);
          addMessage({
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `抱歉，我遇到了一些问题：${error}`,
            timestamp: Date.now()
          });
          setCurrentResponse('');
          setCurrentSources([]);
          setProcessing(false);
        }
      );
    } catch (error: any) {
      console.error('[App] handleSendMessage 异常:', error);
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `发送消息失败：${error.message || '未知错误'}`,
        timestamp: Date.now()
      });
      setProcessing(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* 顶部导航 */}
      <header>...</header>

      {/* 主内容区 */}
      <main className="flex gap-6">
        {/* 左侧：数字人区域 */}
        <div className="w-[45%]">
          <AvatarContainer
            controllerRef={controllerRef}
            onSpeakingStart={() => console.log('开始说话')}
            onSpeakingEnd={() => console.log('结束说话')}
          />
        </div>

        {/* 右侧：对话区域 */}
        <div className="w-[55%] flex flex-col">
          <MessageList
            messages={messages}
            currentResponse={currentResponse}
            isProcessing={isProcessing}
          />
          <ChatInput
            onSend={handleSendMessage}
            disabled={isProcessing}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
```

### 数据流向图

```
┌─────────────────────────────────────────────────────────────┐
│                    handleSendMessage                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              chatService.sendMessageStream                  │
│         (SSE流式接收后端AI响应)                              │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
         ┌────────────┴────────────┐
         │   onChunk 回调          │
         └────────────┬────────────┘
                      │
         ┌────────────┴────────────┐
         │                         │
         ▼                         ▼
┌──────────────────┐    ┌──────────────────┐
│ UI更新           │    │ 数字人说话       │
│ appendCurrent   │    │ speakStream()    │
│ Response(chunk) │    │ 智能分段发送     │
└──────────────────┘    └──────────────────┘
         │                         │
         └────────────┬────────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │   onComplete           │
         │   - 保存消息到历史      │
         │   - 数字人结束流       │
         │   - 清理状态           │
         └────────────────────────┘
```

### 关键技术点总结

| 技术 | 实现方式 |
|------|---------|
| **SSE流式接收** | `fetch` + `ReadableStream` + `TextDecoder` |
| **富文本渲染** | `dangerouslySetInnerHTML` + 正则替换 `**bold**` |
| **打字机效果** | 实时累积 + 光标 `animate-pulse` |
| **数字人流式说话** | 缓冲区积累到标点/长度触发 |
| **并行处理** | UI更新和数字人说话在同一回调中触发 |
| **知识库引用** | `sources` 数据随消息关联展示 |

---

## 知识库管理

### 1. 知识库上传组件

**KnowledgeUploader.tsx**
```typescript
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';

export const KnowledgeUploader: React.FC<{ onUpload: (files: File[]) => void }> = ({ onUpload }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'application/pdf': ['.pdf'],
      'application/json': ['.json']
    },
    multiple: true,
    onDrop: async (acceptedFiles) => {
      setUploading(true);
      setProgress(0);

      try {
        await onUpload(acceptedFiles);
        setProgress(100);
      } catch (error) {
        alert('上传失败: ' + error);
      } finally {
        setUploading(false);
        setProgress(0);
      }
    }
  });

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">上传知识库</h3>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-4xl mb-3">📁</div>
        {isDragActive ? (
          <p className="text-blue-600">释放文件以开始上传...</p>
        ) : (
          <div>
            <p className="text-gray-700 font-medium">拖拽文件到这里，或点击选择</p>
            <p className="text-sm text-gray-500 mt-2">支持 TXT, MD, PDF, JSON 格式</p>
          </div>
        )}
      </div>

      {uploading && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>处理中...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
        <p className="text-sm text-yellow-800">
          💡 提示：上传的文件将被自动分块并向量化，用于智能检索回答。
        </p>
      </div>
    </div>
  );
};
```

### 2. 知识库列表组件

**KnowledgeList.tsx**
```typescript
import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface KnowledgeFile {
  filename: string;
  uploadTime: number;
  chunkCount: number;
}

export const KnowledgeList: React.FC = () => {
  const [files, setFiles] = useState<KnowledgeFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const response = await axios.get('/api/knowledge/list');
      setFiles(response.data.files);
    } catch (error) {
      console.error('加载失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm(`确定要删除 ${filename} 吗？`)) return;

    try {
      await axios.delete('/api/knowledge/file', { data: { filename } });
      setFiles(files.filter(f => f.filename !== filename));
    } catch (error) {
      alert('删除失败');
    }
  };

  const handleClearAll = async () => {
    if (!confirm('确定要清空所有知识库吗？此操作不可恢复！')) return;

    try {
      await axios.delete('/api/knowledge/all');
      setFiles([]);
    } catch (error) {
      alert('清空失败');
    }
  };

  if (loading) {
    return <div className="text-center py-8">加载中...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">知识库文件</h3>
        {files.length > 0 && (
          <button
            onClick={handleClearAll}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
          >
            清空全部
          </button>
        )}
      </div>

      {files.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          还没有上传任何知识库文件
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <div className="font-medium text-gray-800">{file.filename}</div>
                <div className="text-sm text-gray-500">
                  {file.chunkCount} 个片段 · {new Date(file.uploadTime).toLocaleString()}
                </div>
              </div>
              <button
                onClick={() => handleDelete(file.filename)}
                className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm"
              >
                删除
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <div className="text-sm text-blue-800">
          <strong>向量检索说明：</strong>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>上传的文件会自动分块并向量化</li>
            <li>用户提问时会检索最相关的知识片段</li>
            <li>检索结果会融入AI回答中</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
```

---

## 向量检索系统

### 1. 对话服务集成RAG

**chatService.ts（后端）**
```typescript
import ModelScopeService from './modelscopeService';
import ragService from './ragService';

export interface ChatRequest {
  message: string;
  conversationHistory?: Array<{ role: string; content: string | any[] }>;
  modelscopeApiKey: string;
  enableRAG?: boolean;
}

export class ChatService {
  private systemPrompt = `你是一个专业的城市展厅讲解员，名为"城市讲解员"。

你的职责：
1. 向参观者生动讲解城市的历史文化、发展成就和未来规划
2. 根据提供的知识库内容回答问题
3. 保持专业、友好、热情的态度
4. 回答要简洁明了，富有感染力

重要原则：
- 优先使用提供的知识库内容回答
- 如果知识库中没有相关信息，可以基于通用知识回答
- 不确定的情况下明确说明
- 保持讲解的连贯性和吸引力

请用生动有趣的语言进行讲解，让参观者留下深刻印象。`;

  /**
   * 流式处理对话（带RAG）
   */
  async *processChatStream(request: ChatRequest): AsyncGenerator<string> {
    const { message, conversationHistory = [], modelscopeApiKey, enableRAG = true } = request;

    // 初始化AI服务
    const aiService = new ModelScopeService(modelscopeApiKey);
    ragService.setModelScopeService(aiService);

    // 1. 构建消息列表
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: this.systemPrompt }
    ];

    // 2. 如果启用RAG，检索相关知识
    if (enableRAG) {
      const ragContext = await ragService.buildRAGContext(message);
      if (ragContext) {
        messages[0].content += `\n\n${ragContext}`;
      }
    }

    // 3. 添加对话历史
    messages.push(...conversationHistory as any);

    // 4. 添加当前问题
    messages.push({ role: 'user', content: message });

    // 5. 流式生成回复
    const stream = aiService.chatStream(messages);

    for await (const chunk of stream) {
      yield chunk;
    }
  }

  /**
   * 图片理解对话
   */
  async chatWithImage(imageUrl: string, question: string, apiKey: string): Promise<string> {
    const aiService = new ModelScopeService(apiKey);
    return await aiService.chatWithImage(imageUrl, question);
  }
}

export default new ChatService();
```

---

## 大屏交互设计

### 大屏布局规范

**设计分辨率：1920x1080（FHD）**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  顶部导航栏 (80px)                                                           │
│  Logo | 标题 | 新对话按钮 | 密钥配置                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────┐  ┌───────────────────────────────────────────┐ │
│  │                         │  │                                           │ │
│  │   数字人展示区           │  │   对话交互区                               │ │
│  │   (50% 宽度)            │  │   (50% 宽度)                              │ │
│  │                         │  │                                           │ │
│  │  ┌───────────────────┐ │  │  ┌──────────────────────────────────────┐ │ │
│  │  │                   │ │  │  │  消息列表 (可滚动)                    │ │ │
│  │  │  3D数字人         │ │  │  │                                      │ │ │
│  │  │                   │ │  │  │  - 用户消息                           │ │ │
│  │  │                   │ │  │  │  - AI回复 (带知识来源)                │ │ │
│  │  └───────────────────┘ │  │  │  - 当前输入状态                       │ │ │
│  │                         │  │  │                                      │ │ │
│  │  [状态指示器]           │  │  └──────────────────────────────────────┘ │ │
│  │  [音量控制]             │  │                                           │ │
│  └─────────────────────────┘  │  ┌──────────────────────────────────────┐ │ │
│                               │  │  快捷提问面板                         │ │ │
│                               │  │  [城市历史] [未来规划] [文化景点]     │ │ │
│                               │  └──────────────────────────────────────┘ │ │
│                               │                                           │ │
│                               │  ┌──────────────────────────────────────┐ │ │
│                               │  │  输入区域                             │ │ │
│                               │  │  [输入框] [语音] [发送]               │ │ │
│                               │  └──────────────────────────────────────┘ │ │
│                               └───────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 大屏样式规范

```css
/* 大屏基础样式 */
:root {
  /* 字体大小 - 大屏适配 */
  --font-size-base: 18px;
  --font-size-lg: 20px;
  --font-size-xl: 24px;
  --font-size-2xl: 32px;

  /* 间距 */
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* 触控区域最小尺寸 */
  --touch-target-min: 48px;
}

/* 触控优化 */
.touch-button {
  min-height: var(--touch-target-min);
  min-width: var(--touch-target-min);
  padding: 12px 24px;
}

/* 大屏输入框 */
.lg-input {
  font-size: var(--font-size-lg);
  padding: 16px 20px;
  min-height: 56px;
}

/* 消息气泡 */
.message-bubble {
  font-size: var(--font-size-base);
  padding: 16px 20px;
  max-width: 70%;
}
```

### 触控交互规范

| 交互元素 | 最小尺寸 | 间距 | 反馈 |
|---------|---------|------|------|
| 按钮 | 48x48px | 8px | 视觉+触觉 |
| 输入框 | 高度56px | 16px | 聚焦边框 |
| 列表项 | 高度64px | 0px | 点击高亮 |
| 快捷操作 | 64x64px | 16px | 点击缩放 |

---

## Widget展示功能

### Widget事件处理

SDK支持通过Widget事件展示图片和视频内容。当AI回答中包含特定标记时，触发Widget展示。

**AvatarController.ts - Widget处理**
```typescript
export class AvatarController {
  // ... 其他代码

  /**
   * 处理图片Widget
   */
  private handleImageWidget(data: any): void {
    // 触发自定义事件，让React组件监听
    window.dispatchEvent(new CustomEvent('avatar:image-widget', {
      detail: {
        url: data.url,
        title: data.title,
        description: data.description
      }
    }));
  }

  /**
   * 处理轮播图Widget
   */
  private handleSlideshowWidget(data: any): void {
    window.dispatchEvent(new CustomEvent('avatar:slideshow-widget', {
      detail: {
        images: data.images,
        autoplay: data.autoplay || false,
        interval: data.interval || 3000
      }
    }));
  }

  /**
   * 处理视频Widget
   */
  private handleVideoWidget(data: any): void {
    window.dispatchEvent(new CustomEvent('avatar:video-widget', {
      detail: {
        url: data.url,
        poster: data.poster,
        autoplay: data.autoplay || true
      }
    }));
  }
}
```

### 图片Widget组件

**ImageWidget.tsx**
```typescript
import React, { useEffect, useState } from 'react';

interface WidgetData {
  url: string;
  title?: string;
  description?: string;
}

export const ImageWidget: React.FC = () => {
  const [widget, setWidget] = useState<WidgetData | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (event: CustomEvent<WidgetData>) => {
      setWidget(event.detail);
      setVisible(true);

      // 5秒后自动关闭
      setTimeout(() => {
        setVisible(false);
      }, 5000);
    };

    window.addEventListener('avatar:image-widget', handler as EventListener);
    return () => {
      window.removeEventListener('avatar:image-widget', handler as EventListener);
    };
  }, []);

  if (!visible || !widget) return null;

  return (
    <div className="fixed top-1/2 right-8 transform -translate-y-1/2 bg-white rounded-xl shadow-2xl p-4 max-w-md animate-fade-in">
      <img src={widget.url} alt={widget.title} className="w-full rounded-lg" />
      {widget.title && (
        <h3 className="text-lg font-semibold mt-3">{widget.title}</h3>
      )}
      {widget.description && (
        <p className="text-sm text-gray-600 mt-1">{widget.description}</p>
      )}
    </div>
  );
};
```

### 视频Widget组件

**VideoWidget.tsx**
```typescript
import React, { useEffect, useState } from 'react';

interface VideoWidgetData {
  url: string;
  poster?: string;
  autoplay?: boolean;
}

export const VideoWidget: React.FC = () => {
  const [widget, setWidget] = useState<VideoWidgetData | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (event: CustomEvent<VideoWidgetData>) => {
      setWidget(event.detail);
      setVisible(true);
    };

    window.addEventListener('avatar:video-widget', handler as EventListener);
    return () => {
      window.removeEventListener('avatar:video-widget', handler as EventListener);
    };
  }, []);

  const handleClose = () => {
    setVisible(false);
  };

  if (!visible || !widget) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-4 max-w-3xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">视频展示</h3>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        <video
          src={widget.url}
          poster={widget.poster}
          autoPlay={widget.autoplay}
          controls
          className="w-full rounded-lg"
        />
      </div>
    </div>
  );
};
```

---

## 密钥管理

### 内置测试密钥说明

**测试密钥信息**
```typescript
// 魔搭社区测试密钥
const TEST_MODELSCOPE_KEY = 'ms-de3c153b-5a19-41d1-bd3e-257a7eef7922';

/**
 * 测试密钥使用说明
 *
 * 1. 此密钥为项目内置测试密钥，供快速体验和演示使用
 * 2. 测试密钥可能有以下限制：
 *    - 请求频率限制 (QPS)
 *    - 每日Token使用限额
 *    - 可能随时失效
 * 3. 生产环境请使用您自己的魔搭社区API密钥
 * 4. 获取密钥：https://modelscope.cn/my/myaccesstoken
 */
```

### 密钥存储服务

**storageService.ts**
```typescript
const STORAGE_KEYS = {
  MODELSCOPE_API_KEY: 'city_guide_modelscope_key',
  AVATAR_APP_ID: 'city_guide_avatar_app_id',
  AVATAR_SECRET: 'city_guide_avatar_secret',
  USE_TEST_KEY: 'city_guide_use_test_key'
};

// 内置测试密钥
export const TEST_KEYS = {
  modelscope: 'ms-de3c153b-5a19-41d1-bd3e-257a7eef7922',
  avatarAppId: '', // 需要用户提供
  avatarSecret: '' // 需要用户提供
};

export class StorageService {
  /**
   * 获取魔搭API密钥
   */
  getModelScopeKey(): string {
    const useTest = localStorage.getItem(STORAGE_KEYS.USE_TEST_KEY);
    if (useTest === 'true') {
      return TEST_KEYS.modelscope;
    }
    return localStorage.getItem(STORAGE_KEYS.MODELSCOPE_API_KEY) || TEST_KEYS.modelscope;
  }

  /**
   * 保存魔搭API密钥
   */
  setModelScopeKey(key: string): void {
    localStorage.setItem(STORAGE_KEYS.MODELSCOPE_API_KEY, key);
    localStorage.setItem(STORAGE_KEYS.USE_TEST_KEY, 'false');
  }

  /**
   * 获取数字人密钥
   */
  getAvatarKeys(): { appId: string; secret: string } {
    return {
      appId: localStorage.getItem(STORAGE_KEYS.AVATAR_APP_ID) || '',
      secret: localStorage.getItem(STORAGE_KEYS.AVATAR_SECRET) || ''
    };
  }

  /**
   * 保存数字人密钥
   */
  setAvatarKeys(appId: string, secret: string): void {
    localStorage.setItem(STORAGE_KEYS.AVATAR_APP_ID, appId);
    localStorage.setItem(STORAGE_KEYS.AVATAR_SECRET, secret);
  }

  /**
   * 使用测试密钥
   */
  useTestKey(): void {
    localStorage.setItem(STORAGE_KEYS.USE_TEST_KEY, 'true');
  }

  /**
   * 清除所有密钥
   */
  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

export default new StorageService();
```

---

## 错误处理机制

### 错误类型和处理策略

| 错误类型 | 错误码 | 处理策略 |
|---------|--------|---------|
| API密钥无效 | INVALID_API_KEY | 提示用户重新输入密钥 |
| 网络超时 | NETWORK_TIMEOUT | 自动重试3次，间隔递增 |
| 请求限流 | RATE_LIMIT | 等待后重试，提示用户降低频率 |
| 文件过大 | FILE_TOO_LARGE | 提示文件大小限制 |
| 格式不支持 | UNSUPPORTED_FORMAT | 显示支持的格式列表 |
| 向量化失败 | EMBEDDING_ERROR | 记录日志，回退到普通对话 |
| 数字人连接失败 | AVATAR_CONNECTION_ERROR | 显示离线模式选项 |
| SDK初始化失败 | SDK_INIT_ERROR | 提示刷新页面或检查网络 |

### 错误中间件

**error.middleware.ts**
```typescript
import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('[Error]', err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message
    });
  }

  // 未知错误
  res.status(500).json({
    success: false,
    code: 'INTERNAL_ERROR',
    message: '服务器内部错误，请稍后重试'
  });
};

/**
 * 异步路由包装器
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
```

### 前端错误处理

**errorHandler.tsx**
```typescript
import React, { createContext, useContext, useState } from 'react';

interface ErrorContextType {
  error: string | null;
  showError: (message: string) => void;
  clearError: () => void;
}

const ErrorContext = createContext<ErrorContextType | null>(null);

export const ErrorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [error, setError] = useState<string | null>(null);

  const showError = (message: string) => {
    setError(message);
    // 5秒后自动清除
    setTimeout(() => setError(null), 5000);
  };

  const clearError = () => setError(null);

  return (
    <ErrorContext.Provider value={{ error, showError, clearError }}>
      {children}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg animate-slide-in">
          <div className="flex items-center space-x-3">
            <span>⚠️</span>
            <p>{error}</p>
            <button onClick={clearError} className="ml-4 hover:opacity-80">✕</button>
          </div>
        </div>
      )}
    </ErrorContext.Provider>
  );
};

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within ErrorProvider');
  }
  return context;
};
```

---

## 性能优化建议

### 1. 向量检索优化

| 优化项 | 说明 | 效果 |
|-------|------|------|
| 批量向量化 | 将多个文本合并为一次API调用 | 减少API调用次数 |
| 向量缓存 | 缓存已生成的向量 | 避免重复计算 |
| 索引优化 | 使用专业向量数据库(Pinecone/Milvus) | 提升检索速度 |
| 分块策略 | 按语义边界分块，而非固定长度 | 提升检索准确度 |

### 2. 流式响应优化

| 优化项 | 说明 | 效果 |
|-------|------|------|
| 增量渲染 | 使用React状态增量更新 | 减少重渲染 |
| 虚拟列表 | 长消息列表使用虚拟滚动 | 减少DOM节点 |
| 防抖输入 | 输入框防抖处理 | 减少无效请求 |
| 请求取消 | 组件卸载时取消pending请求 | 避免内存泄漏 |

### 3. 内存管理

| 优化项 | 说明 | 效果 |
|-------|------|------|
| 消息历史限制 | 限制历史消息数量(如最近50条) | 控制内存占用 |
| 图片懒加载 | 图片懒加载+缩略图 | 减少初始加载 |
| 向量存储限制 | 内存存储限制文档数量 | 避免内存溢出 |
| 定期清理 | 定期清理过期缓存 | 释放内存 |

### 4. 网络优化

| 优化项 | 说明 | 效果 |
|-------|------|------|
| CDN加速 | 静态资源使用CDN | 提升加载速度 |
| 请求合并 | 合并多个小请求 | 减少RTT |
| 压缩传输 | 启用gzip/brotli压缩 | 减少传输量 |
| 预连接 | 预连接到API服务器 | 减少连接延迟 |

---

## API接口文档

### 知识库管理接口

#### POST /api/knowledge/upload

上传知识库文件

**请求**
- Content-Type: multipart/form-data
- Body: file (文件)

**响应**
```json
{
  "success": true,
  "filename": "example.pdf",
  "chunks": 15,
  "message": "上传并处理成功"
}
```

#### GET /api/knowledge/list

获取知识库文件列表

**响应**
```json
{
  "success": true,
  "files": [
    {
      "filename": "city_history.pdf",
      "uploadTime": 1704067200000,
      "chunkCount": 25
    }
  ]
}
```

#### DELETE /api/knowledge/file

删除单个知识库文件

**请求体**
```json
{
  "filename": "example.pdf"
}
```

**响应**
```json
{
  "success": true,
  "message": "删除成功"
}
```

#### DELETE /api/knowledge/all

清空所有知识库

**响应**
```json
{
  "success": true,
  "message": "知识库已清空"
}
```

### 对话接口

#### POST /api/chat/stream

流式对话（支持RAG）

**请求体**
```json
{
  "message": "请介绍一下这座城市的历史",
  "conversationHistory": [],
  "modelscopeApiKey": "ms-xxx",
  "enableRAG": true
}
```

**响应流**
```
data: {"type":"start"}

data: {"type":"content","data":"这座"}

data: {"type":"content","data":"城市"}

...

data: {"type":"end"}
```

#### POST /api/chat/image

图片理解对话

**请求体**
```json
{
  "imageUrl": "https://example.com/image.jpg",
  "question": "请描述这幅图片",
  "modelscopeApiKey": "ms-xxx"
}
```

**响应**
```json
{
  "success": true,
  "response": "这是一幅展示城市..."
}
```

---

## 部署说明

### 开发环境启动

```bash
# 1. 安装依赖
npm install

# 2. 启动后端服务（新终端窗口）
npm run dev:server

# 3. 启动前端服务（新终端窗口）
npm run dev:client
```

### 生产环境部署

```bash
# 1. 构建前端
npm run build

# 2. 启动后端
npm run start

# 前端静态文件由后端Express服务托管
```

### 环境要求

| 项目 | 要求 |
|------|------|
| Node.js | 18.x 或更高版本 |
| 浏览器 | Chrome/Edge 90+（支持Web Speech API） |
| 网络 | 需要访问魔珐星云和魔搭社区API |
| 磁盘空间 | 至少500MB（用于上传文件存储） |

---

## 快速开始

### 快速开始流程图

```
┌─────────────────────────────────────────────────────────────────────┐
│                        启动应用                                      │
└───────────────────────┬─────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     密钥配置界面                                     │
│  [使用测试密钥]  [手动输入密钥]                                       │
└───────────────────────┬─────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    连接数字人                                        │
│  点击"连接数字人" → 等待初始化 → 状态变为"在线"                        │
└───────────────────────┬─────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    知识库准备                                        │
│  [使用内置知识库]  [上传自定义知识库]                                  │
└───────────────────────┬─────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    开始讲解                                          │
│  自由提问 | 选择主题 | 上传图片提问                                    │
└─────────────────────────────────────────────────────────────────────┘
```

### 内置主题

系统预设以下讲解主题：

| 主题 | 描述 | 快捷问题示例 |
|------|------|-------------|
| 城市历史 | 介绍城市的历史变迁 | "这座城市有什么历史故事？" |
| 未来规划 | 展示城市发展蓝图 | "这座城市未来有什么规划？" |
| 文化景点 | 推荐著名文化景点 | "有哪些值得游览的景点？" |
| 经济发展 | 介绍经济发展成就 | "这座城市的经济怎么样？" |

### 首次使用步骤

1. **启动应用**
   ```bash
   npm install
   npm run dev
   ```

2. **配置密钥**
   - 首次访问会显示密钥配置界面
   - 可选择"使用测试密钥"快速体验
   - 或手动输入自己的魔搭社区API密钥

3. **连接数字人**
   - 输入数字人App ID和Secret
   - 点击"连接数字人"按钮
   - 等待初始化完成

4. **准备知识库**
   - 系统内置基础城市知识库
   - 可上传自定义知识库文件

5. **开始对话**
   - 点击快捷主题或自由提问
   - 支持文字和图片输入
   - 数字人会同步讲解

---

## 项目特色

1. **智能RAG检索**
   - 基于Qwen3-Embedding-8B的向量化
   - 语义相似度精准匹配
   - 上下文增强回答

2. **多模态支持**
   - 支持图片理解对话
   - 文字+图片混合输入
   - Qwen3-VL大模型驱动

3. **灵活知识库**
   - 支持多种文件格式
   - 自动分块向量化
   - 实时上传生效

4. **大屏优化**
   - 专为展览大屏设计
   - 清晰的字体和按钮
   - 方便触控操作

5. **易于部署**
   - 密钥本地管理
   - 无需外部数据库
   - 支持离线向量存储

---

*文档版本: v1.3 | 最后更新: 2026-01-04*
