/**
 * 工单创建表单组件
 */
import { useState } from 'react';
import type { Ticket } from '@shared/types';

interface TicketCreateFormProps {
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    category: Ticket['category'];
    priority?: Ticket['priority'];
  }) => void;
}

export default function TicketCreateForm({ onClose, onSubmit }: TicketCreateFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Ticket['category']>('it');
  const [priority, setPriority] = useState<Ticket['priority']>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      alert('请填写标题和描述');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const CATEGORY_OPTIONS = [
    { value: 'hr' as const, label: '👥 HR 人力资源', color: 'bg-purple-50 border-purple-200 hover:border-purple-400' },
    { value: 'it' as const, label: '💻 IT 技术支持', color: 'bg-blue-50 border-blue-200 hover:border-blue-400' },
  ];

  const PRIORITY_OPTIONS = [
    { value: 'low' as const, label: '低', description: '一般咨询', color: 'bg-gray-100 text-gray-600' },
    { value: 'medium' as const, label: '中', description: '常规问题', color: 'bg-blue-100 text-blue-700' },
    { value: 'high' as const, label: '高', description: '影响工作', color: 'bg-orange-100 text-orange-700' },
    { value: 'urgent' as const, label: '紧急', description: '无法工作', color: 'bg-red-100 text-red-700' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full">
        {/* 头部 */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">创建工单</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* 标题 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="简要描述问题..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting}
              maxLength={100}
            />
            <div className="text-xs text-gray-500 mt-1">{title.length}/100</div>
          </div>

          {/* 分类选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              分类 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setCategory(option.value)}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    category === option.value
                      ? option.color.replace('hover:', '') + ' ring-2 ring-blue-500'
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                  disabled={isSubmitting}
                >
                  <div className="font-medium">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 优先级选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              优先级
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PRIORITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPriority(option.value)}
                  className={`p-2 rounded-lg text-center transition-all ${
                    priority === option.value
                      ? option.color + ' ring-2 ring-blue-500'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                  disabled={isSubmitting}
                >
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs opacity-75">{option.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              详细描述 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="请详细描述您遇到的问题..."
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              disabled={isSubmitting}
              maxLength={1000}
            />
            <div className="text-xs text-gray-500 mt-1">{description.length}/1000</div>
          </div>

          {/* 提示 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
            💡 提示：请尽可能详细地描述问题，包括错误信息、复现步骤等，以便更快地解决问题。
          </div>
        </form>

        {/* 底部按钮 */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={isSubmitting}
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim() || !description.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                提交中...
              </>
            ) : (
              <>
                <span>🎫</span>
                创建工单
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
