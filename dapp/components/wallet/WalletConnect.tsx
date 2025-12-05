/**
 * Wallet Connect Button
 * Button to connect/disconnect Sui wallet
 */

'use client';

import React, { useState } from 'react';
import { ConnectButton } from '@mysten/dapp-kit';
import { useWallet } from '@/contexts/WalletContext';
import { formatAddress } from '@/lib/utils/formatting';

export function WalletConnect() {
  const { currentAccount, isConnected, disconnect } = useWallet();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleDisconnect = () => {
    disconnect();
    setIsDropdownOpen(false);
  };

  if (!isConnected || !currentAccount) {
    return (
      <ConnectButton className="!bg-primary-600 !text-white !px-4 !py-2 !rounded-lg hover:!bg-primary-700 !transition-colors !text-sm !font-medium" />
    );
  }

  return (
    <div className="relative">
      {/* Connected wallet display */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors"
      >
        <div className="w-2 h-2 bg-green-500 rounded-full" />
        <span className="font-medium text-sm">
          {formatAddress(currentAccount.address)}
        </span>
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isDropdownOpen && (
        <>
          {/* Backdrop to close dropdown */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsDropdownOpen(false)}
          />

          {/* Dropdown content */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20 animate-fade-in">
            <div className="p-4 border-b border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Connected Address</p>
              <p className="text-sm font-mono break-all text-gray-900">
                {currentAccount.address}
              </p>
            </div>

            <div className="p-2">
              <button
                onClick={handleDisconnect}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                Disconnect Wallet
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
