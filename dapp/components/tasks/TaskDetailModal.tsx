/**
 * Task Detail Modal
 * Comprehensive task view with subtasks and attachments
 * Supports both manager and member permissions
 */

'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { SubtaskList } from './SubtaskList';
import { AttachmentList } from './AttachmentList';
import { useWallet } from '@/contexts/WalletContext';
import {
  buildManagerUpdateTaskNameTx,
  buildManagerUpdateTaskDescriptionTx,
  buildManagerUpdateTaskStateTx,
  buildManagerUpdateTaskDueDateTx,
  buildManagerUpdateTaskAssigneeTx,
  buildMemberUpdateTaskNameTx,
  buildMemberUpdateTaskDescriptionTx,
  buildMemberUpdateTaskDueDateTx,
  buildAssigneeUpdateTaskStateTx,
  buildDeleteTaskTx,
} from '@/lib/sui/transactions';
import { formatDueDate, isDueDateOverdue } from '@/lib/utils/formatting';

// Task states
const TASK_STATES = {
  TODO: 0,
  IN_PROGRESS: 1,
  DONE: 2,
} as const;

const STATE_LABELS = {
  0: 'To Do',
  1: 'In Progress',
  2: 'Done',
};

interface Task {
  id: string;
  projectId: string;
  name: string;
  description: string;
  assignee: string;
  state: number;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  subtasks: Array<{
    subtask_id: string;
    name: string;
    description: string;
    state: number;
  }>;
  attachments: Array<{
    attachment_id: string;
    name: string;
    url: string;
  }>;
}

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  projectId: string;
  managerCapId?: string; // Present if current user is manager
  isAssignee: boolean; // True if current user is the assignee
  currentUserAddress: string;
  members: Array<{ address: string; displayName: string }>;
  onTaskUpdated: () => void;
}

export function TaskDetailModal({
  isOpen,
  onClose,
  task,
  projectId,
  managerCapId,
  isAssignee,
  currentUserAddress,
  members,
  onTaskUpdated,
}: TaskDetailModalProps) {
  const { signAndExecuteTransaction } = useWallet();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [name, setName] = useState(task.name);
  const [description, setDescription] = useState(task.description);
  const [state, setState] = useState(task.state);
  const [assignee, setAssignee] = useState(task.assignee);
  const [dueDate, setDueDate] = useState(
    new Date(parseInt(task.dueDate)).toISOString().split('T')[0]
  );

  const isManager = !!managerCapId;
  const canEdit = isManager || isAssignee;
  const canEditAssignee = isManager; // Only managers can change assignee

  const handleUpdateField = async (
    field: 'name' | 'description' | 'state' | 'dueDate' | 'assignee',
    value: any
  ) => {
    setLoading(true);
    try {
      let tx;

      if (field === 'name') {
        tx = isManager
          ? buildManagerUpdateTaskNameTx({ managerCapId: managerCapId!, projectId, taskId: task.id, name: value })
          : buildMemberUpdateTaskNameTx({ projectId, taskId: task.id, name: value });
      } else if (field === 'description') {
        tx = isManager
          ? buildManagerUpdateTaskDescriptionTx({ managerCapId: managerCapId!, projectId, taskId: task.id, description: value })
          : buildMemberUpdateTaskDescriptionTx({ projectId, taskId: task.id, description: value });
      } else if (field === 'state') {
        tx = isManager
          ? buildManagerUpdateTaskStateTx({ managerCapId: managerCapId!, projectId, taskId: task.id, state: value })
          : buildAssigneeUpdateTaskStateTx({ projectId, taskId: task.id, state: value });
      } else if (field === 'dueDate') {
        const timestamp = new Date(value).getTime();
        tx = isManager
          ? buildManagerUpdateTaskDueDateTx({ managerCapId: managerCapId!, projectId, taskId: task.id, dueDate: timestamp })
          : buildMemberUpdateTaskDueDateTx({ projectId, taskId: task.id, dueDate: timestamp });
      } else if (field === 'assignee' && isManager) {
        tx = buildManagerUpdateTaskAssigneeTx({ managerCapId: managerCapId!, projectId, taskId: task.id, assignee: value });
      }

      if (tx) {
        await signAndExecuteTransaction(
          { transaction: tx },
          {
            onSuccess: () => {
              setTimeout(() => {
                onTaskUpdated();
              }, 1500);
            },
          }
        );
      }
    } catch (error) {
      console.error(`Failed to update ${field}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Update each field that changed
      if (name !== task.name) {
        await handleUpdateField('name', name);
      }
      if (description !== task.description) {
        await handleUpdateField('description', description);
      }
      if (state !== task.state) {
        await handleUpdateField('state', state);
      }
      if (assignee !== task.assignee && isManager) {
        await handleUpdateField('assignee', assignee);
      }
      const newDueDateTimestamp = new Date(dueDate).getTime();
      const currentDueDateTimestamp = parseInt(task.dueDate);
      if (newDueDateTimestamp !== currentDueDateTimestamp) {
        await handleUpdateField('dueDate', dueDate);
      }

      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save changes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName(task.name);
    setDescription(task.description);
    setState(task.state);
    setAssignee(task.assignee);
    setDueDate(new Date(parseInt(task.dueDate)).toISOString().split('T')[0]);
    setIsEditing(false);
  };

  const handleDeleteTask = async () => {
    if (!isManager || !managerCapId) {
      alert('Only managers can delete tasks');
      return;
    }

    if (!confirm(`Are you sure you want to delete the task "${task.name}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      const tx = buildDeleteTaskTx({
        managerCapId,
        projectId,
        taskId: task.id,
      });

      await signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: () => {
            onClose();
            setTimeout(() => {
              onTaskUpdated();
            }, 1500);
          },
        }
      );
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Task Details" size="2xl">
      <div className="space-y-6">
        {/* Edit and Delete buttons */}
        {!isEditing && canEdit && (
          <div className="flex justify-between items-center">
            {isManager && (
              <Button
                size="sm"
                variant="secondary"
                onClick={handleDeleteTask}
                disabled={loading}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Delete Task
              </Button>
            )}
            <div className={`${isManager ? '' : 'w-full flex justify-end'}`}>
              <Button size="sm" onClick={() => setIsEditing(true)}>
                Edit Task
              </Button>
            </div>
          </div>
        )}

        {/* Task Name */}
        {isEditing ? (
          <Input
            label="Task Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
        ) : (
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{task.name}</h3>
          </div>
        )}

        {/* Description */}
        {isEditing ? (
          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            disabled={loading}
          />
        ) : (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Description</p>
            <p className="text-gray-600 whitespace-pre-wrap">{task.description}</p>
          </div>
        )}

        {/* State, Assignee, Due Date */}
        <div className="grid grid-cols-3 gap-4">
          {/* State */}
          {isEditing ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <select
                value={state}
                onChange={(e) => setState(parseInt(e.target.value))}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value={TASK_STATES.TODO}>To Do</option>
                <option value={TASK_STATES.IN_PROGRESS}>In Progress</option>
                <option value={TASK_STATES.DONE}>Done</option>
              </select>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">State</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  task.state === TASK_STATES.DONE
                    ? 'bg-green-100 text-green-700'
                    : task.state === TASK_STATES.IN_PROGRESS
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {STATE_LABELS[task.state as keyof typeof STATE_LABELS]}
              </span>
            </div>
          )}

          {/* Assignee */}
          {isEditing && canEditAssignee ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
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
          ) : (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Assignee</p>
              <p className="text-gray-600">
                {members.find((m) => m.address.toLowerCase() === task.assignee.toLowerCase())?.displayName ||
                  `${task.assignee.substring(0, 6)}...${task.assignee.substring(task.assignee.length - 4)}`}
              </p>
            </div>
          )}

          {/* Due Date */}
          {isEditing && (isManager || isAssignee) ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={loading}
              />
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Due Date</p>
              <p className={`font-medium ${isDueDateOverdue(task.dueDate) ? 'text-red-600' : 'text-gray-600'}`}>
                {formatDueDate(task.dueDate)}
                {isDueDateOverdue(task.dueDate) && (
                  <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                    Overdue
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Subtasks */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Subtasks</h4>
          <SubtaskList
            subtasks={task.subtasks}
            taskId={task.id}
            projectId={projectId}
            managerCapId={managerCapId}
            isAssignee={isAssignee}
            onSubtasksUpdated={onTaskUpdated}
          />
        </div>

        {/* Attachments */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Attachments</h4>
          <AttachmentList
            attachments={task.attachments}
            taskId={task.id}
            projectId={projectId}
            managerCapId={managerCapId}
            isAssignee={isAssignee}
            onAttachmentsUpdated={onTaskUpdated}
          />
        </div>

        {/* Action buttons */}
        {isEditing && (
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button variant="secondary" onClick={handleCancel} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={loading}>
              Save Changes
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
