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
  members: Member[];
  tasks: Task[];
}

const STATE_LABELS = {
  0: 'To Do',
  1: 'In Progress',
  2: 'Done',
};

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { isConnected, currentAccount } = useWallet();
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

        // TODO: Fetch manager cap ID from owned objects
        // For now, we'll need to implement a way to get the ProjectManagerCap object ID
        // This would typically be done by querying owned objects of type ProjectManagerCap
        // that match this project ID
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
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-600 mt-2">{project.description}</p>
            <div className="mt-4 flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {project.members.length} member{project.members.length !== 1 ? 's' : ''}
              </span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-500">
                {project.tasks.length} task{project.tasks.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="flex space-x-3">
            {isManager && (
              <Button variant="secondary" onClick={() => setShowMemberModal(true)}>
                Manage Members
              </Button>
            )}
            <Button onClick={() => setShowCreateTaskModal(true)}>Create Task</Button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-3 gap-6">
        {/* To Do Column */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">To Do</h3>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {groupedTasks.todo.length}
            </span>
          </div>
          <div className="space-y-3">
            {groupedTasks.todo.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => handleTaskClick(task)}
                members={project.members}
              />
            ))}
            {groupedTasks.todo.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">No tasks</p>
            )}
          </div>
        </div>

        {/* In Progress Column */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">In Progress</h3>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {groupedTasks.inProgress.length}
            </span>
          </div>
          <div className="space-y-3">
            {groupedTasks.inProgress.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => handleTaskClick(task)}
                members={project.members}
              />
            ))}
            {groupedTasks.inProgress.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">No tasks</p>
            )}
          </div>
        </div>

        {/* Done Column */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Done</h3>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {groupedTasks.done.length}
            </span>
          </div>
          <div className="space-y-3">
            {groupedTasks.done.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => handleTaskClick(task)}
                members={project.members}
              />
            ))}
            {groupedTasks.done.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">No tasks</p>
            )}
          </div>
        </div>
      </div>

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

// Task Card Component
function TaskCard({
  task,
  onClick,
  members,
}: {
  task: Task;
  onClick: () => void;
  members: Member[];
}) {
  const assigneeName =
    members.find((m) => m.address === task.assignee)?.displayName || 'Unknown';

  const completedSubtasks = task.subtasks.filter((s) => s.state === 2).length;
  const totalSubtasks = task.subtasks.length;

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
    >
      <h4 className="font-medium text-gray-900 mb-2">{task.name}</h4>
      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-700 font-medium text-xs">
              {assigneeName[0]?.toUpperCase()}
            </span>
          </div>
          <span className="text-gray-600">{assigneeName}</span>
        </div>

        {totalSubtasks > 0 && (
          <span className="text-gray-500">
            {completedSubtasks}/{totalSubtasks} subtasks
          </span>
        )}
      </div>

      {task.attachments.length > 0 && (
        <div className="mt-2 flex items-center space-x-1 text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
            />
          </svg>
          <span className="text-xs">{task.attachments.length}</span>
        </div>
      )}
    </div>
  );
}
