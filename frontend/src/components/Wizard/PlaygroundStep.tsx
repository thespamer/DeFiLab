import React, { useEffect, useState } from 'react';
import { useGamification } from '../../hooks/useGamification';
import { useWeb3 } from '../../hooks/useWeb3';
import { Trophy, Star, History, Terminal } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ethers } from 'ethers';

const PlaygroundStep: React.FC = () => {
    const { xp, badges, addBadge, resetState } = useGamification();
    const { txHistory, contracts, account }      = useWeb3();

    const [usdcBal,   setUsdcBal]   = useState('…');
    const [daiBal,    setDaiBal]    = useState('…');
    const [deposited, setDeposited] = useState('…');
    const [staked,    setStaked]    = useState('…');

    useEffect(() => {
        addBadge('DeFi Wizard 🧙‍♂️');
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }, []);

    useEffect(() => {
        const load = async () => {
            if (!contracts || !account) return;
            try {
                const [u, d, dep, stk] = await Promise.all([
                    contracts.usdc.balanceOf(account),
                    contracts.dai.balanceOf(account),
                    contracts.pool.deposits(account),
                    contracts.staking.stakedAmount(account),
                ]);
                setUsdcBal(parseFloat(ethers.formatEther(u)).toFixed(2));
                setDaiBal(parseFloat(ethers.formatEther(d)).toFixed(2));
                setDeposited(parseFloat(ethers.formatEther(dep)).toFixed(2));
                setStaked(parseFloat(ethers.formatEther(stk)).toFixed(2));
            } catch { /* ignore */ }
        };
        load();
    }, [contracts, account]);

    const tvl = (
        parseFloat(usdcBal)   +
        parseFloat(daiBal)    +
        parseFloat(deposited) +
        parseFloat(staked)
    );

    return (
        <div className="space-y-8 py-8 animate-in zoom-in-95 duration-500">
            <div className="text-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-12 rounded-[3rem] border shadow-2xl">
                {/* Trophy */}
                <div className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-yellow-500/40">
                    <Trophy className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                    DeFi Master Unlocked!
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                    You completed the Discovery Wizard with <strong>{xp} XP</strong>.
                </p>

                {/* Badges */}
                <div className="flex flex-wrap justify-center gap-4 mb-10">
                    {badges.map(badge => (
                        <div
                            key={badge}
                            className="p-4 bg-card border rounded-2xl shadow-lg flex flex-col items-center gap-2 hover:translate-y-[-5px] transition-transform"
                        >
                            <Star className="text-yellow-500" />
                            <span className="font-bold text-sm">{badge.split(' ')[0]}</span>
                        </div>
                    ))}
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
                    {/* Real TX history */}
                    <div className="p-6 bg-card border rounded-3xl">
                        <div className="flex items-center gap-3 mb-4 font-bold">
                            <History className="text-primary" /> Recent Txs
                        </div>
                        <div className="space-y-2 text-sm text-muted-foreground font-mono max-h-40 overflow-y-auto pr-1">
                            {txHistory.length === 0 && <div>&gt; No transactions recorded</div>}
                            {txHistory.map((tx, i) => (
                                <div key={i}>
                                    <span className="text-foreground/80">&gt; {tx.description}</span>
                                    <br />
                                    <span className="text-xs opacity-50">{tx.hash.slice(0, 14)}…</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Live on-chain balances */}
                    <div className="p-6 bg-card border rounded-3xl">
                        <div className="flex items-center gap-3 mb-4 font-bold">
                            <Terminal className="text-primary" /> Live Balances
                        </div>
                        <div className="text-4xl font-black text-primary mb-1">
                            ${isNaN(tvl) ? '…' : tvl.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-3">
                            Total Value
                        </div>
                        <div className="space-y-1 text-xs font-mono text-muted-foreground">
                            <div>USDC wallet:   {usdcBal}</div>
                            <div>DAI wallet:    {daiBal}</div>
                            <div>Pool deposit:  {deposited}</div>
                            <div>Staked:        {staked}</div>
                        </div>
                    </div>
                </div>

                <div className="mt-12">
                    <button
                        onClick={resetState}
                        className="text-muted-foreground hover:text-foreground font-medium transition-colors underline decoration-dotted underline-offset-4"
                    >
                        Restart Adventure
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PlaygroundStep;
