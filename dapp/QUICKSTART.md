# Quick Start Guide

## Installation Complete! ✅

Your Web3 Jira application has been successfully set up with all dependencies installed and built.

## What's Ready

- ✅ Next.js 14.2 with App Router
- ✅ Sui blockchain integration with latest `@mysten/dapp-kit`
- ✅ TypeScript with full type safety
- ✅ Tailwind CSS styling
- ✅ Drag-and-drop Kanban board (react-dnd)
- ✅ All components and pages
- ✅ State management with React Context
- ✅ API integration layer

## Next Steps to Run the App

### 1. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add:
```env
NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_PACKAGE_ID=0xYOUR_DEPLOYED_PACKAGE_ID_HERE
NEXT_PUBLIC_INDEXER_API_URL=http://localhost:3001/api
```

### 2. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Install Sui Wallet

- Install [Sui Wallet](https://chrome.google.com/webstore/detail/sui-wallet) browser extension
- Create or import a wallet
- Get testnet SUI from the [faucet](https://discord.com/channels/916379725201563759/971488439931392130)

## Application Flow

### First Time User

1. **Land on Home Page** → Click "Connect Wallet"
2. **Approve Connection** in Sui Wallet popup
3. **Navigate to Projects** → Click "Create Project"
4. **Fill Project Details** → Sign blockchain transaction
5. **Wait for Sync** → Project appears in list

### Working with Projects

1. **Click Project Card** → View dashboard with stats
2. **View Board** → Access drag-and-drop Kanban board
3. **Create Ticket** → Fill form and sign transaction
4. **Drag Tickets** → Move between TODO, IN_PROGRESS, DONE columns
5. **Click Ticket** → View/edit details (if you have permission)

## Key Files to Customize

### Smart Contract Integration

**`lib/sui/constants.ts`** - Update with your contract details:
```typescript
export const PACKAGE_ID = '0xYOUR_PACKAGE_ID';
export const MODULES = {
  PROJECT: 'your_project_module_name',
  TICKET: 'your_ticket_module_name',
  MEMBERSHIP: 'your_membership_module_name',
};
```

**`lib/sui/transactions.ts`** - Adjust function arguments to match your Move contract:
```typescript
tx.moveCall({
  target: `${PACKAGE_ID}::${MODULE}::${FUNCTION}`,
  arguments: [
    // Match your Move function signature
  ],
});
```

### API Endpoints

**`lib/api/indexer.ts`** - Update base URL if needed
**`lib/api/projects.ts`** - Customize API endpoints
**`lib/api/tickets.ts`** - Customize API endpoints

### Styling

**`tailwind.config.ts`** - Customize colors, fonts, etc.
**`app/globals.css`** - Add global styles

## Troubleshooting

### Wallet Won't Connect

- Ensure Sui Wallet extension is installed and unlocked
- Check you're on the correct network (testnet/mainnet)
- Refresh the page and try again

### Transaction Fails

- Verify `PACKAGE_ID` is correct in `.env.local`
- Check wallet has sufficient SUI for gas
- Ensure function names match your Move contracts
- Check browser console for detailed error messages

### Data Not Loading

- Verify indexer API is running at the configured URL
- Check browser network tab for API errors
- Ensure indexer has synced blockchain data

### Build Errors

If you encounter build errors after modifications:
```bash
# Clean install
rm -rf node_modules .next
npm install
npm run build
```

## Production Deployment

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Add environment variables in Vercel dashboard:
- `NEXT_PUBLIC_SUI_NETWORK`
- `NEXT_PUBLIC_PACKAGE_ID`
- `NEXT_PUBLIC_INDEXER_API_URL`

## Architecture Overview

```
┌─────────────────┐
│   Next.js App   │ ← User Interface (Browser)
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────┐ ┌──────────────┐
│ Sui RPC │ │ Indexer API  │
│ Network │ │ (PostgreSQL) │
└────┬────┘ └──────┬───────┘
     │             │
     │   Listens   │
     │   Events    │
     │◄────────────┘
     │
┌────┴─────────────┐
│ Sui Blockchain   │
│ (Move Contracts) │
└──────────────────┘
```

## Features Implemented

✅ **Wallet Integration**: Connect/disconnect Sui wallet
✅ **Project Management**: Create, view, list projects
✅ **Ticket System**: Create, edit, update tickets
✅ **Kanban Board**: Drag-and-drop interface
✅ **Permissions**: Role-based access control
✅ **Real-time UI**: Optimistic updates
✅ **Responsive Design**: Works on mobile/tablet/desktop
✅ **Error Handling**: User-friendly error messages
✅ **Loading States**: Smooth UX with loaders

## Need Help?

1. Check the [README.md](./README.md) for detailed documentation
2. Review code comments - every file is well-documented
3. Check the browser console for error details
4. Verify your Move smart contracts are deployed correctly

## Success Checklist

- [ ] Environment variables configured
- [ ] Sui Wallet installed and funded
- [ ] Move contracts deployed to Sui network
- [ ] Indexer API running and accessible
- [ ] Package ID updated in env
- [ ] Dev server running (`npm run dev`)
- [ ] Wallet connected successfully
- [ ] Created first project
- [ ] Created first ticket
- [ ] Tested drag-and-drop

Happy building! 🚀
