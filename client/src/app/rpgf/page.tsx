'use client';

import Navbar from '@/components/Navbar';
import { useWallet } from '@/context/WalletContext';

export default function RPGFPage() {
    const { isConnected } = useWallet();

    return (
        <div className="min-h-screen bg-[#09090b]">
            <Navbar />
            <div className="h-16"></div>

            <main className="px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500/10 border border-pink-500/30 rounded-full mb-6">
                        <span className="text-sm text-pink-300 font-medium">🏆 RPGF</span>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-4">Retroactive Public Goods Funding</h1>
                    <p className="text-zinc-400 max-w-2xl mx-auto" style={{ textAlign: 'center' }}>
                        Vote on projects that have already delivered value to the Cedra ecosystem.
                        Allocate your voting power to reward past contributions.
                    </p>
                </div>

                {/* Testnet Notice */}
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3 flex items-center gap-3 mb-8">
                    <span className="text-yellow-400 text-lg">⚠️</span>
                    <p className="text-yellow-300 text-sm">
                        <strong>Testnet Preview:</strong> RPGF rounds and nominations will appear here once smart contracts are deployed.
                    </p>
                </div>

                {/* Stats - All zeros */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="card text-center">
                        <p className="text-zinc-500 text-sm mb-1">Total Pool</p>
                        <p className="text-2xl font-bold text-gradient">0 CED</p>
                    </div>
                    <div className="card text-center">
                        <p className="text-zinc-500 text-sm mb-1">Nominations</p>
                        <p className="text-2xl font-bold text-white">0</p>
                    </div>
                    <div className="card text-center">
                        <p className="text-zinc-500 text-sm mb-1">Total Votes</p>
                        <p className="text-2xl font-bold text-white">0</p>
                    </div>
                    <div className="card text-center">
                        <p className="text-zinc-500 text-sm mb-1">Voters</p>
                        <p className="text-2xl font-bold text-white">0</p>
                    </div>
                </div>

                {/* Empty State */}
                <div className="card text-center py-16">
                    <div className="text-6xl mb-6">🏆</div>
                    <h2 className="text-2xl font-bold text-white mb-4">No Active RPGF Rounds</h2>
                    <p className="text-zinc-400 mb-6 max-w-md mx-auto">
                        RPGF rounds will be created after the rpgf.move contract is deployed to testnet.
                        Nominate projects and vote to reward proven impact!
                    </p>

                    {isConnected ? (
                        <div className="flex flex-wrap justify-center gap-4">
                            <button className="btn-primary" disabled>
                                Nominate Project
                            </button>
                            <button className="btn-secondary" disabled>
                                Cast Votes
                            </button>
                        </div>
                    ) : (
                        <p className="text-zinc-500 text-sm">
                            Connect your wallet to participate in RPGF voting when it goes live.
                        </p>
                    )}
                </div>

                {/* How RPGF Works */}
                <div className="card mt-8 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-purple-500/30">
                    <h3 className="font-bold text-white mb-4 text-lg">How RPGF Works</h3>
                    <div className="grid sm:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mx-auto mb-3 text-2xl">
                                1
                            </div>
                            <h4 className="font-semibold text-white mb-1">Nominate</h4>
                            <p className="text-zinc-400 text-sm">Submit projects that delivered value</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mx-auto mb-3 text-2xl">
                                2
                            </div>
                            <h4 className="font-semibold text-white mb-1">Allocate</h4>
                            <p className="text-zinc-400 text-sm">Distribute your voting power (100%)</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mx-auto mb-3 text-2xl">
                                3
                            </div>
                            <h4 className="font-semibold text-white mb-1">Vote</h4>
                            <p className="text-zinc-400 text-sm">Submit your allocation on-chain</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center mx-auto mb-3 text-2xl">
                                4
                            </div>
                            <h4 className="font-semibold text-white mb-1">Distribute</h4>
                            <p className="text-zinc-400 text-sm">Pool split based on votes</p>
                        </div>
                    </div>
                </div>

                {/* Info Section */}
                <div className="card mt-8">
                    <div className="flex items-start gap-4">
                        <div className="text-4xl">💡</div>
                        <div>
                            <h3 className="font-bold text-white mb-2">Retroactive vs Proactive Funding</h3>
                            <p className="text-zinc-300 text-sm mb-3">
                                Unlike traditional grants that fund promises, RPGF rewards projects that have already proven their value.
                            </p>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="bg-zinc-800/50 rounded-lg p-4">
                                    <h4 className="font-semibold text-white mb-2">Proactive (Traditional)</h4>
                                    <ul className="text-zinc-400 text-sm space-y-1">
                                        <li>• Funds based on proposals</li>
                                        <li>• Risk of projects not delivering</li>
                                        <li>• Evaluation before work is done</li>
                                    </ul>
                                </div>
                                <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-500/30">
                                    <h4 className="font-semibold text-white mb-2">Retroactive (RPGF)</h4>
                                    <ul className="text-zinc-300 text-sm space-y-1">
                                        <li>• Funds based on proven impact</li>
                                        <li>• Zero risk - work already done</li>
                                        <li>• Community evaluates actual value</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contract Info */}
                <div className="card mt-8">
                    <div className="flex items-start gap-4">
                        <div className="text-4xl">📦</div>
                        <div>
                            <h3 className="font-bold text-white mb-2">rpgf.move Contract</h3>
                            <p className="text-zinc-400 text-sm mb-3">
                                The RPGF module implements retroactive public goods funding:
                            </p>
                            <ul className="text-zinc-300 text-sm space-y-1">
                                <li>• Create rounds with <code className="bg-zinc-800 px-2 py-0.5 rounded">create_rpgf_round()</code></li>
                                <li>• Nominate projects with <code className="bg-zinc-800 px-2 py-0.5 rounded">nominate_project()</code></li>
                                <li>• Cast weighted votes with <code className="bg-zinc-800 px-2 py-0.5 rounded">cast_votes()</code></li>
                                <li>• Distribute funds with <code className="bg-zinc-800 px-2 py-0.5 rounded">distribute_rpgf()</code></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
