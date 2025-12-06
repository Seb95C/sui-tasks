# Sui Task Indexer - Team Setup Guide

This guide will help your colleagues set up and run the Sui Task Indexer on their machines.

## Prerequisites

Before starting, ensure you have:

- **Node.js** version 20.19.0 or higher ([Download](https://nodejs.org/))
- **PostgreSQL** database (local or shared)
- **Git** installed
- Access to this repository

### Check Node.js version:
```bash
node --version  # Should be >= 20.19.0
```

### Install PostgreSQL (if running locally):
- **macOS**: `brew install postgresql@15`
- **Ubuntu/Debian**: `sudo apt-get install postgresql postgresql-contrib`
- **Windows**: [Download installer](https://www.postgresql.org/download/windows/)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd sui-tasks/indexer/sui-task-indexer
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including Prisma, TypeScript, and Sui SDK.

### 3. Set Up Database

#### Option A: Shared Team Database (Recommended for production)

If your team uses a shared database, ask your team lead for the database credentials.

#### Option B: Local Database (For development)

Create a local PostgreSQL database:

```bash
# Start PostgreSQL service
# macOS: brew services start postgresql@15
# Ubuntu: sudo systemctl start postgresql
# Windows: Start PostgreSQL service from Services

# Create database
createdb sui-task-indexer

# Or using psql:
psql -U postgres
CREATE DATABASE "sui-task-indexer";
\q
```

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env  # If .env.example exists
# OR create .env manually
```

Edit `.env` with your settings:

```env
# Database connection
DATABASE_URL="postgresql://username:password@localhost:5432/sui-task-indexer?schema=public"

# Sui contract details
PACKAGE_ID="0x39d1dfff0845ababac9dd640a0dadf9565b0ee6ef6a7de8a488facfc279032de"

# Network (testnet or mainnet)
NETWORK="testnet"

# Polling interval in milliseconds
POLLING_INTERVAL_MS="1000"
```

**Database URL Format:**
```
postgresql://[username]:[password]@[host]:[port]/[database]?schema=public
```

Examples:
- Local: `postgresql://postgres:postgres@localhost:5432/sui-task-indexer?schema=public`
- Remote: `postgresql://user:pass@db.example.com:5432/sui-task-indexer?schema=public`

### 5. Run Database Migrations

Apply the database schema:

```bash
npm run db:setup:dev
```

This will:
- Create all necessary tables (event tables + state tables)
- Apply all migrations
- Generate Prisma client types

**Important**: Only ONE person should run migrations on a shared database. Others can just run:
```bash
npm run build  # Generates Prisma client only
```

### 6. Backfill State Tables (First Time Only)

If the database already has events but empty state tables:

```bash
npm run backfill
```

This reconstructs the current state from all historical events.

**Skip this step if:**
- This is a fresh database with no events
- State tables are already populated

### 7. Verify Setup

Check that everything is working:

```bash
# View current state
npm run query:examples

# Should show:
# - Projects count
# - Tasks count
# - Members count
# etc.
```

### 8. Start the Indexer

```bash
npm run indexer
```

You should see:
```
> test-indexer@1.0.0 indexer
> npx ts-node indexer.ts

prisma:query SELECT "public"."cursor"...
Created ProjectCreated events and updated state
...
```

**Note**: If multiple people run the indexer pointing to the same database, only ONE instance should run at a time to avoid duplicate processing.

## Available Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm run build` | Generate Prisma client |
| `npm run db:setup:dev` | Run migrations (creates tables) |
| `npm run db:reset:dev` | Reset database (⚠️ deletes all data) |
| `npm run db:studio` | Open Prisma Studio (visual DB viewer) |
| `npm run indexer` | Start indexer (default speed) |
| `npm run indexer:fast` | Start indexer (1s polling) |
| `npm run indexer:slow` | Start indexer (10s polling) |
| `npm run backfill` | Populate state from events |
| `npm run query:examples` | Run example queries |

## Team Workflow

### Shared Database Setup

1. **Database Admin** (one person):
   ```bash
   npm run db:setup:dev  # Run migrations
   npm run backfill      # Populate state tables
   ```

2. **Other Team Members**:
   ```bash
   npm install
   npm run build         # Generate Prisma client
   npm run query:examples # Verify access
   ```

3. **Running Indexer**:
   - Only ONE instance should run
   - Either run on a dedicated server or coordinate who runs it
   - Use `npm run indexer` for production
   - Use `npm run indexer:fast` for development

### Individual Database Setup

Each team member:
```bash
npm install
npm run db:setup:dev
npm run indexer
```

## Troubleshooting

### Error: "command not found: npm"
- Install Node.js from [nodejs.org](https://nodejs.org/)
- Verify: `node --version`

### Error: "psql: command not found"
- Install PostgreSQL
- macOS: `brew install postgresql@15`
- Ubuntu: `sudo apt-get install postgresql`

### Error: "database does not exist"
- Create the database: `createdb sui-task-indexer`
- Or update DATABASE_URL to point to existing database

### Error: "password authentication failed"
- Check DATABASE_URL username and password
- For local PostgreSQL, default user is usually `postgres`
- Reset password if needed

### Error: "migration failed"
- Ensure DATABASE_URL is correct
- Check if you have write permissions on the database
- If shared database, coordinate with team to avoid conflicts

### Error: "SASL: client password must be a string"
- This is fixed in the latest version
- Ensure you pulled the latest code
- Run `npm install` again

### State tables are empty
- Run `npm run backfill` to populate from events
- This is normal if you just added state tables to existing indexer

### Indexer shows "Unknown event type"
- Verify PACKAGE_ID matches your deployed contract
- Check NETWORK is correct (testnet/mainnet)

### Multiple indexers running
- Only one indexer instance should run at a time
- Stop other instances before starting new one
- Use a process manager (PM2) for production

## Viewing the Database

### Using Prisma Studio (Recommended)

```bash
npm run db:studio
```

Opens a web UI at http://localhost:5555 where you can:
- View all tables
- Browse data
- Run queries
- Edit records

### Using psql

```bash
psql $DATABASE_URL

# View tables
\dt

# Query projects
SELECT * FROM "Project";

# Query tasks
SELECT * FROM "Task";

# Exit
\q
```

## Querying Data

### Example TypeScript Code

```typescript
import { prisma } from './db';

// Get all projects
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

// Get tasks for a specific user
const myTasks = await prisma.task.findMany({
  where: {
    assignee: '0x...'
  },
});

// Get project by ID
const project = await prisma.project.findUnique({
  where: { id: '0x...' },
  include: { members: true, tasks: true },
});
```

### Run Query Examples

```bash
npm run query:examples
```

See `query-examples.ts` for more examples.

## Production Deployment

### Using PM2 (Process Manager)

```bash
# Install PM2
npm install -g pm2

# Start indexer
pm2 start npm --name "sui-indexer" -- run indexer

# View logs
pm2 logs sui-indexer

# Stop
pm2 stop sui-indexer

# Restart
pm2 restart sui-indexer

# Auto-start on system reboot
pm2 startup
pm2 save
```

### Using Docker (Optional)

```dockerfile
FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

CMD ["npm", "run", "indexer"]
```

## Database Schema

### Event Tables (Audit Trail)
- `ProjectCreated`, `MemberAdded`, `MemberRemoved`
- `TaskAdded`, `DeleteTask`, `TaskNameUpdated`, etc.
- `SubtaskAdded`, `SubtaskUpdated`, `SubtaskDeleted`
- `AttachmentAdded`, `AttachmentRemoved`
- `UsernameRegistered`

### State Tables (Current State)
- `Project` - Current projects
- `Member` - Active members
- `Task` - Current tasks
- `Subtask` - Active subtasks
- `Attachment` - Active attachments

### System Tables
- `cursor` - Tracks indexing progress

See [STATE_TABLES.md](./STATE_TABLES.md) for detailed schema documentation.

## Support

- Check [README.md](./README.md) for general documentation
- Check [STATE_TABLES.md](./STATE_TABLES.md) for state table details
- Review Prisma docs: https://www.prisma.io/docs
- Ask team lead for database credentials

## Common Tasks Checklist

### First Time Setup
- [ ] Install Node.js 20.19.0+
- [ ] Install PostgreSQL
- [ ] Clone repository
- [ ] Run `npm install`
- [ ] Create `.env` file
- [ ] Run `npm run db:setup:dev` (or `npm run build` if DB exists)
- [ ] Run `npm run backfill` (if needed)
- [ ] Test with `npm run query:examples`

### Daily Development
- [ ] Pull latest changes: `git pull`
- [ ] Install new dependencies: `npm install`
- [ ] Generate Prisma client: `npm run build`
- [ ] Start indexer: `npm run indexer`

### After Schema Changes
- [ ] Pull latest changes
- [ ] Run migrations: `npm run db:setup:dev`
- [ ] Generate client: `npm run build`
- [ ] Restart indexer

## Security Notes

- **Never commit `.env` file** - It's in `.gitignore`
- **Keep database credentials secure**
- **Use different databases for dev/prod**
- **Restrict database access** to team members only

## Questions?

Contact your team lead or check the documentation:
- [README.md](./README.md) - General documentation
- [STATE_TABLES.md](./STATE_TABLES.md) - Database schema details
- Project repository issues
