/**
 * Ticket Types
 * Represents tickets/issues in projects
 */

import { User } from './user';

export interface Ticket {
  id: string; // Object ID from Sui blockchain
  objectId: string; // Sui object ID
  projectId: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assigneeId?: string;
  assignee?: User;
  creatorId: string;
  creator: User;
  createdAt: string;
  updatedAt: string;
}

export enum TicketStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface CreateTicketInput {
  projectId: string;
  title: string;
  description: string;
  priority: TicketPriority;
  assigneeId?: string;
}

export interface UpdateTicketInput {
  ticketId: string;
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  assigneeId?: string;
}

// For Kanban board organization
export interface TicketColumn {
  status: TicketStatus;
  title: string;
  tickets: Ticket[];
}
