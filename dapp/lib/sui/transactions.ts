/**
 * Sui Transaction Builders
 * Helper functions to build Sui blockchain transactions for projects and tickets
 */

import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID, MODULES, FUNCTIONS } from './constants';
import { CreateProjectInput, UpdateProjectInput } from '@/types/project';
import { CreateTicketInput, UpdateTicketInput, TicketStatus } from '@/types/ticket';
import { InviteMemberInput, MemberRole } from '@/types/user';

/**
 * Create a new project on the blockchain
 * @param input - Project creation data
 * @returns Transaction ready to be signed and executed
 */
export function buildCreateProjectTransaction(input: CreateProjectInput): Transaction {
  const tx = new Transaction();

  // Call the create_project function in your Move module
  // Adjust arguments based on your actual Move function signature
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULES.PROJECT}::${FUNCTIONS.CREATE_PROJECT}`,
    arguments: [
      tx.pure.string(input.name),
      tx.pure.string(input.description),
    ],
  });

  return tx;
}

/**
 * Update an existing project
 * @param input - Project update data including project object ID
 * @returns Transaction
 */
export function buildUpdateProjectTransaction(input: UpdateProjectInput): Transaction {
  const tx = new Transaction();

  // Pass the project object ID and updated fields
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULES.PROJECT}::${FUNCTIONS.UPDATE_PROJECT}`,
    arguments: [
      tx.object(input.projectId), // Project object reference
      tx.pure.string(input.name || ''),
      tx.pure.string(input.description || ''),
    ],
  });

  return tx;
}

/**
 * Add a member to a project
 * @param input - Member invitation data
 * @returns Transaction
 */
export function buildAddMemberTransaction(input: InviteMemberInput): Transaction {
  const tx = new Transaction();

  // Convert role enum to number (adjust based on your Move contract)
  const roleValue = input.role === MemberRole.ADMIN ? 0 : input.role === MemberRole.MEMBER ? 1 : 2;

  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULES.MEMBERSHIP}::${FUNCTIONS.ADD_MEMBER}`,
    arguments: [
      tx.object(input.projectId), // Project object ID
      tx.pure.address(input.userAddress), // New member's Sui address
      tx.pure.u8(roleValue), // Role as integer
    ],
  });

  return tx;
}

/**
 * Create a new ticket in a project
 * @param input - Ticket creation data
 * @returns Transaction
 */
export function buildCreateTicketTransaction(input: CreateTicketInput): Transaction {
  const tx = new Transaction();

  // Priority mapping (adjust based on your Move contract)
  const priorityMap = { LOW: 0, MEDIUM: 1, HIGH: 2, URGENT: 3 };

  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULES.TICKET}::${FUNCTIONS.CREATE_TICKET}`,
    arguments: [
      tx.object(input.projectId), // Project object reference
      tx.pure.string(input.title),
      tx.pure.string(input.description),
      tx.pure.u8(priorityMap[input.priority]),
      // Assignee is optional - use option::none() or option::some(address) in Move
      ...(input.assigneeId ? [tx.pure.address(input.assigneeId)] : []),
    ],
  });

  return tx;
}

/**
 * Update an existing ticket
 * @param input - Ticket update data
 * @returns Transaction
 */
export function buildUpdateTicketTransaction(input: UpdateTicketInput): Transaction {
  const tx = new Transaction();

  const priorityMap = { LOW: 0, MEDIUM: 1, HIGH: 2, URGENT: 3 };
  const statusMap = { TODO: 0, IN_PROGRESS: 1, DONE: 2 };

  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULES.TICKET}::${FUNCTIONS.UPDATE_TICKET}`,
    arguments: [
      tx.object(input.ticketId), // Ticket object ID
      ...(input.title ? [tx.pure.string(input.title)] : [tx.pure.string('')]),
      ...(input.description ? [tx.pure.string(input.description)] : [tx.pure.string('')]),
      ...(input.status ? [tx.pure.u8(statusMap[input.status])] : [tx.pure.u8(0)]),
      ...(input.priority ? [tx.pure.u8(priorityMap[input.priority])] : [tx.pure.u8(1)]),
    ],
  });

  return tx;
}

/**
 * Update only the status of a ticket (for Kanban drag-drop)
 * @param ticketId - Ticket object ID
 * @param newStatus - New status
 * @returns Transaction
 */
export function buildUpdateTicketStatusTransaction(
  ticketId: string,
  newStatus: TicketStatus
): Transaction {
  const tx = new Transaction();

  const statusMap = { TODO: 0, IN_PROGRESS: 1, DONE: 2 };

  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULES.TICKET}::${FUNCTIONS.UPDATE_TICKET_STATUS}`,
    arguments: [
      tx.object(ticketId),
      tx.pure.u8(statusMap[newStatus]),
    ],
  });

  return tx;
}

/**
 * Assign a ticket to a user
 * @param ticketId - Ticket object ID
 * @param assigneeAddress - Assignee's Sui address
 * @returns Transaction
 */
export function buildAssignTicketTransaction(
  ticketId: string,
  assigneeAddress: string
): Transaction {
  const tx = new Transaction();

  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULES.TICKET}::${FUNCTIONS.ASSIGN_TICKET}`,
    arguments: [
      tx.object(ticketId),
      tx.pure.address(assigneeAddress),
    ],
  });

  return tx;
}
