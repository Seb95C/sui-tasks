/**
 * Ticket Card Component
 * Draggable ticket card for Kanban board
 */

'use client';

import React from 'react';
import { useDrag } from 'react-dnd';
import { Card, Flex, Badge, Heading, Text, Avatar } from '@radix-ui/themes';
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
        return 'red';
      case TicketPriority.HIGH:
        return 'orange';
      case TicketPriority.MEDIUM:
        return 'yellow';
      case TicketPriority.LOW:
        return 'green';
      default:
        return 'gray';
    }
  };

  return (
    <Card
      ref={drag as any}
      onClick={onClick}
      variant="surface"
      size="2"
      style={{
        cursor: 'pointer',
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <Flex direction="column" gap="2">
        <Flex align="center" justify="between">
          <Badge color={getPriorityColor(ticket.priority)} variant="soft">
            {ticket.priority}
          </Badge>
          <Text size="1" color="gray" style={{ fontFamily: 'monospace' }}>
            #{ticket.id.slice(0, 8)}
          </Text>
        </Flex>

        <Heading size="4" className="line-clamp-2">
          {ticket.title}
        </Heading>

        <Text size="2" color="gray" className="line-clamp-2">
          {ticket.description}
        </Text>

        {ticket.assignee && (
          <Flex align="center" gap="2" mt="1">
            <Avatar
              fallback={ticket.assignee.username?.[0]?.toUpperCase() || '?'}
              color="indigo"
              size="2"
            />
            <Text size="2">
              {ticket.assignee.username || formatAddress(ticket.assignee.address)}
            </Text>
          </Flex>
        )}
      </Flex>
    </Card>
  );
}
