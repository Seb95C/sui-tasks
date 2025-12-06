# Quick Start Guide

## For You (First Time Setup)

### 1. Review What's Ready
Your indexer is fully configured with:
- ✅ State tables for current object state
- ✅ Event tables for audit trail
- ✅ Backfill script for existing events
- ✅ REST API with state and event endpoints
- ✅ Documentation for your team

### 2. Add to Git

```bash
# Make sure you're in the indexer directory
cd sui-tasks/indexer/sui-task-indexer

# Add all files
git add .

# Commit
git commit -m "Add Sui task indexer with state tables and API

- Event indexing for projects, tasks, members, subtasks, attachments
- State tables for current object state
- REST API for querying data
- Backfill script for existing events
- Complete setup documentation"

# Push to your branch
git push origin indexer
```

### 3. Verify Nothing Sensitive is Committed

```bash
# Check that .env is NOT in git
git status | grep -E "\.env$"  # Should return nothing

# If you see .env, remove it immediately
git rm --cached .env
git commit -m "Remove .env file"
```

---

## For Your Colleagues

### Quick Setup (5 minutes)

```bash
# 1. Clone and install
git clone <repo-url>
cd sui-tasks/indexer/sui-task-indexer
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your database credentials

# 3. Setup database
npm run db:setup:dev

# 4. Backfill state (if needed)
npm run backfill

# 5. Start indexer
npm run indexer
```

### Run API Server

```bash
# Start API server
npm run api:dev

# Or run both API + indexer
npm run start:all
```

---

## Key Files

### Source Code (all committed)
- `indexer.ts` - Main entry point
- `server.ts` - REST API server
- `db.ts` - Database client
- `config.ts` - Configuration
- `handlers/` - Event handlers
- `prisma/schema.prisma` - Database schema

### Documentation (all committed)
- `README.md` - Main documentation
- `SETUP.md` - **Send this to your teammates**
- `STATE_TABLES.md` - Database schema details
- `API.md` - API documentation
- `GIT_SETUP.md` - Git commit instructions

### Scripts (all committed)
- `query-examples.ts` - Example queries
- `backfill-state.ts` - Backfill script

### Configuration (examples committed, actuals ignored)
- `.env.example` - Example environment (committed)
- `.env` - Your actual environment (IGNORED by git)
- `.gitignore` - Files to ignore

---

## Available Commands

| Command | What it does |
|---------|--------------|
| `npm install` | Install dependencies |
| `npm run build` | Generate Prisma client |
| `npm run db:setup:dev` | Run database migrations |
| `npm run backfill` | Populate state from events |
| `npm run indexer` | Start blockchain indexer |
| `npm run api:dev` | Start REST API server |
| `npm run start:all` | Run both API + indexer |
| `npm run query:examples` | Run example queries |
| `npm run db:studio` | Open database viewer |

---

## What Your Teammates Will See

After cloning, they'll have:

1. **Complete source code** - All TypeScript files
2. **Database schema** - Prisma schema and migrations
3. **Documentation** - Setup guides and API docs
4. **.env.example** - Template for configuration
5. **Scripts** - Backfill, query examples, etc.

They'll need to:
1. Install Node.js 20.19+
2. Install PostgreSQL
3. Copy `.env.example` to `.env` and configure it
4. Run migrations
5. Start the indexer

Everything is documented in `SETUP.md` - just point them there!

---

## API Endpoints

Once running, they can access:

### State (Current Data)
- `GET /api/projects` - All projects
- `GET /api/projects/:id` - Specific project
- `GET /api/tasks?assignee=0x...` - Tasks by assignee
- `GET /api/stats` - Statistics

### Events (History)
- `GET /api/events/project-created`
- `GET /api/events/task-added`
- `GET /api/events/member-added`
- etc.

Full API docs in `API.md`

---

## Architecture

```
Sui Blockchain
      ↓
   Indexer (indexer.ts)
      ↓
  ┌────┴────┐
  ↓         ↓
Events    State
Tables    Tables
  ↓         ↓
Audit    Current
Trail     State
           ↓
      REST API
      (server.ts)
           ↓
      Frontend
```

---

## Checklist Before Pushing

- [ ] `.env` is NOT committed
- [ ] `.env.example` has no real credentials
- [ ] All source files are added
- [ ] Migrations are committed
- [ ] Documentation is complete
- [ ] `.gitignore` is present

---

## Next Steps

1. **Push to git** (see top of this file)
2. **Share repo URL** with team
3. **Send teammates to SETUP.md**
4. **Decide on database strategy:**
   - Shared database (recommended)
   - Individual databases (for development)
5. **Coordinate indexer:** Only one instance should run

---

## Support Documentation

Direct your team to:
- **SETUP.md** - Complete setup instructions
- **API.md** - API documentation
- **STATE_TABLES.md** - Database schema
- **README.md** - General overview

Everything they need is documented!

---

## Test Before Sharing

```bash
# Test queries work
npm run query:examples

# Test API server
npm run api:dev
# Visit http://localhost:3000

# Test indexer
npm run indexer
# Should see: "Created ProjectCreated events and updated state"
```

All working? Great! Push to git and share with your team! 🚀

---

## Deploy to Production

Want a public URL? Deploy to Railway in 10 minutes:

**Quick Deploy:**
1. Push to GitHub
2. Go to [railway.app](https://railway.app)
3. Create project → Add PostgreSQL
4. Deploy from GitHub repo
5. Add environment variables
6. Generate public URL

**Detailed Guide:** See [DEPLOY_RAILWAY.md](./DEPLOY_RAILWAY.md)

Your API will be available at: `https://your-app.railway.app`

---

## What You Get After Deployment

✅ **Public API** - `https://your-app.railway.app`
✅ **PostgreSQL Database** - Managed by Railway
✅ **Auto-scaling** - Handles traffic automatically
✅ **Free tier** - $5/month credit
✅ **Auto-deploy** - Push to GitHub = automatic deploy

Access from anywhere:
```bash
curl https://your-app.railway.app/api/projects
curl https://your-app.railway.app/api/stats
```
