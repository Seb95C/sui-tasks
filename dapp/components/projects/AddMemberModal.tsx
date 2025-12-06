/**
 * Add Member Modal
 * Modal form to add a new member to a project
 */

'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { fetchAddressByUsername } from '@/lib/api/usernames';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onSubmit: (projectId: string, userAddress: string, username: string) => Promise<void>;
}

export function AddMemberModal({
  isOpen,
  onClose,
  projectId,
  onSubmit,
}: AddMemberModalProps) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setError('Username is required');
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

      await onSubmit(projectId, userRecord.address, userRecord.username);

      // Reset form and close
      resetForm();
      onClose();
    } catch (error) {
      console.error('Failed to add member:', error);
      setError('Failed to add member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setUsername('');
    setError('');
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
            <strong>💡 Username Registry:</strong> Only registered users can be added as members.
          </p>
          <div className="mt-2 space-y-1 text-xs text-blue-700">
            <p>Enter the username of a user who has already registered in the system.</p>
            <p className="font-mono mt-2">Sample usernames: alice, bob, charlie</p>
          </div>
        </div>

        <Input
          label="Username"
          placeholder="e.g., alice"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setError('');
          }}
          error={error}
          disabled={loading}
          required
          helperText="Enter the username of the person you want to add"
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
