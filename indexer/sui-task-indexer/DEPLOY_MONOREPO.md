# Deploy Indexer from Monorepo

Your indexer is part of the larger `sui-tasks` monorepo. This guide shows how to deploy just the indexer.

## Your Project Structure

```
sui-tasks/                  ← Git repository (deployed to Railway)
├── contract/              (Move contracts)
├── dapp/                  (Frontend)
└── indexer/
    └── sui-task-indexer/  ← This is what we're deploying
```

---

## Option 1: Deploy to Railway (Recommended)

### Step 1: Push Your Code to GitHub

```bash
# From the sui-tasks root
cd ~/projects/sui-tasks

# Add all indexer files
git add indexer/sui-task-indexer

# Commit
git commit -m "Add indexer with state tables and API"

# Push
git push origin main  # or your branch name
```

### Step 2: Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click **"New Project"**
4. Select **"Provision PostgreSQL"**
   - Railway creates a PostgreSQL database
   - Click on it to see connection details

### Step 3: Deploy Indexer Service

1. In the same Railway project, click **"+ New"**
2. Select **"GitHub Repo"**
3. Choose your `sui-tasks` repository
4. Railway will detect it's a Node.js app

### Step 4: Configure the Service

**Important**: Set the root directory to point to your indexer!

1. Click on your deployed service
2. Go to **"Settings"**
3. Scroll to **"Service"** section
4. Set **Root Directory**: `indexer/sui-task-indexer`

   ![Root Directory](https://i.imgur.com/example.png)

5. Build/Start commands are automatic (from Procfile)

### Step 5: Add Environment Variables

1. Go to **"Variables"** tab
2. Add these variables:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
PACKAGE_ID=0x39d1dfff0845ababac9dd640a0dadf9565b0ee6ef6a7de8a488facfc279032de
NETWORK=testnet
POLLING_INTERVAL_MS=1000
NODE_ENV=production
```

**Important**:
- Use `${{Postgres.DATABASE_URL}}` exactly - Railway auto-links it
- The service name might be different, check your Postgres service name

### Step 6: Generate Public URL

1. Still in your service, go to **"Settings"**
2. Scroll to **"Networking"** section
3. Click **"Generate Domain"**
4. Get URL like: `https://sui-task-indexer.up.railway.app`

### Step 7: Deploy!

Railway will automatically:
- ✅ Install dependencies (from `package.json`)
- ✅ Run database migrations (from `Procfile`)
- ✅ Build the project
- ✅ Start indexer + API server

Watch the deployment:
1. Go to **"Deployments"** tab
2. Click on the running deployment
3. See real-time logs

### Step 8: Backfill State Tables

After first successful deployment:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link
# Select: sui-tasks project
# Select: your indexer service

# Run backfill
railway run npm run backfill
```

### Step 9: Test Your Deployment

```bash
# Use your Railway URL
API_URL="https://your-app.up.railway.app"

# Health check
curl $API_URL/health

# Get stats
curl $API_URL/api/stats

# Get projects
curl $API_URL/api/projects
```

---

## Railway Configuration for Monorepo

Your `railway.json` is already configured correctly:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "npm run start:all",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

Railway will:
1. Clone entire `sui-tasks` repo
2. Change to `indexer/sui-task-indexer/` (root directory)
3. Run build commands
4. Start the service

---

## Option 2: Deploy Multiple Services

You can deploy all parts of your monorepo separately:

### Service 1: Indexer (this guide)
- Root: `indexer/sui-task-indexer`
- Public: No URL needed (unless you want API access)
- Runs: Blockchain indexer

### Service 2: API (separate from indexer)
- Root: `indexer/sui-task-indexer`
- Start: `npm run start` (API only)
- Public: Generate domain (for frontend)

### Service 3: Frontend (if deploying)
- Root: `dapp`
- Public: Generate domain
- Env: Add API URL

### Shared: PostgreSQL Database
- All services connect to same database
- Use `${{Postgres.DATABASE_URL}}` in each service

---

## Folder Structure After Deployment

Railway sees:
```
sui-task-indexer/          ← Railway starts here (root directory)
├── package.json
├── Procfile
├── railway.json
├── prisma/
├── handlers/
└── ... (all indexer files)
```

Railway doesn't see:
- `contract/` (not in root directory)
- `dapp/` (not in root directory)

---

## Troubleshooting

### "Module not found" error

**Issue**: Railway can't find `indexer/sui-task-indexer`

**Fix**:
1. Go to service → Settings
2. Check **Root Directory** = `indexer/sui-task-indexer`
3. Redeploy

### "Cannot connect to database"

**Issue**: Wrong DATABASE_URL format

**Fix**:
1. Go to Variables tab
2. Check: `DATABASE_URL=${{Postgres.DATABASE_URL}}`
3. If Postgres service has different name, adjust: `${{YourPostgresName.DATABASE_URL}}`

### "Build failed: package.json not found"

**Issue**: Root directory is wrong

**Fix**: Set root to `indexer/sui-task-indexer` (NOT just `indexer`)

### "Migration failed"

**Check**:
1. Is Postgres service running?
2. Is Postgres in same project?
3. Is `DATABASE_URL` variable set correctly?

**Fix**: Check Postgres service logs for errors

---

## View Logs

**Railway Logs**:
1. Go to your service
2. Click **"Deployments"**
3. Click active deployment
4. See real-time logs

**What to look for**:
```
✅ npm install complete
✅ Prisma generate complete
✅ Migrations applied
✅ Server running on port...
✅ Created ProjectCreated events...
```

---

## Update Deployment

### Automatic (Recommended)

Push to GitHub = auto-deploy:
```bash
cd ~/projects/sui-tasks
git add indexer/sui-task-indexer
git commit -m "Update indexer"
git push origin main
```

Railway auto-deploys on push!

### Manual

1. Go to Railway → Deployments
2. Click **"Deploy"** on any previous build
3. Or click **"Redeploy"** on current build

---

## Environment for Each Service

If deploying multiple services (indexer, API, frontend):

### Indexer Service
```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
PACKAGE_ID=0x...
NETWORK=testnet
POLLING_INTERVAL_MS=1000
NODE_ENV=production
```

### API Service
```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
NODE_ENV=production
PORT=3000
```

### Frontend Service
```env
NEXT_PUBLIC_API_URL=${{ApiService.RAILWAY_PUBLIC_DOMAIN}}
NEXT_PUBLIC_PACKAGE_ID=0x...
```

---

## Cost Optimization

**Single Service** (Indexer + API together):
- ~$3-5/month
- Good for development
- Simple setup

**Separate Services** (Indexer, API separate):
- ~$5-10/month
- Better for production
- Can scale independently

**Shared Database**:
- ~$5/month
- One database for all services

---

## Production Checklist

- [ ] Code pushed to GitHub
- [ ] Railway project created
- [ ] Postgres database provisioned
- [ ] Service deployed with correct root directory
- [ ] Environment variables configured
- [ ] Public URL generated (if needed)
- [ ] Migrations ran successfully
- [ ] State tables backfilled
- [ ] API tested and working
- [ ] Logs show no errors

---

## Share with Your Team

After deployment:

### For Backend/Indexer Team:
```
Indexer is deployed on Railway!

Repository: sui-tasks
Service: Indexer
Root: indexer/sui-task-indexer

To deploy updates:
1. Push to main branch
2. Railway auto-deploys
3. Check logs in Railway dashboard
```

### For Frontend Team:
```
API is live!

URL: https://your-app.up.railway.app

Endpoints:
- GET /api/projects
- GET /api/tasks?assignee=0x...
- GET /api/stats

Docs: https://your-app.up.railway.app/
```

---

## Next Steps

1. ✅ Deploy indexer to Railway
2. ✅ Get public API URL
3. → Update `dapp/.env` with API URL
4. → Deploy frontend (optional)
5. → Share URLs with team

---

## Additional Resources

- [Railway Docs](https://docs.railway.app)
- [Monorepo Guide](https://docs.railway.app/deploy/monorepo)
- [Environment Variables](https://docs.railway.app/develop/variables)

Your indexer is part of a larger project - Railway handles this perfectly with the root directory setting! 🚀
