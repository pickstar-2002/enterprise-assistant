/**
 * 文件上传组件 - 紧凑设计
 */
import { useCallback, useState } from 'react';
import { useKnowledgeStore } from '../../store/knowledgeStore';

interface FileUploaderProps {
  onUploadStart?: () => void;
  onUploadComplete?: () => void;
}

export function FileUploader({ onUploadStart, onUploadComplete }: FileUploaderProps) {
  const { uploadFile, isUploading, uploadProgress, error, clearError } = useKnowledgeStore();
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = useCallback(
    async (file: File) => {
      // 验证文件
      const allowedExts = ['.txt', '.md', '.pdf', '.docx'];
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();

      if (!allowedExts.includes(ext)) {
        clearError();
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        clearError();
        return;
      }

      onUploadStart?.();
      await uploadFile(file);
      onUploadComplete?.();
    },
    [uploadFile, onUploadStart, onUploadComplete, clearError]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [handleFileSelect]
  );

  return (
    <div className="space-y-2">
      {/* 上传区域 - 紧凑设计 */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-lg p-3 text-center transition-all
          ${isDragging
            ? 'border-blue-500 bg-blue-50 scale-[1.02]'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }
          ${isUploading ? 'pointer-events-none opacity-60' : 'cursor-pointer'}
        `}
      >
        <input
          type="file"
          accept=".txt,.md,.pdf,.docx"
          onChange={handleFileInput}
          disabled={isUploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />

        <div className="space-y-1">
          <div className="text-2xl">📄</div>
          <p className="text-sm text-gray-700 font-medium">
            {isDragging ? '释放文件上传' : '点击或拖拽文件'}
          </p>
          <p className="text-xs text-gray-500">
            支持 TXT, MD, PDF, DOCX (最大10MB)
          </p>
        </div>

        {/* 上传进度 */}
        {isUploading && (
          <div className="mt-2 space-y-1.5">
            <div className="flex items-center justify-center gap-2">
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-blue-600">处理中...</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
          <span className="text-red-500 text-sm">⚠️</span>
          <div className="flex-1">
            <p className="text-xs text-red-700">{error}</p>
          </div>
          <button
            onClick={clearError}
            className="text-red-400 hover:text-red-600 transition-colors text-sm"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
