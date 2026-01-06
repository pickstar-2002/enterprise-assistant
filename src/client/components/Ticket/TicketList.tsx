/**
 * 工单列表组件
 */
import { useEffect, useState } from 'react';
import type { Ticket } from '@shared/types';
import { useTicketStore } from '../../store/ticketStore';
import * as ticketService from '../../services/ticketService';
import TicketCard from './TicketCard';
import TicketDetail from './TicketDetail';
import TicketCreateForm from './TicketCreateForm';

type FilterStatus = 'all' | Ticket['status'];
type FilterCategory = 'all' | Ticket['category'];
type FilterPriority = 'all' | Ticket['priority'];

export default function TicketList() {
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [filterPriority, setFilterPriority] = useState<FilterPriority>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const tickets = useTicketStore((state) => state.tickets);
  const setTickets = useTicketStore((state) => state.setTickets);
  const updateTicket = useTicketStore((state) => state.updateTicket);
  const deleteTicket = useTicketStore((state) => state.deleteTicket);
  const addTicket = useTicketStore((state) => state.addTicket);

  // 加载工单列表
  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setIsLoading(true);
    try {
      const response = await ticketService.getTickets();
      setTickets(response.tickets);
    } catch (error) {
      console.error('Failed to load tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 过滤工单
  const filteredTickets = tickets.filter((ticket) => {
    // 状态过滤
    if (filterStatus !== 'all' && ticket.status !== filterStatus) return false;
    // 分类过滤
    if (filterCategory !== 'all' && ticket.category !== filterCategory) return false;
    // 优先级过滤
    if (filterPriority !== 'all' && ticket.priority !== filterPriority) return false;
    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        ticket.title.toLowerCase().includes(query) ||
        ticket.description.toLowerCase().includes(query) ||
        ticket.id.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // 更新工单状态
  const handleUpdateStatus = async (id: string, status: Ticket['status']) => {
    try {
      const updated = await ticketService.updateTicketStatus(id, status);
      updateTicket(id, updated);
    } catch (error) {
      console.error('Failed to update ticket:', error);
      alert('更新失败，请重试');
    }
  };

  // 删除工单
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个工单吗？')) return;

    try {
      await ticketService.deleteTicket(id);
      deleteTicket(id);
    } catch (error) {
      console.error('Failed to delete ticket:', error);
      alert('删除失败，请重试');
    }
  };

  // 创建工单
  const handleCreateTicket = async (data: {
    title: string;
    description: string;
    category: Ticket['category'];
    priority?: Ticket['priority'];
  }) => {
    try {
      const newTicket = await ticketService.createTicket(data);
      addTicket(newTicket);
      setShowCreateForm(false);
    } catch (error: any) {
      console.error('Failed to create ticket:', error);
      alert(error.message || '创建失败，请重试');
    }
  };

  // 统计信息
  const stats = {
    total: tickets.length,
    pending: tickets.filter((t) => t.status === 'pending').length,
    processing: tickets.filter((t) => t.status === 'processing').length,
    completed: tickets.filter((t) => t.status === 'completed').length,
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* 头部 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">工单管理</h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            创建工单
          </button>
        </div>

        {/* 统计卡片 */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1 bg-gray-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-500">总工单</div>
          </div>
          <div className="flex-1 bg-amber-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-amber-700">{stats.pending}</div>
            <div className="text-sm text-amber-600">待处理</div>
          </div>
          <div className="flex-1 bg-blue-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-700">{stats.processing}</div>
            <div className="text-sm text-blue-600">处理中</div>
          </div>
          <div className="flex-1 bg-green-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-700">{stats.completed}</div>
            <div className="text-sm text-green-600">已完成</div>
          </div>
        </div>

        {/* 筛选和搜索 */}
        <div className="flex flex-wrap items-center gap-3">
          {/* 状态筛选 */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">全部状态</option>
            <option value="pending">待处理</option>
            <option value="processing">处理中</option>
            <option value="completed">已完成</option>
            <option value="closed">已关闭</option>
          </select>

          {/* 分类筛选 */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as FilterCategory)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">全部分类</option>
            <option value="hr">HR</option>
            <option value="it">IT</option>
          </select>

          {/* 优先级筛选 */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as FilterPriority)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">全部优先级</option>
            <option value="urgent">紧急</option>
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </select>

          {/* 搜索框 */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="搜索工单标题、描述或 ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* 刷新按钮 */}
          <button
            onClick={loadTickets}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            刷新
          </button>
        </div>
      </div>

      {/* 工单列表 */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">加载中...</div>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <div className="text-4xl mb-3">🎫</div>
            <div>暂无工单</div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              创建第一个工单
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onViewDetail={setSelectedTicket}
                onUpdateStatus={handleUpdateStatus}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* 详情弹窗 */}
      {selectedTicket && (
        <TicketDetail
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {/* 创建表单弹窗 */}
      {showCreateForm && (
        <TicketCreateForm
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreateTicket}
        />
      )}
    </div>
  );
}
