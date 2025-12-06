# Jira Engine Smart Contract Tests

This document explains the Jest tests created for the jira_engine smart contract package located at `/home/contzo/[01]-Personal/Sui_bootcamp/bootcamp_heckaton`.

## Test Files Created

1. **`src/helpers/jiraEngineHelpers.ts`** - Helper functions to interact with the jira_engine smart contract
2. **`src/tests/jiraEngine.test.ts`** - Comprehensive Jest test suite

## Test Coverage

### 1. Username Registration Tests (`Jira Engine - Username Registration`)

Tests the `username_registry` module functionality:

- **Register new username successfully** - Validates that a user can register a unique username
- **Emit UsernameRegistered event** - Checks that the registration emits proper events
- **Fail on duplicate username** - Ensures usernames are unique
- **Fail on too short username** - Validates minimum username length (3 characters)
- **Fail on too long username** - Validates maximum username length (20 characters)

### 2. Project Creation Tests (`Jira Engine - Project Creation`)

Tests the `project` module's project creation functionality:

- **Create new project successfully** - Validates project creation with all required fields
- **Emit ProjectCreated event** - Checks event emission with correct data (id, manager, name, description, manager_cap_id)
- **Create shared Project object** - Validates that project is created as a shared object
- **Fail when unregistered user creates project** - Ensures only registered users can create projects

### 3. Adding Members Tests (`Jira Engine - Adding Members`)

Tests adding members to projects:

- **Add new member successfully** - Validates adding a registered user as a project member
- **Emit MemberAdded event** - Checks event emission with correct data (project_id, member_address, display_name, joined_at, added_by)
- **Add multiple members** - Ensures multiple members can be added to a project
- **Fail on duplicate member** - Prevents adding the same member twice

### 4. Adding Tasks Tests (`Jira Engine - Adding Tasks`)

Tests task creation and assignment:

- **Add new task successfully** - Validates task creation with name, description, assignee, state, and due date
- **Emit TaskAdded event** - Checks event emission with complete task data
- **Add multiple tasks** - Ensures multiple tasks can be created in a project
- **Fail when assigning to non-member** - Validates that tasks can only be assigned to project members

## Setup Instructions

### 1. Deploy the Smart Contract

First, deploy the jira_engine smart contract from the bootcamp_heckaton directory:

```bash
cd /home/contzo/[01]-Personal/Sui_bootcamp/bootcamp_heckaton
sui client publish --gas-budget 100000000
```

### 2. Configure Environment Variables

After deployment, update your `.env` file in the `ts` directory with the deployment information:

```bash
cd /home/contzo/[01]-Personal/Sui_bootcamp/ts
```

Add the following to your `.env` file:

```env
# Network configuration
SUI_NETWORK=https://rpc.testnet.sui.io:443
RECIPIENT_ADDRESS=0xYourAddress

# Multiple funded test accounts (each needs gas for transactions)
USER_SECRET_KEY1=YourManagerSecretKey     # Project manager
USER_SECRET_KEY2=YourMember1SecretKey     # Member 1
USER_SECRET_KEY3=YourMember2SecretKey     # Member 2
USER_SECRET_KEY4=YourUnregisteredKey      # For negative tests

# From the deployment transaction
JIRA_ENGINE_PACKAGE_ID=0xYourPackageId
REGISTRY_OBJECT_ID=0xYourRegistryObjectId
```

**How to find these values:**

- **USER_SECRET_KEYx**: Generate multiple keypairs and fund them with testnet SUI:
  ```bash
  # Generate a new keypair and get its address
  sui client new-address ed25519
  # Request testnet tokens from faucet for each address
  ```
- **JIRA_ENGINE_PACKAGE_ID**: Found in the deployment transaction as "Created Package"
- **REGISTRY_OBJECT_ID**: The object ID of the `UsernameRegistry` shared object created during deployment

### 3. Run the Tests

```bash
cd /home/contzo/[01]-Personal/Sui_bootcamp/ts
npm test jiraEngine.test.ts
```

Or to run in watch mode:

```bash
npm run test:watch jiraEngine.test.ts
```

## Test Architecture

### Helper Functions

The `jiraEngineHelpers.ts` file provides clean abstractions for interacting with the smart contract:

1. **`registerUsername()`** - Register a new username in the registry
2. **`createProject()`** - Create a new project (requires registered user)
3. **`addMember()`** - Add a member to a project (requires manager capability)
4. **`addTask()`** - Add a task to a project (requires manager capability)

All helpers return the full `SuiTransactionBlockResponse` with:
- Transaction effects
- Emitted events
- Object changes

### Test Structure

Each test suite follows this pattern:

1. **Setup** - Uses `beforeAll()` to prepare test data (register users, create projects)
2. **Success Tests** - Validate happy path scenarios
3. **Event Tests** - Verify correct events are emitted with proper data
4. **Failure Tests** - Ensure proper error handling and validation

### Test Data

Tests use multiple funded accounts from environment variables:
- **USER_SECRET_KEY1**: Project manager/creator
- **USER_SECRET_KEY2**: Member 1 (added to projects, assigned tasks)
- **USER_SECRET_KEY3**: Member 2 (added to projects)
- **USER_SECRET_KEY4**: Unregistered user (for negative tests)

This multi-account approach ensures:
- All accounts have sufficient gas for transactions
- Realistic testing of multi-user scenarios
- Proper validation of permissions and authorization
- Testing of member addition and task assignment across different users

## Important Notes

1. **Tests are skipped if not configured** - If `JIRA_ENGINE_PACKAGE_ID` or `REGISTRY_OBJECT_ID` are not set, tests will be skipped with a warning message

2. **Clock Object** - Tests use the Sui Clock shared object at address `0x6` for timestamps

3. **Transaction Timeout** - Tests have a 5-minute timeout (configured in `jest.config.ts`)

4. **State Values** - Tasks use numeric state values:
   - `0` = TODO
   - `1` = IN_PROGRESS
   - `2` = DONE (adjust based on your contract's state enum)

## Future Test Additions

The following functionalities are not yet tested (as requested):

- ❌ Closing a project
- ❌ Updating task properties
- ❌ Adding/managing subtasks
- ❌ Adding/removing attachments
- ❌ Removing members
- ❌ Member-initiated operations (member_create_task, etc.)

You can add these tests later by following the same patterns used in the existing test suites.

## Troubleshooting

### "Transaction failed" errors
- Ensure all test accounts (`USER_SECRET_KEY1` through `USER_SECRET_KEY4`) have sufficient SUI for gas fees
- Check that `REGISTRY_OBJECT_ID` and `JIRA_ENGINE_PACKAGE_ID` are correct
- Verify you're connected to the correct network (testnet/devnet/mainnet)
- Fund accounts using the testnet faucet if needed

### "Already registered" errors
- The UsernameRegistry is a shared object, so usernames persist between test runs
- On subsequent test runs, usernames may already be taken
- Solutions:
  - Use different keypairs for each test run
  - Redeploy the contract for fresh tests
  - Modify the test to use unique usernames

### "Member already exists" errors
- The manager is automatically added as a member when creating a project
- Each address can only be added once to a project
- Ensure you're using different addresses for different members

### "Not authorized" errors
- Verify that the manager capability ID is correctly extracted from events
- Ensure you're using `USER_SECRET_KEY1` (manager) for manager-only operations
- Check that member operations are using the correct member secret keys

### "Insufficient gas" errors
- Each test account needs at least 0.1 SUI for gas
- Request testnet tokens from the faucet for each account
- Check account balances: `sui client gas --address <ADDRESS>`

## Example Test Output

```
 PASS  src/tests/jiraEngine.test.ts (60.234 s)
  Jira Engine - Username Registration
    ✓ should register a new username successfully (2341 ms)
    ✓ should emit UsernameRegistered event (15 ms)
    ✓ should fail when registering duplicate username (1892 ms)
    ✓ should fail when username is too short (1654 ms)
    ✓ should fail when username is too long (1723 ms)
  Jira Engine - Project Creation
    ✓ should create a new project successfully (3124 ms)
    ✓ should emit ProjectCreated event with correct data (12 ms)
    ✓ should create a shared Project object (8 ms)
    ✓ should fail when unregistered user tries to create project (1834 ms)
  Jira Engine - Adding Members
    ✓ should add a new member to the project successfully (2987 ms)
    ✓ should emit MemberAdded event with correct data (11 ms)
    ✓ should add multiple members successfully (2764 ms)
    ✓ should fail when adding duplicate member (1923 ms)
  Jira Engine - Adding Tasks
    ✓ should add a new task successfully (3234 ms)
    ✓ should emit TaskAdded event with correct data (14 ms)
    ✓ should add multiple tasks successfully (5124 ms)
    ✓ should fail when assigning task to non-member (1987 ms)

Test Suites: 1 passed, 1 total
Tests:       17 passed, 17 total
```
