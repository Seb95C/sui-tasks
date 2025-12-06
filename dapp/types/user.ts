/**
 * User and member types for the jira_engine UI layer.
 */

export interface UserProfile {
  address: string;
  username?: string;
}

export interface UsernameRecord {
  username: string;
  userAddress: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  address: string;
  displayName: string;
  joinedAt: string;
}
