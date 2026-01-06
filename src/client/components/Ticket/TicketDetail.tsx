/**
 * 工单详情组件
 */
import type { Ticket } from '@shared/types';

interface TicketDetailProps {
  ticket: Ticket;
  onClose: () => void;
  onUpdateStatus: (id: string, status: Ticket['status']) => void;
}

// 状态配置
const STATUS_CONFIG: Record<Ticket['status'], { label: string; color: string; bgColor: string }> = {
  pending: { label: '待处理', color: 'text-amber-700', bgColor: 'bg-amber-50' },
  processing: { label: '处理中', color: 'text-blue-700', bgColor: 'bg-blue-50' },
  completed: { label: '已完成', color: 'text-green-700', bgColor: 'bg-green-50' },
  closed: { label: '已关闭', color: 'text-gray-500', bgColor: 'bg-gray-100' },
};

// 优先级配置
const PRIORITY_CONFIG: Record<Ticket['priority'], { label: string; color: string }> = {
  low: { label: '低', color: 'bg-gray-200 text-gray-600' },
  medium: { label: '中', color: 'bg-blue-100 text-blue-700' },
  high: { label: '高', color: 'bg-orange-100 text-orange-700' },
  urgent: { label: '紧急', color: 'bg-red-100 text-red-700' },
};

// 分类配置
const CATEGORY_CONFIG: Record<Ticket['category'], { label: string; icon: string; color: string }> = {
  hr: { label: 'HR 人力资源', icon: '👥', color: 'bg-purple-50 text-purple-700' },
  it: { label: 'IT 技术支持', icon: '💻', color: 'bg-blue-50 text-blue-700' },
};

export default function TicketDetail({ ticket, onClose, onUpdateStatus }: TicketDetailProps) {
  const statusInfo = STATUS_CONFIG[ticket.status];
  const priorityInfo = PRIORITY_CONFIG[ticket.priority];
  const categoryInfo = CATEGORY_CONFIG[ticket.category];

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleStatusChange = (newStatus: Ticket['status']) => {
    onUpdateStatus(ticket.id, newStatus);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎫</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">#{ticket.id}</span>
                <h2 className="text-lg font-bold text-gray-900">{ticket.title}</h2>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded text-xs ${priorityInfo.color}`}>
                  {priorityInfo.label}优先级
                </span>
                <span className={`px-2 py-0.5 rounded text-xs ${statusInfo.bgColor} ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 内容 */}
        <div className="px-6 py-4 space-y-4">
          {/* 基本信息 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">分类</div>
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm ${categoryInfo.color}`}>
                <span>{categoryInfo.icon}</span>
                <span>{categoryInfo.label}</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">优先级</div>
              <div className={`inline-block px-2 py-1 rounded text-sm ${priorityInfo.color}`}>
                {priorityInfo.label}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">状态</div>
              <div className={`inline-block px-2 py-1 rounded text-sm ${statusInfo.bgColor} ${statusInfo.color}`}>
                {statusInfo.label}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">创建时间</div>
              <div className="text-sm text-gray-900">{formatDate(ticket.createdAt)}</div>
            </div>
          </div>

          {/* 描述 */}
          <div>
            <div className="text-xs text-gray-500 mb-2">问题描述</div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
            </div>
          </div>

          {/* 更新时间 */}
          {ticket.updatedAt.getTime() !== ticket.createdAt.getTime() && (
            <div className="text-xs text-gray-500">
              最后更新: {formatDate(ticket.updatedAt)}
            </div>
          )}
        </div>

        {/* 底部操作 */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {ticket.status === 'pending' && '等待处理...'}
              {ticket.status === 'processing' && '正在处理中...'}
              {ticket.status === 'completed' && '问题已解决'}
              {ticket.status === 'closed' && '工单已关闭'}
            </div>

            <div className="flex items-center gap-2">
              {/* 状态流转按钮 */}
              {ticket.status === 'pending' && (
                <button
                  onClick={() => handleStatusChange('processing')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  接单处理
                </button>
              )}
              {ticket.status === 'processing' && (
                <button
                  onClick={() => handleStatusChange('completed')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  标记完成
                </button>
              )}
              {ticket.status === 'completed' && (
                <button
                  onClick={() => handleStatusChange('closed')}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  关闭工单
                </button>
              )}

              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
