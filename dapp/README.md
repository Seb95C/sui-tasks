# Jira Web3 - Decentralized Project Management

A production-ready Web3 Jira-like application built with Next.js, React, Tailwind CSS, and the Sui blockchain.

## Features

- **Blockchain-Powered**: Projects and tickets stored on Sui blockchain for transparency and immutability
- **Wallet Integration**: Connect with Sui Wallet to perform on-chain transactions
- **Off-Chain Indexer**: Fast data queries from PostgreSQL/GraphQL indexer
- **Kanban Board**: Interactive drag-and-drop board for ticket management
- **Permission System**: Role-based access control (Admin, Member)
- **Responsive Design**: Modern UI with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Blockchain**: Sui (@mysten/sui.js, @mysten/wallet-kit)
- **Drag & Drop**: react-dnd
- **State Management**: React Context API
- **TypeScript**: Full type safety
- **HTTP Client**: Axios

## Project Structure

```
jira-ui/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Landing page
│   ├── projects/
│   │   ├── page.tsx            # Projects list
│   │   └── [id]/
│   │       ├── page.tsx        # Project dashboard
│   │       └── board/
│   │           └── page.tsx    # Kanban board
│   └── globals.css             # Global styles
├── components/                  # React components
│   ├── layout/                 # Layout components
│   ├── wallet/                 # Wallet connection
│   ├── projects/               # Project-related components
│   ├── tickets/                # Ticket & Kanban components
│   └── ui/                     # Base UI components
├── contexts/                    # React contexts for state
│   ├── WalletContext.tsx       # Wallet state management
│   ├── ProjectContext.tsx      # Projects state & actions
│   └── TicketContext.tsx       # Tickets state & actions
├── lib/                        # Utilities and helpers
│   ├── api/                    # Indexer API clients
│   ├── sui/                    # Sui blockchain integration
│   └── utils/                  # Helper functions
└── types/                      # TypeScript type definitions
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Sui Wallet browser extension
- Deployed Sui Move smart contracts (Package ID)
- Running off-chain indexer API

### Installation

1. **Install dependencies**:

```bash
npm install
```

2. **Configure environment variables**:

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_PACKAGE_ID=0xYOUR_PACKAGE_ID
NEXT_PUBLIC_INDEXER_API_URL=http://localhost:3001/api
```

3. **Run the development server**:

```bash
npm run dev
```

4. **Open the app**:

Navigate to [http://localhost:3000](http://localhost:3000)

## Configuration

### Sui Blockchain

Update `lib/sui/constants.ts` with your smart contract configuration:

- `PACKAGE_ID`: Your deployed Move package ID
- `MODULES`: Module names in your Move contracts
- `FUNCTIONS`: Function names for blockchain calls

### Indexer API

The app expects the following API endpoints:

**Projects**:
- `GET /projects?userAddress={address}` - Get user's projects
- `GET /projects/{id}` - Get project details
- `GET /projects/{id}/stats` - Get project statistics
- `GET /projects/{id}/members` - Get project members
- `POST /projects/sync` - Sync new project from blockchain

**Tickets**:
- `GET /tickets?projectId={id}` - Get project tickets
- `GET /tickets/{id}` - Get ticket details
- `POST /tickets/sync` - Sync new ticket from blockchain

Update `lib/api/indexer.ts` if your API structure differs.

## Usage Guide

### 1. Connect Wallet

Click "Connect Wallet" in the header to connect your Sui wallet.

### 2. Create a Project

1. Navigate to "Projects" page
2. Click "Create Project"
3. Fill in project name and description
4. Sign the blockchain transaction
5. Wait for confirmation and indexer sync

### 3. View Project Dashboard

1. Click on a project card
2. View project stats, members, and quick actions
3. Click "View Board" to access the Kanban board

### 4. Create Tickets

1. On the project dashboard or board page, click "Create Ticket"
2. Fill in ticket details (title, description, priority, assignee)
3. Sign the blockchain transaction
4. Ticket appears in the "To Do" column

### 5. Manage Tickets on Kanban Board

1. **View Tickets**: See tickets organized by status (To Do, In Progress, Done)
2. **Drag & Drop**: Drag tickets between columns to update status
3. **Click Ticket**: View/edit full ticket details
4. **Edit**: Admins, creators, and assignees can edit tickets

### 6. Permissions

- **Admin**: Can add members, edit all tickets, manage project
- **Member**: Can create and edit own tickets

## Key Components

### State Management

**WalletContext** (`contexts/WalletContext.tsx`):
- Manages Sui wallet connection state
- Provides `connect()`, `disconnect()`, `signAndExecuteTransactionBlock()`

**ProjectContext** (`contexts/ProjectContext.tsx`):
- Manages projects state
- Actions: `loadUserProjects()`, `createProject()`, `addMember()`

**TicketContext** (`contexts/TicketContext.tsx`):
- Manages tickets state
- Actions: `createTicket()`, `updateTicket()`, `updateTicketStatus()`

### Blockchain Integration

**Transaction Builders** (`lib/sui/transactions.ts`):
- `buildCreateProjectTransaction()` - Create project on-chain
- `buildCreateTicketTransaction()` - Create ticket on-chain
- `buildUpdateTicketStatusTransaction()` - Update ticket status
- All functions return `TransactionBlock` ready to sign and execute

**Example Transaction Flow**:

```typescript
// 1. Build transaction
const tx = buildCreateProjectTransaction({ name, description });

// 2. Sign and execute
const result = await signAndExecuteTransactionBlock({
  transactionBlock: tx,
  options: { showEffects: true, showObjectChanges: true }
});

// 3. Extract created object ID
const objectId = result.effects?.created[0].reference.objectId;

// 4. Sync to indexer for fast queries
await syncProjectToIndexer(objectId);
```

### API Integration

**Fetching Data**:

```typescript
import { fetchUserProjects } from '@/lib/api/projects';

const projects = await fetchUserProjects(userAddress);
```

**Indexer Client** (`lib/api/indexer.ts`):
- Configured Axios client with interceptors
- Automatic error handling
- Authentication headers (if needed)

## Customization

### Styling

- **Colors**: Edit `tailwind.config.ts` to change the color scheme
- **Animations**: Custom animations defined in `tailwind.config.ts`
- **Global Styles**: Modify `app/globals.css`

### Components

All UI components accept standard props and can be customized:

```typescript
<Button variant="primary" size="lg" loading={isLoading}>
  Click Me
</Button>
```

### Permissions

Customize permission logic in `lib/utils/permissions.ts`:

```typescript
export function canEditTicket(ticket, userAddress, members) {
  // Add custom permission logic
  return isAdmin || isCreator || isAssignee;
}
```

## Move Smart Contract Integration

Your Move contracts should expose these functions:

**Project Module**:
```move
public entry fun create_project(name: String, description: String, ctx: &mut TxContext)
public entry fun update_project(project: &mut Project, name: String, description: String)
public entry fun add_member(project: &mut Project, member: address, role: u8)
```

**Ticket Module**:
```move
public entry fun create_ticket(
    project: &Project,
    title: String,
    description: String,
    priority: u8,
    ctx: &mut TxContext
)
public entry fun update_ticket_status(ticket: &mut Ticket, status: u8)
```

Update `lib/sui/transactions.ts` to match your actual Move function signatures.

## Build for Production

```bash
npm run build
npm start
```

## Troubleshooting

### Wallet Connection Issues
- Ensure Sui Wallet extension is installed and unlocked
- Check that you're on the correct network (testnet/mainnet)
- Clear browser cache and reconnect

### Transaction Failures
- Verify `NEXT_PUBLIC_PACKAGE_ID` is correct
- Check function names match your Move contracts
- Ensure wallet has sufficient SUI for gas fees

### Indexer Sync Issues
- Verify indexer API is running and accessible
- Check API endpoint configuration
- Monitor indexer logs for sync errors

## Next Steps

1. **Add Member Management**: Implement full add/remove member functionality
2. **Comments**: Add comment system for tickets
3. **Notifications**: Real-time updates using WebSockets
4. **Search & Filter**: Advanced search and filtering for tickets
5. **Analytics**: Project and team performance dashboards
6. **Mobile App**: React Native version using same blockchain logic

## License

MIT

## Support

For questions or issues, please open an issue on GitHub or contact the development team.
