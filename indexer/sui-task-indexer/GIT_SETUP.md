# Git Setup Instructions

Follow these steps to add the indexer to your git repository.

## Files to Commit

### 1. Stage all indexer files

```bash
cd sui-tasks/indexer/sui-task-indexer
git add .
```

### 2. Review what will be committed

```bash
git status
```

You should see these important files:
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `prisma/schema.prisma` - Database schema
- `prisma/migrations/` - Database migrations
- `prisma.config.ts` - Prisma configuration
- `db.ts` - Database client
- `indexer.ts` - Main indexer entry point
- `indexer/event-indexer.ts` - Event processing logic
- `handlers/` - Event handlers
- `config.ts` - Configuration
- `sui-utils.ts` - Sui utilities
- `.env.example` - Example environment variables
- `.gitignore` - Files to ignore
- `README.md` - Main documentation
- `SETUP.md` - Team setup guide
- `STATE_TABLES.md` - State tables documentation
- `query-examples.ts` - Query examples
- `backfill-state.ts` - Backfill script

### 3. Verify .env is NOT included

```bash
git status | grep .env
```

You should ONLY see `.env.example`, NOT `.env`

The `.env` file contains sensitive credentials and should never be committed!

### 4. Clean up old test-indexer files (if present)

```bash
cd ..
git rm -r test-indexer/
```

### 5. Commit the changes

```bash
git add .
git commit -m "Add Sui task indexer with state tables

- Set up event indexing for project, task, and member events
- Add state tables for current object state
- Include backfill script for existing events
- Add comprehensive setup documentation for team"
```

### 6. Push to repository

```bash
git push origin indexer
```

Or if you're on main:
```bash
git push origin main
```

## What Your Teammates Will Do

After you push, your teammates will:

1. **Pull the repository**
   ```bash
   git clone <repository-url>
   cd sui-tasks/indexer/sui-task-indexer
   ```

2. **Follow SETUP.md**
   ```bash
   # Install dependencies
   npm install

   # Copy .env.example to .env and configure
   cp .env.example .env
   # Edit .env with their database credentials

   # Set up database
   npm run db:setup:dev

   # Start indexer
   npm run indexer
   ```

## Important Files Explained

### Committed Files (shared with team)
- **Source code** - All `.ts` files
- **Configuration** - `package.json`, `tsconfig.json`, `prisma.config.ts`
- **Database schema** - `prisma/schema.prisma`, `prisma/migrations/`
- **Documentation** - `README.md`, `SETUP.md`, `STATE_TABLES.md`
- **Examples** - `.env.example` (NOT `.env`)
- **Git ignore** - `.gitignore`

### Ignored Files (NOT committed)
- **Dependencies** - `node_modules/`
- **Environment** - `.env` (contains secrets!)
- **Generated** - `dist/`, Prisma generated client
- **Logs** - `*.log`

## Repository Structure

After committing, your repository should look like:

```
sui-tasks/
├── indexer/
│   └── sui-task-indexer/
│       ├── .gitignore
│       ├── .env.example
│       ├── package.json
│       ├── tsconfig.json
│       ├── README.md
│       ├── SETUP.md
│       ├── STATE_TABLES.md
│       ├── GIT_SETUP.md
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── migrations/
│       ├── handlers/
│       │   ├── project.ts
│       │   └── usernameRegistry.ts
│       ├── indexer/
│       │   └── event-indexer.ts
│       ├── config.ts
│       ├── db.ts
│       ├── indexer.ts
│       ├── sui-utils.ts
│       ├── query-examples.ts
│       └── backfill-state.ts
└── (other project files)
```

## Common Git Issues

### "I accidentally committed .env"

Remove it immediately:
```bash
git rm --cached .env
git commit -m "Remove .env file"
git push
```

Then rotate your database credentials!

### "node_modules/ is in git"

Remove it:
```bash
git rm -r --cached node_modules/
git commit -m "Remove node_modules"
git push
```

Ensure `.gitignore` includes `node_modules/`

### "My teammates can't run the app"

Check:
1. Did you commit all source files?
2. Is `.env.example` present?
3. Are migrations committed in `prisma/migrations/`?
4. Is `package.json` committed?
5. Did they follow `SETUP.md`?

## Security Checklist

Before pushing:
- [ ] `.env` is NOT committed
- [ ] `.gitignore` includes `.env`
- [ ] `.env.example` has placeholder values (no real credentials)
- [ ] No database passwords in any committed files
- [ ] `node_modules/` is ignored

## Next Steps

After pushing to git:
1. Share the repository URL with your team
2. Direct them to `SETUP.md` for setup instructions
3. Coordinate database access (shared vs individual databases)
4. Decide who will run the indexer (one instance recommended)

## Questions?

- Check [README.md](./README.md) for general info
- Check [SETUP.md](./SETUP.md) for setup instructions
- Check [STATE_TABLES.md](./STATE_TABLES.md) for database details
