# 🌟 StellarPay — Decentralized Crowdfunding dApp
![StellarPay CI](https://github.com/ethereal19/stellar-connect-wallet/actions/workflows/ci.yml/badge.svg)


A fully decentralized crowdfunding platform built on the **Stellar Testnet** using **Soroban smart contracts**. Users can create campaigns, donate XLM, and track progress in real-time — all powered by on-chain data.

🌐 Live Demo
*   **Web App**: [https://stellar-connect-wallet-one.vercel.app/](https://stellar-connect-wallet-one.vercel.app/)
*   **Video Demo**: [Watch the walkthrough here](https://drive.google.com/file/d/17gIi4HeI9REHO2JPc58ZyvLEI67I26Uh/view)

---

### 🔑 Quick Reference (Testnet)
| Contract | ID |
|----------|----|
| **Crowdfund** | `CDWXS6ITLHDH666GUQQ2H2HPM7K7YYKZLMLYFIMZU7AO4TL27625UUQ4` |
| **SFUND Token** | `CDKK7RCL5HO74IL5RCSAONUYSVHDOBLZTPCK6DPRZVEDMFHMBZKZEOIL` |

---

## ✨ Features

*   **Wallet Integration**: Full support for Freighter wallet and StellarWalletsKit (Albedo, xBull).
*   **Live Balance Fetching**: Real-time XLM balance from the Stellar Horizon server.
*   **Crowdfunding dApp**: Decentralized crowdfunding with on-chain campaign initialization, donations, and progress tracking via Soroban smart contracts.
*   **Withdrawal System**: Secure withdrawal functionality allowing users to send raised XLM to destination addresses.
*   **Transaction Verification**: Each transaction produces a hash that can be verified on the Stellar blockchain explorer.
*   **Visual Test Suite**: In-app test runner with 7 visual test cases for contract logic (Goal setting, validation, etc.).
*   **Premium UI**: Sleek glassmorphism dark theme with loading spinners, progress bars, and micro-animations.
*   **Automated Tests**: 3 comprehensive React unit tests ensuring stable rendering and robust input validation.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js |
| Blockchain | Stellar SDK (`@stellar/stellar-sdk`) |
| Smart Contract | Soroban (Rust) |
| Wallet API | StellarWalletsKit + Freighter API |
| Network | Stellar Testnet |
| Styling | Vanilla CSS (Glassmorphism) |

---

## 📜 Smart Contracts (Soroban)

### Crowdfund Contract (v3)
*   **Contract ID**: `CDWXS6ITLHDH666GUQQ2H2HPM7K7YYKZLMLYFIMZU7AO4TL27625UUQ4`
*   **Explorer**: [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CDWXS6ITLHDH666GUQQ2H2HPM7K7YYKZLMLYFIMZU7AO4TL27625UUQ4)
*   **Source**: `contracts/crowdfund/src/lib.rs`

| Function | Description | Arguments |
|----------|-------------|-----------|
| `initialize` | Sets goal and links SFUND token | `target: i128, token_id: Address` |
| `donate` | Records donation + mints SFUND tokens (inter-contract call) | `donor: Address, amount: i128` |
| `get_total` | Returns total XLM raised (in stroops) | None |
| `get_target` | Returns the campaign goal (in stroops) | None |
| `get_token` | Returns the linked SFUND token contract ID | None |

### SFUND Token Contract (v3)
*   **Contract ID**: `CDKK7RCL5HO74IL5RCSAONUYSVHDOBLZTPCK6DPRZVEDMFHMBZKZEOIL`
*   **Explorer**: [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CDKK7RCL5HO74IL5RCSAONUYSVHDOBLZTPCK6DPRZVEDMFHMBZKZEOIL)
*   **Source**: `contracts/token/src/lib.rs`

| Function | Description | Arguments |
|----------|-------------|-----------|
| `initialize` | Sets the admin address | `admin: Address` |
| `mint` | Creates SFUND tokens for a recipient | `to: Address, amount: i128` |
| `balance` | Returns SFUND balance for an address | `account: Address` |
| `transfer` | Transfers tokens between accounts (Proof) | `from: Address, to: Address, amount: i128` |

### ⛓️ Inter-Contract Call Flow
```
User donates XLM → Crowdfund.donate() → records total → calls Token.mint() → SFUND tokens sent to donor
```

---

## ✅ Tests

### 1. Automated Unit Tests
The project includes 8 passing tests across 3 modules (App, Crowdfund, and Payment). 

**Terminal Output Proof:**
```text
PASS  src/App.test.js
PASS  src/components/Crowdfund.test.js
PASS  src/components/Payment.test.js

Test Suites: 3 passed, 3 total
Tests:       8 passed, 8 total
Snapshots:   0 total
Time:        9.644 s
Ran all test suites.
```

To run tests locally:
```bash
npm test -- --watchAll=false
```

### 2. In-App Visual Test Suite
Located at the bottom of the Crowdfund page, this suite validates 7 contract scenarios:
*   Initial state verification
*   Goal storage accuracy
*   Input validation for donations
*   Remaining balance calculations

---

## ⚙️ Setup Instructions

### 1. Prerequisites
*   [Node.js](https://nodejs.org/) (v16+)
*   [Freighter Wallet](https://www.freighter.app/) extension (Set to **Testnet**)

### 2. Install & Run
```bash
git clone https://github.com/ethereal19/stellar-connect-wallet.git
cd stellar-connect-wallet
npm install
npm start
```
The app will be available at `http://localhost:3000`.

### 3. Fund Your Wallet
IMPORTANT: To interact with the contract, you need Testnet XLM. Use the [Stellar Friendbot](https://laboratory.stellar.org/#account-creator?network=testnet) to fund your public key.

---

## 🛡 Error Handling

| Error | User Feedback |
|-------|---------------|
| Wallet not connected | "⚠️ Connect your wallet first." |
| Invalid input | "⚠️ Enter a valid donation amount." |
| Insufficient balance | "❌ Insufficient funds. You have X XLM." |
| Donation exceeds goal | "❌ Exceeds goal. Max donation: X XLM." |
| Transaction rejected | "❌ Transaction rejected by wallet." |
| Already initialized | "This campaign has already been started." |

---

## 📸 Screenshots

### 1. New Visual Test Suite
*Real-time validation of contract logic inside the dApp.*
![Test Suite](./screenshots/Screenshot%202026-04-21%20140559.png)

![Goal Reached](./screenshots/Screenshot%202026-04-19%20220027.png)

### 2. Mobile Responsive View
*The dApp is fully responsive across mobile, tablet, and desktop devices.*
![Mobile View](./screenshots/Screenshot%202026-04-19%20231538.png)


### 3. Level 4 Verification: Inter-Contract Calls
*Proof of the Crowdfund contract successfully calling the SFUND Token contract's `mint` function.*
![Inter-Contract Call](./screenshots/Screenshot%202026-04-22%20170519.png)

### 4. Custom Token Proof: SFUND Transfer
*Verification of the SFUND token contract on Stellar Expert.*
![Token Transfer](./screenshots/Screenshot%202026-04-22%20171619.png)

---

## 🔗 Transaction Proof (Latest)

**Transaction Hash**: `ff4c5a22823c0a0db8dc253e006c22ccc3dcf6807816e200a786a7c3e0331ee6`
[View on Stellar Explorer](https://stellar.expert/explorer/testnet/tx/ff4c5a22823c0a0db8dc253e006c22ccc3dcf6807816e200a786a7c3e0331ee6)

---

## 📜 License
This project is licensed under the MIT License.
