/**
 * Subtask List Component
 * Displays and manages subtasks for a task
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { useWallet } from '@/contexts/WalletContext';
import {
  buildManagerAddSubtaskTx,
  buildMemberAddSubtaskTx,
  buildManagerUpdateSubtaskTx,
  buildMemberUpdateSubtaskTx,
  buildManagerDeleteSubtaskTx,
  buildMemberDeleteSubtaskTx,
} from '@/lib/sui/transactions';

interface Subtask {
  subtask_id: string;
  name: string;
  description: string;
  state: number;
}

interface SubtaskListProps {
  subtasks: Subtask[];
  taskId: string;
  projectId: string;
  managerCapId?: string;
  isAssignee: boolean;
  onSubtasksUpdated: () => void;
}

const STATE_LABELS = {
  0: 'To Do',
  1: 'In Progress',
  2: 'Done',
};

export function SubtaskList({
  subtasks,
  taskId,
  projectId,
  managerCapId,
  isAssignee,
  onSubtasksUpdated,
}: SubtaskListProps) {
  const { signAndExecuteTransaction } = useWallet();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [state, setState] = useState(0);

  const isManager = !!managerCapId;
  const canManage = isManager || isAssignee;

  const handleAddSubtask = async () => {
    if (!name.trim()) return;

    setLoading(true);
    try {
      const tx = isManager
        ? buildManagerAddSubtaskTx({
            managerCapId: managerCapId!,
            projectId,
            taskId,
            name,
            description,
            state
          })
        : buildMemberAddSubtaskTx({ projectId, taskId, name, description, state });

      await signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: () => {
            setName('');
            setDescription('');
            setState(0);
            setIsAdding(false);
            setTimeout(() => onSubtasksUpdated(), 1500);
          },
        }
      );
    } catch (error) {
      console.error('Failed to add subtask:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubtask = async (subtask: Subtask) => {
    setLoading(true);
    try {
      const tx = isManager
        ? buildManagerUpdateSubtaskTx({
            managerCapId: managerCapId!,
            projectId,
            taskId,
            subtaskId: parseInt(subtask.subtask_id),
            name,
            description,
            state
          })
        : buildMemberUpdateSubtaskTx({
            projectId,
            taskId,
            subtaskId: parseInt(subtask.subtask_id),
            name,
            description,
            state
          });

      await signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: () => {
            setEditingId(null);
            setName('');
            setDescription('');
            setState(0);
            setTimeout(() => onSubtasksUpdated(), 1500);
          },
        }
      );
    } catch (error) {
      console.error('Failed to update subtask:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    if (!confirm('Are you sure you want to delete this subtask?')) return;

    setLoading(true);
    try {
      const tx = isManager
        ? buildManagerDeleteSubtaskTx({
            managerCapId: managerCapId!,
            projectId,
            taskId,
            subtaskId: parseInt(subtaskId)
          })
        : buildMemberDeleteSubtaskTx({ projectId, taskId, subtaskId: parseInt(subtaskId) });

      await signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: () => {
            setTimeout(() => onSubtasksUpdated(), 1500);
          },
        }
      );
    } catch (error) {
      console.error('Failed to delete subtask:', error);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (subtask: Subtask) => {
    setEditingId(subtask.subtask_id);
    setName(subtask.name);
    setDescription(subtask.description);
    setState(subtask.state);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setName('');
    setDescription('');
    setState(0);
  };

  return (
    <div className="space-y-3">
      {/* Existing subtasks */}
      {subtasks.map((subtask) => (
        <div key={subtask.subtask_id} className="border border-gray-200 rounded-lg p-4">
          {editingId === subtask.subtask_id ? (
            <div className="space-y-3">
              <Input
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
              <Textarea
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                disabled={loading}
              />
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
              <div className="flex justify-end space-x-2">
                <Button size="sm" variant="secondary" onClick={cancelEdit} disabled={loading}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleUpdateSubtask(subtask)}
                  loading={loading}
                >
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h5 className="font-medium text-gray-900">{subtask.name}</h5>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      subtask.state === 2
                        ? 'bg-green-100 text-green-700'
                        : subtask.state === 1
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {STATE_LABELS[subtask.state as keyof typeof STATE_LABELS]}
                  </span>
                </div>
                {subtask.description && (
                  <p className="text-sm text-gray-600 mt-1">{subtask.description}</p>
                )}
              </div>
              {canManage && (
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => startEditing(subtask)}
                    className="text-sm text-primary-600 hover:text-primary-700"
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteSubtask(subtask.subtask_id)}
                    className="text-sm text-red-600 hover:text-red-700"
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Add new subtask form */}
      {isAdding ? (
        <div className="border border-gray-200 rounded-lg p-4 space-y-3">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Subtask name"
            disabled={loading}
          />
          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Subtask description"
            rows={2}
            disabled={loading}
          />
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
          <div className="flex justify-end space-x-2">
            <Button size="sm" variant="secondary" onClick={cancelEdit} disabled={loading}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAddSubtask} loading={loading}>
              Add Subtask
            </Button>
          </div>
        </div>
      ) : (
        canManage && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsAdding(true)}
            disabled={loading}
          >
            + Add Subtask
          </Button>
        )
      )}
    </div>
  );
}
