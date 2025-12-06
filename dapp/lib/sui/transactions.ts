/**
 * Sui Transaction Builders aligned with the jira_engine Move package.
 * These functions build unsigned transactions; signing/execution is handled by the wallet.
 */

import { Transaction } from '@mysten/sui/transactions';
import { FUNCTIONS, MODULES, OBJECT_IDS, PACKAGE_ID } from './constants';
import { TaskState } from '@/types/task';

const requirePackage = () => {
  if (!PACKAGE_ID) {
    throw new Error('NEXT_PUBLIC_PACKAGE_ID is not configured.');
  }
};

const requireId = (value: string, label: string) => {
  if (!value) {
    throw new Error(`${label} is required`);
  }
  return value;
};

const normalizeState = (state: number | TaskState) => Number(state);
const normalizeDueDate = (dueDate?: string | number) =>
  dueDate ? Number(dueDate) : 0;

export function buildRegisterUsernameTx(
  username: string,
  registryId: string = OBJECT_IDS.USERNAME_REGISTRY,
): Transaction {
  requirePackage();

  const tx = new Transaction();

  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULES.USERNAME_REGISTRY}::${FUNCTIONS.REGISTER_USERNAME}`,
    arguments: [
      tx.object(requireId(registryId, 'Username registry object id')),
      tx.pure.string(username),
    ],
  });

  return tx;
}

export function buildMintProjectTx(args: {
  name: string;
  description: string;
  managerDisplayName: string;
  registryId?: string;
  clockId?: string;
}): Transaction {
  requirePackage();

  const registryId = args.registryId || OBJECT_IDS.USERNAME_REGISTRY;
  const clockId = args.clockId || OBJECT_IDS.CLOCK;

  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULES.PROJECT}::${FUNCTIONS.MINT_PROJECT}`,
    arguments: [
      tx.object(requireId(registryId, 'Username registry object id')),
      tx.pure.string(args.name),
      tx.pure.string(args.description),
      tx.pure.string(args.managerDisplayName),
      tx.object(requireId(clockId, 'Clock object id')),
    ],
  });

  return tx;
}

export function buildAddMemberTx(args: {
  managerCapId: string;
  registryId?: string;
  projectId: string;
  memberAddress: string;
  displayName: string;
  clockId?: string;
}): Transaction {
  requirePackage();

  const registryId = args.registryId || OBJECT_IDS.USERNAME_REGISTRY;
  const clockId = args.clockId || OBJECT_IDS.CLOCK;

  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULES.PROJECT}::${FUNCTIONS.ADD_MEMBER}`,
    arguments: [
      tx.object(requireId(args.managerCapId, 'ProjectManagerCap object id')),
      tx.object(requireId(registryId, 'Username registry object id')),
      tx.object(requireId(args.projectId, 'Project object id')),
      tx.pure.address(args.memberAddress),
      tx.pure.string(args.displayName),
      tx.object(requireId(clockId, 'Clock object id')),
    ],
  });

  return tx;
}

export function buildRemoveMemberTx(args: {
  managerCapId: string;
  projectId: string;
  memberAddress: string;
}): Transaction {
  requirePackage();

  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULES.PROJECT}::${FUNCTIONS.REMOVE_MEMBER}`,
    arguments: [
      tx.object(requireId(args.managerCapId, 'ProjectManagerCap object id')),
      tx.object(requireId(args.projectId, 'Project object id')),
      tx.pure.address(args.memberAddress),
    ],
  });

  return tx;
}

export function buildCloseProjectTx(args: {
  managerCapId: string;
  projectId: string;
}): Transaction {
  requirePackage();
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULES.PROJECT}::${FUNCTIONS.CLOSE_PROJECT}`,
    arguments: [
      tx.object(requireId(args.managerCapId, 'ProjectManagerCap object id')),
      tx.object(requireId(args.projectId, 'Project object id')),
    ],
  });
  return tx;
}

export function buildManagerAddTaskTx(args: {
  managerCapId: string;
  projectId: string;
  name: string;
  description: string;
  assignee: string;
  state: number | TaskState;
  dueDate?: string | number;
}): Transaction {
  requirePackage();

  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULES.PROJECT}::${FUNCTIONS.MANAGER_ADD_TASK}`,
    arguments: [
      tx.object(requireId(args.managerCapId, 'ProjectManagerCap object id')),
      tx.object(requireId(args.projectId, 'Project object id')),
      tx.pure.string(args.name),
      tx.pure.string(args.description),
      tx.pure.address(args.assignee),
      tx.pure.u8(normalizeState(args.state)),
      tx.pure.u64(normalizeDueDate(args.dueDate)),
    ],
  });

  return tx;
}

export function buildMemberCreateTaskTx(args: {
  projectId: string;
  name: string;
  description: string;
  state: number | TaskState;
  dueDate?: string | number;
}): Transaction {
  requirePackage();

  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULES.PROJECT}::${FUNCTIONS.MEMBER_CREATE_TASK}`,
    arguments: [
      tx.object(requireId(args.projectId, 'Project object id')),
      tx.pure.string(args.name),
      tx.pure.string(args.description),
      tx.pure.u8(normalizeState(args.state)),
      tx.pure.u64(normalizeDueDate(args.dueDate)),
    ],
  });

  return tx;
}

export function buildDeleteTaskTx(args: {
  managerCapId: string;
  projectId: string;
  taskId: string;
}): Transaction {
  requirePackage();
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULES.PROJECT}::${FUNCTIONS.DELETE_TASK}`,
    arguments: [
      tx.object(requireId(args.managerCapId, 'ProjectManagerCap object id')),
      tx.object(requireId(args.projectId, 'Project object id')),
      tx.pure.id(args.taskId),
    ],
  });
  return tx;
}

export function buildManagerUpdateTaskNameTx(args: {
  managerCapId: string;
  projectId: string;
  taskId: string;
  name: string;
}): Transaction {
  requirePackage();
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULES.PROJECT}::${FUNCTIONS.MANAGER_UPDATE_TASK_NAME}`,
    arguments: [
      tx.object(requireId(args.managerCapId, 'ProjectManagerCap object id')),
      tx.object(requireId(args.projectId, 'Project object id')),
      tx.pure.id(args.taskId),
      tx.pure.string(args.name),
    ],
  });
  return tx;
}

export function buildManagerUpdateTaskDescriptionTx(args: {
  managerCapId: string;
  projectId: string;
  taskId: string;
  description: string;
}): Transaction {
  requirePackage();
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULES.PROJECT}::${FUNCTIONS.MANAGER_UPDATE_TASK_DESCRIPTION}`,
    arguments: [
      tx.object(requireId(args.managerCapId, 'ProjectManagerCap object id')),
      tx.object(requireId(args.projectId, 'Project object id')),
      tx.pure.id(args.taskId),
      tx.pure.string(args.description),
    ],
  });
  return tx;
}

export function buildManagerUpdateTaskAssigneeTx(args: {
  managerCapId: string;
  projectId: string;
  taskId: string;
  assignee: string;
}): Transaction {
  requirePackage();
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULES.PROJECT}::${FUNCTIONS.MANAGER_UPDATE_TASK_ASSIGNEE}`,
    arguments: [
      tx.object(requireId(args.managerCapId, 'ProjectManagerCap object id')),
      tx.object(requireId(args.projectId, 'Project object id')),
      tx.pure.id(args.taskId),
      tx.pure.address(args.assignee),
    ],
  });
  return tx;
}

export function buildManagerUpdateTaskStateTx(args: {
  managerCapId: string;
  projectId: string;
  taskId: string;
  state: number | TaskState;
}): Transaction {
  requirePackage();
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULES.PROJECT}::${FUNCTIONS.MANAGER_UPDATE_TASK_STATE}`,
    arguments: [
      tx.object(requireId(args.managerCapId, 'ProjectManagerCap object id')),
      tx.object(requireId(args.projectId, 'Project object id')),
      tx.pure.id(args.taskId),
      tx.pure.u8(normalizeState(args.state)),
    ],
  });
  return tx;
}

export function buildManagerUpdateTaskDueDateTx(args: {
  managerCapId: string;
  projectId: string;
  taskId: string;
  dueDate: string | number;
}): Transaction {
  requirePackage();
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULES.PROJECT}::${FUNCTIONS.MANAGER_UPDATE_TASK_DUE_DATE}`,
    arguments: [
      tx.object(requireId(args.managerCapId, 'ProjectManagerCap object id')),
      tx.object(requireId(args.projectId, 'Project object id')),
      tx.pure.id(args.taskId),
      tx.pure.u64(normalizeDueDate(args.dueDate)),
    ],
  });
  return tx;
}

export function buildAssigneeUpdateTaskStateTx(args: {
  projectId: string;
  taskId: string;
  state: number | TaskState;
}): Transaction {
  requirePackage();
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULES.PROJECT}::${FUNCTIONS.ASSIGNEE_UPDATE_TASK_STATE}`,
    arguments: [
      tx.object(requireId(args.projectId, 'Project object id')),
      tx.pure.id(args.taskId),
      tx.pure.u8(normalizeState(args.state)),
    ],
  });
  return tx;
}

export function buildMemberUpdateTaskNameTx(args: {
  projectId: string;
  taskId: string;
  name: string;
}): Transaction {
  requirePackage();
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULES.PROJECT}::${FUNCTIONS.MEMBER_UPDATE_TASK_NAME}`,
    arguments: [
      tx.object(requireId(args.projectId, 'Project object id')),
      tx.pure.id(args.taskId),
      tx.pure.string(args.name),
    ],
  });
  return tx;
}

export function buildMemberUpdateTaskDescriptionTx(args: {
  projectId: string;
  taskId: string;
  description: string;
}): Transaction {
  requirePackage();
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULES.PROJECT}::${FUNCTIONS.MEMBER_UPDATE_TASK_DESCRIPTION}`,
    arguments: [
      tx.object(requireId(args.projectId, 'Project object id')),
      tx.pure.id(args.taskId),
      tx.pure.string(args.description),
    ],
  });
  return tx;
}

export function buildMemberUpdateTaskDueDateTx(args: {
  projectId: string;
  taskId: string;
  dueDate: string | number;
}): Transaction {
  requirePackage();
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULES.PROJECT}::${FUNCTIONS.MEMBER_UPDATE_TASK_DUE_DATE}`,
    arguments: [
      tx.object(requireId(args.projectId, 'Project object id')),
      tx.pure.id(args.taskId),
      tx.pure.u64(normalizeDueDate(args.dueDate)),
    ],
  });
  return tx;
}

export function buildManagerAddSubtaskTx(args: {
  managerCapId: string;
  projectId: string;
  taskId: string;
  name: string;
  description: string;
  state: number | TaskState;
}): Transaction {
  requirePackage();
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULES.PROJECT}::${FUNCTIONS.MANAGER_ADD_SUBTASK}`,
    arguments: [
      tx.object(requireId(args.managerCapId, 'ProjectManagerCap object id')),
      tx.object(requireId(args.projectId, 'Project object id')),
      tx.pure.id(args.taskId),
      tx.pure.string(args.name),
      tx.pure.string(args.description),
      tx.pure.u8(normalizeState(args.state)),
    ],
  });
  return tx;
}

export function buildMemberAddSubtaskTx(args: {
  projectId: string;
  taskId: string;
  name: string;
  description: string;
  state: number | TaskState;
}): Transaction {
  requirePackage();
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULES.PROJECT}::${FUNCTIONS.MEMBER_ADD_SUBTASK}`,
    arguments: [
      tx.object(requireId(args.projectId, 'Project object id')),
      tx.pure.id(args.taskId),
      tx.pure.string(args.name),
      tx.pure.string(args.description),
      tx.pure.u8(normalizeState(args.state)),
    ],
  });
  return tx;
}

export function buildManagerUpdateSubtaskTx(args: {
  managerCapId: string;
  projectId: string;
  taskId: string;
  subtaskId: number;
  name: string;
  description: string;
  state: number | TaskState;
}): Transaction {
  requirePackage();
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULES.PROJECT}::${FUNCTIONS.MANAGER_UPDATE_SUBTASK}`,
    arguments: [
      tx.object(requireId(args.managerCapId, 'ProjectManagerCap object id')),
      tx.object(requireId(args.projectId, 'Project object id')),
      tx.pure.id(args.taskId),
      tx.pure.u64(args.subtaskId),
      tx.pure.string(args.name),
      tx.pure.string(args.description),
      tx.pure.u8(normalizeState(args.state)),
    ],
  });
  return tx;
}

export function buildMemberUpdateSubtaskTx(args: {
  projectId: string;
  taskId: string;
  subtaskId: number;
  name: string;
  description: string;
  state: number | TaskState;
}): Transaction {
  requirePackage();
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULES.PROJECT}::${FUNCTIONS.MEMBER_UPDATE_SUBTASK}`,
    arguments: [
      tx.object(requireId(args.projectId, 'Project object id')),
      tx.pure.id(args.taskId),
      tx.pure.u64(args.subtaskId),
      tx.pure.string(args.name),
      tx.pure.string(args.description),
      tx.pure.u8(normalizeState(args.state)),
    ],
  });
  return tx;
}

export function buildManagerDeleteSubtaskTx(args: {
  managerCapId: string;
  projectId: string;
  taskId: string;
  subtaskId: number;
}): Transaction {
  requirePackage();
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULES.PROJECT}::${FUNCTIONS.MANAGER_DELETE_SUBTASK}`,
    arguments: [
      tx.object(requireId(args.managerCapId, 'ProjectManagerCap object id')),
      tx.object(requireId(args.projectId, 'Project object id')),
      tx.pure.id(args.taskId),
      tx.pure.u64(args.subtaskId),
    ],
  });
  return tx;
}

export function buildMemberDeleteSubtaskTx(args: {
  projectId: string;
  taskId: string;
  subtaskId: number;
}): Transaction {
  requirePackage();
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULES.PROJECT}::${FUNCTIONS.MEMBER_DELETE_SUBTASK}`,
    arguments: [
      tx.object(requireId(args.projectId, 'Project object id')),
      tx.pure.id(args.taskId),
      tx.pure.u64(args.subtaskId),
    ],
  });
  return tx;
}

export function buildManagerAddAttachmentTx(args: {
  managerCapId: string;
  projectId: string;
  taskId: string;
  name: string;
  url: string;
}): Transaction {
  requirePackage();
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULES.PROJECT}::${FUNCTIONS.MANAGER_ADD_ATTACHMENT}`,
    arguments: [
      tx.object(requireId(args.managerCapId, 'ProjectManagerCap object id')),
      tx.object(requireId(args.projectId, 'Project object id')),
      tx.pure.id(args.taskId),
      tx.pure.string(args.name),
      tx.pure.string(args.url),
    ],
  });
  return tx;
}

export function buildAssigneeAddAttachmentTx(args: {
  projectId: string;
  taskId: string;
  name: string;
  url: string;
}): Transaction {
  requirePackage();
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULES.PROJECT}::${FUNCTIONS.ASSIGNEE_ADD_ATTACHMENT}`,
    arguments: [
      tx.object(requireId(args.projectId, 'Project object id')),
      tx.pure.id(args.taskId),
      tx.pure.string(args.name),
      tx.pure.string(args.url),
    ],
  });
  return tx;
}

export function buildManagerRemoveAttachmentTx(args: {
  managerCapId: string;
  projectId: string;
  taskId: string;
  attachmentId: number;
}): Transaction {
  requirePackage();
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULES.PROJECT}::${FUNCTIONS.MANAGER_REMOVE_ATTACHMENT}`,
    arguments: [
      tx.object(requireId(args.managerCapId, 'ProjectManagerCap object id')),
      tx.object(requireId(args.projectId, 'Project object id')),
      tx.pure.id(args.taskId),
      tx.pure.u64(args.attachmentId),
    ],
  });
  return tx;
}

export function buildAssigneeRemoveAttachmentTx(args: {
  projectId: string;
  taskId: string;
  attachmentId: number;
}): Transaction {
  requirePackage();
  const tx = new Transaction();
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULES.PROJECT}::${FUNCTIONS.ASSIGNEE_REMOVE_ATTACHMENT}`,
    arguments: [
      tx.object(requireId(args.projectId, 'Project object id')),
      tx.pure.id(args.taskId),
      tx.pure.u64(args.attachmentId),
    ],
  });
  return tx;
}
