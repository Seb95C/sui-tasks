/**
 * Wallet Context
 * Manages Sui wallet connection state using @mysten/dapp-kit
 */

'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useDisconnectWallet,
  ConnectModal,
  useConnectWallet
} from '@mysten/dapp-kit';

interface WalletContextType {
  // Wallet connection state
  currentAccount: { address: string } | null;
  isConnected: boolean;

  // Actions
  connect: () => void;
  disconnect: () => void;

  // Sign and execute transactions
  signAndExecuteTransaction: any;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

/**
 * Wallet Provider - wraps the app and provides wallet functionality
 */
export function WalletProvider({ children }: { children: ReactNode }) {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const { mutate: disconnect } = useDisconnectWallet();
  const { mutate: connectWallet } = useConnectWallet();

  const value: WalletContextType = {
    currentAccount: currentAccount ? { address: currentAccount.address } : null,
    isConnected: !!currentAccount,
    connect: () => {
      // The connect modal will be handled by the ConnectButton component
      // This is a placeholder for compatibility
    },
    disconnect: () => disconnect(),
    signAndExecuteTransaction,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

/**
 * Hook to use wallet context
 * Must be used within WalletProvider
 */
export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
