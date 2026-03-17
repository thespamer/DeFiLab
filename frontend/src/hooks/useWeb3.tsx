import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { ethers } from 'ethers';

// ─── Minimal ABIs ─────────────────────────────────────────────────────────────

const ERC20_ABI = [
    "function balanceOf(address) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
];

const FACTORY_ABI = [
    "function requestTokens(address to)",
    "function usdc() view returns (address)",
    "function dai() view returns (address)",
    "function pool() view returns (address)",
    "function dex() view returns (address)",
];

const LENDING_ABI = [
    "function deposit(uint256 amount)",
    "function withdraw(uint256 amount)",
    "function borrow(uint256 amount)",
    "function repay(uint256 amount)",
    "function deposits(address) view returns (uint256)",
    "function borrows(address) view returns (uint256)",
];

const DEX_ABI = [
    "function swap(address tokenIn, uint256 amountIn) returns (uint256 amountOut)",
    "function getAmountOut(address tokenIn, uint256 amountIn) view returns (uint256)",
    "function reserveA() view returns (uint256)",
    "function reserveB() view returns (uint256)",
];

const STAKING_ABI = [
    "function stake(uint256 amount)",
    "function withdraw(uint256 amount)",
    "function claimReward()",
    "function earned(address user) view returns (uint256)",
    "function stakedAmount(address) view returns (uint256)",
];

// ─── Hardhat devnet params for wallet_addEthereumChain ───────────────────────

const HARDHAT_CHAIN_PARAMS = {
    chainId: "0x7A69", // 31337
    chainName: "Hardhat Local Devnet",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["http://localhost:8545"],
    blockExplorerUrls: [],
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TxRecord {
    hash: string;
    description: string;
    timestamp: number;
}

export interface ContractAddresses {
    factory: string;
    usdc: string;
    dai: string;
    pool: string;
    dex: string;
    staking: string;
}

export interface Web3Contracts {
    factory: ethers.Contract;
    usdc: ethers.Contract;
    dai: ethers.Contract;
    pool: ethers.Contract;
    dex: ethers.Contract;
    staking: ethers.Contract;
    addresses: ContractAddresses;
}

export interface Web3ContextType {
    account: string | null;
    isConnected: boolean;
    isConnecting: boolean;
    contracts: Web3Contracts | null;
    provider: ethers.BrowserProvider | null;
    txHistory: TxRecord[];
    error: string | null;
    connect: () => Promise<void>;
    addTx: (hash: string, description: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [account, setAccount]     = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [contracts, setContracts] = useState<Web3Contracts | null>(null);
    const [provider, setProvider]   = useState<ethers.BrowserProvider | null>(null);
    const [txHistory, setTxHistory] = useState<TxRecord[]>([]);
    const [error, setError]         = useState<string | null>(null);

    const addTx = useCallback((hash: string, description: string) => {
        setTxHistory(prev => [{ hash, description, timestamp: Date.now() }, ...prev]);
    }, []);

    const connect = useCallback(async () => {
        setIsConnecting(true);
        setError(null);
        try {
            if (!window.ethereum) {
                throw new Error("MetaMask not found. Install the MetaMask extension first.");
            }

            // Add or switch to the Hardhat network
            try {
                await window.ethereum.request({
                    method: "wallet_switchEthereumChain",
                    params: [{ chainId: HARDHAT_CHAIN_PARAMS.chainId }],
                });
            } catch (switchErr: unknown) {
                const err = switchErr as { code?: number };
                if (err.code === 4902) {
                    await window.ethereum.request({
                        method: "wallet_addEthereumChain",
                        params: [HARDHAT_CHAIN_PARAMS],
                    });
                } else {
                    throw switchErr;
                }
            }

            // Request account access
            const web3Provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await web3Provider.getSigner();
            const addr   = await signer.getAddress();

            // Load deployments.json written by the Hardhat deploy script
            const resp = await fetch("/deployments.json");
            if (!resp.ok) {
                throw new Error(
                    "deployments.json not found. Make sure the Docker devnet is running and contracts are deployed."
                );
            }
            const deployments = await resp.json() as ContractAddresses & { chainId: number };

            // Instantiate contracts
            const factory = new ethers.Contract(deployments.factory, FACTORY_ABI, signer);
            const usdc    = new ethers.Contract(deployments.usdc,    ERC20_ABI,   signer);
            const dai     = new ethers.Contract(deployments.dai,     ERC20_ABI,   signer);
            const pool    = new ethers.Contract(deployments.pool,    LENDING_ABI, signer);
            const dex     = new ethers.Contract(deployments.dex,     DEX_ABI,     signer);
            const staking = new ethers.Contract(deployments.staking, STAKING_ABI, signer);

            setProvider(web3Provider);
            setAccount(addr);
            setContracts({
                factory, usdc, dai, pool, dex, staking,
                addresses: {
                    factory: deployments.factory,
                    usdc:    deployments.usdc,
                    dai:     deployments.dai,
                    pool:    deployments.pool,
                    dex:     deployments.dex,
                    staking: deployments.staking,
                },
            });
        } catch (e: unknown) {
            const err = e as { message?: string };
            setError(err.message ?? "Connection failed");
        } finally {
            setIsConnecting(false);
        }
    }, []);

    return (
        <Web3Context.Provider
            value={{ account, isConnected: !!account, isConnecting, contracts, provider, txHistory, error, connect, addTx }}
        >
            {children}
        </Web3Context.Provider>
    );
};

export const useWeb3 = (): Web3ContextType => {
    const ctx = useContext(Web3Context);
    if (!ctx) throw new Error("useWeb3 must be used inside <Web3Provider>");
    return ctx;
};
