import React, { useState } from 'react';
import { useGamification } from '../../hooks/useGamification';
import { RefreshCw, ArrowDown } from 'lucide-react';

const SwapStep: React.FC = () => {
    const { nextStep, addXP, addBadge } = useGamification();
    const [fromAmount, setFromAmount] = useState('100');
    const [loading, setLoading] = useState(false);

    const handleSwap = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            addXP(100);
            addBadge('Swapper 🔄');
            nextStep();
        }, 1500);
    };

    return (
        <div className="space-y-8 py-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center">
                <h2 className="text-3xl font-extrabold mb-2">Decentralized Swap</h2>
                <p className="text-muted-foreground">Swap tokens without a middleman using our AMM (x*y=k).</p>
            </div>

            <div className="max-w-md mx-auto bg-card border rounded-[2rem] p-4 shadow-2xl relative">
                <div className="space-y-2 p-4 bg-secondary/30 rounded-2xl mb-2">
                    <div className="flex justify-between text-sm font-bold text-muted-foreground">
                        <span>You pay</span>
                        <span>Balance: 1,000 USDC</span>
                    </div>
                    <div className="flex justify-between items-center px-2 py-4">
                        <input
                            type="number"
                            value={fromAmount}
                            onChange={(e) => setFromAmount(e.target.value)}
                            className="bg-transparent text-4xl font-bold w-full outline-none"
                        />
                        <span className="text-xl font-bold bg-white dark:bg-black px-4 py-2 rounded-xl shadow-sm border">USDC</span>
                    </div>
                </div>

                <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 p-3 bg-card border rounded-2xl shadow-lg">
                    <ArrowDown className="text-primary" />
                </div>

                <div className="space-y-2 p-4 bg-secondary/30 rounded-2xl mt-4">
                    <div className="flex justify-between text-sm font-bold text-muted-foreground">
                        <span>You receive</span>
                        <span>Balance: 0 DAI</span>
                    </div>
                    <div className="flex justify-between items-center px-2 py-4">
                        <div className="text-4xl font-bold">{(Number(fromAmount) * 0.997).toFixed(2)}</div>
                        <span className="text-xl font-bold bg-white dark:bg-black px-4 py-2 rounded-xl shadow-sm border">DAI</span>
                    </div>
                </div>

                <div className="p-4 flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    <span>Price Impact</span>
                    <span className="text-green-500 font-black">&lt; 0.01%</span>
                </div>

                <button
                    onClick={handleSwap}
                    disabled={loading}
                    className="w-full py-6 mt-4 bg-primary text-primary-foreground rounded-2xl font-black text-2xl flex items-center justify-center gap-3 shadow-xl hover:brightness-110 active:scale-95 transition-all"
                >
                    {loading ? <RefreshCw className="animate-spin" /> : "Swap Tokens"}
                </button>
            </div>
        </div>
    );
};

export default SwapStep;
