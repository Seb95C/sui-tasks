#[test_only]
module jira_engine::project_tests;

use jira_engine::project::{Self, Project, ProjectManagerCap};
use jira_engine::username_registry::{Self, UsernameRegistry};
use sui::test_scenario::{Self as ts, Scenario};
use sui::clock::{Self, Clock};
use sui::test_utils;
use std::string;

// Test addresses
const ADMIN: address = @0xAD;
const MEMBER1: address = @0xB0B;
const MEMBER2: address = @0xCA7;
const NON_MEMBER: address = @0xBAD;

// ==============================================================================
// Test Setup Helpers
// ==============================================================================

fun setup_registry(scenario: &mut Scenario) {
    ts::next_tx(scenario, ADMIN);
    {
        username_registry::register_username(
            ts::take_shared<UsernameRegistry>(scenario),
            string::utf8(b"admin"),
            ts::ctx(scenario)
        );
    };
    ts::return_shared(ts::take_shared<UsernameRegistry>(scenario));
}

fun register_user(scenario: &mut Scenario, user: address, username: vector<u8>) {
    ts::next_tx(scenario, user);
    {
        let mut registry = ts::take_shared<UsernameRegistry>(scenario);
        username_registry::register_username(
            &mut registry,
            string::utf8(username),
            ts::ctx(scenario)
        );
        ts::return_shared(registry);
    };
}

fun create_test_project(scenario: &mut Scenario, creator: address): ID {
    ts::next_tx(scenario, creator);
    let project_id;
    {
        let registry = ts::take_shared<UsernameRegistry>(scenario);
        let clock = ts::take_shared<Clock>(scenario);

        project::mint_project(
            &registry,
            string::utf8(b"Test Project"),
            string::utf8(b"Admin"),
            &clock,
            ts::ctx(scenario)
        );

        ts::return_shared(registry);
        ts::return_shared(clock);
    };

    ts::next_tx(scenario, creator);
    {
        let project = ts::take_shared<Project>(scenario);
        project_id = object::id(&project);
        ts::return_shared(project);
    };

    project_id
}

// ==============================================================================
// Project Creation Tests
// ==============================================================================

#[test]
fun test_mint_project_success() {
    let mut scenario = ts::begin(ADMIN);

    // Initialize clock and registry
    clock::share_for_testing(clock::create_for_testing(ts::ctx(&mut scenario)));

    register_user(&mut scenario, ADMIN, b"admin");

    ts::next_tx(&mut scenario, ADMIN);
    {
        let registry = ts::take_shared<UsernameRegistry>(&scenario);
        let clock = ts::take_shared<Clock>(&scenario);

        project::mint_project(
            &registry,
            string::utf8(b"My Project"),
            string::utf8(b"Admin"),
            &clock,
            ts::ctx(&mut scenario)
        );

        ts::return_shared(registry);
        ts::return_shared(clock);
    };

    // Verify project was created and shared
    ts::next_tx(&mut scenario, ADMIN);
    {
        assert!(ts::has_most_recent_shared<Project>(), 0);
        let project = ts::take_shared<Project>(&scenario);
        assert!(project::get_manager(&project) == ADMIN, 1);
        ts::return_shared(project);
    };

    // Verify manager cap was transferred
    ts::next_tx(&mut scenario, ADMIN);
    {
        assert!(ts::has_most_recent_for_address<ProjectManagerCap>(ADMIN), 2);
    };

    ts::end(scenario);
}

#[test]
#[expected_failure(abort_code = project::E_NOT_REGISTERED)]
fun test_mint_project_not_registered() {
    let mut scenario = ts::begin(ADMIN);

    clock::share_for_testing(clock::create_for_testing(ts::ctx(&mut scenario)));

    // Don't register the user
    ts::next_tx(&mut scenario, ADMIN);
    {
        let registry = ts::take_shared<UsernameRegistry>(&scenario);
        let clock = ts::take_shared<Clock>(&scenario);

        // Should fail - user not registered
        project::mint_project(
            &registry,
            string::utf8(b"My Project"),
            string::utf8(b"Admin"),
            &clock,
            ts::ctx(&mut scenario)
        );

        ts::return_shared(registry);
        ts::return_shared(clock);
    };

    ts::end(scenario);
}

// ==============================================================================
// Member Management Tests
// ==============================================================================

#[test]
fun test_add_member_success() {
    let mut scenario = ts::begin(ADMIN);
    clock::share_for_testing(clock::create_for_testing(ts::ctx(&mut scenario)));

    register_user(&mut scenario, ADMIN, b"admin");
    register_user(&mut scenario, MEMBER1, b"member1");

    let _project_id = create_test_project(&mut scenario, ADMIN);

    ts::next_tx(&mut scenario, ADMIN);
    {
        let mut project = ts::take_shared<Project>(&scenario);
        let manager_cap = ts::take_from_sender<ProjectManagerCap>(&scenario);
        let registry = ts::take_shared<UsernameRegistry>(&scenario);
        let clock = ts::take_shared<Clock>(&scenario);

        project::add_member(
            &manager_cap,
            &registry,
            &mut project,
            MEMBER1,
            string::utf8(b"Member One"),
            &clock,
            ts::ctx(&mut scenario)
        );

        assert!(project::is_member(&project, MEMBER1), 0);

        ts::return_shared(project);
        ts::return_to_sender(&scenario, manager_cap);
        ts::return_shared(registry);
        ts::return_shared(clock);
    };

    ts::end(scenario);
}

#[test]
#[expected_failure(abort_code = project::E_NOT_REGISTERED)]
fun test_add_member_not_registered() {
    let mut scenario = ts::begin(ADMIN);
    clock::share_for_testing(clock::create_for_testing(ts::ctx(&mut scenario)));

    register_user(&mut scenario, ADMIN, b"admin");
    // Don't register MEMBER1

    let _project_id = create_test_project(&mut scenario, ADMIN);

    ts::next_tx(&mut scenario, ADMIN);
    {
        let mut project = ts::take_shared<Project>(&scenario);
        let manager_cap = ts::take_from_sender<ProjectManagerCap>(&scenario);
        let registry = ts::take_shared<UsernameRegistry>(&scenario);
        let clock = ts::take_shared<Clock>(&scenario);

        // Should fail - MEMBER1 not registered
        project::add_member(
            &manager_cap,
            &registry,
            &mut project,
            MEMBER1,
            string::utf8(b"Member One"),
            &clock,
            ts::ctx(&mut scenario)
        );

        ts::return_shared(project);
        ts::return_to_sender(&scenario, manager_cap);
        ts::return_shared(registry);
        ts::return_shared(clock);
    };

    ts::end(scenario);
}

#[test]
fun test_remove_member() {
    let mut scenario = ts::begin(ADMIN);
    clock::share_for_testing(clock::create_for_testing(ts::ctx(&mut scenario)));

    register_user(&mut scenario, ADMIN, b"admin");
    register_user(&mut scenario, MEMBER1, b"member1");

    let _project_id = create_test_project(&mut scenario, ADMIN);

    // Add member
    ts::next_tx(&mut scenario, ADMIN);
    {
        let mut project = ts::take_shared<Project>(&scenario);
        let manager_cap = ts::take_from_sender<ProjectManagerCap>(&scenario);
        let registry = ts::take_shared<UsernameRegistry>(&scenario);
        let clock = ts::take_shared<Clock>(&scenario);

        project::add_member(
            &manager_cap,
            &registry,
            &mut project,
            MEMBER1,
            string::utf8(b"Member One"),
            &clock,
            ts::ctx(&mut scenario)
        );

        ts::return_shared(project);
        ts::return_to_sender(&scenario, manager_cap);
        ts::return_shared(registry);
        ts::return_shared(clock);
    };

    // Remove member
    ts::next_tx(&mut scenario, ADMIN);
    {
        let mut project = ts::take_shared<Project>(&scenario);
        let manager_cap = ts::take_from_sender<ProjectManagerCap>(&scenario);

        project::remove_member(
            &manager_cap,
            &mut project,
            MEMBER1,
            ts::ctx(&mut scenario)
        );

        assert!(!project::is_member(&project, MEMBER1), 0);

        ts::return_shared(project);
        ts::return_to_sender(&scenario, manager_cap);
    };

    ts::end(scenario);
}

// ==============================================================================
// Task Management Tests
// ==============================================================================

#[test]
fun test_manager_add_task() {
    let mut scenario = ts::begin(ADMIN);
    clock::share_for_testing(clock::create_for_testing(ts::ctx(&mut scenario)));

    register_user(&mut scenario, ADMIN, b"admin");
    register_user(&mut scenario, MEMBER1, b"member1");

    let _project_id = create_test_project(&mut scenario, ADMIN);

    // Add member first
    ts::next_tx(&mut scenario, ADMIN);
    {
        let mut project = ts::take_shared<Project>(&scenario);
        let manager_cap = ts::take_from_sender<ProjectManagerCap>(&scenario);
        let registry = ts::take_shared<UsernameRegistry>(&scenario);
        let clock = ts::take_shared<Clock>(&scenario);

        project::add_member(
            &manager_cap,
            &registry,
            &mut project,
            MEMBER1,
            string::utf8(b"Member One"),
            &clock,
            ts::ctx(&mut scenario)
        );

        ts::return_shared(project);
        ts::return_to_sender(&scenario, manager_cap);
        ts::return_shared(registry);
        ts::return_shared(clock);
    };

    // Add task
    ts::next_tx(&mut scenario, ADMIN);
    {
        let mut project = ts::take_shared<Project>(&scenario);
        let manager_cap = ts::take_from_sender<ProjectManagerCap>(&scenario);

        project::add_task(
            &manager_cap,
            &mut project,
            string::utf8(b"Task 1"),
            string::utf8(b"Description"),
            MEMBER1,
            0,
            1000,
            ts::ctx(&mut scenario)
        );

        ts::return_shared(project);
        ts::return_to_sender(&scenario, manager_cap);
    };

    ts::end(scenario);
}

#[test]
fun test_member_create_task() {
    let mut scenario = ts::begin(ADMIN);
    clock::share_for_testing(clock::create_for_testing(ts::ctx(&mut scenario)));

    register_user(&mut scenario, ADMIN, b"admin");
    register_user(&mut scenario, MEMBER1, b"member1");

    let _project_id = create_test_project(&mut scenario, ADMIN);

    // Add member
    ts::next_tx(&mut scenario, ADMIN);
    {
        let mut project = ts::take_shared<Project>(&scenario);
        let manager_cap = ts::take_from_sender<ProjectManagerCap>(&scenario);
        let registry = ts::take_shared<UsernameRegistry>(&scenario);
        let clock = ts::take_shared<Clock>(&scenario);

        project::add_member(
            &manager_cap,
            &registry,
            &mut project,
            MEMBER1,
            string::utf8(b"Member One"),
            &clock,
            ts::ctx(&mut scenario)
        );

        ts::return_shared(project);
        ts::return_to_sender(&scenario, manager_cap);
        ts::return_shared(registry);
        ts::return_shared(clock);
    };

    // Member creates task for themselves
    ts::next_tx(&mut scenario, MEMBER1);
    {
        let mut project = ts::take_shared<Project>(&scenario);

        project::member_create_task(
            &mut project,
            string::utf8(b"My Task"),
            string::utf8(b"Self-assigned task"),
            0,
            2000,
            ts::ctx(&mut scenario)
        );

        ts::return_shared(project);
    };

    ts::end(scenario);
}

#[test]
#[expected_failure(abort_code = project::E_NOT_AUTHORIZED)]
fun test_member_create_task_not_member() {
    let mut scenario = ts::begin(ADMIN);
    clock::share_for_testing(clock::create_for_testing(ts::ctx(&mut scenario)));

    register_user(&mut scenario, ADMIN, b"admin");
    register_user(&mut scenario, NON_MEMBER, b"nonmember");

    let _project_id = create_test_project(&mut scenario, ADMIN);

    // Non-member tries to create task
    ts::next_tx(&mut scenario, NON_MEMBER);
    {
        let mut project = ts::take_shared<Project>(&scenario);

        // Should fail - not a member
        project::member_create_task(
            &mut project,
            string::utf8(b"Task"),
            string::utf8(b"Description"),
            0,
            2000,
            ts::ctx(&mut scenario)
        );

        ts::return_shared(project);
    };

    ts::end(scenario);
}

// ==============================================================================
// Subtask Tests
// ==============================================================================

#[test]
fun test_manager_add_subtask() {
    let mut scenario = ts::begin(ADMIN);
    clock::share_for_testing(clock::create_for_testing(ts::ctx(&mut scenario)));

    register_user(&mut scenario, ADMIN, b"admin");

    let _project_id = create_test_project(&mut scenario, ADMIN);

    let task_id;

    // Add task
    ts::next_tx(&mut scenario, ADMIN);
    {
        let mut project = ts::take_shared<Project>(&scenario);
        let manager_cap = ts::take_from_sender<ProjectManagerCap>(&scenario);

        project::add_task(
            &manager_cap,
            &mut project,
            string::utf8(b"Main Task"),
            string::utf8(b"Description"),
            ADMIN,
            0,
            1000,
            ts::ctx(&mut scenario)
        );

        task_id = /* get task ID from project */;

        ts::return_shared(project);
        ts::return_to_sender(&scenario, manager_cap);
    };

    // Add subtask
    ts::next_tx(&mut scenario, ADMIN);
    {
        let mut project = ts::take_shared<Project>(&scenario);
        let manager_cap = ts::take_from_sender<ProjectManagerCap>(&scenario);

        project::manager_add_subtask(
            &manager_cap,
            &mut project,
            task_id,
            string::utf8(b"Subtask 1"),
            string::utf8(b"Subtask description"),
            0,
            ts::ctx(&mut scenario)
        );

        ts::return_shared(project);
        ts::return_to_sender(&scenario, manager_cap);
    };

    ts::end(scenario);
}

// ==============================================================================
// Attachment Tests
// ==============================================================================

#[test]
fun test_manager_add_attachment() {
    let mut scenario = ts::begin(ADMIN);
    clock::share_for_testing(clock::create_for_testing(ts::ctx(&mut scenario)));

    register_user(&mut scenario, ADMIN, b"admin");

    let _project_id = create_test_project(&mut scenario, ADMIN);

    let task_id;

    // Add task
    ts::next_tx(&mut scenario, ADMIN);
    {
        let mut project = ts::take_shared<Project>(&scenario);
        let manager_cap = ts::take_from_sender<ProjectManagerCap>(&scenario);

        project::add_task(
            &manager_cap,
            &mut project,
            string::utf8(b"Task with Attachment"),
            string::utf8(b"Description"),
            ADMIN,
            0,
            1000,
            ts::ctx(&mut scenario)
        );

        task_id = /* get task ID */;

        ts::return_shared(project);
        ts::return_to_sender(&scenario, manager_cap);
    };

    // Add attachment
    ts::next_tx(&mut scenario, ADMIN);
    {
        let mut project = ts::take_shared<Project>(&scenario);
        let manager_cap = ts::take_from_sender<ProjectManagerCap>(&scenario);

        project::manager_add_attachment(
            &manager_cap,
            &mut project,
            task_id,
            string::utf8(b"Design Doc"),
            string::utf8(b"https://example.com/doc.pdf"),
            ts::ctx(&mut scenario)
        );

        ts::return_shared(project);
        ts::return_to_sender(&scenario, manager_cap);
    };

    ts::end(scenario);
}

#[test]
fun test_assignee_add_attachment() {
    let mut scenario = ts::begin(ADMIN);
    clock::share_for_testing(clock::create_for_testing(ts::ctx(&mut scenario)));

    register_user(&mut scenario, ADMIN, b"admin");
    register_user(&mut scenario, MEMBER1, b"member1");

    let _project_id = create_test_project(&mut scenario, ADMIN);

    // Add member
    ts::next_tx(&mut scenario, ADMIN);
    {
        let mut project = ts::take_shared<Project>(&scenario);
        let manager_cap = ts::take_from_sender<ProjectManagerCap>(&scenario);
        let registry = ts::take_shared<UsernameRegistry>(&scenario);
        let clock = ts::take_shared<Clock>(&scenario);

        project::add_member(
            &manager_cap,
            &registry,
            &mut project,
            MEMBER1,
            string::utf8(b"Member One"),
            &clock,
            ts::ctx(&mut scenario)
        );

        ts::return_shared(project);
        ts::return_to_sender(&scenario, manager_cap);
        ts::return_shared(registry);
        ts::return_shared(clock);
    };

    let task_id;

    // Member creates task
    ts::next_tx(&mut scenario, MEMBER1);
    {
        let mut project = ts::take_shared<Project>(&scenario);

        project::member_create_task(
            &mut project,
            string::utf8(b"My Task"),
            string::utf8(b"Description"),
            0,
            2000,
            ts::ctx(&mut scenario)
        );

        task_id = /* get task ID */;

        ts::return_shared(project);
    };

    // Member adds attachment to their task
    ts::next_tx(&mut scenario, MEMBER1);
    {
        let mut project = ts::take_shared<Project>(&scenario);

        project::assignee_add_attachment(
            &mut project,
            task_id,
            string::utf8(b"Screenshot"),
            string::utf8(b"https://example.com/screenshot.png"),
            ts::ctx(&mut scenario)
        );

        ts::return_shared(project);
    };

    ts::end(scenario);
}

// ==============================================================================
// Task Update Tests
// ==============================================================================

#[test]
fun test_manager_update_task_name() {
    let mut scenario = ts::begin(ADMIN);
    clock::share_for_testing(clock::create_for_testing(ts::ctx(&mut scenario)));

    register_user(&mut scenario, ADMIN, b"admin");

    let _project_id = create_test_project(&mut scenario, ADMIN);

    let task_id;

    // Add task
    ts::next_tx(&mut scenario, ADMIN);
    {
        let mut project = ts::take_shared<Project>(&scenario);
        let manager_cap = ts::take_from_sender<ProjectManagerCap>(&scenario);

        project::add_task(
            &manager_cap,
            &mut project,
            string::utf8(b"Original Name"),
            string::utf8(b"Description"),
            ADMIN,
            0,
            1000,
            ts::ctx(&mut scenario)
        );

        task_id = /* get task ID */;

        ts::return_shared(project);
        ts::return_to_sender(&scenario, manager_cap);
    };

    // Update task name
    ts::next_tx(&mut scenario, ADMIN);
    {
        let mut project = ts::take_shared<Project>(&scenario);
        let manager_cap = ts::take_from_sender<ProjectManagerCap>(&scenario);

        project::manager_update_task_name(
            &manager_cap,
            &mut project,
            task_id,
            string::utf8(b"Updated Name"),
            ts::ctx(&mut scenario)
        );

        ts::return_shared(project);
        ts::return_to_sender(&scenario, manager_cap);
    };

    ts::end(scenario);
}

#[test]
fun test_member_update_own_task() {
    let mut scenario = ts::begin(ADMIN);
    clock::share_for_testing(clock::create_for_testing(ts::ctx(&mut scenario)));

    register_user(&mut scenario, ADMIN, b"admin");
    register_user(&mut scenario, MEMBER1, b"member1");

    let _project_id = create_test_project(&mut scenario, ADMIN);

    // Add member
    ts::next_tx(&mut scenario, ADMIN);
    {
        let mut project = ts::take_shared<Project>(&scenario);
        let manager_cap = ts::take_from_sender<ProjectManagerCap>(&scenario);
        let registry = ts::take_shared<UsernameRegistry>(&scenario);
        let clock = ts::take_shared<Clock>(&scenario);

        project::add_member(
            &manager_cap,
            &registry,
            &mut project,
            MEMBER1,
            string::utf8(b"Member One"),
            &clock,
            ts::ctx(&mut scenario)
        );

        ts::return_shared(project);
        ts::return_to_sender(&scenario, manager_cap);
        ts::return_shared(registry);
        ts::return_shared(clock);
    };

    let task_id;

    // Member creates task
    ts::next_tx(&mut scenario, MEMBER1);
    {
        let mut project = ts::take_shared<Project>(&scenario);

        project::member_create_task(
            &mut project,
            string::utf8(b"My Task"),
            string::utf8(b"Description"),
            0,
            2000,
            ts::ctx(&mut scenario)
        );

        task_id = /* get task ID */;

        ts::return_shared(project);
    };

    // Member updates their own task
    ts::next_tx(&mut scenario, MEMBER1);
    {
        let mut project = ts::take_shared<Project>(&scenario);

        project::member_update_task_name(
            &mut project,
            task_id,
            string::utf8(b"Updated Task Name"),
            ts::ctx(&mut scenario)
        );

        ts::return_shared(project);
    };

    ts::end(scenario);
}

#[test]
#[expected_failure(abort_code = project::E_NOT_TASK_ASSIGNEE)]
fun test_member_cannot_update_other_task() {
    let mut scenario = ts::begin(ADMIN);
    clock::share_for_testing(clock::create_for_testing(ts::ctx(&mut scenario)));

    register_user(&mut scenario, ADMIN, b"admin");
    register_user(&mut scenario, MEMBER1, b"member1");
    register_user(&mut scenario, MEMBER2, b"member2");

    let _project_id = create_test_project(&mut scenario, ADMIN);

    // Add members
    ts::next_tx(&mut scenario, ADMIN);
    {
        let mut project = ts::take_shared<Project>(&scenario);
        let manager_cap = ts::take_from_sender<ProjectManagerCap>(&scenario);
        let registry = ts::take_shared<UsernameRegistry>(&scenario);
        let clock = ts::take_shared<Clock>(&scenario);

        project::add_member(
            &manager_cap,
            &registry,
            &mut project,
            MEMBER1,
            string::utf8(b"Member One"),
            &clock,
            ts::ctx(&mut scenario)
        );

        project::add_member(
            &manager_cap,
            &registry,
            &mut project,
            MEMBER2,
            string::utf8(b"Member Two"),
            &clock,
            ts::ctx(&mut scenario)
        );

        ts::return_shared(project);
        ts::return_to_sender(&scenario, manager_cap);
        ts::return_shared(registry);
        ts::return_shared(clock);
    };

    let task_id;

    // MEMBER1 creates task
    ts::next_tx(&mut scenario, MEMBER1);
    {
        let mut project = ts::take_shared<Project>(&scenario);

        project::member_create_task(
            &mut project,
            string::utf8(b"Member1's Task"),
            string::utf8(b"Description"),
            0,
            2000,
            ts::ctx(&mut scenario)
        );

        task_id = /* get task ID */;

        ts::return_shared(project);
    };

    // MEMBER2 tries to update MEMBER1's task - should fail
    ts::next_tx(&mut scenario, MEMBER2);
    {
        let mut project = ts::take_shared<Project>(&scenario);

        project::member_update_task_name(
            &mut project,
            task_id,
            string::utf8(b"Hacked Name"),
            ts::ctx(&mut scenario)
        );

        ts::return_shared(project);
    };

    ts::end(scenario);
}
