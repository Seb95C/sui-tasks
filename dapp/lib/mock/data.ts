import { Project, ProjectStats } from '@/types/project';
import { ProjectMember } from '@/types/user';
import { Task, TaskState, Attachment, Subtask } from '@/types/task';

type MockUser = {
  address: string;
  username: string;
  createdAt: string;
};

export const mockUsers: MockUser[] = [
  {
    address: '0x1234567890abcdef1234567890abcdef12345678',
    username: 'alice',
    createdAt: new Date().toISOString(),
  },
  {
    address: '0xabcdef1234567890abcdef1234567890abcdef12',
    username: 'bob',
    createdAt: new Date().toISOString(),
  },
  {
    address: '0x9876543210fedcba9876543210fedcba98765432',
    username: 'charlie',
    createdAt: new Date().toISOString(),
  },
];

const makeSubtasks = (taskId: string): Subtask[] => [
  {
    id: `${taskId}-sub-1`,
    taskId,
    subtaskId: '0',
    name: 'Outline work',
    description: 'Break down the task into smaller steps',
    state: TaskState.TODO,
  },
  {
    id: `${taskId}-sub-2`,
    taskId,
    subtaskId: '1',
    name: 'Ship changes',
    description: 'Submit PR and run checks',
    state: TaskState.IN_PROGRESS,
  },
];

const makeAttachments = (taskId: string): Attachment[] => [
  {
    id: `${taskId}-att-1`,
    taskId,
    attachmentId: '0',
    name: 'Design Doc',
    url: 'https://example.com/design',
  },
];

const sampleTasks = (projectId: string, assignee: string): Task[] => [
  {
    id: `${projectId}-task-1`,
    projectId,
    name: 'Kickoff',
    description: 'Hold a kickoff call with the team',
    assignee,
    state: TaskState.TODO,
    dueDate: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: makeSubtasks(`${projectId}-task-1`),
    attachments: makeAttachments(`${projectId}-task-1`),
  },
  {
    id: `${projectId}-task-2`,
    projectId,
    name: 'Implement feature',
    description: 'Build the first milestone deliverable',
    assignee,
    state: TaskState.IN_PROGRESS,
    dueDate: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subtasks: [],
    attachments: [],
  },
];

export const mockProjectMembers: Record<string, ProjectMember[]> = {
  'project-1': [
    {
      id: 'member-1',
      projectId: 'project-1',
      address: mockUsers[0].address,
      displayName: 'Alice',
      joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'member-2',
      projectId: 'project-1',
      address: mockUsers[1].address,
      displayName: 'Bob',
      joinedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  'project-2': [
    {
      id: 'member-3',
      projectId: 'project-2',
      address: mockUsers[0].address,
      displayName: 'Alice',
      joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'member-4',
      projectId: 'project-2',
      address: mockUsers[2].address,
      displayName: 'Charlie',
      joinedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
};

const mockTasksByProject: Record<string, Task[]> = {
  'project-1': sampleTasks('project-1', mockUsers[1].address),
  'project-2': sampleTasks('project-2', mockUsers[2].address),
};

export const mockProjectStats: Record<string, ProjectStats> = Object.fromEntries(
  Object.entries(mockTasksByProject).map(([projectId, tasks]) => {
    const todoCount = tasks.filter((t) => t.state === TaskState.TODO).length;
    const inProgressCount = tasks.filter((t) => t.state === TaskState.IN_PROGRESS).length;
    const doneCount = tasks.filter((t) => t.state === TaskState.DONE).length;
    return [
      projectId,
      {
        totalTasks: tasks.length,
        todoCount,
        inProgressCount,
        doneCount,
        membersCount: mockProjectMembers[projectId]?.length || 0,
      },
    ];
  }),
);

export const mockProjects: Project[] = [
  {
    id: 'project-1',
    name: 'DeFi Protocol',
    description: 'Building a decentralized finance protocol on Sui blockchain',
    manager: mockUsers[0].address,
    managerCapId: '0xmanagercap1',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    members: mockProjectMembers['project-1'],
    tasks: mockTasksByProject['project-1'],
  },
  {
    id: 'project-2',
    name: 'NFT Marketplace',
    description: 'A marketplace for trading unique digital assets',
    manager: mockUsers[0].address,
    managerCapId: '0xmanagercap2',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    members: mockProjectMembers['project-2'],
    tasks: mockTasksByProject['project-2'],
  },
];

// Helper to simulate API latency in UI flows
export const simulateDelay = (ms: number = 800) =>
  new Promise((resolve) => setTimeout(resolve, ms));
