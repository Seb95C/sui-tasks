/**
 * Kanban Board Component
 * Drag-and-drop board for managing tickets by status
 */

'use client';

import React, { useMemo } from 'react';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Card, Flex, Heading, Badge, Text } from '@radix-ui/themes';
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
  },
  {
    status: TicketStatus.IN_PROGRESS,
    title: 'In Progress',
  },
  {
    status: TicketStatus.DONE,
    title: 'Done',
  },
];

interface ColumnProps {
  status: TicketStatus;
  title: string;
  tickets: Ticket[];
  onTicketClick: (ticket: Ticket) => void;
  onDrop: (ticketId: string, newStatus: TicketStatus) => void;
}

function KanbanColumn({
  status,
  title,
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
    <Card
      ref={drop as any}
      variant="surface"
      size="3"
      style={{
        minWidth: 300,
        minHeight: 520,
        background: isOver ? 'var(--accent-a2)' : undefined,
        borderColor: isOver ? 'var(--accent-a5)' : undefined,
      }}
    >
      <Flex align="center" justify="between" mb="3">
        <Heading size="4">{title}</Heading>
        <Badge color="gray" variant="soft">
          {tickets.length}
        </Badge>
      </Flex>

      <Flex direction="column" gap="3">
        {tickets.length === 0 ? (
          <Text color="gray" align="center">
            No tickets
          </Text>
        ) : (
          tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} onClick={() => onTicketClick(ticket)} />
          ))
        )}
      </Flex>
    </Card>
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
      <Flex gap="4" style={{ overflowX: 'auto', paddingBottom: '16px' }}>
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.status}
            status={column.status}
            title={column.title}
            tickets={ticketsByStatus[column.status]}
            onTicketClick={onTicketClick}
            onDrop={onStatusChange}
          />
        ))}
      </Flex>
    </DndProvider>
  );
}
