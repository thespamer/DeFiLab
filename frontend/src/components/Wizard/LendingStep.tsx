import React, { useState } from 'react';
import { useGamification } from '../../hooks/useGamification';
import { Plus, Minus, ArrowRight } from 'lucide-react';

const LendingStep: React.FC = () => {
    const { nextStep, addXP, addBadge } = useGamification();
    const [subStep, setSubStep] = useState(0); // 0: deposit, 1: borrow
    const [amount, setAmount] = useState(100);

    const handleAction = () => {
        if (subStep === 0) {
            addXP(100);
            addBadge('Liquidity Provider 💧');
            setSubStep(1);
        } else {
            addXP(150);
            addBadge('Borrower 💸');
            nextStep();
        }
    };

    return (
        <div className="space-y-8 py-8">
            <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20 mb-8">
                <h2 className="text-2xl font-bold text-primary mb-2">
                    {subStep === 0 ? "Step A: Deposit Collateral" : "Step B: Borrow Assets"}
                </h2>
                <p className="text-muted-foreground">
                    {subStep === 0
                        ? "In DeFi, you must deposit assets (collateral) before you can borrow."
                        : "Great! Now you can borrow up to 50% of your collateral's value."}
                </p>
            </div>

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

                <button
                    onClick={handleAction}
                    className="w-full py-5 bg-primary text-primary-foreground rounded-2xl font-black text-xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg shadow-primary/20"
                >
                    {subStep === 0 ? "Deposit USDC" : "Borrow DAI"}
                    <ArrowRight className="w-6 h-6" />
                </button>
            </div>

            <div className="text-center text-sm text-muted-foreground mt-4">
                Simulation running on local Hardhat Node via ethers.js
            </div>
        </div>
    );
};

export default LendingStep;
