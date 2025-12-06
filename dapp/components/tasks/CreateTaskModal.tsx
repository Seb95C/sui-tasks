/**
 * Create Task Modal
 * For managers to create tasks and assign to any member
 * For members to create tasks for themselves
 */

'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { useWallet } from '@/contexts/WalletContext';
import {
  buildManagerAddTaskTx,
  buildMemberCreateTaskTx,
} from '@/lib/sui/transactions';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  managerCapId?: string; // Present if user is manager
  members: Array<{ address: string; displayName: string }>;
  currentUserAddress: string;
  onTaskCreated: () => void;
}

export function CreateTaskModal({
  isOpen,
  onClose,
  projectId,
  managerCapId,
  members,
  currentUserAddress,
  onTaskCreated,
}: CreateTaskModalProps) {
  const { signAndExecuteTransaction } = useWallet();
  const [loading, setLoading] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState(currentUserAddress);
  const [state, setState] = useState(0);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const isManager = !!managerCapId;

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert('Please enter a task name');
      return;
    }

    setLoading(true);
    try {
      const dueDateTimestamp = new Date(dueDate).getTime();

      const tx = isManager
        ? buildManagerAddTaskTx({
            managerCapId: managerCapId!,
            projectId,
            name,
            description,
            assignee,
            state,
            dueDate: dueDateTimestamp
          })
        : buildMemberCreateTaskTx({
            projectId,
            name,
            description,
            state,
            dueDate: dueDateTimestamp
          });

      await signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: () => {
            // Reset form
            setName('');
            setDescription('');
            setAssignee(currentUserAddress);
            setState(0);
            setDueDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

            onClose();
            setTimeout(() => onTaskCreated(), 1500);
          },
        }
      );
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task">
      <div className="space-y-4">
        <Input
          label="Task Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter task name"
          disabled={loading}
          required
        />

        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the task..."
          rows={4}
          disabled={loading}
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <select
              value={state}
              onChange={(e) => setState(parseInt(e.target.value))}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value={0}>To Do</option>
              <option value={1}>In Progress</option>
              <option value={2}>Done</option>
            </select>
          </div>

          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={loading}
          />
        </div>

        {isManager && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign To
            </label>
            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {members.map((member) => (
                <option key={member.address} value={member.address}>
                  {member.displayName}
                </option>
              ))}
            </select>
          </div>
        )}

        {!isManager && (
          <p className="text-sm text-gray-600">
            This task will be assigned to you
          </p>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            Create Task
          </Button>
        </div>
      </div>
    </Modal>
  );
}
