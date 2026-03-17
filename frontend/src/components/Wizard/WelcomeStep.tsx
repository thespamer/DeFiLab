import React, { useState, useEffect } from 'react';
import { useGamification } from '../../hooks/useGamification';
import { useWeb3 } from '../../hooks/useWeb3';
import { Wallet, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { ethers } from 'ethers';

type Status = 'idle' | 'connecting' | 'faucet' | 'done';

const WelcomeStep: React.FC = () => {
    const { nextStep, addXP, addBadge } = useGamification();
    const { connect, account, isConnecting, contracts, addTx, error } = useWeb3();
    const [status, setStatus]       = useState<Status>('idle');
    const [usdcBalance, setUsdcBalance] = useState<string | null>(null);
    const [faucetError, setFaucetError] = useState<string | null>(null);

    // Once the wallet is connected and contracts are loaded, request faucet tokens
    useEffect(() => {
        if (account && contracts && status === 'connecting') {
            requestFaucet();
        }
    }, [account, contracts]);

    const handleConnect = async () => {
        setStatus('connecting');
        setFaucetError(null);
        await connect();
        // If connect() failed the error is in the Web3 context; reset status so user can retry
        if (!account) setStatus('idle');
    };

    const requestFaucet = async () => {
        if (!contracts || !account) return;
        setStatus('faucet');
        try {
            const tx = await contracts.factory.requestTokens(account);
            await tx.wait();
            addTx(tx.hash, 'Faucet: +1000 USDC +1000 DAI');
            const bal = await contracts.usdc.balanceOf(account);
            setUsdcBalance(parseFloat(ethers.formatEther(bal)).toFixed(0));
        } catch (e: unknown) {
            const err = e as { reason?: string; message?: string };
            setFaucetError(err.reason ?? err.message ?? 'Faucet call failed');
        } finally {
            setStatus('done');
        }
    };

    const handleContinue = () => {
        addXP(100);
        addBadge('Wallet Warrior 🛡️');
        nextStep();
    };

    return (
        <div className="space-y-6 text-center py-12">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Wallet className="w-10 h-10 text-primary" />
            </div>

            <h2 className="text-4xl font-extrabold tracking-tight">Welcome, Future DeFi Pro!</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Connect your MetaMask to the local Hardhat devnet and grab 1000 USDC + 1000 DAI from the faucet to start.
            </p>

            {/* Wallet connection error */}
            {error && (
                <div className="flex items-center gap-2 text-red-500 bg-red-50 dark:bg-red-950/20 p-4 rounded-xl max-w-md mx-auto">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span className="text-sm text-left">{error}</span>
                </div>
            )}

            {/* Faucet error (non-blocking) */}
            {faucetError && (
                <div className="text-yellow-600 text-sm bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-xl max-w-md mx-auto">
                    ⚠️ Faucet: {faucetError}
                </div>
            )}

            {/* Connected account status */}
            {account && (
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl p-4 max-w-md mx-auto space-y-2">
                    <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 font-mono text-sm">
                        <CheckCircle className="w-4 h-4" />
                        {account.slice(0, 8)}…{account.slice(-6)}
                    </div>
                    {status === 'faucet' && (
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <Loader className="w-4 h-4 animate-spin" />
                            Requesting tokens from faucet…
                        </div>
                    )}
                    {status === 'done' && usdcBalance !== null && (
                        <div className="text-sm font-bold text-green-600 dark:text-green-400">
                            💰 USDC balance: {usdcBalance}
                        </div>
                    )}
                </div>
            )}

            {/* Action buttons */}
            <div className="pt-8">
                {status === 'idle' && (
                    <button
                        onClick={handleConnect}
                        className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:scale-105 transition-transform"
                    >
                        Connect MetaMask &amp; Begin
                    </button>
                )}

                {(status === 'connecting' || isConnecting || status === 'faucet') && (
                    <button disabled className="px-8 py-4 bg-primary/50 text-primary-foreground rounded-xl font-bold text-lg flex items-center gap-2 mx-auto cursor-not-allowed">
                        <Loader className="w-5 h-5 animate-spin" />
                        {status === 'faucet' ? 'Claiming tokens…' : 'Connecting…'}
                    </button>
                )}

                {status === 'done' && (
                    <button
                        onClick={handleContinue}
                        className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:scale-105 transition-transform"
                    >
                        Start Learning! 🚀
                    </button>
                )}
            </div>

            <p className="text-xs text-muted-foreground mt-4">
                Network: Hardhat Local Devnet (chainId 31337) · RPC: http://localhost:8545
            </p>
        </div>
    );
};

export default WelcomeStep;
