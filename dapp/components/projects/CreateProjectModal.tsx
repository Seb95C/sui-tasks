/**
 * Create Project Modal
 * Modal form to create a new project on the blockchain
 */

'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { CreateProjectInput } from '@/types/project';
import { MemberRole } from '@/types/user';
import { formatEnumLabel } from '@/lib/utils/formatting';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateProjectInput) => Promise<void>;
  onAddInitialMembers?: (projectId: string, members: { address: string; role: MemberRole }[]) => Promise<void>;
}

interface InitialMember {
  address: string;
  role: MemberRole;
}

export function CreateProjectModal({
  isOpen,
  onClose,
  onSubmit,
  onAddInitialMembers,
}: CreateProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [initialMembers, setInitialMembers] = useState<InitialMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; description?: string }>({});

  const validate = () => {
    const newErrors: { name?: string; description?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Project name is required';
    } else if (name.length < 3) {
      newErrors.name = 'Project name must be at least 3 characters';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      await onSubmit({ name: name.trim(), description: description.trim() });

      // Reset form and close modal on success
      setName('');
      setDescription('');
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
      setInitialMembers([]);
      setErrors({});
      onClose();
    }
  };

  const addMemberField = () => {
    setInitialMembers([...initialMembers, { address: '', role: MemberRole.MEMBER }]);
  };

  const removeMemberField = (index: number) => {
    setInitialMembers(initialMembers.filter((_, i) => i !== index));
  };

  const updateMemberAddress = (index: number, address: string) => {
    const updated = [...initialMembers];
    updated[index].address = address;
    setInitialMembers(updated);
  };

  const updateMemberRole = (index: number, role: MemberRole) => {
    const updated = [...initialMembers];
    updated[index].role = role;
    setInitialMembers(updated);
  };

  const roleOptions = Object.values(MemberRole).map((r) => ({
    value: r,
    label: formatEnumLabel(r),
  }));

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Project" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> You can add team members now or later from the project dashboard.
          </p>
        </div>

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

        {/* Initial Members Section */}
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">
              Team Members (Optional)
            </label>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={addMemberField}
              disabled={loading}
            >
              + Add Member
            </Button>
          </div>

          {initialMembers.length === 0 && (
            <p className="text-sm text-gray-500 italic">
              No members added yet. Click "+ Add Member" to invite team members.
            </p>
          )}

          <div className="space-y-3">
            {initialMembers.map((member, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1">
                  <Input
                    placeholder="0x... (Sui wallet address)"
                    value={member.address}
                    onChange={(e) => updateMemberAddress(index, e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="w-32">
                  <Select
                    value={member.role}
                    onValueChange={(value) => updateMemberRole(index, value as MemberRole)}
                    options={roleOptions}
                    disabled={loading}
                  />
                </div>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => removeMemberField(index)}
                  disabled={loading}
                >
                  ✕
                </Button>
              </div>
            ))}
          </div>

          {initialMembers.length > 0 && (
            <div className="mt-2 bg-gray-50 rounded p-2 text-xs text-gray-600">
              💡 Sample addresses: 0xabcdef1234567890abcdef1234567890abcdef12 (Bob) or 0x9876543210fedcba9876543210fedcba98765432 (Charlie)
            </div>
          )}
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
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  );
}
