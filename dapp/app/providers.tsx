/**
 * Providers Component
 * Wraps the app with all necessary providers
 * This is a client component to enable React Query and wallet providers
 */

"use client";

import React from "react";
import {
  SuiClientProvider,
  WalletProvider as DappKitWalletProvider,
} from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getFullnodeUrl } from "@mysten/sui/client";
import { Theme, Box } from "@radix-ui/themes";
import { WalletProvider } from "@/contexts/WalletContext";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { TicketProvider } from "@/contexts/TicketContext";
import { Header } from "@/components/layout/Header";

// Create a client
const queryClient = new QueryClient();

// Get network configuration
const network = (process.env.NEXT_PUBLIC_SUI_NETWORK || "testnet") as
  | "devnet"
  | "testnet"
  | "mainnet";

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
              <TicketProvider>
                <Theme accentColor="indigo" grayColor="sand" radius="large">
                  <Box minHeight="100vh" className="bg-[radial-gradient(circle_at_10%_20%,rgba(99,102,241,0.04),transparent_25%),radial-gradient(circle_at_90%_10%,rgba(56,189,248,0.06),transparent_22%)]">
                    <Header />
                    <main className="min-h-[calc(100vh-64px)]">{children}</main>
                  </Box>
                </Theme>
              </TicketProvider>
            </ProjectProvider>
          </WalletProvider>
        </DappKitWalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
