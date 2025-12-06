import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { SuiTransactionBlockResponse } from "@mysten/sui/client";
import {
  registerUsername,
  createProject,
  addMember,
  addTask,
} from "../helpers/jiraEngineHelpers";
import { getAddress } from "../helpers/getAddress";
import { ENV } from "../env";

// These values need to be set after deploying the jira_engine package
// You can get them from the deployment transaction
const PACKAGE_ID = process.env.JIRA_ENGINE_PACKAGE_ID || "";
const REGISTRY_OBJECT_ID = process.env.REGISTRY_OBJECT_ID || "";
const CLOCK_OBJECT_ID = "0x6"; // Sui Clock object (constant address)

// Validate required environment variables
if (
  !ENV.USER_SECRET_KEY1 ||
  !ENV.USER_SECRET_KEY2 ||
  !ENV.USER_SECRET_KEY3 ||
  !ENV.USER_SECRET_KEY4
) {
  console.warn(
    "Warning: USER_SECRET_KEY1-4 not all set. Some tests may be skipped.",
  );
}

// Use multiple funded accounts from environment
// Each account has gas for transactions
const managerSecretKey = ENV.USER_SECRET_KEY1 || "";
const managerAddress = managerSecretKey
  ? getAddress({ secretKey: managerSecretKey })
  : "";

const member1SecretKey = ENV.USER_SECRET_KEY2 || "";
const member1Address = member1SecretKey
  ? getAddress({ secretKey: member1SecretKey })
  : "";

const member2SecretKey = ENV.USER_SECRET_KEY3 || "";
const member2Address = member2SecretKey
  ? getAddress({ secretKey: member2SecretKey })
  : "";

describe("Jira Engine - Username Registration", () => {
  let registrationTx: SuiTransactionBlockResponse;

  beforeAll(async () => {
    // Skip if package not deployed
    if (!PACKAGE_ID || !REGISTRY_OBJECT_ID) {
      console.warn(
        "Skipping tests - JIRA_ENGINE_PACKAGE_ID or REGISTRY_OBJECT_ID not set",
      );
      return;
    }
  });

  test("should register a new username successfully", async () => {
    if (!PACKAGE_ID || !REGISTRY_OBJECT_ID) {
      return;
    }

    registrationTx = await registerUsername({
      registryObjectId: REGISTRY_OBJECT_ID,
      username: "testuser_manager",
      senderSecretKey: managerSecretKey,
      packageId: PACKAGE_ID,
    });

    expect(registrationTx.effects).toBeDefined();
    expect(registrationTx.effects!.status.status).toBe("success");
  });

  test("should emit UsernameRegistered event", async () => {
    if (!PACKAGE_ID || !REGISTRY_OBJECT_ID) {
      return;
    }

    expect(registrationTx.events).toBeDefined();
    expect(registrationTx.events!.length).toBeGreaterThan(0);

    const usernameRegisteredEvent = registrationTx.events!.find((event) =>
      event.type.includes("UsernameRegistered"),
    );

    expect(usernameRegisteredEvent).toBeDefined();
    expect(usernameRegisteredEvent?.parsedJson).toHaveProperty("username");
    expect(usernameRegisteredEvent?.parsedJson).toHaveProperty("user_address");
  });

  test("should fail when registering duplicate username", async () => {
    if (!PACKAGE_ID || !REGISTRY_OBJECT_ID) {
      return;
    }

    // Try to register the same username with a different account
    await expect(
      registerUsername({
        registryObjectId: REGISTRY_OBJECT_ID,
        username: "testuser_manager",
        senderSecretKey: member1SecretKey,
        packageId: PACKAGE_ID,
      }),
    ).rejects.toThrow();
  });

  test("should register additional users successfully", async () => {
    if (!PACKAGE_ID || !REGISTRY_OBJECT_ID) {
      return;
    }

    // Register member1
    const member1Tx = await registerUsername({
      registryObjectId: REGISTRY_OBJECT_ID,
      username: "testuser_member1",
      senderSecretKey: member1SecretKey,
      packageId: PACKAGE_ID,
    });

    expect(member1Tx.effects).toBeDefined();
    expect(member1Tx.effects!.status.status).toBe("success");

    // Register member2
    const member2Tx = await registerUsername({
      registryObjectId: REGISTRY_OBJECT_ID,
      username: "testuser_member2",
      senderSecretKey: member2SecretKey,
      packageId: PACKAGE_ID,
    });

    expect(member2Tx.effects).toBeDefined();
    expect(member2Tx.effects!.status.status).toBe("success");
  });
});

describe("Jira Engine - Project Creation", () => {
  let projectCreationTx: SuiTransactionBlockResponse;
  let projectId: string;

  beforeAll(async () => {
    if (!PACKAGE_ID || !REGISTRY_OBJECT_ID) {
      return;
    }

    // Manager should already be registered from previous test suite
    // Members should also be registered
  });

  test("should create a new project successfully", async () => {
    if (!PACKAGE_ID || !REGISTRY_OBJECT_ID) {
      return;
    }

    projectCreationTx = await createProject({
      registryObjectId: REGISTRY_OBJECT_ID,
      name: "Test Project",
      description: "A test project for Jest testing",
      managerDisplayName: "Project Manager",
      clockObjectId: CLOCK_OBJECT_ID,
      senderSecretKey: managerSecretKey,
      packageId: PACKAGE_ID,
    });

    expect(projectCreationTx.effects).toBeDefined();
    expect(projectCreationTx.effects!.status.status).toBe("success");
  });

  test("should emit ProjectCreated event with correct data", async () => {
    if (!PACKAGE_ID || !REGISTRY_OBJECT_ID) {
      return;
    }

    expect(projectCreationTx.events).toBeDefined();
    expect(projectCreationTx.events!.length).toBeGreaterThan(0);

    const projectCreatedEvent = projectCreationTx.events!.find((event) =>
      event.type.includes("ProjectCreated"),
    );

    expect(projectCreatedEvent).toBeDefined();
    expect(projectCreatedEvent?.parsedJson).toHaveProperty("id");
    expect(projectCreatedEvent?.parsedJson).toHaveProperty("manager");
    expect(projectCreatedEvent?.parsedJson).toHaveProperty("name");
    expect(projectCreatedEvent?.parsedJson).toHaveProperty("description");
    expect(projectCreatedEvent?.parsedJson).toHaveProperty("manager_cap_id");

    // Store project ID for later tests
    projectId = (projectCreatedEvent?.parsedJson as any).id;
  });

  test("should create a shared Project object", async () => {
    if (!PACKAGE_ID || !REGISTRY_OBJECT_ID) {
      return;
    }

    expect(projectCreationTx.objectChanges).toBeDefined();

    const sharedObjects = projectCreationTx.objectChanges!.filter(
      (change) =>
        change.type === "created" &&
        (change as any).objectType?.includes("project::Project"),
    );

    expect(sharedObjects.length).toBeGreaterThan(0);
  });

  test("should fail when unregistered user tries to create project", async () => {
    if (!PACKAGE_ID || !REGISTRY_OBJECT_ID || !ENV.USER_SECRET_KEY4) {
      console.log("Skipping: USER_SECRET_KEY4 not set");
      return;
    }

    // Use USER_SECRET_KEY4 which is not registered
    const unregisteredKey = ENV.USER_SECRET_KEY4;

    await expect(
      createProject({
        registryObjectId: REGISTRY_OBJECT_ID,
        name: "Unauthorized Project",
        description: "Should fail",
        managerDisplayName: "Unauthorized User",
        clockObjectId: CLOCK_OBJECT_ID,
        senderSecretKey: unregisteredKey,
        packageId: PACKAGE_ID,
      }),
    ).rejects.toThrow();
  });
});

describe("Jira Engine - Adding Members", () => {
  let projectId: string;
  let managerCapId: string;
  let addMemberTx: SuiTransactionBlockResponse;

  beforeAll(async () => {
    if (!PACKAGE_ID || !REGISTRY_OBJECT_ID) {
      return;
    }

    // All users should be registered from the username registration tests
    // Manager creates the project
    const projectTx = await createProject({
      registryObjectId: REGISTRY_OBJECT_ID,
      name: "Team Project",
      description: "Project for testing member addition",
      managerDisplayName: "Team Lead",
      clockObjectId: CLOCK_OBJECT_ID,
      senderSecretKey: managerSecretKey,
      packageId: PACKAGE_ID,
    });

    // Extract project ID and manager cap ID from events
    const projectEvent = projectTx.events!.find((event) =>
      event.type.includes("ProjectCreated"),
    );
    projectId = (projectEvent?.parsedJson as any).id;
    managerCapId = (projectEvent?.parsedJson as any).manager_cap_id;
  });

  test("should add first member to the project successfully", async () => {
    if (!PACKAGE_ID || !REGISTRY_OBJECT_ID) {
      return;
    }

    // Add member1 to the project
    addMemberTx = await addMember({
      projectId,
      managerCapId,
      registryObjectId: REGISTRY_OBJECT_ID,
      memberAddress: member1Address,
      displayName: "Member One",
      clockObjectId: CLOCK_OBJECT_ID,
      senderSecretKey: managerSecretKey,
      packageId: PACKAGE_ID,
    });

    expect(addMemberTx.effects).toBeDefined();
    expect(addMemberTx.effects!.status.status).toBe("success");
  });

  test("should emit MemberAdded event with correct data", async () => {
    if (!PACKAGE_ID || !REGISTRY_OBJECT_ID) {
      return;
    }

    expect(addMemberTx.events).toBeDefined();

    const memberAddedEvent = addMemberTx.events!.find((event) =>
      event.type.includes("MemberAdded"),
    );

    expect(memberAddedEvent).toBeDefined();
    expect(memberAddedEvent?.parsedJson).toHaveProperty("project_id");
    expect(memberAddedEvent?.parsedJson).toHaveProperty("member_address");
    expect(memberAddedEvent?.parsedJson).toHaveProperty("display_name");
    expect(memberAddedEvent?.parsedJson).toHaveProperty("joined_at");
    expect(memberAddedEvent?.parsedJson).toHaveProperty("added_by");
  });

  test("should add second member successfully", async () => {
    if (!PACKAGE_ID || !REGISTRY_OBJECT_ID) {
      return;
    }

    // Add member2 to the project
    const addMember2Tx = await addMember({
      projectId,
      managerCapId,
      registryObjectId: REGISTRY_OBJECT_ID,
      memberAddress: member2Address,
      displayName: "Member Two",
      clockObjectId: CLOCK_OBJECT_ID,
      senderSecretKey: managerSecretKey,
      packageId: PACKAGE_ID,
    });

    expect(addMember2Tx.effects).toBeDefined();
    expect(addMember2Tx.effects!.status.status).toBe("success");
  });

  test("should fail when adding duplicate member", async () => {
    if (!PACKAGE_ID || !REGISTRY_OBJECT_ID) {
      return;
    }

    // Try to add member1 again, should fail
    await expect(
      addMember({
        projectId,
        managerCapId,
        registryObjectId: REGISTRY_OBJECT_ID,
        memberAddress: member1Address,
        displayName: "Duplicate Member",
        clockObjectId: CLOCK_OBJECT_ID,
        senderSecretKey: managerSecretKey,
        packageId: PACKAGE_ID,
      }),
    ).rejects.toThrow();
  });
});

describe("Jira Engine - Adding Tasks", () => {
  let projectId: string;
  let managerCapId: string;
  let addTaskTx: SuiTransactionBlockResponse;

  beforeAll(async () => {
    if (!PACKAGE_ID || !REGISTRY_OBJECT_ID) {
      return;
    }

    // Create a project - manager is automatically added as a member
    const projectTx = await createProject({
      registryObjectId: REGISTRY_OBJECT_ID,
      name: "Task Project",
      description: "Project for testing task creation",
      managerDisplayName: "Task Manager",
      clockObjectId: CLOCK_OBJECT_ID,
      senderSecretKey: managerSecretKey,
      packageId: PACKAGE_ID,
    });

    const projectEvent = projectTx.events!.find((event) =>
      event.type.includes("ProjectCreated"),
    );
    projectId = (projectEvent?.parsedJson as any).id;
    managerCapId = (projectEvent?.parsedJson as any).manager_cap_id;

    // Add member1 to the project so we can assign tasks to them
    await addMember({
      projectId,
      managerCapId,
      registryObjectId: REGISTRY_OBJECT_ID,
      memberAddress: member1Address,
      displayName: "Task Assignee",
      clockObjectId: CLOCK_OBJECT_ID,
      senderSecretKey: managerSecretKey,
      packageId: PACKAGE_ID,
    });
  });

  test("should add a new task successfully", async () => {
    if (!PACKAGE_ID || !REGISTRY_OBJECT_ID) {
      return;
    }

    const dueDate = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days from now

    addTaskTx = await addTask({
      projectId,
      managerCapId,
      name: "Implement user authentication",
      description: "Add login and registration functionality",
      assigneeAddress: managerAddress, // Assign to manager who is already a member
      state: 0, // TODO state
      dueDate,
      senderSecretKey: managerSecretKey,
      packageId: PACKAGE_ID,
    });

    expect(addTaskTx.effects).toBeDefined();
    expect(addTaskTx.effects!.status.status).toBe("success");
  });

  test("should emit TaskAdded event with correct data", async () => {
    if (!PACKAGE_ID || !REGISTRY_OBJECT_ID) {
      return;
    }

    expect(addTaskTx.events).toBeDefined();

    const taskAddedEvent = addTaskTx.events!.find((event) =>
      event.type.includes("TaskAdded"),
    );

    expect(taskAddedEvent).toBeDefined();
    expect(taskAddedEvent?.parsedJson).toHaveProperty("project_id");
    expect(taskAddedEvent?.parsedJson).toHaveProperty("task_id");
    expect(taskAddedEvent?.parsedJson).toHaveProperty("name");
    expect(taskAddedEvent?.parsedJson).toHaveProperty("description");
    expect(taskAddedEvent?.parsedJson).toHaveProperty("assignee");
    expect(taskAddedEvent?.parsedJson).toHaveProperty("state");
    expect(taskAddedEvent?.parsedJson).toHaveProperty("due_date");
    expect(taskAddedEvent?.parsedJson).toHaveProperty("added_by");
  });

  test("should add multiple tasks successfully", async () => {
    if (!PACKAGE_ID || !REGISTRY_OBJECT_ID) {
      return;
    }

    const dueDate = Date.now() + 14 * 24 * 60 * 60 * 1000; // 14 days from now

    const task2Tx = await addTask({
      projectId,
      managerCapId,
      name: "Design database schema",
      description: "Create database structure for the application",
      assigneeAddress: managerAddress, // Assign to manager who is a member
      state: 1, // IN_PROGRESS state
      dueDate,
      senderSecretKey: managerSecretKey,
      packageId: PACKAGE_ID,
    });

    expect(task2Tx.effects).toBeDefined();
    expect(task2Tx.effects!.status.status).toBe("success");

    const task3Tx = await addTask({
      projectId,
      managerCapId,
      name: "Write API documentation",
      description: "Document all API endpoints",
      assigneeAddress: managerAddress, // Assign to manager who is a member
      state: 0,
      dueDate,
      senderSecretKey: managerSecretKey,
      packageId: PACKAGE_ID,
    });

    expect(task3Tx.effects).toBeDefined();
    expect(task3Tx.effects!.status.status).toBe("success");
  });

  test("should fail when assigning task to non-member", async () => {
    if (!PACKAGE_ID || !REGISTRY_OBJECT_ID) {
      return;
    }

    // Generate a random address that's not a member of the project
    const nonMemberKeypair = new Ed25519Keypair();
    const nonMemberAddress = nonMemberKeypair.toSuiAddress();

    await expect(
      addTask({
        projectId,
        managerCapId,
        name: "Invalid task",
        description: "This should fail",
        assigneeAddress: nonMemberAddress,
        state: 0,
        dueDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
        senderSecretKey: managerSecretKey,
        packageId: PACKAGE_ID,
      }),
    ).rejects.toThrow();
  });
});
