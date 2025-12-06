# Deployment Guide

Deploy your indexer and API to the cloud for public access.

## Option 1: Railway (Recommended)

Railway is perfect for this stack - easy setup, PostgreSQL support, and free tier.

### Prerequisites

- Railway account ([railway.app](https://railway.app))
- GitHub account (to connect your repo)

### Step 1: Prepare for Deployment

1. **Add a Procfile** (tells Railway what to run)

Already created - see `Procfile` in the project root.

2. **Ensure PORT is configurable**

Already done in `server.ts` - uses `process.env.PORT`

3. **Push your code to GitHub**

```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### Step 2: Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your `sui-tasks` repository

### Step 3: Add PostgreSQL Database

1. In your Railway project, click "+ New"
2. Select "Database" → "PostgreSQL"
3. Railway will create a PostgreSQL database
4. Click on the database → "Variables" to see the connection URL

### Step 4: Configure the Indexer Service

1. In Railway, click "+ New" → "GitHub Repo"
2. Select your repository
3. Configure the service:
   - **Root Directory**: `indexer/sui-task-indexer`
   - **Build Command**: `npm run build`
   - **Start Command**: See Procfile

4. Add environment variables:
   - Click on your service → "Variables"
   - Add these variables:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
PACKAGE_ID=0x39d1dfff0845ababac9dd640a0dadf9565b0ee6ef6a7de8a488facfc279032de
NETWORK=testnet
POLLING_INTERVAL_MS=1000
NODE_ENV=production
```

**Important**: Use `${{Postgres.DATABASE_URL}}` - Railway will auto-reference the database!

### Step 5: Run Migrations

Railway will automatically run migrations on deploy (see Procfile).

If you need to run them manually:
1. Go to your service → "Settings" → "Deploy"
2. Or use Railway CLI:

```bash
railway run npm run db:setup:dev
```

### Step 6: Backfill State Tables

After first deployment:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run backfill
railway run npm run backfill
```

### Step 7: Deploy!

1. Railway will automatically deploy when you push to GitHub
2. Get your public URL:
   - Click on your service
   - Go to "Settings" → "Networking" → "Generate Domain"
3. Your API will be available at: `https://your-app.railway.app`

### Step 8: Test Your Deployment

```bash
# Test API
curl https://your-app.railway.app/health
curl https://your-app.railway.app/api/stats
curl https://your-app.railway.app/api/projects

# Should return your data!
```

### Step 9: Set Up Both Services

Railway supports multiple processes in one deployment using the Procfile:

**Option A: Single Deployment (Both Services)**
- Uses the provided `Procfile`
- Runs both indexer and API in one container
- Simpler but indexer and API share resources

**Option B: Separate Deployments (Recommended for Production)**
- Create two separate services in Railway
- One for indexer, one for API
- Better resource isolation

For separate deployments:

1. **Indexer Service**:
   - Start Command: `npm run indexer`
   - No need for public URL

2. **API Service**:
   - Start Command: `npm run start`
   - Enable public URL
   - This is what your frontend connects to

---

## Option 2: Render

Free tier with PostgreSQL and Node.js support.

### Quick Setup

1. Go to [render.com](https://render.com)
2. Sign up and connect GitHub
3. Create a **PostgreSQL database**
4. Create a **Web Service**:
   - Repository: Your repo
   - Root Directory: `indexer/sui-task-indexer`
   - Build Command: `npm install && npm run build && npm run db:setup:dev`
   - Start Command: `npm run start:all`
5. Add environment variables (link to PostgreSQL)
6. Deploy!

---

## Option 3: Vercel (API) + Supabase (Database)

Good for serverless API, but indexer needs to run separately.

### Database (Supabase)

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your PostgreSQL connection string
4. Run migrations locally:
   ```bash
   DATABASE_URL="your-supabase-url" npm run db:setup:dev
   ```

### API (Vercel)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Create `vercel.json`:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "server.ts",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "server.ts"
       }
     ]
   }
   ```

3. Deploy:
   ```bash
   vercel --prod
   ```

**Note**: Indexer must run separately (Railway, VPS, etc.)

---

## Option 4: DigitalOcean App Platform

1. Go to [digitalocean.com](https://digitalocean.com/products/app-platform)
2. Create an app from GitHub
3. Add PostgreSQL database
4. Configure build and run commands
5. Deploy

---

## Post-Deployment Checklist

### For All Platforms

- [ ] Database is created and accessible
- [ ] Migrations ran successfully
- [ ] State tables are backfilled
- [ ] Environment variables are set
- [ ] Public URL is generated
- [ ] API endpoints work (test `/health`)
- [ ] Indexer is running (check logs)
- [ ] Database has data (test `/api/stats`)

### Test Your API

```bash
export API_URL="https://your-app.railway.app"

# Health check
curl $API_URL/health

# Get stats
curl $API_URL/api/stats

# Get projects
curl $API_URL/api/projects

# Get tasks
curl "$API_URL/api/tasks?state=0"
```

### Monitor Your Deployment

Railway:
- View logs: Railway dashboard → your service → "Deployments"
- View metrics: "Metrics" tab
- Database: Click PostgreSQL service

Render:
- View logs: Service dashboard
- Shell access: "Shell" tab

---

## Environment Variables Reference

Required variables for deployment:

```env
# Database (provided by platform or Supabase)
DATABASE_URL=postgresql://user:pass@host:5432/db

# Sui contract
PACKAGE_ID=0x39d1dfff0845ababac9dd640a0dadf9565b0ee6ef6a7de8a488facfc279032de

# Network
NETWORK=testnet

# Polling
POLLING_INTERVAL_MS=1000

# Environment
NODE_ENV=production

# Port (usually set by platform)
PORT=3000
```

---

## Troubleshooting

### "Migration failed"
- Check DATABASE_URL is correct
- Ensure PostgreSQL service is running
- Check logs for specific error

### "Cannot connect to database"
- Verify DATABASE_URL format
- Check if database service is in same project
- Try Railway's reference format: `${{Postgres.DATABASE_URL}}`

### "Indexer not processing events"
- Check PACKAGE_ID is correct
- Check NETWORK matches your contract
- View logs to see if events are being fetched

### "API returns 500 errors"
- Check database connection
- Run migrations: `railway run npm run db:setup:dev`
- Check logs for specific errors

### "Out of memory"
- Reduce POLLING_INTERVAL_MS (e.g., 5000)
- Upgrade Railway plan
- Split indexer and API into separate services

---

## Scaling Considerations

### Free Tier Limits

**Railway** (Free):
- $5 credit/month
- Good for development
- ~500 hours/month

**Render** (Free):
- 750 hours/month
- Spins down after inactivity
- Good for demos

**Supabase** (Free):
- 500MB database
- Good for small projects

### Production Recommendations

1. **Use separate services**:
   - Database (PostgreSQL)
   - Indexer (background process)
   - API (public endpoints)

2. **Enable monitoring**:
   - Railway metrics
   - Error tracking (Sentry)
   - Uptime monitoring (UptimeRobot)

3. **Set up alerts**:
   - Database size
   - API errors
   - Indexer lag

4. **Optimize**:
   - Add database indexes
   - Cache frequent queries
   - Rate limiting on API

---

## Cost Estimates

### Railway
- Free: $5/month credit
- Hobby: $5/month + usage
- Pro: $20/month + usage

### Render
- Free: $0
- Starter: $7/month per service
- Standard: $25/month per service

### DigitalOcean
- Basic: $5/month
- Professional: $12/month

---

## Next Steps

1. Choose a platform (Railway recommended)
2. Follow the setup steps above
3. Deploy and test
4. Share the public URL with your team
5. Update your frontend to use the API

---

## Support

- Railway: [docs.railway.app](https://docs.railway.app)
- Render: [render.com/docs](https://render.com/docs)
- Supabase: [supabase.com/docs](https://supabase.com/docs)

Need help? Check the logs first - they usually show the exact issue!
