'use client';

/**
 * React hooks for CedraGrants contract interactions
 * 
 * These hooks provide easy access to contract data with
 * automatic loading states and error handling.
 */

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@/context/WalletContext';
import {
    CONTRACT_ADDRESS,
    getProjectCount,
    getAllProjects,
    getProject,
    getRoundCount,
    isVerified,
    getRPGFRoundCount,
    buildContributeTx,
    buildCastVotesTx,
    executeTransaction,
    Project,
} from '@/lib/contracts';

// ==================== Hook: Check if contracts are deployed ====================

export function useContractsDeployed(): boolean {
    // Returns true if CONTRACT_ADDRESS is set (not 0x0)
    return CONTRACT_ADDRESS !== '0x0' && CONTRACT_ADDRESS !== '';
}

// ==================== Hook: Protocol Stats ====================

interface ProtocolStats {
    projectCount: number;
    roundCount: number;
    rpgfRoundCount: number;
    loading: boolean;
    error: string | null;
}

export function useProtocolStats(): ProtocolStats {
    const { cedra } = useWallet();
    const contractsDeployed = useContractsDeployed();
    const [stats, setStats] = useState<ProtocolStats>({
        projectCount: 0,
        roundCount: 0,
        rpgfRoundCount: 0,
        loading: true,
        error: null,
    });

    useEffect(() => {
        async function fetchStats() {
            if (!cedra || !contractsDeployed) {
                setStats(prev => ({ ...prev, loading: false }));
                return;
            }

            try {
                const [projects, rounds, rpgfRounds] = await Promise.all([
                    getProjectCount(cedra),
                    getRoundCount(cedra),
                    getRPGFRoundCount(cedra),
                ]);

                setStats({
                    projectCount: projects,
                    roundCount: rounds,
                    rpgfRoundCount: rpgfRounds,
                    loading: false,
                    error: null,
                });
            } catch (error) {
                setStats(prev => ({
                    ...prev,
                    loading: false,
                    error: 'Failed to fetch protocol stats',
                }));
            }
        }

        fetchStats();
    }, [cedra, contractsDeployed]);

    return stats;
}

// ==================== Hook: All Projects ====================

interface ProjectsState {
    projects: Project[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useProjects(): ProjectsState {
    const { cedra } = useWallet();
    const contractsDeployed = useContractsDeployed();
    const [state, setState] = useState<ProjectsState>({
        projects: [],
        loading: true,
        error: null,
        refetch: () => { },
    });

    const fetchProjects = useCallback(async () => {
        if (!cedra || !contractsDeployed) {
            setState(prev => ({ ...prev, loading: false }));
            return;
        }

        setState(prev => ({ ...prev, loading: true }));

        try {
            const addresses = await getAllProjects(cedra);
            const projects = await Promise.all(
                addresses.map(addr => getProject(cedra, addr))
            );

            setState({
                projects,
                loading: false,
                error: null,
                refetch: fetchProjects,
            });
        } catch (error) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: 'Failed to fetch projects',
                refetch: fetchProjects,
            }));
        }
    }, [cedra, contractsDeployed]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    return state;
}

// ==================== Hook: Verification Status ====================

interface VerificationState {
    isVerified: boolean;
    loading: boolean;
}

export function useVerificationStatus(): VerificationState {
    const { cedra, address } = useWallet();
    const contractsDeployed = useContractsDeployed();
    const [state, setState] = useState<VerificationState>({
        isVerified: false,
        loading: true,
    });

    useEffect(() => {
        async function checkVerification() {
            if (!cedra || !address || !contractsDeployed) {
                setState({ isVerified: false, loading: false });
                return;
            }

            try {
                const verified = await isVerified(cedra, address);
                setState({ isVerified: verified, loading: false });
            } catch {
                setState({ isVerified: false, loading: false });
            }
        }

        checkVerification();
    }, [cedra, address, contractsDeployed]);

    return state;
}

// ==================== Hook: Contribute to Project ====================

interface ContributeState {
    contribute: (roundId: number, projectAddress: string, amount: number) => Promise<string | null>;
    loading: boolean;
    error: string | null;
    txHash: string | null;
}

export function useContribute(): ContributeState {
    const { cedra } = useWallet();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [txHash, setTxHash] = useState<string | null>(null);

    const contribute = useCallback(async (
        roundId: number,
        projectAddress: string,
        amount: number
    ): Promise<string | null> => {
        if (!cedra) {
            setError('Wallet not connected');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            const data = buildContributeTx(roundId, projectAddress, amount);
            // Note: signAndSubmitTransaction would come from wallet adapter
            // This is a placeholder - actual implementation needs wallet integration
            console.log('Would submit transaction:', data);
            setTxHash('pending');
            return 'pending';
        } catch (err) {
            setError('Failed to contribute');
            return null;
        } finally {
            setLoading(false);
        }
    }, [cedra]);

    return { contribute, loading, error, txHash };
}

// ==================== Hook: Cast RPGF Votes ====================

interface CastVotesState {
    castVotes: (roundId: number, projectAddresses: string[], allocations: number[]) => Promise<string | null>;
    loading: boolean;
    error: string | null;
}

export function useCastVotes(): CastVotesState {
    const { cedra } = useWallet();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const castVotes = useCallback(async (
        roundId: number,
        projectAddresses: string[],
        allocations: number[]
    ): Promise<string | null> => {
        if (!cedra) {
            setError('Wallet not connected');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            const data = buildCastVotesTx(roundId, projectAddresses, allocations);
            console.log('Would submit vote transaction:', data);
            return 'pending';
        } catch (err) {
            setError('Failed to cast votes');
            return null;
        } finally {
            setLoading(false);
        }
    }, [cedra]);

    return { castVotes, loading, error };
}
