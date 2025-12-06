/**
 * Add Member Modal
 * Modal form to add a new member to a project
 */

'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onSubmit: (projectId: string, userAddress: string, displayName: string) => Promise<void>;
}

export function AddMemberModal({
  isOpen,
  onClose,
  projectId,
  onSubmit,
}: AddMemberModalProps) {
  const [userAddress, setUserAddress] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ userAddress?: string; displayName?: string }>({});

  const validate = () => {
    const newErrors: { userAddress?: string; displayName?: string } = {};

    if (!userAddress.trim()) {
      newErrors.userAddress = 'Sui address is required';
    } else if (!userAddress.startsWith('0x')) {
      newErrors.userAddress = 'Address must start with 0x';
    } else if (userAddress.length < 10) {
      newErrors.userAddress = 'Invalid Sui address format';
    }

    if (!displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      await onSubmit(projectId, userAddress.trim(), displayName.trim());

      // Reset form and close
      resetForm();
      onClose();
    } catch (error) {
      console.error('Failed to add member:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setUserAddress('');
    setDisplayName('');
    setErrors({});
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Team Member"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800">
            <strong>💡 Simulation Mode:</strong> You can add any Sui address or use one of the sample addresses below:
          </p>
          <div className="mt-2 space-y-1 text-xs font-mono text-blue-700">
            <p>• 0xabcdef1234567890abcdef1234567890abcdef12 (Bob)</p>
            <p>• 0x9876543210fedcba9876543210fedcba98765432 (Charlie)</p>
          </div>
        </div>

        <Input
          label="Member Sui Address"
          placeholder="0x..."
          value={userAddress}
          onChange={(e) => setUserAddress(e.target.value)}
          error={errors.userAddress}
          disabled={loading}
          required
          helperText="Enter the Sui wallet address of the person you want to add"
        />

        <Input
          label="Display name"
          placeholder="Team member name as it should appear"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          error={errors.displayName}
          disabled={loading}
          required
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Add Member
          </Button>
        </div>
      </form>
    </Modal>
  );
}
