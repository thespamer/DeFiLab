# 🧙‍♂️ DeFi Ethereum Discovery Wizard

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-ready-blue.svg)](https://www.docker.com/)

Become a DeFi pro from a beginner in 15 minutes with our interactive and gamified Ethereum discovery guide.

---

## 🎮 The Wizard Challenge

The Wizard is an interactive 7-step journey covering the fundamentals of the DeFi ecosystem:

1.  **Welcome**: Connect your local dev wallet and meet your guide.
2.  **DeFi 101**: Master the core differences between CeFi and DeFi through interactive quizzes.
3.  **Your Arsenal**: Explore essential protocols and concepts (Gas, DEX, Lending).
4.  **First Lending**: Get hands-on experience by depositing and borrowing assets.
5.  **DEX Swap**: Exchange tokens directly via an Automated Market Maker (AMM).
6.  **Yield Combo**: Learn protocol composability by building "Money Lego" flows.
7.  **Playground Pro**: Free-roam mode to explore, track history, and showcase badges.

---

## 🏗️ Technical Architecture

- **Blockchain**: Local Hardhat Devnet (localhost:8545, chainId 31337).
- **Smart Contracts**: Solidity 0.8.24 + OpenZeppelin 5.x.
- **Frontend**: React 18, Vite, Tailwind CSS, shadcn/ui, Framer Motion.
- **Web3 Engine**: ethers.js.
- **Infrastructure**: Docker & Docker Compose for one-click deployment.

---

## 🚀 Getting Started

### Prerequisites
- Docker & Docker Compose installed.

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

3. **Start the Wizard**:
   ```bash
   docker-compose up --build
   ```

4. **Access the Interface**:
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎖️ Gamification System

Earn up to 8 unique badges as you progress:
- 🛡️ **Wallet Warrior**: Connect your first wallet.
- 💰 **Lender**: Successfully deposit liquidity.
- 🔄 **Swapper**: Execute your first decentralized trade.
- 🌾 **Yielder Pro**: Master the art of compounding rewards.

---

## 📄 License
This project is licensed under the MIT License.

