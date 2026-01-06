/**
 * 知识库路由
 * 处理文档上传、列表、删除等操作
 */
import { Router, Request, Response } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { FileProcessor } from '../services/fileProcessor.js';
import { ChunkService } from '../services/chunkService.js';
import ragService from '../services/ragService.js';
import vectorStoreService from '../services/vectorStoreService.js';
import ModelScopeService from '../services/modelscopeService.js';

const router = Router();

// 配置文件上传
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}_${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (_req, file, cb) => {
    const allowedExts = ['.txt', '.md', '.pdf', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件格式'));
    }
  },
});

// 内置知识库文件路径
const BUILTIN_KNOWLEDGE_PATH = path.join(process.cwd(), 'src', 'data', 'knowledge');

/**
 * 自动分类文档
 */
function classifyDocument(content: string): 'hr' | 'it' | 'general' {
  const hrKeywords = ['薪资', '社保', '年假', '考勤', '入职', '离职', '绩效', '福利', '招聘', '培训'];
  const itKeywords = ['电脑', '网络', '打印机', 'VPN', '软件', '系统', '故障', '账号', '密码', '硬件'];

  const hrScore = hrKeywords.filter(k => content.includes(k)).length;
  const itScore = itKeywords.filter(k => content.includes(k)).length;

  if (hrScore > itScore) return 'hr';
  if (itScore > hrScore) return 'it';
  return 'general';
}

/**
 * 从内置知识库加载文档（返回 chunks）
 */
async function loadBuiltinKnowledge(): Promise<Array<{ content: string; metadata: any }>> {
  const allChunks: Array<{ content: string; metadata: any }> = [];

  try {
    console.log('[Knowledge] Loading built-in knowledge bases...');

    const files = fs.readdirSync(BUILTIN_KNOWLEDGE_PATH).filter(f => f.endsWith('.json'));

    for (const file of files) {
      const filePath = path.join(BUILTIN_KNOWLEDGE_PATH, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      console.log(`[Knowledge] Loading ${data.name} from ${file}...`);

      let fileChunkCount = 0;

      for (const doc of data.documents) {
        // 按照知识库中指定的 chunkSize 进行分割
        const chunkService = new ChunkService({
          maxChunkSize: doc.chunkSize || 500,
          chunkOverlap: 50,
          minChunkSize: 100,
          splitByParagraph: true,
        });

        const textChunks = chunkService.chunkText(
          doc.content,
          doc.id,
          { fileName: doc.title, fileType: 'json' }
        );

        fileChunkCount += textChunks.length;

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

      console.log(`[Knowledge] Loaded ${fileChunkCount} chunks from ${file}`);
    }

    console.log(`[Knowledge] Total chunks loaded: ${allChunks.length}`);
    return allChunks;
  } catch (error) {
    console.error('[Knowledge] Error loading built-in knowledge:', error);
    return [];
  }
}

// GET /api/knowledge - 获取所有文档列表
router.get('/', (_req: Request, res: Response) => {
  try {
    const stats = vectorStoreService.getStats();
    const documents = vectorStoreService.getAllDocuments();

    // 按文件名分组
    const groupedDocs = new Map<string, {
      filename: string;
      category: 'hr' | 'it' | 'general';
      chunkCount: number;
      uploadTime: number;
      builtin: boolean;
    }>();

    for (const doc of documents) {
      const filename = doc.metadata.filename;
      if (!groupedDocs.has(filename)) {
        groupedDocs.set(filename, {
          filename,
          category: doc.metadata.category || 'general',
          chunkCount: 0,
          uploadTime: doc.metadata.uploadTime,
          builtin: doc.metadata.builtin || false,
        });
      }
      groupedDocs.get(filename)!.chunkCount++;
    }

    const docsList = Array.from(groupedDocs.values()).sort((a, b) => b.uploadTime - a.uploadTime);

    res.json({
      documents: docsList,
      totalChunks: stats.totalDocuments,
      totalVectors: stats.totalDocuments,
      categoryCount: stats.categoryCount,
    });
  } catch (error) {
    console.error('[Knowledge] Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// POST /api/knowledge/upload - 上传文档
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: '没有上传文件' });
  }

  const { apiKey } = req.body;

  if (!apiKey) {
    return res.status(400).json({ error: '缺少 API 密钥' });
  }

  try {
    console.log(`[Knowledge] Processing file: ${req.file.originalname}`);

    // 1. 提取文本
    const fileProcessor = new FileProcessor();
    const text = await fileProcessor.extractText(req.file.path);

    if (!text || text.trim().length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: '文件内容为空' });
    }

    console.log(`[Knowledge] Extracted ${text.length} characters from file`);

    // 2. 文本分块
    const chunkService = new ChunkService({
      maxChunkSize: 500,
      chunkOverlap: 50,
      minChunkSize: 100,
      splitByParagraph: true,
    });

    const chunks = chunkService.chunkText(
      text,
      uuidv4(),
      { fileName: req.file.originalname, fileType: fileProcessor.getFileType(req.file.path) }
    );

    console.log(`[Knowledge] Split into ${chunks.length} chunks`);

    // 3. 自动分类
    const category = classifyDocument(text);

    // 4. 准备向量化的数据
    const items = chunks.map(chunk => ({
      content: chunk.content,
      metadata: {
        filename: req.file.originalname,
        uploadTime: Date.now(),
        chunkIndex: chunk.index,
        category,
        documentId: chunk.documentId,
        builtin: false,
      },
    }));

    // 5. 批量向量化并存储
    await ragService.addDocumentsToKnowledge(items, apiKey);

    // 6. 清理临时文件
    fs.unlinkSync(req.file.path);

    console.log(`[Knowledge] Successfully processed ${req.file.originalname}`);

    res.json({
      documentId: chunks[0]?.documentId,
      fileName: req.file.originalname,
      category,
      chunkCount: chunks.length,
      vectorsGenerated: chunks.length,
    });
  } catch (error) {
    console.error('[Knowledge] Upload error:', error);

    // 清理临时文件
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ error: `文件处理失败: ${(error as Error).message}` });
  }
});

// DELETE /api/knowledge/:filename - 删除文档
router.delete('/:filename', (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const deletedCount = ragService.deleteKnowledge(decodeURIComponent(filename));

    console.log(`[Knowledge] Deleted ${deletedCount} chunks for ${filename}`);

    res.json({ success: true, deletedChunks: deletedCount });
  } catch (error) {
    console.error('[Knowledge] Delete error:', error);
    res.status(500).json({ error: '删除失败' });
  }
});

// POST /api/knowledge/initialize-builtin - 初始化内置知识库
router.post('/initialize-builtin', async (req: Request, res: Response) => {
  try {
    const { apiKey } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: '缺少 API 密钥' });
    }

    // 设置 ModelScope 服务
    const modelScopeService = new ModelScopeService(apiKey);
    ragService.setModelScopeService(modelScopeService);

    // 检查是否已有内置文档
    const stats = vectorStoreService.getStats();
    const allDocs = vectorStoreService.getAllDocuments();
    const hasBuiltin = allDocs.some(doc => doc.metadata.builtin);

    if (hasBuiltin) {
      console.log('[Knowledge] Builtin knowledge already exists, skipping init');
      return res.json({
        success: true,
        message: '内置知识库已存在',
        stats,
      });
    }

    // 加载内置知识库 chunks
    console.log('[Knowledge] Loading builtin knowledge chunks...');
    const chunks = await loadBuiltinKnowledge();

    if (chunks.length === 0) {
      return res.status(500).json({ error: '加载内置知识库失败' });
    }

    // 批量向量化并存储
    console.log(`[Knowledge] Vectorizing ${chunks.length} chunks...`);
    await ragService.addDocumentsToKnowledge(chunks, apiKey);

    const newStats = vectorStoreService.getStats();
    console.log('[Knowledge] Initialization complete:', newStats);

    res.json({
      success: true,
      message: '内置知识库初始化成功',
      stats: newStats,
    });
  } catch (error) {
    console.error('[Knowledge] Initialize builtin error:', error);
    res.status(500).json({ error: `初始化失败: ${(error as Error).message}` });
  }
});

// GET /api/knowledge/stats - 获取知识库统计信息
router.get('/stats', (_req: Request, res: Response) => {
  try {
    const stats = vectorStoreService.getStats();
    res.json(stats);
  } catch (error) {
    console.error('[Knowledge] Stats error:', error);
    res.status(500).json({ error: '获取统计信息失败' });
  }
});

// GET /api/knowledge/:filename/content - 获取文档内容预览
router.get('/:filename/content', (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const documents = vectorStoreService.getAllDocuments();

    // 查找匹配的文档 chunks
    const chunks = documents.filter(doc => doc.metadata.filename === decodeURIComponent(filename));

    if (chunks.length === 0) {
      return res.status(404).json({ error: '文档不存在' });
    }

    // 合并所有内容，按 chunkIndex 排序
    const sortedChunks = chunks.sort((a, b) => (a.metadata.chunkIndex || 0) - (b.metadata.chunkIndex || 0));
    const fullContent = sortedChunks.map(chunk => chunk.content).join('\n\n');

    res.json({
      filename,
      category: chunks[0].metadata.category || 'general',
      title: chunks[0].metadata.title || filename,
      builtin: chunks[0].metadata.builtin || false,
      chunkCount: chunks.length,
      content: fullContent,
      preview: fullContent.slice(0, 500) + (fullContent.length > 500 ? '...' : ''),
    });
  } catch (error) {
    console.error('[Knowledge] Content fetch error:', error);
    res.status(500).json({ error: '获取文档内容失败' });
  }
});

export default router;
