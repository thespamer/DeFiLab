import React, { useState } from 'react';
import { useGamification } from '../../hooks/useGamification';
import { useWeb3 } from '../../hooks/useWeb3';
import { CheckCircle, Loader } from 'lucide-react';
import { ethers } from 'ethers';

interface YieldItem {
    id: string;
    title: string;
    subtitle: string;
    color: string;
}

const ITEMS: YieldItem[] = [
    { id: '1', title: 'Deposit in Lending',   subtitle: '50 USDC → SimpleLendingPool',  color: 'bg-blue-500'   },
    { id: '2', title: 'Swap for LP Tokens',   subtitle: '25 USDC → DAI via BasicDEX',   color: 'bg-purple-500' },
    { id: '3', title: 'Stake in Farm',         subtitle: '30 USDC → StakingRewards',     color: 'bg-green-500'  },
];

const YieldStep: React.FC = () => {
    const { nextStep, addXP, addBadge }  = useGamification();
    const { contracts, account, addTx }  = useWeb3();

    const [completed, setCompleted] = useState<string[]>([]);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [txHashes,  setTxHashes]  = useState<Record<string, string>>({});
    const [errors,    setErrors]    = useState<Record<string, string>>({});

    const execute = async (id: string) => {
        if (!contracts || !account || completed.includes(id)) return;
        setLoadingId(id);
        setErrors(prev => ({ ...prev, [id]: '' }));

        try {
            let tx;
            if (id === '1') {
                const amt    = ethers.parseEther("50");
                const appTx  = await contracts.usdc.approve(contracts.addresses.pool, amt);
                await appTx.wait();
                tx = await contracts.pool.deposit(amt);
                await tx.wait();
                addTx(tx.hash, 'Yield: Deposit 50 USDC → LendingPool');
            } else if (id === '2') {
                const amt   = ethers.parseEther("25");
                const appTx = await contracts.usdc.approve(contracts.addresses.dex, amt);
                await appTx.wait();
                tx = await contracts.dex.swap(contracts.addresses.usdc, amt);
                await tx.wait();
                addTx(tx.hash, 'Yield: Swap 25 USDC → DAI');
            } else if (id === '3') {
                const amt   = ethers.parseEther("30");
                const appTx = await contracts.usdc.approve(contracts.addresses.staking, amt);
                await appTx.wait();
                tx = await contracts.staking.stake(amt);
                await tx.wait();
                addTx(tx.hash, 'Yield: Stake 30 USDC → Farm');
            }

            if (tx) {
                setTxHashes(prev => ({ ...prev, [id]: tx.hash }));
                setCompleted(prev => [...prev, id]);
                addXP(50);
            }
        } catch (e: unknown) {
            const err = e as { reason?: string; message?: string };
            setErrors(prev => ({ ...prev, [id]: err.reason ?? err.message ?? 'Failed' }));
        } finally {
            setLoadingId(null);
        }
    };

    const claimYield = async () => {
        if (!contracts) return;
        setLoadingId('claim');
        setErrors(prev => ({ ...prev, claim: '' }));
        try {
            // claimReward() never reverts even if reward is 0
            const tx = await contracts.staking.claimReward();
            await tx.wait();
            addTx(tx.hash, 'Yield: Claim staking rewards');
            addBadge('Yielder Pro 🌾');
            nextStep();
        } catch (e: unknown) {
            const err = e as { reason?: string; message?: string };
            setErrors(prev => ({ ...prev, claim: err.reason ?? err.message ?? 'Claim failed' }));
        } finally {
            setLoadingId(null);
        }
    };

    const allDone = completed.length === ITEMS.length;

    return (
        <div className="space-y-8 py-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">The Yield Super-Combo 🧩</h2>
                <p className="text-muted-foreground max-w-lg mx-auto">
                    DeFi protocols compose like Legos. Click each action to send a real transaction on the devnet.
                </p>
            </div>

            <div className="grid gap-4 max-w-md mx-auto">
                {ITEMS.map(item => (
                    <div key={item.id}>
                        <button
                            onClick={() => execute(item.id)}
                            disabled={!!loadingId || completed.includes(item.id) || !contracts}
                            className={`w-full p-6 rounded-2xl text-white font-bold text-lg flex justify-between items-center transition-all ${
                                completed.includes(item.id)
                                    ? 'bg-gray-400 opacity-60 scale-95'
                                    : loadingId === item.id
                                        ? `${item.color} opacity-75`
                                        : `${item.color} shadow-lg hover:scale-105 disabled:opacity-50`
                            }`}
                        >
                            <div className="text-left">
                                <div>{item.title}</div>
                                <div className="text-xs font-normal opacity-80 mt-1">{item.subtitle}</div>
                            </div>
                            {loadingId === item.id        && <Loader       className="w-6 h-6 animate-spin" />}
                            {completed.includes(item.id)  && <CheckCircle  className="w-6 h-6" />}
                        </button>

                        {txHashes[item.id] && (
                            <div className="text-xs font-mono text-muted-foreground mt-1 px-2 truncate">
                                tx: {txHashes[item.id]}
                            </div>
                        )}
                        {errors[item.id] && (
                            <div className="text-xs text-red-500 mt-1 px-2">{errors[item.id]}</div>
                        )}
                    </div>
                ))}
            </div>

            {allDone && (
                <div className="text-center pt-8 animate-bounce">
                    {errors.claim && (
                        <div className="text-red-500 text-sm mb-3">{errors.claim}</div>
                    )}
                    <button
                        onClick={claimYield}
                        disabled={loadingId === 'claim'}
                        className="px-10 py-5 bg-primary text-primary-foreground rounded-2xl font-black text-xl shadow-2xl hover:scale-105 transition-transform disabled:opacity-50 flex items-center gap-3 mx-auto"
                    >
                        {loadingId === 'claim'
                            ? <><Loader className="animate-spin" /> Claiming…</>
                            : 'Claim Super Yield! 🌾'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default YieldStep;
