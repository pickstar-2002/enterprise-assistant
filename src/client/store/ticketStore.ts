import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Ticket } from '@shared/types';

interface TicketStoreState {
  tickets: Ticket[];
  addTicket: (ticket: Ticket) => void;
  updateTicket: (id: string, updates: Partial<Ticket>) => void;
  deleteTicket: (id: string) => void;
  setTickets: (tickets: Ticket[]) => void;
}

export const useTicketStore = create<TicketStoreState>()(
  persist(
    (set) => ({
      tickets: [],

      addTicket: (ticket) =>
        set((state) => ({
          tickets: [...state.tickets, ticket],
        })),

      updateTicket: (id, updates) =>
        set((state) => ({
          tickets: state.tickets.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t
          ),
        })),

      deleteTicket: (id) =>
        set((state) => ({
          tickets: state.tickets.filter((t) => t.id !== id),
        })),

      setTickets: (tickets) => set({ tickets }),
    }),
    {
      name: 'enterprise-assistant-tickets',
    }
  )
);
