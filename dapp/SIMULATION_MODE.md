# 🎮 Simulation Mode - Try the App Without Blockchain!

The app is now running in **SIMULATION MODE** - you can explore all features without needing:
- ❌ Sui Wallet
- ❌ Blockchain connection
- ❌ Indexer API
- ❌ Move smart contracts

All blockchain transactions are **commented out** and replaced with mock data, so you can test the full UI/UX!

## What You Can Do

### ✅ View Projects
- See 3 pre-loaded sample projects:
  - **DeFi Protocol** - 8 tickets, 3 members
  - **NFT Marketplace** - 5 tickets, 2 members
  - **Web3 Social Network** - 0 tickets, 1 member

### ✅ View Project Dashboard
- Click any project card
- See project stats (TODO, IN_PROGRESS, DONE counts)
- View team members with roles (Admin, Member)
- See member avatars and join dates

### ✅ Kanban Board - Drag & Drop!
- Click "View Board" from any project
- **Drag tickets** between columns (TODO → IN_PROGRESS → DONE)
- See instant visual feedback
- Changes persist in browser session

### ✅ Ticket Management
- **View ticket details** - Click any ticket card
- **Create new tickets** - Click "Create Ticket" button
- **Edit tickets** - Update title, description, priority, assignee
- **Update status** - Drag between Kanban columns

### ✅ Create Projects
- Click "Create Project" on projects page
- Fill in name and description
- See your new project appear instantly

## Where's the Mock Data?

All sample data is in: **`lib/mock/data.ts`**

It includes:
- 3 Users (Alice, Bob, Charlie)
- 3 Projects with realistic details
- 13 Tickets across projects with various statuses
- Project members with different roles
- Realistic timestamps and relationships

## Blockchain Transactions (Commented Out)

All blockchain code is **preserved but commented** in these files:

### `contexts/ProjectContext.tsx`
```typescript
// Lines 125-164: Create project transaction (commented)
// Lines 207-233: Add member transaction (commented)
```

### `contexts/TicketContext.tsx`
```typescript
// Lines 113-147: Create ticket transaction (commented)
// Lines 193-225: Update ticket transaction (commented)
// Lines 280-314: Update status transaction (commented)
```

### Transaction Builders (Ready to Use!)
The transaction building code in **`lib/sui/transactions.ts`** is **NOT commented** - it's ready to use when you:
1. Deploy your Move smart contracts
2. Set up the indexer
3. Uncomment the transaction code in contexts

## How to Switch to Real Blockchain

When you're ready to use real blockchain:

### 1. Deploy Smart Contracts
Deploy your Move contracts to Sui and get the Package ID.

### 2. Set Up Indexer
Create an indexer that:
- Listens to blockchain events
- Stores data in PostgreSQL
- Exposes REST API at configured endpoints

### 3. Update Environment
```bash
# .env.local
NEXT_PUBLIC_PACKAGE_ID=0xYOUR_REAL_PACKAGE_ID
NEXT_PUBLIC_INDEXER_API_URL=https://your-indexer.com/api
NEXT_PUBLIC_SUI_NETWORK=testnet
```

### 4. Uncomment Blockchain Code

**In `contexts/ProjectContext.tsx`:**
- Remove `/* ... */` around lines 125-164 (createProject)
- Remove `/* ... */` around lines 207-233 (addMember)
- Delete or comment simulation mode sections

**In `contexts/TicketContext.tsx`:**
- Remove `/* ... */` around lines 113-147 (createTicket)
- Remove `/* ... */` around lines 193-225 (updateTicket)
- Remove `/* ... */` around lines 280-314 (updateTicketStatus)
- Delete or comment simulation mode sections

**In pages:**
- Uncomment wallet authentication checks
- Uncomment wallet-dependent useEffect hooks

### 5. Test with Real Wallet
- Install Sui Wallet extension
- Connect wallet
- Sign transactions
- Verify indexer syncs data

## Console Logging

In simulation mode, you'll see console logs like:
```
✅ Project created (simulation): {...}
✅ Ticket created (simulation): {...}
✅ Ticket status updated (simulation): {...}
✅ Member added (simulation): {...}
```

These confirm actions are working (in simulation).

## Exploring the UI

### Recommended Flow:

1. **Start app**: `npm run dev`
2. **Go to** [http://localhost:3000](http://localhost:3000)
3. **Click "Projects"** in header (no wallet needed!)
4. **Browse projects** - see the 3 sample projects
5. **Click "DeFi Protocol"** - view dashboard
6. **Check stats** - see ticket counts by status
7. **View members** - see Alice (Admin), Bob (Member), Charlie (Member)
8. **Click "View Board"** - access Kanban
9. **Drag tickets** - move between columns
10. **Click a ticket** - view/edit details
11. **Create ticket** - test the creation flow
12. **Go back** - navigate between pages

### Test Ticket Editing:
- Click any ticket in the Kanban board
- Modal opens with all details
- Click "Edit Ticket" button
- Change title, description, priority, or assignee
- Click "Save Changes"
- See updates reflected immediately

### Test Creating:
- Click "Create Project" → Fill form → See new project
- Click "Create Ticket" → Fill form → See new ticket in TODO column

## Limitations in Simulation Mode

⚠️ **Data doesn't persist** between browser refreshes
⚠️ **No real blockchain verification**
⚠️ **All users share same data** (no real authentication)
⚠️ **Permissions are simulated** (not enforced on-chain)

## Benefits of Simulation Mode

✅ **Test UI/UX** without infrastructure
✅ **Demo the app** to stakeholders
✅ **Develop frontend** while backend is being built
✅ **Understand data flow** before connecting blockchain
✅ **No gas fees** for testing!

## Need Help?

Check the code comments in:
- `contexts/ProjectContext.tsx` - Project operations
- `contexts/TicketContext.tsx` - Ticket operations
- `lib/mock/data.ts` - Sample data structure

All blockchain transaction code is preserved and ready to use when you're ready!

---

**Enjoy exploring the app! When ready for production, follow the steps above to enable real blockchain integration.** 🚀
