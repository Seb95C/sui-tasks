/**
 * Home Page
 * Landing page with CTA to connect wallet and view projects
 * Handles username registration flow
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import { Button } from '@/components/ui/Button';
import { UsernameRegistrationModal } from '@/components/user/UsernameRegistrationModal';
import { fetchUsernameByAddress } from '@/lib/api/usernames';
import { buildRegisterUsernameTx } from '@/lib/sui/transactions';

export default function HomePage() {
  const { isConnected, currentAccount, signAndExecuteTransaction } = useWallet();
  const router = useRouter();
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  // Check for username when wallet connects
  useEffect(() => {
    async function checkUsername() {
      if (!isConnected || !currentAccount?.address) {
        return;
      }

      setIsCheckingUsername(true);
      try {
        const usernameRecord = await fetchUsernameByAddress(currentAccount.address);

        if (usernameRecord) {
          // User has a username, redirect to projects
          router.push('/projects');
        } else {
          // User doesn't have a username, show registration modal
          setShowUsernameModal(true);
        }
      } catch (error) {
        console.error('Error checking username:', error);
        // On error, show registration modal to be safe
        setShowUsernameModal(true);
      } finally {
        setIsCheckingUsername(false);
      }
    }

    checkUsername();
  }, [isConnected, currentAccount, router]);

  const handleRegisterUsername = async (username: string) => {
    if (!currentAccount?.address) {
      throw new Error('Wallet not connected');
    }

    setIsRegistering(true);
    try {
      const tx = buildRegisterUsernameTx(username);

      await signAndExecuteTransaction(
        {
          transaction: tx,
        },
        {
          onSuccess: () => {
            // Wait a bit for indexer to pick up the event
            setTimeout(() => {
              setShowUsernameModal(false);
              router.push('/projects');
            }, 2000);
          },
          onError: (error) => {
            console.error('Failed to register username:', error);
            throw error;
          },
        }
      );
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Failed to register username');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center">
        {/* Hero section */}
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Decentralized Project Management
        </h1>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          Manage your projects and tasks on the Sui blockchain.
          Transparent, immutable, and decentralized.
        </p>

        {/* CTA buttons */}
        <div className="flex justify-center space-x-4">
          {isCheckingUsername ? (
            <Button size="lg" disabled>
              Checking username...
            </Button>
          ) : !isConnected ? (
            <div className="text-sm text-gray-500">
              Connect your wallet using the button in the top right
            </div>
          ) : null}
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Blockchain Powered</h3>
            <p className="text-gray-600">
              All projects and tasks are stored on the Sui blockchain, ensuring transparency and immutability.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Team Collaboration</h3>
            <p className="text-gray-600">
              Invite team members, assign tasks, and manage permissions on-chain.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Fast & Efficient</h3>
            <p className="text-gray-600">
              Off-chain indexer provides fast queries while maintaining blockchain integrity.
            </p>
          </div>
        </div>
      </div>

      {/* Username Registration Modal */}
      <UsernameRegistrationModal
        isOpen={showUsernameModal}
        onRegister={handleRegisterUsername}
        isRegistering={isRegistering}
      />
    </div>
  );
}
