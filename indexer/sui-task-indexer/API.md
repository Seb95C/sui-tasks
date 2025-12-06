# API Documentation

The indexer includes a REST API server for querying both current state and event history.

## Starting the API Server

```bash
npm run api:dev
```

The server runs on `http://localhost:3000` by default.

## State Endpoints (Current Data)

Query the current state of projects, tasks, and members.

### Get All Projects
```http
GET /api/projects
```

Returns all projects with their members and tasks.

**Response:**
```json
[
  {
    "id": "0x...",
    "name": "Project Name",
    "description": "Project description",
    "manager": "0x...",
    "created_at": "2025-12-06T...",
    "updated_at": "2025-12-06T...",
    "members": [...],
    "tasks": [...]
  }
]
```

### Get Specific Project
```http
GET /api/projects/:id
```

**Example:**
```bash
curl http://localhost:3000/api/projects/0x52ae78c551070f0c395b9e935c79ffb4df9713a28f5e8d4a1cc6dde0f55a13f6
```

### Get Project Members
```http
GET /api/projects/:id/members
```

Returns all members of a specific project.

### Get Project Tasks
```http
GET /api/projects/:id/tasks
```

Returns all tasks for a specific project.

### Get Tasks (with filters)
```http
GET /api/tasks?assignee=0x...&state=0&project_id=0x...
```

Query parameters:
- `assignee` (optional) - Filter by assignee address
- `state` (optional) - Filter by task state (0-4)
- `project_id` (optional) - Filter by project ID

**Examples:**
```bash
# Get all tasks assigned to an address
curl "http://localhost:3000/api/tasks?assignee=0x..."

# Get all open tasks (state=0)
curl "http://localhost:3000/api/tasks?state=0"

# Get tasks for a project
curl "http://localhost:3000/api/tasks?project_id=0x..."
```

### Get Specific Task
```http
GET /api/tasks/:id
```

### Get Statistics
```http
GET /api/stats
```

Returns counts of all entities.

**Response:**
```json
{
  "projects": 2,
  "members": 5,
  "tasks": 10,
  "subtasks": 3,
  "attachments": 2,
  "events": {
    "projectCreated": 2,
    "taskAdded": 10,
    "memberAdded": 5
  }
}
```

## Event Endpoints (Audit Trail)

Query historical events.

### Project Events
- `GET /api/events/project-created` - All ProjectCreated events
- `GET /api/events/member-added` - All MemberAdded events
- `GET /api/events/member-removed` - All MemberRemoved events

### Task Events
- `GET /api/events/task-added` - All TaskAdded events
- `GET /api/events/task-deleted` - All DeleteTask events
- `GET /api/events/task-updated` - All task update events (name, description, assignee, state, due date)

### Subtask Events
- `GET /api/events/subtask-added`
- `GET /api/events/subtask-updated`
- `GET /api/events/subtask-deleted`

### Attachment Events
- `GET /api/events/attachment-added`
- `GET /api/events/attachment-removed`

### Username Events
- `GET /api/events/username-registered`

## Utility Endpoints

### Health Check
```http
GET /health
```

Returns server health status.

### API Documentation
```http
GET /
```

Returns list of all available endpoints.

## Example Usage

### JavaScript/TypeScript
```typescript
// Get all projects
const response = await fetch('http://localhost:3000/api/projects');
const projects = await response.json();

// Get tasks for a user
const userTasks = await fetch(
  `http://localhost:3000/api/tasks?assignee=${userAddress}`
);
const tasks = await userTasks.json();

// Get project stats
const statsResponse = await fetch('http://localhost:3000/api/stats');
const stats = await statsResponse.json();
```

### cURL
```bash
# Get all projects
curl http://localhost:3000/api/projects

# Get tasks by state
curl "http://localhost:3000/api/tasks?state=0"

# Get stats
curl http://localhost:3000/api/stats

# Get events
curl http://localhost:3000/api/events/project-created
```

## CORS

The API has CORS enabled, so you can call it from any frontend application.

## Error Responses

All endpoints return appropriate HTTP status codes:
- `200` - Success
- `404` - Resource not found
- `500` - Server error

Error response format:
```json
{
  "error": "Error message here"
}
```

## Running API and Indexer Together

To run both the API server and indexer simultaneously:

```bash
npm run start:all
```

This runs:
- API server on port 3000
- Indexer in the background

Or run them separately in different terminals:

```bash
# Terminal 1: API Server
npm run api:dev

# Terminal 2: Indexer
npm run indexer
```

## Environment Variables

Configure the port in `.env`:

```env
PORT=3000
```

## Production Deployment

For production, use a process manager like PM2:

```bash
# Start API server
pm2 start npm --name "sui-api" -- run api:dev

# Start indexer
pm2 start npm --name "sui-indexer" -- run indexer

# View logs
pm2 logs

# Monitor
pm2 monit
```
