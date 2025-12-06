/**
 * Add Member Modal
 * Modal form to add a new member to a project
 */

'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { MemberRole } from '@/types/user';
import { formatEnumLabel } from '@/lib/utils/formatting';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onSubmit: (projectId: string, userAddress: string, role: MemberRole) => Promise<void>;
}

export function AddMemberModal({
  isOpen,
  onClose,
  projectId,
  onSubmit,
}: AddMemberModalProps) {
  const [userAddress, setUserAddress] = useState('');
  const [role, setRole] = useState<MemberRole>(MemberRole.MEMBER);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ userAddress?: string }>({});

  const validate = () => {
    const newErrors: { userAddress?: string } = {};

    if (!userAddress.trim()) {
      newErrors.userAddress = 'Sui address is required';
    } else if (!userAddress.startsWith('0x')) {
      newErrors.userAddress = 'Address must start with 0x';
    } else if (userAddress.length < 10) {
      newErrors.userAddress = 'Invalid Sui address format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      await onSubmit(projectId, userAddress.trim(), role);

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
    setRole(MemberRole.MEMBER);
    setErrors({});
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  const roleOptions = Object.values(MemberRole).map((r) => ({
    value: r,
    label: formatEnumLabel(r),
  }));

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

        <Select
          label="Role"
          value={role}
          onValueChange={(value) => setRole(value as MemberRole)}
          options={roleOptions}
          disabled={loading}
        />

        <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
          <p className="font-medium text-gray-900">Role Permissions:</p>
          <ul className="space-y-1 text-gray-600">
            <li><strong>Admin:</strong> Full access - can edit all tickets, add/remove members</li>
            <li><strong>Member:</strong> Can create and edit own tickets</li>
          </ul>
        </div>

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
