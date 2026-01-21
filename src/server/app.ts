import express, { Request, Response, type Express } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import chatRoutes from './routes/chat.routes';
import knowledgeRoutes from './routes/knowledge.routes';
import ticketRoutes from './routes/ticket.routes';
import validateRoutes from './routes/validate.routes';
import vectorStoreService from './services/vectorStoreService.js';
import ticketService from './services/ticketService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Express = express();
const PORT = process.env.PORT || 5178;
const isDev = process.env.NODE_ENV !== 'production';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve public uploads folder (both dev and prod)
app.use('/uploads', express.static(path.join(__dirname, '../../public/uploads')));

// API Routes (must be before Vite/static serving)
app.use('/api/chat', chatRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/validate-keys', validateRoutes);

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), mode: isDev ? 'development' : 'production' });
});

// Initialize vector store from persistence
async function initializeVectorStore() {
  console.log('[App] Initializing vector store from persistence...');
  vectorStoreService.loadFromPersistence();

  const stats = vectorStoreService.getStats();
  console.log('[App] Vector store stats:', stats);

  // Initialize ticket service
  console.log('[App] Initializing ticket service...');
  ticketService.loadFromStorage();

  // 如果没有数据，自动初始化内置知识库
  if (stats.totalDocuments === 0) {
    console.log('[App] No documents found, auto-initializing builtin knowledge...');
    await autoInitBuiltinKnowledge();
  }
}

// Auto-initialize builtin knowledge on startup
async function autoInitBuiltinKnowledge() {
  try {
    const BUILTIN_KNOWLEDGE_PATH = path.join(process.cwd(), 'src', 'data', 'knowledge');
    const fs = await import('fs');
    const { FileProcessor } = await import('./services/fileProcessor.js');
    const { ChunkService } = await import('./services/chunkService.js');
    const ragService = (await import('./services/ragService.js')).default;

    // 读取内置知识库文件
    const files = fs.readdirSync(BUILTIN_KNOWLEDGE_PATH).filter((f: string) => f.endsWith('.json'));

    if (files.length === 0) {
      console.log('[App] No builtin knowledge files found');
      return;
    }

    console.log(`[App] Found ${files.length} builtin knowledge files`);

    // 收集所有文档块
    const allChunks: Array<{ content: string; metadata: any }> = [];

    for (const file of files) {
      const filePath = path.join(BUILTIN_KNOWLEDGE_PATH, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      console.log(`[App] Loading ${data.name} from ${file}...`);

      for (const doc of data.documents) {
        const chunkService = new ChunkService({
          maxChunkSize: doc.chunkSize || 500,
          chunkOverlap: 50,
          minChunkSize: 100,
          splitByParagraph: true,
        });

        const textChunks = chunkService.chunkText(doc.content, doc.id, {
          fileName: doc.title,
          fileType: 'json'
        });

        for (const chunk of textChunks) {
          allChunks.push({
            content: chunk.content,
            metadata: {
              filename: `${data.name}-${doc.title}`,
              uploadTime: Date.now(),
              chunkIndex: chunk.index,
              category: data.category as 'hr' | 'it' | 'general',
              documentId: doc.id,
              title: doc.title,
              builtin: true,
            },
          });
        }
      }

      console.log(`[App] Loaded ${data.documents.length} documents from ${file}`);
    }

    console.log(`[App] Total chunks to vectorize: ${allChunks.length}`);

    // 使用内置 API 密钥进行向量化
    const ModelScopeService = (await import('./services/modelscopeService.js')).default;
    const apiKey = process.env.MODELSCOPE_API_KEY || 'ms-de3c153b-5a19-41d1-bd3e-257a7eef7922';
    const modelScopeService = new ModelScopeService(apiKey);
    ragService.setModelScopeService(modelScopeService);

    // 批量向量化并存储
    await ragService.addDocumentsToKnowledge(allChunks, apiKey);

    const newStats = vectorStoreService.getStats();
    console.log('[App] Auto-initialization complete:', newStats);
  } catch (error) {
    console.error('[App] Auto-initialization failed:', error);
  }
}

// Setup frontend serving
async function setupFrontend() {
  // 无论是开发还是生产环境，都使用构建后的静态文件
  // 这样可以完全避免 Vite HMR 的问题
  app.use(express.static(path.join(__dirname, '../../dist/public')));

  // SPA fallback: return index.html for all non-API routes
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../../dist/public/index.html'));
  });
}

// Error handler (must be after all routes and middleware)
app.use((err: Error, _req: Request, res: Response, _next: unknown) => {
  console.error('Server error:', err);
  res.status(500).json({ error: err.message });
});

export { app, PORT, setupFrontend, initializeVectorStore };
