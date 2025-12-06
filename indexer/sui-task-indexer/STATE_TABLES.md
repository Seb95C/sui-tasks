# State Tables Documentation

## Overview

The indexer now maintains **state tables** in addition to event tables. State tables store the current state of blockchain objects (Projects, Tasks, Members, etc.), making it easy to query the latest state without reconstructing it from events.

## Database Architecture

### Event Tables (Audit Trail)
These tables store all events for historical tracking:
- `ProjectCreated`
- `MemberAdded`, `MemberRemoved`
- `TaskAdded`, `DeleteTask`
- `TaskNameUpdated`, `TaskDescriptionUpdated`, `TaskAssigneeUpdated`, `TaskStateUpdated`, `TaskDueDateUpdated`
- `SubtaskAdded`, `SubtaskUpdated`, `SubtaskDeleted`
- `AttachmentAdded`, `AttachmentRemoved`

### State Tables (Current State)
These tables store the current state of objects:

#### `Project`
- `id` (String, Primary Key) - Project ID from Sui
- `name` (String) - Project name
- `description` (String) - Project description
- `manager` (String) - Manager's address
- `created_at` (DateTime) - When indexed
- `updated_at` (DateTime) - Last update timestamp
- Relations: `members[]`, `tasks[]`

#### `Member`
- `id` (String, Primary Key) - Auto-generated UUID
- `project_id` (String, Foreign Key) - References `Project.id`
- `address` (String) - Member's address
- `display_name` (String) - Member's display name
- `joined_at` (String) - Timestamp from blockchain
- Unique constraint: `(project_id, address)`

#### `Task`
- `id` (String, Primary Key) - Task ID from Sui
- `project_id` (String, Foreign Key) - References `Project.id`
- `name` (String) - Task name
- `description` (String) - Task description
- `assignee` (String) - Assignee's address
- `state` (Int) - Task state (0=open, 1=in progress, etc.)
- `due_date` (String) - Due date timestamp
- `created_at` (DateTime) - When indexed
- `updated_at` (DateTime) - Last update timestamp
- Relations: `subtasks[]`, `attachments[]`

#### `Subtask`
- `id` (String, Primary Key) - Auto-generated UUID
- `task_id` (String, Foreign Key) - References `Task.id`
- `subtask_id` (String) - Subtask ID from blockchain
- `name` (String) - Subtask name
- `description` (String) - Subtask description
- `state` (Int) - Subtask state
- Unique constraint: `(task_id, subtask_id)`

#### `Attachment`
- `id` (String, Primary Key) - Auto-generated UUID
- `task_id` (String, Foreign Key) - References `Task.id`
- `attachment_id` (String) - Attachment ID from blockchain
- `name` (String) - Attachment name
- `url` (String) - Attachment URL
- Unique constraint: `(task_id, attachment_id)`

## How It Works

The indexer processes events and:
1. **Stores the event** in event tables (for audit trail)
2. **Updates the state** in state tables (for current state queries)

### Event Processing Flow

```
New Event → Event Handler → [Store Event] → [Update State]
```

For example, when a `TaskNameUpdated` event occurs:
```typescript
// 1. Store event for audit
await prisma.taskNameUpdated.createMany({ data: events });

// 2. Update state
await prisma.task.update({
  where: { id: event.task_id },
  data: { name: event.new_name }
});
```

## Query Examples

Run the query examples:
```bash
npm run query:examples
```

### Get all projects with members and tasks:
```typescript
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
```

### Get a specific project:
```typescript
const project = await prisma.project.findUnique({
  where: { id: projectId },
  include: {
    members: true,
    tasks: true,
  },
});
```

### Get tasks assigned to a user:
```typescript
const tasks = await prisma.task.findMany({
  where: { assignee: userAddress },
  include: {
    project: true,
    subtasks: true,
    attachments: true,
  },
});
```

### Get tasks by state:
```typescript
const openTasks = await prisma.task.findMany({
  where: { state: 0 },
  include: {
    project: true,
    subtasks: true,
  },
});
```

### Get project statistics:
```typescript
const stats = {
  totalProjects: await prisma.project.count(),
  totalTasks: await prisma.task.count(),
  totalMembers: await prisma.member.count(),
};
```

## Benefits

1. **Simple Queries**: No need to reconstruct state from events
2. **Performance**: Direct queries to current state are fast
3. **Audit Trail**: Event tables preserve full history
4. **Relationships**: Use Prisma's relations to easily join data
5. **Type Safety**: Full TypeScript support with Prisma client

## API Integration

You can now create API endpoints that query the state tables directly:

```typescript
// GET /api/projects
app.get('/api/projects', async (req, res) => {
  const projects = await prisma.project.findMany({
    include: { members: true, tasks: true }
  });
  res.json(projects);
});

// GET /api/projects/:id
app.get('/api/projects/:id', async (req, res) => {
  const project = await prisma.project.findUnique({
    where: { id: req.params.id },
    include: { members: true, tasks: true }
  });
  res.json(project);
});

// GET /api/tasks?assignee=<address>
app.get('/api/tasks', async (req, res) => {
  const tasks = await prisma.task.findMany({
    where: req.query.assignee ? { assignee: req.query.assignee } : {},
    include: { project: true, subtasks: true }
  });
  res.json(tasks);
});
```

## Backfilling State Tables

If you already have events in the database but the state tables are empty (e.g., after adding state tables to an existing indexer), run the backfill script:

```bash
npm run backfill
```

This script reconstructs the current state from all historical events. It:
- Processes all ProjectCreated events to create Projects
- Processes MemberAdded/Removed events to create current Members
- Processes all Task events to create current Tasks with latest updates
- Processes Subtask and Attachment events

**When to use:**
- After migrating to state tables from an event-only setup
- After database corruption or state table reset
- To verify state consistency

## Maintenance

### Reset and Re-index
If you need to rebuild the state tables from scratch:

```bash
# Reset the database (WARNING: deletes all data)
npm run db:reset:dev

# Run the indexer to rebuild from events
npm run indexer
```

### View Data
Open Prisma Studio to view the data:
```bash
npm run db:studio
```

## Notes

- State tables are updated atomically with event storage
- Foreign key constraints ensure referential integrity
- Cascade deletes ensure cleanup (e.g., deleting a Task deletes its Subtasks and Attachments)
- The indexer is idempotent - running it multiple times is safe
