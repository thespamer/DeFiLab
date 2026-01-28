import React from 'react';
import { useGamification } from '../../hooks/useGamification';
import { ShieldCheck, Zap, Layers } from 'lucide-react';

const ArsenalStep: React.FC = () => {
    const { nextStep, addXP, addBadge } = useGamification();

    const arsenal = [
        { title: "Lending", icon: <ShieldCheck />, desc: "💰 Deposite USDC → Ganhe juros automáticos → Outros pagam pra você" },
        { title: "DEX", icon: <Zap />, desc: "🔄 Swap P2P sem CEX. x*y=k math define preço" },
        { title: "Gas", icon: <Layers />, desc: "⛽ Taxa mineradores. ETH nativo sempre" },
        { title: "Composability", icon: <Layers />, desc: "🧩 Legos: Lending+DEX+Farm=Super Yield" }
    ];

    return (
        <div className="space-y-8 py-8">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold mb-4">Your DeFi Arsenal</h2>
                <p className="text-muted-foreground">Hover over the cards to learn the core concepts.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {arsenal.map((item, idx) => (
                    <div
                        key={idx}
                        className="group relative p-6 bg-card border rounded-2xl hover:border-primary transition-all cursor-help"
                    >
                        <div className="flex items-center gap-4 mb-3 text-primary">
                            {item.icon}
                            <h3 className="text-xl font-bold">{item.title}</h3>
                        </div>
                        <p className="text-muted-foreground group-hover:text-foreground transition-colors">
                            {item.desc}
                        </p>
                    </div>
                ))}
            </div>

            <div className="pt-8 text-center">
                <button
                    onClick={() => { addXP(50); addBadge('Explorer 🗺️'); nextStep(); }}
                    className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-bold"
                >
                    Got it! Let's get hands-on
                </button>
            </div>
        </div>
    );
};

export default ArsenalStep;
