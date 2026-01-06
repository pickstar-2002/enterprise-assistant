/**
 * 前端工单服务
 * 处理工单相关的 API 请求
 */
import type { Ticket } from '@shared/types';

const API_BASE = '/api';

/**
 * 获取工单列表
 */
export async function getTickets(params?: {
  status?: Ticket['status'];
  category?: Ticket['category'];
  priority?: Ticket['priority'];
}): Promise<{ tickets: Ticket[]; total: number }> {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append('status', params.status);
  if (params?.category) queryParams.append('category', params.category);
  if (params?.priority) queryParams.append('priority', params.priority);

  const response = await fetch(`${API_BASE}/tickets?${queryParams.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to get tickets: ${response.status}`);
  }
  return response.json();
}

/**
 * 获取工单详情
 */
export async function getTicketById(id: string): Promise<Ticket> {
  const response = await fetch(`${API_BASE}/tickets/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to get ticket: ${response.status}`);
  }
  const data = await response.json();
  return data.ticket;
}

/**
 * 创建工单
 */
export async function createTicket(data: {
  title: string;
  description: string;
  category: Ticket['category'];
  priority?: Ticket['priority'];
}): Promise<Ticket> {
  const response = await fetch(`${API_BASE}/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create ticket');
  }

  const result = await response.json();
  return result.ticket;
}

/**
 * 更新工单
 */
export async function updateTicket(
  id: string,
  updates: {
    status?: Ticket['status'];
    title?: string;
    description?: string;
    priority?: Ticket['priority'];
  }
): Promise<Ticket> {
  const response = await fetch(`${API_BASE}/tickets/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error(`Failed to update ticket: ${response.status}`);
  }

  const result = await response.json();
  return result.ticket;
}

/**
 * 更新工单状态
 */
export async function updateTicketStatus(
  id: string,
  status: Ticket['status']
): Promise<Ticket> {
  return updateTicket(id, { status });
}

/**
 * 删除工单
 */
export async function deleteTicket(id: string): Promise<boolean> {
  const response = await fetch(`${API_BASE}/tickets/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete ticket: ${response.status}`);
  }

  const result = await response.json();
  return result.success;
}

/**
 * 获取工单统计
 */
export async function getTicketStats(): Promise<{
  total: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
}> {
  const response = await fetch(`${API_BASE}/tickets/stats`);
  if (!response.ok) {
    throw new Error(`Failed to get stats: ${response.status}`);
  }
  return response.json();
}

export default {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  updateTicketStatus,
  deleteTicket,
  getTicketStats,
};
