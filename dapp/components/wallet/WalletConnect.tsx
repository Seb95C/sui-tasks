/**
 * Wallet Connect Button
 * Button to connect/disconnect Sui wallet
 */

'use client';

import React from 'react';
import { ConnectButton } from '@mysten/dapp-kit';
import { DropdownMenu, Flex, Text, Badge, Box } from '@radix-ui/themes';
import { useWallet } from '@/contexts/WalletContext';
import { formatAddress } from '@/lib/utils/formatting';
import { Button } from '@/components/ui/Button';

export function WalletConnect() {
  const { currentAccount, isConnected, disconnect } = useWallet();

  if (!isConnected || !currentAccount) {
    return (
      <ConnectButton className="!bg-indigo-600 !text-white !px-4 !py-2 !rounded-full hover:!bg-indigo-700 !transition-colors !text-sm !font-medium" />
    );
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button variant="ghost" size="sm">
          <Flex align="center" gap="2">
            <Badge color="green" variant="solid">
              ●
            </Badge>
            <Text weight="medium">{formatAddress(currentAccount.address)}</Text>
          </Flex>
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        <DropdownMenu.Label>Connected Address</DropdownMenu.Label>
        <DropdownMenu.Item disabled>
          <Box maxWidth="240px" style={{ wordBreak: 'break-all' }}>
            <Text size="2">{currentAccount.address}</Text>
          </Box>
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item color="red" onSelect={disconnect}>
          Disconnect Wallet
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
