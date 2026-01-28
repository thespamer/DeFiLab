import React, { useState } from 'react';
import { useGamification } from '../../hooks/useGamification';
import { HelpCircle } from 'lucide-react';

const questions = [
    {
        q: "Who controls your funds in a DeFi protocol?",
        options: ["A centralized bank", "You (and the smart contract code)", "The CEO of Ethereum"],
        correct: 1
    },
    {
        q: "What is 'Gas' in Ethereum?",
        options: ["Fuel for actual cars", "A fee paid to miners/validators", "A type of crypto token"],
        correct: 1
    }
];

const QuizStep: React.FC = () => {
    const { nextStep, addXP, addBadge } = useGamification();
    const [currentQ, setCurrentQ] = useState(0);
    const [selected, setSelected] = useState<number | null>(null);

    const handleNext = () => {
        const question = questions[currentQ];
        if (question && selected === question.correct) {
            addXP(50);
        }

        if (currentQ < questions.length - 1) {
            setCurrentQ(prev => prev + 1);
            setSelected(null);
        } else {
            addBadge('Scholar 📚');
            nextStep();
        }
    };

    return (
        <div className="space-y-8 max-w-2xl mx-auto py-8">
            <div className="flex items-center gap-4 mb-4">
                <HelpCircle className="w-8 h-8 text-primary" />
                <h2 className="text-3xl font-bold">DeFi 101 Quiz</h2>
            </div>

            <div className="bg-card border rounded-2xl p-8 shadow-sm">
                <h3 className="text-xl font-semibold mb-6">{questions[currentQ]?.q}</h3>
                <div className="space-y-3">
                    {questions[currentQ]?.options.map((opt, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelected(idx)}
                            className={`w-full text-left p-4 rounded-xl border transition-colors ${selected === idx ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-accent'
                                }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            <button
                disabled={selected === null}
                onClick={handleNext}
                className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold disabled:opacity-50"
            >
                {currentQ < questions.length - 1 ? "Next Question" : "Finish Quiz"}
            </button>
        </div>
    );
};

export default QuizStep;
