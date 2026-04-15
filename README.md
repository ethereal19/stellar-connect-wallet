# 🚀 StellarPay — Simple Payment dApp

StellarPay is a high-performance, modern decentralized application (dApp) built on the Stellar network. It allows users to securely connect their Freighter wallet, check their XLM balance, and send payments on the Stellar Testnet with a premium, user-friendly interface.

---

## 🌟 Key Features

*   **Wallet Integration**: Full support for the Freighter wallet extension.
*   **Live Balance Fetching**: Real-time retrieval of XLM balances from the Stellar Horizon server.
*   **Smart Payments**: Automatically detects if a destination account exists and switches between `Payment` and `Create Account` operations accordingly.
*   **Advanced Error Handling**: Precise feedback for common blockchain issues (insufficient funds, sequence mismatches, etc.).
*   **Premium UI**: A sleek, glassmorphism-inspired dark theme designed for a professional user experience.

---

## 🛠 Tech Stack

*   **Frontend**: React.js
*   **Blockchain**: Stellar SDK (`@stellar/stellar-sdk`)
*   **Wallet API**: Freighter API (`@stellar/freighter-api`)
*   **Styling**: Vanilla CSS (Modern CSS3 with Glassmorphism)

---

## ⚙️ Setup Instructions (How to run locally)

Follow these steps to get your local development environment running:

### 1. Prerequisites
*   Ensure you have [Node.js](https://nodejs.org/) installed.
*   Install the [Freighter Wallet](https://www.freighter.app/) extension in your browser and switch it to **Testnet**.

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
The application will be available at `http://localhost:3000` (or `http://localhost:3002` if port 3000 is occupied).

### 5. Fund Your Wallet
If you are using a new account, fund it using the [Stellar Laboratory Friendbot](https://laboratory.stellar.org/#account-creator?network=testnet) before testing.

---

## 📸 Screenshots

### 1. Wallet Connected State
*Connect button transforms into a secure wallet indicator.*
![Connected State](./screenshots/Screenshot%202026-04-15%20202000.png)

### 2. Balance Displayed
*Live XLM balance fetched directly from the Testnet.*
![Balance Displayed](./screenshots/Screenshot%202026-04-15%20202000.png)

### 3. Successful Testnet Transaction
*Transaction signing and submission process via Freighter.*
![Successful Transaction](./screenshots/Screenshot%202026-04-15%20202151.png)

### 4. Transaction Result
*User receives a clear confirmation message with a success alert.*
![Transaction Result](./screenshots/Screenshot%202026-04-15%20202224.png)

---

## 📜 License
This project is licensed under the MIT License.
