# Sui Task Indexer

A blockchain indexer for the Sui Task Management dApp that maintains both event history and current state.

> **👥 New Team Member?** See [SETUP.md](./SETUP.md) for detailed setup instructions.
>
> **🚀 Deploy to Production?** See [DEPLOY_RAILWAY.md](./DEPLOY_RAILWAY.md) for step-by-step deployment.

## Features

- **Event Storage**: All blockchain events are stored for complete audit trail
- **State Tables**: Current state of Projects, Tasks, Members, Subtasks, and Attachments
- **Real-time Updates**: Automatically syncs with Sui blockchain
- **Type-Safe Queries**: Full TypeScript support with Prisma
- **Easy Querying**: Simple API to query current state without reconstructing from events

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

Create a `.env` file:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
PACKAGE_ID="your_package_id"
NETWORK="testnet"
POLLING_INTERVAL_MS="1000"
```

### 3. Initialize Database

```bash
# Run migrations
npm run db:setup:dev

# Generate Prisma client
npm run build
```

### 4. Backfill State Tables (if migrating from event-only setup)

```bash
npm run backfill
```

This populates state tables from existing events.

### 5. Start the Indexer

```bash
npm run indexer
```

## Database Structure

### Event Tables (Audit Trail)
Store all blockchain events for historical tracking:
- `ProjectCreated`, `MemberAdded`, `MemberRemoved`
- `TaskAdded`, `DeleteTask`, `TaskNameUpdated`, etc.
- `SubtaskAdded`, `SubtaskUpdated`, `SubtaskDeleted`
- `AttachmentAdded`, `AttachmentRemoved`

### State Tables (Current State)
Store current state for easy querying:
- `Project` - Current project details with relations to members and tasks
- `Member` - Active members of projects
- `Task` - Current tasks with latest updates
- `Subtask` - Active subtasks
- `Attachment` - Active attachments

## Usage

### Query Current State

```typescript
import { prisma } from './db';

// Get all projects with members and tasks
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

// Get a specific project
const project = await prisma.project.findUnique({
  where: { id: projectId },
  include: { members: true, tasks: true },
});

// Get tasks assigned to a user
const tasks = await prisma.task.findMany({
  where: { assignee: userAddress },
  include: { project: true, subtasks: true },
});

// Get tasks by state
const openTasks = await prisma.task.findMany({
  where: { state: 0 },
});
```

### Example Scripts

```bash
# Run query examples
npm run query:examples

# View database in Prisma Studio
npm run db:studio
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run indexer` | Start the indexer (1s polling) |
| `npm run indexer:fast` | Fast polling (1s) |
| `npm run indexer:slow` | Slow polling (10s) |
| `npm run backfill` | Backfill state from events |
| `npm run query:examples` | Run query examples |
| `npm run db:setup:dev` | Run migrations |
| `npm run db:reset:dev` | Reset database |
| `npm run db:studio` | Open Prisma Studio |
| `npm run build` | Generate Prisma client |

## How It Works

When a blockchain event occurs:

1. **Event is stored** in event table (for audit trail)
2. **State is updated** in state table (for current state)

Example: When `TaskNameUpdated` event occurs:
```typescript
// 1. Store event
await prisma.taskNameUpdated.createMany({ data: events });

// 2. Update state
await prisma.task.update({
  where: { id: event.task_id },
  data: { name: event.new_name }
});
```

## Backfilling

If you have existing events but empty state tables:

```bash
npm run backfill
```

This reconstructs current state from all historical events by:
- Creating projects from ProjectCreated events
- Adding members (excluding removed ones)
- Creating tasks with all updates applied
- Adding subtasks and attachments (excluding deleted ones)

## Troubleshooting

### State tables are empty after indexer runs
- The indexer only updates state for NEW events
- Run `npm run backfill` to populate from existing events

### Database connection errors
- Check DATABASE_URL in .env
- Ensure PostgreSQL is running
- Verify database credentials

### Missing Prisma client types
- Run `npm run build` to regenerate Prisma client

## Documentation

See [STATE_TABLES.md](./STATE_TABLES.md) for detailed documentation on:
- Database architecture
- State management logic
- Query examples
- API integration
- Maintenance procedures

## Architecture

```
Blockchain Events
       ↓
Event Handler
       ↓
  ┌─────┴─────┐
  ↓           ↓
Event      State
Tables     Tables
  ↓           ↓
Audit    Current State
Trail      Queries
```

## Benefits

- **Simple Queries**: No need to reconstruct state from events
- **Performance**: Direct queries to current state are fast
- **Audit Trail**: Event tables preserve full history
- **Relationships**: Use Prisma's relations to join data
- **Type Safety**: Full TypeScript support

## License

MIT
