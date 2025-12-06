/**
 * Ticket Detail Modal
 * View and edit ticket details
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@radix-ui/themes';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Ticket, TicketPriority, TicketStatus } from '@/types/ticket';
import { ProjectMember } from '@/types/user';
import { useWallet } from '@/contexts/WalletContext';
import { useTickets } from '@/contexts/TicketContext';
import { canEditTicket } from '@/lib/utils/permissions';
import { formatDateTime, formatAddress, formatEnumLabel } from '@/lib/utils/formatting';

interface TicketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket;
  projectMembers: ProjectMember[];
}

export function TicketDetailModal({
  isOpen,
  onClose,
  ticket,
  projectMembers,
}: TicketDetailModalProps) {
  const { currentAccount } = useWallet();
  const { updateTicket } = useTickets();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [title, setTitle] = useState(ticket.title);
  const [description, setDescription] = useState(ticket.description);
  const [status, setStatus] = useState(ticket.status);
  const [priority, setPriority] = useState(ticket.priority);
  const [assigneeId, setAssigneeId] = useState(ticket.assigneeId || '');

  // Update form when ticket changes
  useEffect(() => {
    setTitle(ticket.title);
    setDescription(ticket.description);
    setStatus(ticket.status);
    setPriority(ticket.priority);
    setAssigneeId(ticket.assigneeId || '');
  }, [ticket]);

  const userCanEdit = currentAccount
    ? canEditTicket(ticket, currentAccount.address, projectMembers)
    : false;

  const handleSave = async () => {
    setLoading(true);

    try {
      await updateTicket({
        ticketId: ticket.id,
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        assigneeId: assigneeId || undefined,
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    setTitle(ticket.title);
    setDescription(ticket.description);
    setStatus(ticket.status);
    setPriority(ticket.priority);
    setAssigneeId(ticket.assigneeId || '');
    setIsEditing(false);
  };

  const statusOptions = Object.values(TicketStatus).map((s) => ({
    value: s,
    label: formatEnumLabel(s),
  }));

  const priorityOptions = Object.values(TicketPriority).map((p) => ({
    value: p,
    label: formatEnumLabel(p),
  }));

  const assigneeOptions = [
    { value: '', label: 'Unassigned' },
    ...projectMembers.map((m) => ({
      value: m.userId,
      label: m.user.username || formatAddress(m.user.address),
    })),
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ticket Details" size="lg">
      <div className="space-y-6">
        {/* Header with edit button */}
        {!isEditing && userCanEdit && (
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setIsEditing(true)}>
              Edit Ticket
            </Button>
          </div>
        )}

        {/* Ticket ID */}
        <div>
          <p className="text-sm text-gray-500">Ticket ID</p>
          <p className="font-mono text-sm text-gray-700">{ticket.id}</p>
        </div>

        {/* Title */}
        {isEditing ? (
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
          />
        ) : (
          <div>
            <p className="text-sm text-gray-500 mb-1">Title</p>
            <h3 className="text-xl font-semibold text-gray-900">{ticket.title}</h3>
          </div>
        )}

        {/* Description */}
        {isEditing ? (
          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            disabled={loading}
          />
        ) : (
          <div>
            <p className="text-sm text-gray-500 mb-1">Description</p>
            <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
          </div>
        )}

        {/* Status and Priority */}
        <div className="grid grid-cols-2 gap-4">
          {isEditing ? (
            <>
              <Select
                label="Status"
                value={status}
                onValueChange={(value) => setStatus(value as TicketStatus)}
                options={statusOptions}
                disabled={loading}
              />
              <Select
                label="Priority"
                value={priority}
                onValueChange={(value) => setPriority(value as TicketPriority)}
                options={priorityOptions}
                disabled={loading}
              />
            </>
          ) : (
            <>
              <div>
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <Badge color="indigo" variant="soft">
                  {formatEnumLabel(ticket.status)}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Priority</p>
                <Badge color="yellow" variant="soft">
                  {formatEnumLabel(ticket.priority)}
                </Badge>
              </div>
            </>
          )}
        </div>

        {/* Assignee */}
        {isEditing ? (
          <Select
            label="Assignee"
            value={assigneeId}
            onValueChange={(value) => setAssigneeId(value)}
            options={assigneeOptions}
            disabled={loading}
          />
        ) : (
          <div>
            <p className="text-sm text-gray-500 mb-1">Assignee</p>
            {ticket.assignee ? (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-700 font-medium text-sm">
                    {ticket.assignee.username?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {ticket.assignee.username || formatAddress(ticket.assignee.address)}
                  </p>
                  <p className="text-xs text-gray-500 font-mono">
                    {formatAddress(ticket.assignee.address)}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Unassigned</p>
            )}
          </div>
        )}

        {/* Creator */}
        <div>
          <p className="text-sm text-gray-500 mb-1">Created by</p>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-gray-700 font-medium text-sm">
                {ticket.creator.username?.[0]?.toUpperCase() || '?'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {ticket.creator.username || formatAddress(ticket.creator.address)}
              </p>
              <p className="text-xs text-gray-500">{formatDateTime(ticket.createdAt)}</p>
            </div>
          </div>
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
