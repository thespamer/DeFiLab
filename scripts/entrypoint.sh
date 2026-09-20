#!/bin/sh

# Seed Solidity compiler cache from bundled soljson.js (no network needed)
echo "🔧 Seeding Solidity compiler cache..."
node scripts/seed-solc.cjs

# Start Hardhat node in the background
echo "🚀 Starting Hardhat node on 0.0.0.0:8545..."
npx hardhat node --hostname 0.0.0.0 &
NODE_PID=$!

# Wait for the JSON-RPC endpoint to become available
echo "⏳ Waiting for Hardhat node (PID: $NODE_PID)..."
until nc -z localhost 8545; do
  sleep 1
done

echo "✅ Node ready. Deploying DeFi Wizard contracts..."
npx hardhat run scripts/deploy.js --network localhost

echo "🎉 DeFi Ecosystem live — open http://localhost:3000"

# Keep the container alive
wait $NODE_PID
