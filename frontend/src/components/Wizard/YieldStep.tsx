import React, { useState } from 'react';
import { useGamification } from '../../hooks/useGamification';
import { CheckCircle } from 'lucide-react';

const YieldStep: React.FC = () => {
    const { nextStep, addXP, addBadge } = useGamification();
    const [completed, setCompleted] = useState<string[]>([]);

    const toggle = (id: string) => {
        if (!completed.includes(id)) {
            setCompleted([...completed, id]);
            addXP(50);
        }
    };

    const isFull = completed.length === 3;

    return (
        <div className="space-y-8 py-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">The Yield Super-Combo 🧩</h2>
                <p className="text-muted-foreground max-w-lg mx-auto">
                    DeFi is built like Legos. Combine these protocols to maximize your yield!
                </p>
            </div>

            <div className="grid gap-4 max-w-md mx-auto">
                {[
                    { id: '1', title: 'Deposit in Lending', color: 'bg-blue-500' },
                    { id: '2', title: 'Swap for LP Tokens', color: 'bg-purple-500' },
                    { id: '3', title: 'Stake in Farm', color: 'bg-green-500' }
                ].map((item) => (
                    <button
                        key={item.id}
                        onClick={() => toggle(item.id)}
                        className={`p-6 rounded-2xl text-white font-bold text-lg flex justify-between items-center transition-all ${completed.includes(item.id) ? 'opacity-50 scale-95' : `${item.color} shadow-lg shadow-${item.color.split('-')[1]}-500/20 hover:scale-105`
                            }`}
                    >
                        {item.title}
                        {completed.includes(item.id) && <CheckCircle className="w-6 h-6" />}
                    </button>
                ))}
            </div>

            {isFull && (
                <div className="text-center pt-8 animate-bounce">
                    <button
                        onClick={() => { addBadge('Yielder Pro 🌾'); nextStep(); }}
                        className="px-10 py-5 bg-primary text-primary-foreground rounded-2xl font-black text-xl shadow-2xl"
                    >
                        Claim Super Yield!
                    </button>
                </div>
            )}
        </div>
    );
};

export default YieldStep;
