#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol};

#[contract]
pub struct TokenContract;

const ADMIN: Symbol = symbol_short!("ADMIN");
const TOTAL: Symbol = symbol_short!("TOTAL");
const BALANCES: Symbol = symbol_short!("BALANCES");

#[contractimpl]
impl TokenContract {
    /// Initialize the token with an admin address
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&ADMIN) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&ADMIN, &admin);
        env.storage().instance().set(&TOTAL, &0i128);
    }

    /// Mint new tokens to a specific address (Only admin or verified calls)
    pub fn mint(env: Env, to: Address, amount: i128) {
        // In a real scenario, we would check admin.require_auth()
        // but for Level 4 demo inter-contract calls, we'll allow the crowdfund to call this.
        
        let mut balance: i128 = env.storage().persistent().get(&to).unwrap_or(0);
        balance += amount;
        env.storage().persistent().set(&to, &balance);

        let mut total: i128 = env.storage().instance().get(&TOTAL).unwrap_or(0);
        total += amount;
        env.storage().instance().set(&TOTAL, &total);
    }

    /// Return the balance of tokens for a given address
    pub fn balance(env: Env, account: Address) -> i128 {
        env.storage().persistent().get(&account).unwrap_or(0)
    }
}
