/**
 * Permission Helpers
 * Check user permissions for projects and tickets
 */

import { MemberRole, ProjectMember } from '@/types/user';
import { Ticket } from '@/types/ticket';
import { Project } from '@/types/project';

/**
 * Check if user is an admin of the project
 */
export function isProjectAdmin(
  members: ProjectMember[],
  userAddress: string
): boolean {
  const member = members.find((m) => m.user.address === userAddress);
  return member?.role === MemberRole.ADMIN;
}

/**
 * Check if user is a member of the project
 */
export function isProjectMember(
  members: ProjectMember[],
  userAddress: string
): boolean {
  return members.some((m) => m.user.address === userAddress);
}

/**
 * Check if user has any role in the project
 */
export function isProjectViewer(
  members: ProjectMember[],
  userAddress: string
): boolean {
  return members.some((m) => m.user.address === userAddress);
}

/**
 * Check if user can edit a ticket
 * Rules: Admin, ticket creator, or ticket assignee can edit
 */
export function canEditTicket(
  ticket: Ticket,
  userAddress: string,
  members: ProjectMember[]
): boolean {
  // Admins can always edit
  if (isProjectAdmin(members, userAddress)) {
    return true;
  }

  // Creator can edit their own ticket
  if (ticket.creator.address === userAddress) {
    return true;
  }

  // Assignee can edit tickets assigned to them
  if (ticket.assignee?.address === userAddress) {
    return true;
  }

  return false;
}

/**
 * Check if user can create tickets in the project
 * Rules: All project members can create tickets
 */
export function canCreateTicket(
  members: ProjectMember[],
  userAddress: string
): boolean {
  return isProjectMember(members, userAddress);
}

/**
 * Check if user can add members to the project
 * Rules: Only admins can add members
 */
export function canAddMembers(
  members: ProjectMember[],
  userAddress: string
): boolean {
  return isProjectAdmin(members, userAddress);
}

/**
 * Check if user can remove members from the project
 * Rules: Only admins can remove members (except themselves if they're the last admin)
 */
export function canRemoveMember(
  members: ProjectMember[],
  userAddress: string,
  targetMemberId: string
): boolean {
  if (!isProjectAdmin(members, userAddress)) {
    return false;
  }

  // Check if this would remove the last admin
  const admins = members.filter(m => m.role === MemberRole.ADMIN);
  const targetMember = members.find(m => m.id === targetMemberId);

  if (admins.length === 1 && targetMember?.role === MemberRole.ADMIN) {
    return false; // Can't remove the last admin
  }

  return true;
}

/**
 * Check if user can delete a ticket
 * Rules: Only admins and ticket creator can delete
 */
export function canDeleteTicket(
  ticket: Ticket,
  userAddress: string,
  members: ProjectMember[]
): boolean {
  // Admins can delete any ticket
  if (isProjectAdmin(members, userAddress)) {
    return true;
  }

  // Creator can delete their own ticket
  if (ticket.creator.address === userAddress) {
    return true;
  }

  return false;
}

/**
 * Check if user can assign tickets to others
 * Rules: Admins and members can assign
 */
export function canAssignTickets(
  members: ProjectMember[],
  userAddress: string
): boolean {
  return isProjectMember(members, userAddress);
}

/**
 * Check if user can edit project details
 * Rules: Only admins can edit project
 */
export function canEditProject(
  members: ProjectMember[],
  userAddress: string
): boolean {
  return isProjectAdmin(members, userAddress);
}

/**
 * Get user's role in the project
 */
export function getUserRole(
  members: ProjectMember[],
  userAddress: string
): MemberRole | null {
  const member = members.find((m) => m.user.address === userAddress);
  return member?.role || null;
}

/**
 * Get readable list of capabilities for a role
 */
export function getRoleCapabilities(role: MemberRole): string[] {
  switch (role) {
    case MemberRole.ADMIN:
      return [
        '✓ View all project content',
        '✓ Create, edit, and delete tickets',
        '✓ Assign tickets to anyone',
        '✓ Add and remove team members',
        '✓ Edit project details',
        '✓ Full administrative access',
      ];
    case MemberRole.MEMBER:
      return [
        '✓ View all project content',
        '✓ Create new tickets',
        '✓ Edit own tickets',
        '✓ Edit tickets assigned to them',
        '✓ Assign tickets',
        '✗ Cannot add/remove members',
        '✗ Cannot edit project details',
      ];
    default:
      return [];
  }
}
