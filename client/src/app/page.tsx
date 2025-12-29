'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useWallet } from '@/context/WalletContext';
import { useProtocolStats, useContractsDeployed } from '@/hooks/useContracts';

export default function Home() {
  const { isConnected, balance } = useWallet();
  const contractsDeployed = useContractsDeployed();
  const { projectCount, roundCount, loading: statsLoading } = useProtocolStats();

  return (
    <div className="min-h-screen bg-[#09090b]">
      <Navbar />

      {/* Spacer for fixed navbar */}
      <div className="h-16"></div>

      <main>
        {/* Testnet Notice */}
        <div className="px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3 flex items-center gap-3">
            <span className="text-yellow-400 text-lg">⚠️</span>
            <p className="text-yellow-300 text-sm">
              <strong>Testnet Preview:</strong> Connect your wallet to interact. Contract data will be live after deployment.
            </p>
          </div>
        </div>

        {/* ===== HERO ===== */}
        <section className="px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm text-purple-300 font-medium">Round 1 is Live!</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Fund <span className="text-gradient">Public Goods</span>
            <br />on Cedra
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 mb-10 max-w-2xl mx-auto" style={{ textAlign: 'center' }}>
            Quadratic funding amplifies community voice. Small donations become
            big impact through mathematical matching pools.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/projects" className="btn-primary">Explore Projects</Link>
            <button className="btn-secondary">Submit Project</button>
          </div>
        </section>

        {/* ===== YOUR WALLET (only when connected) ===== */}
        {isConnected && (
          <section className="px-4 sm:px-6 lg:px-8 mb-16">
            <div className="card bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white mb-1">Your Wallet</h2>
                  <p className="text-zinc-400 text-sm">Connected to Cedra Testnet</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-zinc-500 text-xs">Balance</p>
                    <p className="text-2xl font-bold text-gradient">{balance || '0.00'} APT</p>
                  </div>
                  <div className="text-center">
                    <p className="text-zinc-500 text-xs">Contributions</p>
                    <p className="text-2xl font-bold text-white">0</p>
                  </div>
                  <div className="text-center">
                    <p className="text-zinc-500 text-xs">Projects Backed</p>
                    <p className="text-2xl font-bold text-white">0</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ===== STATS ===== */}
        <section className="px-4 sm:px-6 lg:px-8 mb-16">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold text-white">Protocol Stats</h2>
            <span className="badge badge-yellow text-xs">{contractsDeployed ? 'Live' : 'Testnet'}</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Funded', value: '0 CED', icon: '💰' },
              { label: 'Active Projects', value: statsLoading ? '...' : String(projectCount), icon: '🚀' },
              { label: 'Funding Rounds', value: statsLoading ? '...' : String(roundCount), icon: '🎯' },
              { label: 'Contributors', value: '0', icon: '👥' },
            ].map((stat) => (
              <div key={stat.label} className="card">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-zinc-500 text-xs sm:text-sm mb-1 truncate">{stat.label}</p>
                    <p className="text-lg sm:text-2xl font-bold text-white truncate">{stat.value}</p>
                  </div>
                  <span className="text-xl sm:text-2xl ml-2">{stat.icon}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== FUNDING ROUNDS ===== */}
        <section className="px-4 sm:px-6 lg:px-8 mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Funding Rounds</h2>
            <Link href="/rounds" className="text-purple-400 text-sm font-medium hover:text-purple-300">View All →</Link>
          </div>

          <div className="card text-center py-12">
            <div className="text-5xl mb-4">🏗️</div>
            <h3 className="text-xl font-bold text-white mb-2">Contracts Not Yet Deployed</h3>
            <p className="text-zinc-400 mb-4">Funding rounds will appear here once smart contracts are deployed to testnet.</p>
            <Link href="/rounds" className="btn-secondary">View Sample Rounds</Link>
          </div>
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section className="px-4 sm:px-6 lg:px-8 mb-16">
          <div className="card text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">How Quadratic Funding Works</h2>
            <p className="text-zinc-400 text-sm mb-8">Community-driven matching that amplifies small donations</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { num: '1', title: 'Contribute', desc: 'Donate any amount. Even 1 CED matters!' },
                { num: '2', title: 'Matching Magic', desc: 'More donors = more matching. (Σ√contributions)²' },
                { num: '3', title: 'Distribute', desc: 'Pool distributed by community preference.' },
              ].map((step) => (
                <div key={step.num}>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-zinc-800 flex items-center justify-center mx-auto mb-3 text-lg font-bold text-purple-400">
                    {step.num}
                  </div>
                  <h3 className="font-semibold text-white mb-1 text-sm sm:text-base">{step.title}</h3>
                  <p className="text-zinc-400 text-xs sm:text-sm">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== VRF BANNER ===== */}
        <section className="px-4 sm:px-6 lg:px-8 mb-16">
          <div className="card bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-500/30">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
              <div className="text-5xl sm:text-6xl">🎲</div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white mb-2">VRF-Powered Anti-Sybil</h2>
                <p className="text-zinc-300 text-sm mb-3">
                  CedraGrants uses Cedra&apos;s native on-chain randomness (VRF) to fairly select
                  contributors for verification. Only possible on Cedra!
                </p>
                <button className="btn-secondary text-sm">Learn More</button>
              </div>
            </div>
          </div>
        </section>

        {/* ===== FOOTER ===== */}
        <footer className="border-t border-zinc-800 py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-sm">🏛️</div>
              <span className="font-semibold text-white">CedraGrants</span>
            </div>
            <p className="text-zinc-500 text-sm">Built with 💜 for Cedra Builders Forge</p>
            <div className="flex gap-4 text-sm">
              <a href="#" className="text-zinc-400 hover:text-white">GitHub</a>
              <a href="#" className="text-zinc-400 hover:text-white">Docs</a>
              <a href="#" className="text-zinc-400 hover:text-white">Telegram</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
