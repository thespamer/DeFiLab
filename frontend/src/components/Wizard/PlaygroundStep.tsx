import React from 'react';
import { useGamification } from '../../hooks/useGamification';
import { Trophy, Star, History, Terminal } from 'lucide-react';
import confetti from 'canvas-confetti';

const PlaygroundStep: React.FC = () => {
    const { xp, badges, addBadge, resetState } = useGamification();

    React.useEffect(() => {
        addBadge('DeFi Wizard 🧙‍♂️');
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
        });
    }, []);

    return (
        <div className="space-y-8 py-8 animate-in zoom-in-95 duration-500">
            <div className="text-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-12 rounded-[3rem] border shadow-2xl">
                <div className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-yellow-500/40">
                    <Trophy className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                    DeFi Master Unlocked!
                </h2>
                <p className="text-xl text-muted-foreground mb-8">
                    You've completed the Discovery Wizard with <strong>{xp} XP</strong>.
                </p>

                <div className="flex flex-wrap justify-center gap-4 mb-10">
                    {badges.map(badge => (
                        <div key={badge} className="p-4 bg-card border rounded-2xl shadow-lg flex flex-col items-center gap-2 hover:translate-y-[-5px] transition-transform">
                            <Star className="text-yellow-500" />
                            <span className="font-bold">{badge.split(' ')[0]}</span>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
                    <div className="p-6 bg-card border rounded-3xl">
                        <div className="flex items-center gap-3 mb-4 font-bold">
                            <History className="text-primary" /> Recent Txs
                        </div>
                        <div className="space-y-2 text-sm text-muted-foreground font-mono">
                            <div>&gt; Mint 0.5 ETH (Faucet)</div>
                            <div>&gt; Deposit 100 USDC</div>
                            <div>&gt; Borrow 50 DAI</div>
                            <div className="text-green-500 font-bold">&gt; Success! Rewards Claimed</div>
                        </div>
                    </div>
                    <div className="p-6 bg-card border rounded-3xl">
                        <div className="flex items-center gap-3 mb-4 font-bold">
                            <Terminal className="text-primary" /> Live Stats
                        </div>
                        <div className="text-4xl font-black text-primary">$1,050.22</div>
                        <div className="text-xs text-muted-foreground mt-2 uppercase tracking-widest font-bold">TVL Contribution</div>
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
