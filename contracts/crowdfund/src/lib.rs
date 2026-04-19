#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol};

#[contract]
pub struct CrowdfundContract;

const TOTAL_RAISED: Symbol = symbol_short!("TOTAL");
const TARGET_GOAL: Symbol = symbol_short!("TARGET");

#[contractimpl]
impl CrowdfundContract {
    /// Initialize the contract with a target goal (in stroops)
    pub fn initialize(env: Env, target: i128) {
        if env.storage().instance().has(&TARGET_GOAL) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&TARGET_GOAL, &target);
        env.storage().instance().set(&TOTAL_RAISED, &0i128);
    }

    /// Record a donation (this logic track virtual totals for Level 2 demo)
    pub fn donate(env: Env, _donor: Address, amount: i128) -> i128 {
        // Authenticate the donor (Standard safety)
        _donor.require_auth();

        // Get current total
        let mut total: i128 = env.storage().instance().get(&TOTAL_RAISED).unwrap_or(0);
        
        // Add new amount
        total += amount;

        // Save back to storage
        env.storage().instance().set(&TOTAL_RAISED, &total);

        // Return the new total
        total
    }

    /// Get the current total amount raised
    pub fn get_total(env: Env) -> i128 {
        env.storage().instance().get(&TOTAL_RAISED).unwrap_or(0)
    }

    /// Get the target goal
    pub fn get_target(env: Env) -> i128 {
        env.storage().instance().get(&TARGET_GOAL).unwrap_or(0)
    }
}
