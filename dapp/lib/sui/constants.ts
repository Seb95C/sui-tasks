/**
 * Sui Blockchain Constants
 * Centralizes package IDs, module/function names, and object IDs required by the Move package.
 */

export const SUI_NETWORK = process.env.NEXT_PUBLIC_SUI_NETWORK || 'testnet';
export const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID || '';
export const RPC_URL = process.env.NEXT_PUBLIC_SUI_RPC_URL;

// Shared on-chain objects
export const OBJECT_IDS = {
  CLOCK: process.env.NEXT_PUBLIC_CLOCK_OBJECT_ID || '0x6',
  USERNAME_REGISTRY: process.env.NEXT_PUBLIC_USERNAME_REGISTRY_ID || '',
} as const;

// Module names in the jira_engine Move package
export const MODULES = {
  PROJECT: 'project',
  USERNAME_REGISTRY: 'username_registry',
} as const;

// Function names in Move modules (kept for clarity when building transactions)
export const FUNCTIONS = {
  REGISTER_USERNAME: 'register_username',
  MINT_PROJECT: 'mint_project',
  CLOSE_PROJECT: 'close_project',
  ADD_MEMBER: 'add_member',
  REMOVE_MEMBER: 'remove_member',
  MANAGER_ADD_TASK: 'add_task',
  MEMBER_CREATE_TASK: 'member_create_task',
  DELETE_TASK: 'delete_task',
  MANAGER_UPDATE_TASK_NAME: 'manager_update_task_name',
  MANAGER_UPDATE_TASK_DESCRIPTION: 'manager_update_task_descripiton',
  MANAGER_UPDATE_TASK_ASSIGNEE: 'manager_update_task_asignee',
  MANAGER_UPDATE_TASK_STATE: 'manager_update_task_state',
  MANAGER_UPDATE_TASK_DUE_DATE: 'manager_update_task_due_date',
  ASSIGNEE_UPDATE_TASK_STATE: 'assignee_update_task_state',
  MEMBER_UPDATE_TASK_NAME: 'member_update_task_name',
  MEMBER_UPDATE_TASK_DESCRIPTION: 'member_update_task_description',
  MEMBER_UPDATE_TASK_DUE_DATE: 'member_update_task_due_date',
  MANAGER_ADD_SUBTASK: 'manager_add_subtask',
  MEMBER_ADD_SUBTASK: 'member_add_subtask',
  MANAGER_UPDATE_SUBTASK: 'manager_update_subtask',
  MEMBER_UPDATE_SUBTASK: 'member_update_subtask',
  MANAGER_DELETE_SUBTASK: 'manager_delete_subtask',
  MEMBER_DELETE_SUBTASK: 'member_delete_subtask',
  MANAGER_ADD_ATTACHMENT: 'manager_add_attachment',
  ASSIGNEE_ADD_ATTACHMENT: 'assignee_add_attachment',
  MANAGER_REMOVE_ATTACHMENT: 'manager_remove_attachment',
  ASSIGNEE_REMOVE_ATTACHMENT: 'assignee_remove_attachment',
} as const;

// Network configurations
export const NETWORK_CONFIGS = {
  devnet: {
    rpc: 'https://fullnode.devnet.sui.io:443',
    faucet: 'https://faucet.devnet.sui.io/gas',
  },
  testnet: {
    rpc: 'https://fullnode.testnet.sui.io:443',
    faucet: 'https://faucet.testnet.sui.io/gas',
  },
  mainnet: {
    rpc: 'https://fullnode.mainnet.sui.io:443',
    faucet: null,
  },
} as const;

export function getRpcUrl(): string {
  if (RPC_URL) return RPC_URL;
  return NETWORK_CONFIGS[SUI_NETWORK as keyof typeof NETWORK_CONFIGS]?.rpc || NETWORK_CONFIGS.testnet.rpc;
}
