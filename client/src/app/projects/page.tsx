'use client';

import Navbar from '@/components/Navbar';
import { useWallet } from '@/context/WalletContext';

export default function ProjectsPage() {
    const { isConnected } = useWallet();

    return (
        <div className="min-h-screen bg-[#09090b]">
            <Navbar />
            <div className="h-16"></div>

            <main className="px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">All Projects</h1>
                        <p className="text-zinc-400">Discover and fund public goods on Cedra</p>
                    </div>
                    <button className="btn-primary" disabled>Submit Project</button>
                </div>

                {/* Testnet Notice */}
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3 flex items-center gap-3 mb-8">
                    <span className="text-yellow-400 text-lg">⚠️</span>
                    <p className="text-yellow-300 text-sm">
                        <strong>Testnet Preview:</strong> Projects will appear here once smart contracts are deployed.
                    </p>
                </div>

                {/* Empty State */}
                <div className="card text-center py-16">
                    <div className="text-6xl mb-6">🏗️</div>
                    <h2 className="text-2xl font-bold text-white mb-4">Contracts Not Yet Deployed</h2>
                    <p className="text-zinc-400 mb-6 max-w-md mx-auto">
                        Project registry will be populated from the blockchain once the CedraGrants smart contracts are deployed to testnet.
                    </p>

                    <div className="flex flex-wrap justify-center gap-4 mb-8">
                        <div className="bg-zinc-800/50 rounded-lg px-6 py-4">
                            <p className="text-zinc-500 text-sm">Registered Projects</p>
                            <p className="text-3xl font-bold text-white">0</p>
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg px-6 py-4">
                            <p className="text-zinc-500 text-sm">Total Funding</p>
                            <p className="text-3xl font-bold text-gradient">0 CED</p>
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg px-6 py-4">
                            <p className="text-zinc-500 text-sm">Contributors</p>
                            <p className="text-3xl font-bold text-white">0</p>
                        </div>
                    </div>

                    {!isConnected && (
                        <p className="text-zinc-500 text-sm">
                            Connect your wallet to interact with the protocol when it&apos;s live.
                        </p>
                    )}
                </div>

                {/* What Projects Can Do */}
                <div className="card mt-8 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
                    <h3 className="font-bold text-white mb-4 text-lg">What Projects Can Do on CedraGrants</h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-zinc-800/50 rounded-lg p-4">
                            <div className="text-2xl mb-2">📝</div>
                            <h4 className="font-semibold text-white mb-1">Register</h4>
                            <p className="text-zinc-400 text-sm">Submit your project with milestones and funding goals</p>
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg p-4">
                            <div className="text-2xl mb-2">💰</div>
                            <h4 className="font-semibold text-white mb-1">Receive Funding</h4>
                            <p className="text-zinc-400 text-sm">Get quadratic matching from community contributions</p>
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg p-4">
                            <div className="text-2xl mb-2">📊</div>
                            <h4 className="font-semibold text-white mb-1">Track Progress</h4>
                            <p className="text-zinc-400 text-sm">Submit milestone evidence for community verification</p>
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg p-4">
                            <div className="text-2xl mb-2">🏆</div>
                            <h4 className="font-semibold text-white mb-1">Earn RPGF</h4>
                            <p className="text-zinc-400 text-sm">Get retroactive rewards for proven impact</p>
                        </div>
                    </div>
                </div>

                {/* Registry Contract Info */}
                <div className="card mt-8">
                    <div className="flex items-start gap-4">
                        <div className="text-4xl">📦</div>
                        <div>
                            <h3 className="font-bold text-white mb-2">registry.move Contract</h3>
                            <p className="text-zinc-400 text-sm mb-3">
                                The registry module manages project registration and lifecycle. Once deployed, projects can:
                            </p>
                            <ul className="text-zinc-300 text-sm space-y-1">
                                <li>• Register with <code className="bg-zinc-800 px-2 py-0.5 rounded">register_project()</code></li>
                                <li>• Track milestones and funding progress on-chain</li>
                                <li>• Emit events for real-time indexer updates</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
