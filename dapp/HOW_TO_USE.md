# 🎯 How to Use - Quick Guide

## 📋 Table of Contents
1. [Adding Members to Projects](#adding-members-to-projects)
2. [Creating Projects with Initial Team](#creating-projects-with-initial-team)
3. [Assigning Tickets to Team Members](#assigning-tickets-to-team-members)
4. [Managing Tickets](#managing-tickets)

---

## 1. Adding Members to Projects

### Method A: Add Members During Project Creation ✨ NEW!

1. **Click "Create Project"** button on projects page
2. **Fill in project details**:
   - Project Name (e.g., "My DeFi App")
   - Description (e.g., "Building a DeFi protocol")
3. **Add team members** (optional):
   - Click "+ Add Member" button
   - Enter Sui wallet address
   - Select role (Admin/Member)
   - Can add multiple members!
4. **Click "Create Project"**
5. Project created with team ready! 🎉

**Sample addresses to try:**
```
Bob:     0xabcdef1234567890abcdef1234567890abcdef12
Charlie: 0x9876543210fedcba9876543210fedcba98765432
```

### Method B: Add Members After Project Creation

1. **Go to project dashboard**:
   - Navigate to `/projects`
   - Click any project card
2. **Scroll to "Team Members" section**
3. **Click "Add Member" button** (top right)
4. **Fill in details**:
   - Sui Address: `0x...`
   - Role: Choose Admin/Member
5. **Click "Add Member"**
6. See new member appear instantly! ✅

---

## 2. Creating Projects with Initial Team

### Full Walkthrough:

```
Step 1: Projects Page
├─ Click "Create Project" button

Step 2: Create Project Modal Opens
├─ Enter "Project Name": My NFT Marketplace
├─ Enter "Description": A platform for trading NFTs
├─ Click "+ Add Member"
│  ├─ Address: 0xabcdef1234567890abcdef1234567890abcdef12
│  └─ Role: Admin
├─ Click "+ Add Member" again
│  ├─ Address: 0x9876543210fedcba9876543210fedcba98765432
│  └─ Role: Member
└─ Click "Create Project"

Step 3: Project Created!
├─ New project appears in list
├─ Bob is Admin
├─ Charlie is Member
└─ You can start creating tickets!
```

### Benefits:
✅ One-time setup
✅ Team is ready from day 1
✅ No need to add members later
✅ Can assign tickets immediately

---

## 3. Assigning Tickets to Team Members

### Option A: Assign When Creating a Ticket

1. **Go to project dashboard or Kanban board**
2. **Click "Create Ticket"**
3. **Fill in ticket details**:
   - Title: "Implement smart contract"
   - Description: "Create the NFT minting contract"
   - Priority: High/Medium/Low/Urgent
   - **Assignee**: Select from dropdown ⬅️ This is key!
     - Shows all project members
     - Or leave "Unassigned"
4. **Click "Create Ticket"**
5. Ticket appears with assignee badge! 👤

### Option B: Assign/Reassign Later

1. **On Kanban board**: Click any ticket card
2. **Ticket detail modal opens**
3. **Click "Edit Ticket"** button
4. **Change assignee**: Select from dropdown
5. **Click "Save Changes"**
6. Assignee updated! ✅

### Who Can See Assigned Tickets?

- **On Kanban board**: Each ticket shows assignee avatar/name at bottom
- **In ticket details**: Shows full assignee info with role
- **Filter by assignee**: Can see all tickets assigned to each member

---

## 4. Managing Tickets

### Creating Tickets

**From Project Dashboard:**
```
1. Click "Create Ticket" button
2. Fill form (title, description, priority, assignee)
3. Submit
4. Ticket appears in TODO column on Kanban board
```

**From Kanban Board:**
```
1. Click "Create Ticket" button (top right)
2. Same form as above
3. Ticket appears in TODO column instantly
```

### Editing Tickets

**Quick Status Update (Drag & Drop):**
```
1. Go to Kanban board
2. Drag ticket card between columns
3. Status updates automatically!
   - TODO → IN_PROGRESS → DONE
```

**Full Edit:**
```
1. Click ticket card on Kanban board
2. Modal opens with all details
3. Click "Edit Ticket"
4. Update any field:
   - Title
   - Description
   - Status (TODO/IN_PROGRESS/DONE)
   - Priority (LOW/MEDIUM/HIGH/URGENT)
   - Assignee (select from team members)
5. Click "Save Changes"
```

### Viewing Tickets

**Kanban View:**
- Visual columns by status
- Drag and drop to change status
- See assignee at bottom of each card
- Color-coded by priority

**Detail View:**
- Click any ticket card
- Full description
- Created by / Assigned to
- Timestamps
- All metadata

---

## 🎯 Complete Workflow Example

### Scenario: Building an NFT Marketplace

**1. Create Project with Team:**
```
Project: NFT Marketplace
Description: Platform for trading digital art
Members:
  - You (Admin)
  - Bob (Admin) - 0xabcdef1234567890abcdef1234567890abcdef12
  - Charlie (Member) - 0x9876543210fedcba9876543210fedcba98765432
```

**2. Create Tickets with Assignments:**
```
Ticket 1: "Design NFT contract"
  - Priority: HIGH
  - Assign to: Bob
  - Status: TODO

Ticket 2: "Build frontend UI"
  - Priority: MEDIUM
  - Assign to: Charlie
  - Status: TODO

Ticket 3: "Write tests"
  - Priority: MEDIUM
  - Assign to: You
  - Status: TODO
```

**3. Work on Tickets:**
```
- Bob drags "Design NFT contract" to IN_PROGRESS
- Charlie opens "Build frontend UI" and changes status to IN_PROGRESS
- You complete tests and drag to DONE ✅
```

**4. Add More Members:**
```
- Bob needs help, so you add:
  - Diana (Member) - 0x2222222222222222222222222222222222222222
- Assign her to help Bob on the contract
```

---

## 🎮 Interactive Demo Flow

### Try This Right Now:

1. **Go to** http://localhost:3001/projects
2. **Click "Create Project"**
3. **Enter**:
   - Name: "Test Project"
   - Description: "Testing member management"
4. **Click "+ Add Member"**
5. **Paste**: `0xabcdef1234567890abcdef1234567890abcdef12`
6. **Select role**: Member
7. **Click "Create Project"**
8. **Project created!**
9. **Click the project** to open dashboard
10. **See Bob listed** in Team Members section!
11. **Click "Create Ticket"**
12. **See Bob in assignee dropdown** 🎉
13. **Assign ticket to Bob**
14. **Go to Board** and see ticket with Bob's name!

---

## 📝 Key Features

### ✅ Member Management
- Add during project creation
- Add anytime from dashboard
- Assign roles (Admin/Member)
- See member list with roles
- Color-coded role badges

### ✅ Ticket Assignment
- Assign when creating tickets
- Reassign anytime by editing
- See assignee on Kanban cards
- Dropdown shows all team members
- Unassigned option available

### ✅ Permission System (Simulated)
- **Admin**: Can do everything
- **Member**: Can create/edit own tickets

### ✅ Real-time Updates
- Members appear instantly
- Tickets update on drag
- No page refresh needed
- Console logs confirm actions

---

## 💡 Pro Tips

1. **Add members during creation** to save time
2. **Use sample addresses** for testing (Bob, Charlie)
3. **Assign tickets immediately** so team knows what to work on
4. **Color coding**: Priority badges help identify urgent work
5. **Drag & drop**: Fastest way to update ticket status
6. **Click tickets**: View full details and history
7. **Check console**: See simulation logs for debugging

---

## 🚀 Next Steps

When you're ready for production blockchain:

1. **Deploy Move contracts** to Sui network
2. **Set up indexer** to track events
3. **Uncomment blockchain code** in contexts
4. **Add wallet authentication** checks
5. **Members become on-chain** via smart contracts
6. **Assignments recorded** on blockchain

All the UI is ready - just flip the switch! 🎯

---

**Need help? Check `SIMULATION_MODE.md` for more details!**
