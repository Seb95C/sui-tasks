/**
 * Tickets API
 * Functions to fetch and manipulate ticket data from the indexer
 */

import { fetchFromIndexer, postToIndexer } from './indexer';
import { Ticket, TicketStatus } from '@/types/ticket';

/**
 * Fetch all tickets for a project
 * @param projectId - Project object ID
 * @returns Array of tickets
 */
export async function fetchProjectTickets(projectId: string): Promise<Ticket[]> {
  return fetchFromIndexer<Ticket[]>(`/tickets?projectId=${projectId}`);
}

/**
 * Fetch a single ticket by ID
 * @param ticketId - Ticket object ID
 * @returns Ticket with creator and assignee details
 */
export async function fetchTicketById(ticketId: string): Promise<Ticket> {
  return fetchFromIndexer<Ticket>(`/tickets/${ticketId}`);
}

/**
 * Fetch tickets by status for Kanban board
 * @param projectId - Project object ID
 * @param status - Ticket status filter
 * @returns Array of tickets with the specified status
 */
export async function fetchTicketsByStatus(
  projectId: string,
  status: TicketStatus
): Promise<Ticket[]> {
  return fetchFromIndexer<Ticket[]>(`/tickets?projectId=${projectId}&status=${status}`);
}

/**
 * Sync a newly created ticket from blockchain to indexer
 * @param ticketObjectId - Object ID returned from blockchain transaction
 * @returns Synced ticket data
 */
export async function syncTicketToIndexer(ticketObjectId: string): Promise<Ticket> {
  return postToIndexer<Ticket>('/tickets/sync', { objectId: ticketObjectId });
}
