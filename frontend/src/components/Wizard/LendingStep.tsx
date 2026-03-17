import React, { useState, useEffect, useCallback } from 'react';
import { useGamification } from '../../hooks/useGamification';
import { useWeb3 } from '../../hooks/useWeb3';
import { Plus, Minus, ArrowRight, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { ethers } from 'ethers';

const LendingStep: React.FC = () => {
    const { nextStep, addXP, addBadge } = useGamification();
    const { contracts, account, addTx } = useWeb3();

    const [subStep, setSubStep] = useState(0); // 0 = deposit, 1 = borrow
    const [amount, setAmount]   = useState(100);
    const [loading, setLoading] = useState(false);
    const [txHash, setTxHash]   = useState<string | null>(null);
    const [error, setError]     = useState<string | null>(null);

    // On-chain balances shown to the user
    const [usdcBalance, setUsdcBalance] = useState('…');
    const [deposited,   setDeposited]   = useState('0');

    const fetchBalances = useCallback(async () => {
        if (!contracts || !account) return;
        const bal = await contracts.usdc.balanceOf(account);
        const dep = await contracts.pool.deposits(account);
        setUsdcBalance(parseFloat(ethers.formatEther(bal)).toFixed(2));
        setDeposited(parseFloat(ethers.formatEther(dep)).toFixed(2));
    }, [contracts, account]);

    useEffect(() => { fetchBalances(); }, [fetchBalances]);

    const handleAction = async () => {
        if (!contracts || !account) return;
        setLoading(true);
        setError(null);
        setTxHash(null);

        try {
            const amtWei = ethers.parseEther(amount.toString());

            if (subStep === 0) {
                // Approve USDC → LendingPool, then deposit
                const appTx = await contracts.usdc.approve(contracts.addresses.pool, amtWei);
                await appTx.wait();
                const tx = await contracts.pool.deposit(amtWei);
                await tx.wait();
                setTxHash(tx.hash);
                addTx(tx.hash, `Deposit ${amount} USDC`);
                addXP(100);
                addBadge('Liquidity Provider 💧');
                await fetchBalances();
                setSubStep(1);
                setAmount(Math.floor(amount / 2)); // suggest 50% LTV
            } else {
                // Borrow USDC (contract pays from its own reserves)
                const tx = await contracts.pool.borrow(amtWei);
                await tx.wait();
                setTxHash(tx.hash);
                addTx(tx.hash, `Borrow ${amount} USDC`);
                addXP(150);
                addBadge('Borrower 💸');
                await fetchBalances();
                nextStep();
            }
        } catch (e: unknown) {
            const err = e as { reason?: string; message?: string };
            setError(err.reason ?? err.message ?? 'Transaction failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 py-8">
            {/* Context banner */}
            <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20">
                <h2 className="text-2xl font-bold text-primary mb-2">
                    {subStep === 0 ? 'Step A: Deposit Collateral' : 'Step B: Borrow Assets'}
                </h2>
                <p className="text-muted-foreground">
                    {subStep === 0
                        ? 'Deposit USDC as collateral. This calls approve() then deposit() on SimpleLendingPool.'
                        : `You deposited ${deposited} USDC. You can borrow up to 50% (${(parseFloat(deposited) / 2).toFixed(2)} USDC).`}
                </p>
                <div className="text-xs font-mono text-muted-foreground mt-3">
                    Your USDC: {usdcBalance} &nbsp;|&nbsp; Deposited: {deposited}
                </div>
            </div>

            {/* Amount picker */}
            <div className="bg-card border rounded-3xl p-10 shadow-xl max-w-md mx-auto text-center">
                <div className="text-6xl font-black mb-8 text-primary">${amount}</div>

                <div className="flex justify-center gap-4 mb-10">
                    <button
                        onClick={() => setAmount(prev => Math.max(0, prev - 50))}
                        className="p-4 bg-secondary rounded-full hover:bg-secondary/80 transition-colors"
                    >
                        <Minus />
                    </button>
                    <button
                        onClick={() => setAmount(prev => prev + 50)}
                        className="p-4 bg-secondary rounded-full hover:bg-secondary/80 transition-colors"
                    >
                        <Plus />
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="flex items-start gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-950/20 p-3 rounded-xl mb-4">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Tx confirmation */}
                {txHash && (
                    <div className="flex items-center gap-2 text-green-600 text-xs font-mono bg-green-50 dark:bg-green-950/20 p-3 rounded-xl mb-4">
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        <span className="truncate">tx: {txHash}</span>
                    </div>
                )}

                <button
                    onClick={handleAction}
                    disabled={loading || !contracts || amount <= 0}
                    className="w-full py-5 bg-primary text-primary-foreground rounded-2xl font-black text-xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                    {loading
                        ? <Loader className="animate-spin" />
                        : (subStep === 0 ? 'Deposit USDC' : 'Borrow USDC')}
                    {!loading && <ArrowRight className="w-6 h-6" />}
                </button>
            </div>

            <div className="text-center text-xs text-muted-foreground font-mono">
                Live tx on Hardhat devnet via ethers.js + MetaMask
            </div>
        </div>
    );
};

export default LendingStep;
