'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useMemo } from 'react';
import { Cedra, CedraConfig, Network } from '@cedra-labs/ts-sdk';
import {
    AptosWalletAdapterProvider,
    useWallet as useAptosWallet
} from '@aptos-labs/wallet-adapter-react';
import { PetraWallet } from 'petra-plugin-wallet-adapter';

interface WalletContextType {
    address: string | null;
    isConnected: boolean;
    isConnecting: boolean;
    connect: () => Promise<void>;
    disconnect: () => void;
    balance: string | null;
    network: string;
    cedra: Cedra | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Inner provider that uses the Aptos wallet hook
function WalletProviderInner({ children }: { children: ReactNode }) {
    const aptosWallet = useAptosWallet();
    const [balance, setBalance] = useState<string | null>(null);

    // Initialize Cedra SDK
    const cedra = useMemo(() => {
        const config = new CedraConfig({ network: Network.TESTNET });
        return new Cedra(config);
    }, []);

    // Fetch balance when address changes
    useEffect(() => {
        async function fetchBalance() {
            if (aptosWallet.account?.address && cedra) {
                try {
                    const accountBalance = await cedra.getAccountCoinAmount({
                        accountAddress: aptosWallet.account.address.toString(),
                        coinType: '0x1::cedra_coin::CedraCoin',
                    });
                    const formattedBalance = (Number(accountBalance) / 1e8).toFixed(2);
                    setBalance(formattedBalance);
                } catch (error) {
                    console.log('Could not fetch Cedra balance, trying APT:', error);
                    // Try APT coin as fallback
                    try {
                        const aptBalance = await cedra.getAccountCoinAmount({
                            accountAddress: aptosWallet.account.address.toString(),
                            coinType: '0x1::aptos_coin::AptosCoin',
                        });
                        const formattedBalance = (Number(aptBalance) / 1e8).toFixed(2);
                        setBalance(formattedBalance);
                    } catch {
                        setBalance('0.00');
                    }
                }
            } else {
                setBalance(null);
            }
        }
        fetchBalance();
    }, [aptosWallet.account?.address, cedra]);

    const connect = useCallback(async () => {
        try {
            // Use Aptos wallet adapter's built-in connect
            if (aptosWallet.wallets.length > 0) {
                const petra = aptosWallet.wallets.find(w => w.name === 'Petra');
                if (petra) {
                    await aptosWallet.connect(petra.name);
                } else {
                    // Connect to first available wallet
                    await aptosWallet.connect(aptosWallet.wallets[0].name);
                }
            }
        } catch (error) {
            console.error('Failed to connect wallet:', error);
        }
    }, [aptosWallet]);

    const disconnect = useCallback(async () => {
        try {
            await aptosWallet.disconnect();
        } catch (error) {
            console.error('Failed to disconnect:', error);
        }
    }, [aptosWallet]);

    const value: WalletContextType = {
        address: aptosWallet.account?.address?.toString() || null,
        isConnected: aptosWallet.connected,
        isConnecting: aptosWallet.connecting,
        connect,
        disconnect,
        balance,
        network: aptosWallet.network?.name || 'unknown',
        cedra,
    };

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
}

// Outer provider that sets up the Aptos wallet adapter
export function WalletProvider({ children }: { children: ReactNode }) {
    const wallets = [new PetraWallet()];

    return (
        <AptosWalletAdapterProvider
            plugins={wallets}
            autoConnect={true}
            onError={(error) => console.error('Wallet error:', error)}
        >
            <WalletProviderInner>
                {children}
            </WalletProviderInner>
        </AptosWalletAdapterProvider>
    );
}

export function useWallet() {
    const context = useContext(WalletContext);
    if (context === undefined) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
}

// Helper to shorten address display
export function shortenAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
