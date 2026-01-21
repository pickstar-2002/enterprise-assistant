/**
 * 知识库管理 - 极简设计
 */
import { useEffect, useState, useRef, useCallback } from 'react';
import { useKnowledgeStore } from '../../store/knowledgeStore';
import type { KnowledgeDocument } from '../../services/knowledgeService';

/**
 * 简单的 Markdown 转 HTML
 */
function markdownToHtml(markdown: string): string {
  if (!markdown) return '';

  let html = markdown
    // 转义 HTML 特殊字符
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // 标题
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-slate-800 mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-slate-800 mt-4 mb-2">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-slate-800 mt-4 mb-2">$1</h1>')
    // 粗体
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // 斜体
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // 列表
    .replace(/^\- (.*$)/gim, '<li class="ml-4">• $1</li>')
    // 链接
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank">$1</a>')
    // 换行
    .replace(/\n\n/g, '</p><p class="my-2">')
    .replace(/\n/g, '<br />');

  return `<p class="my-2">${html}</p>`;
}

// 支持的文件格式
const ALLOWED_FORMATS = ['.txt', '.md', '.pdf', '.docx'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// 分类配置
const CATEGORY_CONFIG = {
  hr: { name: 'HR 政策', emoji: '👥', color: 'text-green-600', bg: 'bg-green-50' },
  it: { name: 'IT 支持', emoji: '💻', color: 'text-blue-600', bg: 'bg-blue-50' },
  general: { name: '常见问题', emoji: '❓', color: 'text-purple-600', bg: 'bg-purple-50' },
};

interface DocumentContent {
  filename: string;
  category: 'hr' | 'it' | 'general';
  title: string;
  builtin: boolean;
  chunkCount: number;
  content: string;
}

export function KnowledgeManager() {
  const {
    documents,
    isUploading,
    uploadProgress,
    error,
    fetchDocuments,
    deleteDocument,
    initializeBuiltin,
    uploadFile,
    clearError,
  } = useKnowledgeStore();

  const [showUpload, setShowUpload] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [popoverType, setPopoverType] = useState<'builtin' | 'custom' | null>(null);
  const [lastPopoverType, setLastPopoverType] = useState<'builtin' | 'custom' | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDocument | null>(null);
  const [docContent, setDocContent] = useState<DocumentContent | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);
  const [isIniting, setIsIniting] = useState(false);

  // 首次加载时自动获取知识库列表（后端已从持久化恢复）
  useEffect(() => {
    const autoFetch = async () => {
      if (hasInitialized.current) return;

      setIsIniting(true);
      try {
        // 只获取列表，不自动初始化
        await fetchDocuments();
        console.log('[KnowledgeManager] Fetched documents:', documents.length);
      } catch (err) {
        console.error('Auto-fetch failed:', err);
      } finally {
        setIsIniting(false);
        hasInitialized.current = true;
      }
    };
    autoFetch();
  }, []);

  // 计算统计
  const builtinDocs = documents.filter((d) => d.builtin);
  const customDocs = documents.filter((d) => !d.builtin);

  // 点击外部关闭气泡
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopoverType(null);
        setSelectedDoc(null);
        setDocContent(null);
        setLastPopoverType(null);
      }
    };

    if (popoverType || selectedDoc) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [popoverType, selectedDoc]);

  // 获取文档内容
  const fetchDocumentContent = useCallback(async (doc: KnowledgeDocument) => {
    if (selectedDoc?.filename === doc.filename && docContent) {
      return;
    }

    setLoadingContent(true);
    try {
      const response = await fetch(`/api/knowledge/${encodeURIComponent(doc.filename)}/content`);
      if (!response.ok) throw new Error('获取文档内容失败');
      const data = await response.json();
      setDocContent(data);
    } catch (err) {
      console.error('Failed to fetch document content:', err);
    } finally {
      setLoadingContent(false);
    }
  }, [selectedDoc, docContent]);

  // 处理文档点击
  const handleDocClick = useCallback((doc: KnowledgeDocument) => {
    // 记录是从哪个列表打开的
    setLastPopoverType(popoverType);
    setSelectedDoc(doc);
    setPopoverType(null);
    fetchDocumentContent(doc);
  }, [popoverType, fetchDocumentContent]);

  // 返回文档列表
  const handleBackToList = useCallback(() => {
    setSelectedDoc(null);
    setDocContent(null);
    // 返回到之前的列表
    setPopoverType(lastPopoverType || 'builtin');
  }, [lastPopoverType]);

  // 处理文件上传
  const handleFileSelect = useCallback(
    async (file: File) => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!ALLOWED_FORMATS.includes(ext)) {
        alert(`不支持的文件格式。请上传：${ALLOWED_FORMATS.join(', ')}`);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        alert('文件过大，请上传小于 10MB 的文件');
        return;
      }
      await uploadFile(file);
      setShowUpload(false);
    },
    [uploadFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) handleFileSelect(files[0]);
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) handleFileSelect(files[0]);
    },
    [handleFileSelect]
  );

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* 头部 */}
      <div className="p-4 border-b border-slate-200/50 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="text-2xl">📚</span>
            知识库管理
          </h2>
          <button
            onClick={() => {
              setIsIniting(true);
              initializeBuiltin().finally(() => setIsIniting(false));
            }}
            disabled={isIniting}
            className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all disabled:opacity-50"
          >
            {isIniting ? '刷新中...' : '刷新'}
          </button>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 gap-3">
          {/* 内置文档卡片 */}
          <button
            onClick={() => setPopoverType('builtin')}
            className="bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 rounded-xl p-4 border-2 border-amber-200 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-200 flex items-center justify-center text-2xl">
                📖
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-amber-700">{builtinDocs.length}</p>
                <p className="text-xs text-amber-600 mt-0.5">内置文档</p>
              </div>
            </div>
          </button>

          {/* 自定义文档卡片 */}
          <button
            onClick={() => setPopoverType('custom')}
            className="bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 rounded-xl p-4 border-2 border-emerald-200 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-200 flex items-center justify-center text-2xl">
                📝
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-emerald-700">{customDocs.length}</p>
                <p className="text-xs text-emerald-600 mt-0.5">自定义文档</p>
              </div>
            </div>
          </button>
        </div>

        {/* 上传按钮 */}
        <button
          onClick={() => setShowUpload(!showUpload)}
          disabled={isUploading}
          className="w-full mt-3 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isUploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>处理中...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>上传知识库文档</span>
            </>
          )}
        </button>
      </div>

      {/* 上传区域 */}
      {showUpload && (
        <div className="p-4 border-b border-slate-200/50 bg-white/60">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              relative border-2 border-dashed rounded-xl p-6 text-center transition-all
              ${isDragging
                ? 'border-blue-500 bg-blue-50 scale-[1.02]'
                : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
              }
              ${isUploading ? 'pointer-events-none opacity-60' : 'cursor-pointer'}
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_FORMATS.join(',')}
              onChange={handleFileInput}
              disabled={isUploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />

            <div className="space-y-2">
              <div className="text-3xl">📄</div>
              <p className="text-slate-700 font-medium">
                {isDragging ? '释放文件上传' : '点击或拖拽文件到此处'}
              </p>
              <p className="text-sm text-slate-500">
                支持格式：{ALLOWED_FORMATS.join(', ').toUpperCase()} · 最大 10MB
              </p>
            </div>

            {isUploading && (
              <div className="mt-3">
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-slate-600 mt-1 text-center">{uploadProgress.toFixed(0)}%</p>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-2 flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-red-500">⚠️</span>
              <p className="text-sm text-red-700 flex-1">{error}</p>
              <button onClick={clearError} className="text-red-400 hover:text-red-600">
                ✕
              </button>
            </div>
          )}
        </div>
      )}

      {/* 空白区域 */}
      <div className="flex-1" />

      {/* 文档列表气泡 */}
      {popoverType && !selectedDoc && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
          <div
            ref={popoverRef}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[70vh] flex flex-col overflow-hidden"
          >
            {/* 头部 */}
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                {popoverType === 'builtin' ? (
                  <>
                    <span>📖</span>
                    <span>内置文档 ({builtinDocs.length})</span>
                  </>
                ) : (
                  <>
                    <span>📝</span>
                    <span>自定义文档 ({customDocs.length})</span>
                  </>
                )}
              </h3>
            </div>

            {/* 列表 */}
            <div className="flex-1 overflow-y-auto p-2">
              {(popoverType === 'builtin' ? builtinDocs : customDocs).length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <p className="text-2xl mb-1">📭</p>
                  <p className="text-sm">暂无文档</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {(popoverType === 'builtin' ? builtinDocs : customDocs).map((doc) => (
                    <div
                      key={doc.filename}
                      onClick={() => handleDocClick(doc)}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-all"
                    >
                      <div className={`w-8 h-8 rounded-lg ${CATEGORY_CONFIG[doc.category].bg} flex items-center justify-center text-sm flex-shrink-0`}>
                        {CATEGORY_CONFIG[doc.category].emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{doc.filename}</p>
                        <p className="text-xs text-slate-400">{CATEGORY_CONFIG[doc.category].name}</p>
                      </div>
                      {!doc.builtin && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`确定要删除 "${doc.filename}" 吗？`)) {
                              deleteDocument(doc.filename);
                            }
                          }}
                          className="flex-shrink-0 p-1 text-slate-400 hover:text-red-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 文档内容气泡 */}
      {selectedDoc && docContent && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
          <div
            ref={popoverRef}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden"
          >
            {/* 头部 */}
            <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-start gap-3">
                <button
                  onClick={handleBackToList}
                  className="flex-shrink-0 p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-all flex items-center gap-1"
                  title="返回列表"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="text-sm">返回</span>
                </button>
                <div className={`w-12 h-12 rounded-xl ${CATEGORY_CONFIG[docContent.category].bg} flex items-center justify-center text-2xl flex-shrink-0`}>
                  {CATEGORY_CONFIG[docContent.category].emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 text-lg truncate">{docContent.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_CONFIG[docContent.category].bg} ${CATEGORY_CONFIG[docContent.category].color}`}>
                      {CATEGORY_CONFIG[docContent.category].name}
                    </span>
                    {docContent.builtin && (
                      <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full border border-amber-300">
                        内置
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedDoc(null);
                    setDocContent(null);
                    setPopoverType(null);
                  }}
                  className="flex-shrink-0 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* 内容 */}
            <div className="flex-1 overflow-y-auto p-4">
              {loadingContent ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div
                  className="prose prose-sm max-w-none text-sm text-slate-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: markdownToHtml(docContent.content) }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
