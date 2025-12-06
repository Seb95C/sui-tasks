module jira_engine::username_registry;

use std::string::{Self, String};
use sui::event;
use sui::table::{Self, Table};

// ==============================================================================
// Error codes
// ==============================================================================
const E_USERNAME_TAKEN: u64 = 100;
const E_ALREADY_REGISTERED: u64 = 101;
const E_USERNAME_NOT_FOUND: u64 = 102;
const E_INVALID_USERNAME: u64 = 103;

// ==============================================================================
// Events
// ==============================================================================
public struct UsernameRegistered has copy, drop {
    username: String,
    user_address: address,
}

// ==============================================================================
// Structures
// ==============================================================================

/// Global registry mapping usernames to addresses
public struct UsernameRegistry has key {
    id: UID,
    username_to_address: Table<String, address>,
    address_to_username: Table<address, String>,
    total_users: u64,
}

// ==============================================================================
// Initialization
// ==============================================================================

/// Initialize the registry (runs once on publish)
fun init(ctx: &mut TxContext) {
    let registry = UsernameRegistry {
        id: object::new(ctx),
        username_to_address: table::new(ctx),
        address_to_username: table::new(ctx),
        total_users: 0,
    };
    transfer::share_object(registry);
}

// ==============================================================================
// Public functions
// ==============================================================================

/// Register a username (called by user after connecting wallet)
public fun register_username(registry: &mut UsernameRegistry, username: String, ctx: &TxContext) {
    let sender = ctx.sender();

    // Validate username length
    assert!(string::length(&username) >= 3, E_INVALID_USERNAME);
    assert!(string::length(&username) <= 20, E_INVALID_USERNAME);

    // Check username not taken
    assert!(!table::contains(&registry.username_to_address, username), E_USERNAME_TAKEN);

    // Check user hasn't registered already
    assert!(!table::contains(&registry.address_to_username, sender), E_ALREADY_REGISTERED);

    // Register bidirectional mapping
    table::add(&mut registry.username_to_address, username, sender);
    table::add(&mut registry.address_to_username, sender, username);
    registry.total_users = registry.total_users + 1;

    // Emit event
    event::emit(UsernameRegistered {
        username,
        user_address: sender,
    });
}

/// Lookup address by username
public fun get_address(registry: &UsernameRegistry, username: String): address {
    assert!(table::contains(&registry.username_to_address, username), E_USERNAME_NOT_FOUND);
    *table::borrow(&registry.username_to_address, username)
}

/// Get username by address (returns empty string if not registered)
public fun get_username(registry: &UsernameRegistry, addr: address): String {
    if (table::contains(&registry.address_to_username, addr)) {
        *table::borrow(&registry.address_to_username, addr)
    } else {
        string::utf8(b"")
    }
}

/// Check if username is available
public fun is_username_available(registry: &UsernameRegistry, username: String): bool {
    !table::contains(&registry.username_to_address, username)
}

/// Check if address has registered
public fun has_registered(registry: &UsernameRegistry, addr: address): bool {
    table::contains(&registry.address_to_username, addr)
}

/// Get total registered users
public fun get_total_users(registry: &UsernameRegistry): u64 {
    registry.total_users
}
