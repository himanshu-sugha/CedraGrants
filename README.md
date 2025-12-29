# 🏛️ CedraGrants - Public Goods Funding Protocol

> **The first complete public goods funding infrastructure for Cedra blockchain**


---

## 📚 Table of Contents

1. [What is CedraGrants?](#-what-is-cedragrants)
2. [Why CedraGrants is Special](#-why-cedragrants-is-special)
3. [Cedra Architecture Understanding](#-cedra-architecture-understanding)
4. [Smart Contract Architecture](#-smart-contract-architecture)
5. [Detailed Module Documentation](#-detailed-module-documentation)
6. [Move Language Patterns Used](#-move-language-patterns-used)
7. [Quick Start](#-quick-start)
8. [How Quadratic Funding Works](#-how-quadratic-funding-works)
9. [VRF Anti-Sybil Mechanism](#-vrf-anti-sybil-mechanism)
10. [RPGF: Reward Proven Value](#-rpgf-reward-proven-value)
11. [Events for Indexer Integration](#-events-for-indexer-integration)
12. [TypeScript SDK Integration](#-typescript-sdk-integration)
13. [Frontend](#️-frontend)
14. [Documentation References](#-documentation-references)
15. [Roadmap](#️-roadmap)

---

## 🎯 What is CedraGrants?

CedraGrants is a comprehensive on-chain public goods funding protocol that brings **Gitcoin-style quadratic funding** to the Cedra ecosystem. It's designed specifically to leverage Cedra's unique features that aren't available on other Move-based chains.

### ✨ Key Features

| Feature | Description | Cedra Feature Used |
|---------|-------------|-------------------|
| **🧮 Quadratic Funding** | Amplifies small donations through matching pools | Block-STM parallel execution |
| **🎲 VRF Anti-Sybil** | Uses Cedra's native randomness for fair verification | Native VRF (cedra_framework::randomness) |
| **📊 RPGF** | Retroactive rewards for proven public goods | Event system for indexer |
| **📈 Milestone Tracking** | Community-verified progressive fund release | Governance hooks |
| **⛽ Gasless UX Ready** | Compatible with Cedra's custom gas tokens | Custom Gas Token support |

---

## 🔥 Why CedraGrants is Special

### Leverages Cedra-Unique Features

Unlike generic Move contracts that work on any chain, CedraGrants showcases **features only Cedra has**:

```
┌─────────────────────────────────────────────────────────────┐
│  CEDRA-EXCLUSIVE INTEGRATIONS                                │
├─────────────────────────────────────────────────────────────┤
│  🎲 Native VRF Randomness  →  sybil_resistance.move         │
│  🔗 Governance Hooks       →  milestone_tracker.move        │
│  📊 Built-in Indexer       →  Real-time event streaming     │
│  ⛽ Custom Gas Tokens      →  Gasless grant interactions     │
└─────────────────────────────────────────────────────────────┘
```

### Cedra vs Other Move Chains

From the [Cedra Documentation](https://docs.cedra.network/intro):

| Feature | Cedra | Other Move Chains |
|---------|-------|-------------------|
| Native VRF | ✅ `cedra_framework::randomness` | ❌ External oracle needed |
| Custom Gas Tokens | ✅ Pay gas in any whitelisted token | ❌ Native token only |
| Built-in Indexer | ✅ Real-time streaming | ❌ External indexer |
| Sub-chains | ✅ Native modular topology | ❌ Sharding only |
| Governance Hooks | ✅ On-chain hot-swaps | ❌ Manual upgrades |

---

## 🏗️ Cedra Architecture Understanding

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

## 📦 Smart Contract Architecture

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

## 📖 Detailed Module Documentation

### 1. Registry (`registry.move`) - 277 lines

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

**Friend Functions (internal module calls):**
- `add_funding()` - Called by quadratic_funding module
- `complete_milestone()` - Called by milestone_tracker module

**View Functions (read-only, no gas for queries):**
```move
#[view]
public fun get_project_count(): u64 acquires Registry { ... }

#[view]
public fun get_project(project_address: address): (
    u64, String, String, address, u64, u64, u8
) acquires Project { ... }

#[view]
public fun is_active(project_address: address): bool acquires Project { ... }
```

---

### 2. Quadratic Funding (`quadratic_funding.move`) - 374 lines

**Purpose:** Core matching pool mechanism that amplifies community voice

**Mathematical Formula Implementation:**

```move
/// QF Score = (Σ√contributions)²
/// Matching = QF_Score × (Pool / Total_QF_Scores)

fun calculate_quadratic_matching(
    project_contributions: &vector<ProjectContribution>,
    matching_pool: u64,
): vector<u64> {
    let qf_scores = vector::empty<u128>();
    let total_qf_score: u128 = 0;

    // Calculate QF score for each project
    let i = 0;
    while (i < vector::length(project_contributions)) {
        let pc = vector::borrow(project_contributions, i);
        let sum_sqrt: u128 = 0;

        // Sum of square roots of each contribution
        let j = 0;
        while (j < vector::length(&pc.amounts)) {
            let amount = *vector::borrow(&pc.amounts, j);
            let sqrt_amount = sqrt((amount as u128) * PRECISION);
            sum_sqrt = sum_sqrt + sqrt_amount;
            j = j + 1;
        };

        // Square the sum
        let qf_score = (sum_sqrt * sum_sqrt) / PRECISION;
        vector::push_back(&mut qf_scores, qf_score);
        total_qf_score = total_qf_score + qf_score;
        i = i + 1;
    };
    // ... distribute proportionally
}

/// Newton's method integer square root
fun sqrt(n: u128): u128 {
    if (n == 0) return 0;
    let x = n;
    let y = (x + 1) / 2;
    while (y < x) {
        x = y;
        y = (x + n / x) / 2;
    };
    x
}
```

**Coin Handling (per [Transaction Guide](https://docs.cedra.network/sdks/typescript/transactions)):**

```move
use cedra_framework::coin;
use cedra_framework::cedra_coin::CedraCoin;

public entry fun contribute(
    contributor: &signer,
    round_id: u64,
    project_address: address,
    amount: u64,
) acquires ... {
    // Withdraw coins from contributor
    let coins = coin::withdraw<CedraCoin>(contributor, amount);
    // Deposit to protocol address
    coin::deposit(@cedra_grants, coins);
    // ... record contribution
}
```

---

### 3. Sybil Resistance (`sybil_resistance.move`) - 288 lines

**Purpose:** VRF-powered anti-sybil lottery for verification

**🎲 CEDRA-UNIQUE FEATURE: Native VRF**

From [Cedra Key Features](https://docs.cedra.network/intro#key-features):
> "On-chain random generator machine" - Cedra provides verifiable randomness natively

```move
use cedra_framework::randomness;

/// The #[randomness] attribute marks this function as using VRF
/// This is ONLY available on Cedra!
#[randomness]
public entry fun run_verification_lottery(
    admin: &signer,
    round_id: u64,
    contributors: vector<address>,
    num_to_select: u64,
) acquires SybilState {
    // Get verifiable random bytes from Cedra's native VRF
    let random_seed = randomness::bytes(32);
    
    // Select random contributors using VRF seed
    let selected = select_random_contributors(
        &contributors,
        num_to_select,
        &random_seed,
    );
    
    // Store lottery results
    move_to(admin, VerificationLottery {
        round_id,
        selected_contributors: selected,
        verified_contributors: vector::empty(),
        failed_contributors: vector::empty(),
        selection_timestamp: timestamp::now_seconds(),
        lottery_run: true,
        random_seed: copy random_seed,
    });
    // ...
}
```

**Why This Matters:**
- **No external oracle needed** - VRF is built into Cedra
- **Provably fair** - Anyone can verify the randomness
- **No front-running** - Seed is generated after transaction submission
- **Unique to Cedra** - Other Move chains require Chainlink/API3

---

### 4. RPGF (`rpgf.move`) - 329 lines

**Purpose:** Retroactive Public Goods Funding (inspired by Optimism RPGF)

**Voting System with Weighted Allocations:**

```move
struct VoteAllocation has store, drop, copy {
    nomination_id: u64,
    weight: u64,  // Percentage × 100 (e.g., 2500 = 25%)
}

public entry fun cast_votes(
    voter: &signer,
    round_id: u64,
    nomination_ids: vector<u64>,
    weights: vector<u64>,
) acquires ... {
    // Validate weights sum to 100%
    let total_weight: u64 = 0;
    let i = 0;
    while (i < vector::length(&weights)) {
        total_weight = total_weight + *vector::borrow(&weights, i);
        i = i + 1;
    };
    assert!(total_weight == 10000, E_INVALID_ALLOCATION);  // 100.00%
    
    // Each voter can only vote once
    assert!(!exists<VoterRecord>(voter_addr), E_ALREADY_VOTED);
    
    // Store allocations in voter's account
    move_to(voter, VoterRecord {
        round_id,
        allocations: copy allocations,
        total_allocated: total_weight,
    });
}
```

---

### 5. Milestone Tracker (`milestone_tracker.move`) - 254 lines

**Purpose:** Community verification of project milestones

**Voting Mechanism:**

```move
const VOTING_PERIOD: u64 = 604800;  // 7 days
const MIN_APPROVAL_PERCENT: u64 = 60;  // 60% needed
const MIN_VOTERS: u64 = 3;

public entry fun resolve_milestone(
    anyone: &signer,
    verification_address: address,
) acquires ... {
    let verification = borrow_global_mut<MilestoneVerification>(verification_address);
    
    // Must wait for voting to end
    assert!(timestamp::now_seconds() > verification.voting_ends, E_VOTING_NOT_ENDED);
    
    let total_votes = verification.votes_for + verification.votes_against;
    assert!(total_votes >= MIN_VOTERS, E_NOT_ENOUGH_VOTES);

    // Calculate approval percentage
    let approval_percent = (verification.votes_for * 100) / total_votes;
    let approved = approval_percent >= MIN_APPROVAL_PERCENT;

    // If approved, update registry
    if (approved) {
        registry::complete_milestone(
            verification.project_address,
            verification.milestone_id,
        );
    };
}
```

---

## 🔧 Move Language Patterns Used

Based on [Move vs Solidity Concepts](https://docs.cedra.network/for-solidity-developers/concepts):

### 1. Resource Abilities

```move
// Our contracts use all four abilities correctly:
struct Registry has key { ... }     // Stored at global address
struct Project has key, store { ... }  // Stored + transferable
struct Milestone has store, drop, copy { ... }  // Nested in Project
struct ContributionEvent has drop, store { ... }  // Event data
```

### 2. The `acquires` Annotation

From [Understanding the Code](https://docs.cedra.network/getting-started/counter#acquires-acquires-counter):
> Functions that read from or modify global storage must declare what they access

```move
// All our functions properly declare acquires
public entry fun contribute(
    contributor: &signer,
    round_id: u64,
    project_address: address,
    amount: u64,
) acquires QFState, FundingRound, RoundContributions, ContributorRecord {
    // Multiple resources accessed
}
```

### 3. Entry Functions vs View Functions

```move
// Entry: Callable from transactions, can modify state
public entry fun register_project(creator: &signer, ...) acquires Registry { ... }

// View: Read-only, queryable without transaction
#[view]
public fun get_project_count(): u64 acquires Registry { ... }
```

### 4. Global Storage Operations

From [Global Storage Operations](https://docs.cedra.network/getting-started/counter#global-storage-operations):

```move
// move_to: Store resource in account
move_to(&object_signer, Project { ... });

// borrow_global: Read from storage
let project = borrow_global<Project>(project_address);

// borrow_global_mut: Modify storage
let project = borrow_global_mut<Project>(project_address);

// exists<T>(): Check if resource exists
if (!exists<ContributorRecord>(contributor_addr)) { ... }
```

### 5. Friend Functions

```move
// Only callable by friend modules
public(friend) fun add_funding(
    project_address: address,
    amount: u64,
) acquires Project { ... }
```

### 6. init_module Pattern

```move
// Called automatically when module is published
fun init_module(admin: &signer) {
    move_to(admin, Registry {
        projects: vector::empty(),
        project_count: 0,
        create_events: event::new_event_handle<ProjectCreatedEvent>(admin),
        update_events: event::new_event_handle<ProjectUpdatedEvent>(admin),
    });
}
```

---

## 🚀 Quick Start

### Prerequisites

- [Rust](https://rustup.rs/) (1.75+)
- [Cedra CLI](https://docs.cedra.network/getting-started/cli)

### CLI Installation (from [Cedra Docs](https://docs.cedra.network/getting-started/cli))

**Windows (Chocolatey):**
```bash
choco install cedra
cedra --version
```

**Linux (Ubuntu/Debian):**
```bash
sudo add-apt-repository ppa:cedra-network/deps
sudo apt update
sudo apt install cedra-cli
```

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/cedra-grants.git
cd cedra-grants/contracts

# Build the contracts
cedra move compile --named-addresses cedra_grants=default

# Run tests
cedra move test --named-addresses cedra_grants=default
```

### Deploy to Testnet

```bash
# Initialize profile
cedra init --profile testnet --network testnet

# Fund account
cedra account fund-with-faucet --profile testnet

# Publish
cedra move publish --named-addresses cedra_grants=testnet --profile testnet
```

---

## 💡 How Quadratic Funding Works

Quadratic funding amplifies the impact of small donations through a matching pool:

```
Traditional Funding:    Quadratic Funding:
                       
Project A: $1000       Project A: $1000 → √1000 = 31.6
(1 donor)              (1 donor)         Match ≈ $1000
                       
Project B: $1000       Project B: $1000 → √100×10 = 100  
(10 donors × $100)     (10 donors)       Match ≈ $10000!
                       
Same total donations,  More donors = MORE MATCHING
same matching          Community preference amplified!
```

### The Math

For each project:
```
QF Score = (√c₁ + √c₂ + √c₃ + ...)²
Matching = QF_Score × (Pool / Total_QF_Scores)
```

---

## 🎲 VRF Anti-Sybil Mechanism

CedraGrants uses **Cedra's native on-chain randomness** to fairly select contributors for verification:

```move
#[randomness]
public entry fun run_verification_lottery(
    admin: &signer,
    contributors: vector<address>,
    num_to_select: u64,
) {
    // Get verifiable random bytes from Cedra VRF
    let random_seed = randomness::bytes(32);
    
    // Select random subset for verification
    let selected = select_random_contributors(&contributors, num_to_select, &random_seed);
    // ...
}
```

This is **only possible on Cedra** - other Move chains don't have native VRF!

---

## 🏆 RPGF: Reward Proven Value

Inspired by Optimism's successful RPGF program:

1. **Nominate** projects that have already delivered value
2. **Vote** on nominations with weighted allocation
3. **Distribute** pool proportionally to winners

```
Round 1 Pool: 10,000 CED
├── Project A: 40% of votes → 4,000 CED
├── Project B: 35% of votes → 3,500 CED
└── Project C: 25% of votes → 2,500 CED
```

---

## 📊 Events for Indexer Integration

All modules emit structured events for [Cedra's built-in indexer](https://docs.cedra.network/indexer/sdk):

```move
struct ContributionEvent has drop, store {
    round_id: u64,
    contributor: address,
    project_address: address,
    amount: u64,
    timestamp: u64,
}

// Emit using event handle
event::emit_event(&mut state.contribution_events, ContributionEvent {
    round_id,
    contributor: contributor_addr,
    project_address,
    amount,
    timestamp: now,
});
```

Build real-time dashboards with WebSocket event streaming!

---

## 📱 TypeScript SDK Integration

Based on [TypeScript SDK Documentation](https://docs.cedra.network/sdks/typescript-sdk):

### Client Setup

```typescript
import { Cedra, CedraConfig, Network } from "@cedra-labs/ts-sdk";

const client = new Cedra(new CedraConfig({ 
    network: Network.TESTNET 
}));
```

### Reading Contract Data

```typescript
// Call view functions (no gas cost)
const projectCount = await client.view({
    function: "cedra_grants::registry::get_project_count",
    functionArguments: [],
});

// Get project details
const [id, name, description, owner, goal, funding, status] = await client.view({
    function: "cedra_grants::registry::get_project",
    functionArguments: [projectAddress],
});
```

### Sending Transactions

```typescript
// Contribute to a project
const transaction = await client.transaction.build.simple({
    sender: alice.accountAddress,
    data: {
        function: "cedra_grants::quadratic_funding::contribute",
        functionArguments: [roundId, projectAddress, amount],
    },
});

const pending = await client.signAndSubmitTransaction({
    signer: alice,
    transaction,
});

await client.waitForTransaction({ transactionHash: pending.hash });
```

---

## 🖥️ Frontend

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
- ✅ Auto-detects Petra wallet
- ✅ Real balance fetching via Cedra SDK
- ✅ Network display (testnet/mainnet)
- ✅ Wallet modal with address copy

---

## 📚 Documentation References

This project was built with deep reference to the official Cedra documentation:

| Topic | Documentation Link | How We Used It |
|-------|-------------------|----------------|
| Architecture | [architecture](https://docs.cedra.network/architecture) | Block-STM parallel design |
| Move Basics | [handbook-for-newcomers](https://docs.cedra.network/handbook-for-newcomers) | Account model, resources |
| CLI Usage | [getting-started/cli](https://docs.cedra.network/getting-started/cli) | Deployment commands |
| Counter Example | [getting-started/counter](https://docs.cedra.network/getting-started/counter) | Pattern reference |
| Move vs Solidity | [for-solidity-developers/concepts](https://docs.cedra.network/for-solidity-developers/concepts) | Security patterns |
| Escrow Guide | [guides/escrow](https://docs.cedra.network/guides/escrow) | Object patterns |
| Gas Tokens | [gas-tokens](https://docs.cedra.network/gas-tokens) | Future UX |
| TypeScript SDK | [sdks/typescript-sdk](https://docs.cedra.network/sdks/typescript-sdk) | Frontend integration |
| Transactions | [sdks/typescript/transactions](https://docs.cedra.network/sdks/typescript/transactions) | TX flow |
| Examples | [sdks/typescript/examples](https://docs.cedra.network/sdks/typescript/examples) | Patterns |

---

## 🛣️ Roadmap

- [x] Core smart contracts (5 modules, 1522 total lines)
- [x] Next.js frontend with Tailwind CSS
- [x] Petra wallet integration
- [x] Unit tests with Move test framework (5 test files, 400+ lines)
- [x] Custom gas token integration guide ([docs/GAS_TOKEN_GUIDE.md](docs/GAS_TOKEN_GUIDE.md))
- [ ] Testnet deployment (requires Cedra CLI)
- [ ] Governance module
- [ ] Mainnet launch

---

## 📄 License

MIT License

---

## 🔗 Links

- [Cedra Documentation](https://docs.cedra.network)
- [Move Language Guide](https://docs.cedra.network/move)
- [CedraScan Explorer](https://cedrascan.com)
- [Cedra GitHub](https://github.com/cedra-labs)
- [Cedra Telegram](https://t.me/+Ba3QXd0VG9U0Mzky)

---

## 🏆 Hackathon Submission

**Cedra Builders Forge Hackathon**

**What makes this submission special:**
1. **Native VRF Integration** - Uses `cedra_framework::randomness` (Cedra-unique)
2. **Complete Protocol** - 5 modules covering entire public goods funding lifecycle
3. **Production Frontend** - Next.js app with real wallet connection
4. **Deep Documentation Understanding** - This README references 15+ official doc pages
5. **Original Code** - All 1522 lines of Move code are original
6. **Comprehensive Tests** - 5 test files with 400+ lines of unit tests
7. **Full Documentation** - Gas Token Guide, detailed README

**Track:** Public Goods & Infrastructure

---

**Built with 💜 for Cedra Builders Forge Hackathon**

*Forge fast. Move Smart.*
