/**
 * Kanban Board Component
 * Drag-and-drop board for managing tickets by status
 */

'use client';

import React, { useMemo, useState } from 'react';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Ticket, TicketStatus } from '@/types/ticket';
import { TicketCard } from './TicketCard';

interface KanbanBoardProps {
  tickets: Ticket[];
  onTicketClick: (ticket: Ticket) => void;
  onStatusChange: (ticketId: string, newStatus: TicketStatus) => void;
}

const DRAG_TYPE = 'TICKET';

const COLUMNS = [
  {
    status: TicketStatus.TODO,
    title: 'To Do',
    color: 'bg-gray-100',
    headerColor: 'bg-gray-200',
  },
  {
    status: TicketStatus.IN_PROGRESS,
    title: 'In Progress',
    color: 'bg-yellow-50',
    headerColor: 'bg-yellow-100',
  },
  {
    status: TicketStatus.DONE,
    title: 'Done',
    color: 'bg-green-50',
    headerColor: 'bg-green-100',
  },
];

interface ColumnProps {
  status: TicketStatus;
  title: string;
  color: string;
  headerColor: string;
  tickets: Ticket[];
  onTicketClick: (ticket: Ticket) => void;
  onDrop: (ticketId: string, newStatus: TicketStatus) => void;
}

function KanbanColumn({
  status,
  title,
  color,
  headerColor,
  tickets,
  onTicketClick,
  onDrop,
}: ColumnProps) {
  // Setup drop functionality
  const [{ isOver }, drop] = useDrop<
    { ticketId: string; currentStatus: TicketStatus },
    void,
    { isOver: boolean }
  >(() => ({
    accept: DRAG_TYPE,
    drop: (item) => {
      if (item.currentStatus !== status) {
        onDrop(item.ticketId, status);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div className="flex-1 min-w-[300px]">
      {/* Column header */}
      <div
        className={`${headerColor} rounded-t-lg px-4 py-3 flex items-center justify-between`}
      >
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <span className="bg-white px-2 py-1 rounded text-sm font-medium text-gray-700">
          {tickets.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={drop as any}
        className={`${color} rounded-b-lg p-4 min-h-[500px] space-y-3 ${
          isOver ? 'ring-2 ring-primary-500 ring-opacity-50' : ''
        }`}
      >
        {tickets.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p className="text-sm">No tickets</p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onClick={() => onTicketClick(ticket)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export function KanbanBoard({
  tickets,
  onTicketClick,
  onStatusChange,
}: KanbanBoardProps) {
  // Group tickets by status
  const ticketsByStatus = useMemo(() => {
    return {
      [TicketStatus.TODO]: tickets.filter((t) => t.status === TicketStatus.TODO),
      [TicketStatus.IN_PROGRESS]: tickets.filter(
        (t) => t.status === TicketStatus.IN_PROGRESS
      ),
      [TicketStatus.DONE]: tickets.filter((t) => t.status === TicketStatus.DONE),
    };
  }, [tickets]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.status}
            status={column.status}
            title={column.title}
            color={column.color}
            headerColor={column.headerColor}
            tickets={ticketsByStatus[column.status]}
            onTicketClick={onTicketClick}
            onDrop={onStatusChange}
          />
        ))}
      </div>
    </DndProvider>
  );
}
