/**
 * Username Registration Modal
 * Shown when a user connects their wallet but doesn't have a username
 */

'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface UsernameRegistrationModalProps {
  isOpen: boolean;
  onRegister: (username: string) => Promise<void>;
  isRegistering: boolean;
}

export function UsernameRegistrationModal({
  isOpen,
  onRegister,
  isRegistering,
}: UsernameRegistrationModalProps) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const validateUsername = (value: string): boolean => {
    if (value.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }
    if (value.length > 20) {
      setError('Username must be at most 20 characters');
      return false;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      setError('Username can only contain letters, numbers, hyphens, and underscores');
      return false;
    }
    setError('');
    return true;
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    if (value) {
      validateUsername(value);
    } else {
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (!validateUsername(username)) {
      return;
    }

    try {
      await onRegister(username);
    } catch (err: any) {
      setError(err.message || 'Failed to register username');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} // Cannot close - user must register
      title="Welcome! Choose Your Username"
    >
      <div className="space-y-4">
        <p className="text-gray-600">
          Before you can use the app, please choose a username. This will be your display name
          across all projects.
        </p>

        <div>
          <Input
            label="Username"
            value={username}
            onChange={(e) => handleUsernameChange(e.target.value)}
            placeholder="Enter username (3-20 characters)"
            disabled={isRegistering}
            error={error}
            autoFocus
          />
          <p className="mt-1 text-sm text-gray-500">
            Letters, numbers, hyphens, and underscores only
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            onClick={handleSubmit}
            disabled={!username || !!error || isRegistering}
            loading={isRegistering}
          >
            Register Username
          </Button>
        </div>
      </div>
    </Modal>
  );
}
