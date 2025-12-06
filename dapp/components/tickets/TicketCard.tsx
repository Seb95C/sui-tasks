/**
 * Ticket Card Component
 * Draggable ticket card for Kanban board
 */

'use client';

import React from 'react';
import { useDrag } from 'react-dnd';
import { Task, TaskState } from '@/types/task';
import { formatAddress } from '@/lib/utils/formatting';

interface TicketCardProps {
  task: Task;
  onClick: () => void;
}

const DRAG_TYPE = 'TICKET';

export function TicketCard({ task, onClick }: TicketCardProps) {
  // Setup drag functionality
  const [{ isDragging }, drag] = useDrag<
    { taskId: string; currentStatus: TaskState },
    void,
    { isDragging: boolean }
  >(() => ({
    type: DRAG_TYPE,
    item: { taskId: task.id, currentStatus: task.state },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const stateLabel = (state: TaskState) => {
    switch (state) {
      case TaskState.TODO:
        return { label: 'To Do', className: 'bg-gray-100 text-gray-700 border-gray-200' };
      case TaskState.IN_PROGRESS:
        return { label: 'In Progress', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
      case TaskState.DONE:
        return { label: 'Done', className: 'bg-green-100 text-green-700 border-green-200' };
      default:
        return { label: 'Open', className: 'bg-gray-100 text-gray-700 border-gray-200' };
    }
  };

  const badge = stateLabel(task.state);

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
          className={`px-2 py-1 rounded text-xs font-medium border ${badge.className}`}
        >
          {badge.label}
        </span>

        {/* Ticket ID */}
        <span className="text-xs text-gray-400 font-mono">
          #{task.id.slice(0, 8)}
        </span>
      </div>

      {/* Title */}
      <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
        {task.name}
      </h4>

      {/* Description preview */}
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {task.description}
      </p>

      {/* Footer with assignee */}
      {task.assignee && (
        <div className="flex items-center text-xs text-gray-500">
          <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-2">
            <span className="text-primary-700 font-medium text-xs">
              {(task.assignee || '0x?').slice(2, 3).toUpperCase()}
            </span>
          </div>
          <span>
            {formatAddress(task.assignee)}
          </span>
        </div>
      )}
    </div>
  );
}
