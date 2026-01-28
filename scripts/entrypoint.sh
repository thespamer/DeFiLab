#!/bin/sh

# Start Hardhat node in the background
npx hardhat node --hostname 0.0.0.0 &

# Wait for the node to be ready
echo "Waiting for Hardhat node to start..."
until nc -z localhost 8545; do
  sleep 1
done

echo "Node started! Running initial DeFi deployment..."
npx hardhat run scripts/deploy.js --network localhost

# Keep the container running
wait
