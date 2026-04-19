# 🌟 StellarPay — Decentralized Crowdfunding dApp

A fully decentralized crowdfunding platform built on the **Stellar Testnet** using **Soroban smart contracts**. Users can create campaigns, donate XLM, and track progress in real-time — all powered by on-chain data.



🌐 Live Demo
https://stellar-connect-wallet-u1hr.vercel.app/
---

## ✨ Features

*   **Wallet Integration**: Full support for Freighter wallet and StellarWalletsKit (Albedo, xBull).
*   **Live Balance Fetching**: Real-time XLM balance from the Stellar Horizon server.
*   **Crowdfunding dApp**: Decentralized crowdfunding with on-chain campaign initialization, donations, and progress tracking via Soroban smart contracts.
*   **Transaction Verification**: Each transaction produces a hash that can be verified on the Stellar blockchain explorer.
*   **Data Persistence**: All campaign data (goal, total raised) is stored on-chain and persists across page refreshes.
*   **Advanced Error Handling**: Clear feedback for wallet disconnection, insufficient funds, and rejected transactions.
*   **Rate Limit Protection**: Built-in 120-second cooldown with request deduplication and caching.
*   **Premium UI**: Sleek glassmorphism dark theme with loading spinners, progress bars, and micro-animations.

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

*   **Contract ID**: `CDCCIQ2KVLRFU5GEXGGHTFE5ICCRUZ77H2SFFBNCYFKNCSMGGPQYPLUH`
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

## ⚙️ Setup Instructions

### 1. Prerequisites
*   [Node.js](https://nodejs.org/) (v16+)
*   [Freighter Wallet](https://www.freighter.app/) browser extension (set to **Testnet**)

### 2. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/stellar-connect-wallet.git
cd stellar-connect-wallet
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run the Application
```bash
npm start
```
The app will be available at `http://localhost:3000`.

### 5. Fund Your Wallet
Fund your Testnet account using the [Stellar Friendbot](https://laboratory.stellar.org/#account-creator?network=testnet).

---

## 🔄 Application Flow

```
User Action → Smart Contract → Blockchain → Fetch Data → UI Update
```

1. **Connect Wallet** → Freighter provides the user's public key
2. **Start Campaign** → Calls `initialize(goal)` on the Soroban contract
3. **Donate** → Calls `donate(donor, amount)` on the contract
4. **Fetch Data** → Simulates `get_target()` and `get_total()` to read on-chain state
5. **Verify** → Transaction hash links directly to Stellar Explorer

---

## 🛡 Error Handling

| Error | User Feedback |
|-------|---------------|
| Wallet not connected | "⚠️ Connect your wallet first." |
| Invalid input | "⚠️ Enter a valid donation amount." |
| Insufficient balance | "❌ Insufficient funds. You have X XLM." |
| Donation exceeds goal | "❌ Exceeds goal. Max donation: X XLM." |
| Transaction rejected | "❌ Transaction rejected by wallet." |
| Rate limited (429) | 120-second automatic cooldown |
| Already initialized | "This campaign has already been started." |

---

## 📸 Screenshots

### 1. Wallet Connected State
*Connect button transforms into a secure wallet indicator.*
![Connected State](./screenshots/Screenshot%202026-04-15%20202000.png)

### 2. Campaign Dashboard
*Live campaign stats fetched directly from the Soroban smart contract.*
![Balance Displayed](./screenshots/Screenshot%202026-04-15%20202000.png)

### 3. Successful Donation
*Transaction signing and submission via Freighter with hash verification.*
![Successful Transaction](./screenshots/Screenshot%202026-04-15%20202151.png)

### 4. Transaction Verification
*Each transaction can be verified on the Stellar blockchain explorer.*
![Transaction Result](./screenshots/Screenshot%202026-04-15%20202224.png)

---

## 🔗 Transaction Proof

Each transaction can be verified on the Stellar blockchain explorer. Here is a sample transaction hash from a successful campaign donation:

**Transaction Hash**: `b36ecfbd873a78f34b429ed9c16dcd513623cd85fe0defbd81c21510da697ce1`

[View on Stellar Explorer]
https://stellar.expert/explorer/testnet/tx/b36ecfbd873a78f34b429ed9c16dcd513623cd85fe0defbd81c21510da697ce1

```

---

## 📜 License
This project is licensed under the MIT License.
