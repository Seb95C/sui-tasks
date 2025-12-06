/**
 * Project context
 * Manages username onboarding, projects, and task interactions via REST reads + chain transactions.
 */

'use client';

import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Transaction } from '@mysten/sui/transactions';
import { useWallet } from './WalletContext';
import { fetchProjectsByAddress } from '@/lib/api/projects';
import { fetchUsernameByAddress } from '@/lib/api/usernames';
import {
  buildAddMemberTx,
  buildAssigneeAddAttachmentTx,
  buildAssigneeRemoveAttachmentTx,
  buildAssigneeUpdateTaskStateTx,
  buildCloseProjectTx,
  buildDeleteTaskTx,
  buildManagerAddAttachmentTx,
  buildManagerAddSubtaskTx,
  buildManagerAddTaskTx,
  buildManagerDeleteSubtaskTx,
  buildManagerRemoveAttachmentTx,
  buildManagerUpdateSubtaskTx,
  buildManagerUpdateTaskAssigneeTx,
  buildManagerUpdateTaskDescriptionTx,
  buildManagerUpdateTaskDueDateTx,
  buildManagerUpdateTaskNameTx,
  buildManagerUpdateTaskStateTx,
  buildMemberAddSubtaskTx,
  buildMemberCreateTaskTx,
  buildMemberDeleteSubtaskTx,
  buildMemberUpdateSubtaskTx,
  buildMemberUpdateTaskDescriptionTx,
  buildMemberUpdateTaskDueDateTx,
  buildMemberUpdateTaskNameTx,
  buildMintProjectTx,
  buildRegisterUsernameTx,
  buildRemoveMemberTx,
} from '@/lib/sui/transactions';
import { Project, ProjectStats, CreateProjectInput } from '@/types/project';
import { ProjectMember, UsernameRecord } from '@/types/user';
import { Attachment, Subtask, Task, TaskState } from '@/types/task';
import { MODULES, PACKAGE_ID } from '@/lib/sui/constants';

type ProfileStatus = 'disconnected' | 'checking' | 'needs-username' | 'ready';

interface ProjectContextType {
  usernameRecord: UsernameRecord | null;
  profileStatus: ProfileStatus;
  projects: Project[];
  currentProject: Project | null;
  projectStats: ProjectStats | null;
  loading: boolean;
  error: string | null;
  managerCaps: Record<string, string>;

  selectProject: (projectId: string | null) => void;
  refreshProfile: () => Promise<void>;
  registerUsername: (username: string) => Promise<void>;
  createProject: (input: CreateProjectInput, opts?: { managerCapId?: string }) => Promise<void>;
  addMember: (
    projectId: string,
    memberAddress: string,
    displayName: string,
    opts?: { managerCapId?: string },
  ) => Promise<void>;
  removeMember: (
    projectId: string,
    memberAddress: string,
    opts?: { managerCapId?: string },
  ) => Promise<void>;
  closeProject: (projectId: string, opts?: { managerCapId?: string }) => Promise<void>;
  createTaskAsManager: (
    projectId: string,
    payload: { name: string; description: string; assignee: string; state: TaskState; dueDate?: string },
    opts?: { managerCapId?: string },
  ) => Promise<void>;
  createTaskAsMember: (
    projectId: string,
    payload: { name: string; description: string; state: TaskState; dueDate?: string },
  ) => Promise<void>;
  updateTaskState: (
    projectId: string,
    taskId: string,
    state: TaskState,
    opts?: { managerCapId?: string },
  ) => Promise<void>;
  updateTaskDetails: (projectId: string, taskId: string, updates: Partial<Task>, opts?: { managerCapId?: string }) => Promise<void>;
  deleteTask: (projectId: string, taskId: string, opts?: { managerCapId?: string }) => Promise<void>;
  addSubtask: (
    projectId: string,
    taskId: string,
    payload: { name: string; description: string; state: TaskState },
    opts?: { managerCapId?: string },
  ) => Promise<void>;
  updateSubtask: (
    projectId: string,
    taskId: string,
    subtask: { subtaskId: number; name: string; description: string; state: TaskState },
    opts?: { managerCapId?: string },
  ) => Promise<void>;
  deleteSubtask: (
    projectId: string,
    taskId: string,
    subtaskId: number,
    opts?: { managerCapId?: string },
  ) => Promise<void>;
  addAttachment: (
    projectId: string,
    taskId: string,
    attachment: { name: string; url: string },
    opts?: { managerCapId?: string },
  ) => Promise<void>;
  removeAttachment: (
    projectId: string,
    taskId: string,
    attachmentId: number,
    opts?: { managerCapId?: string },
  ) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { currentAccount, signAndExecuteTransaction } = useWallet();
  const [usernameRecord, setUsernameRecord] = useState<UsernameRecord | null>(null);
  const [profileStatus, setProfileStatus] = useState<ProfileStatus>('disconnected');
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [managerCaps, setManagerCaps] = useState<Record<string, string>>({});

  const currentProject = useMemo(
    () => projects.find((p) => p.id === currentProjectId) || projects[0] || null,
    [currentProjectId, projects],
  );

  const projectStats: ProjectStats | null = useMemo(() => {
    if (!currentProject) return null;
    const todoCount = currentProject.tasks.filter((t) => t.state === TaskState.TODO).length;
    const inProgressCount = currentProject.tasks.filter((t) => t.state === TaskState.IN_PROGRESS).length;
    const doneCount = currentProject.tasks.filter((t) => t.state === TaskState.DONE).length;
    return {
      totalTasks: currentProject.tasks.length,
      todoCount,
      inProgressCount,
      doneCount,
      membersCount: currentProject.members.length,
    };
  }, [currentProject]);

  const selectProject = useCallback((projectId: string | null) => {
    setCurrentProjectId(projectId);
  }, []);

  const resolveManagerCap = useCallback(
    (projectId: string, override?: string): string => {
      const cap = override || managerCaps[projectId] || null;
      if (override) {
        setManagerCaps((prev) => ({ ...prev, [projectId]: override }));
      }
      if (cap) return cap;
      throw new Error('Manager cap ID is required for this action.');
    },
    [managerCaps],
  );

  const runTx = useCallback(
    async (build: () => Transaction, refresh: boolean = true) => {
      if (!signAndExecuteTransaction || !currentAccount) {
        throw new Error('Connect your wallet to continue');
      }

      setLoading(true);
      setError(null);

      try {
        const result = await signAndExecuteTransaction({
          transaction: build(),
          options: {
            showEffects: true,
            showObjectChanges: true,
          },
        });

        if (refresh && currentAccount) {
          await fetchAndSetProjects(currentAccount.address);
        }

        return result;
      } catch (err: any) {
        const msg = err?.message || 'Transaction failed';
        setError(msg);
        console.error(msg, err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentAccount, signAndExecuteTransaction],
  );

  const fetchAndSetProjects = useCallback(
    async (address: string) => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchProjectsByAddress(address);
        setProjects(data);

        const capsFromProjects = Object.fromEntries(
          data
            .filter((p) => p.managerCapId)
            .map((p) => [p.id, p.managerCapId as string]),
        );
        setManagerCaps((prev) => ({ ...capsFromProjects, ...prev }));

        if (data.length && !currentProjectId) {
          setCurrentProjectId(data[0].id);
        } else if (currentProjectId && !data.find((p) => p.id === currentProjectId)) {
          setCurrentProjectId(data[0]?.id || null);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    },
    [currentProjectId],
  );

  const refreshProfile = useCallback(async () => {
    if (!currentAccount) {
      setProfileStatus('disconnected');
      setUsernameRecord(null);
      setProjects([]);
      return;
    }

    setProfileStatus('checking');
    const record = await fetchUsernameByAddress(currentAccount.address);
    if (!record) {
      setProfileStatus('needs-username');
      setUsernameRecord(null);
      setProjects([]);
      return;
    }

    setUsernameRecord(record);
    setProfileStatus('ready');
    await fetchAndSetProjects(currentAccount.address);
  }, [currentAccount, fetchAndSetProjects]);

  useEffect(() => {
    if (!currentAccount) {
      setProfileStatus('disconnected');
      setUsernameRecord(null);
      setProjects([]);
      setCurrentProjectId(null);
      return;
    }
    refreshProfile();
  }, [currentAccount, refreshProfile]);

  const registerUsername = useCallback(
    async (username: string) => {
      await runTx(() => buildRegisterUsernameTx(username));
      await refreshProfile();
    },
    [refreshProfile, runTx],
  );

  const createProject = useCallback(
    async (input: CreateProjectInput, opts?: { managerCapId?: string }) => {
      if (!usernameRecord) {
        throw new Error('Register a username before creating a project');
      }

      const result = await runTx(() =>
        buildMintProjectTx({
          name: input.name,
          description: input.description,
          managerDisplayName: input.displayName,
        }),
      );

      const createdCaps =
        (result.objectChanges as any[])?.filter((c) => c.type === 'created') || [];

      const projectObj = createdCaps.find((c) =>
        (c.objectType as string)?.includes(`${PACKAGE_ID}::${MODULES.PROJECT}::Project`),
      );
      const managerCapObj = createdCaps.find((c) =>
        (c.objectType as string)?.includes(
          `${PACKAGE_ID}::${MODULES.PROJECT}::ProjectManagerCap`,
        ),
      );

      if (projectObj && managerCapObj) {
        setManagerCaps((prev) => ({
          ...prev,
          [projectObj.objectId]: managerCapObj.objectId,
        }));
      }
    },
    [runTx, usernameRecord],
  );

  const addMember = useCallback(
    async (
      projectId: string,
      memberAddress: string,
      displayName: string,
      opts?: { managerCapId?: string },
    ) => {
      const managerCapId = resolveManagerCap(projectId, opts?.managerCapId);
      await runTx(() =>
        buildAddMemberTx({
          managerCapId,
          projectId,
          memberAddress,
          displayName,
        }),
      );
    },
    [resolveManagerCap, runTx],
  );

  const removeMember = useCallback(
    async (projectId: string, memberAddress: string, opts?: { managerCapId?: string }) => {
      const managerCapId = resolveManagerCap(projectId, opts?.managerCapId);
      await runTx(() =>
        buildRemoveMemberTx({
          managerCapId,
          projectId,
          memberAddress,
        }),
      );
    },
    [resolveManagerCap, runTx],
  );

  const closeProject = useCallback(
    async (projectId: string, opts?: { managerCapId?: string }) => {
      const managerCapId = resolveManagerCap(projectId, opts?.managerCapId);
      await runTx(() =>
        buildCloseProjectTx({
          managerCapId,
          projectId,
        }),
      );
    },
    [resolveManagerCap, runTx],
  );

  const createTaskAsManager = useCallback(
    async (
      projectId: string,
      payload: { name: string; description: string; assignee: string; state: TaskState; dueDate?: string },
      opts?: { managerCapId?: string },
    ) => {
      const managerCapId = resolveManagerCap(projectId, opts?.managerCapId);
      await runTx(() =>
        buildManagerAddTaskTx({
          managerCapId,
          projectId,
          name: payload.name,
          description: payload.description,
          assignee: payload.assignee,
          state: payload.state,
          dueDate: payload.dueDate,
        }),
      );
    },
    [resolveManagerCap, runTx],
  );

  const createTaskAsMember = useCallback(
    async (
      projectId: string,
      payload: { name: string; description: string; state: TaskState; dueDate?: string },
    ) => {
      await runTx(() =>
        buildMemberCreateTaskTx({
          projectId,
          name: payload.name,
          description: payload.description,
          state: payload.state,
          dueDate: payload.dueDate,
        }),
      );
    },
    [runTx],
  );

  const updateTaskState = useCallback(
    async (
      projectId: string,
      taskId: string,
      state: TaskState,
      opts?: { managerCapId?: string },
    ) => {
      const project = projects.find((p) => p.id === projectId);
      const isManager =
        project && currentAccount
          ? project.manager.toLowerCase() === currentAccount.address.toLowerCase()
          : false;

      if (isManager) {
        const managerCapId = resolveManagerCap(projectId, opts?.managerCapId);
        await runTx(() =>
          buildManagerUpdateTaskStateTx({
            managerCapId,
            projectId,
            taskId,
            state,
          }),
        );
      } else {
        await runTx(() =>
          buildAssigneeUpdateTaskStateTx({
            projectId,
            taskId,
            state,
          }),
        );
      }
    },
    [currentAccount, projects, resolveManagerCap, runTx],
  );

  const updateTaskDetails = useCallback(
    async (projectId: string, taskId: string, updates: Partial<Task>, opts?: { managerCapId?: string }) => {
      const project = projects.find((p) => p.id === projectId);
      const isManager =
        project && currentAccount
          ? project.manager.toLowerCase() === currentAccount.address.toLowerCase()
          : false;

      if (isManager) {
        const managerCapId = resolveManagerCap(projectId, opts?.managerCapId);

        if (updates.name) {
          await runTx(() =>
            buildManagerUpdateTaskNameTx({
              managerCapId,
              projectId,
              taskId,
              name: updates.name as string,
            }),
          );
        }

        if (updates.description) {
          await runTx(() =>
            buildManagerUpdateTaskDescriptionTx({
              managerCapId,
              projectId,
              taskId,
              description: updates.description as string,
            }),
          );
        }

        if (updates.assignee) {
          await runTx(() =>
            buildManagerUpdateTaskAssigneeTx({
              managerCapId,
              projectId,
              taskId,
              assignee: updates.assignee as string,
            }),
          );
        }

        if (updates.dueDate) {
          await runTx(() =>
            buildManagerUpdateTaskDueDateTx({
              managerCapId,
              projectId,
              taskId,
              dueDate: updates.dueDate as string,
            }),
          );
        }
      } else {
        if (updates.name) {
          await runTx(() =>
            buildMemberUpdateTaskNameTx({
              projectId,
              taskId,
              name: updates.name as string,
            }),
          );
        }

        if (updates.description) {
          await runTx(() =>
            buildMemberUpdateTaskDescriptionTx({
              projectId,
              taskId,
              description: updates.description as string,
            }),
          );
        }

        if (updates.dueDate) {
          await runTx(() =>
            buildMemberUpdateTaskDueDateTx({
              projectId,
              taskId,
              dueDate: updates.dueDate as string,
            }),
          );
        }
      }
    },
    [currentAccount, projects, resolveManagerCap, runTx],
  );

  const deleteTask = useCallback(
    async (projectId: string, taskId: string, opts?: { managerCapId?: string }) => {
      const managerCapId = resolveManagerCap(projectId, opts?.managerCapId);
      await runTx(() =>
        buildDeleteTaskTx({
          managerCapId,
          projectId,
          taskId,
        }),
      );
    },
    [resolveManagerCap, runTx],
  );

  const addSubtask = useCallback(
    async (
      projectId: string,
      taskId: string,
      payload: { name: string; description: string; state: TaskState },
      opts?: { managerCapId?: string },
    ) => {
      const project = projects.find((p) => p.id === projectId);
      const isManager =
        project && currentAccount
          ? project.manager.toLowerCase() === currentAccount.address.toLowerCase()
          : false;

      if (isManager) {
        const managerCapId = resolveManagerCap(projectId, opts?.managerCapId);
        await runTx(() =>
          buildManagerAddSubtaskTx({
            managerCapId,
            projectId,
            taskId,
            name: payload.name,
            description: payload.description,
            state: payload.state,
          }),
        );
      } else {
        await runTx(() =>
          buildMemberAddSubtaskTx({
            projectId,
            taskId,
            name: payload.name,
            description: payload.description,
            state: payload.state,
          }),
        );
      }
    },
    [currentAccount, projects, resolveManagerCap, runTx],
  );

  const updateSubtask = useCallback(
    async (
      projectId: string,
      taskId: string,
      subtask: { subtaskId: number; name: string; description: string; state: TaskState },
      opts?: { managerCapId?: string },
    ) => {
      const project = projects.find((p) => p.id === projectId);
      const isManager =
        project && currentAccount
          ? project.manager.toLowerCase() === currentAccount.address.toLowerCase()
          : false;

      if (isManager) {
        const managerCapId = resolveManagerCap(projectId, opts?.managerCapId);
        await runTx(() =>
          buildManagerUpdateSubtaskTx({
            managerCapId,
            projectId,
            taskId,
            subtaskId: subtask.subtaskId,
            name: subtask.name,
            description: subtask.description,
            state: subtask.state,
          }),
        );
      } else {
        await runTx(() =>
          buildMemberUpdateSubtaskTx({
            projectId,
            taskId,
            subtaskId: subtask.subtaskId,
            name: subtask.name,
            description: subtask.description,
            state: subtask.state,
          }),
        );
      }
    },
    [currentAccount, projects, resolveManagerCap, runTx],
  );

  const deleteSubtask = useCallback(
    async (projectId: string, taskId: string, subtaskId: number, opts?: { managerCapId?: string }) => {
      const project = projects.find((p) => p.id === projectId);
      const isManager =
        project && currentAccount
          ? project.manager.toLowerCase() === currentAccount.address.toLowerCase()
          : false;

      if (isManager) {
        const managerCapId = resolveManagerCap(projectId, opts?.managerCapId);
        await runTx(() =>
          buildManagerDeleteSubtaskTx({
            managerCapId,
            projectId,
            taskId,
            subtaskId,
          }),
        );
      } else {
        await runTx(() =>
          buildMemberDeleteSubtaskTx({
            projectId,
            taskId,
            subtaskId,
          }),
        );
      }
    },
    [currentAccount, projects, resolveManagerCap, runTx],
  );

  const addAttachment = useCallback(
    async (
      projectId: string,
      taskId: string,
      attachment: { name: string; url: string },
      opts?: { managerCapId?: string },
    ) => {
      const project = projects.find((p) => p.id === projectId);
      const isManager =
        project && currentAccount
          ? project.manager.toLowerCase() === currentAccount.address.toLowerCase()
          : false;

      if (isManager) {
        const managerCapId = resolveManagerCap(projectId, opts?.managerCapId);
        await runTx(() =>
          buildManagerAddAttachmentTx({
            managerCapId,
            projectId,
            taskId,
            name: attachment.name,
            url: attachment.url,
          }),
        );
      } else {
        await runTx(() =>
          buildAssigneeAddAttachmentTx({
            projectId,
            taskId,
            name: attachment.name,
            url: attachment.url,
          }),
        );
      }
    },
    [currentAccount, projects, resolveManagerCap, runTx],
  );

  const removeAttachment = useCallback(
    async (
      projectId: string,
      taskId: string,
      attachmentId: number,
      opts?: { managerCapId?: string },
    ) => {
      const project = projects.find((p) => p.id === projectId);
      const isManager =
        project && currentAccount
          ? project.manager.toLowerCase() === currentAccount.address.toLowerCase()
          : false;

      if (isManager) {
        const managerCapId = resolveManagerCap(projectId, opts?.managerCapId);
        await runTx(() =>
          buildManagerRemoveAttachmentTx({
            managerCapId,
            projectId,
            taskId,
            attachmentId,
          }),
        );
      } else {
        await runTx(() =>
          buildAssigneeRemoveAttachmentTx({
            projectId,
            taskId,
            attachmentId,
          }),
        );
      }
    },
    [currentAccount, projects, resolveManagerCap, runTx],
  );

  const value: ProjectContextType = {
    usernameRecord,
    profileStatus,
    projects,
    currentProject,
    projectStats,
    loading,
    error,
    managerCaps,
    selectProject,
    refreshProfile,
    registerUsername,
    createProject,
    addMember,
    removeMember,
    closeProject,
    createTaskAsManager,
    createTaskAsMember,
    updateTaskState,
    updateTaskDetails,
    deleteTask,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    addAttachment,
    removeAttachment,
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProjects() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProjects must be used within ProjectProvider');
  return ctx;
}
