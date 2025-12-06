/**
 * Create Ticket Modal
 * Form to create a new ticket on the blockchain
 */

'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { CreateTicketInput, TicketPriority } from '@/types/ticket';
import { ProjectMember } from '@/types/user';
import { formatAddress, formatEnumLabel } from '@/lib/utils/formatting';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  members: ProjectMember[];
  onSubmit: (input: CreateTicketInput) => Promise<void>;
}

export function CreateTicketModal({
  isOpen,
  onClose,
  projectId,
  members,
  onSubmit,
}: CreateTicketModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>(TicketPriority.MEDIUM);
  const [assigneeId, setAssigneeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
  }>({});

  const validate = () => {
    const newErrors: { title?: string; description?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
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
        projectId,
        title: title.trim(),
        description: description.trim(),
        priority,
        assigneeId: assigneeId || undefined,
      });

      // Reset form and close
      resetForm();
      onClose();
    } catch (error) {
      console.error('Failed to create ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority(TicketPriority.MEDIUM);
    setAssigneeId('');
    setErrors({});
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  const priorityOptions = Object.values(TicketPriority).map((p) => ({
    value: p,
    label: formatEnumLabel(p),
  }));

  const assigneeOptions = [
    { value: '', label: 'Unassigned' },
    ...members.map((m) => ({
      value: m.userId,
      label: m.user.username || formatAddress(m.user.address),
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Ticket"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          placeholder="Enter ticket title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          disabled={loading}
          required
        />

        <Textarea
          label="Description"
          placeholder="Describe the ticket in detail"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
          rows={5}
          disabled={loading}
          required
        />

        <Select
          label="Priority"
          value={priority}
          onValueChange={(value) => setPriority(value as TicketPriority)}
          options={priorityOptions}
          disabled={loading}
        />

        <Select
          label="Assignee"
          value={assigneeId}
          onValueChange={(value) => setAssigneeId(value)}
          options={assigneeOptions}
          disabled={loading}
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
            Create Ticket
          </Button>
        </div>
      </form>
    </Modal>
  );
}
