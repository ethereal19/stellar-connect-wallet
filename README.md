# 🌟 StellarPay — Decentralized Crowdfunding dApp

A fully decentralized crowdfunding platform built on the **Stellar Testnet** using **Soroban smart contracts**. Users can create campaigns, donate XLM, and track progress in real-time — all powered by on-chain data.

🌐 Live Demo
https://stellar-connect-wallet-u1hr.vercel.app/
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

## 📜 Smart Contract (Soroban)

*   **Contract ID**: `CC6CATMGJTD5KUYQDJQRIKWXETMLUDLFFZC2CLL5FD3XH27C6GI3EOUG`
*   **Network**: Stellar Testnet
*   **Source**: `contracts/crowdfund/src/lib.rs`

### Contract Functions

| Function | Description | Arguments |
|----------|-------------|-----------|
| `initialize` | Sets the campaign fundraising goal | `target: i128` (in stroops) |
| `donate` | Records a donation to the campaign | `donor: Address, amount: i128` |
| `get_total` | Returns total XLM raised (in stroops) | None |
| `get_target` | Returns the campaign goal (in stroops) | None |

---

## ✅ Tests

### 1. Automated Unit Tests
The project includes 3 passing tests in `src/App.test.js` to ensure stability.
To run them:
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
![Test Suite](./screenshots/Screenshot%202026-04-20%20175114.png)

### 2. Successful Achievement
*Real-time feedback and celebrations when campaign goals are met.*
![Goal Reached](./screenshots/Screenshot%202026-04-20%20175020.png)

---

## 🔗 Transaction Proof (Latest)

**Transaction Hash**: `c5b1662f31268a7cfb2822c8fc59c70a4b27ad6915a3f586463fd7877217a505`
[View on Stellar Explorer](https://stellar.expert/explorer/testnet/tx/c5b1662f31268a7cfb2822c8fc59c70a4b27ad6915a3f586463fd7877217a505)

---

## 📜 License
This project is licensed under the MIT License.
