'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useWallet, shortenAddress } from '@/context/WalletContext';

export default function Navbar() {
    const pathname = usePathname();
    const { address, isConnected, isConnecting, connect, disconnect, balance, network } = useWallet();
    const [showModal, setShowModal] = useState(false);

    const navItems = [
        { name: 'Dashboard', href: '/' },
        { name: 'Projects', href: '/projects' },
        { name: 'Rounds', href: '/rounds' },
        { name: 'RPGF', href: '/rpgf' },
    ];

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#09090b] border-b border-zinc-800 h-16">
                <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-lg">
                            🏛️
                        </div>
                        <span className="text-lg font-bold text-white hidden sm:block">CedraGrants</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${pathname === item.href
                                        ? 'text-white bg-zinc-800'
                                        : 'text-zinc-400 hover:text-white'
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        {isConnected && (
                            <>
                                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 rounded-lg border border-zinc-700">
                                    <span className="text-xs text-zinc-400">Network:</span>
                                    <span className="text-xs font-medium text-purple-400">{network}</span>
                                </div>
                                {balance && (
                                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 rounded-lg border border-zinc-700">
                                        <span className="text-xs text-zinc-400">Balance:</span>
                                        <span className="text-sm font-semibold text-white">{balance} CED</span>
                                    </div>
                                )}
                            </>
                        )}

                        {isConnected ? (
                            <button
                                onClick={() => setShowModal(true)}
                                className="btn-secondary text-sm flex items-center gap-2"
                            >
                                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                {shortenAddress(address!)}
                            </button>
                        ) : (
                            <button
                                onClick={connect}
                                disabled={isConnecting}
                                className="btn-primary text-sm"
                            >
                                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            {/* Wallet Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-md w-full mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Wallet Connected</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-zinc-400 hover:text-white text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-zinc-800 rounded-xl p-4">
                                <p className="text-zinc-400 text-xs mb-1">Address</p>
                                <p className="text-white font-mono text-sm break-all">{address}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-zinc-800 rounded-xl p-4">
                                    <p className="text-zinc-400 text-xs mb-1">Balance</p>
                                    <p className="text-white font-bold">{balance || '0.00'} CED</p>
                                </div>
                                <div className="bg-zinc-800 rounded-xl p-4">
                                    <p className="text-zinc-400 text-xs mb-1">Network</p>
                                    <p className="text-purple-400 font-medium">{network}</p>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => {
                                        if (address) {
                                            navigator.clipboard.writeText(address);
                                        }
                                    }}
                                    className="btn-secondary flex-1 text-sm"
                                >
                                    📋 Copy Address
                                </button>
                                <button
                                    onClick={() => {
                                        disconnect();
                                        setShowModal(false);
                                    }}
                                    className="bg-red-500/20 text-red-400 border border-red-500/30 font-semibold px-4 py-2 rounded-lg hover:bg-red-500/30 transition-colors flex-1 text-sm"
                                >
                                    Disconnect
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
