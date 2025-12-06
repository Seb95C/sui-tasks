/**
 * Member Management Modal
 * For project managers to add and remove members
 */

'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useWallet } from '@/contexts/WalletContext';
import {
  buildAddMemberTx,
  buildRemoveMemberTx,
} from '@/lib/sui/transactions';
import { fetchAddressByUsername } from '@/lib/api/usernames';

interface Member {
  address: string;
  displayName: string;
  joinedAt: string;
}

interface MemberManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  managerCapId: string;
  members: Member[];
  managerAddress: string;
  onMembersUpdated: () => void;
}

export function MemberManagementModal({
  isOpen,
  onClose,
  projectId,
  managerCapId,
  members,
  managerAddress,
  onMembersUpdated,
}: MemberManagementModalProps) {
  const { signAndExecuteTransaction } = useWallet();
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleAddMember = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Lookup address by username
      const userRecord = await fetchAddressByUsername(username);

      if (!userRecord) {
        setError('Username not found in registry. User must register first.');
        setLoading(false);
        return;
      }

      const tx = buildAddMemberTx({
        managerCapId,
        projectId,
        memberAddress: userRecord.address,
        displayName: userRecord.username,
      });

      await signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: () => {
            setUsername('');
            setError('');
            setIsAdding(false);
            setTimeout(() => onMembersUpdated(), 1500);
          },
        }
      );
    } catch (error) {
      console.error('Failed to add member:', error);
      setError('Failed to add member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (address: string) => {
    if (address === managerAddress) {
      alert('Cannot remove the project manager');
      return;
    }

    if (!confirm('Are you sure you want to remove this member?')) return;

    setLoading(true);
    try {
      const tx = buildRemoveMemberTx({ managerCapId, projectId, memberAddress: address });

      await signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: () => {
            setTimeout(() => onMembersUpdated(), 1500);
          },
        }
      );
    } catch (error) {
      console.error('Failed to remove member:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Members" size="lg">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Add or remove members from this project. Only registered users can be added.
        </p>

        {/* Current members list */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Current Members</h4>
          <div className="space-y-2">
            {members.map((member) => (
              <div
                key={member.address}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{member.displayName}</p>
                  <p className="text-xs text-gray-500 font-mono">{member.address}</p>
                  {member.address === managerAddress && (
                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded mt-1 inline-block">
                      Manager
                    </span>
                  )}
                </div>
                {member.address !== managerAddress && (
                  <button
                    onClick={() => handleRemoveMember(member.address)}
                    className="text-sm text-red-600 hover:text-red-700"
                    disabled={loading}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Add member form */}
        {isAdding ? (
          <div className="border-t border-gray-200 pt-4 space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Add New Member</h4>
            <p className="text-xs text-gray-600">
              Enter the username of a registered user to add them to the project.
            </p>
            <Input
              label="Username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              placeholder="e.g., alice"
              disabled={loading}
              error={error}
            />
            <div className="flex justify-end space-x-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setIsAdding(false);
                  setUsername('');
                  setError('');
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleAddMember} loading={loading}>
                Add Member
              </Button>
            </div>
          </div>
        ) : (
          <div className="border-t border-gray-200 pt-4">
            <Button size="sm" onClick={() => setIsAdding(true)} disabled={loading}>
              + Add Member
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
