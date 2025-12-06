/**
 * Create Project Modal
 * Modal form to create a new project on the blockchain
 */

'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CreateProjectInput } from '@/types/project';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateProjectInput) => Promise<void>;
}

export function CreateProjectModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; description?: string; displayName?: string }>({});

  const validate = () => {
    const newErrors: { name?: string; description?: string; displayName?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Project name is required';
    } else if (name.length < 3) {
      newErrors.name = 'Project name must be at least 3 characters';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
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
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        displayName: displayName.trim(),
      });

      // Reset form and close modal on success
      setName('');
      setDescription('');
      setDisplayName('');
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Failed to create project:', error);
      // Error is handled in the parent component
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setName('');
      setDescription('');
      setDisplayName('');
      setErrors({});
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Project" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Project Name"
          placeholder="Enter project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          disabled={loading}
          required
        />

        <Textarea
          label="Description"
          placeholder="Describe your project"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
          rows={4}
          disabled={loading}
          required
        />

        <Input
          label="Your display name (stored in project state)"
          placeholder="ex: Alice"
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
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  );
}
