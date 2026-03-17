# 🧙‍♂️ DeFi Ethereum Discovery Wizard

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-ready-blue.svg)](https://www.docker.com/)

Become a DeFi pro from a beginner in 15 minutes with our interactive and gamified Ethereum discovery guide.

---

## 🎮 The Wizard Challenge

The Wizard is an interactive 8-step journey covering the fundamentals of the DeFi ecosystem:

1.  **Welcome**: Connect MetaMask to the Hardhat devnet and claim 1000 USDC + 1000 DAI from the faucet.
2.  **DeFi 101**: Master the core differences between CeFi and DeFi through interactive quizzes.
3.  **Your Arsenal**: Explore essential protocols and concepts (Gas, DEX, Lending).
4.  **Contract Tests**: Automated in-browser test suite that runs 6 live transactions against the devnet to verify every contract before you use them.
5.  **First Lending**: Real `approve()` + `deposit()` + `borrow()` calls on SimpleLendingPool.
6.  **DEX Swap**: Live AMM quote via `getAmountOut()` + real `swap()` on BasicDEX.
7.  **Yield Combo**: Real `stake()` + `claimReward()` on StakingRewards.
8.  **Playground Pro**: Live on-chain balances, full real transaction history, and badges.

---

## 🏗️ Technical Architecture

- **Blockchain**: Local Hardhat Devnet (localhost:8545, chainId 31337).
- **Smart Contracts**: Solidity 0.8.24 + OpenZeppelin 5.x.
- **Frontend**: React 19, Vite 6 (dev mode), Tailwind CSS, shadcn/ui, Framer Motion.
- **Web3 Engine**: ethers.js 6 + MetaMask browser wallet.
- **Infrastructure**: Docker & Docker Compose — Vite dev server + Hardhat node.

---

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose installed.
- [MetaMask](https://metamask.io/) browser extension installed.

### Setup & Launch

1. **Clone the repository**:
   ```bash
   git clone https://github.com/thespamer/DeFiLab.git
   cd DeFiLab
   ```

2. **Environment Configuration**:
   ```bash
   cp .env.example .env
   ```

3. **Start the devnet + frontend**:
   ```bash
   docker-compose up --build
   ```
   The Hardhat node starts first, deploys all contracts, writes
   `frontend/public/deployments.json`, then the Vite dev server comes up.

4. **Access the Interface**:
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Connect MetaMask**:
   Click **Connect MetaMask & Begin** — the wizard automatically adds the
   Hardhat network (`chainId 31337`, RPC `http://localhost:8545`) to MetaMask
   and calls the faucet to fund your wallet with 1000 USDC + 1000 DAI.

---

## 🛠️ Development Commands

### Docker (recommended)

| Command | Description |
|---|---|
| `docker-compose up --build` | Build images and start devnet + frontend |
| `docker-compose up` | Start with cached images |
| `docker-compose down` | Stop all containers |
| `docker-compose logs -f hardhat` | Watch Hardhat node logs |
| `docker-compose logs -f frontend` | Watch Vite dev server logs |

### Without Docker (local dev)

**Start the Hardhat devnet:**
```bash
npm run node
# Starts hardhat node on http://localhost:8545 with 20 funded accounts
```

**Deploy contracts to the local devnet:**
```bash
npm run deploy
# Deploys all contracts and writes frontend/public/deployments.json
```

**Run the Solidity test suite:**
```bash
npm test
# Runs test/DeFiWizard.test.cjs with Hardhat + Chai
# Covers: ERC20Mock, WizardFactory, SimpleLendingPool, BasicDEX, StakingRewards
```

**Start the frontend dev server:**
```bash
cd frontend
npm install
npm run dev
# Available at http://localhost:3000
```

### Smart contract shortcuts

```bash
# Compile contracts
npx hardhat compile

# Run a single test file
npx hardhat test test/DeFiWizard.test.cjs

# Open Hardhat console connected to a running node
npx hardhat console --network localhost

# Check gas usage per test
REPORT_GAS=true npx hardhat test
```

---

## 🎖️ Gamification System

Earn XP and badges as you complete real on-chain actions:

| Badge | How to earn | XP |
|---|---|---|
| 🛡️ Wallet Warrior | Connect MetaMask + claim faucet | 100 |
| 📚 Scholar | Complete the DeFi 101 quiz | 50–100 |
| 🗺️ Explorer | Read all Arsenal concept cards | 50 |
| 🧪 Test Engineer | Run the contract test suite | 150 |
| 💧 Liquidity Provider | `deposit()` USDC in LendingPool | 100 |
| 💸 Borrower | `borrow()` against collateral | 150 |
| 🔄 Swapper | `swap()` USDC → DAI on BasicDEX | 100 |
| 🌾 Yielder Pro | `stake()` + `claimReward()` on StakingRewards | 150 |
| 🧙‍♂️ DeFi Wizard | Complete all steps | — |

---

## 📄 License
This project is licensed under the MIT License.

