import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { prisma } from './db';

const app = express();
app.use(cors());
app.use(express.json());

// ====================================
// STATE ENDPOINTS (Current State)
// ====================================

// Get all projects with members and tasks
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        members: true,
        tasks: {
          include: {
            subtasks: true,
            attachments: true,
          },
        },
      },
    });
    res.json(projects);
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get a specific project by ID
app.get('/api/projects/:id', async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        members: true,
        tasks: {
          include: {
            subtasks: true,
            attachments: true,
          },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Failed to fetch project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Get all members of a project
app.get('/api/projects/:id/members', async (req, res) => {
  try {
    const members = await prisma.member.findMany({
      where: { project_id: req.params.id },
      include: { project: true },
    });
    res.json(members);
  } catch (error) {
    console.error('Failed to fetch members:', error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// Get all tasks for a project
app.get('/api/projects/:id/tasks', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { project_id: req.params.id },
      include: {
        subtasks: true,
        attachments: true,
      },
    });
    res.json(tasks);
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get all tasks (with optional filters)
app.get('/api/tasks', async (req, res) => {
  try {
    const { assignee, state, project_id } = req.query;

    const where: any = {};
    if (assignee) where.assignee = assignee as string;
    if (state) where.state = parseInt(state as string);
    if (project_id) where.project_id = project_id as string;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: true,
        subtasks: true,
        attachments: true,
      },
    });
    res.json(tasks);
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get a specific task
app.get('/api/tasks/:id', async (req, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        project: true,
        subtasks: true,
        attachments: true,
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Failed to fetch task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// Get statistics
app.get('/api/stats', async (req, res) => {
  try {
    const stats = {
      projects: await prisma.project.count(),
      members: await prisma.member.count(),
      tasks: await prisma.task.count(),
      subtasks: await prisma.subtask.count(),
      attachments: await prisma.attachment.count(),
      events: {
        projectCreated: await prisma.projectCreated.count(),
        taskAdded: await prisma.taskAdded.count(),
        memberAdded: await prisma.memberAdded.count(),
      },
    };
    res.json(stats);
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ====================================
// EVENT ENDPOINTS (Audit Trail)
// ====================================

// Project events
app.get('/api/events/project-created', async (req, res) => {
  try {
    const events = await prisma.projectCreated.findMany();
    res.json(events);
  } catch (error) {
    console.error('Failed to fetch events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.get('/api/events/member-added', async (req, res) => {
  try {
    const events = await prisma.memberAdded.findMany();
    res.json(events);
  } catch (error) {
    console.error('Failed to fetch events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.get('/api/events/member-removed', async (req, res) => {
  try {
    const events = await prisma.memberRemoved.findMany();
    res.json(events);
  } catch (error) {
    console.error('Failed to fetch events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Task events
app.get('/api/events/task-added', async (req, res) => {
  try {
    const events = await prisma.taskAdded.findMany();
    res.json(events);
  } catch (error) {
    console.error('Failed to fetch events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.get('/api/events/task-deleted', async (req, res) => {
  try {
    const events = await prisma.deleteTask.findMany();
    res.json(events);
  } catch (error) {
    console.error('Failed to fetch events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.get('/api/events/task-updated', async (req, res) => {
  try {
    const [nameUpdates, descUpdates, assigneeUpdates, stateUpdates, dueDateUpdates] = await Promise.all([
      prisma.taskNameUpdated.findMany(),
      prisma.taskDescriptionUpdated.findMany(),
      prisma.taskAssigneeUpdated.findMany(),
      prisma.taskStateUpdated.findMany(),
      prisma.taskDueDateUpdated.findMany(),
    ]);

    res.json({
      nameUpdates,
      descriptionUpdates: descUpdates,
      assigneeUpdates,
      stateUpdates,
      dueDateUpdates,
    });
  } catch (error) {
    console.error('Failed to fetch events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Subtask events
app.get('/api/events/subtask-added', async (req, res) => {
  try {
    const events = await prisma.subtaskAdded.findMany();
    res.json(events);
  } catch (error) {
    console.error('Failed to fetch events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.get('/api/events/subtask-updated', async (req, res) => {
  try {
    const events = await prisma.subtaskUpdated.findMany();
    res.json(events);
  } catch (error) {
    console.error('Failed to fetch events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.get('/api/events/subtask-deleted', async (req, res) => {
  try {
    const events = await prisma.subtaskDeleted.findMany();
    res.json(events);
  } catch (error) {
    console.error('Failed to fetch events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Attachment events
app.get('/api/events/attachment-added', async (req, res) => {
  try {
    const events = await prisma.attachmentAdded.findMany();
    res.json(events);
  } catch (error) {
    console.error('Failed to fetch events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.get('/api/events/attachment-removed', async (req, res) => {
  try {
    const events = await prisma.attachmentRemoved.findMany();
    res.json(events);
  } catch (error) {
    console.error('Failed to fetch events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Username events
app.get('/api/events/username-registered', async (req, res) => {
  try {
    const events = await prisma.usernameRegistered.findMany();
    res.json(events);
  } catch (error) {
    console.error('Failed to fetch events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Sui Task Indexer API',
    version: '1.0.0',
    endpoints: {
      state: {
        projects: 'GET /api/projects',
        project: 'GET /api/projects/:id',
        projectMembers: 'GET /api/projects/:id/members',
        projectTasks: 'GET /api/projects/:id/tasks',
        tasks: 'GET /api/tasks?assignee=&state=&project_id=',
        task: 'GET /api/tasks/:id',
        stats: 'GET /api/stats',
      },
      events: {
        projectCreated: 'GET /api/events/project-created',
        memberAdded: 'GET /api/events/member-added',
        memberRemoved: 'GET /api/events/member-removed',
        taskAdded: 'GET /api/events/task-added',
        taskDeleted: 'GET /api/events/task-deleted',
        taskUpdated: 'GET /api/events/task-updated',
        subtaskAdded: 'GET /api/events/subtask-added',
        subtaskUpdated: 'GET /api/events/subtask-updated',
        subtaskDeleted: 'GET /api/events/subtask-deleted',
        attachmentAdded: 'GET /api/events/attachment-added',
        attachmentRemoved: 'GET /api/events/attachment-removed',
        usernameRegistered: 'GET /api/events/username-registered',
      },
    },
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API documentation: http://localhost:${PORT}/`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
});
