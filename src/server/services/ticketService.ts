/**
 * 工单服务
 * 管理工单的创建、更新、删除和查询
 */
import fs from 'fs';
import path from 'path';
import type { Ticket } from '@shared/types';

interface TicketFilter {
  status?: Ticket['status'];
  category?: Ticket['category'];
  priority?: Ticket['priority'];
}

/**
 * 工单服务类
 */
export class TicketService {
  private tickets: Map<string, Ticket> = new Map();
  private storagePath = path.join(process.cwd(), 'public', 'tickets.json');

  /**
   * 创建新工单
   */
  create(data: {
    title: string;
    description: string;
    category: Ticket['category'];
    priority?: Ticket['priority'];
  }): Ticket {
    const ticket: Ticket = {
      id: this.generateId(),
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority || this.assessPriority(data.description),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.tickets.set(ticket.id, ticket);
    this.saveToStorage();
    console.log(`[Ticket] Created ticket #${ticket.id}: ${ticket.title}`);

    return ticket;
  }

  /**
   * 获取所有工单
   */
  getAll(filter?: TicketFilter): Ticket[] {
    let tickets = Array.from(this.tickets.values());

    if (filter) {
      if (filter.status) {
        tickets = tickets.filter(t => t.status === filter.status);
      }
      if (filter.category) {
        tickets = tickets.filter(t => t.category === filter.category);
      }
      if (filter.priority) {
        tickets = tickets.filter(t => t.priority === filter.priority);
      }
    }

    // 按创建时间倒序
    return tickets.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * 根据 ID 获取工单
   */
  getById(id: string): Ticket | undefined {
    return this.tickets.get(id);
  }

  /**
   * 更新工单状态
   */
  updateStatus(id: string, status: Ticket['status']): Ticket | null {
    const ticket = this.tickets.get(id);
    if (!ticket) {
      return null;
    }

    ticket.status = status;
    ticket.updatedAt = new Date();
    this.tickets.set(id, ticket);
    this.saveToStorage();

    console.log(`[Ticket] Updated ticket #${id} status to ${status}`);
    return ticket;
  }

  /**
   * 更新工单信息
   */
  update(id: string, updates: Partial<Omit<Ticket, 'id' | 'createdAt'>>): Ticket | null {
    const ticket = this.tickets.get(id);
    if (!ticket) {
      return null;
    }

    const updated = {
      ...ticket,
      ...updates,
      updatedAt: new Date(),
    };

    this.tickets.set(id, updated);
    this.saveToStorage();

    console.log(`[Ticket] Updated ticket #${id}`);
    return updated;
  }

  /**
   * 删除工单
   */
  delete(id: string): boolean {
    const deleted = this.tickets.delete(id);
    if (deleted) {
      this.saveToStorage();
      console.log(`[Ticket] Deleted ticket #${id}`);
    }
    return deleted;
  }

  /**
   * 获取统计信息
   */
  getStats() {
    const tickets = Array.from(this.tickets.values());
    return {
      total: tickets.length,
      byStatus: {
        pending: tickets.filter(t => t.status === 'pending').length,
        processing: tickets.filter(t => t.status === 'processing').length,
        completed: tickets.filter(t => t.status === 'completed').length,
        closed: tickets.filter(t => t.status === 'closed').length,
      },
      byCategory: {
        hr: tickets.filter(t => t.category === 'hr').length,
        it: tickets.filter(t => t.category === 'it').length,
      },
      byPriority: {
        low: tickets.filter(t => t.priority === 'low').length,
        medium: tickets.filter(t => t.priority === 'medium').length,
        high: tickets.filter(t => t.priority === 'high').length,
        urgent: tickets.filter(t => t.priority === 'urgent').length,
      },
    };
  }

  /**
   * 智能评估工单优先级
   */
  private assessPriority(description: string): Ticket['priority'] {
    const urgentKeywords = ['紧急', '无法工作', '无法连接', '完全', '全部', '崩溃', '死机'];
    const highKeywords = ['故障', '错误', '异常', '不能', '无法', '失败'];
    const lowKeywords = ['咨询', '询问', '了解', '问题', '请问'];

    const lowerDesc = description.toLowerCase();

    if (urgentKeywords.some(k => lowerDesc.includes(k))) {
      return 'urgent';
    }
    if (highKeywords.some(k => lowerDesc.includes(k))) {
      return 'high';
    }
    if (lowKeywords.some(k => lowerDesc.includes(k))) {
      return 'low';
    }

    return 'medium';
  }

  /**
   * 生成短 ID
   */
  private generateId(): string {
    // 生成 6 位随机 ID
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  /**
   * 从文件加载数据
   */
  loadFromStorage(): void {
    try {
      if (fs.existsSync(this.storagePath)) {
        const data = fs.readFileSync(this.storagePath, 'utf-8');
        const parsed = JSON.parse(data);
        parsed.forEach((t: any) => {
          // 还原 Date 对象
          this.tickets.set(t.id, {
            ...t,
            createdAt: new Date(t.createdAt),
            updatedAt: new Date(t.updatedAt),
          });
        });
        console.log(`[Ticket] Loaded ${this.tickets.size} tickets from storage`);
      } else {
        console.log('[Ticket] No existing storage found, starting fresh');
      }
    } catch (error) {
      console.error('[Ticket] Failed to load from storage:', error);
    }
  }

  /**
   * 保存到文件
   */
  private saveToStorage(): void {
    try {
      const data = Array.from(this.tickets.values());
      // 确保目录存在
      const dir = path.dirname(this.storagePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.storagePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('[Ticket] Failed to save to storage:', error);
    }
  }

  /**
   * 清空所有工单
   */
  clear(): void {
    this.tickets.clear();
    this.saveToStorage();
    console.log('[Ticket] Cleared all tickets');
  }
}

// 导出单例
export default new TicketService();
