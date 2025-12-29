# CedraGrants - Public Goods Funding Protocol

> **The first complete public goods funding infrastructure for Cedra blockchain**


---

## Table of Contents

1. [What is CedraGrants?](#1-what-is-cedragrants)
2. [Why CedraGrants is Special](#2-why-cedragrants-is-special)
3. [Cedra Architecture Understanding](#3-cedra-architecture-understanding)
4. [Smart Contract Architecture](#4-smart-contract-architecture)
5. [Detailed Module Documentation](#5-detailed-module-documentation)
6. [Move Language Patterns Used](#6-move-language-patterns-used)
7. [Quick Start](#7-quick-start)
8. [How Quadratic Funding Works](#8-how-quadratic-funding-works)
9. [VRF Anti-Sybil Mechanism](#9-vrf-anti-sybil-mechanism)
10. [RPGF: Reward Proven Value](#10-rpgf-reward-proven-value)
11. [Events for Indexer Integration](#11-events-for-indexer-integration)
12. [TypeScript SDK Integration](#12-typescript-sdk-integration)
13. [Frontend](#13-frontend)


---

## 1. What is CedraGrants?

**CedraGrants is complete public goods funding infrastructure for Cedra blockchain.**

We bring Gitcoin-style quadratic funding to Cedra - but with native features no other Move chain has:

- **Native VRF Randomness** - Fair anti-sybil verification using `cedra_framework::randomness`
- **5 Production-Ready Smart Contracts** - Registry, QF Engine, VRF Anti-Sybil, RPGF, Milestone Tracker
- **Next.js Frontend with Wallet Integration** - Production-ready UI with Petra wallet
- **TypeScript SDK Integration** - Using `@cedra-labs/ts-sdk` for blockchain interaction

### Key Features

| Feature | Description | Cedra Feature Used | Source |
|---------|-------------|-------------------|--------|
| **Quadratic Funding** | Amplifies small donations through matching pools | Block-STM parallel execution | [quadratic_funding.move](contracts/sources/quadratic_funding.move) |
| **VRF Anti-Sybil** | Uses Cedra's native randomness for fair verification | Native VRF (cedra_framework::randomness) | [sybil_resistance.move](contracts/sources/sybil_resistance.move) |
| **RPGF** | Retroactive rewards for proven public goods | Event system for indexer | [rpgf.move](contracts/sources/rpgf.move) |
| **Milestone Tracking** | Community-verified progressive fund release | Governance hooks | [milestone_tracker.move](contracts/sources/milestone_tracker.move) |
| **Project Registry** | Central hub for project lifecycle management | Object pattern | [registry.move](contracts/sources/registry.move) |

---

## 2. Why CedraGrants is Special

### Leverages Cedra-Unique Features

Unlike generic Move contracts that work on any chain, CedraGrants showcases **features only Cedra has**:

```
+-------------------------------------------------------------+
|  CEDRA-EXCLUSIVE INTEGRATIONS                                |
+-------------------------------------------------------------+
|  1. Native VRF Randomness  ->  sybil_resistance.move         |
|  2. Event System           ->  Built-in indexer integration  |
|  3. TypeScript SDK         ->  @cedra-labs/ts-sdk            |
+-------------------------------------------------------------+
```

### Cedra vs Other Move Chains

From the [Cedra Documentation](https://docs.cedra.network/intro):

| Feature | Cedra | Other Move Chains |
|---------|-------|-------------------|
| Native VRF | Yes - `cedra_framework::randomness` | No - External oracle needed |
| Built-in Indexer | Yes - Real-time event streaming | No - External indexer |
| TypeScript SDK | Yes - `@cedra-labs/ts-sdk` | Varies |

---

## 3. Cedra Architecture Understanding

Based on [Cedra Architecture Documentation](https://docs.cedra.network/architecture):

### Core Components We Leverage

1. **Block-STM Parallel Execution**
   - Our contracts use non-overlapping account storage
   - Enables parallel transaction processing for high throughput
   - All our modules are designed with this in mind

2. **Move VM with Linear Types**
   - Resources can never be copied or lost
   - `CedraCoin` coins are moved, not duplicated
   - Proper use of `has key`, `has store`, `has drop`, `has copy` abilities

3. **Sparse Merkle Tree State**
   - All project and contribution data is verifiable
   - Light-client proofs for frontend verification

4. **Native VRF Oracle**
   - Used in `sybil_resistance.move` for fair selection
   - No external dependencies or trust assumptions

### Account Model (from [Handbook for Newcomers](https://docs.cedra.network/handbook-for-newcomers))

```move
// Cedra Account Structure
Account {
    sequence_number: Transaction ordering
    authentication_key: Cryptographic identity
    resources: Type-indexed storage (our Project, Registry, etc.)
    modules: Deployed code (cedra_grants::*)
}
```

Our contracts use this model:
- **Resources stored in user accounts**: `ContributorRecord`, `VoterRecord`, `VerificationStatus`
- **Global resources under module address**: `Registry`, `QFState`, `RPGFState`, `SybilState`

---

## 4. Smart Contract Architecture

```
contracts/
├── Move.toml                    # Package configuration
└── sources/
    ├── registry.move            # Project registration & lifecycle
    ├── quadratic_funding.move   # QF matching engine
    ├── sybil_resistance.move    # VRF-based verification lottery
    ├── rpgf.move                # Retroactive public goods funding
    └── milestone_tracker.move   # Community milestone verification
```

### Move.toml Configuration

```toml
[package]
name = "CedraGrants"
version = "1.0.0"
upgrade_policy = "compatible"  # Allows module upgrades per Cedra's upgrade system
authors = ["CedraGrants Team"]

[addresses]
cedra_grants = "_"             # Placeholder, set at deploy time
cedra_framework = "0x1"        # Core Cedra framework

[dependencies]
CedraFramework = { 
    git = "https://github.com/cedra-labs/cedra-network.git", 
    subdir = "cedra-move/framework/cedra-framework", 
    rev = "main" 
}
```

---

## 5. Detailed Module Documentation

### 5.1 Registry (registry.move) - 277 lines

**Purpose:** Central hub for project registration and lifecycle management

**Key Structs (following [Resource best practices](https://docs.cedra.network/move/resource)):**

```move
/// Global registry - stores at module address with `has key`
struct Registry has key {
    projects: vector<address>,
    project_count: u64,
    create_events: event::EventHandle<ProjectCreatedEvent>,
    update_events: event::EventHandle<ProjectUpdatedEvent>,
}

/// Individual project - stored at object address
struct Project has key, store {
    id: u64,
    name: String,
    description: String,
    owner: address,
    funding_goal: u64,
    current_funding: u64,
    status: u8,
    milestones: vector<Milestone>,
    // ...
}

/// Milestone - nested in Project, needs store + drop + copy
struct Milestone has store, drop, copy {
    id: u64,
    title: String,
    target_amount: u64,
    completed: bool,
    // ...
}
```

**Entry Functions (callable from transactions):**
- `register_project()` - Creates new project with milestones
- `update_status()` - Owner updates project status

**View Functions (read-only, no gas):**
- `get_project_count()` - Total registered projects
- `get_project()` - Project details by address
- `get_milestones()` - Project milestones
- `is_active()` - Check if project is accepting funds

**Friend Functions:**
- `add_funding()` - Called by quadratic_funding module
- `complete_milestone()` - Called by milestone_tracker module

---

### 5.2 Quadratic Funding (quadratic_funding.move) - 374 lines

**Purpose:** Core QF matching engine with round management

**QF Score Calculation:**

```move
/// Calculate QF score: (sum of square roots)^2
/// This is the key innovation - small donations are amplified
public fun calculate_qf_score(contributions: vector<u64>): u64 {
    let sum_sqrt: u128 = 0;
    let i = 0;
    while (i < vector::length(&contributions)) {
        let amount = *vector::borrow(&contributions, i);
        sum_sqrt = sum_sqrt + sqrt((amount as u128) * PRECISION);
        i = i + 1;
    };
    ((sum_sqrt * sum_sqrt) / PRECISION as u64)
}
```

**Coin Handling (from [Coin guide](https://docs.cedra.network/guides/first-fa)):**

```move
use cedra_framework::coin;
use cedra_framework::cedra_coin::CedraCoin;

public entry fun contribute(
    contributor: &signer,
    round_id: u64,
    project_address: address,
    amount: u64,
) acquires QFState, FundingRound {
    // Withdraw coins from contributor
    let coins = coin::withdraw<CedraCoin>(contributor, amount);
    // Deposit to protocol
    coin::deposit(@cedra_grants, coins);
    // Record contribution for QF calculation
    // ...
}
```

---

### 5.3 Sybil Resistance (sybil_resistance.move) - 288 lines

**Purpose:** Cedra's native VRF for random verification selection

**VRF Integration (Cedra-Unique!):**

```move
use cedra_framework::randomness;

/// Uses #[randomness] attribute for verifiable random selection
#[randomness]
public entry fun run_verification_lottery(
    admin: &signer,
    round_id: u64,
    contributors: vector<address>,
    num_to_select: u64,
) acquires SybilState {
    // Get verifiable random bytes from Cedra's native VRF
    let random_seed = randomness::bytes(32);
    
    // Use randomness to fairly select contributors for verification
    let selected = select_random_contributors(
        &contributors,
        num_to_select,
        &random_seed,
    );
    
    // Store results on-chain
    // ...
}
```

**Why VRF Matters:**
- Prevents admin manipulation of who gets verified
- Transparent and auditable selection process
- No external oracle dependencies

---

### 5.4 RPGF (rpgf.move) - 329 lines

**Purpose:** Retroactive Public Goods Funding with weighted voting

**Voting System:**

```move
/// Cast votes with percentage allocation
/// Weights must sum to 10000 (100.00%)
public entry fun cast_votes(
    voter: &signer,
    round_id: u64,
    nomination_ids: vector<u64>,
    weights: vector<u64>,  // [2500, 5000, 2500] = 25%, 50%, 25%
) acquires RPGFRound, VoterRecord {
    // Validate total = 100%
    let total: u64 = 0;
    let i = 0;
    while (i < vector::length(&weights)) {
        total = total + *vector::borrow(&weights, i);
        i = i + 1;
    };
    assert!(total == 10000, E_INVALID_ALLOCATION);
    
    // Record votes and update nominations
    // ...
}
```

---

### 5.5 Milestone Tracker (milestone_tracker.move) - 254 lines

**Purpose:** Community verification of project milestones

**Verification Flow:**

```move
/// Resolve milestone after voting period ends
public entry fun resolve_milestone(
    anyone: &signer,
    verification_address: address,
) acquires VerificationRegistry, MilestoneVerification {
    let verification = borrow_global_mut<MilestoneVerification>(verification_address);
    
    // Must wait for voting to end
    assert!(timestamp::now_seconds() > verification.voting_ends, E_VOTING_NOT_ENDED);
    
    let total_votes = verification.votes_for + verification.votes_against;
    assert!(total_votes >= MIN_VOTERS, E_NOT_ENOUGH_VOTES);

    // Calculate approval percentage (requires 60%+)
    let approval_percent = (verification.votes_for * 100) / total_votes;
    let approved = approval_percent >= MIN_APPROVAL_PERCENT;

    // If approved, update registry and release funds
    if (approved) {
        registry::complete_milestone(
            verification.project_address,
            verification.milestone_id,
        );
    };
}
```

---

## 6. Move Language Patterns Used

### 6.1 Resource Pattern

From [Move Resource Guide](https://docs.cedra.network/move/resource):

```move
// Resources with key ability can be stored globally
struct Registry has key {
    projects: vector<address>,
    // ...
}

// Move to global storage
move_to(admin, Registry { ... });

// Borrow for reading
let registry = borrow_global<Registry>(@cedra_grants);

// Borrow for mutation
let registry = borrow_global_mut<Registry>(@cedra_grants);
```

### 6.2 Event Emission Pattern

For Cedra's built-in indexer:

```move
struct ProjectCreatedEvent has drop, store {
    project_id: u64,
    owner: address,
    name: String,
    timestamp: u64,
}

// Emit event for indexer to capture
event::emit_event(&mut registry.create_events, ProjectCreatedEvent {
    project_id,
    owner,
    name,
    timestamp: timestamp::now_seconds(),
});
```

### 6.3 Friend Module Pattern

Cross-module access control:

```move
// In registry.move
friend cedra_grants::quadratic_funding;
friend cedra_grants::milestone_tracker;

// Only friends can call this
public(friend) fun add_funding(project_address: address, amount: u64) {
    // ...
}
```

### 6.4 View Function Pattern

Read-only functions with no gas cost:

```move
#[view]
public fun get_project_count(): u64 acquires Registry {
    borrow_global<Registry>(@cedra_grants).project_count
}
```

---

## 7. Quick Start

### Prerequisites

1. **Cedra CLI** - [Installation Guide](https://docs.cedra.network/getting-started/cli)
2. **Node.js 18+** - For frontend
3. **Petra Wallet** - Browser extension

### Compile Contracts

```bash
cd contracts
cedra move compile --named-addresses cedra_grants=default
```

### Run Tests

```bash
cedra move test --named-addresses cedra_grants=default
```

### Deploy to Testnet

```bash
# Initialize account
cedra init --profile testnet --network testnet

# Fund from faucet
cedra account fund-with-faucet --profile testnet

# Publish
cedra move publish --named-addresses cedra_grants=testnet --profile testnet
```

### Run Frontend

```bash
cd client
npm install
npm run dev
```

---

## 8. How Quadratic Funding Works

### The Problem with Traditional Funding

- Wealthy donors dominate funding decisions
- Small contributions have negligible impact
- Projects that serve the masses get overlooked

### The QF Solution

Quadratic Funding amplifies the **number of contributors** over the **amount contributed**:

```
Matching = (Sum of Square Roots)^2 - Sum of Contributions

Example:
- Project A: 1 donor gives $100
  - QF Score: sqrt(100)^2 = 100
  
- Project B: 100 donors give $1 each
  - QF Score: (100 * sqrt(1))^2 = 10,000
  
Project B gets 100x more matching despite same total!
```

### Implementation

```move
let sum_sqrt: u128 = 0;

// Sum the square roots of each contribution
let i = 0;
while (i < vector::length(&contributions)) {
    let amount = *vector::borrow(&contributions, i);
    sum_sqrt = sum_sqrt + sqrt(amount);
    i = i + 1;
};

// Square the sum for final QF score
let qf_score = sum_sqrt * sum_sqrt;
```

---

## 9. VRF Anti-Sybil Mechanism

### The Sybil Problem

In quadratic funding, attackers can:
1. Create many fake accounts
2. Split one large donation into many small ones
3. Game the QF formula for more matching

### Our Solution: Random Verification Lottery

Using Cedra's native VRF (`cedra_framework::randomness`):

```
1. Funding round ends
2. Admin triggers verification lottery
3. VRF randomly selects contributors for verification
4. Selected users must prove humanity (off-chain KYC, attestation, etc.)
5. Verified = reputation boost, Unverified = penalties
```

### Why VRF?

- **Unpredictable**: Attackers can't know who will be selected
- **Verifiable**: Anyone can verify the selection was fair
- **Decentralized**: No trusted third party needed

---

## 10. RPGF: Reward Proven Value

### What is RPGF?

Retroactive Public Goods Funding rewards projects **after** they've delivered value, not before.

### How It Works

```
1. Round Opens: Admin creates RPGF round with pool
2. Nominations: Community nominates impactful projects
3. Voting: Token holders allocate votes (must sum to 100%)
4. Distribution: Pool distributed proportionally to votes
```

### Benefits

- **Zero speculation**: Fund proven value, not promises
- **Community-driven**: Voters decide what matters
- **Transparent**: All votes recorded on-chain

---

## 11. Events for Indexer Integration

CedraGrants emits 13 events for Cedra's built-in indexer:

| Event | Module | Trigger |
|-------|--------|---------|
| `ProjectCreatedEvent` | registry | New project registered |
| `ProjectUpdatedEvent` | registry | Project status changed |
| `RoundCreatedEvent` | quadratic_funding | New QF round |
| `ContributionEvent` | quadratic_funding | User contributes |
| `MatchingDistributedEvent` | quadratic_funding | Round finalized |
| `VerificationLotteryEvent` | sybil_resistance | VRF lottery run |
| `VerificationCompleteEvent` | sybil_resistance | User verified |
| `NominationEvent` | rpgf | Project nominated |
| `VoteEvent` | rpgf | User votes |
| `DistributionEvent` | rpgf | RPGF funds distributed |
| `MilestoneSubmittedEvent` | milestone_tracker | Evidence submitted |
| `MilestoneVoteEvent` | milestone_tracker | Voter approves/rejects |
| `MilestoneResolvedEvent` | milestone_tracker | Milestone finalized |

---

## 12. TypeScript SDK Integration

From [TypeScript SDK Guide](https://docs.cedra.network/sdks/typescript-sdk):

### Client Setup

```typescript
import { Cedra, CedraConfig, Network } from '@cedra-labs/ts-sdk';

const config = new CedraConfig({ network: Network.TESTNET });
const cedra = new Cedra(config);
```

### Reading Data (View Functions)

```typescript
// Get project count
const result = await cedra.view({
    function: "cedra_grants::registry::get_project_count",
    type_arguments: [],
    arguments: [],
});
```

### Writing Data (Entry Functions)

```typescript
const transaction = await cedra.transaction.build.simple({
    sender: alice.accountAddress,
    data: {
        function: "cedra_grants::quadratic_funding::contribute",
        typeArguments: [],
        functionArguments: [roundId, projectAddress, amount],
    },
});

const pending = await cedra.signAndSubmitTransaction({
    signer: alice,
    transaction,
});

await cedra.waitForTransaction({ transactionHash: pending.hash });
```

---

## 13. Frontend

The frontend is a Next.js 16 application with a premium dark theme:

```bash
cd client
npm install
npm run dev
```

### Pages
- `/` - Dashboard with stats, funding rounds, featured projects
- `/projects` - Browse all projects with search and filters
- `/rounds` - View active, upcoming, and completed funding rounds
- `/rpgf` - Retroactive voting with allocation sliders

### Wallet Integration

Uses **Aptos Wallet Standard** via `@aptos-labs/wallet-adapter-react`:
- Auto-detects Petra wallet
- Real balance fetching via Cedra SDK
- Network display (testnet/mainnet)
- Wallet modal with address copy

---

## License

MIT License

---

## Links

- [Cedra Documentation](https://docs.cedra.network)
- [Move Language Guide](https://docs.cedra.network/move)
- [CedraScan Explorer](https://cedrascan.com)
- [Cedra GitHub](https://github.com/cedra-labs)
- [Cedra Telegram](https://t.me/+Ba3QXd0VG9U0Mzky)

---

*Forge fast. Move Smart.*
