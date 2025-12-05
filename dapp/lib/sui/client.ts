/**
 * Sui Client Setup
 * Configures the Sui client for blockchain interactions
 */

import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { SUI_NETWORK, getRpcUrl } from './constants';

/**
 * Initialize Sui client based on network configuration
 */
export function createSuiClient(): SuiClient {
  try {
    const rpcUrl = getRpcUrl();
    return new SuiClient({ url: rpcUrl });
  } catch (error) {
    // Fallback to getFullnodeUrl if custom RPC fails
    console.warn('Using fallback RPC URL', error);
    return new SuiClient({
      url: getFullnodeUrl(SUI_NETWORK as 'devnet' | 'testnet' | 'mainnet')
    });
  }
}

// Singleton instance
let suiClientInstance: SuiClient | null = null;

/**
 * Get shared Sui client instance
 */
export function getSuiClient(): SuiClient {
  if (!suiClientInstance) {
    suiClientInstance = createSuiClient();
  }
  return suiClientInstance;
}
