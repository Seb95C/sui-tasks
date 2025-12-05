/**
 * Sui Blockchain Constants
 * Contains package IDs, module names, and network configuration
 */

// Get environment variables
export const SUI_NETWORK = process.env.NEXT_PUBLIC_SUI_NETWORK || 'testnet';
export const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID || '';
export const RPC_URL = process.env.NEXT_PUBLIC_SUI_RPC_URL;

// Module names in your Move smart contract
export const MODULES = {
  PROJECT: 'project',
  TICKET: 'ticket',
  MEMBERSHIP: 'membership',
} as const;

// Function names in Move modules
export const FUNCTIONS = {
  // Project functions
  CREATE_PROJECT: 'create_project',
  UPDATE_PROJECT: 'update_project',
  ADD_MEMBER: 'add_member',

  // Ticket functions
  CREATE_TICKET: 'create_ticket',
  UPDATE_TICKET: 'update_ticket',
  UPDATE_TICKET_STATUS: 'update_ticket_status',
  ASSIGN_TICKET: 'assign_ticket',
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
