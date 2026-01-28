#!/bin/sh

# Start Hardhat node in the background
npx hardhat node --hostname 0.0.0.0 &
NODE_PID=$!

# Wait for the node to be ready
echo "Waiting for Hardhat node to start (PID: $NODE_PID)..."
until nc -z localhost 8545; do
  sleep 1
done

echo "Node started! Running initial DeFi deployment..."
npx hardhat run scripts/deploy.js --network localhost

# Keep the container running by waiting for the node process
wait $NODE_PID
