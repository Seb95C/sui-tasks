/**
 * Projects API
 * Functions to fetch and manipulate project data from the indexer
 */

import { fetchFromIndexer, postToIndexer } from './indexer';
import { Project, ProjectStats } from '@/types/project';
import { ProjectMember } from '@/types/user';

/**
 * Fetch all projects for a given user address
 * @param userAddress - Sui wallet address of the user
 * @returns Array of projects the user is a member of
 */
export async function fetchUserProjects(userAddress: string): Promise<Project[]> {
  return fetchFromIndexer<Project[]>(`/projects?userAddress=${userAddress}`);
}

/**
 * Fetch a single project by ID with full details
 * @param projectId - Project object ID
 * @returns Project with members and stats
 */
export async function fetchProjectById(projectId: string): Promise<Project> {
  return fetchFromIndexer<Project>(`/projects/${projectId}`);
}

/**
 * Fetch project statistics (ticket counts by status)
 * @param projectId - Project object ID
 * @returns Project statistics
 */
export async function fetchProjectStats(projectId: string): Promise<ProjectStats> {
  return fetchFromIndexer<ProjectStats>(`/projects/${projectId}/stats`);
}

/**
 * Fetch all members of a project
 * @param projectId - Project object ID
 * @returns Array of project members with user details
 */
export async function fetchProjectMembers(projectId: string): Promise<ProjectMember[]> {
  return fetchFromIndexer<ProjectMember[]>(`/projects/${projectId}/members`);
}

/**
 * Sync a newly created project from blockchain to indexer
 * Called after a successful blockchain transaction
 * @param projectObjectId - Object ID returned from blockchain transaction
 * @returns Synced project data
 */
export async function syncProjectToIndexer(projectObjectId: string): Promise<Project> {
  return postToIndexer<Project>('/projects/sync', { objectId: projectObjectId });
}
