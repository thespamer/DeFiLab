import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGamification } from '../../hooks/useGamification';
import WelcomeStep from './WelcomeStep';
import QuizStep from './QuizStep';
import ArsenalStep from './ArsenalStep';
import LendingStep from './LendingStep';
import SwapStep from './SwapStep';
import YieldStep from './YieldStep';
import PlaygroundStep from './PlaygroundStep';

const steps = [
    WelcomeStep,
    QuizStep,
    ArsenalStep,
    LendingStep,
    SwapStep,
    YieldStep,
    PlaygroundStep,
];

const Wizard: React.FC = () => {
    const { step, xp, badges } = useGamification();
    console.log('🧙 Wizard State:', { step, xp, badges });
    const CurrentStep = (steps[step] || steps[steps.length - 1]) as React.FC;

    return (
        <div className="max-w-4xl mx-auto p-6 min-h-screen flex flex-col">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-primary">DeFi Discovery Wizard 🧙‍♂️</h1>
                    <div className="mt-2 h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${(step / (steps.length - 1)) * 100}%` }}
                        />
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">XP Reward</div>
                    <div className="text-2xl font-bold text-primary">{xp}</div>
                </div>
            </header>

            <main className="flex-1">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <CurrentStep />
                    </motion.div>
                </AnimatePresence>
            </main>

            <footer className="mt-8 pt-6 border-t flex justify-between items-center">
                <div className="flex gap-2">
                    {badges.map(badge => (
                        <span key={badge} className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-xs font-bold">
                            {badge}
                        </span>
                    ))}
                </div>
                <div className="text-sm text-muted-foreground">
                    Step {step + 1} of {steps.length}
                </div>
            </footer>
        </div>
    );
};

export default Wizard;
