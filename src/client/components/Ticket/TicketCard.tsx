/**
 * 工单卡片组件
 */
import type { Ticket } from '@shared/types';

interface TicketCardProps {
  ticket: Ticket;
  onViewDetail: (ticket: Ticket) => void;
  onUpdateStatus: (id: string, status: Ticket['status']) => void;
  onDelete: (id: string) => void;
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
const CATEGORY_CONFIG: Record<Ticket['category'], { label: string; icon: string }> = {
  hr: { label: 'HR', icon: '👥' },
  it: { label: 'IT', icon: '💻' },
};

export default function TicketCard({ ticket, onViewDetail, onUpdateStatus, onDelete }: TicketCardProps) {
  const statusInfo = STATUS_CONFIG[ticket.status];
  const priorityInfo = PRIORITY_CONFIG[ticket.priority];
  const categoryInfo = CATEGORY_CONFIG[ticket.category];

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return minutes <= 1 ? '刚刚' : `${minutes}分钟前`;
      }
      return `${hours}小时前`;
    }
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;

    return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow p-4">
      {/* 头部：ID、标题、优先级 */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xs font-mono text-gray-400">#{ticket.id}</span>
          <h3 className="font-medium text-gray-900 truncate">{ticket.title}</h3>
        </div>
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityInfo.color} whitespace-nowrap`}>
          {priorityInfo.label}
        </span>
      </div>

      {/* 描述 */}
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {ticket.description}
      </p>

      {/* 标签行：分类、状态、时间 */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          {/* 分类 */}
          <span className="flex items-center gap-1 text-gray-500">
            <span>{categoryInfo.icon}</span>
            <span>{categoryInfo.label}</span>
          </span>

          {/* 状态 */}
          <span className={`px-2 py-0.5 rounded ${statusInfo.bgColor} ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>

        {/* 时间 */}
        <span className="text-gray-400">{formatDate(ticket.createdAt)}</span>
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
        <button
          onClick={() => onViewDetail(ticket)}
          className="flex-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          查看详情
        </button>

        {/* 状态操作 */}
        {ticket.status === 'pending' && (
          <button
            onClick={() => onUpdateStatus(ticket.id, 'processing')}
            className="px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          >
            接单
          </button>
        )}
        {ticket.status === 'processing' && (
          <button
            onClick={() => onUpdateStatus(ticket.id, 'completed')}
            className="px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          >
            完成
          </button>
        )}
        {ticket.status === 'completed' && (
          <button
            onClick={() => onUpdateStatus(ticket.id, 'closed')}
            className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            关闭
          </button>
        )}

        {/* 删除按钮 */}
        <button
          onClick={() => onDelete(ticket.id)}
          className="px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        >
          删除
        </button>
      </div>
    </div>
  );
}
