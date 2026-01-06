import { Router, Request, Response } from 'express';
import ticketService from '../services/ticketService.js';

const router = Router();

// GET /api/tickets - Get all tickets
router.get('/', (req: Request, res: Response) => {
  try {
    const { status, category, priority } = req.query;

    const tickets = ticketService.getAll({
      status: status as any,
      category: category as any,
      priority: priority as any,
    });

    res.json({ tickets, total: tickets.length });
  } catch (error) {
    console.error('[Ticket Routes] Get tickets error:', error);
    res.status(500).json({ error: 'Failed to get tickets' });
  }
});

// GET /api/tickets/stats - Get ticket statistics
router.get('/stats', (_req: Request, res: Response) => {
  try {
    const stats = ticketService.getStats();
    res.json(stats);
  } catch (error) {
    console.error('[Ticket Routes] Get stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

// GET /api/tickets/:id - Get ticket by ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const ticket = ticketService.getById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json({ ticket });
  } catch (error) {
    console.error('[Ticket Routes] Get ticket error:', error);
    res.status(500).json({ error: 'Failed to get ticket' });
  }
});

// POST /api/tickets - Create a new ticket
router.post('/', (req: Request, res: Response) => {
  try {
    const { title, description, category, priority } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    if (!category || !['hr', 'it'].includes(category)) {
      return res.status(400).json({ error: 'Invalid category. Must be "hr" or "it"' });
    }

    const ticket = ticketService.create({
      title,
      description,
      category,
      priority,
    });

    res.status(201).json({ ticket });
  } catch (error) {
    console.error('[Ticket Routes] Create ticket error:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// PATCH /api/tickets/:id - Update ticket
router.patch('/:id', (req: Request, res: Response) => {
  try {
    const { status, title, description, priority } = req.body;

    const ticket = ticketService.update(req.params.id, {
      status,
      title,
      description,
      priority,
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json({ ticket });
  } catch (error) {
    console.error('[Ticket Routes] Update ticket error:', error);
    res.status(500).json({ error: 'Failed to update ticket' });
  }
});

// DELETE /api/tickets/:id - Delete a ticket
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const deleted = ticketService.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('[Ticket Routes] Delete ticket error:', error);
    res.status(500).json({ error: 'Failed to delete ticket' });
  }
});

export default router;
