/**
 * User and Member Types
 * Represents users and their membership in projects
 */

export interface User {
  id: string;
  address: string; // Sui wallet address
  username?: string;
  avatar?: string;
  email?: string;
  createdAt: string;
}

export interface ProjectMember {
  id: string;
  userId: string;
  projectId: string;
  role: MemberRole;
  user: User;
  joinedAt: string;
}

export enum MemberRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export interface InviteMemberInput {
  projectId: string;
  userAddress: string;
  role: MemberRole;
}
