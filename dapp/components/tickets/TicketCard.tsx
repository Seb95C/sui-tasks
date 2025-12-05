/**
 * Ticket Card Component
 * Draggable ticket card for Kanban board
 */

'use client';

import React from 'react';
import { useDrag } from 'react-dnd';
import { Ticket, TicketPriority, TicketStatus } from '@/types/ticket';
import { formatAddress } from '@/lib/utils/formatting';

interface TicketCardProps {
  ticket: Ticket;
  onClick: () => void;
}

const DRAG_TYPE = 'TICKET';

export function TicketCard({ ticket, onClick }: TicketCardProps) {
  // Setup drag functionality
  const [{ isDragging }, drag] = useDrag<
    { ticketId: string; currentStatus: TicketStatus },
    void,
    { isDragging: boolean }
  >(() => ({
    type: DRAG_TYPE,
    item: { ticketId: ticket.id, currentStatus: ticket.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const getPriorityColor = (priority: TicketPriority) => {
    switch (priority) {
      case TicketPriority.URGENT:
        return 'bg-red-100 text-red-700 border-red-200';
      case TicketPriority.HIGH:
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case TicketPriority.MEDIUM:
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case TicketPriority.LOW:
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div
      ref={drag as any}
      onClick={onClick}
      className={`bg-white rounded-lg border-2 border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      {/* Priority badge */}
      <div className="flex items-center justify-between mb-2">
        <span
          className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(
            ticket.priority
          )}`}
        >
          {ticket.priority}
        </span>

        {/* Ticket ID */}
        <span className="text-xs text-gray-400 font-mono">
          #{ticket.id.slice(0, 8)}
        </span>
      </div>

      {/* Title */}
      <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
        {ticket.title}
      </h4>

      {/* Description preview */}
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {ticket.description}
      </p>

      {/* Footer with assignee */}
      {ticket.assignee && (
        <div className="flex items-center text-xs text-gray-500">
          <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-2">
            <span className="text-primary-700 font-medium text-xs">
              {ticket.assignee.username?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
          <span>
            {ticket.assignee.username || formatAddress(ticket.assignee.address)}
          </span>
        </div>
      )}
    </div>
  );
}
