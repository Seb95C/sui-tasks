# Deploy to Railway - Step by Step

Quick guide to deploy your indexer to Railway and get a public URL.

> **📦 Monorepo Setup?** Your indexer is part of the `sui-tasks` monorepo. See [DEPLOY_MONOREPO.md](./DEPLOY_MONOREPO.md) for specific instructions.

## Prerequisites

- GitHub account
- Railway account (free) - [Sign up here](https://railway.app)

## Step 1: Push to GitHub

```bash
cd sui-tasks/indexer/sui-task-indexer

# Add deployment files
git add Procfile railway.json render.yaml DEPLOYMENT.md

# Commit
git commit -m "Add deployment configuration"

# Push
git push origin main  # or your branch name
```

## Step 2: Create Railway Project

1. Go to https://railway.app
2. Click **"Login"** → Sign in with GitHub
3. Click **"New Project"**
4. Select **"Provision PostgreSQL"** first

![Railway New Project](https://railway.app/new)

## Step 3: Add PostgreSQL Database

1. Railway creates the database automatically
2. Click on the **Postgres** service
3. Go to **"Variables"** tab
4. Copy the `DATABASE_URL` (you'll need this)

## Step 4: Deploy Your App

1. In the same project, click **"+ New"**
2. Select **"GitHub Repo"**
3. Authorize Railway to access your repos
4. Select your `sui-tasks` repository
5. Railway will detect it's a Node.js app

## Step 5: Configure Service

1. Click on your deployed service
2. Go to **"Settings"**
3. **IMPORTANT for monorepo**: Set **Root Directory**:
   - If deploying from `sui-tasks` repo: `indexer/sui-task-indexer`
   - If standalone repo: leave empty or `.`
4. Build/Start Commands: Automatic (from Procfile)

3. Go to **"Variables"** tab and add:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
PACKAGE_ID=0x39d1dfff0845ababac9dd640a0dadf9565b0ee6ef6a7de8a488facfc279032de
NETWORK=testnet
POLLING_INTERVAL_MS=1000
NODE_ENV=production
```

**Important**: Use `${{Postgres.DATABASE_URL}}` exactly as shown - Railway will auto-link it!

## Step 6: Generate Public URL

1. Still in your service, go to **"Settings"**
2. Scroll to **"Networking"**
3. Click **"Generate Domain"**
4. You'll get a URL like: `https://your-app.railway.app`

## Step 7: Wait for Deployment

1. Go to **"Deployments"** tab
2. Watch the build logs
3. Wait for "Build successful" and "Deployment successful"

The deployment process:
- ✅ Installs dependencies
- ✅ Runs database migrations
- ✅ Generates Prisma client
- ✅ Starts indexer + API server

## Step 8: Backfill State Tables

After first deployment, backfill existing events:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link
# Select your project and service

# Run backfill
railway run npm run backfill
```

## Step 9: Test Your Deployment

```bash
# Replace with your Railway URL
export API_URL="https://your-app.railway.app"

# Test health
curl $API_URL/health

# Test stats
curl $API_URL/api/stats

# Test projects
curl $API_URL/api/projects
```

You should see your data!

## Step 10: Share with Team

Send your team:
```
API is live at: https://your-app.railway.app

Available endpoints:
- GET /api/projects - All projects
- GET /api/tasks - All tasks
- GET /api/stats - Statistics
- GET /health - Health check

Full docs: https://your-app.railway.app/
```

---

## Troubleshooting

### Build Failed

**Error**: "Cannot find module"
- **Fix**: Check `package.json` has all dependencies
- **Fix**: Ensure root directory is set correctly

**Error**: "Migration failed"
- **Fix**: Check `DATABASE_URL` variable
- **Fix**: Ensure Postgres service is running

### Runtime Errors

**Error**: "Cannot connect to database"
- **Fix**: Check `DATABASE_URL` format: `${{Postgres.DATABASE_URL}}`
- **Fix**: Ensure Postgres and app are in same project

**Error**: "Port already in use"
- **Fix**: Railway sets `PORT` automatically, don't hardcode it

### Indexer Not Running

**Check logs**:
1. Go to your service
2. Click "Deployments"
3. Click latest deployment
4. View logs

Look for:
- ✅ "Server running on port..."
- ✅ "Created ProjectCreated events..."

---

## View Logs

1. Go to your service in Railway
2. Click **"Deployments"**
3. Click on the latest deployment
4. See real-time logs

You should see:
```
🚀 Server running on http://localhost:3000
📊 API documentation: http://localhost:3000/
❤️  Health check: http://localhost:3000/health
Created ProjectCreated events and updated state
```

---

## Managing Your Deployment

### View Database

1. Click on **Postgres** service
2. Go to **"Data"** tab
3. Query your data directly

Or use Prisma Studio locally:
```bash
railway run npm run db:studio
```

### Restart Service

1. Go to your service
2. Click **"Settings"**
3. Click **"Restart"**

### View Metrics

1. Go to your service
2. Click **"Metrics"** tab
3. See CPU, Memory, Network usage

### Redeploy

Push to GitHub and Railway auto-deploys:
```bash
git push origin main
```

Manual redeploy:
1. Go to **"Deployments"**
2. Click **"Deploy"** on any previous deployment

---

## Environment Variables

To update environment variables:

1. Go to your service → **"Variables"**
2. Edit or add variables
3. Changes trigger automatic redeploy

**Never commit** actual values to git - use Railway variables!

---

## Cost

**Free Tier**: $5 credit/month
- Good for ~500 hours
- Perfect for development
- Includes PostgreSQL

**Hobby**: $5/month
- $5 credit included
- Pay for usage above that

**Pro**: $20/month
- Priority support
- More resources

---

## Monitoring

### Set Up Uptime Monitoring

Use [UptimeRobot](https://uptimerobot.com) (free):

1. Create account
2. Add monitor: `https://your-app.railway.app/health`
3. Get alerts if API goes down

### Error Tracking

Add Sentry (optional):
```bash
npm install @sentry/node
```

Configure in `server.ts`

---

## Production Checklist

- [ ] Database is created
- [ ] Migrations ran successfully
- [ ] Backfill completed
- [ ] Public URL generated
- [ ] Health check works
- [ ] API returns data
- [ ] Indexer processing events
- [ ] Logs show no errors
- [ ] Team has API URL
- [ ] Monitoring set up (optional)

---

## What Your Team Sees

After deployment, your colleagues can:

```bash
# Get all projects
curl https://your-app.railway.app/api/projects

# Get tasks for a user
curl https://your-app.railway.app/api/tasks?assignee=0x...

# Get statistics
curl https://your-app.railway.app/api/stats
```

No setup needed - just use the API! 🎉

---

## Advanced: Separate Services

For better resource isolation:

### 1. Deploy Indexer
- Service name: "sui-indexer"
- Start command: `npm run indexer`
- No public URL needed

### 2. Deploy API
- Service name: "sui-api"
- Start command: `npm run start`
- Generate public URL
- This is what frontend uses

Both connect to same Postgres database.

---

## Next Steps

1. ✅ Deploy to Railway (done!)
2. ✅ Get public URL (done!)
3. ✅ Test API (done!)
4. → Update your frontend to use the API
5. → Share URL with team
6. → Add to documentation

Your API is now live and accessible from anywhere! 🚀
