/**
 * Project Detail Page
 * Comprehensive project dashboard with task management
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import { Button } from '@/components/ui/Button';
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal';
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal';
import { MemberManagementModal } from '@/components/projects/MemberManagementModal';
import { fetchUsernameByAddress } from '@/lib/api/usernames';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { buildManagerUpdateTaskStateTx, buildAssigneeUpdateTaskStateTx } from '@/lib/sui/transactions';
import { formatDueDate, isDueDateOverdue } from '@/lib/utils/formatting';

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

interface Member {
  address: string;
  displayName: string;
  joinedAt: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  manager: string;
  managerCapId?: string;
  members: Member[];
  tasks: Task[];
}

const STATE_LABELS = {
  0: 'To Do',
  1: 'In Progress',
  2: 'Done',
};

const DRAG_TYPE = 'TASK';

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { isConnected, currentAccount, signAndExecuteTransaction } = useWallet();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [managerCapId, setManagerCapId] = useState<string | null>(null);

  const isManager = currentAccount?.address.toLowerCase() === project?.manager.toLowerCase();

  // Check authentication
  useEffect(() => {
    async function checkAuth() {
      if (!isConnected || !currentAccount?.address) {
        router.push('/');
        return;
      }

      const usernameRecord = await fetchUsernameByAddress(currentAccount.address);
      if (!usernameRecord) {
        router.push('/');
        return;
      }
    }

    checkAuth();
  }, [isConnected, currentAccount, router]);

  // Load project data
  useEffect(() => {
    async function loadProject() {
      if (!currentAccount?.address) return;

      setLoading(true);
      try {
        // Fetch all projects for the user
        const response = await fetch(
          `/api/projects/by-address?address=${encodeURIComponent(currentAccount.address)}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }

        const projects = await response.json();
        const currentProject = projects.find((p: Project) => p.id === params.id);

        if (!currentProject) {
          alert('Project not found or you do not have access');
          router.push('/projects');
          return;
        }

        setProject(currentProject);

        // Set manager cap ID if the current user is the manager
        if (currentProject.managerCapId &&
            currentAccount.address.toLowerCase() === currentProject.manager.toLowerCase()) {
          setManagerCapId(currentProject.managerCapId);
        }
      } catch (error) {
        console.error('Error loading project:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [currentAccount?.address, params.id, router]);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleRefresh = () => {
    // Reload the page to get fresh data
    window.location.reload();
  };

  const handleTaskStatusChange = async (taskId: string, newState: number) => {
    if (!project || !currentAccount) return;

    const task = project.tasks.find((t) => t.id === taskId);
    if (!task) return;

    const isTaskAssignee = task.assignee.toLowerCase() === currentAccount.address.toLowerCase();

    try {
      const tx = isManager && managerCapId
        ? buildManagerUpdateTaskStateTx({
            managerCapId,
            projectId: project.id,
            taskId,
            state: newState,
          })
        : buildAssigneeUpdateTaskStateTx({
            projectId: project.id,
            taskId,
            state: newState,
          });

      await signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: () => {
            setTimeout(() => handleRefresh(), 1500);
          },
        }
      );
    } catch (error) {
      console.error('Failed to update task status:', error);
      alert('Failed to update task status');
    }
  };

  const groupedTasks = {
    todo: project?.tasks.filter((t) => t.state === 0) || [],
    inProgress: project?.tasks.filter((t) => t.state === 1) || [],
    done: project?.tasks.filter((t) => t.state === 2) || [],
  };

  if (loading || !project) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  const currentUserIsAssignee = (task: Task) =>
    task.assignee.toLowerCase() === currentAccount?.address.toLowerCase();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-10">
        <div className="relative bg-gradient-to-r from-primary-500 via-primary-600 to-purple-600 rounded-3xl p-8 shadow-soft-lg overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>

          <div className="relative flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-4xl font-bold text-white drop-shadow-lg">
                  {project.name}
                </h1>
                {isManager && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold bg-white/20 text-white backdrop-blur-sm border border-white/30 shadow-lg">
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    Manager
                  </span>
                )}
              </div>
              <p className="text-primary-100 text-lg mb-5 max-w-3xl leading-relaxed">
                {project.description}
              </p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-white/90">
                  <div className="w-10 h-10 bg-white/20 rounded-xl backdrop-blur-sm flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-primary-100">Team</p>
                    <p className="font-bold text-lg">{project.members.length}</p>
                  </div>
                </div>
                <div className="w-px h-12 bg-white/20"></div>
                <div className="flex items-center gap-2 text-white/90">
                  <div className="w-10 h-10 bg-white/20 rounded-xl backdrop-blur-sm flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-primary-100">Tasks</p>
                    <p className="font-bold text-lg">{project.tasks.length}</p>
                  </div>
                </div>
                <div className="w-px h-12 bg-white/20"></div>
                <div className="flex items-center gap-2 text-white/90">
                  <div className="w-10 h-10 bg-white/20 rounded-xl backdrop-blur-sm flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-primary-100">Completed</p>
                    <p className="font-bold text-lg">{project.tasks.filter(t => t.state === 2).length}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {isManager && (
                <Button
                  variant="secondary"
                  onClick={() => setShowMemberModal(true)}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm shadow-lg"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Manage Team
                </Button>
              )}
              <Button
                onClick={() => setShowCreateTaskModal(true)}
                className="bg-white text-primary-600 hover:bg-primary-50 shadow-lg font-semibold"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Task
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <DndProvider backend={HTML5Backend}>
        <div className="grid grid-cols-3 gap-6">
          {/* To Do Column */}
          <TaskColumn
            title="To Do"
            state={0}
            tasks={groupedTasks.todo}
            members={project.members}
            onTaskClick={handleTaskClick}
            onTaskDrop={handleTaskStatusChange}
            currentUserAddress={currentAccount?.address}
            isManager={isManager}
          />

          {/* In Progress Column */}
          <TaskColumn
            title="In Progress"
            state={1}
            tasks={groupedTasks.inProgress}
            members={project.members}
            onTaskClick={handleTaskClick}
            onTaskDrop={handleTaskStatusChange}
            currentUserAddress={currentAccount?.address}
            isManager={isManager}
          />

          {/* Done Column */}
          <TaskColumn
            title="Done"
            state={2}
            tasks={groupedTasks.done}
            members={project.members}
            onTaskClick={handleTaskClick}
            onTaskDrop={handleTaskStatusChange}
            currentUserAddress={currentAccount?.address}
            isManager={isManager}
          />
        </div>
      </DndProvider>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          task={selectedTask}
          projectId={project.id}
          managerCapId={isManager ? managerCapId || undefined : undefined}
          isAssignee={currentUserIsAssignee(selectedTask)}
          currentUserAddress={currentAccount?.address || ''}
          members={project.members}
          onTaskUpdated={handleRefresh}
        />
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={showCreateTaskModal}
        onClose={() => setShowCreateTaskModal(false)}
        projectId={project.id}
        managerCapId={isManager ? managerCapId || undefined : undefined}
        members={project.members}
        currentUserAddress={currentAccount?.address || ''}
        onTaskCreated={handleRefresh}
      />

      {/* Member Management Modal */}
      {isManager && managerCapId && (
        <MemberManagementModal
          isOpen={showMemberModal}
          onClose={() => setShowMemberModal(false)}
          projectId={project.id}
          managerCapId={managerCapId}
          members={project.members}
          managerAddress={project.manager}
          onMembersUpdated={handleRefresh}
        />
      )}
    </div>
  );
}

// Task Column Component with Drop Zone
function TaskColumn({
  title,
  state,
  tasks,
  members,
  onTaskClick,
  onTaskDrop,
  currentUserAddress,
  isManager,
}: {
  title: string;
  state: number;
  tasks: Task[];
  members: Member[];
  onTaskClick: (task: Task) => void;
  onTaskDrop: (taskId: string, newState: number) => void;
  currentUserAddress?: string;
  isManager: boolean;
}) {
  const [{ isOver }, drop] = useDrop<
    { taskId: string; currentState: number },
    void,
    { isOver: boolean }
  >(() => ({
    accept: DRAG_TYPE,
    drop: (item) => {
      if (item.currentState !== state) {
        onTaskDrop(item.taskId, state);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const getColumnColor = (state: number) => {
    switch (state) {
      case 0: return { bg: 'bg-gradient-to-br from-slate-50 to-gray-50', border: 'border-gray-200', ring: 'ring-gray-300' };
      case 1: return { bg: 'bg-gradient-to-br from-amber-50 to-orange-50', border: 'border-warning-200', ring: 'ring-warning-300' };
      case 2: return { bg: 'bg-gradient-to-br from-emerald-50 to-green-50', border: 'border-success-200', ring: 'ring-success-300' };
      default: return { bg: 'bg-gray-50', border: 'border-gray-200', ring: 'ring-gray-300' };
    }
  };

  const colors = getColumnColor(state);

  return (
    <div className="flex flex-col">
      <div className={`flex items-center justify-between mb-4 pb-3 border-b-2 ${colors.border}`}>
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <span className="text-sm font-bold text-gray-700 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
          {tasks.length}
        </span>
      </div>
      <div
        ref={drop as any}
        className={`space-y-3 min-h-[500px] p-4 rounded-2xl border-2 transition-all duration-300 ${
          isOver ? `${colors.bg} ring-4 ${colors.ring} ring-opacity-30 scale-[1.02]` : 'bg-white/40 border-gray-100'
        }`}
      >
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => onTaskClick(task)}
            members={members}
            currentUserAddress={currentUserAddress}
            isManager={isManager}
          />
        ))}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <svg className="w-16 h-16 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-sm font-medium">No tasks yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Task Card Component with Drag functionality
function TaskCard({
  task,
  onClick,
  members,
  currentUserAddress,
  isManager,
}: {
  task: Task;
  onClick: () => void;
  members: Member[];
  currentUserAddress?: string;
  isManager: boolean;
}) {
  const assigneeName =
    members.find((m) => m.address.toLowerCase() === task.assignee.toLowerCase())?.displayName ||
    `${task.assignee.substring(0, 6)}...${task.assignee.substring(task.assignee.length - 4)}`;

  const completedSubtasks = task.subtasks.filter((s) => s.state === 2).length;
  const totalSubtasks = task.subtasks.length;

  // Check if current user can drag this task (manager or assignee)
  const isAssignee = currentUserAddress &&
    task.assignee.toLowerCase() === currentUserAddress.toLowerCase();
  const canDrag = isManager || isAssignee;

  const [{ isDragging }, drag] = useDrag<
    { taskId: string; currentState: number },
    void,
    { isDragging: boolean }
  >(() => ({
    type: DRAG_TYPE,
    item: { taskId: task.id, currentState: task.state },
    canDrag,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={canDrag ? (drag as any) : null}
      onClick={onClick}
      className={`group relative bg-white border-2 border-gray-100 rounded-xl p-4 hover:shadow-soft hover:border-primary-200 transition-all duration-200 ${
        canDrag ? 'cursor-move active:cursor-grabbing' : 'cursor-pointer'
      } ${isDragging ? 'opacity-40 rotate-2 scale-95' : 'opacity-100 hover:-translate-y-0.5'}`}
    >
      {/* Drag indicator */}
      {canDrag && (
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-30 transition-opacity">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>
      )}

      <h4 className="font-semibold text-gray-900 mb-2 pr-6 group-hover:text-primary-600 transition-colors">
        {task.name}
      </h4>
      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between text-xs mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center shadow-sm ring-2 ring-primary-100">
            <span className="text-white font-bold text-xs">
              {assigneeName[0]?.toUpperCase()}
            </span>
          </div>
          <span className="text-gray-700 font-medium">{assigneeName}</span>
        </div>

        {totalSubtasks > 0 && (
          <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded-md font-medium">
            {completedSubtasks}/{totalSubtasks}
          </span>
        )}
      </div>

      {/* Due date and attachments */}
      <div className="flex items-center gap-3 text-xs pt-3 border-t border-gray-100">
        {task.dueDate && parseInt(task.dueDate) > 0 && (
          <div className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg ${
            isDueDateOverdue(task.dueDate)
              ? 'bg-red-50 text-red-600'
              : 'bg-blue-50 text-blue-600'
          }`}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-semibold">{formatDueDate(task.dueDate)}</span>
          </div>
        )}

        {task.attachments.length > 0 && (
          <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-purple-50 text-purple-600">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
            <span className="font-semibold">{task.attachments.length}</span>
          </div>
        )}
      </div>
    </div>
  );
}
