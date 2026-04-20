#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

#[test]
fn test_initialize() {
    let env = Env::default();
    let contract_id = env.register_contract(None, CrowdfundContract);
    let client = CrowdfundContractClient::new(&env, &contract_id);

    client.initialize(&1000);
    assert_eq!(client.get_target(), 1000);
    assert_eq!(client.get_total(), 0);
}

#[test]
fn test_donate() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register_contract(None, CrowdfundContract);
    let client = CrowdfundContractClient::new(&env, &contract_id);

    let donor = Address::generate(&env);

    client.initialize(&1000);
    client.donate(&donor, &500);

    assert_eq!(client.get_total(), 500);
    
    client.donate(&donor, &250);
    assert_eq!(client.get_total(), 750);
}

#[test]
fn test_get_target_uninitialized() {
    let env = Env::default();
    let contract_id = env.register_contract(None, CrowdfundContract);
    let client = CrowdfundContractClient::new(&env, &contract_id);

    assert_eq!(client.get_target(), 0);
}
