import React from 'react';
import { useGamification } from '../../hooks/useGamification';
import { Wallet } from 'lucide-react';

const WelcomeStep: React.FC = () => {
    const { nextStep, addXP, addBadge } = useGamification();

    const handleStart = () => {
        console.log('🚀 handleStart clicked');
        addXP(100);
        addBadge('Wallet Warrior 🛡️');
        console.log('🔄 Calling nextStep...');
        nextStep();
    };

    return (
        <div className="space-y-6 text-center py-12">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Wallet className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight">Welcome, Future DeFi Pro!</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                "Hi! I'm your DeFi Guide 🤖. Ready to transform from a beginner to a crypto master in 15 minutes?"
            </p>
            <div className="pt-8">
                <button
                    onClick={handleStart}
                    className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:scale-105 transition-transform"
                >
                    Connect Wallet & Begin
                </button>
            </div>
        </div>
    );
};

export default WelcomeStep;
