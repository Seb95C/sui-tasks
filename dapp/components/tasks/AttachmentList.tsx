/**
 * Attachment List Component
 * Displays and manages attachments for a task
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useWallet } from '@/contexts/WalletContext';
import {
  buildManagerAddAttachmentTx,
  buildAssigneeAddAttachmentTx,
  buildManagerRemoveAttachmentTx,
  buildAssigneeRemoveAttachmentTx,
} from '@/lib/sui/transactions';

interface Attachment {
  attachment_id: string;
  name: string;
  url: string;
}

interface AttachmentListProps {
  attachments: Attachment[];
  taskId: string;
  projectId: string;
  managerCapId?: string;
  isAssignee: boolean;
  onAttachmentsUpdated: () => void;
}

export function AttachmentList({
  attachments,
  taskId,
  projectId,
  managerCapId,
  isAssignee,
  onAttachmentsUpdated,
}: AttachmentListProps) {
  const { signAndExecuteTransaction } = useWallet();
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  const isManager = !!managerCapId;
  const canManage = isManager || isAssignee;

  const handleAddAttachment = async () => {
    if (!name.trim() || !url.trim()) return;

    setLoading(true);
    try {
      const tx = isManager
        ? buildManagerAddAttachmentTx({ managerCapId: managerCapId!, projectId, taskId, name, url })
        : buildAssigneeAddAttachmentTx({ projectId, taskId, name, url });

      await signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: () => {
            setName('');
            setUrl('');
            setIsAdding(false);
            setTimeout(() => onAttachmentsUpdated(), 1500);
          },
        }
      );
    } catch (error) {
      console.error('Failed to add attachment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAttachment = async (attachmentId: string) => {
    if (!confirm('Are you sure you want to remove this attachment?')) return;

    setLoading(true);
    try {
      const tx = isManager
        ? buildManagerRemoveAttachmentTx({
            managerCapId: managerCapId!,
            projectId,
            taskId,
            attachmentId: parseInt(attachmentId)
          })
        : buildAssigneeRemoveAttachmentTx({ projectId, taskId, attachmentId: parseInt(attachmentId) });

      await signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: () => {
            setTimeout(() => onAttachmentsUpdated(), 1500);
          },
        }
      );
    } catch (error) {
      console.error('Failed to remove attachment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Existing attachments */}
      {attachments.length === 0 && !isAdding ? (
        <p className="text-sm text-gray-500">No attachments yet</p>
      ) : (
        attachments.map((attachment) => (
          <div
            key={attachment.attachment_id}
            className="flex items-center justify-between border border-gray-200 rounded-lg p-3"
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <svg
                className="w-5 h-5 text-gray-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{attachment.name}</p>
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary-600 hover:text-primary-700 truncate block"
                >
                  {attachment.url}
                </a>
              </div>
            </div>
            {canManage && (
              <button
                onClick={() => handleRemoveAttachment(attachment.attachment_id)}
                className="ml-4 text-sm text-red-600 hover:text-red-700 flex-shrink-0"
                disabled={loading}
              >
                Remove
              </button>
            )}
          </div>
        ))
      )}

      {/* Add new attachment form */}
      {isAdding ? (
        <div className="border border-gray-200 rounded-lg p-4 space-y-3">
          <Input
            label="Attachment Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Design mockup, Documentation"
            disabled={loading}
          />
          <Input
            label="URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            disabled={loading}
          />
          <div className="flex justify-end space-x-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setIsAdding(false);
                setName('');
                setUrl('');
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleAddAttachment} loading={loading}>
              Add Attachment
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
            + Add Attachment
          </Button>
        )
      )}
    </div>
  );
}
