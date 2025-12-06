/**
 * Kanban Board Component
 * Drag-and-drop board for managing tickets by status
 */

'use client';

import React, { useMemo } from 'react';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Task, TaskState } from '@/types/task';
import { TicketCard } from './TicketCard';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: TaskState) => void;
}

const DRAG_TYPE = 'TICKET';

const COLUMNS = [
  {
    status: TaskState.TODO,
    title: 'To Do',
    color: 'bg-gray-100',
    headerColor: 'bg-gray-200',
  },
  {
    status: TaskState.IN_PROGRESS,
    title: 'In Progress',
    color: 'bg-yellow-50',
    headerColor: 'bg-yellow-100',
  },
  {
    status: TaskState.DONE,
    title: 'Done',
    color: 'bg-green-50',
    headerColor: 'bg-green-100',
  },
];

interface ColumnProps {
  status: TaskState;
  title: string;
  color: string;
  headerColor: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onDrop: (taskId: string, newStatus: TaskState) => void;
}

function KanbanColumn({
  status,
  title,
  color,
  headerColor,
  tasks,
  onTaskClick,
  onDrop,
}: ColumnProps) {
  // Setup drop functionality
  const [{ isOver }, drop] = useDrop<
    { taskId: string; currentStatus: TaskState },
    void,
    { isOver: boolean }
  >(() => ({
    accept: DRAG_TYPE,
    drop: (item) => {
      if (item.currentStatus !== status) {
        onDrop(item.taskId, status);
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
          {tasks.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={drop as any}
        className={`${color} rounded-b-lg p-4 min-h-[500px] space-y-3 ${
          isOver ? 'ring-2 ring-primary-500 ring-opacity-50' : ''
        }`}
      >
        {tasks.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p className="text-sm">No tickets</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TicketCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export function KanbanBoard({ tasks, onTaskClick, onStatusChange }: KanbanBoardProps) {
  const tasksByState = useMemo(() => {
    return {
      [TaskState.TODO]: tasks.filter((t) => t.state === TaskState.TODO),
      [TaskState.IN_PROGRESS]: tasks.filter((t) => t.state === TaskState.IN_PROGRESS),
      [TaskState.DONE]: tasks.filter((t) => t.state === TaskState.DONE),
    };
  }, [tasks]);

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
            tasks={tasksByState[column.status]}
            onTaskClick={onTaskClick}
            onDrop={onStatusChange}
          />
        ))}
      </div>
    </DndProvider>
  );
}
