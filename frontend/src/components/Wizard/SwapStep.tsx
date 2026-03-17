import React, { useState, useEffect, useCallback } from 'react';
import { useGamification } from '../../hooks/useGamification';
import { useWeb3 } from '../../hooks/useWeb3';
import { RefreshCw, ArrowDown, CheckCircle, AlertCircle } from 'lucide-react';
import { ethers } from 'ethers';

const SwapStep: React.FC = () => {
    const { nextStep, addXP, addBadge } = useGamification();
    const { contracts, account, addTx } = useWeb3();

    const [fromAmount, setFromAmount] = useState('100');
    const [toAmount,   setToAmount]   = useState('0');
    const [loading,    setLoading]    = useState(false);
    const [txHash,     setTxHash]     = useState<string | null>(null);
    const [error,      setError]      = useState<string | null>(null);
    const [usdcBal,    setUsdcBal]    = useState('…');
    const [daiBal,     setDaiBal]     = useState('…');

    const fetchBalances = useCallback(async () => {
        if (!contracts || !account) return;
        const u = await contracts.usdc.balanceOf(account);
        const d = await contracts.dai.balanceOf(account);
        setUsdcBal(parseFloat(ethers.formatEther(u)).toFixed(2));
        setDaiBal(parseFloat(ethers.formatEther(d)).toFixed(2));
    }, [contracts, account]);

    useEffect(() => { fetchBalances(); }, [fetchBalances]);

    // Live AMM quote
    useEffect(() => {
        const fetch = async () => {
            const val = parseFloat(fromAmount);
            if (!contracts || !val || val <= 0) { setToAmount('0'); return; }
            try {
                const out = await contracts.dex.getAmountOut(
                    contracts.addresses.usdc,
                    ethers.parseEther(fromAmount)
                );
                setToAmount(parseFloat(ethers.formatEther(out)).toFixed(4));
            } catch {
                setToAmount('0');
            }
        };
        const timer = setTimeout(fetch, 300);
        return () => clearTimeout(timer);
    }, [fromAmount, contracts]);

    const handleSwap = async () => {
        if (!contracts || !account) return;
        setLoading(true);
        setError(null);
        setTxHash(null);
        try {
            const amtWei = ethers.parseEther(fromAmount);
            const appTx  = await contracts.usdc.approve(contracts.addresses.dex, amtWei);
            await appTx.wait();
            const tx = await contracts.dex.swap(contracts.addresses.usdc, amtWei);
            await tx.wait();
            setTxHash(tx.hash);
            addTx(tx.hash, `Swap ${fromAmount} USDC → DAI`);
            addXP(100);
            addBadge('Swapper 🔄');
            await fetchBalances();
            nextStep();
        } catch (e: unknown) {
            const err = e as { reason?: string; message?: string };
            setError(err.reason ?? err.message ?? 'Swap failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 py-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center">
                <h2 className="text-3xl font-extrabold mb-2">Decentralized Swap</h2>
                <p className="text-muted-foreground">
                    Swap tokens without a middleman using the AMM (x*y=k). Quote updates live.
                </p>
            </div>

            <div className="max-w-md mx-auto bg-card border rounded-[2rem] p-4 shadow-2xl relative">
                {/* From */}
                <div className="space-y-2 p-4 bg-secondary/30 rounded-2xl mb-2">
                    <div className="flex justify-between text-sm font-bold text-muted-foreground">
                        <span>You pay</span>
                        <span>Balance: {usdcBal} USDC</span>
                    </div>
                    <div className="flex justify-between items-center px-2 py-4">
                        <input
                            type="number"
                            value={fromAmount}
                            onChange={e => setFromAmount(e.target.value)}
                            className="bg-transparent text-4xl font-bold w-full outline-none"
                        />
                        <span className="text-xl font-bold bg-white dark:bg-black px-4 py-2 rounded-xl shadow-sm border">USDC</span>
                    </div>
                </div>

                {/* Arrow */}
                <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 p-3 bg-card border rounded-2xl shadow-lg">
                    <ArrowDown className="text-primary" />
                </div>

                {/* To */}
                <div className="space-y-2 p-4 bg-secondary/30 rounded-2xl mt-4">
                    <div className="flex justify-between text-sm font-bold text-muted-foreground">
                        <span>You receive</span>
                        <span>Balance: {daiBal} DAI</span>
                    </div>
                    <div className="flex justify-between items-center px-2 py-4">
                        <div className="text-4xl font-bold">{toAmount}</div>
                        <span className="text-xl font-bold bg-white dark:bg-black px-4 py-2 rounded-xl shadow-sm border">DAI</span>
                    </div>
                </div>

                <div className="p-4 flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    <span>Price Impact</span>
                    <span className="text-green-500 font-black">Live AMM Quote ✓</span>
                </div>

                {error && (
                    <div className="flex items-start gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-950/20 p-3 rounded-xl mx-4 mb-2">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {txHash && (
                    <div className="flex items-center gap-2 text-green-600 text-xs font-mono bg-green-50 dark:bg-green-950/20 p-3 rounded-xl mx-4 mb-2">
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        <span className="truncate">tx: {txHash}</span>
                    </div>
                )}

                <button
                    onClick={handleSwap}
                    disabled={loading || !contracts || parseFloat(fromAmount) <= 0}
                    className="w-full py-6 mt-4 bg-primary text-primary-foreground rounded-2xl font-black text-2xl flex items-center justify-center gap-3 shadow-xl hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                >
                    {loading ? <RefreshCw className="animate-spin" /> : 'Swap Tokens'}
                </button>
            </div>
        </div>
    );
};

export default SwapStep;
