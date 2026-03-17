import React, { useState } from 'react';
import { useGamification } from '../../hooks/useGamification';
import { useWeb3 } from '../../hooks/useWeb3';
import { CheckCircle, XCircle, Loader, Terminal } from 'lucide-react';
import { ethers } from 'ethers';

// ─── Minimal ABIs used only in this test step ─────────────────────────────────

const ERC20_TEST_ABI = [
    "function balanceOf(address) view returns (uint256)",
    "function approve(address,uint256) returns (bool)",
    "function mint(address,uint256)",
];
const FACTORY_TEST_ABI = [
    "function requestTokens(address to)",
    "function usdc() view returns (address)",
    "function pool() view returns (address)",
    "function dex() view returns (address)",
];
const LENDING_TEST_ABI = [
    "function deposit(uint256)",
    "function borrow(uint256)",
    "function deposits(address) view returns (uint256)",
];
const DEX_TEST_ABI = [
    "function swap(address,uint256) returns (uint256)",
    "function getAmountOut(address,uint256) view returns (uint256)",
];
const STAKING_TEST_ABI = [
    "function stake(uint256)",
    "function stakedAmount(address) view returns (uint256)",
];

// ─── Types ────────────────────────────────────────────────────────────────────

type TestStatus = 'pending' | 'running' | 'pass' | 'fail';

interface TestResult {
    name: string;
    status: TestStatus;
    txHash?: string;
    detail?: string;
}

const TEST_NAMES = [
    "Faucet — mint 1000 USDC + 1000 DAI to test wallet",
    "LendingPool.deposit(100 USDC) — record collateral",
    "LendingPool.borrow(50 USDC) — 50% LTV",
    "BasicDEX.getAmountOut(100 USDC) — AMM quote (view)",
    "BasicDEX.swap(10 USDC → DAI) — x*y=k formula",
    "StakingRewards.stake(20 USDC) — farm deposit",
];

// ─── Component ────────────────────────────────────────────────────────────────

const ContractTestStep: React.FC = () => {
    const { nextStep, addXP, addBadge } = useGamification();
    const { contracts } = useWeb3();

    const [results, setResults] = useState<TestResult[]>(
        TEST_NAMES.map(name => ({ name, status: 'pending' }))
    );
    const [running, setRunning]   = useState(false);
    const [finished, setFinished] = useState(false);

    const update = (idx: number, patch: Partial<TestResult>) =>
        setResults(prev => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

    const runTests = async () => {
        if (!contracts) return;
        setRunning(true);
        setFinished(false);

        try {
            // Use a direct JsonRpc provider pointing at the Hardhat devnet so we
            // don't consume the MetaMask user's own tokens during the test suite.
            const rpcProvider = new ethers.JsonRpcProvider('http://localhost:8545');
            const signers     = await rpcProvider.listAccounts();  // returns JsonRpcSigner[]
            const testSigner  = signers[2];                        // account #2 (not the user's MetaMask account)
            const testAddr    = testSigner.address;

            const { addresses } = contracts;
            const usdc    = new ethers.Contract(addresses.usdc,    ERC20_TEST_ABI,   testSigner);
            const factory = new ethers.Contract(addresses.factory, FACTORY_TEST_ABI, testSigner);
            const pool    = new ethers.Contract(addresses.pool,    LENDING_TEST_ABI, testSigner);
            const dex     = new ethers.Contract(addresses.dex,     DEX_TEST_ABI,     testSigner);
            const staking = new ethers.Contract(addresses.staking, STAKING_TEST_ABI, testSigner);

            // ── Test 0: Faucet ─────────────────────────────────────────────────
            update(0, { status: 'running' });
            try {
                const tx  = await factory.requestTokens(testAddr);
                await tx.wait();
                const bal = await usdc.balanceOf(testAddr);
                if (bal > 0n) {
                    update(0, { status: 'pass', txHash: tx.hash, detail: `Balance: ${ethers.formatEther(bal)} USDC` });
                } else {
                    update(0, { status: 'fail', detail: 'Balance still 0 after faucet' });
                }
            } catch (e: unknown) {
                update(0, { status: 'fail', detail: (e as Error).message });
            }

            // ── Test 1: Deposit ────────────────────────────────────────────────
            update(1, { status: 'running' });
            try {
                const amount = ethers.parseEther("100");
                await (await usdc.approve(addresses.pool, amount)).wait();
                const tx  = await pool.deposit(amount);
                await tx.wait();
                const dep = await pool.deposits(testAddr);
                if (dep >= amount) {
                    update(1, { status: 'pass', txHash: tx.hash, detail: `Deposited: ${ethers.formatEther(dep)} USDC` });
                } else {
                    update(1, { status: 'fail', detail: 'Deposit mapping not updated' });
                }
            } catch (e: unknown) {
                update(1, { status: 'fail', detail: (e as Error).message });
            }

            // ── Test 2: Borrow ─────────────────────────────────────────────────
            update(2, { status: 'running' });
            try {
                const amount = ethers.parseEther("50");
                const tx = await pool.borrow(amount);
                await tx.wait();
                update(2, { status: 'pass', txHash: tx.hash, detail: 'Borrowed 50 USDC (50% LTV ✓)' });
            } catch (e: unknown) {
                update(2, { status: 'fail', detail: (e as Error).message });
            }

            // ── Test 3: AMM quote (view) ───────────────────────────────────────
            update(3, { status: 'running' });
            try {
                const amtIn = ethers.parseEther("100");
                const quote = await dex.getAmountOut(addresses.usdc, amtIn);
                if (quote > 0n) {
                    update(3, { status: 'pass', detail: `Quote ≈ ${parseFloat(ethers.formatEther(quote)).toFixed(4)} DAI` });
                } else {
                    update(3, { status: 'fail', detail: 'Quote returned 0' });
                }
            } catch (e: unknown) {
                update(3, { status: 'fail', detail: (e as Error).message });
            }

            // ── Test 4: Swap ───────────────────────────────────────────────────
            update(4, { status: 'running' });
            try {
                const amtIn = ethers.parseEther("10");
                await (await usdc.approve(addresses.dex, amtIn)).wait();
                const tx      = await dex.swap(addresses.usdc, amtIn);
                const receipt = await tx.wait();
                update(4, {
                    status: 'pass',
                    txHash: tx.hash,
                    detail: `Confirmed in block ${receipt.blockNumber}`,
                });
            } catch (e: unknown) {
                update(4, { status: 'fail', detail: (e as Error).message });
            }

            // ── Test 5: Stake ──────────────────────────────────────────────────
            update(5, { status: 'running' });
            try {
                const amount = ethers.parseEther("20");
                await (await usdc.approve(addresses.staking, amount)).wait();
                const tx     = await staking.stake(amount);
                await tx.wait();
                const staked = await staking.stakedAmount(testAddr);
                if (staked >= amount) {
                    update(5, { status: 'pass', txHash: tx.hash, detail: `Staked: ${ethers.formatEther(staked)} USDC` });
                } else {
                    update(5, { status: 'fail', detail: 'stakedAmount mismatch' });
                }
            } catch (e: unknown) {
                update(5, { status: 'fail', detail: (e as Error).message });
            }

        } catch (fatalErr) {
            console.error('ContractTestStep fatal error:', fatalErr);
        }

        setRunning(false);
        setFinished(true);
    };

    const passCount = results.filter(r => r.status === 'pass').length;
    const allPass   = passCount === TEST_NAMES.length;

    return (
        <div className="space-y-6 py-8">
            {/* Header */}
            <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-2">
                    <Terminal className="w-8 h-8 text-primary" />
                    <h2 className="text-3xl font-extrabold">Contract Test Suite</h2>
                </div>
                <p className="text-muted-foreground max-w-lg mx-auto">
                    Automated tests run directly against the local Hardhat devnet to prove every
                    smart contract works before you interact with them.
                </p>
            </div>

            {/* Test list */}
            <div className="max-w-2xl mx-auto space-y-3">
                {results.map((r, i) => (
                    <div
                        key={i}
                        className={`p-4 rounded-xl border font-mono text-sm flex items-start gap-3 transition-all ${
                            r.status === 'pass'    ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' :
                            r.status === 'fail'    ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800' :
                            r.status === 'running' ? 'bg-primary/5 border-primary/30 animate-pulse' :
                            'bg-card border'
                        }`}
                    >
                        <div className="mt-0.5 shrink-0">
                            {r.status === 'pass'    && <CheckCircle className="w-5 h-5 text-green-500" />}
                            {r.status === 'fail'    && <XCircle    className="w-5 h-5 text-red-500"   />}
                            {r.status === 'running' && <Loader      className="w-5 h-5 text-primary animate-spin" />}
                            {r.status === 'pending' && <div className="w-5 h-5 rounded-full border-2 border-muted" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className={`font-semibold ${r.status === 'running' ? 'text-primary' : ''}`}>{r.name}</div>
                            {r.detail  && <div className="text-xs text-muted-foreground mt-1">{r.detail}</div>}
                            {r.txHash  && <div className="text-xs text-primary/70 mt-1 truncate">tx: {r.txHash}</div>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Score */}
            {finished && (
                <div className={`text-center text-sm font-bold py-2 px-4 rounded-xl max-w-xs mx-auto ${
                    allPass ? 'text-green-600 bg-green-50 dark:bg-green-950/20' : 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20'
                }`}>
                    {passCount}/{TEST_NAMES.length} tests passed
                    {allPass ? ' 🎉' : ''}
                </div>
            )}

            {/* CTA */}
            <div className="text-center pt-4">
                {!running && !finished && (
                    <button
                        onClick={runTests}
                        disabled={!contracts}
                        className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:scale-105 transition-transform disabled:opacity-50"
                    >
                        {contracts ? '▶ Run Tests' : 'Connect wallet first'}
                    </button>
                )}

                {running && (
                    <div className="flex items-center justify-center gap-2 text-primary font-bold">
                        <Loader className="animate-spin" /> Running tests on devnet…
                    </div>
                )}

                {finished && (
                    <button
                        onClick={() => { addXP(150); addBadge('Test Engineer 🧪'); nextStep(); }}
                        className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:scale-105 transition-transform"
                    >
                        {allPass ? '✅ All Pass! Continue →' : `Continue (${passCount}/${TEST_NAMES.length}) →`}
                    </button>
                )}
            </div>
        </div>
    );
};

export default ContractTestStep;
