/**
 * Project Types
 * Represents projects on the blockchain and indexer
 */

import { ProjectMember } from './user';

export interface Project {
  id: string; // Object ID from Sui blockchain
  name: string;
  description: string;
  objectId: string; // Sui object ID
  creator: string; // Creator's Sui address
  createdAt: string;
  updatedAt: string;

  // Aggregated data from indexer
  membersCount?: number;
  ticketsCount?: number;
  members?: ProjectMember[];
}

export interface ProjectStats {
  totalTickets: number;
  todoCount: number;
  inProgressCount: number;
  doneCount: number;
  membersCount: number;
}

export interface CreateProjectInput {
  name: string;
  description: string;
}

export interface UpdateProjectInput {
  projectId: string;
  name?: string;
  description?: string;
}
