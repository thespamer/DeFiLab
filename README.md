# 🧙‍♂️ DeFi Ethereum Discovery Wizard

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-ready-blue.svg)](https://www.docker.com/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.26-blue.svg)](https://docs.soliditylang.org/)
[![Tests](https://img.shields.io/badge/Tests-15%20passing-brightgreen.svg)](#-running-tests)

Become a DeFi pro from a beginner in 15 minutes with our interactive and gamified Ethereum discovery guide.

---

## 🎮 The Wizard — 8 Steps

| # | Step | What happens on-chain |
|---|---|---|
| 1 | **Welcome** | MetaMask connects to Hardhat devnet; `requestTokens()` faucet gives 1000 USDC + 1000 DAI |
| 2 | **DeFi 101** | Interactive quiz — no transaction |
| 3 | **Your Arsenal** | Concept cards — no transaction |
| 4 | **Contract Tests** | Automated browser-side test suite: 6 live transactions against devnet using Hardhat account #2 |
| 5 | **First Lending** | `approve()` + `deposit()` USDC; then `borrow()` against 50% LTV on `SimpleLendingPool` |
| 6 | **DEX Swap** | Live `getAmountOut()` quote + `approve()` + `swap()` on `BasicDEX` (x·y=k AMM) |
| 7 | **Yield Combo** | `deposit()` + `swap()` + `stake()` on `StakingRewards`, then `claimReward()` |
| 8 | **Playground Pro** | Live on-chain balances, real transaction history, all earned badges |

---

## 🏗️ Architecture

| Layer | Stack |
|---|---|
| Blockchain | Hardhat devnet — localhost:8545, chainId 31337 |
| Smart contracts | Solidity **0.8.26** + OpenZeppelin 5.x |
| Frontend | React 19, Vite 6 (dev server), Tailwind CSS, shadcn/ui, Framer Motion |
| Web3 | **ethers.js 6** + MetaMask browser wallet |
| Infrastructure | Docker Compose — Hardhat node + Vite dev server |

### Contracts deployed

| Contract | Role |
|---|---|
| `WizardFactory` | Deploys and wires all contracts; `requestTokens()` faucet |
| `ERC20Mock` | Mock USDC and DAI tokens with unrestricted `mint()` |
| `SimpleLendingPool` | Deposit USDC as collateral, borrow up to 50% LTV |
| `BasicDEX` | Constant-product AMM (x·y=k) USDC ↔ DAI |
| `StakingRewards` | Time-based staking rewards on USDC |

---

## 🚀 Getting Started

### Prerequisites

- **Docker & Docker Compose**
- **MetaMask** browser extension — [install here](https://metamask.io/)

### One-command start

```bash
git clone https://github.com/thespamer/DeFiLab.git
cd DeFiLab
cp .env.example .env
docker-compose up --build
```

1. Open **http://localhost:3000**
2. Click **Connect MetaMask & Begin**
3. The wizard automatically adds the Hardhat network to MetaMask and funds your wallet

> The Hardhat service starts first, deploys all contracts, and writes
> `frontend/public/deployments.json` with every contract address.
> The frontend waits for the healthcheck before starting.

---

## 🛠️ Commands

### Docker

```bash
# Build images and start everything
docker-compose up --build

# Start with cached images (no rebuild)
docker-compose up

# Stop all containers
docker-compose down

# Tail logs
docker-compose logs -f hardhat
docker-compose logs -f frontend
```

### Local development (no Docker)

**Requires Node.js ≥ 20**

```bash
# Install root dependencies
npm install

# Seed the Solidity compiler cache (only needed once, or in restricted networks)
node scripts/seed-solc.cjs

# Start the Hardhat devnet (keeps running)
npm run node

# In a second terminal — deploy contracts + write deployments.json
npm run deploy

# Start the Vite frontend dev server
cd frontend && npm install && npm run dev
# → http://localhost:3000
```

### Hardhat shortcuts

```bash
# Compile Solidity contracts
npx hardhat compile

# Run the full test suite (15 tests)
npm test

# Run a specific test file
npx hardhat test test/DeFiWizard.test.cjs

# Open an interactive console connected to a running node
npx hardhat console --network localhost

# Gas usage report
REPORT_GAS=true npx hardhat test
```

---

## 🧪 Running Tests

```bash
npm test
```

```
  DeFi Wizard Contracts
    ERC20Mock
      ✔ mint() adds tokens to recipient
    WizardFactory
      ✔ deploys all four contracts
      ✔ requestTokens() mints 1000 USDC + 1000 DAI
    SimpleLendingPool
      ✔ deposit() records collateral
      ✔ borrow() up to 50% LTV succeeds
      ✔ borrow() over 50% LTV reverts
      ✔ withdraw() restores tokens
    BasicDEX
      ✔ factory seeded initial liquidity
      ✔ getAmountOut() returns a positive quote
      ✔ swap() USDC → DAI transfers DAI to user
      ✔ swap() DAI → USDC transfers USDC to user
    StakingRewards
      ✔ stake() records staked amount
      ✔ earned() accrues rewards over time
      ✔ withdraw() returns staked tokens
      ✔ claimReward() transfers earned rewards

  15 passing (1s)
```

---

## 🔧 Compiler Bootstrap

The project uses **Solidity 0.8.26**, which matches the `soljson.js` bundled inside
`node_modules/solc`. In environments where `binaries.soliditylang.org` is
unreachable (air-gapped CI, corporate proxies, remote sandboxes), run:

```bash
node scripts/seed-solc.cjs
```

This script:
1. Copies `node_modules/solc/soljson.js` to Hardhat's local compiler cache
2. Patches the Hardhat downloader to use the WASM (JS) build on Linux instead of trying to spawn a native binary

The `Dockerfile.hardhat` already runs this automatically during `docker build`,
so container users don't need to do anything extra.

---

## 🎖️ Gamification

| Badge | Trigger | XP |
|---|---|---|
| 🛡️ Wallet Warrior | Connect MetaMask + faucet | 100 |
| 📚 Scholar | DeFi 101 quiz | 50–100 |
| 🗺️ Explorer | Read Arsenal cards | 50 |
| 🧪 Test Engineer | Run contract test suite | 150 |
| 💧 Liquidity Provider | `deposit()` USDC in LendingPool | 100 |
| 💸 Borrower | `borrow()` against collateral | 150 |
| 🔄 Swapper | `swap()` USDC → DAI on BasicDEX | 100 |
| 🌾 Yielder Pro | `stake()` + `claimReward()` on StakingRewards | 150 |
| 🧙‍♂️ DeFi Wizard | Complete all 8 steps | — |

---

## 📄 License

MIT
