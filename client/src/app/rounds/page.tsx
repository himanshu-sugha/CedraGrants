'use client';

import Navbar from '@/components/Navbar';
import { useWallet } from '@/context/WalletContext';

export default function RoundsPage() {
    const { isConnected } = useWallet();

    return (
        <div className="min-h-screen bg-[#09090b]">
            <Navbar />
            <div className="h-16"></div>

            <main className="px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-3xl font-bold text-white mb-2">Funding Rounds</h1>
                    <p className="text-zinc-400">Quadratic funding rounds for Cedra public goods</p>
                </div>

                {/* Testnet Notice */}
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3 flex items-center gap-3 mb-8">
                    <span className="text-yellow-400 text-lg">⚠️</span>
                    <p className="text-yellow-300 text-sm">
                        <strong>Testnet Preview:</strong> Funding rounds will appear here once smart contracts are deployed.
                    </p>
                </div>

                {/* Stats Grid - All zeros */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="card text-center">
                        <p className="text-zinc-500 text-sm mb-1">Active Rounds</p>
                        <p className="text-2xl font-bold text-white">0</p>
                    </div>
                    <div className="card text-center">
                        <p className="text-zinc-500 text-sm mb-1">Total Matching Pools</p>
                        <p className="text-2xl font-bold text-gradient">0 CED</p>
                    </div>
                    <div className="card text-center">
                        <p className="text-zinc-500 text-sm mb-1">Projects Funded</p>
                        <p className="text-2xl font-bold text-white">0</p>
                    </div>
                    <div className="card text-center">
                        <p className="text-zinc-500 text-sm mb-1">Total Contributors</p>
                        <p className="text-2xl font-bold text-white">0</p>
                    </div>
                </div>

                {/* Empty State */}
                <div className="card text-center py-16">
                    <div className="text-6xl mb-6">🎯</div>
                    <h2 className="text-2xl font-bold text-white mb-4">No Active Funding Rounds</h2>
                    <p className="text-zinc-400 mb-6 max-w-md mx-auto">
                        Funding rounds will be created after the quadratic_funding.move contract is deployed to testnet.
                    </p>

                    {isConnected ? (
                        <button className="btn-primary" disabled>
                            Create Round (Admin Only)
                        </button>
                    ) : (
                        <p className="text-zinc-500 text-sm">
                            Connect your wallet to participate in funding rounds when they go live.
                        </p>
                    )}
                </div>

                {/* How Rounds Work */}
                <div className="card mt-8 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
                    <h3 className="font-bold text-white mb-4 text-lg">How Funding Rounds Work</h3>
                    <div className="grid sm:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mx-auto mb-3 text-2xl">
                                1
                            </div>
                            <h4 className="font-semibold text-white mb-1">Round Created</h4>
                            <p className="text-zinc-400 text-sm">Admin creates round with matching pool and project list</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mx-auto mb-3 text-2xl">
                                2
                            </div>
                            <h4 className="font-semibold text-white mb-1">Community Contributes</h4>
                            <p className="text-zinc-400 text-sm">Users donate to projects during the funding period</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mx-auto mb-3 text-2xl">
                                3
                            </div>
                            <h4 className="font-semibold text-white mb-1">Matching Distributed</h4>
                            <p className="text-zinc-400 text-sm">QF formula calculates and distributes matching funds</p>
                        </div>
                    </div>
                </div>

                {/* QF Explainer */}
                <div className="card mt-8">
                    <div className="flex items-start gap-4">
                        <div className="text-4xl">📊</div>
                        <div>
                            <h3 className="font-bold text-white mb-2">Quadratic Funding Formula</h3>
                            <p className="text-zinc-300 text-sm mb-3">
                                Matching amount for each project is calculated as: <code className="bg-zinc-800 px-2 py-1 rounded">(Σ√contributions)² - Σcontributions</code>
                            </p>
                            <p className="text-zinc-400 text-sm">
                                This means many small donations are more powerful than a few large ones.
                                A project with 100 donors giving 1 CED each gets more matching than one donor giving 100 CED!
                            </p>
                        </div>
                    </div>
                </div>

                {/* Contract Info */}
                <div className="card mt-8">
                    <div className="flex items-start gap-4">
                        <div className="text-4xl">📦</div>
                        <div>
                            <h3 className="font-bold text-white mb-2">quadratic_funding.move Contract</h3>
                            <p className="text-zinc-400 text-sm mb-3">
                                The QF module implements the full quadratic funding mechanism:
                            </p>
                            <ul className="text-zinc-300 text-sm space-y-1">
                                <li>• Create rounds with <code className="bg-zinc-800 px-2 py-0.5 rounded">create_round()</code></li>
                                <li>• Contribute to projects with <code className="bg-zinc-800 px-2 py-0.5 rounded">contribute()</code></li>
                                <li>• Distribute matching with <code className="bg-zinc-800 px-2 py-0.5 rounded">distribute_matching()</code></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
