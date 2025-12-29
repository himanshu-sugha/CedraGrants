/**
 * CedraGrants Contract Interaction Utilities
 * 
 * These functions provide typed interfaces for interacting with
 * the deployed CedraGrants smart contracts.
 * 
 * Usage requires:
 * 1. Contracts deployed to testnet
 * 2. CONTRACT_ADDRESS updated with deployed address
 */

import { Cedra, InputViewFunctionData, InputEntryFunctionData } from '@cedra-labs/ts-sdk';

// ==================== Configuration ====================

// TODO: Update this after deploying contracts
export const CONTRACT_ADDRESS = '0x0'; // Replace with actual deployed address

// Module names
const REGISTRY_MODULE = `${CONTRACT_ADDRESS}::registry`;
const QUADRATIC_FUNDING_MODULE = `${CONTRACT_ADDRESS}::quadratic_funding`;
const SYBIL_RESISTANCE_MODULE = `${CONTRACT_ADDRESS}::sybil_resistance`;
const RPGF_MODULE = `${CONTRACT_ADDRESS}::rpgf`;
const MILESTONE_TRACKER_MODULE = `${CONTRACT_ADDRESS}::milestone_tracker`;

// ==================== Types ====================

export interface Project {
    id: number;
    name: string;
    description: string;
    owner: string;
    fundingGoal: number;
    currentFunding: number;
    status: number;
}

export interface FundingRound {
    id: number;
    name: string;
    matchingPool: number;
    startTime: number;
    endTime: number;
    isActive: boolean;
}

export interface Nomination {
    projectAddress: string;
    nominator: string;
    impact: string;
    totalVotes: number;
}

// ==================== View Functions (Read-only) ====================

/**
 * Get total project count from registry
 */
export async function getProjectCount(cedra: Cedra): Promise<number> {
    const payload: InputViewFunctionData = {
        function: `${REGISTRY_MODULE}::get_project_count`,
        typeArguments: [],
        functionArguments: [],
    };

    const result = await cedra.view({ payload });
    return Number(result[0]);
}

/**
 * Get all project addresses
 */
export async function getAllProjects(cedra: Cedra): Promise<string[]> {
    const payload: InputViewFunctionData = {
        function: `${REGISTRY_MODULE}::get_all_projects`,
        typeArguments: [],
        functionArguments: [],
    };

    const result = await cedra.view({ payload });
    return result[0] as string[];
}

/**
 * Get project details by address
 */
export async function getProject(cedra: Cedra, projectAddress: string): Promise<Project> {
    const payload: InputViewFunctionData = {
        function: `${REGISTRY_MODULE}::get_project`,
        typeArguments: [],
        functionArguments: [projectAddress],
    };

    const result = await cedra.view({ payload });
    return {
        id: Number(result[0]),
        name: result[1] as string,
        description: result[2] as string,
        owner: result[3] as string,
        fundingGoal: Number(result[4]),
        currentFunding: Number(result[5]),
        status: Number(result[6]),
    };
}

/**
 * Get QF round count
 */
export async function getRoundCount(cedra: Cedra): Promise<number> {
    const payload: InputViewFunctionData = {
        function: `${QUADRATIC_FUNDING_MODULE}::get_round_count`,
        typeArguments: [],
        functionArguments: [],
    };

    const result = await cedra.view({ payload });
    return Number(result[0]);
}

/**
 * Check if contributor is verified (anti-sybil)
 */
export async function isVerified(cedra: Cedra, address: string): Promise<boolean> {
    const payload: InputViewFunctionData = {
        function: `${SYBIL_RESISTANCE_MODULE}::is_verified`,
        typeArguments: [],
        functionArguments: [address],
    };

    const result = await cedra.view({ payload });
    return result[0] as boolean;
}

/**
 * Get RPGF round count
 */
export async function getRPGFRoundCount(cedra: Cedra): Promise<number> {
    const payload: InputViewFunctionData = {
        function: `${RPGF_MODULE}::get_round_count`,
        typeArguments: [],
        functionArguments: [],
    };

    const result = await cedra.view({ payload });
    return Number(result[0]);
}

// ==================== Entry Functions (State-changing) ====================

/**
 * Build transaction to register a new project
 */
export function buildRegisterProjectTx(
    name: string,
    description: string,
    websiteUrl: string,
    githubUrl: string,
    fundingGoal: number,
    milestoneTitles: string[],
    milestoneDescriptions: string[],
    milestoneAmounts: number[],
    milestoneDeadlines: number[],
    tags: string[]
): InputEntryFunctionData {
    return {
        function: `${REGISTRY_MODULE}::register_project`,
        typeArguments: [],
        functionArguments: [
            name,
            description,
            websiteUrl,
            githubUrl,
            fundingGoal,
            milestoneTitles,
            milestoneDescriptions,
            milestoneAmounts,
            milestoneDeadlines,
            tags,
        ],
    };
}

/**
 * Build transaction to contribute to a project in a funding round
 */
export function buildContributeTx(
    roundId: number,
    projectAddress: string,
    amount: number
): InputEntryFunctionData {
    return {
        function: `${QUADRATIC_FUNDING_MODULE}::contribute`,
        typeArguments: [],
        functionArguments: [roundId, projectAddress, amount],
    };
}

/**
 * Build transaction to cast RPGF votes
 */
export function buildCastVotesTx(
    roundId: number,
    projectAddresses: string[],
    allocations: number[]
): InputEntryFunctionData {
    return {
        function: `${RPGF_MODULE}::cast_votes`,
        typeArguments: [],
        functionArguments: [roundId, projectAddresses, allocations],
    };
}

/**
 * Build transaction to vote on a milestone
 */
export function buildVoteMilestoneTx(
    verificationAddress: string,
    approve: boolean
): InputEntryFunctionData {
    return {
        function: `${MILESTONE_TRACKER_MODULE}::vote_milestone`,
        typeArguments: [],
        functionArguments: [verificationAddress, approve],
    };
}

// ==================== Helper: Execute Transaction ====================

/**
 * Sign and submit a transaction using wallet adapter
 * 
 * @example
 * const tx = buildContributeTx(1, projectAddr, 1000000);
 * await executeTransaction(cedra, signAndSubmitTransaction, tx);
 */
export async function executeTransaction(
    cedra: Cedra,
    signAndSubmitTransaction: (payload: { data: InputEntryFunctionData }) => Promise<{ hash: string }>,
    data: InputEntryFunctionData
): Promise<string> {
    const pending = await signAndSubmitTransaction({ data });
    await cedra.waitForTransaction({ transactionHash: pending.hash });
    return pending.hash;
}
