/**
 * Providers Component
 * Wraps the app with all necessary providers
 * This is a client component to enable React Query and wallet providers
 */

'use client';

import React from 'react';
import { SuiClientProvider, WalletProvider as DappKitWalletProvider } from '@mysten/dapp-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getFullnodeUrl } from '@mysten/sui/client';
import { WalletProvider } from '@/contexts/WalletContext';
import { ProjectProvider } from '@/contexts/ProjectContext';
import { Header } from '@/components/layout/Header';

// Create a client
const queryClient = new QueryClient();

// Get network configuration
const network = (process.env.NEXT_PUBLIC_SUI_NETWORK || 'testnet') as 'devnet' | 'testnet' | 'mainnet';

const networks = {
  [network]: { url: getFullnodeUrl(network) },
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networks} defaultNetwork={network}>
        <DappKitWalletProvider>
          <WalletProvider>
            <ProjectProvider>
              {/* Global Header */}
              <Header />

              {/* Main Content */}
              <main className="min-h-screen">
                {children}
              </main>
            </ProjectProvider>
          </WalletProvider>
        </DappKitWalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
