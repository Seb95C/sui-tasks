module jira_engine::project;

use jira_engine::username_registry::{Self, UsernameRegistry};
use std::string::String;
use sui::clock::{Self, Clock};
use sui::event;
use sui::object_table::{Self, ObjectTable};
use sui::table::{Self, Table};

// ==============================================================================
// Constants
// ==============================================================================

// Role constants

// Error codes
const E_NOT_AUTHORIZED: u64 = 1;
const E_MEMBER_NOT_FOUND: u64 = 3;
const E_MEMBER_ALREADY_EXISTS: u64 = 4;
const E_TASK_NOT_FOUND: u64 = 5;
const E_NOT_TASK_ASSIGNEE: u64 = 6;
const E_NOT_REGISTERED: u64 = 7;
const E_SUBTASK_NOT_FOUND: u64 = 8;
const E_ATTACHMENT_NOT_FOUND: u64 = 9;

// ==============================================================================
// Events
// ==============================================================================
public struct ProjectCreated has copy, drop {
    id: ID,
    manager: address,
    name: String,
    description: String,
    manager_cap_id: ID,
}

public struct MemberAdded has copy, drop {
    project_id: ID,
    member_address: address,
    display_name: String,
    joined_at: u64,
    added_by: address,
}

public struct MemberRemoved has copy, drop {
    project_id: ID,
    member_address: address,
    removed_by: address,
}

public struct TaskAdded has copy, drop {
    project_id: ID,
    task_id: ID,
    name: String,
    description: String,
    assignee: address,
    state: u8,
    due_date: u64,
    added_by: address,
}

public struct DeleteTask has copy, drop {
    project_id: ID,
    task_id: ID,
    deleted_by: address,
}

public struct TaskNameUpdated has copy, drop {
    project_id: ID,
    task_id: ID,
    old_name: String,
    new_name: String,
    updated_by: address,
}

public struct TaskDescriptionUpdated has copy, drop {
    project_id: ID,
    task_id: ID,
    updated_by: address,
}

public struct TaskAssigneeUpdated has copy, drop {
    project_id: ID,
    task_id: ID,
    old_assignee: address,
    new_assignee: address,
    updated_by: address,
}

public struct TaskStateUpdated has copy, drop {
    project_id: ID,
    task_id: ID,
    old_state: u8,
    new_state: u8,
    updated_by: address,
}

public struct TaskDueDateUpdated has copy, drop {
    project_id: ID,
    task_id: ID,
    old_due_date: u64,
    new_due_date: u64,
    updated_by: address,
}

public struct SubtaskAdded has copy, drop {
    project_id: ID,
    task_id: ID,
    subtask_id: u64,
    name: String,
    description: String,
    state: u8,
    added_by: address,
}

public struct SubtaskUpdated has copy, drop {
    project_id: ID,
    task_id: ID,
    subtask_id: u64,
    updated_by: address,
}

public struct SubtaskDeleted has copy, drop {
    project_id: ID,
    task_id: ID,
    subtask_id: u64,
    deleted_by: address,
}

public struct AttachmentAdded has copy, drop {
    project_id: ID,
    task_id: ID,
    attachment_id: u64,
    name: String,
    url: String,
    added_by: address,
}

public struct AttachmentRemoved has copy, drop {
    project_id: ID,
    task_id: ID,
    attachment_id: u64,
    removed_by: address,
}

// ==============================================================================
// Structures
// ==============================================================================

public struct Member has copy, drop, store {
    address: address,
    display_name: String,
    joined_at: u64,
}

public struct ProjectMember has key {
    id: UID,
    project_id: ID,
    display_name: String,
}

public struct Project has key {
    id: UID,
    name: String,
    description: String,
    manager: address,
    members: Table<address, Member>,
    tasks: ObjectTable<ID, Task>,
}

public struct ProjectManagerCap has key {
    id: UID,
    project_id: ID,
}

public struct Task has key, store {
    id: UID,
    name: String,
    description: String,
    asignee: address,
    state: u8,
    due_date: u64,
    subtasks: Table<u64, Subtask>,
    subtask_counter: u64,
    attachments: Table<u64, Attachment>,
    attachment_counter: u64,
}

public struct Subtask has copy, drop, store {
    name: String,
    description: String,
    state: u8,
}

public struct Attachment has copy, drop, store {
    name: String,
    url: String,
}

// ==============================================================================
// Project methods
// ==============================================================================

/// Function that creates a new Project object
///
/// # Arguments
/// * `manager` - The address of the project manager
/// * `name` - A string type that defines the project name
/// * `description` - A string type that defines the project description
/// * `manager_display_name` - Display name for the manager
/// * `clock` - Reference to the Clock for timestamps
/// * `ctx` - mutable reference to a transaction context
///
/// # Returns
/// An object of type Project
public fun new(
    manager: address,
    name: String,
    description: String,
    manager_display_name: String,
    clock: &Clock,
    ctx: &mut TxContext,
): Project {
    let mut members_table = table::new<address, Member>(ctx);

    // Add manager as the first member with ADMIN role
    let manager_member = Member {
        address: manager,
        display_name: manager_display_name,
        joined_at: clock::timestamp_ms(clock),
    };

    table::add(&mut members_table, manager, manager_member);

    let new_project = Project {
        id: object::new(ctx),
        name,
        description,
        manager,
        members: members_table,
        tasks: object_table::new(ctx),
    };

    new_project
}

/// Mints a new project and project manager cap to the sender of the transaction
/// Only registered users can create projects
///
/// # Arguments
/// * `registry` - Reference to the UsernameRegistry to verify user is registered
/// * `name` - A string type that defines the project name
/// * `description` - A string type that defines the project description
/// * `manager_display_name` - Display name for the manager
/// * `clock` - Reference to the Clock for timestamps
/// * `ctx` - mutable reference to a transaction context
public fun mint_project(
    registry: &UsernameRegistry,
    name: String,
    description: String,
    manager_display_name: String,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let manager = ctx.sender();

    // Verify the sender is registered in the username registry
    assert!(username_registry::has_registered(registry, manager), E_NOT_REGISTERED);

    let new_project = new(manager, name, description, manager_display_name, clock, ctx);
    let new_project_manager_cap = ProjectManagerCap {
        id: object::new(ctx),
        project_id: object::id(&new_project),
    };

    event::emit(ProjectCreated {
        id: object::id(&new_project),
        manager,
        name,
        description,
        manager_cap_id: object::id(&new_project_manager_cap),
    });

    transfer::share_object(new_project);
    transfer::transfer(new_project_manager_cap, manager);
}

/// A project manager can close a project
///
/// # Arguments
/// * `ProjectManagerCap` - Manager project capability
/// * `Project` - Project to close
public fun close_project(manager: ProjectManagerCap, project: Project) {
    // Only the project manager can close the project
    assert!(is_admin(&project, &manager), E_NOT_AUTHORIZED);

    // drop the project object
    dropProject(project);

    // delete the project manager cap
    let ProjectManagerCap { id, project_id: _ } = manager;
    object::delete(id);
    // to do emit close project event
}

fun dropProject(project: Project) {
    // Unpack the project - must list ALL fields explicitly
    let Project {
        id,
        tasks,
        members,
        ..,
    } = project;

    // Destroy empty object table
    object_table::destroy_empty(tasks);

    // Drop the members table
    table::drop(members);

    // Delete the project object
    object::delete(id);
}

// ==============================================================================
// Member management functions
// ==============================================================================

/// Add a new member to the project
/// Only admins can add members, and only registered users can be added
///
/// # Arguments
/// * `manager` - Project manager capability
/// * `registry` - Reference to the UsernameRegistry to verify user is registered
/// * `project` - Mutable reference to the project
/// * `member_address` - Address of the member to add
/// * `display_name` - Display name for the member
/// * `clock` - Reference to the Clock for timestamps
/// * `ctx` - Transaction context
public fun add_member(
    manager: &ProjectManagerCap,
    registry: &UsernameRegistry,
    project: &mut Project,
    member_address: address,
    display_name: String,
    clock: &Clock,
    ctx: &mut TxContext,
) {
    let sender = ctx.sender();

    // Only admins can add members
    assert!(is_admin(project, manager), E_NOT_AUTHORIZED);

    // Verify the member is registered in the username registry
    assert!(username_registry::has_registered(registry, member_address), E_NOT_REGISTERED);

    // Check if member already exists
    assert!(!table::contains(&project.members, member_address), E_MEMBER_ALREADY_EXISTS);

    // Create and add the new member
    let joined_at = clock::timestamp_ms(clock);
    let new_member = Member {
        address: member_address,
        display_name,
        joined_at,
    };

    let new_memer_object = ProjectMember {
        id: object::new(ctx),
        project_id: object::id(project),
        display_name,
    };

    table::add(&mut project.members, member_address, new_member);

    // Emit event
    event::emit(MemberAdded {
        project_id: object::id(project),
        member_address,
        display_name,
        joined_at,
        added_by: sender,
    });

    transfer::transfer(new_memer_object, member_address);
}

/// Remove a member from the project
/// Only admins can remove members
/// Cannot remove another admin
///
/// # Arguments
/// * `project` - Mutable reference to the project
/// * `member_address` - Address of the member to remove
/// * `ctx` - Transaction context
public fun remove_member(
    manager: &ProjectManagerCap,
    project: &mut Project,
    member_address: address,
    ctx: &mut TxContext,
) {
    let sender = ctx.sender();

    // Only admins can remove members
    assert!(is_admin(project, manager), E_NOT_AUTHORIZED);

    // Check if member exists
    assert!(table::contains(&project.members, member_address), E_MEMBER_NOT_FOUND);

    // Remove the member
    table::remove(&mut project.members, member_address);

    // Emit event
    event::emit(MemberRemoved {
        project_id: object::id(project),
        member_address,
        removed_by: sender,
    });
}

// ==============================================================================
// Tasks methods
// ==============================================================================

/// Create a new task
///
/// # Arguments
/// * name - task name
/// * description  - description of the task
/// * responsible - the address of the worker
/// * state - the state of the task
/// * due_date - the due date of the task
///
/// # Returns
/// A Task object
fun new_task(
    name: String,
    description: String,
    asignee: address,
    state: u8,
    due_date: u64,
    ctx: &mut TxContext,
): Task {
    Task {
        id: object::new(ctx),
        name,
        description,
        asignee,
        state,
        due_date,
        subtasks: table::new(ctx),
        subtask_counter: 0,
        attachments: table::new(ctx),
        attachment_counter: 0,
    }
}

///The project manager can create a task
///
/// # Arguments
/// * `manager` - project manager cap
/// * `project` - the project to add the task to
/// * name - task name
/// * description  - description of the task
/// * responsible - the address of the worker
/// * state - the state of the task
/// * due_date - the due date of the task
public fun add_task(
    manager: &ProjectManagerCap,
    project: &mut Project,
    name: String,
    description: String,
    responsible: address,
    state: u8,
    due_date: u64,
    ctx: &mut TxContext,
) {
    assert!(is_admin(project, manager), E_NOT_AUTHORIZED);
    assert!(table::contains(&project.members, responsible), E_NOT_AUTHORIZED);

    let new_task = new_task(name, description, responsible, state, due_date, ctx);
    let task_id = object::id(&new_task);

    object_table::add(&mut project.tasks, task_id, new_task);
    event::emit(TaskAdded {
        project_id: object::id(project),
        task_id,
        name,
        description,
        assignee: responsible,
        state,
        due_date,
        added_by: ctx.sender(),
    });
}

/// A project member can create a task assigned to themselves
///
/// # Arguments
/// * `project` - the project to add the task to
/// * `name` - task name
/// * `description` - description of the task
/// * `state` - the state of the task
/// * `due_date` - the due date of the task
/// * `ctx` - transaction context
public fun member_create_task(
    project: &mut Project,
    name: String,
    description: String,
    state: u8,
    due_date: u64,
    ctx: &mut TxContext,
) {
    let caller = ctx.sender();

    // Verify caller is a member of the project
    assert!(table::contains(&project.members, caller), E_NOT_AUTHORIZED);

    // Create task with caller as assignee (members can only assign to themselves)
    let new_task = new_task(name, description, caller, state, due_date, ctx);
    let task_id = object::id(&new_task);

    object_table::add(&mut project.tasks, task_id, new_task);
    event::emit(TaskAdded {
        project_id: object::id(project),
        task_id,
        name,
        description,
        assignee: caller,
        state,
        due_date,
        added_by: caller,
    });
}

/// Internal helper to delete a task without authorization checks
fun delete_task_internal(project: &mut Project, task_id: ID) {
    let task = object_table::remove(&mut project.tasks, task_id);
    let Task { id, subtasks, attachments, .. } = task;

    // Drop the subtasks and attachments tables (this is why using Table is so easy!)
    table::drop(subtasks);
    table::drop(attachments);

    object::delete(id);
}

/// Manager of the project can delete a task
///
/// # Arguments
/// * `manager` - project manager cap
/// * `project` - the project to delete the task from
/// * `task_id` - the task id to delete
/// * `ctx` - transaction context
public fun delete_task(
    manager: &ProjectManagerCap,
    project: &mut Project,
    task_id: ID,
    ctx: &TxContext,
) {
    assert!(is_admin(project, manager), E_NOT_AUTHORIZED);
    assert!(object_table::contains(&project.tasks, task_id), E_TASK_NOT_FOUND);

    delete_task_internal(project, task_id);

    event::emit(DeleteTask {
        project_id: object::id(project),
        task_id,
        deleted_by: ctx.sender(),
    });
}

// ==============================================================================
// View functions
// ==============================================================================

/// Check if an address is a member of the project
public fun is_member(project: &Project, user: address): bool {
    table::contains(&project.members, user)
}

/// Get project manager address
public fun get_manager(project: &Project): address {
    project.manager
}

// ==============================================================================
// Task Update Functions
// ==============================================================================

/// manager_update_task_name
/// A manager updates the task name
/// # Arguments
/// * `manager` - Project manager capability
/// * `project` - Project object that has the task to change
/// * `task_id` - The task id to update
/// * `name` - New name value
/// * `ctx` - Transaction context
public fun manager_update_task_name(
    manager: &ProjectManagerCap,
    project: &mut Project,
    task_id: ID,
    name: String,
    ctx: &TxContext,
) {
    assert!(is_admin(project, manager), E_NOT_AUTHORIZED);
    assert!(object_table::contains(&project.tasks, task_id), E_TASK_NOT_FOUND);

    let old_name = project.tasks[task_id].name;
    project.tasks[task_id].name = name;

    event::emit(TaskNameUpdated {
        project_id: object::id(project),
        task_id,
        old_name,
        new_name: name,
        updated_by: ctx.sender(),
    });
}

/// manager_update_task_descripiton
/// A manager updates the task description
/// # Arguments
/// * `manager` - Project manager capability
/// * `project` - Project object that has the task to change
/// * `task_id` - The task id to update
/// * `description` - New description value
/// * `ctx` - Transaction context
public fun manager_update_task_descripiton(
    manager: &ProjectManagerCap,
    project: &mut Project,
    task_id: ID,
    description: String,
    ctx: &TxContext,
) {
    assert!(is_admin(project, manager), E_NOT_AUTHORIZED);
    assert!(object_table::contains(&project.tasks, task_id), E_TASK_NOT_FOUND);

    project.tasks[task_id].description = description;

    event::emit(TaskDescriptionUpdated {
        project_id: object::id(project),
        task_id,
        updated_by: ctx.sender(),
    });
}

/// manager_update_task_asignee
/// A manager updates the task assignee
/// # Arguments
/// * `manager` - Project manager capability
/// * `project` - Project object that has the task to change
/// * `task_id` - The task id to update
/// * `asignee` - New assignee address
/// * `ctx` - Transaction context
public fun manager_update_task_asignee(
    manager: &ProjectManagerCap,
    project: &mut Project,
    task_id: ID,
    asignee: address,
    ctx: &TxContext,
) {
    assert!(is_admin(project, manager), E_NOT_AUTHORIZED);
    assert!(object_table::contains(&project.tasks, task_id), E_TASK_NOT_FOUND);

    let old_assignee = project.tasks[task_id].asignee;
    project.tasks[task_id].asignee = asignee;

    event::emit(TaskAssigneeUpdated {
        project_id: object::id(project),
        task_id,
        old_assignee,
        new_assignee: asignee,
        updated_by: ctx.sender(),
    });
}

/// manager_update_task_state
/// A manager updates the task state
/// # Arguments
/// * `manager` - Project manager capability
/// * `project` - Project object that has the task to change
/// * `task_id` - The task id to update
/// * `state` - New state value
/// * `ctx` - Transaction context
public fun manager_update_task_state(
    manager: &ProjectManagerCap,
    project: &mut Project,
    task_id: ID,
    state: u8,
    ctx: &TxContext,
) {
    assert!(is_admin(project, manager), E_NOT_AUTHORIZED);
    assert!(object_table::contains(&project.tasks, task_id), E_TASK_NOT_FOUND);

    let old_state = project.tasks[task_id].state;
    project.tasks[task_id].state = state;

    event::emit(TaskStateUpdated {
        project_id: object::id(project),
        task_id,
        old_state,
        new_state: state,
        updated_by: ctx.sender(),
    });
}

/// manager_update_task_due_date
/// A manager updates the task due date
/// # Arguments
/// * `manager` - Project manager capability
/// * `project` - Project object that has the task to change
/// * `task_id` - The task id to update
/// * `due_date` - New due date timestamp
/// * `ctx` - Transaction context
public fun manager_update_task_due_date(
    manager: &ProjectManagerCap,
    project: &mut Project,
    task_id: ID,
    due_date: u64,
    ctx: &TxContext,
) {
    assert!(is_admin(project, manager), E_NOT_AUTHORIZED);
    assert!(object_table::contains(&project.tasks, task_id), E_TASK_NOT_FOUND);

    let old_due_date = project.tasks[task_id].due_date;
    project.tasks[task_id].due_date = due_date;

    event::emit(TaskDueDateUpdated {
        project_id: object::id(project),
        task_id,
        old_due_date,
        new_due_date: due_date,
        updated_by: ctx.sender(),
    });
}

/// assignee_update_task_state
/// Allows a task assignee to update their own task's state
/// # Arguments
/// * `project` - Project object that has the task to change
/// * `task_id` - The task id to update
/// * `state` - New state value
/// * `ctx` - Transaction context
public fun assignee_update_task_state(
    project: &mut Project,
    task_id: ID,
    state: u8,
    ctx: &TxContext,
) {
    assert!(object_table::contains(&project.tasks, task_id), E_TASK_NOT_FOUND);

    // Verify the caller is the assignee of this task
    let caller = ctx.sender();
    assert!(project.tasks[task_id].asignee == caller, E_NOT_TASK_ASSIGNEE);

    let old_state = project.tasks[task_id].state;
    project.tasks[task_id].state = state;

    event::emit(TaskStateUpdated {
        project_id: object::id(project),
        task_id,
        old_state,
        new_state: state,
        updated_by: caller,
    });
}

/// member_update_task_name
/// Allows a task assignee to update their own task's name
/// # Arguments
/// * `project` - Project object that has the task to change
/// * `task_id` - The task id to update
/// * `name` - New name value
/// * `ctx` - Transaction context
public fun member_update_task_name(
    project: &mut Project,
    task_id: ID,
    name: String,
    ctx: &TxContext,
) {
    assert!(object_table::contains(&project.tasks, task_id), E_TASK_NOT_FOUND);

    // Verify the caller is the assignee of this task
    let caller = ctx.sender();
    assert!(project.tasks[task_id].asignee == caller, E_NOT_TASK_ASSIGNEE);

    let old_name = project.tasks[task_id].name;
    project.tasks[task_id].name = name;

    event::emit(TaskNameUpdated {
        project_id: object::id(project),
        task_id,
        old_name,
        new_name: name,
        updated_by: caller,
    });
}

/// member_update_task_description
/// Allows a task assignee to update their own task's description
/// # Arguments
/// * `project` - Project object that has the task to change
/// * `task_id` - The task id to update
/// * `description` - New description value
/// * `ctx` - Transaction context
public fun member_update_task_description(
    project: &mut Project,
    task_id: ID,
    description: String,
    ctx: &TxContext,
) {
    assert!(object_table::contains(&project.tasks, task_id), E_TASK_NOT_FOUND);

    // Verify the caller is the assignee of this task
    let caller = ctx.sender();
    assert!(project.tasks[task_id].asignee == caller, E_NOT_TASK_ASSIGNEE);

    project.tasks[task_id].description = description;

    event::emit(TaskDescriptionUpdated {
        project_id: object::id(project),
        task_id,
        updated_by: caller,
    });
}

/// member_update_task_due_date
/// Allows a task assignee to update their own task's due date
/// # Arguments
/// * `project` - Project object that has the task to change
/// * `task_id` - The task id to update
/// * `due_date` - New due date timestamp
/// * `ctx` - Transaction context
public fun member_update_task_due_date(
    project: &mut Project,
    task_id: ID,
    due_date: u64,
    ctx: &TxContext,
) {
    assert!(object_table::contains(&project.tasks, task_id), E_TASK_NOT_FOUND);

    // Verify the caller is the assignee of this task
    let caller = ctx.sender();
    assert!(project.tasks[task_id].asignee == caller, E_NOT_TASK_ASSIGNEE);

    let old_due_date = project.tasks[task_id].due_date;
    project.tasks[task_id].due_date = due_date;

    event::emit(TaskDueDateUpdated {
        project_id: object::id(project),
        task_id,
        old_due_date,
        new_due_date: due_date,
        updated_by: caller,
    });
}

// ==============================================================================
// Subtask Management Functions
// ==============================================================================

/// Manager adds a subtask to a task
/// # Arguments
/// * `manager` - Project manager capability
/// * `project` - Project object
/// * `task_id` - Parent task ID
/// * `name` - Subtask name
/// * `description` - Subtask description
/// * `state` - Subtask state
/// * `ctx` - Transaction context
public fun manager_add_subtask(
    manager: &ProjectManagerCap,
    project: &mut Project,
    task_id: ID,
    name: String,
    description: String,
    state: u8,
    ctx: &TxContext,
) {
    assert!(is_admin(project, manager), E_NOT_AUTHORIZED);
    assert!(object_table::contains(&project.tasks, task_id), E_TASK_NOT_FOUND);

    let task = &mut project.tasks[task_id];
    let subtask = Subtask { name, description, state };
    let subtask_id = task.subtask_counter;

    table::add(&mut task.subtasks, subtask_id, subtask);
    task.subtask_counter = task.subtask_counter + 1;

    event::emit(SubtaskAdded {
        project_id: object::id(project),
        task_id,
        subtask_id,
        name,
        description,
        state,
        added_by: ctx.sender(),
    });
}

/// Member adds a subtask to their own task
/// # Arguments
/// * `project` - Project object
/// * `task_id` - Parent task ID (must be assigned to caller)
/// * `name` - Subtask name
/// * `description` - Subtask description
/// * `state` - Subtask state
/// * `ctx` - Transaction context
public fun member_add_subtask(
    project: &mut Project,
    task_id: ID,
    name: String,
    description: String,
    state: u8,
    ctx: &TxContext,
) {
    assert!(object_table::contains(&project.tasks, task_id), E_TASK_NOT_FOUND);

    let caller = ctx.sender();
    let task = &mut project.tasks[task_id];

    // Verify caller is the assignee of this task
    assert!(task.asignee == caller, E_NOT_TASK_ASSIGNEE);

    let subtask = Subtask { name, description, state };
    let subtask_id = task.subtask_counter;

    table::add(&mut task.subtasks, subtask_id, subtask);
    task.subtask_counter = task.subtask_counter + 1;

    event::emit(SubtaskAdded {
        project_id: object::id(project),
        task_id,
        subtask_id,
        name,
        description,
        state,
        added_by: caller,
    });
}

/// Manager updates a subtask
/// # Arguments
/// * `manager` - Project manager capability
/// * `project` - Project object
/// * `task_id` - Parent task ID
/// * `subtask_id` - Subtask ID
/// * `name` - New name
/// * `description` - New description
/// * `state` - New state
/// * `ctx` - Transaction context
public fun manager_update_subtask(
    manager: &ProjectManagerCap,
    project: &mut Project,
    task_id: ID,
    subtask_id: u64,
    name: String,
    description: String,
    state: u8,
    ctx: &TxContext,
) {
    assert!(is_admin(project, manager), E_NOT_AUTHORIZED);
    assert!(object_table::contains(&project.tasks, task_id), E_TASK_NOT_FOUND);

    let task = &mut project.tasks[task_id];
    assert!(table::contains(&task.subtasks, subtask_id), E_SUBTASK_NOT_FOUND);

    let subtask = table::borrow_mut(&mut task.subtasks, subtask_id);
    subtask.name = name;
    subtask.description = description;
    subtask.state = state;

    event::emit(SubtaskUpdated {
        project_id: object::id(project),
        task_id,
        subtask_id,
        updated_by: ctx.sender(),
    });
}

/// Member updates a subtask on their own task
/// # Arguments
/// * `project` - Project object
/// * `task_id` - Parent task ID (must be assigned to caller)
/// * `subtask_id` - Subtask ID
/// * `name` - New name
/// * `description` - New description
/// * `state` - New state
/// * `ctx` - Transaction context
public fun member_update_subtask(
    project: &mut Project,
    task_id: ID,
    subtask_id: u64,
    name: String,
    description: String,
    state: u8,
    ctx: &TxContext,
) {
    assert!(object_table::contains(&project.tasks, task_id), E_TASK_NOT_FOUND);

    let caller = ctx.sender();
    let task = &mut project.tasks[task_id];

    // Verify caller is the assignee of this task
    assert!(task.asignee == caller, E_NOT_TASK_ASSIGNEE);
    assert!(table::contains(&task.subtasks, subtask_id), E_SUBTASK_NOT_FOUND);

    let subtask = table::borrow_mut(&mut task.subtasks, subtask_id);
    subtask.name = name;
    subtask.description = description;
    subtask.state = state;

    event::emit(SubtaskUpdated {
        project_id: object::id(project),
        task_id,
        subtask_id,
        updated_by: caller,
    });
}

/// Manager deletes a subtask
/// # Arguments
/// * `manager` - Project manager capability
/// * `project` - Project object
/// * `task_id` - Parent task ID
/// * `subtask_id` - Subtask ID to delete
/// * `ctx` - Transaction context
public fun manager_delete_subtask(
    manager: &ProjectManagerCap,
    project: &mut Project,
    task_id: ID,
    subtask_id: u64,
    ctx: &TxContext,
) {
    assert!(is_admin(project, manager), E_NOT_AUTHORIZED);
    assert!(object_table::contains(&project.tasks, task_id), E_TASK_NOT_FOUND);

    let task = &mut project.tasks[task_id];
    assert!(table::contains(&task.subtasks, subtask_id), E_SUBTASK_NOT_FOUND);

    table::remove(&mut task.subtasks, subtask_id);

    event::emit(SubtaskDeleted {
        project_id: object::id(project),
        task_id,
        subtask_id,
        deleted_by: ctx.sender(),
    });
}

/// Member deletes a subtask from their own task
/// # Arguments
/// * `project` - Project object
/// * `task_id` - Parent task ID (must be assigned to caller)
/// * `subtask_id` - Subtask ID to delete
/// * `ctx` - Transaction context
public fun member_delete_subtask(
    project: &mut Project,
    task_id: ID,
    subtask_id: u64,
    ctx: &TxContext,
) {
    assert!(object_table::contains(&project.tasks, task_id), E_TASK_NOT_FOUND);

    let caller = ctx.sender();
    let task = &mut project.tasks[task_id];

    // Verify caller is the assignee of this task
    assert!(task.asignee == caller, E_NOT_TASK_ASSIGNEE);
    assert!(table::contains(&task.subtasks, subtask_id), E_SUBTASK_NOT_FOUND);

    table::remove(&mut task.subtasks, subtask_id);

    event::emit(SubtaskDeleted {
        project_id: object::id(project),
        task_id,
        subtask_id,
        deleted_by: caller,
    });
}

// ==============================================================================
// Attachment Management Functions
// ==============================================================================

/// Manager adds an attachment to a task
/// # Arguments
/// * `manager` - Project manager capability
/// * `project` - Project object
/// * `task_id` - Task ID
/// * `name` - Attachment name
/// * `url` - Attachment URL
/// * `ctx` - Transaction context
public fun manager_add_attachment(
    manager: &ProjectManagerCap,
    project: &mut Project,
    task_id: ID,
    name: String,
    url: String,
    ctx: &TxContext,
) {
    assert!(is_admin(project, manager), E_NOT_AUTHORIZED);
    assert!(object_table::contains(&project.tasks, task_id), E_TASK_NOT_FOUND);

    let task = &mut project.tasks[task_id];
    let attachment = Attachment { name, url };
    let attachment_id = task.attachment_counter;

    table::add(&mut task.attachments, attachment_id, attachment);
    task.attachment_counter = task.attachment_counter + 1;

    event::emit(AttachmentAdded {
        project_id: object::id(project),
        task_id,
        attachment_id,
        name,
        url,
        added_by: ctx.sender(),
    });
}

/// Assignee adds an attachment to their task
/// # Arguments
/// * `project` - Project object
/// * `task_id` - Task ID (must be assigned to caller)
/// * `name` - Attachment name
/// * `url` - Attachment URL
/// * `ctx` - Transaction context
public fun assignee_add_attachment(
    project: &mut Project,
    task_id: ID,
    name: String,
    url: String,
    ctx: &TxContext,
) {
    assert!(object_table::contains(&project.tasks, task_id), E_TASK_NOT_FOUND);

    let caller = ctx.sender();
    let task = &mut project.tasks[task_id];

    // Verify caller is the assignee of this task
    assert!(task.asignee == caller, E_NOT_TASK_ASSIGNEE);

    let attachment = Attachment { name, url };
    let attachment_id = task.attachment_counter;

    table::add(&mut task.attachments, attachment_id, attachment);
    task.attachment_counter = task.attachment_counter + 1;

    event::emit(AttachmentAdded {
        project_id: object::id(project),
        task_id,
        attachment_id,
        name,
        url,
        added_by: caller,
    });
}

/// Manager removes an attachment from a task
/// # Arguments
/// * `manager` - Project manager capability
/// * `project` - Project object
/// * `task_id` - Task ID
/// * `attachment_id` - Attachment ID to remove
/// * `ctx` - Transaction context
public fun manager_remove_attachment(
    manager: &ProjectManagerCap,
    project: &mut Project,
    task_id: ID,
    attachment_id: u64,
    ctx: &TxContext,
) {
    assert!(is_admin(project, manager), E_NOT_AUTHORIZED);
    assert!(object_table::contains(&project.tasks, task_id), E_TASK_NOT_FOUND);

    let task = &mut project.tasks[task_id];
    assert!(table::contains(&task.attachments, attachment_id), E_ATTACHMENT_NOT_FOUND);

    table::remove(&mut task.attachments, attachment_id);

    event::emit(AttachmentRemoved {
        project_id: object::id(project),
        task_id,
        attachment_id,
        removed_by: ctx.sender(),
    });
}

/// Assignee removes an attachment from their task
/// # Arguments
/// * `project` - Project object
/// * `task_id` - Task ID (must be assigned to caller)
/// * `attachment_id` - Attachment ID to remove
/// * `ctx` - Transaction context
public fun assignee_remove_attachment(
    project: &mut Project,
    task_id: ID,
    attachment_id: u64,
    ctx: &TxContext,
) {
    assert!(object_table::contains(&project.tasks, task_id), E_TASK_NOT_FOUND);

    let caller = ctx.sender();
    let task = &mut project.tasks[task_id];

    // Verify caller is the assignee of this task
    assert!(task.asignee == caller, E_NOT_TASK_ASSIGNEE);
    assert!(table::contains(&task.attachments, attachment_id), E_ATTACHMENT_NOT_FOUND);

    table::remove(&mut task.attachments, attachment_id);

    event::emit(AttachmentRemoved {
        project_id: object::id(project),
        task_id,
        attachment_id,
        removed_by: caller,
    });
}

// ==============================================================================
// Internal helpers
// ==============================================================================
/// Check if user is an admin
fun is_admin(project: &Project, manager: &ProjectManagerCap): bool {
    return manager.project_id == object::id(project)
}
