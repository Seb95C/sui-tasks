/**
 * Task Detail Modal
 * Shows a task with subtasks and attachments plus inline actions.
 */

'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Task, TaskState } from '@/types/task';
import { ProjectMember } from '@/types/user';
import { formatAddress, formatDate } from '@/lib/utils/formatting';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
  projectMembers: ProjectMember[];
  onUpdateState?: (state: TaskState) => Promise<void>;
  onUpdateDetails?: (updates: Partial<Task>) => Promise<void>;
  onAddSubtask?: (payload: { name: string; description: string; state: TaskState }) => Promise<void>;
  onAddAttachment?: (payload: { name: string; url: string }) => Promise<void>;
}

export function TicketDetailModal({
  isOpen,
  onClose,
  task,
  projectMembers,
  onUpdateState,
  onUpdateDetails,
  onAddSubtask,
  onAddAttachment,
}: TaskDetailModalProps) {
  const [status, setStatus] = useState<TaskState>(task.state as TaskState);
  const [note, setNote] = useState(task.description);
  const [subtaskName, setSubtaskName] = useState('');
  const [subtaskDesc, setSubtaskDesc] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const handleStateUpdate = async () => {
    if (!onUpdateState) return;
    setSaving(true);
    try {
      await onUpdateState(status);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDetails = async () => {
    if (!onUpdateDetails) return;
    setSaving(true);
    try {
      await onUpdateDetails({ description: note });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSubtask = async () => {
    if (!onAddSubtask || !subtaskName.trim()) return;
    setSaving(true);
    try {
      await onAddSubtask({
        name: subtaskName.trim(),
        description: subtaskDesc.trim(),
        state: TaskState.TODO,
      });
      setSubtaskName('');
      setSubtaskDesc('');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAttachment = async () => {
    if (!onAddAttachment || !attachmentName.trim() || !attachmentUrl.trim()) return;
    setSaving(true);
    try {
      await onAddAttachment({
        name: attachmentName.trim(),
        url: attachmentUrl.trim(),
      });
      setAttachmentName('');
      setAttachmentUrl('');
    } finally {
      setSaving(false);
    }
  };

  const assigneeLabel =
    projectMembers.find((m) => m.address.toLowerCase() === task.assignee.toLowerCase())
      ?.displayName || formatAddress(task.assignee);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task.name} size="xl">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Assignee</p>
            <p className="text-base text-gray-900 font-medium">{assigneeLabel}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Updated</p>
            <p className="text-base text-gray-900 font-medium">
              {formatDate(task.updatedAt)}
            </p>
          </div>
        </div>

        <Textarea
          label="Description"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
        />

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Status</label>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={status}
            onChange={(e) => setStatus(Number(e.target.value))}
          >
            <option value={TaskState.TODO}>To Do</option>
            <option value={TaskState.IN_PROGRESS}>In Progress</option>
            <option value={TaskState.DONE}>Done</option>
          </select>
          {onUpdateState && (
            <Button size="sm" onClick={handleStateUpdate} loading={saving}>
              Update
            </Button>
          )}
          {onUpdateDetails && (
            <Button size="sm" variant="secondary" onClick={handleSaveDetails} loading={saving}>
              Save Description
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">Subtasks</h3>
              <span className="text-xs text-gray-500">{task.subtasks.length} total</span>
            </div>
            {task.subtasks.length === 0 ? (
              <p className="text-sm text-gray-500">No subtasks yet.</p>
            ) : (
              <ul className="space-y-2">
                {task.subtasks.map((sub) => (
                  <li key={sub.id} className="border rounded-md px-3 py-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{sub.name}</span>
                      <span className="text-xs text-gray-500">
                        {sub.state === TaskState.DONE ? 'Done' : 'Open'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{sub.description}</p>
                  </li>
                ))}
              </ul>
            )}
            {onAddSubtask && (
              <div className="mt-3 space-y-2">
                <Input
                  placeholder="Subtask title"
                  value={subtaskName}
                  onChange={(e) => setSubtaskName(e.target.value)}
                />
                <Input
                  placeholder="Subtask description"
                  value={subtaskDesc}
                  onChange={(e) => setSubtaskDesc(e.target.value)}
                />
                <Button size="sm" onClick={handleAddSubtask} loading={saving}>
                  Add subtask
                </Button>
              </div>
            )}
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">Attachments</h3>
              <span className="text-xs text-gray-500">{task.attachments.length} total</span>
            </div>
            {task.attachments.length === 0 ? (
              <p className="text-sm text-gray-500">No attachments yet.</p>
            ) : (
              <ul className="space-y-2">
                {task.attachments.map((att) => (
                  <li key={att.id} className="border rounded-md px-3 py-2">
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      {att.name}
                    </a>
                  </li>
                ))}
              </ul>
            )}
            {onAddAttachment && (
              <div className="mt-3 space-y-2">
                <Input
                  placeholder="Attachment name"
                  value={attachmentName}
                  onChange={(e) => setAttachmentName(e.target.value)}
                />
                <Input
                  placeholder="https://..."
                  value={attachmentUrl}
                  onChange={(e) => setAttachmentUrl(e.target.value)}
                />
                <Button size="sm" onClick={handleAddAttachment} loading={saving}>
                  Add attachment
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
